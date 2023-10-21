load("@envoy_toolshed//dependency:macros.bzl", "updater")

updater(
    name = "update",
    dependencies = "//:dependency_versions",
    version_file = "//:versions.bzl",
    # url_selector = ".__DEP__.urls[0]",
    # update_script = ":bazel-update.sh",
)
