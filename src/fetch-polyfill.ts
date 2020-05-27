import { context, Headers } from "@aredridel/fetch-h2-esm-shim";
const { fetch, disconnect } = context({
  session: { rejectUnauthorized: false },
});
globalThis.fetch = fetch;
globalThis.Headers = Headers;
//@ts-ignore
globalThis.disconnect = disconnect;
