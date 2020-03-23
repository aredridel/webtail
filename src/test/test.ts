import { httail } from "../index";
import { createServer, ServerResponse } from "http";
import { AddressInfo } from "net";

import fetch from "cross-fetch";
const ourGlobal = global as object & {
  fetch: typeof fetch;
  Headers: Headers;
};
ourGlobal.fetch = fetch;
ourGlobal.Headers = (<unknown>fetch as { Headers: Headers }).Headers;

export async function test_simple_fetch() {
  await withServer(
    async res => {
      res.end("zzz");
    },
    async (port: number) => {
      for await (const w of httail(`http://localhost:${port}`, "text")) {
        assert(w == "zzz");
      }
    }
  );
}

export async function test_simple_tail() {
  let count = 0;
  await withServer(
    async res => {
      if (count++ == 0) {
        res.setHeader("Retry-After", "0");
        res.end("zzz");
      } else {
        res.end("boom");
      }
    },
    async (port: number) => {
      let responsecount = 0;
      for await (const w of httail(`http://localhost:${port}`, "text")) {
        if (responsecount == 0) {
          assert(w == "zzz");
        } else {
          assert(w == "boom");
        }
        responsecount++;
      }
    }
  );
}

function assert(condition: any, message?: string) {
  if (!condition) throw new Error(message || "expected true");
}

async function withServer(
  makeResponse: (arg0: ServerResponse) => Promise<void>,
  fn: (arg0: number) => Promise<void>
) {
  const server = createServer(async (_req, res) => {
    await makeResponse(res);
  });
  server.listen(0);
  const port = (server.address() as AddressInfo).port;
  try {
    await fn(port);
  } finally {
    server.close();
  }
}
