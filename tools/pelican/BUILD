load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@envoy_toolshed//py:macros.bzl", "entry_point")
load("@site_pip3//:requirements.bzl", "requirement", pip_entry_point = "entry_point")

entry_point(
    name = "pelican",
    pkg = "pelican",
    deps = [
        requirement("cssmin"),
        requirement("libsass"),
        requirement("pelican-webassets"),
        requirement("packaging"),
        requirement("pyyaml"),
    ],
    entry_point_alias = pip_entry_point,
    visibility = ["//visibility:public"],
)

alias(
    name = "pelican-quickstart",
    actual = pip_entry_point(
        pkg = "pelican",
        script = "pelican-quickstart",
    ),
)

alias(
    name = "pelican-themes",
    actual = pip_entry_point(
        pkg = "pelican",
        script = "pelican-themes",
    ),
)
