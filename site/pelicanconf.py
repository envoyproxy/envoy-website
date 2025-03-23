
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
PAGE_PATHS = ["pages"]
PAGE_SAVE_AS = "{slug}/index.html"
PLUGINS = ["pelican.plugins.webassets"]
SITENAME = "Envoy proxy"
SITEURL = "https://www.envoyproxy.io"
STATIC_PATHS = [
    "images",
    "assets",
]
TEMPLATE_PAGES = {
    "pages/docs.html": "docs.html"}
THEME = "theme"
TIMEZONE = "Europe/London"

PROJECTS = {}
SITE = {}


def nested_dict(d, keys):
    for key in keys:
        d = d.setdefault(key, {})
    return d


for yaml_file in pathlib.Path("data").glob("**/*.yaml"):
    *dirs, filename = yaml_file.parts[1:]
    if not dirs:
        SITE[yaml_file.stem] = yaml.safe_load(yaml_file.read_text())
        continue
    nested_dict(PROJECTS, dirs)[yaml_file.stem] = yaml.safe_load(yaml_file.read_text())

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

# JINJA2CONTENT_TEMPLATES = "theme/templates"

WEBASSETS_BUNDLES = (
    ('envoy_css', ['css/main.scss'],
     {'filters': 'libsass',
      'output': 'css/main.css',
      'debug': True}),
)

WEBASSETS_CONFIG = [
    ("auto_build", True),
    ("clean_output", True),
    ("url_expire", False),
]
