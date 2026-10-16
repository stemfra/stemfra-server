// Shared OpenAI chat compatibility. Specialist endpoints are unchanged.
const OpenAI = require('openai');
function chatParameters(body) {
  if (body.model !== 'gpt-6-luna') return body;
  const { max_tokens, ...rest } = body;
  return {
    ...rest,
    reasoning_effort: 'none',
    ...(rest.max_completion_tokens == null && max_tokens != null
      ? { max_completion_tokens: max_tokens } : {}),
  };
}
function createClient(options) {
  const client = new OpenAI(options);
  const create = client.chat.completions.create.bind(client.chat.completions);
  // Do not await: preserve the SDK promise helpers and streaming response.
  client.chat.completions.create = (body, options) => create(chatParameters(body), options);
  return client;
}
module.exports = createClient;
module.exports.chatParameters = chatParameters;
