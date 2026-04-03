
export const MOCK_USER_NAME = 'Yousef AL Bakri';

export const MOCK_CV_DATA = {
  jobTitle: 'Junior Software Engineer',
  summary:
    'Enthusiastic and detail-oriented Computer Science student with a strong foundation in software development principles. Eager to apply theoretical knowledge to real-world challenges and contribute to innovative projects.',
  contact: {
    phone: '+972595420206',
    email: 'Yousef204b@gmail.com',
    linkedin: 'https://www.linkedin.com/in/yousefalbakri/',
    github: 'https://github.com/YSF204',
  },
  address: {
    city: 'Hebron',
    street: 'AL Ameer hasan',
  },
  experience: [
    {
      institutionName: 'Google',
      duration: '2021 – Present',
      position: 'Software Engineer',
      summary:
        'Led development of microservices architecture serving 2M+ users. Reduced API latency by 40% through caching strategies.',
    },
    {
      institutionName: 'Microsoft',
      duration: '2018 – 2021',
      position: 'Full-Stack Developer',
      summary:
        'Built real-time dashboard using React and Node.js. Integrated third-party payment gateways processing $5M/month.',
    },
  ],
  education: [
    {
      institutionName: 'PPU',
      duration: '2022 – 2026',
      certification: 'B.Sc. Computer Science',
      summary: 'Graduated with honors. Focus on Algorithms and Distributed Systems.',
    },
  ],
  technicalSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
  softSkills: ['Leadership', 'Communication', 'Problem Solving'],
  language: ['English', 'Arabic', 'Hebrew'],
  customSections: [
    {
      title: 'Projects',
      items: [
        {
          name: 'AI-CRS',
          description: 'AI-Powered CV Builder and ATS Checker.',
          link: 'https://github.com/YSF204/AI-CRS',
          duration: '2026',
        },
      ],
    },
  ],
};
