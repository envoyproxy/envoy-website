// Proxy Envoy docs pages with runtime banner injection.
//
// Archived docs are fetched from the GCS archive bucket, while `latest` is
// served by Netlify static hosting. This function decorates HTML responses for
// both so the docs banner is injected at request time (the archived HTML stored
// in GCS is never rewritten).
//
// The bucket is a plain object store: it has no notion of directories and will
// not resolve `/v1.34.1/configuration/` to `.../configuration/index.html`.
// Sphinx emits directory-shaped relative links throughout, and humans strip
// trailing slashes when pasting URLs, so both shapes must keep working.
//
// The archive used to be proxied from a Netlify site with "Pretty URLs"
// post-processing enabled, which 301s `/foo.html` -> `/foo` and serves `/foo`
// from `foo.html`. Sphinx's `html` builder emits `foo.html` files and links
// throughout, and those extensionless URLs were entirely produced by that
// Netlify post-processing - `storage.googleapis.com` does none of it. This
// function reproduces that behaviour so `.html` doesn't leak into the address
// bar and previously published extensionless links keep working.
//
//   /docs/envoy/v1.34.1                   -> 301 /docs/envoy/v1.34.1/
//   /docs/envoy/v1.34.1/                  -> proxy .../v1.34.1/index.html
//   /docs/envoy/v1.34.1/about_docs.html   -> 301 .../about_docs        (pretty url)
//   /docs/envoy/v1.34.1/about_docs        -> proxy .../about_docs.html
//   /docs/envoy/v1.34.1/configuration     -> 301 .../configuration/    (no .html, has index.html)
//   /docs/envoy/v1.34.1/configuration/    -> proxy .../configuration/index.html
//   /docs/envoy/v1.34.1/_static/foo.css   -> proxy as-is

import type { Context } from "https://edge.netlify.com";

const ARCHIVE_BUCKET = "envoy-cncf-archive";
const ARCHIVE_ORIGIN =
  `https://storage.googleapis.com/${ARCHIVE_BUCKET}/envoy/docs`;
const SITE_PREFIX = "/docs/envoy/";
const CDN_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=604800";

// Extensions that are always static assets in archived docs and should be
// fetched directly, skipping the `${rel}.html` probe.
const ASSET_EXTENSIONS = new Set([
  "js",
  "css",
  "map",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
  "webp",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  "pdf",
  "inv",
  "buildinfo",
]);

const hasAssetExtension = (path: string): boolean => {
  const last = path.slice(path.lastIndexOf("/") + 1);
  const dot = last.lastIndexOf(".");
  if (dot < 0) return false;
  return ASSET_EXTENSIONS.has(last.slice(dot + 1).toLowerCase());
};

const isArchiveVersion = (segment: string): boolean =>
  /^(v)?[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(segment);

const isHtmlishPath = (path: string): boolean => {
  if (!path || path.endsWith("/")) {
    return true;
  }
  const last = path.slice(path.lastIndexOf("/") + 1);
  const dot = last.lastIndexOf(".");
  if (dot < 0) {
    return true;
  }
  const ext = last.slice(dot + 1).toLowerCase();
  return ext === "html" || ext === "htm";
};

const CONDITIONAL_HEADERS = ["if-none-match", "if-modified-since"];
const RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "cache-control",
  "etag",
  "last-modified",
];

const fetchObject = (objectPath: string, headers: Headers) =>
  fetch(`${ARCHIVE_ORIGIN}/${objectPath}`, { headers });

const escapeHtmlAttribute = (value: string) =>
  value.replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&#39;");

const HTML_INJECTION = (version: string) =>
  `<link rel="stylesheet" href="/theme/css/docs-banner.css" />\n<script defer src="/theme/js/docs-banner.js" data-envoy-docs-version="${escapeHtmlAttribute(version)}"></script>\n`;

