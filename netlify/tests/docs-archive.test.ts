// Lightweight Deno tests for docs-archive.ts, mocking `fetch` and the
// Netlify edge `Context`. Run with:
//   deno test --allow-import ../edge-functions/docs-archive.ts

import handler from "../edge-functions/docs-archive.ts";

function assertEquals<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`assertEquals failed: ${actual} !== ${expected}`);
  }
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

Deno.test("/docs/envoy/versions.json passes through via context.next()", async () => {
  const req = new Request("https://example.com/docs/envoy/versions.json");
  const res = await handler(req, context as never);
  assertEquals(await res.text(), "next");
});

Deno.test("non-version path under /docs/envoy passes through", async () => {
  const req = new Request("https://example.com/docs/envoy/assets/help");
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
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    },
  );
});

Deno.test("HTML 200 is injected before </head> and drops content-length/etag", async () => {
  await withFetchStub(
    (_url, init) => {
      const forwarded = new Headers(init?.headers);
      assertEquals(forwarded.has("if-none-match"), false);
      assertEquals(forwarded.has("if-modified-since"), false);
      return new Response("<html><head><title>x</title></head><body>ok</body></html>", {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-length": "61",
          "etag": "W/\"abc\"",
          "cache-control": "public, max-age=60",
        },
      });

    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/about_docs",
        {
          headers: {
            "if-none-match": "W/\"downstream\"",
            "if-modified-since": "Wed, 01 Jan 2025 00:00:00 GMT",
          },
        },
      );
      const res = await handler(req, context as never);
      const body = await res.text();
      assertEquals(
        body.includes('data-envoy-docs-version="v1.34.1"'),
        true,
      );
      assertEquals(
        body.indexOf("docs-banner.js") < body.indexOf("</head>"),
        true,
      );
      assertEquals(res.headers.get("content-length"), null);
      assertEquals(res.headers.get("etag"), null);
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    },
  );
});

Deno.test("HTML without </head> gets banner prepended", async () => {
  await withFetchStub(
    () =>
      new Response("<html><body>no head</body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    async () => {
      const req = new Request("https://example.com/docs/envoy/v1.34.1/nohead");
      const res = await handler(req, context as never);
      const body = await res.text();
      assertEquals(body.startsWith("<link rel=\"stylesheet\""), true);
      assertEquals(body.includes("data-envoy-docs-version=\"v1.34.1\""), true);
    },
  );
});

Deno.test("non-HTML assets stay untouched and forward conditional headers", async () => {
  await withFetchStub(
    (_url, init) => {
      const forwarded = new Headers(init?.headers);
      assertEquals(forwarded.get("if-none-match"), "W/\"asset\"");
      assertEquals(
        forwarded.get("if-modified-since"),
        "Wed, 01 Jan 2025 00:00:00 GMT",
      );
      return new Response("body { color: red }", {
        status: 200,
        headers: {
          "content-type": "text/css",
          "content-length": "18",
          "etag": "W/\"asset-upstream\"",
        },
      });
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/_static/foo.css",
        {
          headers: {
            "if-none-match": "W/\"asset\"",
            "if-modified-since": "Wed, 01 Jan 2025 00:00:00 GMT",
          },
        },
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(await res.text(), "body { color: red }");
      assertEquals(res.headers.get("content-length"), "18");
      assertEquals(res.headers.get("etag"), "W/\"asset-upstream\"");
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    },
  );
});

Deno.test("404 and 304 responses are not modified", async () => {
  await withFetchStub(
    (url) => {
      if (url.endsWith("missing.html")) {
        return new Response("not found", {
          status: 404,
          headers: { "content-type": "text/html" },
        });
      }
      if (url.endsWith("missing/index.html")) {
        return new Response("not found", {
          status: 404,
          headers: { "content-type": "text/html" },
        });
      }
      if (url.endsWith("_static/maybe.css")) {
        return new Response(null, {
          status: 304,
          headers: {
            "content-type": "text/css",
            "etag": "W/\"cached\"",
          },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    },
    async () => {
      const missingReq = new Request(
        "https://example.com/docs/envoy/v1.34.1/missing",
      );
      const missingRes = await handler(missingReq, context as never);
      const missingBody = await missingRes.text();
      assertEquals(missingRes.status, 404);
      assertEquals(missingBody, "not found");
      assertEquals(missingBody.includes("docs-banner.js"), false);

      const cachedReq = new Request(
        "https://example.com/docs/envoy/v1.34.1/_static/maybe.css",
      );
      const cachedRes = await handler(cachedReq, context as never);
      assertEquals(cachedRes.status, 304);
      assertEquals(cachedRes.headers.get("etag"), "W/\"cached\"");
      assertEquals(cachedRes.headers.get("netlify-cdn-cache-control"), null);
    },
  );
});
