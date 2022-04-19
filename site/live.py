#!/usr/bin/env python3

import subprocess


def main():
    subprocess.run(["external/jekyll_bundle/bin/jekyll", "serve", "--watch", "--incremental", "-p", "site/jekyll_plugins"])


if __name__ == "__main__":
    main()
