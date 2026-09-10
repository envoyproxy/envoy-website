// Lightweight Deno tests for docs-archive.ts, mocking `fetch` and the
// Netlify edge `Context`. Run with:
//   deno test --allow-import ../edge-functions/docs-archive.ts

import handler from "../edge-functions/docs-archive.ts";

function assertEquals<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`assertEquals failed: ${actual} !== ${expected}`);
  }
}

function assertArrayEquals<T>(actual: T[], expected: T[]) {
  assertEquals(JSON.stringify(actual), JSON.stringify(expected));
}

type FetchStub = (url: string, init?: RequestInit) => Response;

const withFetchStub = (stub: FetchStub, fn: () => Promise<void>) => {
  const original = globalThis.fetch;
  // deno-lint-ignore no-explicit-any
  globalThis.fetch = ((input: any, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.url;
    return Promise.resolve(stub(url, init));
  }) as typeof fetch;
  return fn().finally(() => {
    globalThis.fetch = original;
  });
};

const context = {
  next: () => Promise.resolve(new Response("next", { status: 200 })),
};

Deno.test("latest/* passes through via context.next()", async () => {
  const req = new Request("https://example.com/docs/envoy/latest/about_docs");
  const res = await handler(req, context as never);
  assertEquals(await res.text(), "next");
});

Deno.test(".html -> 301 stripped, preserving query string", async () => {
  await withFetchStub(
    () => new Response("should not be called", { status: 500 }),
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/about_docs.html?x=1",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 301);
      assertEquals(
        res.headers.get("location"),
        "https://example.com/docs/envoy/v1.34.1/about_docs?x=1",
      );
    },
  );
});

Deno.test("/index.html -> 301 to /", async () => {
  await withFetchStub(
    () => new Response("should not be called", { status: 500 }),
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/configuration/index.html",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 301);
      assertEquals(
        res.headers.get("location"),
        "https://example.com/docs/envoy/v1.34.1/configuration/",
      );
    },
  );
});

Deno.test("extensionless page proxies the .html object", async () => {
  await withFetchStub(
    (url) => {
      assertEquals(url.endsWith("/about_docs.html"), true);
      return new Response("page body", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/about_docs",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(await res.text(), "page body");
    },
  );
});

Deno.test("extensionless directory 404s on .html, 301s to trailing slash", async () => {
  await withFetchStub(
    (url) => {
      if (url.endsWith("/configuration.html")) {
        return new Response("not found", { status: 404 });
      }
      if (url.endsWith("/configuration")) {
        return new Response("not found", { status: 404 });
      }
      if (url.endsWith("/configuration/index.html")) {
        return new Response("dir index", { status: 200 });
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/configuration",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 301);
      assertEquals(
        res.headers.get("location"),
        "https://example.com/docs/envoy/v1.34.1/configuration/",
      );
    },
  );
});

Deno.test("foo.proto pretty URL resolves to foo.proto.html first", async () => {
  await withFetchStub(
    (url) => {
      if (url.endsWith("/route_components.proto.html")) {
        return new Response("proto page", {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }
      if (url.endsWith("/route_components.proto")) {
        throw new Error("unexpected bare .proto fetch");
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.39.1/api-v3/config/route/v3/route_components.proto",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(await res.text(), "proto page");
    },
  );
});

Deno.test("_static/*.css is fetched directly without .html probe", async () => {
  await withFetchStub(
    (url) => {
      if (url.includes(".html")) {
        throw new Error(`unexpected .html probe: ${url}`);
      }
      assertEquals(url.endsWith("/_static/foo.css"), true);
      return new Response("body { color: red }", {
        status: 200,
        headers: { "content-type": "text/css" },
      });
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/_static/foo.css",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(res.headers.get("content-type"), "text/css");
    },
  );
});

Deno.test("objects.inv is fetched directly without .html probe", async () => {
  await withFetchStub(
    (url) => {
      if (url.includes(".html")) {
        throw new Error(`unexpected .html probe: ${url}`);
      }
      assertEquals(url.endsWith("/objects.inv"), true);
      return new Response("inv", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/objects.inv",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(await res.text(), "inv");
    },
  );
});

Deno.test("non-asset dotted path falls back from .html 404 to verbatim object", async () => {
  await withFetchStub(
    (url) => {
      if (url.endsWith("/_downloads/abc/envoy.yaml.html")) {
        return new Response("not found", { status: 404 });
      }
      if (url.endsWith("/_downloads/abc/envoy.yaml")) {
        return new Response("yaml asset", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/_downloads/abc/envoy.yaml",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(await res.text(), "yaml asset");
    },
  );
});

Deno.test("404 upstream response is sanitized (no GCS XML passthrough)", async () => {
  const urls: string[] = [];
  await withFetchStub(
    (url) => {
      urls.push(url);
      return new Response(
        "<Error><Code>NoSuchKey</Code><Message>No such object</Message></Error>",
        {
          status: 404,
          headers: { "content-type": "application/xml" },
        },
      );
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/api-v3/config/route/v3/missing.proto",
      );
      const res = await handler(req, context as never);
      const body = await res.text();
      assertEquals(res.status, 404);
      assertEquals(body.includes("NoSuchKey"), false);
      assertEquals(res.headers.get("content-type")?.includes("xml"), false);
      assertArrayEquals(urls, [
        "https://storage.googleapis.com/envoy-cncf-archive/envoy/docs/v1.34.1/api-v3/config/route/v3/missing.proto.html",
        "https://storage.googleapis.com/envoy-cncf-archive/envoy/docs/v1.34.1/api-v3/config/route/v3/missing.proto",
        "https://storage.googleapis.com/envoy-cncf-archive/envoy/docs/v1.34.1/api-v3/config/route/v3/missing.proto/index.html",
      ]);
    },
  );
});

Deno.test("conditional headers are forwarded on first probe", async () => {
  await withFetchStub(
    (url, init) => {
      assertEquals(url.endsWith("/about_docs.html"), true);
      assertEquals(init?.headers instanceof Headers, true);
      const headers = init?.headers as Headers;
      assertEquals(headers.get("if-none-match"), '"etag123"');
      assertEquals(
        headers.get("if-modified-since"),
        "Wed, 21 Oct 2015 07:28:00 GMT",
      );
      return new Response("page body", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/about_docs",
        {
          headers: {
            "if-none-match": '"etag123"',
            "if-modified-since": "Wed, 21 Oct 2015 07:28:00 GMT",
          },
        },
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
    },
  );
});
