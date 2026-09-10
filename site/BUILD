load("@bazel_skylib//rules:common_settings.bzl", "bool_flag")
load("@envoy_toolshed//website:macros.bzl", "static_website")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

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

genrule(
    name = "docs_with_banner",
    srcs = ["@envoy-docs"],
    outs = ["docs_with_banner.tar.gz"],
    cmd = """
    set -euo pipefail
    WORK_DIR=$$(mktemp -d)
    trap 'rm -rf "$$WORK_DIR"' EXIT

    tar -xzf $(location @envoy-docs) -C "$$WORK_DIR"
    find "$$WORK_DIR" -type f -name '*.html' | while read -r html; do
      if grep -qi '</head>' "$$html"; then
        perl -0pi -e 's#</head>#<link rel="stylesheet" href="/theme/css/docs-banner.css" />\\n<script defer src="/theme/js/docs-banner.js" data-envoy-docs-version="latest"></script>\\n</head>#i' "$$html"
      else
        printf '%s\\n' '<link rel="stylesheet" href="/theme/css/docs-banner.css" />' '<script defer src="/theme/js/docs-banner.js" data-envoy-docs-version="latest"></script>' | cat - "$$html" > "$$html.injected"
        mv "$$html.injected" "$$html"
      fi
    done

    tar -czf $@ -C "$$WORK_DIR" .
    """,
)

pkg_tar(
    name = "docs",
    package_dir = "docs/envoy/latest",
    deps = [":docs_with_banner"],
)

pkg_files(
    name = "docs_versions_json_file",
    srcs = ["//site/data:versions_json"],
    prefix = "docs/envoy",
    visibility = ["//visibility:public"],
)

pkg_tar(
    name = "docs_versions_json",
    srcs = [":docs_versions_json_file"],
)

label_flag(
    name = "docs_latest",
    build_setting_default = ":docs",
    visibility = ["//visibility:public"],
)

bool_flag(
    name = "no_docs_latest",
    build_setting_default = False,
)

config_setting(
    name = "disable_docs_latest",
    flag_values = {":no_docs_latest": "True"},
)

static_website(
    name = "site",
    compressor = "@zstd//:zstd_cli",
    compressor_args = "-T0",
    content = "//site/content",
    data = "//site/data",
    extension = "tar.zst",
    theme = "//site/theme",
    deps = [":docs_versions_json"] + select({
        ":disable_docs_latest": [],
        "//conditions:default": [":docs_latest"],
    }),
)
