#!/usr/bin/env python3
"""Render a site's link preview (favicon, title, description, image) into README.md.

The README holds a pair of markers; the first names the URL to preview:

    <!-- link-preview https://example.com/ -->
    <!-- /link-preview -->

Running this script fetches that URL, reads its meta tags the way an unfurler
(Slack, iMessage, metatags.io) would, and rewrites everything between the
markers. It reads the live site, so run it after a deploy.

    python3 scripts/readme-preview.py            # rewrite README.md
    python3 scripts/readme-preview.py --check    # exit 1 if README.md is stale

Standard library only, so it can be copied into any repo as is.
"""

import argparse
import html
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

START = re.compile(r"<!-- link-preview (\S+) -->\n")
END = "<!-- /link-preview -->"
IMAGE_WIDTH = 400  # About the size Slack shows a summary_large_image card.


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.icons = []
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = {k: v or "" for k, v in attrs}
        if tag == "meta":
            key = a.get("property") or a.get("name")
            if key and "content" in a:
                self.meta.setdefault(key.lower(), a["content"])
        elif tag == "link" and "icon" in a.get("rel", "").lower().split():
            self.icons.append(a)
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def icon_score(link):
    """Prefer the largest raster icon, then SVG, then anything else (usually .ico)."""
    sizes = [int(s.split("x")[0]) for s in link.get("sizes", "").split() if "x" in s]
    if sizes and not link.get("href", "").endswith(".ico"):
        return 2, max(sizes)
    if link.get("type") == "image/svg+xml" or link.get("href", "").endswith(".svg"):
        return 1, 0
    return 0, max(sizes, default=0)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "readme-preview/1"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.geturl(), resp.read().decode(resp.headers.get_content_charset() or "utf-8")


def preview(url):
    final_url, body = fetch(url)
    p = HeadParser()
    p.feed(body)
    m = p.meta

    page = m.get("og:url") or final_url
    title = m.get("og:title") or m.get("twitter:title") or p.title.strip()
    site = m.get("og:site_name") or title
    desc = m.get("og:description") or m.get("twitter:description") or m.get("description", "")
    image = m.get("og:image") or m.get("twitter:image")
    alt = m.get("og:image:alt") or m.get("twitter:image:alt") or title
    icon = max(p.icons, key=icon_score)["href"] if p.icons else "/favicon.ico"

    def esc(s):
        return html.escape(s.strip(), quote=True)

    lines = [
        f'> <a href="{page}"><img src="{esc(urljoin(final_url, icon))}" width="16" height="16"'
        f' alt=""></a> {esc(site)}',
        ">",
        f"> **[{esc(title)}]({page})**",
    ]
    if desc:
        lines += [">", f"> {esc(desc)}"]
    if image:
        lines += [
            ">",
            f'> <a href="{page}"><img src="{esc(urljoin(final_url, image))}"'
            f' width="{IMAGE_WIDTH}" alt="{esc(alt)}"></a>',
        ]
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--check", action="store_true", help="exit 1 if README.md is stale")
    ap.add_argument("--readme", default="README.md")
    args = ap.parse_args()

    readme = Path(args.readme)
    text = readme.read_text()
    start = START.search(text)
    end = text.find(END, start.end()) if start else -1
    if not start or end == -1:
        sys.exit(f"{readme}: no '<!-- link-preview URL -->' ... '{END}' block")

    updated = text[: start.end()] + preview(start.group(1)) + text[end:]
    if args.check:
        if updated != text:
            sys.exit(f"{readme}: link preview is stale; run {sys.argv[0]}")
        return
    if updated != text:
        readme.write_text(updated)
        print(f"{readme}: link preview updated")


if __name__ == "__main__":
    main()
