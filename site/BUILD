load("@envoy_toolshed//website:macros.bzl", "static_website")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

exports_files([
    "requirements.txt",
])

filegroup(
    name = "config",
    srcs = ["pelicanconf.py"],
    visibility = ["//visibility:public"],
)

alias(
    name = "content",
    actual = "//site/content",
)

alias(
    name = "data",
    actual = "//site/data",
)

alias(
    name = "theme",
    actual = "//site/theme",
)

pkg_tar(
    name = "docs_latest",
    package_dir = "docs/envoy/latest",
    deps = ["@envoy//docs"],
)

static_website(
    name = "site",
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    decompressor_args = "-fcd",
    deps = [":docs_latest"],
    srcs = ["//docs"],
    extension = "tar.zst",
)
