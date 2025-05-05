load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

pkg_files(
    name = "js_files",
    srcs = glob(["**/*js"]),
    prefix = "theme/js",
    strip_prefix = "",
    visibility = ["//visibility:public"],
)

pkg_filegroup(
    name = "js",
    srcs = [
        ":js_files",
    ],
    visibility = ["//visibility:public"],
)
