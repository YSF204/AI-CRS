import {
  Phone, MapPin, Briefcase, GraduationCap,
  Code, Heart, Globe, FileText, Layers,
} from 'lucide-react';

// ─── Data factories ───────────────────────────────────────────────────────────
export const newExp  = () => ({ institutionName: '', position: '', durationFrom: '', durationTo: '', summary: '' });
export const newEdu  = () => ({ institutionName: '', certification: '', durationFrom: '', durationTo: '', summary: '' });
export const newCustomSection = () => ({ title: '', items: [newCustomItem()] });
export const newCustomItem    = () => ({ name: '', description: '', durationFrom: '', durationTo: '', link: '' });

// ─── Default section order ────────────────────────────────────────────────────
export const DEFAULT_SECTION_ORDER = [
  'summary', 'contact', 'address', 'experience',
  'education', 'technicalSkills', 'softSkills', 'language', 'customSections',
];

// ─── All available sections (palette) ─────────────────────────────────────────
export const ALL_SECTIONS = [
  { key: 'summary',         label: 'Summary',          icon: FileText,      accent: '#ffe630', textColor: '#0a0a0a' },
  { key: 'contact',         label: 'Contact',           icon: Phone,         accent: '#4ecdc4', textColor: '#0a0a0a' },
  { key: 'address',         label: 'Address',           icon: MapPin,        accent: '#ff6b6b', textColor: '#0a0a0a' },
  { key: 'experience',      label: 'Experience',        icon: Briefcase,     accent: '#6c63ff', textColor: '#ffffff' },
  { key: 'education',       label: 'Education',         icon: GraduationCap, accent: '#a78bfa', textColor: '#0a0a0a' },
  { key: 'technicalSkills', label: 'Technical Skills',  icon: Code,          accent: '#a8e6cf', textColor: '#0a0a0a' },
  { key: 'softSkills',      label: 'Soft Skills',       icon: Heart,         accent: '#ff6b6b', textColor: '#0a0a0a' },
  { key: 'language',        label: 'Languages',         icon: Globe,         accent: '#4ecdc4', textColor: '#0a0a0a' },
  { key: 'customSections',  label: 'Custom Sections',   icon: Layers,        accent: '#ffe630', textColor: '#0a0a0a' },
];

export const getSectionMeta = (key) => ALL_SECTIONS.find((s) => s.key === key) || ALL_SECTIONS[0];

// ─── Shared CSS class strings ─────────────────────────────────────────────────
export const inpCls = "w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] focus:bg-[rgba(255,230,48,0.08)] transition-colors";
export const txtCls = `${inpCls} resize-y min-h-[80px] leading-relaxed`;
