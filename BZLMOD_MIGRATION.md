# Bzlmod Migration

This repository has been migrated from WORKSPACE-based Bazel to use Bzlmod (MODULE.bazel).

## Overview

Bzlmod is Bazel's modern dependency management system that provides better version resolution,
dependency isolation, and reproducibility compared to the legacy WORKSPACE approach.

## What Changed

### Files Added
- **MODULE.bazel**: Main bzlmod configuration file that declares dependencies and their versions
- **WORKSPACE.bzlmod**: Supplements MODULE.bazel for dependencies that need WORKSPACE mode (envoy, envoy_archive, bootstrap)

### Files Removed
- **WORKSPACE**: Legacy dependency configuration (removed entirely as nothing depends on this repo)
- **archive.bzl**: Moved to WORKSPACE.bzlmod
- **toolchains.bzl**: Toolchain setup now in MODULE.bazel
- **packages.bzl**: Package setup now in MODULE.bazel
- **deps.bzl**: Replaced by WORKSPACE.bzlmod approach

### Files Modified
- **.bazelrc**: Changed `--noenable_bzlmod` to `--enable_bzlmod`
- **versions.bzl**: Still used for version tracking but now consumed by deps.bzl

## Dependencies

### Standard Bzlmod Dependencies

These are declared with `bazel_dep()` in MODULE.bazel:
- `aspect_bazel_lib` - Bazel library with utilities
- `bazel_skylib` - Bazel standard library
- `rules_pkg` - Package rules for creating archives
- `rules_python` - Python rules and toolchain

### Archive Override

- `envoy_toolshed` - Uses `archive_override` since it's not in BCR yet but has a MODULE.bazel

### WORKSPACE.bzlmod Dependencies

These use WORKSPACE.bzlmod because they need to operate in WORKSPACE mode:

- **envoy**: Needs its WORKSPACE to run to load dependencies like zstd. We apply a patch to disable its MODULE.bazel (which has local_path_overrides that don't work as external dependency), forcing it to use WORKSPACE mode.
- **envoy_archive**: Has no MODULE.bazel
- **com_github_twbs_bootstrap**: Needs a custom BUILD file

## Hybrid Approach: MODULE.bazel + WORKSPACE.bzlmod

This migration uses a hybrid approach that's recommended for bzlmod adoption when some dependencies haven't fully migrated:

- **MODULE.bazel**: Handles pure bzlmod dependencies (rules, toolchains, toolshed)
- **WORKSPACE.bzlmod**: Handles dependencies that need WORKSPACE mode (envoy and related repos)

When bzlmod is enabled (`--enable_bzlmod`), Bazel processes both MODULE.bazel and WORKSPACE.bzlmod. This allows:
1. Modern dependency management via bzlmod for compatible dependencies
2. Backward compatibility for dependencies that still require WORKSPACE mode
3. envoy's WORKSPACE can properly load its dependencies (like zstd) without visibility issues

### Patching envoy's MODULE.bazel

When a repository has both WORKSPACE and MODULE.bazel, Bazel in bzlmod mode prefers MODULE.bazel. Since envoy's MODULE.bazel contains `local_path_override` directives that don't work when envoy is used as an external dependency, we apply a patch to disable MODULE.bazel (rename it to MODULE.bazel.disabled). This forces envoy to use its WORKSPACE file, which properly loads all dependencies.

## Python Setup

Python toolchain and pip dependencies are configured using bzlmod extensions:

```python
python = use_extension("@rules_python//python/extensions:python.bzl", "python")
python.toolchain(python_version = "3.10", is_default = True)

pip = use_extension("@rules_python//python/extensions:pip.bzl", "pip")
pip.parse(hub_name = "website_pip3", python_version = "3.10", requirements_lock = "//site:requirements.txt")
```

## Version Management

The `versions.bzl` file continues to be the source of truth for dependency versions. The `deps.bzl`
module extension reads from this file to load dependencies. This maintains compatibility with
existing version update scripts.

## Transitive Dependencies

With bzlmod, transitive dependencies are automatically discovered and resolved. For example:
- `zstd` comes transitively from `envoy`
- Other common dependencies come from `envoy_toolshed`

## Benefits

1. **Simpler dependency management**: No need for complex WORKSPACE macros
2. **Better version resolution**: Bazel handles version conflicts automatically
3. **Faster builds**: Improved caching and dependency resolution
4. **Future-proof**: WORKSPACE is being deprecated in favor of bzlmod
5. **End-of-line repo**: Since nothing builds from this repo, we can use bzlmod without worrying about downstream consumers

## Building

The build process remains the same:

```bash
bazel build //site
```

The only difference is that `--enable_bzlmod` is now set in .bazelrc by default.
