#!/usr/bin/env python3

import shutil
import subprocess
import tarfile


def main():
    try:
        tarfile.open("_sass/vendor/bootstrap.tar.gz").extractall()
        tarfile.open("docs/latest.tar.gz").extractall()
        subprocess.run(["external/jekyll_bundle/bin/jekyll", "serve", "-H", "0.0.0.0", "--watch", "--incremental", "-p", "site/jekyll_plugins"])
    finally:
        shutil.rmtree("docs/envoy/latest")


if __name__ == "__main__":
    main()
