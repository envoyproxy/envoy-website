#!/usr/bin/env python3
"""Regenerate the Envoy `archive_override`s in MODULE.bazel from versions.bzl.

MODULE.bazel cannot `load()` `//:versions.bzl`, so the Envoy pin is generated
into MODULE.bazel from `versions.bzl`, which remains the single source of truth
and is updated by `//bazel:update`.
"""

import ast
import base64
import pathlib
import re
import sys

BEGIN = "# BEGIN: generated from //:versions.bzl"
END = "# END: generated from //:versions.bzl"

OVERRIDE = """archive_override(
    module_name = "{module_name}",
    integrity = "{integrity}",
    strip_prefix = "{strip_prefix}",
    urls = ["{url}"],
)"""

# Modules sourced from the Envoy tarball, and their paths within it.
MODULES = (
    ("envoy", ""),
    ("envoy_api", "/api"),
    ("envoy-docs", "/docs"),
)

ROOT = pathlib.Path(__file__).parents[1]


def versions(path: pathlib.Path) -> dict:
    source = path.read_text()
    return ast.literal_eval(source[source.index("{"):])


def overrides(envoy: dict) -> str:
    integrity = "sha256-%s" % base64.b64encode(
        bytes.fromhex(envoy["sha256"])).decode()
    url = envoy["urls"][0].format(**envoy)
    prefix = envoy["strip_prefix"].format(**envoy)
    return "\n\n".join(
        OVERRIDE.format(
            module_name=module_name,
            integrity=integrity,
            strip_prefix=f"{prefix}{path}",
            url=url)
        for module_name, path in MODULES)


def main() -> int:
    module_path = ROOT / "MODULE.bazel"
    envoy = versions(ROOT / "versions.bzl")["envoy"]
    module = module_path.read_text()
    if BEGIN not in module or END not in module:
        raise SystemExit(f"Unable to find generated section in {module_path}")
    updated = re.sub(
        f"{re.escape(BEGIN)}.*{re.escape(END)}",
        f"{BEGIN}\n\n{overrides(envoy)}\n\n{END}",
        module,
        flags=re.DOTALL)
    if updated == module:
        return 0
    module_path.write_text(updated)
    return 0


if __name__ == "__main__":
    sys.exit(main())
