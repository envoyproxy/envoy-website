
import pathlib
from datetime import datetime
from itertools import chain

from packaging import version as _version

import yaml


AUTHOR = "Envoy maintainers <envoy-maintainers@googlegroups.com>"
DEFAULT_LANG = "en"
EXTRA_PATH_METADATA = {
    "assets/robots.txt": {"path": "robots.txt"},
    "assets/favicon.ico": {"path": "favicon.ico"},
    "assets/404": {"path": "404.html"},
    "assets/google7933de1bd04e097b": {"path": "google7933de1bd04e097b.html"},
    "assets/google95e577d28834e13d": {"path": "google95e577d28834e13d.html"},
}
FILENAME_METADATA = r"(?P<title>.*)"
NOW = datetime.now()
PATH = "content"
PLUGINS = ["pelican.plugins.webassets"]
SITENAME = "Envoy proxy"
# SITEURL = "www.envoyproxy.io"
STATIC_PATHS = [
    "images",
    "assets",
]
TEMPLATE_PAGES = {
    "pages/community.html": "community.html",
    "pages/docs.html": "docs.html",
    "pages/training.html": "training.html"}
THEME = "theme"
TIMEZONE = "Europe/London"

for yaml_file in pathlib.Path("data").glob("*.yaml"):
    locals()[yaml_file.stem.upper()] = yaml.safe_load(yaml_file.read_text())

LATEST_VERSION = max(
    chain.from_iterable(
        version["releases"]
        for version
        in yaml.safe_load(
            pathlib.Path("data/versions.yaml").read_text())[0]["versions"]),
    key=lambda release: _version.Version(release))

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
DEFAULT_PAGINATION = False
