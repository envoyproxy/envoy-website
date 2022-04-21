load("@rules_pkg//:pkg.bzl", "pkg_tar")

genrule(
    name = "website",
    cmd = """
    mkdir -p assets/js \
    && tar xf $(location //_sass/vendor:bootstrap) -C . \
    && mv $(location //assets/js:bootstrap.bundle.min.js) assets/js \
    && $(locations @jekyll_bundle//:bin/jekyll) build \
    && tar cfh $@ --exclude=external -C _site .
    """,
    outs = ["site.tar"],
    tools = [
        "//:jekyll_assets",
        "//:website_assets",
        "//assets/js:bootstrap.bundle.min.js",
        "//_sass/vendor:bootstrap",
        "@jekyll_bundle//:bin/jekyll",
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
        "//:jekyll_assets",
        "//:website_assets",
        "@jekyll_bundle//:bin/jekyll",
        "//assets/js:bootstrap.bundle.min.js",
        "//_sass/vendor:bootstrap",
        ":_plugins",
    ],
)

py_binary(
    name = "live_docs",
    srcs = ["live_docs.py"],
    data = [
        "//:jekyll_assets",
        "//:website_assets",
        "@jekyll_bundle//:bin/jekyll",
        "//assets/js:bootstrap.bundle.min.js",
        "//_sass/vendor:bootstrap",
        ":_plugins",
        "//docs:latest",
        "//docs:releases_html",
    ],
)

pkg_tar(
    name = "html",
    extension = "tar.gz",
    deps = [":website", "//docs:latest"],
    srcs = ["//docs:releases"],
)
