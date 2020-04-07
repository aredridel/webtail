const { context, Headers } = require("fetch-h2");
const { fetch, disconnect } = context({
  session: { rejectUnauthorized: false },
});
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.disconnect = disconnect;
