import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcProfileCompletion } from '../profileCompletion.js';
import { getRelativeTime } from '../dateFormatter.js';
import { normalizeJob, normalizeCvMatch, sortJobs, toRoleType } from '../jobHelpers.js';

// ─────────────────────────────────────────────────────────────
//  calcProfileCompletion
// ─────────────────────────────────────────────────────────────

describe('calcProfileCompletion', () => {
  it('returns 100% for a fully completed profile', () => {
    const user = {
      firstName: 'Ali',
      lastName: 'Hassan',
      email: 'ali@test.com',
      telephone: ['1234567890'],
      gender: 'MALE',
      age: 25,
      profilePic: '/uploads/pic.jpg',
    };
    expect(calcProfileCompletion(user)).toBe(100);
  });

  it('returns 0% for an empty/null user', () => {
    expect(calcProfileCompletion(null)).toBe(0);
    expect(calcProfileCompletion({})).toBe(0);
  });

  it('gives partial credit for partially filled profiles', () => {
    const user = {
      firstName: 'Ali',
      lastName: 'Hassan',
      email: 'ali@test.com',
      // missing: telephone, gender, age, profilePic
    };
    const result = calcProfileCompletion(user);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });

  it('treats empty telephone array as incomplete', () => {
    const user = {
      firstName: 'Ali',
      lastName: 'Hassan',
      email: 'ali@test.com',
      telephone: [],
      gender: 'MALE',
      age: 25,
      profilePic: '/pic.jpg',
    };
    const result = calcProfileCompletion(user);
    expect(result).toBeLessThan(100);
  });

  it('treats age=0 as incomplete', () => {
    const user = {
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      telephone: ['1234567890'],
      gender: 'MALE',
      age: 0,
      profilePic: '/pic.jpg',
    };
    expect(calcProfileCompletion(user)).toBeLessThan(100);
  });
});

// ─────────────────────────────────────────────────────────────
//  getRelativeTime
// ─────────────────────────────────────────────────────────────

describe('getRelativeTime', () => {
  it('returns empty string for falsy input', () => {
    expect(getRelativeTime(null)).toBe('');
    expect(getRelativeTime('')).toBe('');
    expect(getRelativeTime(undefined)).toBe('');
  });

  it('returns seconds ago for very recent dates', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(getRelativeTime(recent)).toMatch(/\d+s ago/);
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(getRelativeTime(fiveMinAgo)).toMatch(/\d+m ago/);
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoHoursAgo)).toMatch(/\d+h ago/);
  });

  it('returns days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(fiveDaysAgo)).toMatch(/\d+d ago/);
  });

  it('returns months ago', () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoMonthsAgo)).toMatch(/\d+mo ago/);
  });

  it('returns years ago', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoYearsAgo)).toMatch(/\d+y ago/);
  });
});

// ─────────────────────────────────────────────────────────────
//  toRoleType
// ─────────────────────────────────────────────────────────────

describe('toRoleType', () => {
  it('maps known values correctly', () => {
    expect(toRoleType('FULL_TIME')).toBe('Full-time');
    expect(toRoleType('PART_TIME')).toBe('Part-time');
    expect(toRoleType('CONTRACT')).toBe('Contract');
    expect(toRoleType('INTERNSHIP')).toBe('Internship');
  });

  it('passes through unknown values', () => {
    expect(toRoleType('Freelance')).toBe('Freelance');
  });

  it('returns "Open" for null/undefined', () => {
    expect(toRoleType(null)).toBe('Open');
    expect(toRoleType(undefined)).toBe('Open');
  });
});

// ─────────────────────────────────────────────────────────────
//  normalizeJob
// ─────────────────────────────────────────────────────────────

describe('normalizeJob', () => {
  it('normalizes a backend job object', () => {
    const raw = {
      _id: 'abc123',
      position: 'Frontend Developer',
      workSite: 'REMOTE',
      workDuration: 'FULL_TIME',
      createdAt: new Date().toISOString(),
    };
    const normalized = normalizeJob(raw);
    expect(normalized.id).toBe('abc123');
    expect(normalized.title).toBe('Frontend Developer');
    expect(normalized.location).toBe('REMOTE');
    expect(normalized.type).toBe('Full-time');
  });

  it('falls back to index-based id when _id is missing', () => {
    const normalized = normalizeJob({}, 5);
    expect(normalized.id).toBe('job-5');
  });

  it('handles external jobs with sourceName', () => {
    const raw = {
      _id: 'ext1',
      position: 'Data Scientist',
      sourceName: 'LinkedIn',
      externalUrl: 'https://linkedin.com/job/123',
    };
    const normalized = normalizeJob(raw);
    expect(normalized.company).toBe('LinkedIn');
    expect(normalized.externalUrl).toBe('https://linkedin.com/job/123');
  });
});

// ─────────────────────────────────────────────────────────────
//  normalizeCvMatch
// ─────────────────────────────────────────────────────────────

describe('normalizeCvMatch', () => {
  it('normalizes a match result', () => {
    const item = {
      jobId: 'job-1',
      position: 'Backend Dev',
      matchScore: 85,
      skillsMatched: ['Node.js', 'Express'],
      skillsMissing: ['Python'],
      reasoning: 'Good match',
    };
    const result = normalizeCvMatch(item, 0);
    expect(result.id).toBe('job-1');
    expect(result.title).toBe('Backend Dev');
    expect(result.match).toBe(85);
    expect(result.skillsMatched).toHaveLength(2);
  });

  it('handles missing matchScore gracefully', () => {
    const result = normalizeCvMatch({ jobId: 'x' }, 0);
    expect(result.match).toBeNull();
  });

  it('identifies external matches', () => {
    const result = normalizeCvMatch({
      jobId: 'ext-url',
      isExternal: true,
      externalUrl: 'https://ext.com',
      sourceName: 'Indeed',
    }, 0);
    expect(result.isExternal).toBe(true);
    expect(result.sourceName).toBe('Indeed');
  });
});

// ─────────────────────────────────────────────────────────────
//  sortJobs
// ─────────────────────────────────────────────────────────────

describe('sortJobs', () => {
  const jobs = [
    { match: 50, raw: { createdAt: '2026-01-01', salary: 3000 } },
    { match: 90, raw: { createdAt: '2026-03-01', salary: 5000 } },
    { match: 70, raw: { createdAt: '2026-02-01', salary: 4000 } },
  ];

  it('sorts by newest first (default)', () => {
    const sorted = sortJobs(jobs, 'newest');
    expect(sorted[0].match).toBe(90); // March
    expect(sorted[2].match).toBe(50); // January
  });

  it('sorts by oldest first', () => {
    const sorted = sortJobs(jobs, 'oldest');
    expect(sorted[0].match).toBe(50); // January
    expect(sorted[2].match).toBe(90); // March
  });

  it('sorts by salary descending', () => {
    const sorted = sortJobs(jobs, 'salary_desc');
    expect(sorted[0].raw.salary).toBe(5000);
    expect(sorted[2].raw.salary).toBe(3000);
  });

  it('sorts by salary ascending', () => {
    const sorted = sortJobs(jobs, 'salary_asc');
    expect(sorted[0].raw.salary).toBe(3000);
    expect(sorted[2].raw.salary).toBe(5000);
  });

  it('sorts by relevance (match score)', () => {
    const sorted = sortJobs(jobs, 'relevance');
    expect(sorted[0].match).toBe(90);
    expect(sorted[2].match).toBe(50);
  });

  it('does not mutate the original array', () => {
    const original = [...jobs];
    sortJobs(jobs, 'relevance');
    expect(jobs).toEqual(original);
  });
});
