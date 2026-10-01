# Versions recorded in the existing manifest but no longer present in `have`.

import "versions" as v;

($existing[0].versions // {}) as $existing_versions
| ($have[0]) as $have_versions
| ([$existing_versions | keys[] as $ver | select(($have_versions | index($ver)) | not) | $ver] | v::sort_versions)
| .[]
