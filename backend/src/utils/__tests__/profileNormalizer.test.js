import { describe, it, expect } from 'vitest';
import {
  extractCertifications,
  calculateExperienceYears,
  buildNormalizedProfile,
  extractApplicantInfoFromParsedCV,
} from '../profileNormalizer.js';

// ─────────────────────────────────────────────────────────────
//  extractCertifications
// ─────────────────────────────────────────────────────────────

describe('extractCertifications', () => {
  it('pulls certs from the applicantInfo.certifications array', () => {
    const result = extractCertifications(
      { certifications: ['AWS Solutions Architect', 'PMP'] },
    );
    expect(result).toEqual(['AWS Solutions Architect', 'PMP']);
  });

  it('pulls certs from education entries', () => {
    const education = [
      { institutionName: 'MIT', certification: 'BSc Computer Science' },
      { institutionName: 'Stanford', certification: 'MSc AI' },
    ];
    const result = extractCertifications({}, education);
    expect(result).toContain('BSc Computer Science');
    expect(result).toContain('MSc AI');
  });

  it('pulls certs from custom sections with sectionType "certifications"', () => {
    const customSections = [
      {
        sectionType: 'certifications',
        items: [
          { name: 'Google Cloud Professional' },
          { description: 'Certified Kubernetes Admin' },
        ],
      },
    ];
    const result = extractCertifications({}, [], customSections);
    expect(result).toContain('Google Cloud Professional');
    expect(result).toContain('Certified Kubernetes Admin');
  });

  it('deduplicates across all three sources', () => {
    const applicantInfo = { certifications: ['PMP'] };
    const education = [{ certification: 'PMP' }];
    const customSections = [
      { sectionType: 'certifications', items: [{ name: 'PMP' }] },
    ];
    const result = extractCertifications(applicantInfo, education, customSections);
    expect(result).toEqual(['PMP']);
  });

  it('filters out empty strings, nulls, and non-strings', () => {
    const result = extractCertifications(
      { certifications: ['Valid', '', null, undefined, 42, '   '] },
    );
    expect(result).toEqual(['Valid']);
  });

  it('trims whitespace from cert names', () => {
    const result = extractCertifications(
      { certifications: ['  AWS  ', ' PMP '] },
    );
    expect(result).toEqual(['AWS', 'PMP']);
  });

  it('returns empty array when all inputs are null/undefined', () => {
    expect(extractCertifications(null)).toEqual([]);
    expect(extractCertifications(undefined)).toEqual([]);
    expect(extractCertifications({})).toEqual([]);
  });

  it('ignores custom sections that are not type "certifications"', () => {
    const customSections = [
      { sectionType: 'projects', items: [{ name: 'My Project' }] },
      { sectionType: 'hobbies', items: [{ name: 'Guitar' }] },
    ];
    const result = extractCertifications({}, [], customSections);
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
//  calculateExperienceYears
// ─────────────────────────────────────────────────────────────

describe('calculateExperienceYears', () => {
  it('uses explicit yearsOfExperience when provided', () => {
    expect(calculateExperienceYears({ yearsOfExperience: 5 })).toBe(5);
  });

  it('handles string yearsOfExperience', () => {
    expect(calculateExperienceYears({ yearsOfExperience: '3.5' })).toBe(3.5);
  });

  it('falls through to experience entries when yearsOfExperience is NaN', () => {
    const experience = [{ duration: 2 }, { duration: 3 }];
    expect(calculateExperienceYears({ yearsOfExperience: 'abc' }, experience)).toBe(5);
  });

  it('falls through when yearsOfExperience is negative', () => {
    const experience = [{ duration: 4 }];
    expect(calculateExperienceYears({ yearsOfExperience: -1 }, experience)).toBe(4);
  });

  it('calculates from duration fields on experience entries', () => {
    const experience = [
      { duration: 2 },
      { duration: 1.5 },
    ];
    expect(calculateExperienceYears({}, experience)).toBe(3.5);
  });

  it('calculates from durationFrom/durationTo date strings', () => {
    const experience = [
      { durationFrom: '2020-01-01', durationTo: '2023-06-01' },
    ];
    expect(calculateExperienceYears({}, experience)).toBe(3);
  });

  it('uses current year when durationTo is missing (still working there)', () => {
    const currentYear = new Date().getFullYear();
    const experience = [{ durationFrom: '2020-01-01' }];
    expect(calculateExperienceYears({}, experience)).toBe(currentYear - 2020);
  });

  it('returns 0 when no experience data is available', () => {
    expect(calculateExperienceYears({})).toBe(0);
    expect(calculateExperienceYears({}, [])).toBe(0);
  });

  it('handles a mix of duration and date-based entries', () => {
    const experience = [
      { duration: 2 },
      { durationFrom: '2018-01-01', durationTo: '2020-01-01' },
    ];
    expect(calculateExperienceYears({}, experience)).toBe(4);
  });

  it('skips entries with invalid date strings', () => {
    const experience = [
      { durationFrom: 'not-a-date', durationTo: 'also-not' },
      { duration: 3 },
    ];
    expect(calculateExperienceYears({}, experience)).toBe(3);
  });

  it('handles zero explicitly as a valid value', () => {
    expect(calculateExperienceYears({ yearsOfExperience: 0 })).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
//  buildNormalizedProfile
// ─────────────────────────────────────────────────────────────

describe('buildNormalizedProfile', () => {
  it('builds a complete profile from applicantInfo', () => {
    const profile = buildNormalizedProfile({
      applicantInfo: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        summary: 'Senior engineer',
        technicalSkills: ['React', 'Node.js'],
        softSkills: ['Leadership'],
        languages: ['English', 'Arabic'],
        yearsOfExperience: 5,
      },
      experience: [{ duration: 5 }],
      education: [{ certification: 'BSc CS' }],
    });

    expect(profile.fullName).toBe('Jane Doe');
    expect(profile.email).toBe('jane@example.com');
    expect(profile.technicalSkills).toEqual(['React', 'Node.js']);
    expect(profile.yearsOfExperience).toBe(5);
    expect(profile.certifications).toContain('BSc CS');
  });

  it('falls back to cvData when applicantInfo fields are missing', () => {
    const profile = buildNormalizedProfile({
      applicantInfo: {},
      cvData: {
        fullName: 'Fallback Name',
        contact: { email: 'fallback@test.com' },
        summary: 'Fallback summary',
        technicalSkills: ['Python'],
      },
    });

    expect(profile.fullName).toBe('Fallback Name');
    expect(profile.email).toBe('fallback@test.com');
    expect(profile.technicalSkills).toEqual(['Python']);
  });

  it('defaults to "Candidate" when no name is available', () => {
    const profile = buildNormalizedProfile({ applicantInfo: {} });
    expect(profile.fullName).toBe('Candidate');
  });

  it('returns empty arrays for missing list fields', () => {
    const profile = buildNormalizedProfile({ applicantInfo: {} });
    expect(profile.technicalSkills).toEqual([]);
    expect(profile.softSkills).toEqual([]);
    expect(profile.languages).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.experience).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
//  extractApplicantInfoFromParsedCV
// ─────────────────────────────────────────────────────────────

describe('extractApplicantInfoFromParsedCV', () => {
  it('extracts from a fully populated parsed CV', () => {
    const parsed = {
      candidate_name: 'John Smith',
      cvData: {
        contact: { email: 'john@test.com', phone: '555-1234' },
        summary: 'Experienced developer',
        technicalSkills: ['Java', 'Spring'],
        softSkills: ['Teamwork'],
        yearsOfExperience: 7,
        language: ['English'],
        certifications: ['Oracle Certified'],
        education: [
          { institutionName: 'Harvard', certification: 'MSc', durationFrom: '2015', durationTo: '2017' },
        ],
        experience: [
          { institutionName: 'Google', position: 'SWE', durationFrom: '2017', durationTo: '2024' },
        ],
      },
    };

    const result = extractApplicantInfoFromParsedCV(parsed);
    expect(result.fullName).toBe('John Smith');
    expect(result.email).toBe('john@test.com');
    expect(result.technicalSkills).toEqual(['Java', 'Spring']);
    expect(result.yearsOfExperience).toBe(7);
    expect(result.education).toHaveLength(1);
    expect(result.experience).toHaveLength(1);
  });

  it('falls back to user name when candidate_name is missing', () => {
    const user = { firstName: 'Ali', lastName: 'Hassan' };
    const result = extractApplicantInfoFromParsedCV({}, user);
    expect(result.fullName).toBe('Ali Hassan');
  });

  it('uses "Uploaded CV" as last-resort name', () => {
    const result = extractApplicantInfoFromParsedCV({});
    expect(result.fullName).toBe('Uploaded CV');
  });

  it('handles completely empty input without crashing', () => {
    const result = extractApplicantInfoFromParsedCV(null);
    expect(result.technicalSkills).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.experience).toEqual([]);
  });
});
