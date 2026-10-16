const { test } = require('node:test');
const assert = require('node:assert/strict');
const createClient = require('../lib/openaiClient');
const { chatParameters } = createClient;
test('Luna translates token budget and preserves tool and JSON contracts', () => {
  const body = { model: 'gpt-6-luna', max_tokens: 900, temperature: 0.3, messages: [], tools: [{ type: 'function' }], response_format: { type: 'json_object' } };
  const result = chatParameters(body);
  assert.equal(result.max_completion_tokens, 900);
  assert.equal(result.reasoning_effort, 'none');
  assert.ok(!('max_tokens' in result));
  assert.equal(body.max_tokens, 900);
  assert.equal(result.tools, body.tools);
  assert.equal(result.response_format, body.response_format);
});
test('explicit completion budget wins and other models remain unchanged', () => {
  assert.equal(chatParameters({ model: 'gpt-6-luna', max_tokens: 90, max_completion_tokens: 120 }).max_completion_tokens, 120);
  const body = { model: 'legacy-model', max_tokens: 90 };
  assert.equal(chatParameters(body), body);
});
test('SDK transport preserves request options, response helpers and streaming', async () => {
  const calls = [];
  const client = createClient({ apiKey: 'test-only', fetch: async (url, init) => {
    const body = JSON.parse(init.body); calls.push({ body, headers: new Headers(init.headers) });
    if (body.stream) return new Response('data: {"id":"test","choices":[{"delta":{"content":"hello"},"index":0}]}\n\ndata: [DONE]\n\n', { headers: { 'content-type': 'text/event-stream' } });
    return new Response(JSON.stringify({ id: 'test', choices: [{ message: { content: 'ok' } }] }), { headers: { 'content-type': 'application/json' } });
  }});
  const promise = client.chat.completions.create({ model: 'gpt-6-luna', messages: [], max_tokens: 100 }, { headers: { 'x-test': 'retained' } });
  assert.equal(typeof promise.withResponse, 'function');
  assert.equal((await promise).choices[0].message.content, 'ok');
  assert.equal(calls[0].headers.get('x-test'), 'retained');
  const stream = await client.chat.completions.create({ model: 'gpt-6-luna', messages: [], stream: true, max_tokens: 90 });
  const chunks = []; for await (const chunk of stream) chunks.push(chunk);
  assert.equal(chunks[0].choices[0].delta.content, 'hello');
  assert.equal(calls[1].body.max_completion_tokens, 90);
});
