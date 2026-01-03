"""Non-module dependencies for envoy-website."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

def _non_module_dependencies_impl(_ctx):
    """Load dependencies that cannot be handled by bzlmod."""
    
    # Bootstrap CSS framework - needs custom BUILD file
    http_archive(
        name = "com_github_twbs_bootstrap",
        urls = ["https://github.com/twbs/bootstrap/archive/refs/tags/v5.3.8.tar.gz"],
        sha256 = "e48d2bb45df830b6f70e2fb5a592f07f8f892dcbd3eb33245a48593cc59aa6dd",
        strip_prefix = "bootstrap-5.3.8",
        build_file = "@envoy-website//bazel:bootstrap.BUILD",
    )
    
    # envoy - for documentation building
    # Using git_repository because MODULE.bazel has local_path_overrides that won't work
    # when used as an external dependency
    git_repository(
        name = "envoy",
        remote = "https://github.com/envoyproxy/envoy",
        commit = "41b468c9b193c88ded4d94789c4793f02be5f758",
    )
    
    # envoy_archive - contains versioned documentation
    # No MODULE.bazel, so must use git_repository
    git_repository(
        name = "envoy_archive",
        remote = "https://github.com/envoyproxy/archive",
        commit = "ddccb5ed1d3ab450c41dd7846a532203edf92c64",
    )

non_module_dependencies = module_extension(
    implementation = _non_module_dependencies_impl,
)
