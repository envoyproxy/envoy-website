
VERSIONS = {
    # This should match the version in `.ruby-version`
    # It must also be availble, and preferably the default here:
    #  https://github.com/netlify/build-image/blob/focal/included_software.md
    "python": "3.10",
    "aspect_bazel_lib": {
        "type": "github_archive",
        "repo": "aspect-build/bazel-lib",
        "version": "8d3c941c6499626376d2a1e3e01e05f3e1ec6856",
        "sha256": "1b1da9d7d58b83ae47e7f15f1dd6c5033f84bc2b5ad65226fa745861b2204d91",
        "url": "https://github.com/{repo}/archive/{version}.tar.gz",
        "strip_prefix": "bazel-lib-{version}",
    },
    "com_github_twbs_bootstrap": {
        "type": "github_archive",
        "repo": "twbs/bootstrap",
        "version": "5.1.3",
        "sha256": "55b951db46e1d69b4236494122fe559716a76c4b8a418c11f3fed6abc2d4de3f",
        "url": "https://github.com/{repo}/archive/refs/tags/v{version}.tar.gz",
        "strip_prefix": "bootstrap-{version}",
        "build_file": "@envoy-website//bazel:bootstrap.BUILD",
    },
    "envoy": {
        "type": "github_archive",
        "repo": "envoyproxy/envoy",
        "version": "b6fba8cdeccbfcd29f348ed73cc56490a6a03c37",
        "sha256": "e8c140d1045420fe820b4f1e3bbba69fc5aa6f4560b1eedc1e0d2ee620f85baa",
        "url": "https://github.com/{repo}/archive/{version}.tar.gz",
        "patches": ["@envoy-website//bazel:envoy.patch"],
        "patch_args": ["-p1"],
        "strip_prefix": "envoy-{version}",
    },
    "envoy_toolshed": {
        "type": "github_archive",
        "repo": "envoyproxy/toolshed",
        "version": "0.0.8",
        "sha256": "f54fa767efe9271b6839d0baac80dea723299bba4e4e5fa0bea7b689aa2179de",
        "url": "https://github.com/{repo}/archive/bazel-v{version}.tar.gz",
        "strip_prefix": "toolshed-bazel-v{version}/bazel",
    },
}
