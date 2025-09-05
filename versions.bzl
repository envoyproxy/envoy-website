VERSIONS = {
    # This should match the version in `.ruby-version`
    # It must also be availble, and preferably the default here:
    #  https://github.com/netlify/build-image/blob/focal/included_software.md
    "python": "3.10",
    "com_github_twbs_bootstrap": {
        "type": "github_archive",
        "repo": "twbs/bootstrap",
        "version": "5.1.3",
        "sha256": "55b951db46e1d69b4236494122fe559716a76c4b8a418c11f3fed6abc2d4de3f",
        "urls": ["https://github.com/{repo}/archive/refs/tags/v{version}.tar.gz"],
        "strip_prefix": "bootstrap-{version}",
        "build_file": "@envoy-website//bazel:bootstrap.BUILD",
    },
    "envoy": {
        "type": "github_archive",
        "repo": "envoyproxy/envoy",
        "version": "9be163f985a38ea868130fc9f8f4440c5e648787",
        "sha256": "6a67f7596b4791ea2f89f83b60b43f9dffb2d84e4aab44aa3952bb4e3243079f",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "strip_prefix": "envoy-{version}",
    },
    "envoy_archive": {
        "type": "github_archive",
        "repo": "envoyproxy/archive",
        "version": "fe0f95a15adf490ed6cf9c4b08e7e289ab7af54d",
        "sha256": "16d0fb9096b40d47a2aa77948fd7ccbfb4f09f593bfcb519cd6812836158edf2",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "archive-{version}",
    },
    "envoy_toolshed": {
        "type": "github_archive",
        "repo": "envoyproxy/toolshed",
        "version": "0.3.3",
        "sha256": "1ac69d5b1cbc138f779fc3858f06a6777455136260e1144010f0b51880f69814",
        "urls": ["https://github.com/{repo}/archive/bazel-v{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "toolshed-bazel-v{version}/bazel",
    },
}
