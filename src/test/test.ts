import "../fetch-polyfill";

import { httail } from "../index";
import { createServer, ServerResponse } from "http";
import { AddressInfo } from "net";
import {
  createSecureServer as createHTTP2Server,
  Http2ServerResponse,
} from "http2";
import { readFileSync } from "fs";

export async function testSimpleFetch(): Promise<void> {
  await withServer(
    async (res) => {
      res.end("zzz");
    },
    async (url: string) => {
      for await (const w of httail(url, "text")) {
        assert(w == "zzz");
      }
    }
  );
}

export async function testSimpleHTTP2Fetch(): Promise<void> {
  await withHTTP2Server(
    async (res) => {
      res.end("zzz");
    },
    async (url: string) => {
      for await (const w of httail(url, "text")) {
        assert(w == "zzz");
      }
    }
  );
}

export async function testSimpleTail(): Promise<void> {
  let count = 0;
  await withServer(
    async (res) => {
      if (count++ == 0) {
        res.setHeader("Retry-After", "0");
        res.end("zzz");
      } else {
        res.end("boom");
      }
    },
    async (url: string) => {
      let responsecount = 0;
      for await (const w of httail(url, "text")) {
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

function assert(condition: boolean, message?: string): void {
  if (!condition) throw new Error(message || "expected true");
}

async function withServer(
  makeResponse: (arg0: ServerResponse) => Promise<void>,
  fn: (arg0: string) => Promise<void>
): Promise<void> {
  const server = createServer(async (_req, res) => {
    await makeResponse(res);
  });
  server.listen(0);
  const address = server.address() as AddressInfo;
  const url = `http://localhost:${address.port}/`;
  try {
    await fn(url);
    ((globalThis as unknown) as {
      disconnect: (url: string) => void;
    }).disconnect(url);
  } finally {
    server.close();
  }
}

const cert = readFileSync("test-cert.pem");
const key = readFileSync("test-key.pem");

async function withHTTP2Server(
  makeResponse: (arg0: Http2ServerResponse) => Promise<void>,
  fn: (arg0: string) => Promise<void>
): Promise<void> {
  const server = createHTTP2Server({ cert, key }, async (_req, res) => {
    await makeResponse(res);
  });
  server.listen(0);
  const address = server.address() as AddressInfo;
  const url = `https://localhost:${address.port}/`;
  try {
    await fn(url);
    ((globalThis as unknown) as {
      disconnect: (url: string) => void;
    }).disconnect(url);
  } finally {
    server.close();
  }
}
