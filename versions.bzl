
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
    "rules_python": {
        "type": "github_archive",
        "repo": "bazelbuild/rules_python",
        "version": "ae9f24ff7cd208af1b895c7509762caaf3b651e0",
        "sha256": "2a5cf996de8d5f6b736005b09a31f774242dd7506bcc1a5ec256946a825d175c",
        "url": "https://github.com/{repo}/archive/{version}.tar.gz",
        "strip_prefix": "{name}-{version}",
    },
    "rules_pkg": {
        "repo": "bazelbuild/rules_pkg",
        "type": "github_archive",
        "version": "0.6.0",
        "sha256": "62eeb544ff1ef41d786e329e1536c1d541bb9bcad27ae984d57f18f314018e66",
        "url": "https://github.com/{repo}/releases/download/{version}/{name}-{version}.tar.gz",
    },
    "bazelruby_rules_ruby": {
        "repo": "bazelruby/rules_ruby",
        "type": "github_archive",
        "version": "65d828b204ec32a49458c9b770f8db20774ac450",
        "sha256": "a598fadf23c0d8376813ca4a1b4a45f778544d83bf650b24dcfc2210f6db7d5f",
        "url": "https://github.com/{repo}/archive/{version}.tar.gz",
        "strip_prefix": "rules_ruby-{version}",
    },
}
