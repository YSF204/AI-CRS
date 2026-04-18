/**
 * Job Matching Prompts
 * Single responsibility: Prompts for matching candidates to jobs and vice versa
 * Handles candidate-job fit analysis and job recommendations
 */

export const JOB_MATCHING_PROMPTS = {
  /**
   * Match candidates to job posting
   */
  MATCH_CANDIDATES_TO_JOB: (jobPosting, candidates) => `
Analyze these candidates for this job posting and provide detailed match assessments.

Job Posting: ${JSON.stringify(jobPosting)}
Candidates: ${JSON.stringify(candidates)}

Return a JSON array:
[
  {
    "candidateId": "candidate ID",
    "candidateName": "candidate name",
    "matchScore": 0-100,
    "strengths": ["strength1", "strength2", "strength3"],
    "concerns": ["concern1", "concern2"],
    "recommendation": "Strong match / Good match / Consider / Not recommended",
    "interviewQuestions": ["question1", "question2", "question3"]
  }
]

Matching Criteria:
- Skills alignment and relevance
- Experience level and industry fit
- Education qualification match
- Achievement quality and impact
- Cultural and team compatibility
`,

  /**
   * Match jobs to candidate CV
   */
  MATCH_JOBS_TO_CANDIDATE: (candidateCV, jobs) => `
Analyze these job postings for this candidate and provide detailed match recommendations.

Candidate CV: ${JSON.stringify(candidateCV)}
Jobs: ${JSON.stringify(jobs)}

Return a JSON array:
[
  {
    "jobId": "job ID",
    "jobTitle": "job title",
    "company": "company name",
    "matchScore": 0-100,
    "strengths": ["strength1", "strength2", "strength3"],
    "gaps": ["gap1", "gap2"],
    "recommendation": "Highly recommended / Recommended / Consider / Not suitable",
    "nextSteps": ["step1", "step2", "step3"]
  }
]

Analysis Focus:
- Skills match percentage
- Experience relevance
- Growth opportunities
- Compensation alignment
- Company culture fit
`
};
