load("@rules_pkg//:pkg.bzl", "pkg_tar")

genrule(
    name = "website",
    cmd = """
    cp -a $(location //_data:versions) _data/ \
    && mkdir -p assets/js \
    && mkdir -p _sass/vendor \
    && mv $(location @com_github_twbs_bootstrap//:scss) _sass/vendor/bootstrap \
    && mv $(location @com_github_twbs_bootstrap//:dist/js/bootstrap.bundle.min.js) assets/js \
    && $(locations @jekyll_bundle//:bin/jekyll) build \
    && tar cfh $@ --exclude=external -C _site .
    """,
    outs = ["site.tar"],
    tools = [
        "@com_github_twbs_bootstrap//:scss",
        "@com_github_twbs_bootstrap//:dist/js/bootstrap.bundle.min.js",
        "@jekyll_bundle//:bin/jekyll",
        "//:jekyll_assets",
        "//:website_assets",
        "//_data:versions",
    ],
)

filegroup(
    name = "_plugins",
    srcs = ["jekyll_plugins"],
)

py_binary(
    name = "live",
    srcs = ["live.py"],
    data = [
        "@com_github_twbs_bootstrap//:scss",
        "@com_github_twbs_bootstrap//:dist/js/bootstrap.bundle.min.js",
        "@jekyll_bundle//:bin/jekyll",
        "//:jekyll_assets",
        "//:website_assets",
        "//_data:versions",
        ":_plugins",
    ],
)

py_binary(
    name = "live_docs",
    srcs = ["live_docs.py"],
    data = [
        "@com_github_twbs_bootstrap//:scss",
        "@com_github_twbs_bootstrap//:dist/js/bootstrap.bundle.min.js",
        "@jekyll_bundle//:bin/jekyll",
        "//:jekyll_assets",
        "//:website_assets",
        "//_data:versions",
        "//docs:latest",
        "//docs:releases_html",
        ":_plugins",
    ],
)

pkg_tar(
    name = "html",
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    extension = "tar.zst",
    deps = [":website", "//docs:latest"],
    srcs = ["//docs:releases"],
)
