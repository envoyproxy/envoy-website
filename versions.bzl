
VERSIONS = {
    # This should match the version in `.ruby-version`
    # It must also be availble, and preferably the default here:
    #  https://github.com/netlify/build-image/blob/focal/included_software.md
    "ruby": "2.7.2",
    "ruby_bundler": "2.3.11",
    "python": "3.10",
    "com_github_twbs_bootstrap": {
        "type": "github_archive",
        "repo": "twbs/bootstrap",
        "version": "5.1.3",
        "sha256": "55b951db46e1d69b4236494122fe559716a76c4b8a418c11f3fed6abc2d4de3f",
        "url": "https://github.com/{repo}/archive/refs/tags/v{version}.tar.gz",
        "strip_prefix": "bootstrap-{version}",
        "build_file": "@envoy-website//bazel:bootstrap.BUILD",
    },
    "envoy": {
        "type": "github_archive",
        "repo": "envoyproxy/envoy",
        "version": "b5a8ba636ddef18bd3aae687e3fdbea0bafcab47",
        "sha256": "951dd3b6373bf5c8349eb5413c917a445c506795460605ac163711191ff3662e",
        "url": "https://github.com/{repo}/archive//{version}.tar.gz",
        "strip_prefix": "envoy-{version}",
    },
    "bazelruby_rules_ruby": {
        "repo": "bazelruby/rules_ruby",
        "type": "github_archive",
        "version": "e60d0cd0f2100287a93557334c48117839fe4762",
        "sha256": "e1886a644d68ad4936cc7ae0a31aab1b5028cb1f80a365a184b9a24a92bf355b",
        "url": "https://github.com/{repo}/archive/{version}.tar.gz",
        "strip_prefix": "rules_ruby-{version}",
    },
}
