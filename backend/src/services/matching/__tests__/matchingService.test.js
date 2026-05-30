import { describe, it, expect } from 'vitest';
import {
  calculateMatchPercentage,
  extractStrengthsWeaknesses,
} from '../matchingService.js';

// ─────────────────────────────────────────────────────────────
//  calculateMatchPercentage — the core scoring algorithm
// ─────────────────────────────────────────────────────────────

describe('calculateMatchPercentage', () => {
  it('returns 100% when applicant perfectly matches all requirements', () => {
    const applicant = {
      technicalSkills: ['React', 'Node.js', 'MongoDB'],
      softSkills: ['Leadership', 'Teamwork'],
      languages: ['English', 'Arabic'],
      yearsOfExperience: 5,
    };
    const job = {
      technicalSkills: ['React', 'Node.js', 'MongoDB'],
      softSkills: ['Leadership', 'Teamwork'],
      language: ['English', 'Arabic'],
      yearsOfExperience: 5,
    };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.percentage).toBe(100);
    expect(result.breakdown.technicalSkillsMatch).toBe(100);
    expect(result.breakdown.experienceMatch).toBe(100);
    expect(result.breakdown.softSkillsMatch).toBe(100);
    expect(result.breakdown.languagesMatch).toBe(100);
  });

  it('returns 0% when applicant has nothing the job needs', () => {
    const applicant = {
      technicalSkills: [],
      softSkills: [],
      languages: [],
      yearsOfExperience: 0,
    };
    const job = {
      technicalSkills: ['React'],
      softSkills: ['Leadership'],
      language: ['French'],
      yearsOfExperience: 5,
    };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.percentage).toBe(0);
  });

  it('gives 100% for any dimension where the job has no requirements', () => {
    const applicant = {
      technicalSkills: ['React'],
      softSkills: [],
      languages: [],
      yearsOfExperience: 0,
    };
    const job = {
      technicalSkills: [],
      softSkills: [],
      language: [],
      yearsOfExperience: 0,
    };

    const result = calculateMatchPercentage(applicant, job);
    // all dimensions are 100% because job requires nothing
    expect(result.percentage).toBe(100);
  });

  it('handles skill aliases correctly (React.js = React)', () => {
    const applicant = { technicalSkills: ['React.js'], softSkills: [], languages: [], yearsOfExperience: 0 };
    const job = { technicalSkills: ['React'], softSkills: [], language: [], yearsOfExperience: 0 };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.breakdown.technicalSkillsMatch).toBe(100);
  });

  it('handles implied skills (TypeScript implies JavaScript)', () => {
    const applicant = { technicalSkills: ['TypeScript'], softSkills: [], languages: [], yearsOfExperience: 0 };
    const job = { technicalSkills: ['JavaScript'], softSkills: [], language: [], yearsOfExperience: 0 };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.breakdown.technicalSkillsMatch).toBe(100);
  });

  it('handles chained implied skills (Next.js → React → JavaScript)', () => {
    const applicant = { technicalSkills: ['Next.js'], softSkills: [], languages: [], yearsOfExperience: 0 };
    const job = { technicalSkills: ['React', 'JavaScript'], softSkills: [], language: [], yearsOfExperience: 0 };

    const result = calculateMatchPercentage(applicant, job);
    // Next.js implies both react and javascript
    expect(result.breakdown.technicalSkillsMatch).toBe(100);
  });

  it('gives partial credit for fuzzy/substring matches', () => {
    // Use skills NOT in the alias map so they fall through to substring matching
    const applicant = { technicalSkills: ['data visualization'], softSkills: [], languages: [], yearsOfExperience: 0 };
    const job = { technicalSkills: ['visualization'], softSkills: [], language: [], yearsOfExperience: 0 };

    const result = calculateMatchPercentage(applicant, job);
    // "visualization" is a substring of "data visualization" → 0.8 credit → 80%
    expect(result.breakdown.technicalSkillsMatch).toBe(80);
  });

  it('caps experience match at 100% (extra experience is not penalized)', () => {
    const applicant = { technicalSkills: [], softSkills: [], languages: [], yearsOfExperience: 10 };
    const job = { technicalSkills: [], softSkills: [], language: [], yearsOfExperience: 3 };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.breakdown.experienceMatch).toBe(100);
  });

  it('calculates partial experience match correctly', () => {
    const applicant = { technicalSkills: [], softSkills: [], languages: [], yearsOfExperience: 2 };
    const job = { technicalSkills: [], softSkills: [], language: [], yearsOfExperience: 4 };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.breakdown.experienceMatch).toBe(50); // 2/4 * 100
  });

  it('applies correct weights (40% tech, 30% exp, 15% soft, 15% lang)', () => {
    // All 100% on each dimension should give 100% total
    const applicant = {
      technicalSkills: ['React'],
      softSkills: ['Leadership'],
      languages: ['English'],
      yearsOfExperience: 5,
    };
    const job = {
      technicalSkills: ['React'],
      softSkills: ['Leadership'],
      language: ['English'],
      yearsOfExperience: 5,
    };
    const result = calculateMatchPercentage(applicant, job);
    expect(result.percentage).toBe(100);

    // 100% tech (0 match) + 100% exp + 100% soft (0 match) + 100% lang (0 match)
    // with just experience matching: 0*0.4 + 100*0.3 + 0*0.15 + 0*0.15 = 30
    const applicant2 = {
      technicalSkills: [],
      softSkills: [],
      languages: [],
      yearsOfExperience: 5,
    };
    const job2 = {
      technicalSkills: ['React'],
      softSkills: ['Leadership'],
      language: ['English'],
      yearsOfExperience: 5,
    };
    const result2 = calculateMatchPercentage(applicant2, job2);
    expect(result2.percentage).toBe(30); // only experience dimension at 100% * 0.3 weight
  });

  it('handles null/undefined inputs gracefully', () => {
    const result = calculateMatchPercentage({}, {});
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
    expect(result.breakdown).toBeDefined();
  });

  it('handles case-insensitive skill matching', () => {
    const applicant = { technicalSkills: ['REACT', 'node.JS'], softSkills: [], languages: [], yearsOfExperience: 0 };
    const job = { technicalSkills: ['react', 'Node.js'], softSkills: [], language: [], yearsOfExperience: 0 };

    const result = calculateMatchPercentage(applicant, job);
    expect(result.breakdown.technicalSkillsMatch).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
//  extractStrengthsWeaknesses
// ─────────────────────────────────────────────────────────────

describe('extractStrengthsWeaknesses', () => {
  it('identifies strengths when scores are high', () => {
    const breakdown = {
      technicalSkillsMatch: 85,
      experienceMatch: 90,
      softSkillsMatch: 80,
      languagesMatch: 100,
    };
    const { strengths } = extractStrengthsWeaknesses('', breakdown);
    expect(strengths).toContain('Strong technical skills alignment');
    expect(strengths).toContain('Meets or exceeds required experience level');
    expect(strengths).toContain('Excellent soft skills alignment');
    expect(strengths).toContain('Language requirements fully met');
  });

  it('identifies weaknesses when scores are low', () => {
    const breakdown = {
      technicalSkillsMatch: 20,
      experienceMatch: 30,
      softSkillsMatch: 15,
      languagesMatch: 25,
    };
    const { weaknesses } = extractStrengthsWeaknesses('', breakdown);
    expect(weaknesses.some(w => w.includes('Technical skills gap'))).toBe(true);
    expect(weaknesses.some(w => w.includes('Limited relevant experience'))).toBe(true);
    expect(weaknesses.some(w => w.includes('Soft skills gap'))).toBe(true);
    expect(weaknesses.some(w => w.includes('Limited language proficiency'))).toBe(true);
  });

  it('returns default strength when everything is in the middle range', () => {
    const breakdown = {
      technicalSkillsMatch: 55,
      experienceMatch: 60,
      softSkillsMatch: 55,
      languagesMatch: 0,
    };
    // passing empty string for aiAnalysis so it won't trigger the 'gap' or 'concern' checks
    const { strengths } = extractStrengthsWeaknesses('', breakdown);
    expect(strengths).toContain('Well-rounded profile for this role');
  });

  it('detects gaps mentioned in AI analysis text', () => {
    const breakdown = {
      technicalSkillsMatch: 55,
      experienceMatch: 60,
      softSkillsMatch: 55,
      languagesMatch: 0,
    };
    const { weaknesses } = extractStrengthsWeaknesses('There is a significant gap in cloud skills', breakdown);
    expect(weaknesses).toContain('Implementation gap identified in analysis');
  });
});