const injectIntoHead = (html: string, snippet: string): string => {
  const lower = html.toLowerCase();
  const idx = lower.indexOf("</head>");
  if (idx < 0) {
    return `${snippet}${html}`;
  }
  return `${html.slice(0, idx)}${snippet}${html.slice(idx)}`;
};

const copyResponseHeaders = (upstream: Response): Headers => {
  const headers = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  return headers;
};

const decorate = async (upstream: Response, version: string): Promise<Response> => {
  if (upstream.status === 404) {
    return new Response("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const headers = copyResponseHeaders(upstream);
  const contentType = upstream.headers.get("content-type") || "";

  if (upstream.ok && contentType.toLowerCase().startsWith("text/html")) {
    const body = injectIntoHead(await upstream.text(), HTML_INJECTION(version));
    headers.delete("content-length");
    headers.delete("etag");
    headers.set("netlify-cdn-cache-control", CDN_CACHE_CONTROL);
    return new Response(body, {
      status: upstream.status,
      headers,
    });
  }

  if (upstream.status >= 200 && upstream.status < 300) {
    headers.set("netlify-cdn-cache-control", CDN_CACHE_CONTROL);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
};

const cachedRedirect = (url: string, status = 301): Response => {
  const response = Response.redirect(url, status);
  const headers = new Headers(response.headers);
  headers.set("netlify-cdn-cache-control", CDN_CACHE_CONTROL);
  return new Response(response.body, {
    status: response.status,
    headers,
  });
};

export const config = {
  path: "/docs/envoy/*",
  cache: "manual",
};

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  if (!url.pathname.startsWith(SITE_PREFIX)) {
    return context.next();
  }

  const rel = url.pathname.slice(SITE_PREFIX.length);
  const version = rel.split("/", 1)[0];

  if (version === "latest") {
    const latestRel = rel === "latest" ? "" : rel.slice("latest/".length);
    if (!isHtmlishPath(latestRel)) {
      return context.next();
    }
    return decorate(await context.next(), "latest");
  }

  if (version === "versions.json" || !isArchiveVersion(version)) {
    return context.next();
  }

  // Pretty URLs: /foo.html -> /foo, /foo/index.html -> /foo/. This mirrors
  // Netlify's "Pretty URLs" post-processing (see header comment above).
  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.slice(0, -"index.html".length);
    return cachedRedirect(url.toString(), 301);
  }
  if (url.pathname.endsWith(".html")) {
    url.pathname = url.pathname.slice(0, -".html".length);
    return cachedRedirect(url.toString(), 301);
  }

  // Forward only conditional-request headers, and only when present: GCS
  // rejects an empty `If-Modified-Since:` with InvalidArgument. Never forward
  // cookies or auth to the bucket.
  const shouldForwardConditionals = !isHtmlishPath(rel);
  const upstreamHeaders = new Headers();
  if (shouldForwardConditionals) {
    for (const name of CONDITIONAL_HEADERS) {
      const value = request.headers.get(name);
      if (value) upstreamHeaders.set(name, value);
    }
  }

  let upstream: Response;
  if (rel.endsWith("/")) {
    upstream = await fetchObject(`${rel}index.html`, upstreamHeaders);
  } else if (rel.endsWith(".html")) {
    upstream = await fetchObject(rel, upstreamHeaders);
  } else if (hasAssetExtension(rel)) {
    upstream = await fetchObject(rel, upstreamHeaders);
  } else {
    // Pretty URL for a Sphinx page (`foo`, `foo.proto`, `envoy.yaml` ...):
    // prefer `foo.html`, then fall back to a verbatim object and directory.
    upstream = await fetchObject(`${rel}.html`, upstreamHeaders);
    if (upstream.status === 404) {
      const asset = await fetchObject(rel, upstreamHeaders);
      if (asset.status !== 404) {
        upstream = asset;
      } else {
        const dir = await fetchObject(`${rel}/index.html`, upstreamHeaders);
        if (dir.ok) {
          url.pathname += "/";
          return cachedRedirect(url.toString(), 301);
        }
      }
    }
  }

  return decorate(upstream, version);
};
