VERSIONS = {
    # This should match the version in `.ruby-version`
    # It must also be availble, and preferably the default here:
    #  https://github.com/netlify/build-image/blob/focal/included_software.md
    "python": "3.10",
    "aspect_bazel_lib": {
        "type": "github_archive",
        "repo": "aspect-build/bazel-lib",
        "version": "fcf1db5cd5acabae98009a26589dd097c6baa95d",
        "sha256": "3d8c76cff1486f0fc07fdb6969e01b865cdbd9379ea7feac1b223e73589409f1",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "strip_prefix": "bazel-lib-{version}",
    },
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
        "version": "b42831179d75e55e73124804bf7939c09cc4af97",
        "sha256": "1bff1cf8d5f687fa98b67ef7e6920af2650f2547f11f8bc6e5ec4c6ba125b9e0",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "strip_prefix": "envoy-{version}",
    },
    "envoy_archive": {
        "type": "github_archive",
        "repo": "envoyproxy/archive",
        "version": "3730f120f7895384133d432f569da96cbd3152cc",
        "sha256": "35a1fdd3cdb75ee87b67683d71ccabe4d0ad56ba558a4b48ae490da7efacaa6a",
        "urls": ["https://github.com/{repo}/archive/{version}.tar.gz"],
        "patch_args": ["-p1"],
        "strip_prefix": "archive-{version}",
    },
    "envoy_toolshed": {
        "type": "github_archive",
        "repo": "envoyproxy/toolshed",
        "version": "0.1.1",
        "sha256": "ee759b57270a2747f3f2a3d6ecaad63b834dd9887505a9f1c919d72429dbeffd",
        "urls": ["https://github.com/{repo}/archive/bazel-v{version}.tar.gz"],
        "strip_prefix": "toolshed-bazel-v{version}/bazel",
    },
}
