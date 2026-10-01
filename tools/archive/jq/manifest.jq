# Build or update the content-addressed archive manifest.

import "versions" as v;

($existing[0] // {}) as $existing_manifest
| ($existing_manifest.versions // {}) as $existing_versions
| ($have[0]) as $have_versions
| ($new_entries[0] // {}) as $new
| ($archive_bucket | rtrimstr("\n")) as $bucket
| (reduce $have_versions[] as $ver ({};
    .[$ver] = (if ($existing_versions | has($ver)) then $existing_versions[$ver] else $new[$ver] end)
  ) | map_values(del(.published))) as $versions
| {
    archive: "gs://\($bucket)/envoy/docs",
    versions: $versions,
    classification: ($versions | v::classify($stable_minors))
  }
