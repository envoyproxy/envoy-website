load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

exports_files([
    "requirements.txt",
    "pelicanconf.py",
    "publishconf.py",
])

pkg_tar(
    name = "sources",
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    extension = "tar.zst",
    srcs = [
        "//site/content",
        "//site/data",
        "//site/theme",
        ":pelicanconf.py",
        ":publishconf.py",
    ],
)

genrule(
    name = "website",
    cmd = """
    $(location @envoy//tools/zstd) --stdout -fd $(location :sources) \
      | tar -xf - -C . \
    && $(location //tools/pelican) content \
    && tar cfh $@ --exclude=external -C output .
    """,
    outs = ["site.tar"],
    tools = [
        "@envoy//tools/zstd",
        "//tools/pelican",
        ":sources",
    ],
)

pkg_tar(
    name = "html",
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    extension = "tar.zst",
    deps = [":website", "//docs:latest"],
    srcs = ["//docs:releases"],
    visibility = ["//visibility:public"],
)

alias(
    name = "site",
    actual = ":html",
)
