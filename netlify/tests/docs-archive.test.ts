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

Deno.test("latest HTML via context.next() is injected and fetch is not used", async () => {
  await withFetchStub(
    () => {
      throw new Error("fetch should not be called for latest");
    },
    async () => {
      const req = new Request("https://example.com/docs/envoy/latest/about_docs");
      const latestContext = {
        next: () =>
          Promise.resolve(
            new Response("<html><head><title>x</title></head><body>ok</body></html>", {
              status: 200,
              headers: {
                "content-type": "text/html; charset=utf-8",
                "content-length": "61",
                "etag": "W/\"abc\"",
                "cache-control": "public, max-age=60",
              },
            }),
          ),
      };
      const res = await handler(req, latestContext as never);
      const body = await res.text();
      assertEquals(body.includes('data-envoy-docs-version="latest"'), true);
      assertEquals(body.indexOf("docs-banner.js") < body.indexOf("</head>"), true);
      assertEquals(res.headers.get("content-length"), null);
      assertEquals(res.headers.get("etag"), null);
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    },
  );
});

Deno.test("latest non-HTML assets pass through untouched and fetch is not used", async () => {
  await withFetchStub(
    () => {
      throw new Error("fetch should not be called for latest assets");
    },
    async () => {
      const req = new Request("https://example.com/docs/envoy/latest/_static/foo.css");
      const latestContext = {
        next: () =>
          Promise.resolve(
            new Response("body { color: red }", {
              status: 200,
              headers: {
                "content-type": "text/css",
                "content-length": "18",
                "etag": "W/\"asset\"",
              },
            }),
          ),
      };
      const res = await handler(req, latestContext as never);
      assertEquals(await res.text(), "body { color: red }");
      assertEquals(res.headers.get("content-length"), "18");
      assertEquals(res.headers.get("etag"), "W/\"asset\"");
      assertEquals(res.headers.get("netlify-cdn-cache-control"), null);
    },
  );
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
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    },
  );
});

Deno.test("archived HTML 200 is injected before </head> and drops content-length/etag", async () => {
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
      assertEquals(body.includes('data-envoy-docs-version="v1.34.1"'), true);
      assertEquals(body.indexOf("docs-banner.js") < body.indexOf("</head>"), true);
      assertEquals(res.headers.get("content-length"), null);
      assertEquals(res.headers.get("etag"), null);
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
      );
    },
  );
});

Deno.test("conditional headers are not forwarded for html-ish directory requests", async () => {
  await withFetchStub(
    (_url, init) => {
      const forwarded = new Headers(init?.headers);
      assertEquals(forwarded.has("if-none-match"), false);
      assertEquals(forwarded.has("if-modified-since"), false);
      return new Response("<html><head></head><body>ok</body></html>", {
        status: 200,
        headers: {
          "content-type": "text/html",
          "etag": "W/\"etag\"",
        },
      });
    },
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/configuration/",
        {
          headers: {
            "if-none-match": "W/\"downstream\"",
            "if-modified-since": "Wed, 01 Jan 2025 00:00:00 GMT",
          },
        },
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 200);
      assertEquals(res.headers.get("etag"), null);
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
      assertEquals(body.includes('data-envoy-docs-version="v1.34.1"'), true);
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
      assertEquals(
        res.headers.get("netlify-cdn-cache-control"),
        "public, max-age=86400, stale-while-revalidate=604800",
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
          headers: { "content-type": "text/plain" },
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
      assertEquals(res.headers.get("netlify-cdn-cache-control"), null);
      assertArrayEquals(urls, [
        "https://storage.googleapis.com/envoy-cncf-archive/envoy/docs/v1.34.1/api-v3/config/route/v3/missing.proto.html",
        "https://storage.googleapis.com/envoy-cncf-archive/envoy/docs/v1.34.1/api-v3/config/route/v3/missing.proto",
        "https://storage.googleapis.com/envoy-cncf-archive/envoy/docs/v1.34.1/api-v3/config/route/v3/missing.proto/index.html",
      ]);
    },
  );
});

Deno.test("304 responses are passed through without decoration", async () => {
  await withFetchStub(
    () =>
      new Response(null, {
        status: 304,
        headers: {
          "content-type": "text/css",
          "etag": "W/\"cached\"",
        },
      }),
    async () => {
      const req = new Request(
        "https://example.com/docs/envoy/v1.34.1/_static/maybe.css",
      );
      const res = await handler(req, context as never);
      assertEquals(res.status, 304);
      assertEquals(res.headers.get("etag"), "W/\"cached\"");
      assertEquals(res.headers.get("netlify-cdn-cache-control"), null);
    },
  );
});
