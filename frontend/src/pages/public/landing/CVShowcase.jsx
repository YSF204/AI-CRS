import React from 'react';
import { templates } from './components/CVShowcaseCards';
import CVShowcaseCarousel, { Card } from './components/CVShowcaseCarousel';

/* ───── CV Data ───── */
const cvData = [
  {
    name: 'Yousef AL Bakri',
    role: 'Full Stack Developer',
    email: 'yousef204@gmail.com',
    phone: '+972 59 842 0206',
    location: 'Hebron, Palestine',
    linkedin: 'linkedin.com/in/yousefalbakri',
    summary: 'Passionate full stack developer with experience in modern web technologies. Skilled in building scalable applications using the MERN stack with a focus on clean architecture and user experience.',
    education: { degree: 'BSc Computer Science', school: 'Palestine Polytechnic University', years: '2022 – 2026', gpa: '3.62 / 4.0' },
    experience: [
      { title: 'Software Engineering Intern', company: 'AI-CRS Project', date: 'Jan 2024 – May 2025',
        bullets: ['Designed and implemented RESTful APIs serving 500+ users with Node.js and Express', 'Developed the AI-powered CV analysis engine using OpenAI API integration', 'Built responsive React components and managed MongoDB data models'] },
    ],
    skills: { languages: 'JavaScript, TypeScript, Python, HTML5, CSS3, SQL', frameworks: 'React.js, Node.js, Express.js, TailwindCSS, Next.js', tools: 'Docker, Git, MongoDB, PostgreSQL, Linux, Figma' },
    projects: [
      { name: 'AI-CRS Platform', desc: 'MERN stack platform using ChatGPT API for automated CV analysis, ATS scoring, and career planning' },
      { name: 'Mini University System', desc: 'Full-stack student records management with role-based access control' },
    ],
    certifications: ['Full Stack Web Development — Udemy, 2023', 'Data Science with Python — Coursera, 2024'],
    languages: [{ lang: 'Arabic', level: 'Native' }, { lang: 'English', level: 'Fluent (IELTS 7.0)' }],
  },
  {
    name: 'Bashar AL-Ajalin',
    role: 'Frontend Engineer',
    email: 'basharajalin6@gmail.com',
    phone: '+972 59 876 5432',
    location: 'Hebron, Palestine',
    linkedin: 'linkedin.com/in/basharajalin',
    summary: 'Detail-oriented frontend engineer specializing in building responsive, accessible, and performant user interfaces. Strong eye for design with excellent problem-solving skills.',
    education: { degree: 'BSc Computer Science', school: 'Palestine Polytechnic University', years: 'Expected Jun 2026', gpa: '3.45 / 4.0' },
    experience: [
      { title: 'Frontend Developer', company: 'Freelance', date: 'Jun 2023 – Present',
        bullets: ['Designed and built responsive web interfaces for 10+ client projects', 'Implemented pixel-perfect UI designs with React.js and TailwindCSS', 'Improved page load times by 40% through code splitting and lazy loading'] },
    ],
    skills: { languages: 'JavaScript, TypeScript, Python, HTML5, CSS3', frameworks: 'React.js, Next.js, Vue.js, TailwindCSS, Bootstrap', tools: 'Figma, Git, Webpack, Vite, Chrome DevTools, Jest' },
    projects: [
      { name: 'CV Builder UI', desc: 'Interactive CV builder with live preview, drag-and-drop sections, and PDF export' },
      { name: 'University Portal Redesign', desc: 'Complete modern redesign of university student portal serving 2,000+ students' },
    ],
    certifications: [],
    languages: [{ lang: 'Arabic', level: 'Native' }, { lang: 'English', level: 'Fluent' }],
  },
  {
    name: 'Ismail Jboor',
    role: 'Backend Developer',
    email: 'ismail.jboor@outlook.com',
    phone: '+972 59 876 5432',
    location: 'Nablus, Palestine',
    linkedin: 'linkedin.com/in/ismail-jboor',
    summary: 'Results-driven backend developer with expertise in designing scalable server-side architectures. Experienced in building RESTful APIs, optimizing database performance, and implementing microservice patterns.',
    education: { degree: 'BSc Software Engineering', school: 'Birzeit University', years: '2021 – 2025', gpa: '3.55 / 4.0' },
    experience: [
      { title: 'Backend Developer', company: 'TechPal Solutions', date: 'Jun 2024 – Present',
        bullets: ['Developed and maintained RESTful APIs handling 10K+ daily requests', 'Optimized database queries reducing response time by 60%', 'Implemented CI/CD pipelines and automated testing workflows'] },
    ],
    skills: { languages: 'JavaScript, TypeScript, Python, SQL, GraphQL', frameworks: 'Node.js, Express.js, NestJS, Django, FastAPI', tools: 'PostgreSQL, MongoDB, Redis, Docker, AWS, GitHub Actions' },
    projects: [
      { name: 'E-Commerce Backend', desc: 'Scalable e-commerce API with payment integration, inventory management' },
      { name: 'API Gateway Service', desc: 'Microservice-based API gateway with rate limiting and load balancing' },
    ],
    certifications: [],
    languages: [{ lang: 'Arabic', level: 'Native' }, { lang: 'English', level: 'B2 Upper-Intermediate' }, { lang: 'German', level: 'A2 Elementary' }],
  },
  {
    name: 'Azeez Abu Queider',
    role: 'AI / ML Engineer',
    email: 'azeez.quaider@gmail.com',
    phone: '+972 59 876 5432',
    location: 'Ramallah, Palestine',
    linkedin: 'linkedin.com/in/azeezquaider',
    summary: 'AI/ML engineer passionate about applying machine learning and NLP to solve real-world problems. Experienced in building intelligent systems for text analysis and recommendation.',
    education: { degree: 'BSc Computer Science', school: 'An-Najah National University', years: '2022 – 2026', gpa: '3.70 / 4.0' },
    experience: [
      { title: 'AI/ML Engineering Intern', company: 'Digital Innovations', date: 'Mar 2024 – Present',
        bullets: ['Built NLP pipelines for automated text extraction and classification', 'Integrated OpenAI API for intelligent document analysis features', 'Developed candidate-job matching algorithms with 89% accuracy'] },
    ],
    skills: { languages: 'Python, JavaScript, TypeScript, SQL, R', frameworks: 'TensorFlow, PyTorch, OpenAI API, LangChain, Pandas, NumPy', tools: 'Jupyter, Docker, Git, Google Colab, MLflow, Hugging Face' },
    projects: [
      { name: 'CV Analysis Engine', desc: 'AI engine for parsing, scoring, and providing feedback on resumes using GPT-4' },
      { name: 'Candidate Matching AI', desc: 'ML-based system matching job seekers to positions using semantic similarity' },
    ],
    certifications: ['Deep Learning Specialization — Coursera, 2024', 'TensorFlow Developer Certificate — Google, 2024'],
    languages: [{ lang: 'Arabic', level: 'Native' }, { lang: 'English', level: 'Fluent' }],
  },
];

/* ───── Main Showcase ───── */
export default function CVShowcase() {
  return (
    <CVShowcaseCarousel>
      {cvData.map((cv, i) => {
        const Template = templates[i];
        return (
          <Card key={i}>
            <Template cv={cv} />
          </Card>
        );
      })}
    </CVShowcaseCarousel>
  );
}
