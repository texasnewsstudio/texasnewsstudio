#!/usr/bin/env python3
"""Generate the public TNS sitemap from published HTML pages.

Run from repository root. No third-party dependencies.
"""
from pathlib import Path
from datetime import date
from xml.etree.ElementTree import Element, SubElement, ElementTree, register_namespace
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://texasnewsstudio.com"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
register_namespace("", NS)

EXCLUDE = re.compile(r"(?:^|[-_/])(draft|template|backup|test)(?:[-_/.]|$)", re.I)

def published_date(filename):
    patterns = [
        r"(?:nov|november)[-_]?(\d{1,2})[-_]?2026",
        r"2026[-_]11[-_](\d{1,2})",
        r"(?:oct|october)[-_]?(\d{1,2})[-_]?2026",
        r"2026[-_]10[-_](\d{1,2})",
    ]
    for idx, pattern in enumerate(patterns):
        match = re.search(pattern, filename, re.I)
        if match:
            day = int(match.group(1))
            month = 11 if idx < 2 else 10
            try:
                return date(2026, month, day).isoformat()
            except ValueError:
                pass
    return None

def main():
    root = Element(f"{{{NS}}}urlset")
    pages = sorted(p for p in ROOT.glob("*.html") if p.is_file() and not EXCLUDE.search(p.name))
    def add(url, modified=None):
        item = SubElement(root, f"{{{NS}}}url")
        SubElement(item, f"{{{NS}}}loc").text = url
        if modified:
            SubElement(item, f"{{{NS}}}lastmod").text = modified
    add(BASE + "/")
    for page in pages:
        if page.name == "index.html":
            continue
        # Use reliable dates only. Avoid falsely telling Google all pages changed today.
        add(BASE + "/" + page.name, published_date(page.name))
    from xml.dom import minidom
    from xml.etree.ElementTree import tostring
    raw = tostring(root, encoding="utf-8", xml_declaration=True)
    output = minidom.parseString(raw).toprettyxml(indent="  ", encoding="UTF-8")
    (ROOT / "sitemap.xml").write_bytes(output)
    print(f"Generated sitemap.xml: {len(pages)} HTML files plus homepage")

if __name__ == "__main__":
    main()
