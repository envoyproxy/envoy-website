load("@python3//:defs.bzl", "interpreter")
load("@rules_python//python:pip.bzl", "pip_parse")
load("//:versions.bzl", "VERSIONS")

def load_packages():
    # Python pipsets
    pip_parse(
        name = "site_pip3",
        requirements_lock = "@envoy-website//site:requirements.txt",
        extra_pip_args = ["--require-hashes"],
        python_interpreter_target = interpreter,
    )
