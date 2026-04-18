import { useState, useCallback, useRef } from 'react';
import { DEFAULT_SECTION_ORDER, newCustomSection, newCustomItem } from '../constants';
import { debounce } from '../../../../utils/debounce';

const INITIAL_FORM = {
  fullName: '', jobTitle: '', summary: '',
  contact: { phone: '', email: '', github: '', linkedin: '' },
  address: { city: '', street: '' },
  experience: [], education: [],
  technicalSkills: [], softSkills: [], language: [],
  customSections: [],
  profileImage: '',
  layout: { sectionOrder: [...DEFAULT_SECTION_ORDER], visibleSections: {} },
};

// Base URL for API calls
const API_BASE = 'http://localhost:3001/api';

export default function useCVForm(showToast, autoSaveFunction = null) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Suggestion State
  const [suggestions, setSuggestions] = useState({});
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState({});

  // Auto-save refs
  const autoSaveTimerRef = useRef(null);

  // Auto-save Functionality
  const triggerAutoSave = useCallback(() => {
    if (!autoSaveFunction) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer to trigger auto-save after debounce
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await autoSaveFunction(form);
        setLastSavedAt(new Date());
        // Silent save - no toast notification
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Silent error - no toast notification
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [autoSaveFunction, form]);

  // Simple field setters (non-debounced state, debounced save)
  const set = (key) => (val) => { setForm((f) => ({ ...f, [key]: val })); triggerAutoSave(); };
  const setContact = (key) => (e) => { setForm((f) => ({ ...f, contact: { ...f.contact, [key]: e.target.value } })); triggerAutoSave(); };
  const setAddress = (key) => (e) => { setForm((f) => ({ ...f, address: { ...f.address, [key]: e.target.value } })); triggerAutoSave(); };

  // Array helpers (experience / education)
  const makeArr = (key) => ({
    add: (tmpl) => { setForm((f) => ({ ...f, [key]: [...f[key], tmpl] })); triggerAutoSave(); },
    remove: (i) => { setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) })); triggerAutoSave(); },
    update: (i, field, val) => { setForm((f) => { const a = [...f[key]]; a[i] = { ...a[i], [field]: val }; return { ...f, [key]: a }; }); triggerAutoSave(); },
    moveUp: (i) => { setForm((f) => { if (!i) return f; const a = [...f[key]]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...f, [key]: a }; }); triggerAutoSave(); },
    moveDown: (i) => { setForm((f) => { if (i >= f[key].length - 1) return f; const a = [...f[key]]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return { ...f, [key]: a }; }); triggerAutoSave(); },
  });

const exp = makeArr('experience');
const edu = makeArr('education');



// Custom section CRUD
const addCustomSection = () => { setForm((f) => ({ ...f, customSections: [...f.customSections, newCustomSection()] })); triggerAutoSave(); };
const removeCustomSection = (si) => { setForm((f) => ({ ...f, customSections: f.customSections.filter((_, i) => i !== si) })); triggerAutoSave(); };
const updateCustomSectionTitle = (si, val) => { setForm((f) => { const a = [...f.customSections]; a[si] = { ...a[si], title: val }; return { ...f, customSections: a }; }); triggerAutoSave(); };
const addCustomItem = (si) => { setForm((f) => { const a = [...f.customSections]; a[si] = { ...a[si], items: [...a[si].items, newCustomItem()] }; return { ...f, customSections: a }; }); triggerAutoSave(); };
const removeCustomItem = (si, ii) => { setForm((f) => { const a = [...f.customSections]; a[si] = { ...a[si], items: a[si].items.filter((_, i) => i !== ii) }; return { ...f, customSections: a }; }); triggerAutoSave(); };
const updateCustomItem = (si, ii, field, val) => { setForm((f) => { const a = [...f.customSections]; const items = [...a[si].items]; items[ii] = { ...items[ii], [field]: val }; a[si] = { ...a[si], items }; return { ...f, customSections: a }; }); triggerAutoSave(); };

// updateField: Generic field updater with auto-save
const updateField = useCallback((key, value) => {
  setForm((f) => ({ ...f, [key]: value }));
  triggerAutoSave();
}, [triggerAutoSave]);

