load("@bazel_skylib//rules:common_settings.bzl", "BuildSettingInfo")

# Outputs that must be regenerated on every build and never cached or run
# remotely (bucket listings, timestamps, and anything derived from them).
_NO_CACHE_TAGS = ["no-cache", "no-remote", "local", "external"]

_NETWORK_TAGS = ["requires-network"] + _NO_CACHE_TAGS

def _string_flag_value_impl(ctx):
    ctx.actions.write(ctx.outputs.out, ctx.attr.flag[BuildSettingInfo].value + "\n")

string_flag_value = rule(
    implementation = _string_flag_value_impl,
    attrs = {
        "flag": attr.label(mandatory = True),
    },
    outputs = {"out": "%{name}.txt"},
)

def archive_rclone_genrule(name, outs, cmd, srcs = [], **kwargs):
    """Network rclone genrule using archive/meta bucket string_flag values.

    Native genrule actions cannot read build settings as Make variables directly,
    so the flags are materialized as tiny input files and exported as shell
    variables for the command body.
    """
    native.genrule(
        name = name,
        srcs = srcs + [
            ":archive_bucket_value",
            ":meta_bucket_value",
        ],
        outs = outs,
        cmd = """
set -euo pipefail
export RCLONE_CONFIG_GCS_TYPE="google cloud storage"
export RCLONE_CONFIG_GCS_ANONYMOUS=true
ARCHIVE_BUCKET="$$(cat $(location :archive_bucket_value))"
META_BUCKET="$$(cat $(location :meta_bucket_value))"
RCLONE="$(location @rclone//:rclone)"
%s
""" % cmd,
        tags = _NETWORK_TAGS,
        tools = ["@rclone//:rclone"],
        **kwargs
    )

def archive_no_cache_genrule(name, outs, cmd, srcs = [], tools = [], **kwargs):
    native.genrule(
        name = name,
        srcs = srcs,
        outs = outs,
        cmd = """
set -euo pipefail
%s
""" % cmd,
        tags = _NO_CACHE_TAGS,
        tools = tools,
        **kwargs
    )
