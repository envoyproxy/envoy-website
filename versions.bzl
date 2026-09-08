VERSIONS = {
    "com_github_twbs_bootstrap": {
        "type": "github_archive",
        "repo": "twbs/bootstrap",
        "version": "5.3.8",
        "sha256": "e48d2bb45df830b6f70e2fb5a592f07f8f892dcbd3eb33245a48593cc59aa6dd",
        "urls": ["https://github.com/{repo}/archive/refs/tags/v{version}.tar.gz"],
        "strip_prefix": "bootstrap-{version}",
        "build_file": "@envoy-website//bazel:bootstrap.BUILD",
    },
    # Manifest published by the `envoyproxy/archive` reconciler, listing all
    # released Envoy docs versions in GCS. Pinned by sha256 (hermetic); bump
    # with `sync_archive.sh` (see `.github/workflows/archive-sync.yaml`).
    #
    # NB: the manifest does not exist yet (a GCS backfill is in progress) -
    # the sha256 below is a placeholder to be filled in before merge. To
    # compute it once the manifest exists:
    #   curl -sfL "${url}" | sha256sum
    "envoy_archive_manifest": {
        "type": "http_file",
        "url": "https://storage.googleapis.com/envoy-cncf-meta/envoy/docs/versions.json",
        "sha256": "ff18f132f3dd2d8f603ac1f531df62d3bc8fde0d5381b9ccabaaa20336c2009a",
        "downloaded_file_path": "versions.json",
    },
}
