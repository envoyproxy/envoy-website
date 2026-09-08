// Lightweight Deno tests for docs-archive.ts, mocking `fetch` and the
// Netlify edge `Context`. Run with:
//   deno test --allow-import ../edge-functions/docs-archive.ts

+import handler from "../edge-functions/docs-archive.ts";

function assertEquals<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`assertEquals failed: ${actual} !== ${expected}`);
  }
}

type FetchStub = (url: string) => Response;

const withFetchStub = (stub: FetchStub, fn: () => Promise<void>) => {
  const original = globalThis.fetch;
  // deno-lint-ignore no-explicit-any
  globalThis.fetch = ((input: any) => {
    const url = typeof input === "string" ? input : input.url;
    return Promise.resolve(stub(url));
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

Deno.test("_static/*.css is proxied as-is", async () => {
  await withFetchStub(
    (url) => {
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
