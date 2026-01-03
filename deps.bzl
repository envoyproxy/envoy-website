"""Non-module dependencies for envoy-website."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
load("//:versions.bzl", "VERSIONS")

def _non_module_dependencies_impl(_ctx):
    """Load dependencies that cannot be handled by bzlmod."""
    
    # Bootstrap CSS framework - needs custom BUILD file
    bootstrap = VERSIONS["com_github_twbs_bootstrap"]
    http_archive(
        name = "com_github_twbs_bootstrap",
        urls = bootstrap["urls"],
        sha256 = bootstrap["sha256"],
        strip_prefix = bootstrap["strip_prefix"].format(version = bootstrap["version"]),
        build_file = "@envoy-website//bazel:bootstrap.BUILD",
    )
    
    # envoy - for documentation building
    # Using git_repository because MODULE.bazel has local_path_overrides that won't work
    # when used as an external dependency
    envoy = VERSIONS["envoy"]
    git_repository(
        name = "envoy",
        remote = "https://github.com/{repo}".format(repo = envoy["repo"]),
        commit = envoy["version"],
    )
    
    # envoy_archive - contains versioned documentation
    # No MODULE.bazel, so must use git_repository
    envoy_archive = VERSIONS["envoy_archive"]
    git_repository(
        name = "envoy_archive",
        remote = "https://github.com/{repo}".format(repo = envoy_archive["repo"]),
        commit = envoy_archive["version"],
    )

non_module_dependencies = module_extension(
    implementation = _non_module_dependencies_impl,
)
