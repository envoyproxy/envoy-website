def normalize: ltrimstr("v");
def sort_versions: sort_by(normalize | split(".") | map(tonumber)) | reverse;

.classification as $classification
| {
    latest_stable: (
      ($classification.stable | to_entries | map(.value[]) | sort_versions | .[0] // "")
      | normalize
    ),
    stable: (
      $classification.stable
      | with_entries(.value |= (sort_versions | map(normalize)))
    ),
    archived: (
      $classification.archived
      | with_entries(.value |= (sort_versions | map(normalize)))
    )
  }
