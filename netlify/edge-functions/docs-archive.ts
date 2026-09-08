// Proxy archived Envoy docs from the GCS archive bucket.
//
// The bucket is a plain object store: it has no notion of directories and
// will not resolve `/v1.34.1/configuration/` to `.../configuration/index.html`.
// Sphinx emits directory-shaped relative links throughout, and humans strip
// trailing slashes when pasting URLs, so both shapes must keep working.
//
//   /docs/envoy/v1.34.1                   -> 301 /docs/envoy/v1.34.1/
//   /docs/envoy/v1.34.1/                  -> proxy .../v1.34.1/index.html
//   /docs/envoy/v1.34.1/configuration     -> 301 .../configuration/
//   /docs/envoy/v1.34.1/configuration/    -> proxy .../configuration/index.html
//   /docs/envoy/v1.34.1/_static/foo.css   -> proxy as-is
//
// `/docs/envoy/latest/` is not handled here; it is built into the site and
// matched by the redirect rule in netlify.toml before this function runs.

import type { Context } from "https://edge.netlify.com";

const ARCHIVE_BUCKET = "envoy-cncf-archive";
const ARCHIVE_ORIGIN = `https://storage.googleapis.com/${ARCHIVE_BUCKET}/envoy/docs`;
const SITE_PREFIX = "/docs/envoy/";

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

const CONDITIONAL_HEADERS = ["if-none-match", "if-modified-since"];
const RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "cache-control",
  "etag",
  "last-modified",
];

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  if (!url.pathname.startsWith(SITE_PREFIX)) {
    return context.next();
  }

  // Belt and braces: `latest` is owned by the site build.
  const rel = url.pathname.slice(SITE_PREFIX.length);
  if (rel === "latest" || rel.startsWith("latest/")) {
    return context.next();
  }

  // Canonicalise directory requests to a trailing slash so Sphinx's relative
  // links resolve against the right base.
  if (!url.pathname.endsWith("/") && !hasExtension(url.pathname)) {
    url.pathname += "/";
    return Response.redirect(url.toString(), 301);
  }

  let objectPath = rel;
  if (objectPath.endsWith("/")) {
    objectPath += "index.html";
  }

  // Forward only conditional-request headers, and only when present: GCS
  // rejects an empty `If-Modified-Since:` with InvalidArgument. Never forward
  // cookies or auth to the bucket.
  const upstreamHeaders = new Headers();
  for (const name of CONDITIONAL_HEADERS) {
    const value = request.headers.get(name);
    if (value) upstreamHeaders.set(name, value);
  }

  const upstream = await fetch(`${ARCHIVE_ORIGIN}/${objectPath}`, {
    headers: upstreamHeaders,
  });

  const headers = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
};
