load("@envoy_toolshed//website:macros.bzl", "static_website")

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

static_website(
    name = "site",
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    decompressor_args = "-fcd",
    deps = ["@envoy//docs"],
    srcs = ["//docs"],
    extension = "tar.zst",
)
