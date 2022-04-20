
VERSIONS = {
    # This should match the version in `.ruby-version`
    # It must also be availble, and preferably the default here:
    #  https://github.com/netlify/build-image/blob/focal/included_software.md
    "ruby": "2.7.2",
    "ruby_bundler": "2.3.11",
    "python": "3.10",
    "rules_python": {
        "repo": "bazelbuild/rules_pkg",
        "type": "github_archive",
        "version": "ae9f24ff7cd208af1b895c7509762caaf3b651e0",
        "sha": "2a5cf996de8d5f6b736005b09a31f774242dd7506bcc1a5ec256946a825d175c",
        "url": "https://github.com/{repo}",
        "strip_prefix": "{name}-{version}",
        "url_tpl": "{url}/archive/{version}.tar.gz",
    },
    "rules_pkg": {
        "repo": "bazelbuild/rules_pkg",
        "type": "github_archive",
        "version": "0.6.0",
        "sha": "62eeb544ff1ef41d786e329e1536c1d541bb9bcad27ae984d57f18f314018e66",
        "url": "https://github.com/{repo}",
        "url_tpl": "{url}/releases/download/{version}/{name}-{version}.tar.gz",
    },
    "bootstrap": {
        "type": "assets",
        "version": "5.1.3",
    }
}
