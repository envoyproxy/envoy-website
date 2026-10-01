# Builds `{version: meta}` entries for versions present in `have` but absent
# from the existing manifest, using each version's per-version sidecar.

import "versions" as v;

def new_entries:
  ($existing[0].versions // {}) as $existing_versions
  | ($have[0]) as $have_versions
  | ($sidecars[0] // {}) as $sidecar_map
  | reduce ($have_versions[] | select(in($existing_versions) | not) | select(in($sidecar_map))) as $version ({};
      $sidecar_map[$version] as $sidecar
      | .[$version] = {
          minor: ($version | v::minor),
          digest: $sidecar.digest,
          objects: $sidecar.objects,
          published: $sidecar.published
        }
    );