// Suggestion Fetching
const fetchSuggestions = useCallback(async (field, context = {}) => {
  setIsLoadingSuggestions((prev) => ({ ...prev, [field]: true }));

  try {
    const endpoint = `${API_BASE}/suggestions/${field}`;
    const token = localStorage.getItem('token');

    // Map field names to expected backend format
    let requestBody = { ...context };

    // Add required fields based on endpoint, preserving currentInput from context
    if (field === 'job-title') {
      requestBody = {
        ...requestBody,
        experience: form.experience?.length ? form.experience : [],
        skills: [...form.technicalSkills, ...form.softSkills],
        jobTitle: form.jobTitle || '',
      };
    } else if (field === 'summary') {
      requestBody = {
        ...requestBody,
        experience: form.experience?.length ? form.experience : [],
        skills: [...form.technicalSkills, ...form.softSkills],
        jobTitle: form.jobTitle || '',
      };
    } else if (field === 'skills' || field === 'soft-skills') {
      requestBody = {
        ...requestBody,
        jobTitle: form.jobTitle || '',
        experience: form.experience?.length ? form.experience : [],
        skills: form.technicalSkills || [],
      };
    } else if (field === 'experience') {
      requestBody = {
        ...requestBody,
      };
    } else if (field === 'education') {
      requestBody = {
        ...requestBody,
      };
    } else if (field === 'languages') {
      requestBody = {
        ...requestBody,
        jobTitle: form.jobTitle || '',
        skills: form.language || [],
      };
    } else if (field === 'custom-section') {
      requestBody = {
        ...requestBody,
        jobTitle: form.jobTitle || '',
      };
    } else if (field === 'summary-single') {
      // For manual trigger - single summary suggestion
      requestBody = {
        ...requestBody,
        fullName: form.fullName || '',
        experience: form.experience || [],
        education: form.education || [],
        technicalSkills: form.technicalSkills || [],
        softSkills: form.softSkills || [],
        language: form.language || [],
        contact: form.contact || {},
        address: form.address || {},
        skills: [...form.technicalSkills, ...form.softSkills],
        jobTitle: form.jobTitle || '',
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Suggestion API error for ${field}:`, response.status, errorData);

      // Provide fallback suggestions on error
      const fallbacks = getFallbackSuggestions(field, form);
      setSuggestions((prev) => ({ ...prev, [field]: fallbacks }));
      return;
    }

    const responseData = await response.json();

    // Backend shape:
    // - most endpoints: { success: true, data: { suggestions: [] } }
    // - summary-single: { success: true, data: { suggestion: "..." } }
    let suggestionsList = responseData?.data?.suggestions || [];
    if (field === 'summary-single') {
      const single = responseData?.data?.suggestion;
      suggestionsList = single ? [single] : [];
    }

    // If no suggestions from API, provide fallbacks
    if (!suggestionsList || suggestionsList.length === 0) {
      const fallbacks = getFallbackSuggestions(field, form);
      setSuggestions((prev) => ({ ...prev, [field]: fallbacks }));
    } else {
      setSuggestions((prev) => ({ ...prev, [field]: suggestionsList }));
    }
  } catch (error) {
    console.error(`Error fetching ${field} suggestions:`, error);

    // Provide fallback suggestions on error
    const fallbacks = getFallbackSuggestions(field, form);
    setSuggestions((prev) => ({ ...prev, [field]: fallbacks }));
  } finally {
    setIsLoadingSuggestions((prev) => ({ ...prev, [field]: false }));
  }
}, [form]);

// Fallback suggestions when API fails
const getFallbackSuggestions = (field, formData) => {
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS'];
  const softSkills = ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management'];
  const jobTitles = ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic', 'Japanese'];

  switch (field) {
    case 'job-title':
      return jobTitles.filter(title => title !== formData.jobTitle);
    case 'summary':
      return [
        'Experienced professional with a strong background in delivering innovative solutions.',
        'Results-driven individual with proven track record of success in challenging environments.',
        'Dedicated team player committed to continuous improvement and professional growth.'
      ];
    case 'skills':
      return commonSkills.filter(skill => !formData.technicalSkills?.includes(skill));
    case 'soft-skills':
      return softSkills.filter(skill => !formData.softSkills?.includes(skill));
    case 'languages':
      return languages.filter(lang => !formData.language?.includes(lang));
    case 'experience':
      return [
        'Led cross-functional team to deliver key project milestones',
        'Developed and implemented innovative solutions',
        'Increased efficiency by 25% through process optimization',
        'Collaborated with stakeholders to define requirements',
        'Mentored junior team members and improved team productivity'
      ];
    case 'education':
      return [
        'Graduated with honors',
        'Dean\'s List multiple semesters',
        'Relevant coursework in web development',
        'Capstone project: e-commerce platform',
        'Leadership role in student organization'
      ];
    case 'custom-section':
      return [
        'Delivered high-quality results within tight deadlines',
        'Demonstrated strong analytical and problem-solving skills',
        'Collaborated effectively with cross-functional teams',
        'Showcased creativity and attention to detail'
      ];
    default:
      return [];
  }
};

// Debounced suggestion fetching
const debouncedFetchSuggestions = useCallback(
  debounce((field, context) => {
    fetchSuggestions(field, context);
  }, 2000),
  [fetchSuggestions]
);

// Fetch single summary suggestion (for manual trigger)
const fetchSingleSummarySuggestion = useCallback(
  debounce(() => {
    if (!form.jobTitle) return; // Require job title for meaningful suggestions
    fetchSuggestions('summary-single', {
      fullName: form.fullName || '',
      jobTitle: form.jobTitle || '',
      currentInput: form.summary || '',
      experience: form.experience || [],
      education: form.education || [],
      technicalSkills: form.technicalSkills || [],
      softSkills: form.softSkills || [],
      language: form.language || [],
      contact: form.contact || {},
      address: form.address || {},
      skills: [...form.technicalSkills, ...form.softSkills],
    });
  }, 1000),
  [form.fullName, form.jobTitle, form.summary, form.experience, form.education, form.technicalSkills, form.softSkills, form.language, form.contact, form.address, fetchSuggestions]
);

// Handle suggestion selection
const handleSuggestionSelect = useCallback((field, value) => {
  if (field === 'job-title' || field === 'jobTitle') {
    setForm((f) => ({ ...f, jobTitle: value }));
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'summary') {
    setForm((f) => ({ ...f, summary: value }));
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'summary-single') {
    // Single summary suggestion for manual trigger
    setForm((f) => ({ ...f, summary: value }));
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'skills') {
    if (!form.technicalSkills.includes(value)) {
      setForm((f) => ({ ...f, technicalSkills: [...form.technicalSkills, value] }));
    }
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'soft-skills') {
    if (!form.softSkills.includes(value)) {
      setForm((f) => ({ ...f, softSkills: [...form.softSkills, value] }));
    }
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'languages') {
    if (!form.language.includes(value)) {
      setForm((f) => ({ ...f, language: [...form.language, value] }));
    }
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'experience') {
    // Note: experience suggestions are handled inline in SectionCard
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'education') {
    // Note: education suggestions are handled inline in SectionCard
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  } else if (field === 'custom-section') {
    // Note: custom-section suggestions are handled inline in SectionCard
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  }
  triggerAutoSave();
}, [form.technicalSkills, form.softSkills, form.language, triggerAutoSave]);

// Gather filtered form data (only active sections)
const getFilteredFormData = useCallback((activeSections) => {
  const f = { ...form };
  f.fullName = form.fullName || '';
  if (!activeSections.includes('summary')) { f.jobTitle = ''; f.summary = ''; }
  if (!activeSections.includes('contact')) { f.contact = { phone: '', email: '', github: '', linkedin: '' }; }
  if (!activeSections.includes('address')) { f.address = { city: '', street: '' }; }
  if (!activeSections.includes('experience')) { f.experience = []; }
  if (!activeSections.includes('education')) { f.education = []; }
  if (!activeSections.includes('technicalSkills')) { f.technicalSkills = []; }
  if (!activeSections.includes('softSkills')) { f.softSkills = []; }
  if (!activeSections.includes('language')) { f.language = []; }
  if (!activeSections.includes('customSections')) { f.customSections = []; }

  f.layout = {
    ...(f.layout || {}),
    sectionOrder: activeSections
  };

  return f;
}, [form]);

// Profile image
const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 512000) { showToast('error', 'Image must be under 500KB.'); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    setForm((f) => ({ ...f, profileImage: ev.target.result }));
    triggerAutoSave();
  };
  reader.readAsDataURL(file);
};
const removeProfileImage = () => {
  setForm((f) => ({ ...f, profileImage: '' }));
  triggerAutoSave();
};

// Bundle handlers for SectionCard
const handlers = {
  setForm, exp, edu, set, setContact, setAddress,
  addCustomSection, removeCustomSection, updateCustomSectionTitle,
  addCustomItem, removeCustomItem, updateCustomItem,
  updateField,
};

return {
  form, setForm, handlers,
  getFilteredFormData,
  handleImageUpload, removeProfileImage,
  isSaving, lastSavedAt,
  suggestions, isLoadingSuggestions,
  fetchSuggestions: debouncedFetchSuggestions,
  fetchSingleSummarySuggestion,
  handleSuggestionSelect,
};
}
