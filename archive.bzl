load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
load("//:versions.bzl", "VERSIONS")

def load_github_archives():
    for k, v in VERSIONS.items():
        if type(v) == type("") or v.get("type") != "github_archive":
            continue
        http_archive(
            name = k,
            sha256 = v["sha"],
            strip_prefix = v.get("strip_prefix", "").format(name=k, **v),
            url = v["url_tpl"].format(name=k, **v),
        )

def load_archives():
    git_repository(
        name = "bazelruby_rules_ruby",
        remote = "https://github.com/bazelruby/rules_ruby.git",
        branch = "master"
    )
    load_github_archives()
