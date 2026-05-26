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
import json
import os
import time

from playwright.sync_api import sync_playwright

BASE_URL = "https://www.jobs.ps/en/jobs/latest?page={page}"
DELAY_BETWEEN_PAGES = 3
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def scrape_listing_page(page, page_number):
    """Scrape a single listing page."""
    url = BASE_URL.format(page=page_number)
    print(f"\n{'='*60}")
    print(f"Scraping page {page_number}: {url}")

    try:
        page.goto(url, wait_until="networkidle", timeout=60000)
    except Exception as e:
        print(f"[WARN] networkidle timeout on page {page_number}: {e}")
        # Fall back to domcontentloaded
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
        except Exception as e2:
            print(f"[ERROR] Could not load page {page_number}: {e2}")
            return []

    # Print page title and URL for debug
    print(f"Page title: {page.title()}")
    print(f"Current URL: {page.url}")

    # Print first 3000 chars of HTML for CI debugging
    html_snippet = page.content()[:3000]
    print(f"[DEBUG] HTML snippet:\n{html_snippet}\n{'='*60}")

    # Check for Cloudflare challenge / bot block
    content_lower = page.content().lower()
    if "just a moment" in content_lower or "cf-browser-verification" in content_lower or "checking your browser" in content_lower:
        print(f"[BLOCKED] Cloudflare challenge detected on page {page_number}. Waiting 10s and retrying...")
        time.sleep(10)
        try:
            page.wait_for_load_state("networkidle", timeout=30000)
        except Exception:
            pass
        content_lower = page.content().lower()
        if "just a moment" in content_lower:
            print(f"[BLOCKED] Still blocked on page {page_number}. Skipping.")
            return []

    try:
        page.wait_for_selector("a.list-3--row", timeout=20000)
    except Exception:
        print(f"[WARN] No 'a.list-3--row' found on page {page_number}. Trying alternate selectors...")
        # Try alternate selectors
        for selector in [".job-listing a", ".jobs-list a", "article a", ".list-row"]:
            try:
                page.wait_for_selector(selector, timeout=5000)
                print(f"[INFO] Found jobs using alternate selector: {selector}")
                break
            except Exception:
                pass
        else:
            print(f"[ERROR] No job cards found on page {page_number}")
            return []

    jobs = []
    cards = page.query_selector_all("a.list-3--row")
    print(f"Found {len(cards)} job cards on page {page_number}")

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

    print(f"Scraped {len(jobs)} valid jobs on page {page_number}")
    return jobs


def save_to_json(jobs, filename):
    """Save jobs to JSON."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(jobs, file, ensure_ascii=False, indent=2)
    print(f"Saved JSON: {filepath} ({len(jobs)} jobs)")


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
        browser = playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--window-size=1280,800",
                "--lang=en-US,en",
            ],
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
            locale="en-US",
            timezone_id="Asia/Jerusalem",
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Upgrade-Insecure-Requests": "1",
            },
        )

        # Override navigator.webdriver to avoid detection
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
            window.chrome = { runtime: {} };
        """)

        page = context.new_page()

        # Visit the homepage first to get cookies
        print("Warming up: visiting homepage...")
        try:
            page.goto("https://www.jobs.ps/en/", wait_until="networkidle", timeout=30000)
            print(f"Homepage title: {page.title()}")
            time.sleep(2)
        except Exception as e:
            print(f"[WARN] Homepage visit failed: {e}")

        for page_number in range(args.start_page, args.end_page + 1):
            jobs = scrape_listing_page(page, page_number)
            if not jobs and page_number > args.start_page:
                # Only break on empty if not the very first page (might be blocked)
                print(f"No jobs on page {page_number}, stopping pagination.")
                break
            all_jobs.extend(jobs)
            time.sleep(DELAY_BETWEEN_PAGES)

        browser.close()

    print(f"\nTotal jobs scraped: {len(all_jobs)}")

    if not all_jobs:
        print("[WARNING] No jobs found. Writing empty output files.")

    save_to_json(all_jobs, f"{args.output}.json")


if __name__ == "__main__":
    main()
