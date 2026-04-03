import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown,
  Phone, MapPin, Briefcase, GraduationCap,
  Code, Heart, Globe, FileText, Layers,
  CheckCircle, AlertCircle, X, Check, PanelLeftClose,
  Download, Eye, GripVertical, ImagePlus, User
} from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import { getTemplateById } from '../../Features/CVManagement/index.js';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ─── Data helpers ─────────────────────────────────────────────────────────────
const newExp    = () => ({ institutionName: '', position: '', duration: '', summary: '' });
const newEdu    = () => ({ institutionName: '', certification: '', duration: '', summary: '' });
const newCustomSection = () => ({ title: '', items: [newCustomItem()] });
const newCustomItem    = () => ({ name: '', description: '', duration: '', link: '' });

const DEFAULT_SECTION_ORDER = [
  'summary','contact','address','experience',
  'education','technicalSkills','softSkills','language','customSections',
];

// ─── All available sections (palette) ─────────────────────────────────────────
const ALL_SECTIONS = [
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
const getSectionMeta = (key) => ALL_SECTIONS.find((s) => s.key === key) || ALL_SECTIONS[0];

// ─── Tag chip input ────────────────────────────────────────────────────────────
function TagInput({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = (v) => { const t = v.trim(); if (t && !value.includes(t)) onChange([...value, t]); setDraft(''); };
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); }
    else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
  };
  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 border-2 border-[var(--border-color)] bg-[var(--bg)] min-h-[44px] cursor-text items-center"
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--yellow)] text-[#0a0a0a] border-2 border-[#0a0a0a] font-mono text-[10px] font-bold uppercase tracking-wider">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="flex items-center hover:opacity-70">
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[60px] bg-transparent border-none outline-none font-mono text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]"
      />
    </div>
  );
}

// ─── Form field label wrapper ──────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
        {label}{hint && <span className="normal-case tracking-normal font-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inpCls = "w-full border-2 border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--yellow)] focus:bg-[rgba(255,230,48,0.08)] transition-colors";
const txtCls = `${inpCls} resize-y min-h-[80px] leading-relaxed`;

// ─── Repeatable item (exp / edu) ───────────────────────────────────────────────
function RepeatableItem({ children, onDelete, onMoveUp, onMoveDown, canUp, canDown }) {
  return (
    <div className="border-2 border-[var(--border-color)] bg-[var(--bg)] p-3 flex flex-col gap-2">
      {children}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-dashed border-[var(--border-color)]">
        <div className="flex gap-1">
          {[{ fn: onMoveUp, Icon: ChevronUp, ok: canUp }, { fn: onMoveDown, Icon: ChevronDown, ok: canDown }].map(({ fn, Icon, ok }, i) => (
            <button key={i} type="button" onClick={fn} disabled={!ok}
              className={`border-2 border-[var(--border-color)] p-1 flex items-center ${ok ? 'cursor-pointer hover:bg-[var(--card-bg)]' : 'opacity-30 cursor-not-allowed'}`}>
              <Icon size={12} />
            </button>
          ))}
        </div>
        <button type="button" onClick={onDelete}
          className="flex items-center gap-1 border-2 border-red-500 text-red-500 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 hover:bg-red-500 hover:text-white transition-colors">
          <Trash2 size={10} /> Remove
        </button>
      </div>
    </div>
  );
}

