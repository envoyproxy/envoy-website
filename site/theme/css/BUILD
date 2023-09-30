load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

pkg_files(
    name = "scss",
    srcs = ["@com_github_twbs_bootstrap//:scss"],
    prefix = "theme/css/_sass/vendor/bootstrap",
    strip_prefix = "scss",
    visibility = ["//visibility:public"],
)

pkg_files(
    name = "css_files",
    srcs = glob(["**/*css"]),
    prefix = "theme/css",
    strip_prefix = "",
    visibility = ["//visibility:public"],
)

pkg_filegroup(
    name = "css",
    srcs = [
        ":css_files",
        ":scss",
    ],
    visibility = ["//visibility:public"],
)
