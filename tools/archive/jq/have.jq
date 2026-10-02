# A single recursive archive listing -> sorted newest-first version prefixes.

import "versions" as v;

def version_re: "^v[0-9]+\\.[0-9]+\\.[0-9]+$";

[
  .[]
  | (.Path // .Name // "")
  | split("/")[0]
  | select(test(version_re))
]
| unique
| v::sort_versions