// ─── Add-row button ────────────────────────────────────────────────────────────
function AddBtn({ label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[11px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors bg-transparent">
      <Plus size={12} /> {label}
    </button>
  );
}

// ─── Individual section FORM cards ─────────────────────────────────────────────
function SectionCard({ sectionKey, form, handlers, onRemove, collapsed, onToggleCollapse }) {
  const meta = getSectionMeta(sectionKey);
  const Icon = meta.icon;
  const { setForm, exp, edu, set, setContact, setAddress,
    addCustomSection, removeCustomSection, updateCustomSectionTitle,
    addCustomItem, removeCustomItem, updateCustomItem } = handlers;

  const formBody = () => {
    switch (sectionKey) {
      case 'summary':
        return (
          <div className="flex flex-col gap-3">
            <Field label="Job Title">
              <input className={inpCls} value={form.jobTitle}
                onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                placeholder="e.g. Frontend Engineer" />
            </Field>
            <Field label="Professional Summary" hint="2–4 sentences about yourself">
              <textarea className={txtCls} value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                placeholder="Results-driven engineer with 3+ years..." />
            </Field>
          </div>
        );

      case 'contact':
        return (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Phone',    key: 'phone',    placeholder: '+1 (555) 000-0000' },
              { label: 'Email',    key: 'email',    placeholder: 'you@example.com' },
              { label: 'LinkedIn', key: 'linkedin', placeholder: 'linkedin.com/in/username' },
              { label: 'GitHub',   key: 'github',   placeholder: 'github.com/username' },
            ].map(({ label, key, placeholder }) => (
              <Field key={key} label={label}>
                <input className={inpCls} value={form.contact[key]} onChange={setContact(key)} placeholder={placeholder} />
              </Field>
            ))}
          </div>
        );

      case 'address':
        return (
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className={inpCls} value={form.address.city} onChange={setAddress('city')} placeholder="San Francisco" />
            </Field>
            <Field label="Street">
              <input className={inpCls} value={form.address.street} onChange={setAddress('street')} placeholder="42 Market St" />
            </Field>
          </div>
        );

      case 'experience':
        return (
          <div className="flex flex-col gap-3">
            {form.experience.length === 0 && (
              <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-3">No entries yet — add one below.</p>
            )}
            {form.experience.map((item, i) => (
              <RepeatableItem key={i} onDelete={() => exp.remove(i)} onMoveUp={() => exp.moveUp(i)}
                onMoveDown={() => exp.moveDown(i)} canUp={i > 0} canDown={i < form.experience.length - 1}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Company / Institution">
                    <input className={inpCls} value={item.institutionName} onChange={(e) => exp.update(i, 'institutionName', e.target.value)} placeholder="Google Inc." />
                  </Field>
                  <Field label="Position / Role">
                    <input className={inpCls} value={item.position} onChange={(e) => exp.update(i, 'position', e.target.value)} placeholder="Senior Engineer" />
                  </Field>
                </div>
                <Field label="Duration (years)">
                  <input className={`${inpCls} max-w-[120px]`} type="number" min="0" step="0.5"
                    value={item.duration} onChange={(e) => exp.update(i, 'duration', e.target.value)} placeholder="2" />
                </Field>
                <Field label="Description">
                  <textarea className={txtCls} value={item.summary} onChange={(e) => exp.update(i, 'summary', e.target.value)} placeholder="Key achievements..." />
                </Field>
              </RepeatableItem>
            ))}
            <AddBtn label="Add Experience Entry" onClick={() => exp.add(newExp())} />
          </div>
        );

      case 'education':
        return (
          <div className="flex flex-col gap-3">
            {form.education.length === 0 && (
              <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-3">No entries yet — add one below.</p>
            )}
            {form.education.map((item, i) => (
              <RepeatableItem key={i} onDelete={() => edu.remove(i)} onMoveUp={() => edu.moveUp(i)}
                onMoveDown={() => edu.moveDown(i)} canUp={i > 0} canDown={i < form.education.length - 1}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Institution">
                    <input className={inpCls} value={item.institutionName} onChange={(e) => edu.update(i, 'institutionName', e.target.value)} placeholder="MIT" />
                  </Field>
                  <Field label="Degree / Certification">
                    <input className={inpCls} value={item.certification} onChange={(e) => edu.update(i, 'certification', e.target.value)} placeholder="B.Sc. Computer Science" />
                  </Field>
                </div>
                <Field label="Duration (years)">
                  <input className={`${inpCls} max-w-[120px]`} type="number" min="0" step="0.5"
                    value={item.duration} onChange={(e) => edu.update(i, 'duration', e.target.value)} placeholder="4" />
                </Field>
                <Field label="Notes / Honors">
                  <textarea className={txtCls} value={item.summary} onChange={(e) => edu.update(i, 'summary', e.target.value)} placeholder="Graduated with honors..." />
                </Field>
              </RepeatableItem>
            ))}
            <AddBtn label="Add Education Entry" onClick={() => edu.add(newEdu())} />
          </div>
        );

      case 'technicalSkills':
        return (
          <Field label="Technical Skills" hint="press Enter or comma to add a tag">
            <TagInput value={form.technicalSkills} onChange={set('technicalSkills')} placeholder="React, Node.js, Python..." />
          </Field>
        );

      case 'softSkills':
        return (
          <Field label="Soft Skills" hint="press Enter or comma to add">
            <TagInput value={form.softSkills} onChange={set('softSkills')} placeholder="Leadership, Communication..." />
          </Field>
        );

      case 'language':
        return (
          <Field label="Languages" hint="press Enter or comma to add">
            <TagInput value={form.language} onChange={set('language')} placeholder="English, Arabic, French..." />
          </Field>
        );

      case 'customSections':
        return (
          <div className="flex flex-col gap-4">
            {form.customSections.length === 0 && (
              <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-2">Add a custom section (Projects, Certifications, etc.)</p>
            )}
            {form.customSections.map((section, si) => (
              <div key={si} className="border-2 border-[var(--border-color)] bg-[var(--bg)]">
                <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-[var(--border-color)] bg-[var(--card-bg)]">
                  <input
                    className="flex-1 bg-transparent border-none outline-none font-['Space_Grotesk'] font-bold text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]"
                    value={section.title}
                    onChange={(e) => updateCustomSectionTitle(si, e.target.value)}
                    placeholder="Section title (e.g. Projects)"
                  />
                  <button type="button" onClick={() => removeCustomSection(si)}
                    className="text-red-500 hover:text-red-700 flex items-center p-0.5">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="border border-[var(--border-color)] p-2.5 bg-[var(--card-bg)] flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Name *">
                          <input className={inpCls} value={item.name} onChange={(e) => updateCustomItem(si, ii, 'name', e.target.value)} placeholder="Project name" />
                        </Field>
                        <Field label="Year / Duration">
                          <input className={inpCls} value={item.duration} onChange={(e) => updateCustomItem(si, ii, 'duration', e.target.value)} placeholder="2024" />
                        </Field>
                      </div>
                      <Field label="Description">
                        <textarea className={`${txtCls} min-h-[56px]`} value={item.description} onChange={(e) => updateCustomItem(si, ii, 'description', e.target.value)} placeholder="Brief description..." />
                      </Field>
                      <Field label="Link (optional)">
                        <input className={inpCls} value={item.link} onChange={(e) => updateCustomItem(si, ii, 'link', e.target.value)} placeholder="https://github.com/..." />
                      </Field>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => removeCustomItem(si, ii)}
                          className="flex items-center gap-1 border border-red-400 text-red-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 hover:bg-red-400 hover:text-white transition-colors">
                          <X size={9} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addCustomItem(si)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[10px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors">
                    <Plus size={11} /> Add Item
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addCustomSection}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-[var(--yellow)] text-[var(--fg)] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider hover:bg-[rgba(255,230,48,0.08)] transition-colors">
              <Plus size={14} /> Add Custom Section
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border-[3px] border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden flex-shrink-0">
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b-[3px] border-[var(--border-color)]"
        style={{ background: meta.accent }}>
        <GripVertical size={14} style={{ color: meta.textColor, opacity: 0.5, cursor: 'grab', flexShrink: 0 }} />
        <Icon size={15} style={{ color: meta.textColor }} />
        <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-[0.1em] flex-1"
          style={{ color: meta.textColor }}>
          {meta.label}
        </span>
        {/* Collapse toggle */}
        <button type="button" onClick={onToggleCollapse}
          title={collapsed ? 'Expand section' : 'Collapse section'}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: meta.textColor, display: 'flex', alignItems: 'center', padding: '2px 6px' }}>
          <ChevronDown size={14}
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.22s ease' }} />
        </button>
        {/* Remove */}
        <button type="button" onClick={onRemove}
          className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border transition-colors"
          style={{ borderColor: meta.textColor, color: meta.textColor, background: 'transparent', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <X size={9} /> Remove
        </button>
      </div>
      {/* Collapsible body */}
      <div style={{
        maxHeight: collapsed ? 0 : 2000,
        overflow: 'hidden',
        transition: 'max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div className="p-4">
          {formBody()}
        </div>
      </div>
    </div>
  );
}

// ─── Live preview ──────────────────────────────────────────────────────────────
function LivePreview({ formData, userName, templateId }) {
  const template = getTemplateById(templateId);
  const TemplateComponent = template?.component;
  const ZOOM = 0.52;
  if (!TemplateComponent) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-[3px] border-[var(--border-color)] border-b-2 bg-[var(--nav-bg)] flex-shrink-0">
        <div className="flex gap-1.5">
          {['#ff5f57','#febc2e','#28c840'].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, border: '1.5px solid rgba(0,0,0,0.18)' }} />
          ))}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--fg-muted)] ml-1 flex-1">
          Preview — {template.name}
        </span>
        <span className="font-mono text-[9px] text-[var(--fg-muted)]">A4 · {Math.round(ZOOM * 100)}%</span>
      </div>
      {/* Preview viewport */}
      <div className="flex-1 overflow-auto flex justify-center p-4 border-[3px] border-[var(--border-color)] border-t-0"
        style={{ background: '#b0ada6', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}>
        
        {/* Container that acts as the scaled A4 wrapper */}
        <div style={{
           display: 'flex',
           justifyContent: 'center',
           transformOrigin: 'top center',
           transform: `scale(${ZOOM})`,
           marginBottom: `${(ZOOM - 1) * 1123}px`, // Adjust container height for scaled child
           height: 'max-content'
        }}>
           <div data-cv-content style={{
             width: '794px',         // A4 width at 96 dpi
             minHeight: '1123px',    // A4 height
             height: '1123px',       // Strict A4 height to prevent infinite growth
             overflow: 'hidden',     // Clip text that overflows the A4 page
             background: '#fff',
             boxShadow: '0 6px 32px rgba(0,0,0,0.28)',
             pointerEvents: 'none',
             userSelect: 'none',
           }}>
             <TemplateComponent userName={userName} cvData={formData} />
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main editor ───────────────────────────────────────────────────────────────
export default function CVEditor() {
  const { id }   = useParams();
  const { user } = useAuth();

  const [cv, setCv]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [sidebarOpen, setSidebarOpen]             = useState(true);
  const [activeSections, setActiveSections]       = useState(['summary']);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showPreview, setShowPreview]             = useState(false);
  const [downloadingPdf, setDownloadingPdf]       = useState(false);
  const [dragOverKey, setDragOverKey]             = useState(null);
  const dragItemRef = useRef(null);
  const previewRef  = useRef(null);

  const [form, setForm] = useState({
    fullName: '', jobTitle: '', summary: '',
    contact:  { phone: '', email: '', github: '', linkedin: '' },
    address:  { city: '', street: '' },
    experience: [], education: [],
    technicalSkills: [], softSkills: [], language: [],
    customSections: [],
    profileImage: '',
    layout: { sectionOrder: [...DEFAULT_SECTION_ORDER], visibleSections: {} },
  });

  const userName = form.fullName?.trim() || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Your Name');

  // ── Load CV ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/cvs/${id}`);
        const d   = res.data.data.cv;
        setCv(d);
        setForm({
          fullName: d.fullName || '',
          jobTitle: d.jobTitle || '',
          summary:  d.summary  || '',
          contact:  { phone: '', email: '', github: '', linkedin: '', ...d.contact },
          address:  { city: '', street: '', ...d.address },
          experience:      d.experience?.map((e) => ({ institutionName: e.institutionName, position: e.position, duration: String(e.duration ?? ''), summary: e.summary || '' })) || [],
          education:       d.education?.map((e) => ({ institutionName: e.institutionName, certification: e.certification, duration: String(e.duration ?? ''), summary: e.summary || '' })) || [],
          technicalSkills: d.technicalSkills || [],
          softSkills:      d.softSkills      || [],
          language:        d.language        || [],
          customSections:  d.customSections?.map((s) => ({
            title: s.title,
            items: s.items?.map((it) => ({ name: it.name, description: it.description || '', duration: String(it.duration ?? ''), link: it.link || '' })) || [],
          })) || [],
          profileImage: d.profileImage || '',
          layout: {
            sectionOrder:    d.layout?.sectionOrder?.length ? d.layout.sectionOrder : [...DEFAULT_SECTION_ORDER],
            visibleSections: d.layout?.visibleSections ? Object.fromEntries(Object.entries(d.layout.visibleSections)) : {},
          },
        });
        // Auto-activate sections that have data
        const auto = [];
        if (d.jobTitle || d.summary)                                auto.push('summary');
        if (d.contact && Object.values(d.contact).some(Boolean))    auto.push('contact');
        if (d.address && Object.values(d.address).some(Boolean))    auto.push('address');
        if (d.experience?.length)                                    auto.push('experience');
        if (d.education?.length)                                     auto.push('education');
        if (d.technicalSkills?.length)                               auto.push('technicalSkills');
        if (d.softSkills?.length)                                    auto.push('softSkills');
        if (d.language?.length)                                      auto.push('language');
        if (d.customSections?.length)                                auto.push('customSections');
        setActiveSections(auto.length ? [...new Set(['summary', ...auto])] : ['summary']);
      } catch {
        showToast('error', 'Failed to load CV.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const getFilteredFormData = useCallback(() => {
    const f = { ...form };
    f.fullName = form.fullName || '';
    if (!activeSections.includes('summary'))        { f.jobTitle = ''; f.summary = ''; }
    if (!activeSections.includes('contact'))         { f.contact = { phone: '', email: '', github: '', linkedin: '' }; }
    if (!activeSections.includes('address'))          { f.address = { city: '', street: '' }; }
    if (!activeSections.includes('experience'))       { f.experience = []; }
    if (!activeSections.includes('education'))        { f.education = []; }
    if (!activeSections.includes('technicalSkills'))  { f.technicalSkills = []; }
    if (!activeSections.includes('softSkills'))       { f.softSkills = []; }
    if (!activeSections.includes('language'))         { f.language = []; }
    if (!activeSections.includes('customSections'))   { f.customSections = []; }
    
    // Inject active section array layout for dynamic templates to sort
    f.layout = {
      ...(f.layout || {}),
      sectionOrder: activeSections
    };

    return f;
  }, [form, activeSections]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const filtered = getFilteredFormData();
      const visibleSections = {};
      activeSections.forEach((k) => { visibleSections[k] = true; });
      await api.patch(`/cvs/${id}`, {
        ...filtered,
        experience:     filtered.experience.map((e) => ({ ...e, duration: Number(e.duration) || 0 })),
        education:      filtered.education.map((e) => ({ ...e, duration: Number(e.duration) || 0 })),
        customSections: filtered.customSections.map((s) => ({
          title: s.title,
          items: s.items.map((it) => ({
            name: it.name, description: it.description,
            duration: it.duration !== '' ? Number(it.duration) : undefined,
            link: it.link,
          })),
        })),
        profileImage: form.profileImage,
        layout: { sectionOrder: [...activeSections], visibleSections },
      });
      showToast('success', 'CV saved!');
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  // ── Section toggles ───────────────────────────────────────────────────────────
  const toggleSection  = (key) => setActiveSections((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key]);
  const toggleCollapse = (key) => setCollapsedSections((p) => ({ ...p, [key]: !p[key] }));

  // ── Form handlers ─────────────────────────────────────────────────────────────
  const set        = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setContact = (key) => (e)   => setForm((f) => ({ ...f, contact: { ...f.contact, [key]: e.target.value } }));
  const setAddress = (key) => (e)   => setForm((f) => ({ ...f, address: { ...f.address, [key]: e.target.value } }));

  const makeArr = (key) => ({
    add:      (tmpl) => setForm((f) => ({ ...f, [key]: [...f[key], tmpl] })),
    remove:   (i)    => setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) })),
    update:   (i, field, val) => setForm((f) => { const a = [...f[key]]; a[i] = { ...a[i], [field]: val }; return { ...f, [key]: a }; }),
    moveUp:   (i)    => setForm((f) => { if (!i) return f; const a = [...f[key]]; [a[i-1],a[i]]=[a[i],a[i-1]]; return { ...f, [key]: a }; }),
    moveDown: (i)    => setForm((f) => { if (i >= f[key].length-1) return f; const a=[...f[key]]; [a[i],a[i+1]]=[a[i+1],a[i]]; return { ...f, [key]: a }; }),
  });
  const exp = makeArr('experience');
  const edu = makeArr('education');

  const addCustomSection         = ()         => setForm((f) => ({ ...f, customSections: [...f.customSections, newCustomSection()] }));
  const removeCustomSection      = (si)       => setForm((f) => ({ ...f, customSections: f.customSections.filter((_, i) => i !== si) }));
  const updateCustomSectionTitle = (si, val)  => setForm((f) => { const a=[...f.customSections]; a[si]={...a[si],title:val}; return { ...f, customSections:a }; });
  const addCustomItem            = (si)       => setForm((f) => { const a=[...f.customSections]; a[si]={...a[si],items:[...a[si].items,newCustomItem()]}; return { ...f, customSections:a }; });
  const removeCustomItem         = (si,ii)    => setForm((f) => { const a=[...f.customSections]; a[si]={...a[si],items:a[si].items.filter((_,i)=>i!==ii)}; return { ...f, customSections:a }; });
  const updateCustomItem         = (si,ii,field,val) => setForm((f) => { const a=[...f.customSections]; const items=[...a[si].items]; items[ii]={...items[ii],[field]:val}; a[si]={...a[si],items}; return { ...f, customSections:a }; });

  const handlers = { setForm, exp, edu, set, setContact, setAddress, addCustomSection, removeCustomSection, updateCustomSectionTitle, addCustomItem, removeCustomItem, updateCustomItem };

  // ── Drag-and-drop section reorder ─────────────────────────────────────────────
  const onDragStart = (key) => { dragItemRef.current = key; };
  const onDragOver = (e, key) => { e.preventDefault(); if (dragItemRef.current !== key) setDragOverKey(key); };
  const onDragLeave = () => setDragOverKey(null);
  const onDrop = (targetKey) => {
    const srcKey = dragItemRef.current;
    if (!srcKey || srcKey === targetKey) { setDragOverKey(null); return; }
    setActiveSections((prev) => {
      const arr = [...prev];
      const fromIdx = arr.indexOf(srcKey);
      const toIdx   = arr.indexOf(targetKey);
      if (fromIdx < 0 || toIdx < 0) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, srcKey);
      return arr;
    });
    dragItemRef.current = null;
    setDragOverKey(null);
  };
  const onDragEnd = () => { dragItemRef.current = null; setDragOverKey(null); };

  // ── Download PDF ──────────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const el = previewRef.current?.querySelector('[data-cv-content]');
      if (!el) { showToast('error', 'Preview not ready.'); return; }
      
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML)
        .join('\n');

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}<style>body{margin:0;padding:0;} * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }</style></head><body>${el.innerHTML}</body></html>`;
            const res = await api.post(`/cvs/${id}/download-pdf`, { html: htmlContent }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.jobTitle || 'CV'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'PDF downloaded!');
    } catch (err) {
      showToast('error', 'Failed to generate PDF.');
    } finally { setDownloadingPdf(false); }
  };

  // ── Profile image upload ──────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512000) { showToast('error', 'Image must be under 500KB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, profileImage: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const removeProfileImage = () => setForm((f) => ({ ...f, profileImage: '' }));

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
        <span className="font-mono text-sm tracking-[0.1em] text-[var(--fg-muted)]">LOADING CV…</span>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">

      {/* ── Nav ── */}
      <div className="flex-shrink-0 px-8">
        <DashboardNav role="employee" />
      </div>

      {/* ── Action bar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 border-t-2 border-b-[3px] border-[var(--border-color)] bg-[var(--bg)]">
        <Link to="/employee/cvs"
          className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-1.5 border-2 border-[var(--border-color)] bg-[var(--card-bg)] hover:text-[var(--fg)] transition-colors no-underline">
          <ArrowLeft size={12} /> Back
        </Link>
        <div className="flex-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">Editing</div>
          <div className="font-['Space_Grotesk'] font-black text-sm tracking-tight text-[var(--fg)]">
            {form.jobTitle || 'Untitled CV'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview button */}
          <button onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-4 py-2.5 bg-[var(--card-bg)] text-[var(--fg)] border-[3px] border-[var(--border-color)] transition-all hover:border-[var(--fg)] hover:translate-x-0.5 hover:translate-y-0.5"
            style={{ boxShadow: '3px 3px 0 var(--border-color)' }}>
            <Eye size={13} /> Preview
          </button>
          {/* Download PDF button */}
          <button onClick={handleDownloadPdf} disabled={downloadingPdf}
            className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-4 py-2.5 bg-[var(--card-bg)] text-[var(--fg)] border-[3px] border-[var(--border-color)] transition-all hover:border-[var(--fg)] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: downloadingPdf ? 'none' : '3px 3px 0 var(--border-color)' }}>
            <Download size={13} /> {downloadingPdf ? 'Generating…' : 'Download PDF'}
          </button>
          {/* Save CV button */}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 font-['Space_Grotesk'] font-black text-xs uppercase tracking-wider px-5 py-2.5 bg-[var(--yellow)] text-[#0a0a0a] border-[3px] border-[#0a0a0a] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: saving ? 'none' : '4px 4px 0 #0a0a0a' }}>
            <Save size={13} /> {saving ? 'Saving…' : 'Save CV'}
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 border-[3px] border-[#0a0a0a] font-['Space_Grotesk'] font-bold text-sm text-[#0a0a0a] ${toast.type === 'success' ? 'bg-[var(--mint)]' : 'bg-[var(--coral)]'}`}
          style={{ boxShadow: '5px 5px 0 #0a0a0a' }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── 3-column content ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ══ SIDEBAR: section palette ══ */}
        <div
          className="flex-shrink-0 border-r-[3px] border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col overflow-hidden"
          style={{
            width: sidebarOpen ? 224 : 52,
            transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Sidebar header */}
          <div className="flex items-center border-b-2 border-[var(--border-color)] flex-shrink-0 overflow-hidden"
            style={{ minHeight: 48 }}>
            {sidebarOpen && (
              <div className="px-4 flex-1 overflow-hidden">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--fg-muted)] whitespace-nowrap">CV Sections</p>
                <p className="font-['Space_Grotesk'] font-black text-xs mt-0.5 whitespace-nowrap">Click to add →</p>
              </div>
            )}
            {/* Expand / collapse toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="flex-shrink-0 w-[52px] h-[48px] flex items-center justify-center hover:bg-[var(--bg)] transition-colors"
              style={{ borderLeft: sidebarOpen ? '2px solid var(--border-color)' : 'none' }}
            >
              <div style={{
                transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
                transform: sidebarOpen ? 'none' : 'rotate(180deg)',
              }}>
                <PanelLeftClose size={15} className="text-[var(--fg-muted)]" />
              </div>
            </button>
          </div>

          {/* Section list */}
          <div className="flex-1 overflow-y-auto py-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(10,10,10,0.15) transparent' }}>
            {ALL_SECTIONS.map(({ key, label, icon: Icon, accent, textColor }) => {
              const active = activeSections.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSection(key)}
                  title={sidebarOpen ? undefined : label}
                  className="w-full flex items-center text-left transition-all relative"
                  style={{
                    gap: sidebarOpen ? 10 : 0,
                    padding: sidebarOpen ? '10px 16px' : '10px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    background: active ? accent : 'transparent',
                    borderLeft: active && sidebarOpen ? '4px solid #0a0a0a' : '4px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Active dot — collapsed only */}
                  {!sidebarOpen && active && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
                  )}
                  <Icon size={14} style={{ color: active ? textColor : 'var(--fg-muted)', flexShrink: 0 }} />
                  {sidebarOpen && (
                    <>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex-1 whitespace-nowrap overflow-hidden"
                        style={{ color: active ? textColor : 'var(--fg)' }}>
                        {label}
                      </span>
                      {active && (
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#0a0a0a] flex-shrink-0">
                          <Check size={9} color="#fff" strokeWidth={3} />
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar footer */}
          {sidebarOpen && (
            <div className="px-4 py-2.5 border-t-2 border-[var(--border-color)] flex-shrink-0">
              <p className="font-mono text-[9px] text-[var(--fg-muted)] whitespace-nowrap">
                <span className="font-bold text-[var(--fg)]">{activeSections.length}</span> / {ALL_SECTIONS.length} active
              </p>
            </div>
          )}
        </div>

        {/* ══ CENTER: form cards ══ */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg)]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(10,10,10,0.15) transparent' }}>

          {activeSections.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-10">
              <div className="w-16 h-16 border-[3px] border-dashed border-[var(--border-color)] flex items-center justify-center">
                <Plus size={24} className="text-[var(--fg-muted)]" />
              </div>
              <div>
                <p className="font-['Space_Grotesk'] font-black text-base uppercase tracking-tight">No sections yet</p>
                <p className="font-mono text-xs text-[var(--fg-muted)] mt-1">Click any section in the left sidebar to add it to your CV</p>
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              {/* Static Section: Name Override */}
              <div className="border-[3px] border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b-[3px] border-[var(--border-color)] bg-[var(--yellow)]">
                  <User size={15} color="#000" />
                  <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-[0.1em] text-[#0a0a0a] flex-1">CV Name Holder</span>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <label className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#0a0a0a]">Who is this CV for?</label>
                  <input 
                    className="w-full p-2.5 border-2 border-[var(--border-color)] bg-[var(--bg)] text-sm font-mono focus:outline-none focus:bg-[var(--yellow)]/10"
                    placeholder={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Default Name"}
                    value={form.fullName}
                    onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  />
                  <p className="font-mono text-[8px] text-[var(--fg-muted)]">Type any name here to override your account name on the CV preview and PDF.</p>
                </div>
              </div>

              {/* Profile image upload — shown for Two-Column template (id:5) */}
              {(cv?.templateId === 5) && (
                <div className="border-[3px] border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b-[3px] border-[var(--border-color)] bg-[#6c63ff]">
                    <ImagePlus size={15} style={{ color: '#fff' }} />
                    <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-[0.1em] text-white flex-1">Profile Photo</span>
                  </div>
                  <div className="p-4 flex items-center gap-4">
                    {form.profileImage ? (
                      <>
                        <img src={form.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border-color)]" />
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--fg)] px-3 py-1.5 border-2 border-[var(--border-color)] bg-[var(--bg)] hover:border-[var(--fg)] transition-colors">
                            <ImagePlus size={11} /> Change
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          <button onClick={removeProfileImage}
                            className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                            <Trash2 size={10} /> Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[11px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors cursor-pointer">
                        <ImagePlus size={14} /> Upload Profile Photo (max 500KB)
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}
              {activeSections.map((key) => (
                <div
                  key={key}
                  draggable
                  onDragStart={() => onDragStart(key)}
                  onDragOver={(e) => onDragOver(e, key)}
                  onDragLeave={onDragLeave}
                  onDrop={() => onDrop(key)}
                  onDragEnd={onDragEnd}
                  style={{
                    transition: 'transform 0.15s ease, opacity 0.15s ease',
                    transform: dragOverKey === key ? 'scale(1.01)' : 'none',
                    borderTop: dragOverKey === key ? '3px solid var(--yellow)' : '3px solid transparent',
                    cursor: 'grab',
                  }}
                >
                  <SectionCard
                    sectionKey={key}
                    form={form}
                    handlers={handlers}
                    onRemove={() => toggleSection(key)}
                    collapsed={!!collapsedSections[key]}
                    onToggleCollapse={() => toggleCollapse(key)}
                  />
                </div>
              ))}
              <div className="h-12" />
            </div>
          )}
        </div>

        {/* ══ RIGHT: live preview ══ */}
        <div ref={previewRef} className="w-[420px] flex-shrink-0 overflow-hidden flex flex-col p-3 pl-0 border-l-[3px] border-[var(--border-color)]">
          <LivePreview
            formData={getFilteredFormData()}
            userName={userName}
            templateId={cv?.templateId || 1}
          />
        </div>
      </div>

      {/* ── Full-screen Preview Modal ── */}
      {showPreview && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          {/* Modal top bar */}
          <div className="flex items-center gap-3 px-6 py-3 border-b-[3px] border-[var(--border-color)] bg-[var(--bg)] flex-shrink-0">
            <span className="font-['Space_Grotesk'] font-black text-sm uppercase tracking-wider flex-1">Full Preview</span>
            <button onClick={handleDownloadPdf} disabled={downloadingPdf}
              className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-[var(--card-bg)] text-[var(--fg)] border-2 border-[var(--border-color)] hover:border-[var(--fg)] transition-colors">
              <Download size={12} /> {downloadingPdf ? 'Generating…' : 'Download PDF'}
            </button>
            <button onClick={() => setShowPreview(false)}
              className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider px-4 py-2 bg-[var(--yellow)] text-[#0a0a0a] border-2 border-[#0a0a0a]">
              <X size={12} /> Close
            </button>
          </div>
          {/* Full preview body */}
          <div className="flex-1 overflow-y-auto flex justify-center p-8" style={{ background: '#b0ada6' }}>
            <div style={{
              width: '850px', // A4 width at full scale
              transformOrigin: 'top center',
              transform: 'scale(1)', // Let it take up the available width or scale if on small screens
              flexShrink: 0,
              background: '#fff',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
              alignSelf: 'flex-start',
              minHeight: '1100px' // A4 height at full scale
            }}>
              {(() => { const t = getTemplateById(cv?.templateId || 1); const C = t?.component; return C ? <C userName={userName} cvData={getFilteredFormData()} /> : null; })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
