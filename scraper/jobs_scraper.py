#!/usr/bin/env python3
"""
Simple Jobs.ps scraper using cloudscraper (handles Cloudflare challenges).

Collects only:
  - title
  - location
  - url

Usage:
  python jobs_scraper.py
  python jobs_scraper.py --start-page 1 --end-page 5
"""

import argparse
import json
import os
import time
import xml.etree.ElementTree as ET
from html import unescape
from urllib.parse import urljoin

import cloudscraper
from bs4 import BeautifulSoup

SITE_ROOT = "https://www.jobs.ps"
BASE_URL = "https://www.jobs.ps/en/jobs?page={page}"
RSS_URL = "https://www.jobs.ps/en/rss/jobs"
JINA_PREFIX = "https://r.jina.ai/http://"
ALLOWED_SOURCES = {"auto", "html", "rss"}
DELAY_BETWEEN_PAGES = 3
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def build_headers():
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.jobs.ps/en/jobs",
    }


def extract_location_from_description(description):
    if not description:
        return ""

    text = BeautifulSoup(description, "html.parser").get_text(" ", strip=True)
    text = unescape(text)

    dash_tokens = [" - ", " \u2013 ", " \u2014 "]
    for token in dash_tokens:
        if token in text:
            after = text.split(token, 1)[1].strip()
            stop_markers = [
                " | ",
                " Start:",
                " Duration:",
                " Fixed",
                " Full",
                " Part",
                " Temporary",
                " Contract",
                " Type",
                " Duty",
            ]
            cut_indexes = [after.find(marker) for marker in stop_markers if after.find(marker) != -1]
            if cut_indexes:
                after = after[:min(cut_indexes)].strip()
            after = after.strip(" -|")
            after = after.strip("\u2013\u2014")
            return after

    return ""



def make_scraper():
    """Create a cloudscraper session that solves Cloudflare JS challenges."""
    return cloudscraper.create_scraper(
        browser={
            "browser": "chrome",
            "platform": "windows",
            "mobile": False,
        },
        delay=10,           # seconds to wait before solving the CF challenge
    )


def scrape_listing_page(scraper, page_number):
    """Scrape a single listing page."""
    url = BASE_URL.format(page=page_number)
    print(f"\n{'='*60}")
    print(f"Scraping page {page_number}: {url}")

    headers = build_headers()

    try:
        response = scraper.get(url, timeout=60, headers=headers)
        print(f"HTTP status: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Request failed on page {page_number}: {e}")
        return []

    html = response.text

    # Debug: first 2000 chars
    print(f"[DEBUG] HTML snippet:\n{html[:2000]}\n{'='*60}")

    if response.status_code != 200:
        print(f"[ERROR] Non-200 status: {response.status_code}")
        return []

    # Check if still blocked
    if "just a moment" in html.lower() or "cf-browser-verification" in html.lower():
        print(f"[BLOCKED] Cloudflare challenge not solved on page {page_number}.")
        return []

    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select("a.list-3--row, a.list-3--title")
    print(f"Found {len(cards)} job cards on page {page_number}")

    if not cards:
        print("[DEBUG] No 'a.list-3--row' found. Nearby list elements:")
        for tag in soup.find_all(class_=lambda c: c and "list" in c)[:5]:
            print(f"  → <{tag.name} class='{tag.get('class')}'> {str(tag)[:200]}")

    jobs = []
    for card in cards:
        try:
            href = (card.get("href") or "").strip()
            href = urljoin(SITE_ROOT, href) if href else ""
            title = (card.get("title") or "").strip()

            if not title:
                cell = card.select_one(".list-3--cell-1")
                title = cell.get_text(strip=True) if cell else ""

            location = ""
            tooltip = card.select_one(".tooltip")
            if tooltip:
                location = (tooltip.get("title") or tooltip.get_text(strip=True) or "").strip()

            if href and title:
                jobs.append({"title": title, "location": location, "url": href})
        except Exception as e:
            print(f"Skipped one card: {e}")

    print(f"Scraped {len(jobs)} valid jobs on page {page_number}")
    return jobs


