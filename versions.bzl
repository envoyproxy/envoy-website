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
        "version": "b0f079d7c1b9c9048f9ec554cbe924f2a2f73252",
        "sha256": "230a1aa0cabb1cf66faca4be663a3bc23d4e5f568dc08a35dd36031ebcdf58be",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "strip_prefix": "envoy-{version}",
    },
    "envoy_archive": {
        "type": "github_archive",
        "repo": "envoyproxy/archive",
        "version": "4e5c73cd12a40ab8aa74bd58b34a31ece2cfb61d",
        "sha256": "4ad39ee004cca4909656ddce8b53619c74b3de8ccb1e33f623c1059b34783802",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "archive-{version}",
    },
    "envoy_toolshed": {
        "type": "github_archive",
        "repo": "envoyproxy/toolshed",
        "version": "0.3.8",
        "sha256": "588bb7e206897fffc3ad8f4d5835ee2bbdd9f79e543a33853936fa014bda04ee",
        "urls": ["https://github.com/{repo}/archive/refs/tags/bazel-v{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "toolshed-bazel-v{version}/bazel",
    },
}
