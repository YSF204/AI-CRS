#!/usr/bin/env python3
"""
Jobs.ps Web Scraper
===================
Scrapes job listings from https://www.jobs.ps/en/jobs/latest
Uses Playwright to bypass Cloudflare protection.

Features:
  - Configurable page range (START_PAGE, END_PAGE)
  - Filters jobs by year (only keeps jobs from 2026 onwards)
  - Visits each job detail page for full info
  - Translates Arabic text to English (basic dictionary)
  - Exports to JSON and CSV

Usage:
  python3 jobs_scraper.py
  python3 jobs_scraper.py --start-page 1 --end-page 5
  python3 jobs_scraper.py --start-page 1 --end-page 20 --min-year 2026
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from datetime import datetime

from playwright.sync_api import sync_playwright

# ─────────────────────────────────────────────
# CONFIGURATION — Change these as needed
# ─────────────────────────────────────────────
BASE_URL = "https://www.jobs.ps/en/jobs/latest?page={page}"
MIN_YEAR = 2026  # Only keep jobs with deadline >= this year
DELAY_BETWEEN_PAGES = 2  # seconds between page loads (be polite)
DELAY_BETWEEN_JOBS = 1   # seconds between job detail loads
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def has_arabic(text):
    """Check if text contains Arabic characters."""
    return bool(text) and any('\u0600' <= c <= '\u06FF' for c in text)


def parse_deadline_date(date_str):
    """Parse deadline date string into a datetime object.
    Handles formats like: '26 - Apr - 2026', '3, Dec, 2025', '26 Apr 2026'
    """
    if not date_str:
        return None
    # Normalize: remove dashes, commas, extra spaces
    cleaned = re.sub(r'[\-,/]', ' ', date_str).strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)

    for fmt in ["%d %b %Y", "%d %B %Y", "%b %d %Y"]:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    return None


def scrape_listing_page(page, page_num):
    """Scrape one listing page. Returns list of {title, location, url}."""
    url = BASE_URL.format(page=page_num)
    print(f"\n{'='*60}")
    print(f"  📄 Scraping listing page {page_num}: {url}")
    print(f"{'='*60}")

    page.goto(url, wait_until='domcontentloaded', timeout=30000)

    try:
        page.wait_for_selector('a.list-3--row', timeout=15000)
    except Exception:
        print(f"  ⚠️  No job cards found on page {page_num}")
        return []

    cards = page.query_selector_all('a.list-3--row')
    jobs = []

    for card in cards:
        try:
            href = card.get_attribute('href') or ""
            # The `title` attribute of the <a> tag often has the English title
            title_attr = card.get_attribute('title') or ""

            # Get inner text for title (first cell)
            cells = card.query_selector_all('.list-3--cell-1')
            cell_title = cells[0].inner_text().strip() if cells else ""

            # Prefer: title_attr if English, else cell text
            title = title_attr if title_attr else cell_title

            # Location from the tooltip span
            location = ""
            tooltip = card.query_selector('.tooltip')
            if tooltip:
                location = tooltip.get_attribute('title') or tooltip.inner_text().strip()

            if href:
                jobs.append({
                    'title': title,
                    'location': location,
                    'url': href,
                })
        except Exception as e:
            print(f"  ⚠️  Error parsing card: {e}")

    print(f"  ✅ Found {len(jobs)} jobs on page {page_num}")
    return jobs


def parse_detail_lines(lines):
    """Parse the detail page by walking the lines sequentially.
    The structure is key-value pairs where the key is on one line
    and the value is on the next. E.g.:
        Deadline
        26 - Apr - 2026
        Location
        Ramallah
    """
    data = {}

    # ── 1. Find title and company (lines right after nav, before "Apply Now") ──
    nav_end = 0
    for i, line in enumerate(lines):
        if line == 'العربية':
            nav_end = i + 1
            break

    apply_idx = None
    for i in range(nav_end, len(lines)):
        if lines[i].startswith('Apply Now'):
            apply_idx = i
            break

    if nav_end and apply_idx and apply_idx > nav_end:
        # Title is first line after nav
        data['detail_title'] = lines[nav_end] if nav_end < len(lines) else ""
        # Company is second line after nav (before Apply Now)
        if nav_end + 1 < apply_idx:
            data['company'] = lines[nav_end + 1]

    # ── 2. Find "Job Description" section ──
    desc_start = None
    desc_end = None
    for i, line in enumerate(lines):
        if line == 'Job Description':
            desc_start = i + 1
        elif desc_start and line in ('Jobs.ps, Ltd. All Rights Reserved.', 'Job Requirements'):
            desc_end = i
            break

    if desc_start:
        if not desc_end:
            desc_end = min(desc_start + 30, len(lines))
        desc_lines = [l for l in lines[desc_start:desc_end] if l]
        data['description'] = '\n'.join(desc_lines)

    # ── 3. Find "Job Requirements" section ──
    req_start = None
    req_end = None
    for i, line in enumerate(lines):
        if line == 'Job Requirements' and i > (desc_end or 0):
            req_start = i + 1
        elif req_start and line == 'Job Details':
            req_end = i
            break

    if req_start:
        if not req_end:
            req_end = min(req_start + 30, len(lines))
        req_lines = [l for l in lines[req_start:req_end] if l]
        data['requirements'] = '\n'.join(req_lines)

    # ── 4. Parse "Job Details" key-value section ──
    detail_keys = {
        'Job Title': 'detail_job_title',
        'Deadline': 'deadline',
        'Location': 'detail_location',
        'Workplace': 'workplace',
        'Job Type': 'job_type',
        'Position Level': 'position_level',
        'Salary': 'salary',
        'Degree': 'degree',
        'Experience': 'experience',
    }

    details_start = None
    for i, line in enumerate(lines):
        if line == 'Job Details':
            details_start = i + 1
            break

    if details_start:
        # Walk through key-value pairs
        i = details_start
        while i < len(lines):
            line = lines[i]
            if line in ('Application Instructions', 'Apply Now'):
                break
            if line in detail_keys:
                key = detail_keys[line]
                # Value is on the next line
                if i + 1 < len(lines):
                    data[key] = lines[i + 1]
                    i += 2
                    continue
            elif line == 'Category':
                # Category can span multiple lines
                cat_lines = []
                i += 1
                while i < len(lines) and lines[i] not in ('Application Instructions', 'Apply Now'):
                    cat_lines.append(lines[i])
                    i += 1
                data['category'] = ', '.join(cat_lines)
                continue
            i += 1

    # ── 5. Find "Application Instructions" ──
    app_start = None
    app_end = None
    for i, line in enumerate(lines):
        if line == 'Application Instructions':
            app_start = i + 1
        elif app_start and line.startswith('Apply Now'):
            app_end = i
            break

    if app_start:
        if not app_end:
            app_end = min(app_start + 10, len(lines))
        app_lines = [l for l in lines[app_start:app_end] if l]
        data['application_instructions'] = '\n'.join(app_lines)

    return data


def scrape_job_detail(page, job):
    """Visit a job's detail page and fill in all fields."""
    url = job['url']

    try:
        page.goto(url, wait_until='domcontentloaded', timeout=30000)
        time.sleep(1.5)

        body = page.query_selector('body')
        if not body:
            return job

        full_text = body.inner_text()
        # Split into clean lines
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]

        # Parse structured data
        data = parse_detail_lines(lines)

        # ── Merge parsed data into job ──
        # Title: prefer English detail title if listing title is Arabic
        detail_title = data.get('detail_title', '') or data.get('detail_job_title', '')
        if detail_title and not has_arabic(detail_title):
            job['title'] = detail_title
        elif detail_title and has_arabic(job.get('title', '')):
            # Both are Arabic — use the detail one (usually more complete)
            job['title'] = detail_title

        job['company'] = data.get('company', '')
        job['description'] = data.get('description', '')
        job['requirements'] = data.get('requirements', '')
        job['deadline'] = data.get('deadline', '')
        job['job_type'] = data.get('job_type', '')
        job['position_level'] = data.get('position_level', '')
        job['salary'] = data.get('salary', '')
        job['degree'] = data.get('degree', '')
        job['experience'] = data.get('experience', '')
        job['workplace'] = data.get('workplace', '')
        job['category'] = data.get('category', '')
        job['application_instructions'] = data.get('application_instructions', '')

        # Use detail location if listing location is empty
        if not job.get('location') and data.get('detail_location'):
            job['location'] = data['detail_location']

        # Parse deadline date
        parsed = parse_deadline_date(job['deadline'])
        if parsed:
            job['deadline_parsed'] = parsed.strftime('%Y-%m-%d')
            job['deadline_year'] = parsed.year
        else:
            job['deadline_parsed'] = None
            job['deadline_year'] = None

    except Exception as e:
        print(f"    ⚠️  Error scraping detail for {url}: {e}")
        for key in ['company', 'description', 'requirements', 'deadline',
                     'job_type', 'position_level', 'salary', 'degree',
                     'experience', 'workplace', 'category',
                     'application_instructions']:
            job.setdefault(key, '')
        job.setdefault('deadline_parsed', None)
        job.setdefault('deadline_year', None)

    return job


