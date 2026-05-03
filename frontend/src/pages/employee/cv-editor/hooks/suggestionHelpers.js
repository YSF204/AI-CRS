const FALLBACKS = {
  "job-title": (fd) => [
    "Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
  ].filter((t) => t !== fd.jobTitle),
  summary: () => [
    "Experienced professional with a strong background in delivering innovative solutions.",
    "Results-driven individual with proven track record of success in challenging environments.",
    "Dedicated team player committed to continuous improvement and professional growth.",
  ],
  skills: (fd) => [
    "JavaScript", "Python", "React", "Node.js", "TypeScript", "HTML", "CSS",
  ].filter((s) => !fd.technicalSkills?.includes(s)),
  "soft-skills": (fd) => [
    "Communication", "Leadership", "Problem Solving", "Teamwork", "Time Management",
  ].filter((s) => !fd.softSkills?.includes(s)),
  languages: (fd) => [
    "English", "Spanish", "French", "German", "Mandarin", "Arabic", "Japanese",
  ].filter((l) => !fd.language?.includes(l)),
  experience: () => [
    "Led cross-functional team to deliver key project milestones",
    "Developed and implemented innovative solutions",
    "Increased efficiency by 25% through process optimization",
    "Collaborated with stakeholders to define requirements",
    "Mentored junior team members and improved team productivity",
  ],
  education: () => [
    "Graduated with honors",
    "Dean's List multiple semesters",
    "Relevant coursework in web development",
    "Capstone project: e-commerce platform",
    "Leadership role in student organization",
  ],
  "custom-section": () => [
    "Delivered high-quality results within tight deadlines",
    "Demonstrated strong analytical and problem-solving skills",
    "Collaborated effectively with cross-functional teams",
    "Showcased creativity and attention to detail",
  ],
};

export function getFallbackSuggestions(field, formData) {
  const fn = FALLBACKS[field];
  return fn ? fn(formData) : [];
}

export function buildSuggestionBody(field, form, context = {}) {
  const base = { ...context };
  const skills = [...(form.technicalSkills || []), ...(form.softSkills || [])];

  switch (field) {
    case "job-title":
      return { ...base, experience: form.experience || [], skills, jobTitle: form.jobTitle || "" };
    case "summary":
      return { ...base, experience: form.experience || [], skills, jobTitle: form.jobTitle || "" };
    case "skills":
    case "soft-skills":
      return { ...base, jobTitle: form.jobTitle || "", experience: form.experience || [], skills: form.technicalSkills || [] };
    case "languages":
      return { ...base, jobTitle: form.jobTitle || "", skills: form.language || [] };
    case "custom-section":
      return { ...base, jobTitle: form.jobTitle || "" };
    case "summary-single":
      return {
        ...base,
        fullName: form.fullName || "",
        jobTitle: form.jobTitle || "",
        currentInput: form.summary || "",
        experience: form.experience || [],
        education: form.education || [],
        technicalSkills: form.technicalSkills || [],
        softSkills: form.softSkills || [],
        language: form.language || [],
        contact: form.contact || {},
        address: form.address || {},
        skills,
      };
    default:
      return base;
  }
}
