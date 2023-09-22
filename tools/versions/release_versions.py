
import pathlib
import sys

from packaging import version

import yaml


def main(paths):
    """Release versions derived from directory names in `envoy/docs`.

    Currently this determines stable <> archived based on the last
    4 minor versions being stable. We may want to rethink this.
    """

    # Read the versions from the directory names
    versions = [
        version.Version(pathlib.Path(p).parent.name)
        for p
        in paths
        if p]

    # Group versions into minor versions
    minor_versions = {}
    for v in versions:
        minor = version.Version(f"{v.major}.{v.minor}")
        minor_versions[minor] = minor_versions.get(minor, [])
        minor_versions[minor].append(v)

    # Sort the minor version keys
    sorted_minor_versions = list(reversed(sorted(minor_versions)))

    # Dump the YAML
    print(yaml.dump([
        dict(title="Stable versions",
             versions=[
                 dict(version=v.base_version,
                      releases=[
                          _v.base_version
                          for _v
                          in reversed(sorted(minor_versions[v]))])
                 for v
                 in sorted_minor_versions[:4]]),
        dict(
            title="Development version",
            versions=[dict(version="Latest")]),
        dict(title="Archived versions",
             versions=[
                 dict(version=v.base_version,
                      releases=[
                          _v.base_version
                          for _v
                          in reversed(sorted(minor_versions[v]))])
                 for v
                 in sorted_minor_versions[4:]])]))


if __name__ == "__main__":
    main(sys.argv[1:])
