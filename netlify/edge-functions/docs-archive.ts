// Proxy archived Envoy docs from the GCS archive bucket.
//
// The bucket is a plain object store: it has no notion of directories and
// will not resolve `/v1.34.1/configuration/` to `.../configuration/index.html`.
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
//
// `/docs/envoy/latest/` is not handled here; it is built into the site and
// matched by the redirect rule in netlify.toml before this function runs.

import type { Context } from "https://edge.netlify.com";

const ARCHIVE_BUCKET = "envoy-cncf-archive";
const ARCHIVE_ORIGIN = `https://storage.googleapis.com/${ARCHIVE_BUCKET}/envoy/docs`;
const SITE_PREFIX = "/docs/envoy/";
const CDN_CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";
const escapeHtmlAttribute = (value: string) =>
  value.replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&#39;");
const HTML_INJECTION = (version: string) =>
  `<link rel="stylesheet" href="/theme/css/docs-banner.css" />\n<script defer src="/theme/js/docs-banner.js" data-envoy-docs-version="${escapeHtmlAttribute(version)}"></script>\n`;

// Extensions a Sphinx html tree actually contains. Anything else is a
// directory - notably `v1.39.1`, which contains dots but is not a file.
const FILE_EXTENSIONS = new Set([
  "html", "htm", "txt", "xml", "json", "js", "css", "map",
  "png", "jpg", "jpeg", "gif", "svg", "ico", "webp",
  "woff", "woff2", "ttf", "eot", "otf",
  "pdf", "yaml", "yml", "proto", "inv", "buildinfo", "sh", "py", "md", "rst",
]);

const hasExtension = (path: string): boolean => {
  const last = path.slice(path.lastIndexOf("/") + 1);
  const dot = last.lastIndexOf(".");
  if (dot < 0) return false;
  return FILE_EXTENSIONS.has(last.slice(dot + 1).toLowerCase());
};
const isArchiveVersion = (segment: string): boolean =>
  /^(v)?[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(segment);

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

const injectIntoHead = (html: string, snippet: string): string => {
  const lower = html.toLowerCase();
  const idx = lower.indexOf("</head>");
  if (idx < 0) {
    return `${snippet}${html}`;
  }
  return `${html.slice(0, idx)}${snippet}${html.slice(idx)}`;
};

const cachedRedirect = (url: string): Response => {
  const response = Response.redirect(url, 301);
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

  // Belt and braces: `latest` and static docs data are owned by the site build.
  if (
    version === "latest" ||
    version === "versions.json" ||
    !isArchiveVersion(version)
  ) {
    return context.next();
  }

  // Pretty URLs: /foo.html -> /foo, /foo/index.html -> /foo/. This mirrors
  // Netlify's "Pretty URLs" post-processing (see header comment above).
  if (url.pathname.endsWith("/index.html")) {
    url.pathname = url.pathname.slice(0, -"index.html".length);
    return cachedRedirect(url.toString());
  }
  if (url.pathname.endsWith(".html")) {
    url.pathname = url.pathname.slice(0, -".html".length);
    return cachedRedirect(url.toString());
  }

  // Forward only conditional-request headers, and only when present: GCS
  // rejects an empty `If-Modified-Since:` with InvalidArgument. Never forward
  // cookies or auth to the bucket.
  const shouldForwardConditionals = hasExtension(rel);
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
  } else if (hasExtension(rel)) {
    upstream = await fetchObject(rel, upstreamHeaders);
  } else {
    // Extensionless: prefer `foo.html` (a page), fall back to `foo/index.html`
    // (a directory), canonicalising the latter to a trailing slash so
    // Sphinx's relative links resolve against the right base.
    upstream = await fetchObject(`${rel}.html`, upstreamHeaders);
    if (upstream.status === 404) {
      const dir = await fetchObject(`${rel}/index.html`, new Headers());
      if (dir.ok) {
        url.pathname += "/";
        return cachedRedirect(url.toString());
      }
    }
  }

  const headers = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (upstream.ok && contentType.startsWith("text/html")) {
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
