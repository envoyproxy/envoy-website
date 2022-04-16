load("@rules_pkg//:pkg.bzl", "pkg_tar")

genrule(
    name = "website",
    cmd = """
    $(locations @jekyll_bundle//:bin/jekyll) build \
    && tar cfh $@ --exclude=external -C _site .
    """,
    outs = ["site.tar"],
    tools = [
        "//:jekyll_assets",
        "//:website_assets",
        "@jekyll_bundle//:bin/jekyll",
    ],
)

pkg_tar(
    name = "html",
    extension = "tar.gz",
    deps = [":website", "//docs:latest"],
    srcs = ["//docs:releases"],
)
