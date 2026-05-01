
import CV_template_1 from './CV_template_1';
import CV_template_2 from './CV_template_2';
import CV_template_3 from './CV_template_3';
import CV_template_4 from './CV_template_4';
import CV_template_5 from './CV_template_5';
import CV_template_6 from './CV_template_6';
import CV_template_7 from './CV_template_7';
import CV_template_8 from './CV_template_8';
import CV_template_9 from './CV_template_9';
import CV_template_10 from './CV_template_10';

export const TEMPLATES = [
  {
    id: 1,
    name: 'Classic Minimal',
    description: 'Clean, bold header with structured sections. Timeless & ATS-friendly.',
    accent: '#0a0a0a',
    tag: 'Popular',
    component: CV_template_1,
  },
  {
    id: 2,
    name: 'Modern Minimal',
    description: 'Crisp typography with horizontal dividers. Professional and sleek.',
    accent: '#374151',
    tag: 'Clean',
    component: CV_template_2,
  },
  {
    id: 3,
    name: 'Executive',
    description: 'Sophisticated layout for senior-level roles with refined spacing.',
    accent: '#1e3a5f',
    tag: 'Premium',
    component: CV_template_3,
  },
  {
    id: 4,
    name: 'Blue Accent',
    description: 'Bold blue headers with structured grid skills. Corporate & modern.',
    accent: '#2563eb',
    tag: 'Corporate',
    component: CV_template_4,
  },
  {
    id: 5,
    name: 'Two-Column',
    description: 'Dark sidebar with timeline experience. Visually striking layout.',
    accent: '#4b4b4b',
    tag: 'Creative',
    component: CV_template_5,
  },
  {
    id: 6,
    name: 'Federal / Formal',
    description: 'Centered title with double-rule headers. Ideal for formal applications.',
    accent: '#6b7280',
    tag: 'Formal',
    component: CV_template_6,
  },
  {
    id: 7,
    name: 'Centered Formal',
    description: 'Symmetrical layout with elegant dividers. Balanced and authoritative.',
    accent: '#374151',
    tag: 'Elegant',
    component: CV_template_7,
  },
  {
    id: 8,
    name: 'ATS Proven (Harvard)',
    description: 'Clean, serif, single-column layout optimized for Applicant Tracking Systems.',
    accent: '#000000',
    tag: 'ATS Optimized',
    component: CV_template_8,
  },
  {
    id: 9,
    name: 'ATS Minimal',
    description: 'Ultra-clean sans-serif single column. High readability and standard layout.',
    accent: '#374151',
    tag: 'ATS Optimized',
    component: CV_template_9,
  },
  {
    id: 10,
    name: 'ATS Standard',
    description: 'Traditional standard layout with bullet points. Perfect for corporate roles.',
    accent: '#111827',
    tag: 'ATS Optimized',
    component: CV_template_10,
  },
];

// Helper: get a template by its id
export const getTemplateById = (id) =>
  TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
