import { useState, useCallback } from 'react';
import { DEFAULT_SECTION_ORDER, newCustomSection, newCustomItem } from '../constants';

const INITIAL_FORM = {
  fullName: '', jobTitle: '', summary: '',
  contact:  { phone: '', email: '', github: '', linkedin: '' },
  address:  { city: '', street: '' },
  experience: [], education: [],
  technicalSkills: [], softSkills: [], language: [],
  customSections: [],
  profileImage: '',
  layout: { sectionOrder: [...DEFAULT_SECTION_ORDER], visibleSections: {} },
};

export default function useCVForm(showToast) {
  const [form, setForm] = useState({ ...INITIAL_FORM });

  // ── Simple field setters ──────────────────────────────────────────────────────
  const set        = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setContact = (key) => (e)   => setForm((f) => ({ ...f, contact: { ...f.contact, [key]: e.target.value } }));
  const setAddress = (key) => (e)   => setForm((f) => ({ ...f, address: { ...f.address, [key]: e.target.value } }));

  // ── Array helpers (experience / education) ────────────────────────────────────
  const makeArr = (key) => ({
    add:      (tmpl) => setForm((f) => ({ ...f, [key]: [...f[key], tmpl] })),
    remove:   (i)    => setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) })),
    update:   (i, field, val) => setForm((f) => { const a = [...f[key]]; a[i] = { ...a[i], [field]: val }; return { ...f, [key]: a }; }),
    moveUp:   (i)    => setForm((f) => { if (!i) return f; const a = [...f[key]]; [a[i-1],a[i]]=[a[i],a[i-1]]; return { ...f, [key]: a }; }),
    moveDown: (i)    => setForm((f) => { if (i >= f[key].length-1) return f; const a=[...f[key]]; [a[i],a[i+1]]=[a[i+1],a[i]]; return { ...f, [key]: a }; }),
  });
  const exp = makeArr('experience');
  const edu = makeArr('education');

  // ── Custom section CRUD ───────────────────────────────────────────────────────
  const addCustomSection         = ()         => setForm((f) => ({ ...f, customSections: [...f.customSections, newCustomSection()] }));
  const removeCustomSection      = (si)       => setForm((f) => ({ ...f, customSections: f.customSections.filter((_, i) => i !== si) }));
  const updateCustomSectionTitle = (si, val)  => setForm((f) => { const a=[...f.customSections]; a[si]={...a[si],title:val}; return { ...f, customSections:a }; });
  const addCustomItem            = (si)       => setForm((f) => { const a=[...f.customSections]; a[si]={...a[si],items:[...a[si].items,newCustomItem()]}; return { ...f, customSections:a }; });
  const removeCustomItem         = (si,ii)    => setForm((f) => { const a=[...f.customSections]; a[si]={...a[si],items:a[si].items.filter((_,i)=>i!==ii)}; return { ...f, customSections:a }; });
  const updateCustomItem         = (si,ii,field,val) => setForm((f) => { const a=[...f.customSections]; const items=[...a[si].items]; items[ii]={...items[ii],[field]:val}; a[si]={...a[si],items}; return { ...f, customSections:a }; });

  // ── Gather filtered form data (only active sections) ──────────────────────────
  const getFilteredFormData = useCallback((activeSections) => {
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

    f.layout = {
      ...(f.layout || {}),
      sectionOrder: activeSections
    };

    return f;
  }, [form]);

  // ── Profile image ─────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512000) { showToast('error', 'Image must be under 500KB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, profileImage: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const removeProfileImage = () => setForm((f) => ({ ...f, profileImage: '' }));

  // ── Bundle handlers for SectionCard ───────────────────────────────────────────
  const handlers = {
    setForm, exp, edu, set, setContact, setAddress,
    addCustomSection, removeCustomSection, updateCustomSectionTitle,
    addCustomItem, removeCustomItem, updateCustomItem,
  };

  return {
    form, setForm, handlers,
    getFilteredFormData,
    handleImageUpload, removeProfileImage,
  };
}
