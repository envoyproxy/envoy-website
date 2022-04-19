load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@rules_pkg//:mappings.bzl", "pkg_files")
load("@docs_pip3//:requirements.bzl", "entry_point", "requirement")
load("@rules_python//python:defs.bzl", "py_binary")

exports_files([
    "requirements.txt",
])

filegroup(
    name = "releases_html",
    srcs = ["envoy"],
)

alias(
    name = "sphinx_runner",
    actual = entry_point("envoy.docs.sphinx_runner"),
)

py_binary(
    name = "fetch_rst",
    srcs = ["fetch_rst.py"],
    deps = [requirement("aiohttp")],
)

sh_binary(
    name = "version_for_commit",
    srcs = ["version_for_commit.sh"],
)

sh_binary(
    name = "latest_version",
    srcs = ["latest_version.sh"],
)

genrule(
    name = "latest_html",
    cmd = """
    TMPDIR=$$(mktemp -d) \
    && $(location :fetch_rst) $$ENVOY_COMMIT $${TMPDIR}/rst.tar.gz \
    && VERSION=$$($(location :version_for_commit) $$ENVOY_COMMIT) \
    && $(location :sphinx_runner) \
         --build_sha="$${ENVOY_COMMIT}" \
         --version="$${VERSION}" \
         --overwrite \
         $${TMPDIR}/rst.tar.gz \
         $${TMPDIR}/html \
    && tar zcfh $@ -C $${TMPDIR}/html . \
    && rm -rf $${TMPDIR}
    """,
    outs = ["latest_html.tar.gz"],
    tools = [
        ":sphinx_runner",
        ":version_for_commit",
        ":fetch_rst",
    ],
)

pkg_tar(
    name = "latest",
    extension = "tar.gz",
    deps = [":latest_html"],
    package_dir = "/docs/envoy/latest",
    visibility = ["//visibility:public"],
)

pkg_files(
    name = "releases",
    srcs = [":releases_html"],
    prefix = "docs",
    visibility = ["//visibility:public"],
)
