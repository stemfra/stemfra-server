// Narration relay for the tutorial recorder (scripts/tutorials/lib/narrate.mjs).
//
// ElevenLabs restricts its API by the caller's country: from Peter's Mac every
// request is answered with a 302 to their "countries we restrict" help article
// (2026-09-25; the 2026-09-08 "Cloudflare challenge" was the same thing seen
// through curl -L). The production server sits in a permitted region and
// already holds ELEVENLABS_API_KEY (deploy.yml), so the recorder sends each
// narration line here and this route makes the text-to-speech call with word
// timestamps on its behalf, returning ElevenLabs' JSON unchanged.
//
// Gate: the shared N8N_WEBHOOK_SECRET as x-leadgen-secret, the same gate the
// other machine-to-machine endpoints use (leadgen run-complete). Every call is
// billed to the ElevenLabs account, so the gate is not optional: with no secret
// configured the route refuses.
//
// POST /api/admin/narrate  { text, voiceId, modelId?, outputFormat?, voiceSettings? }
//   -> ElevenLabs /v1/text-to-speech/:voiceId/with-timestamps response body
const express = require('express');

const router = express.Router();
const MAX_TEXT = 1200; // one narration line, never a script

router.post('/', express.json({ limit: '16kb' }), async (req, res) => {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret || req.headers['x-leadgen-secret'] !== secret) {
    return res.status(401).json({ success: false, message: 'Bad secret' });
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(503).json({ success: false, message: 'ELEVENLABS_API_KEY is not configured' });

  const { text, voiceId, modelId = 'eleven_multilingual_v2', outputFormat = 'mp3_44100_128', voiceSettings = {} } = req.body || {};
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT) {
    return res.status(400).json({ success: false, message: `text must be 1 to ${MAX_TEXT} characters` });
  }
  if (!/^[A-Za-z0-9]{10,40}$/.test(String(voiceId || ''))) return res.status(400).json({ success: false, message: 'voiceId required' });
  if (!/^[a-z0-9_]+$/.test(String(modelId)) || !/^[a-z0-9_]+$/.test(String(outputFormat))) {
    return res.status(400).json({ success: false, message: 'bad modelId or outputFormat' });
  }

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${outputFormat}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ text, model_id: modelId, voice_settings: voiceSettings }),
      redirect: 'manual', // a 302 is the country block; report it, never follow it
    });
    if (r.status >= 300 && r.status < 400) {
      return res.status(502).json({ success: false, message: `ElevenLabs redirected (${r.status}) to ${r.headers.get('location') || '?'}: the server's region may be restricted too` });
    }
    const body = await r.text();
    if (!r.ok) return res.status(502).json({ success: false, message: `ElevenLabs ${r.status}: ${body.replace(/<[^>]+>/g, ' ').slice(0, 200)}` });
    res.type('application/json').send(body);
  } catch (e) {
    res.status(502).json({ success: false, message: `ElevenLabs request failed: ${e.message}` });
  }
});

module.exports = router;