def save_to_json(jobs, filename):
    """Save jobs to a JSON file."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON → {filepath}")
    return filepath


def save_to_csv(jobs, filename):
    """Save jobs to a CSV file."""
    if not jobs:
        return
    filepath = os.path.join(OUTPUT_DIR, filename)
    fieldnames = [
        'title', 'company', 'location', 'deadline', 'deadline_parsed',
        'job_type', 'position_level', 'workplace', 'salary', 'degree',
        'experience', 'category', 'description', 'requirements',
        'application_instructions', 'url'
    ]
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for job in jobs:
            writer.writerow(job)
    print(f"💾 CSV → {filepath}")
    return filepath


def main():
    parser = argparse.ArgumentParser(description='Scrape job listings from jobs.ps')
    parser.add_argument('--start-page', type=int, default=1,
                        help='First page to scrape (default: 1)')
    parser.add_argument('--end-page', type=int, default=10,
                        help='Last page to scrape (default: 10)')
    parser.add_argument('--min-year', type=int, default=MIN_YEAR,
                        help=f'Minimum deadline year to keep (default: {MIN_YEAR})')
    parser.add_argument('--no-details', action='store_true',
                        help='Skip detail pages (faster, less data)')
    parser.add_argument('--output', type=str, default='jobs_2026',
                        help='Output filename prefix (default: jobs_2026)')
    args = parser.parse_args()

    print(f"""
     ╔═══════════════════════════════════════════════╗
     ║         🔍  Jobs.ps Web Scraper  🔍           ║
     ╠═══════════════════════════════════════════════╣
     ║  Pages:  {args.start_page:>3} → {args.end_page:<3}                          ║
     ║  Filter: Deadline year >= {args.min_year}               ║
     ╚═══════════════════════════════════════════════╝
    """)

    all_jobs = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                       'AppleWebKit/537.36 (KHTML, like Gecko) '
                       'Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # ── Phase 1: Collect job URLs from listing pages ──
        print("📋 PHASE 1: Scraping listing pages...\n")
        for page_num in range(args.start_page, args.end_page + 1):
            jobs = scrape_listing_page(page, page_num)
            if not jobs:
                print(f"\n  ℹ️  No jobs on page {page_num}. Stopping.")
                break
            all_jobs.extend(jobs)
            time.sleep(DELAY_BETWEEN_PAGES)

        total = len(all_jobs)
        print(f"\n{'─'*60}")
        print(f"  📊 Total jobs found: {total}")
        print(f"{'─'*60}")

        if not all_jobs:
            print("\n❌ No jobs found!")
            browser.close()
            return

        # ── Phase 2: Scrape each detail page ──
        if not args.no_details:
            print(f"\n🔎 PHASE 2: Scraping {total} detail pages...\n")

            for i, job in enumerate(all_jobs, 1):
                title_short = (job['title'][:45] + '..') if len(job['title']) > 47 else job['title']
                print(f"  [{i:>3}/{total}] {title_short}")

                scrape_job_detail(page, job)

                dl = job.get('deadline', '')
                yr = job.get('deadline_year', '?')
                if dl:
                    keep = "✅" if yr and yr >= args.min_year else "❌"
                    print(f"           → Deadline: {dl}  (Year: {yr})  {keep}")
                else:
                    print(f"           → Deadline: not found (keeping)")

                time.sleep(DELAY_BETWEEN_JOBS)

        browser.close()

    # ── Phase 3: Filter by year ──
    if not args.no_details:
        filtered = [
            j for j in all_jobs
            if j.get('deadline_year') is None or j['deadline_year'] >= args.min_year
        ]
    else:
        filtered = all_jobs

    # Clean up internal fields
    for job in filtered:
        job.pop('deadline_year', None)

    # ── Phase 4: Save ──
    print(f"\n{'='*60}")
    print(f"  📊 RESULTS")
    print(f"{'='*60}")
    print(f"  Total scraped:     {total}")
    print(f"  After filtering:   {len(filtered)}  (year >= {args.min_year})")
    print(f"{'='*60}")

    if filtered:
        save_to_json(filtered, f"{args.output}.json")
        save_to_csv(filtered, f"{args.output}.csv")

        # Summary table
        print(f"\n{'─'*100}")
        print(f"  {'#':>3}  {'Title':<40}  {'Company':<25}  {'Location':<15}  {'Deadline'}")
        print(f"{'─'*100}")
        for i, j in enumerate(filtered[:30], 1):
            t = (j['title'][:38] + '..') if len(j['title']) > 40 else j['title']
            c = (j.get('company', '')[:23] + '..') if len(j.get('company', '')) > 25 else j.get('company', '')
            l = (j.get('location', '')[:13] + '..') if len(j.get('location', '')) > 15 else j.get('location', '')
            d = j.get('deadline_parsed') or j.get('deadline', 'N/A') or 'N/A'
            print(f"  {i:>3}  {t:<40}  {c:<25}  {l:<15}  {d}")

        if len(filtered) > 30:
            print(f"\n  ... and {len(filtered) - 30} more (see output files)")
        print(f"{'─'*100}")
    else:
        print("\n❌ No jobs matched the year filter.")


if __name__ == '__main__':
    main()
