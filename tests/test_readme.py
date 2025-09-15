"""
README integrity tests.

Test framework: pytest (detected via tests/ layout and Python test naming).
These tests validate critical content added/changed in the README, including:
- Section anchors and headings
- Table of Contents links
- Local image assets and alt text
- External link format for the Engineer Guide
- Contact table email validity
- Core features list and important phrases
"""

from __future__ import annotations

import re
from pathlib import Path
import pytest


def _read_readme() -> tuple[Path, str]:
    root = Path(__file__).resolve().parents[1]
    for name in ("README.md", "Readme.md", "README.MD", "README"):
        p = root / name
        if p.exists():
            return p, p.read_text(encoding="utf-8", errors="ignore")
    pytest.skip("README not found at repository root; skipping README validation tests.")


def _img_tags(markdown_text: str) -> list[tuple[str, str]]:
    """
    Extract (src, alt) from HTML <img ...> tags.
    """
    img_re = re.compile(
        r'<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>',
        flags=re.IGNORECASE,
    )
    return img_re.findall(markdown_text)


def _anchor_ids(markdown_text: str) -> set[str]:
    # Matches: <a id="core-features"></a>
    return set(
        re.findall(r'<a\s+id="([^"]+)">\s*</a>', markdown_text, flags=re.IGNORECASE)
    )


def _toc_ids(markdown_text: str) -> set[str]:
    # Matches href="#core-features" etc inside the Table of Contents
    return set(re.findall(r'href="#([^"]+)"', markdown_text, flags=re.IGNORECASE))


def _markdown_links(markdown_text: str) -> list[tuple[str, str]]:
    # Basic [text](url) extractor
    return re.findall(r'\[([^\]]+)\]\(([^)]+)\)', markdown_text)


def test_title_and_intro_present():
    readme_path, text = _read_readme()
    first_lines = [ln.strip() for ln in text.splitlines()[:10]]
    assert any("NeedyMeds DDC Mobile App" in ln for ln in first_lines), (
        "Missing or incorrect H1 title for the app."
    )
    # Key facts in the intro paragraph
    assert "80%" in text, "Intro should mention 'up to 80%' savings."
    assert "65,000" in text, "Intro should mention '65,000 pharmacies' figure."


def test_sections_and_toc_anchors_consistent():
    _, text = _read_readme()
    required_ids = {"core-features", "system-design", "engineer-guide", "contact"}

    anchors = _anchor_ids(text)
    toc = _toc_ids(text)

    missing_in_toc = required_ids - toc
    missing_anchors = required_ids - anchors

    assert not missing_in_toc, f"TOC is missing anchors: {sorted(missing_in_toc)}"
    assert not missing_anchors, f"Section anchors missing: {sorted(missing_anchors)}"

    # Verify visible section headings exist
    for label in ("Core Features", "System Design", "Engineer Guide", "Contact"):
        assert re.search(rf"^\s*##\s+.*{re.escape(label)}", text, flags=re.MULTILINE), (
            f"Missing expected section heading: {label}"
        )

    # Ensure the <details><summary> Table of Contents structure is present
    assert "<details>" in text and "</details>" in text, "Missing <details> wrapper."
    assert re.search(
        r"<summary>\s*Table of Contents\s*</summary>", text, flags=re.IGNORECASE
    ), "Missing or malformed Table of Contents <summary>."


def test_core_features_items_present_and_count():
    _, text = _read_readme()
    items = [
        "Medication Lookup",
        "Digital DDC Card",
        "Pharmacy Locator",
        "Educational Resources",
    ]
    for item in items:
        assert item in text, f"Missing core feature item: {item}"

    # Count list items rendered in HTML within the features list
    li_count = len(re.findall(r"<li>\s*<b>", text))
    assert li_count >= 4, f"Expected at least 4 core feature items, found {li_count}."

    # Specific phrasing check from the diff
    assert re.search(r"updated\s+weekly", text, flags=re.IGNORECASE), (
        "Pharmacy Locator item should mention being 'updated weekly'."
    )


def test_images_exist_have_alt_text_and_use_relative_paths():
    readme_path, text = _read_readme()
    tags = _img_tags(text)
    assert tags, "No <img> tags found in README."

    for src, alt in tags:
        assert alt.strip(), f"Image '{src}' should have non-empty alt text."
        # Ensure images are local relative assets (not remote URLs)
        assert not re.match(r"^[a-zA-Z]+://", src), (
            f"Image should use a local relative path, got URL: {src}"
        )
        img_path = (readme_path.parent / src).resolve()
        assert img_path.exists(), f"Referenced image file not found: {img_path}"


def test_engineer_guide_link_is_secure_google_doc():
    _, text = _read_readme()
    links = _markdown_links(text)
    guide_links = [url for label, url in links if "Engineer Guide" in label]
    assert guide_links, "Engineer Guide link not found."
    url = guide_links[0]
    assert url.startswith("https://"), "Engineer Guide link must use HTTPS."
    assert "docs.google.com/document" in url, (
        "Engineer Guide link should be a Google Docs document."
    )
    assert "/document/d/" in url and "/edit" in url, (
        "Engineer Guide link does not appear to be a canonical Google Docs URL."
    )


def test_contact_table_contains_valid_emails():
    _, text = _read_readme()
    # Focus on the Contact section body to avoid false positives elsewhere
    contact_split = re.split(r"^\s*##\s+.*Contact.*$", text, maxsplit=1, flags=re.MULTILINE)
    assert len(contact_split) == 2, "Contact section not found."
    contact_body = contact_split[1]

    # Extract emails in the markdown table
    emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", contact_body)
    assert emails, "No email addresses found in Contact table."

    email_re = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
    for e in emails:
        assert email_re.match(e), f"Invalid email format detected: {e}"