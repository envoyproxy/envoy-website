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

- **envoy**: We apply a patch to fix its MODULE.bazel by removing `local_path_override` directives that don't work as external dependency. The patched MODULE.bazel properly declares dependencies like zstd.
- **envoy_archive**: Has no MODULE.bazel
- **com_github_twbs_bootstrap**: Needs a custom BUILD file

## Hybrid Approach: MODULE.bazel + WORKSPACE.bzlmod

This migration uses a hybrid approach that's recommended for bzlmod adoption when some dependencies haven't fully migrated:

- **MODULE.bazel**: Handles pure bzlmod dependencies (rules, toolchains, toolshed, and dependencies required by WORKSPACE.bzlmod repositories like zstd)
- **WORKSPACE.bzlmod**: Handles repositories that need WORKSPACE mode loading (envoy and related repos)

When bzlmod is enabled (`--enable_bzlmod`), Bazel processes both MODULE.bazel and WORKSPACE.bzlmod. This allows:
1. Modern dependency management via bzlmod for compatible dependencies
2. Backward compatibility for dependencies that still require WORKSPACE mode
3. Dependencies declared in MODULE.bazel are visible to repositories loaded via WORKSPACE.bzlmod

### Important: WORKSPACE.bzlmod repositories ignore MODULE.bazel

When a repository is loaded via `http_archive` in WORKSPACE.bzlmod, Bazel treats it as a WORKSPACE-mode repository. Even if that repository has a MODULE.bazel file (like envoy does), the MODULE.bazel is **ignored** and only the WORKSPACE file is processed.

However, in bzlmod mode, WORKSPACE files cannot load dependencies using traditional repository rules - those dependencies must be declared in the main MODULE.bazel. This is why we declare zstd in our MODULE.bazel even though envoy's MODULE.bazel also declares it.

### Patching envoy's MODULE.bazel

Envoy's MODULE.bazel contains `local_path_override` directives for envoy_api, envoy_build_config, and envoy_mobile. These directives reference local paths within the envoy repository (like `path = "api"`) which don't work when envoy is used as an external dependency.

We apply a patch that removes these `local_path_override` directives while keeping the rest of MODULE.bazel intact. Although envoy's MODULE.bazel is currently ignored (because envoy is loaded via WORKSPACE.bzlmod), having a clean MODULE.bazel is good practice and may be useful in the future if envoy can be loaded in pure bzlmod mode.

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
