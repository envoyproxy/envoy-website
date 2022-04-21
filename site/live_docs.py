#!/usr/bin/env python3

import os
import shutil
import subprocess
import tarfile


def main():
    try:
        tarfile.open("docs/latest.tar.gz").extractall()
        if os.path.exists("_sass/vendor/bootstrap"):
            shutil.rmtree("_sass/vendor/bootstrap")
        shutil.copytree("external/com_github_twbs_bootstrap/scss", "_sass/vendor/bootstrap")
        if not os.path.exists("assets/js"):
            os.makedirs("assets/js")
        shutil.copy("external/com_github_twbs_bootstrap/dist/js/bootstrap.bundle.min.js", "assets/js/bootstrap.bundle.min.js")
        subprocess.run(["external/jekyll_bundle/bin/jekyll", "serve", "-H", "0.0.0.0", "--watch", "--incremental", "-p", "site/jekyll_plugins"])
    finally:
        shutil.rmtree("docs/envoy/latest")


if __name__ == "__main__":
    main()