def scrape_rss_feed(scraper, max_items=None):
    """Scrape the RSS feed as a fallback for blocked HTML pages."""
    print(f"\n{'='*60}")
    print(f"Scraping RSS feed: {RSS_URL}")

    allow_jina = os.getenv("JOBS_SCRAPER_ALLOW_JINA", "").strip().lower() in {"1", "true", "yes"}
    in_ci = os.getenv("CI", "").strip().lower() == "true"
    if in_ci and os.getenv("JOBS_SCRAPER_ALLOW_JINA", "").strip() == "":
        allow_jina = True

    try:
        response = scraper.get(RSS_URL, timeout=60, headers=build_headers())
        print(f"RSS status: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] RSS request failed: {e}")
        return []

    if response.status_code != 200 and allow_jina:
        jina_url = f"{JINA_PREFIX}{RSS_URL}"
        print(f"[WARN] RSS non-200 status ({response.status_code}). Trying Jina: {jina_url}")
        try:
            response = scraper.get(jina_url, timeout=60, headers=build_headers())
            print(f"Jina RSS status: {response.status_code}")
        except Exception as e:
            print(f"[ERROR] Jina RSS request failed: {e}")
            return []

    if response.status_code != 200:
        print(f"[ERROR] RSS non-200 status: {response.status_code}")
        return []

    try:
        root = ET.fromstring(response.text)
    except ET.ParseError as e:
        print(f"[ERROR] RSS parse failed: {e}")
        return []

    items = root.findall(".//item")
    if max_items is not None:
        items = items[:max_items]

    jobs = []
    for item in items:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        description = (item.findtext("description") or "").strip()
        location = extract_location_from_description(description)

        if title and link:
            jobs.append({"title": title, "location": location, "url": link})

    print(f"Scraped {len(jobs)} jobs from RSS")
    return jobs


def scrape_html_range(scraper, start_page, end_page):
    all_jobs = []
    for page_number in range(start_page, end_page + 1):
        jobs = scrape_listing_page(scraper, page_number)
        if not jobs and page_number > start_page:
            print(f"No jobs on page {page_number}, stopping.")
            break
        all_jobs.extend(jobs)
        time.sleep(DELAY_BETWEEN_PAGES)

    return all_jobs


def resolve_source(cli_source):
    cli_source = (cli_source or "").strip().lower()
    env_source = os.getenv("JOBS_SCRAPER_SOURCE", "").strip().lower()

    source = cli_source or env_source or "auto"
    if source not in ALLOWED_SOURCES:
        print(f"[WARN] Unknown source '{source}', falling back to auto.")
        source = "auto"

    if source == "auto" and os.getenv("CI", "").strip().lower() == "true":
        return "rss"

    return source


def save_to_json(jobs, filename):
    """Save jobs to JSON."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    print(f"Saved JSON: {filepath} ({len(jobs)} jobs)")


def main():
    parser = argparse.ArgumentParser(description="Scrape job listings from jobs.ps")
    parser.add_argument("--start-page", type=int, default=1)
    parser.add_argument("--end-page",   type=int, default=3)
    parser.add_argument("--output",     type=str, default="jobs_2026")
    parser.add_argument("--source",     type=str, default="auto", choices=sorted(ALLOWED_SOURCES))
    args = parser.parse_args()

    scraper = make_scraper()

    # Warm up: visit homepage first to get CF clearance cookie
    print("Warming up: visiting homepage to solve Cloudflare challenge...")
    try:
        r = scraper.get("https://www.jobs.ps/en/", timeout=60)
        print(f"Homepage status: {r.status_code}")
        if "just a moment" in r.text.lower():
            print("[WARN] Homepage: still seeing CF challenge after warm-up")
        time.sleep(3)
    except Exception as e:
        print(f"[WARN] Homepage visit failed: {e}")

    source = resolve_source(args.source)
    print(f"Using source mode: {source}")

    if source == "rss":
        all_jobs = scrape_rss_feed(scraper)
    elif source == "html":
        all_jobs = scrape_html_range(scraper, args.start_page, args.end_page)
    else:
        all_jobs = scrape_html_range(scraper, args.start_page, args.end_page)
        if not all_jobs:
            print("[WARNING] No jobs found from HTML. Trying RSS feed...")
            all_jobs = scrape_rss_feed(scraper)

    print(f"\nTotal jobs scraped: {len(all_jobs)}")
    if not all_jobs:
        print("[WARNING] No jobs found. Writing empty output.")

    save_to_json(all_jobs, f"{args.output}.json")


if __name__ == "__main__":
    main()
