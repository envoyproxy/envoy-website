# Versions in the archive bucket that have neither a manifest entry nor a
# sidecar. These need //tools/archive:backfill before publication.
($existing[0].versions // {}) as $existing_versions
| ($sidecars[0] // {}) as $sidecar_map
| $have[0][]
| select((in($existing_versions) or in($sidecar_map)) | not)
