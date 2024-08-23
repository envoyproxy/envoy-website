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

genrule(
    name = "empty",
    outs = ["empty.tar.gz"],
    cmd = """
    tar cf $@ .
    """,
)

pkg_tar(
    name = "docs",
    package_dir = "docs/envoy/latest",
    deps = ["@envoy//docs"],
)

filegroup(
    name = "nodocs",
    srcs = [],
)

label_flag(
    name = "docs_archive",
    build_setting_default = "@envoy_archive//docs",
    visibility = ["//visibility:public"],
)

label_flag(
    name = "docs_latest",
    build_setting_default = ":docs",
    visibility = ["//visibility:public"],
)

static_website(
    name = "site",
    srcs = [":docs_archive"],
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    content = "//site/content",
    data = "//site/data",
    extension = "tar.zst",
    theme = "//site/theme",
    deps = [":docs_latest"],
)
