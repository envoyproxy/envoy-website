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
    "envoy_archive": {
        "type": "github_archive",
        "repo": "envoyproxy/archive",
        "version": "4f6bbc609e09e2e79d14d4f719a972f8337664f6",
        "sha256": "cd3b6958067d8ed1768abf3f75a14d0d03efdf306151505d53329830efd7dbd3",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "archive-{version}",
    },
}
