import {
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Heart,
  Globe,
  FileText,
  Layers,
} from "lucide-react";

// ─── Data factories ───────────────────────────────────────────────────────────
export const newExp = () => ({
  institutionName: "",
  position: "",
  durationFrom: "",
  durationTo: "",
  summary: "",
});
export const newEdu = () => ({
  institutionName: "",
  certification: "",
  durationFrom: "",
  durationTo: "",
  summary: "",
});
export const newCustomSection = () => ({
  title: "",
  sectionType: "other",
  items: [newCustomItem()],
});
export const newCustomItem = () => ({
  name: "",
  description: "",
  durationFrom: "",
  durationTo: "",
  link: "",
});

// ─── Custom section types ─────────────────────────────────────────────────────
export const CUSTOM_SECTION_TYPES = [
  {
    value: "projects",
    label: "Projects",
    fields: ["name", "description", "durationFrom", "durationTo", "link"],
    defaultTitle: "Projects",
  },
  {
    value: "hobbies",
    label: "Hobbies",
    fields: ["name", "description"],
    defaultTitle: "Hobbies",
  },
  {
    value: "certifications",
    label: "Certifications",
    fields: ["name", "description", "durationFrom", "durationTo", "link"],
    defaultTitle: "Certifications",
  },
  {
    value: "other",
    label: "Other (Custom)",
    fields: ["name", "description", "durationFrom", "durationTo", "link"],
    defaultTitle: "",
  },
];

// ─── Default section order ────────────────────────────────────────────────────
export const DEFAULT_SECTION_ORDER = [
  "summary",
  "contact",
  "address",
  "experience",
  "education",
  "technicalSkills",
  "softSkills",
  "language",
  "customSections",
];

// ─── All available sections (palette) ─────────────────────────────────────────
export const ALL_SECTIONS = [
  {
    key: "summary",
    label: "Summary",
    icon: FileText,
    accent: "var(--nm-primary)",
    textColor: "#ffffff",
  },
  {
    key: "contact",
    label: "Contact",
    icon: Phone,
    accent: "var(--nm-surface-high)",
    textColor: "var(--nm-text-primary)",
  },
  {
    key: "address",
    label: "Address",
    icon: MapPin,
    accent: "var(--nm-surface-high)",
    textColor: "var(--nm-text-primary)",
  },
  {
    key: "experience",
    label: "Experience",
    icon: Briefcase,
    accent: "var(--nm-ink)",
    textColor: "#ffffff",
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    accent: "var(--nm-primary)",
    textColor: "#ffffff",
  },
  {
    key: "technicalSkills",
    label: "Technical Skills",
    icon: Code,
    accent: "var(--nm-warning)",
    textColor: "#ffffff",
  },
  {
    key: "softSkills",
    label: "Soft Skills",
    icon: Heart,
    accent: "var(--nm-error)",
    textColor: "#ffffff",
  },
  {
    key: "language",
    label: "Languages",
    icon: Globe,
    accent: "var(--nm-surface-high)",
    textColor: "var(--nm-text-primary)",
  },
  {
    key: "customSections",
    label: "Custom Sections",
    icon: Layers,
    accent: "var(--nm-primary)",
    textColor: "#ffffff",
  },
];

export const getSectionMeta = (key) =>
  ALL_SECTIONS.find((s) => s.key === key) || ALL_SECTIONS[0];

// ─── Shared CSS class strings ─────────────────────────────────────────────────
export const inpCls = "nm-input";
export const txtCls = "nm-input resize-y min-h-[100px]";
