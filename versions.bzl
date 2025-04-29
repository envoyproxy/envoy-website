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
        "version": "0e10eda33680046a6c87a2e37a84419ae6f8c440",
        "sha256": "98536b6675f7864547ff71f92afd5d59d80a8adc7755dd417a0b16c3bde8d117",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "strip_prefix": "envoy-{version}",
    },
    "envoy_archive": {
        "type": "github_archive",
        "repo": "envoyproxy/archive",
        "version": "1f5ff9d443ffecc3d48a609b1093b17968892643",
        "sha256": "1d3595247106911680a506a89ef3d6532d6a8f226aff8b90ae6a3408e10b91a5",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "archive-{version}",
    },
    "envoy_toolshed": {
        "type": "github_archive",
        "repo": "envoyproxy/toolshed",
        "version": "0.2.3",
        "sha256": "4727b896c51fccaeda1210ef8b2da567b1964e3f4f888f6e0d2bdabd63cd61bc",
        "urls": ["https://github.com/{repo}/archive/bazel-v{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "toolshed-bazel-v{version}/bazel",
    },
}
