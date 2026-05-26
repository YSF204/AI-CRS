#!/usr/bin/env python3
"""
Simple Jobs.ps scraper using curl_cffi (bypasses Cloudflare).

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

from bs4 import BeautifulSoup
from curl_cffi import requests

BASE_URL = "https://www.jobs.ps/en/jobs/latest?page={page}"
DELAY_BETWEEN_PAGES = 2
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Impersonate real Chrome to bypass Cloudflare
SESSION = requests.Session(impersonate="chrome124")
SESSION.headers.update({
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
})


def scrape_listing_page(page_number):
    """Scrape a single listing page using curl_cffi."""
    url = BASE_URL.format(page=page_number)
    print(f"\n{'='*60}")
    print(f"Scraping page {page_number}: {url}")

    try:
        response = SESSION.get(url, timeout=30)
        print(f"HTTP status: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Request failed on page {page_number}: {e}")
        return []

    if response.status_code != 200:
        print(f"[ERROR] Non-200 status: {response.status_code}")
        print(response.text[:1000])
        return []

    html = response.text

    # Debug: show first 2000 chars
    print(f"[DEBUG] HTML snippet:\n{html[:2000]}\n{'='*60}")

    # Check for Cloudflare block
    if "just a moment" in html.lower() or "cf-browser-verification" in html.lower():
        print(f"[BLOCKED] Cloudflare challenge still present on page {page_number}.")
        return []

    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select("a.list-3--row")
    print(f"Found {len(cards)} job cards on page {page_number}")

    if not cards:
        # Print a bit more HTML for diagnosis
        print("[DEBUG] No cards found. Trying to find any job-related elements...")
        for tag in soup.find_all(class_=lambda c: c and "list" in c)[:5]:
            print(f"  → <{tag.name} class='{tag.get('class')}'> {str(tag)[:200]}")

    jobs = []
    for card in cards:
        try:
            href = (card.get("href") or "").strip()
            title = (card.get("title") or "").strip()

            if not title:
                cell = card.select_one(".list-3--cell-1")
                title = cell.get_text(strip=True) if cell else ""

            location = ""
            tooltip = card.select_one(".tooltip")
            if tooltip:
                location = (tooltip.get("title") or tooltip.get_text(strip=True) or "").strip()

            if href and title:
                jobs.append({
                    "title": title,
                    "location": location,
                    "url": href,
                })
        except Exception as e:
            print(f"Skipped one card: {e}")

    print(f"Scraped {len(jobs)} valid jobs on page {page_number}")
    return jobs


def save_to_json(jobs, filename):
    """Save jobs to JSON."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    print(f"Saved JSON: {filepath} ({len(jobs)} jobs)")


def main():
    parser = argparse.ArgumentParser(description="Scrape job listings from jobs.ps")
    parser.add_argument("--start-page", type=int, default=1, help="First page (default: 1)")
    parser.add_argument("--end-page", type=int, default=3, help="Last page (default: 3)")
    parser.add_argument("--output", type=str, default="jobs_2026", help="Output filename prefix")
    args = parser.parse_args()

    all_jobs = []

    # Warm up: visit homepage first to get cookies
    print("Warming up: visiting homepage...")
    try:
        r = SESSION.get("https://www.jobs.ps/en/", timeout=20)
        print(f"Homepage status: {r.status_code}")
        time.sleep(1)
    except Exception as e:
        print(f"[WARN] Homepage visit failed: {e}")

    for page_number in range(args.start_page, args.end_page + 1):
        jobs = scrape_listing_page(page_number)
        if not jobs and page_number > args.start_page:
            print(f"No jobs on page {page_number}, stopping.")
            break
        all_jobs.extend(jobs)
        time.sleep(DELAY_BETWEEN_PAGES)

    print(f"\nTotal jobs scraped: {len(all_jobs)}")
    if not all_jobs:
        print("[WARNING] No jobs found. Writing empty output.")

    save_to_json(all_jobs, f"{args.output}.json")


if __name__ == "__main__":
    main()
