#!/usr/bin/env python3

import subprocess
import tarfile


def main():
    tarfile.open("_sass/vendor/bootstrap.tar.gz").extractall()
    subprocess.run(["external/jekyll_bundle/bin/jekyll", "serve", "-H", "0.0.0.0", "--watch", "--incremental", "-p", "site/jekyll_plugins"])


if __name__ == "__main__":
    main()
