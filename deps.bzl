"""Non-module dependencies for envoy-website."""

load("//:versions.bzl", "VERSIONS")

def _non_module_dependencies_impl(ctx):
    """Load dependencies that cannot be handled by bzlmod."""
    
    # Get http_archive and git_repository from bazel_tools
    http_archive = use_repo_rule("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
    git_repository = use_repo_rule("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
    
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
    # Note: envoy is loaded with its WORKSPACE, which will load all its dependencies
    # including zstd. We use http_archive instead of git_repository for better caching.
    envoy = VERSIONS["envoy"]
    http_archive(
        name = "envoy",
        urls = envoy["urls"],
        sha256 = envoy["sha256"],
        strip_prefix = envoy["strip_prefix"].format(version = envoy["version"]),
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
