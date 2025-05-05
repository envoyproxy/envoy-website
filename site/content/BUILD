load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

pkg_files(
    name = "content_files",
    srcs = glob([
        "assets/favicon.ico",
        "assets/robots.txt",
        "assets/google*",
        "assets/404",
        "images/*.svg",
        "images/**/*.png",
        "images/**/*.svg",
        "pages/*.html",
        "pages/*.md",
    ]),
    prefix = "content",
    strip_prefix = "",
)

pkg_filegroup(
    name = "content",
    srcs = [":content_files"],
    visibility = ["//visibility:public"],
)
