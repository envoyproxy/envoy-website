def sort_versions: sort_by(ltrimstr("v") | split(".") | map(tonumber)) | reverse;

def group($entries):
  [$entries[] | {version: .key, releases: (.value | sort_versions | map(ltrimstr("v")))}];

.classification as $c
| ($c.stable | to_entries | sort_by(.key | split(".") | map(tonumber)) | reverse) as $stable
| ($c.archived | to_entries | sort_by(.key | split(".") | map(tonumber)) | reverse) as $archived
| [
    {title: "Stable versions", versions: group($stable)},
    {title: "Archived versions", versions: group($archived)},
    {title: "Development version", versions: [{version: "Latest", releases: []}]}
  ]
