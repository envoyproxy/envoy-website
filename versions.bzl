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
        "version": "c4fb2bae45731cdb40fdafd2759adc62c43d2972",
        "sha256": "50927af16f3fab831fdeb995b3bf417efb2873ac9c63f4c96a9d807b1299bc0f",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "archive-{version}",
    },
}
