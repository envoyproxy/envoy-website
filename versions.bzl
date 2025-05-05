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
        "version": "1a46b232d646f3b251782fb297fbed88eb9a18bb",
        "sha256": "4c5e0c2b664142ad42110d95b2c1c463c30af3233f32346a4f7d98439dfed28c",
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
        "version": "69811f5334a92c6c89730e79f08c0d9575195ee6",
        "sha256": "7f687ed9bb8211b0277c6c3abb3f454daf0240dd2aa99948b08c4b819416a407",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "toolshed-{version}/bazel",
    },
}
