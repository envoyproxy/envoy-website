load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

pkg_files(
    name = "templates",
    srcs = glob(["templates/*html"]),
    strip_prefix = "",
    prefix = "theme",
)

pkg_filegroup(
    name = "theme",
    srcs = [
        "//site/theme/static/css",
        "//site/theme/static/images",
        "//site/theme/static/js",
        ":templates",
    ],
    visibility = ["//visibility:public"],
)
