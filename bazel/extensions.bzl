load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//:versions.bzl", "VERSIONS")

# Repositories that are not (yet) available as Bazel modules.
#
# `versions.bzl` remains the single source of truth for their versions/shas, and
# is updated by `//bazel:update`.
ARCHIVES = [
    "com_github_twbs_bootstrap",
    "envoy_archive",
]

def _archive_kwargs(name):
    # Values are `.format`ed with the archive's own settings (eg `{repo}`,
    # `{version}`) - `patch*` values are labels/args and are used verbatim, and
    # `repo`/`type`/`version` are settings for `versions.bzl`, not http_archive.
    version = VERSIONS[name]
    kwargs = dict(name = name, **version)
    return {
        k: (
            (v.format(**kwargs) if not k.startswith("patch") else v)
            if type(v) == "string"
            else [
                _v.format(**kwargs) if not k.startswith("patch") else _v
                for _v in v
            ]
        )
        for k, v in kwargs.items()
        if k not in ["repo", "type", "version"]
    }

def _website_archives_impl(module_ctx):
    for name in ARCHIVES:
        http_archive(**_archive_kwargs(name))
    return module_ctx.extension_metadata(reproducible = True)

website_archives = module_extension(
    implementation = _website_archives_impl,
)
