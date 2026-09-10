# Input (via --slurp): [archive manifest, nav.json]

def normalize: ltrimstr("v");
def sort_versions: sort_by(normalize | split(".") | map(tonumber)) | reverse;
def releases: with_entries(.value |= (sort_versions | map(normalize)));

.[0].classification as $c
| .[1] as $nav
| {
    latest_stable: ([$c.stable[][]] | sort_versions | (first // "") | normalize),
    stable: ($c.stable | releases),
    archived: ($c.archived | releases),
    nav: $nav,
  }
