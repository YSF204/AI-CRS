import React from 'react';
import CardSwap, { Card } from './components/CardSwap';

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

/* shared */
const sans = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";

/* ═════════════════════════════════════════════════════
   TEMPLATE 1 — Classic Serif (traditional, formal)
   Georgia font, centered header, horizontal rules
   ═════════════════════════════════════════════════════ */
function CVClassic({ cv }) {
  return (
    <div style={{ ...base, fontFamily: serif }}>
      {/* Header — centered */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', color: '#111' }}>{cv.name}</div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 2, fontStyle: 'italic' }}>{cv.role}</div>
        <div style={{ fontSize: 9.5, color: '#888', marginTop: 6, letterSpacing: '0.03em' }}>
          {cv.email} &nbsp;|&nbsp; {cv.phone} &nbsp;|&nbsp; {cv.location}
        </div>
        <div style={{ fontSize: 9.5, color: '#888' }}>{cv.linkedin}</div>
      </div>
      <Hr />

      {/* Summary */}
      <Section title="Professional Summary">
        <p style={{ fontSize: 10.5, color: '#444', lineHeight: 1.55, margin: 0 }}>{cv.summary}</p>
      </Section>

      {/* Experience */}
      <Section title="Professional Experience">
        {cv.experience.map((exp, i) => (
          <div key={i}>
            <Row left={<b style={{ fontSize: 12 }}>{exp.title}</b>} right={exp.date} />
            <div style={{ fontSize: 10.5, fontStyle: 'italic', color: '#666', marginTop: 1 }}>{exp.company}</div>
            <Bullets items={exp.bullets} />
          </div>
        ))}
      </Section>

      {/* Education */}
      <Section title="Education">
        <Row left={<b style={{ fontSize: 11.5 }}>{cv.education.degree}</b>} right={cv.education.years} />
        <div style={{ fontSize: 10, color: '#555' }}>{cv.education.school} — GPA: {cv.education.gpa}</div>
      </Section>

      {/* Skills */}
      <Section title="Technical Skills">
        {Object.entries(cv.skills).map(([cat, val]) => (
          <div key={cat} style={{ fontSize: 10.5, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{cat}: </span>
            <span style={{ color: '#555' }}>{val}</span>
          </div>
        ))}
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {cv.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 11 }}>{p.name}</span>
            <span style={{ fontSize: 10, color: '#666' }}> — {p.desc}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   TEMPLATE 2 — Modern Accent (left color bar, sans)
   Blue accent, pill tags, clean sections
   ═════════════════════════════════════════════════════ */
function CVModern({ cv }) {
  const a = '#2563EB';
  return (
    <div style={{ ...base, display: 'flex', gap: 0, padding: 0 }}>
      {/* Left accent strip */}
      <div style={{ width: 6, background: a, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '24px 28px 24px 22px' }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: a, letterSpacing: '-0.02em' }}>{cv.name}</div>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginTop: 2 }}>
            {cv.role}
          </div>
          <div style={{ fontSize: 9, color: '#999', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
            <span>✉ {cv.email}</span><span>☎ {cv.phone}</span><span>⌂ {cv.location}</span>
          </div>
        </div>

        {/* Summary */}
        <div style={{ fontSize: 10.5, color: '#555', lineHeight: 1.55, paddingBottom: 10, borderBottom: `1.5px solid ${a}25`, marginBottom: 12 }}>
          {cv.summary}
        </div>

        {/* Experience */}
        <ModernSection title="Experience" color={a} />
        {cv.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title} <span style={{ fontWeight: 400, color: '#999' }}>@ {exp.company}</span></div>
            <div style={{ fontSize: 9, color: '#aaa' }}>{exp.date}</div>
            <Bullets items={exp.bullets} />
          </div>
        ))}

        {/* Education */}
        <ModernSection title="Education" color={a} />
        <div style={{ fontSize: 12, fontWeight: 700 }}>{cv.education.degree}</div>
        <div style={{ fontSize: 10, color: '#777' }}>{cv.education.school} — {cv.education.years} · GPA: {cv.education.gpa}</div>

        {/* Skills as pills */}
        <ModernSection title="Skills" color={a} style={{ marginTop: 12 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Object.values(cv.skills).join(', ').split(', ').map((s, i) => (
            <span key={i} style={{
              fontSize: 8, padding: '2px 8px', background: `${a}10`,
              color: a, border: `1px solid ${a}30`, borderRadius: 3, fontWeight: 500,
            }}>{s}</span>
          ))}
        </div>

        {/* Projects */}
        <ModernSection title="Projects" color={a} style={{ marginTop: 12 }} />
        {cv.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</span>
            <span style={{ fontSize: 10, color: '#777' }}> — {p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 3 — Two-Column (sidebar + main)
   Dark sidebar, initials avatar, split layout
   ═══════════════════════════════════════════════════════ */
function CVTwoCol({ cv }) {
  const initials = cv.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{ ...base, display: 'flex', gap: 0, padding: 0 }}>
      {/* Dark sidebar */}
      <div style={{ width: '35%', background: '#1e293b', color: '#e2e8f0', padding: '24px 14px', flexShrink: 0 }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', background: '#38bdf8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 12,
        }}>{initials}</div>

        {/* Contact */}
        <SideHeading>Contact</SideHeading>
        <SideText>{cv.email}</SideText>
        <SideText>{cv.phone}</SideText>
        <SideText>{cv.location}</SideText>
        <SideText style={{ color: '#38bdf8' }}>{cv.linkedin}</SideText>

        {/* Skills */}
        <SideHeading style={{ marginTop: 16 }}>Skills</SideHeading>
        {Object.values(cv.skills).join(', ').split(', ').map((s, i) => (
          <div key={i} style={{ fontSize: 9, color: '#cbd5e1', marginBottom: 2 }}>▸ {s}</div>
        ))}

        {/* Languages */}
        <SideHeading style={{ marginTop: 16 }}>Languages</SideHeading>
        {cv.languages.map((l, i) => (
          <div key={i} style={{ fontSize: 9, color: '#cbd5e1', marginBottom: 3 }}>
            <span style={{ fontWeight: 600 }}>{l.lang}</span>
            <span style={{ color: '#94a3b8' }}> — {l.level}</span>
          </div>
        ))}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, padding: '24px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', color: '#111' }}>{cv.name}</div>
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 10 }}>
          {cv.role}
        </div>
        <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5, marginBottom: 14 }}>{cv.summary}</div>

        <TwoColHeading>Experience</TwoColHeading>
        {cv.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
            <div style={{ fontSize: 9, color: '#64748b' }}>{exp.company} · {exp.date}</div>
            <Bullets items={exp.bullets} />
          </div>
        ))}

        <TwoColHeading>Education</TwoColHeading>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{cv.education.degree}</div>
        <div style={{ fontSize: 9, color: '#64748b' }}>{cv.education.school} · {cv.education.years}</div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>GPA: {cv.education.gpa}</div>

        <TwoColHeading style={{ marginTop: 10 }}>Projects</TwoColHeading>
        {cv.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</span>
            <span style={{ fontSize: 9.5, color: '#64748b' }}> — {p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 4 — Minimal Swiss (Helvetica, grid, b&w)
   Ultra-clean, no color, bold hierarchy, lots of space
   ═══════════════════════════════════════════════════════ */
function CVMinimal({ cv }) {
  return (
    <div style={{ ...base, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header - large bold name */}
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1, color: '#111' }}>
        {cv.name}
      </div>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginTop: 4 }}>
        {cv.role}
      </div>
      <div style={{ fontSize: 8.5, color: '#aaa', marginTop: 6, letterSpacing: '0.04em' }}>
        {cv.email} &nbsp;·&nbsp; {cv.phone} &nbsp;·&nbsp; {cv.location}
      </div>
      <div style={{ height: 2, background: '#111', margin: '14px 0' }} />

      {/* Summary */}
      <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6, marginBottom: 14 }}>{cv.summary}</div>

      {/* Experience */}
      <MinHeading>Experience</MinHeading>
      {cv.experience.map((exp, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{exp.title}</div>
            <div style={{ fontSize: 8.5, color: '#999', flexShrink: 0 }}>{exp.date}</div>
          </div>
          <div style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>{exp.company}</div>
          <Bullets items={exp.bullets} />
        </div>
      ))}

      {/* Two column: Education + Languages */}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <MinHeading>Education</MinHeading>
          <div style={{ fontSize: 11, fontWeight: 800 }}>{cv.education.degree}</div>
          <div style={{ fontSize: 9.5, color: '#777' }}>{cv.education.school}</div>
          <div style={{ fontSize: 9, color: '#aaa' }}>{cv.education.years} · GPA: {cv.education.gpa}</div>
        </div>
        <div style={{ flex: 1 }}>
          <MinHeading>Languages</MinHeading>
          {cv.languages.map((l, i) => (
            <div key={i} style={{ fontSize: 10, color: '#555', marginBottom: 1 }}>
              <b>{l.lang}</b> — {l.level}
            </div>
          ))}
        </div>
      </div>

      {/* Skills — flat text */}
      <MinHeading style={{ marginTop: 12 }}>Technical Skills</MinHeading>
      <div style={{ fontSize: 10, color: '#555', lineHeight: 1.7 }}>
        {Object.values(cv.skills).join('  /  ')}
      </div>

      {/* Projects */}
      <MinHeading style={{ marginTop: 12 }}>Projects</MinHeading>
      {cv.projects.map((p, i) => (
        <div key={i} style={{ marginBottom: 3 }}>
          <span style={{ fontWeight: 800, fontSize: 10.5 }}>{p.name}</span>
          <span style={{ fontSize: 9.5, color: '#777' }}> — {p.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── Shared helpers ───── */
const base = {
  width: '100%', height: '100%', background: '#ffffff', color: '#1a1a1a',
  fontFamily: sans, fontSize: 11, lineHeight: 1.45,
  padding: '24px 28px', boxSizing: 'border-box',
  overflow: 'hidden',
};

function Hr() {
  return <div style={{ width: '100%', height: 1.5, background: '#d0d0d0', margin: '10px 0 12px' }} />;
}

function Row({ left, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div>{left}</div>
      <div style={{ fontSize: 9, color: '#999', flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ margin: '3px 0 0', padding: '0 0 0 14px' }}>
      {items.map((b, i) => (
        <li key={i} style={{ fontSize: 10, color: '#555', marginBottom: 1.5, lineHeight: 1.45 }}>{b}</li>
      ))}
    </ul>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#333', marginBottom: 2 }}>
        {title}
      </div>
      <div style={{ width: '100%', height: 1, background: '#d0d0d0', marginBottom: 6 }} />
      {children}
    </div>
  );
}

function ModernSection({ title, color, style: s }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
      color, borderBottom: `2px solid ${color}`, paddingBottom: 2, marginBottom: 6, ...s,
    }}>{title}</div>
  );
}

function SideHeading({ children, style: s }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
      color: '#38bdf8', marginBottom: 6, ...s,
    }}>{children}</div>
  );
}

function SideText({ children, style: s }) {
  return <div style={{ fontSize: 8.5, color: '#94a3b8', lineHeight: 1.5, ...s }}>{children}</div>;
}

function TwoColHeading({ children, style: s }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: '#1e293b', borderBottom: '1.5px solid #e2e8f0', paddingBottom: 2, marginBottom: 6, ...s,
    }}>{children}</div>
  );
}

function MinHeading({ children, style: s }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em',
      color: '#333', marginBottom: 6, ...s,
    }}>{children}</div>
  );
}

const templates = [CVClassic, CVModern, CVTwoCol, CVMinimal];

/* ───── Main Showcase ───── */
export default function CVShowcase() {
  return (
    <div style={{ height: '700px', width: '100%', maxWidth: '500px', position: 'relative' }}>
      <CardSwap
        cardDistance={40}
        verticalDistance={28}
        delay={4000}
        pauseOnHover={false}
      >
        {cvData.map((cv, i) => {
          const Template = templates[i];
          return (
            <Card key={i}>
              <Template cv={cv} />
            </Card>
          );
        })}
      </CardSwap>
    </div>
  );
}
