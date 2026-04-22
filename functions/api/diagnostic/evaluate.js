import { createEvaluateHandler } from '../../../src/server/diagnostic/evaluateEndpoint.js';

export { createEvaluateHandler };

const handler = createEvaluateHandler();

export const onRequestPost = async (context) => handler(context);

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS'
    }
  });
