#!/usr/bin/env python3
"""
Simple Jobs.ps scraper.

Collects only:
  - title
  - location
  - url

Usage:
  python jobs_scraper.py
  python jobs_scraper.py --start-page 1 --end-page 5
"""

import argparse
import csv
import json
import os
import time

from playwright.sync_api import sync_playwright

BASE_URL = "https://www.jobs.ps/en/jobs/latest?page={page}"
DELAY_BETWEEN_PAGES = 2
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FIELDS = ["title", "location", "url"]


def scrape_listing_page(page, page_number):
    """Scrape a single listing page."""
    url = BASE_URL.format(page=page_number)
    print(f"Scraping page {page_number}: {url}")

    page.goto(url, wait_until="domcontentloaded", timeout=30000)

    try:
        page.wait_for_selector("a.list-3--row", timeout=15000)
    except Exception:
        print(f"No jobs found on page {page_number}")
        return []

    jobs = []
    cards = page.query_selector_all("a.list-3--row")

    for card in cards:
        try:
            href = (card.get_attribute("href") or "").strip()
            title = (card.get_attribute("title") or "").strip()

            if not title:
                title_cell = card.query_selector(".list-3--cell-1")
                title = title_cell.inner_text().strip() if title_cell else ""

            location = ""
            tooltip = card.query_selector(".tooltip")
            if tooltip:
                location = (
                    tooltip.get_attribute("title") or tooltip.inner_text() or ""
                ).strip()

            if href and title:
                jobs.append(
                    {
                        "title": title,
                        "location": location,
                        "url": href,
                    }
                )
        except Exception as error:
            print(f"Skipped one card: {error}")

    print(f"Found {len(jobs)} jobs on page {page_number}")
    return jobs


def save_to_json(jobs, filename):
    """Save jobs to JSON."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(jobs, file, ensure_ascii=False, indent=2)
    print(f"Saved JSON: {filepath}")


def save_to_csv(jobs, filename):
    """Save jobs to CSV."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(jobs)
    print(f"Saved CSV: {filepath}")


def main():
    parser = argparse.ArgumentParser(description="Scrape job listings from jobs.ps")
    parser.add_argument(
        "--start-page",
        type=int,
        default=1,
        help="First page to scrape (default: 1)",
    )
    parser.add_argument(
        "--end-page",
        type=int,
        default=10,
        help="Last page to scrape (default: 10)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="jobs_2026",
        help="Output filename prefix (default: jobs_2026)",
    )
    args = parser.parse_args()

    all_jobs = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        for page_number in range(args.start_page, args.end_page + 1):
            jobs = scrape_listing_page(page, page_number)
            if not jobs:
                break
            all_jobs.extend(jobs)
            time.sleep(DELAY_BETWEEN_PAGES)

        browser.close()

    print(f"Total jobs scraped: {len(all_jobs)}")

    if not all_jobs:
        print("No jobs found.")
        return

    save_to_json(all_jobs, f"{args.output}.json")
    save_to_csv(all_jobs, f"{args.output}.csv")


if __name__ == "__main__":
    main()
