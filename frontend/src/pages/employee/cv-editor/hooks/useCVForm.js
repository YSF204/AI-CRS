import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  DEFAULT_SECTION_ORDER,
  newCustomSection,
  newCustomItem,
  makeCustomSectionKey,
} from "../constants";
import { debounce } from "../../../../utils/debounce";
import api from "../../../../services/api";
import { getFallbackSuggestions, buildSuggestionBody } from "./suggestionHelpers";

const INITIAL_FORM = {
  fullName: "",
  jobTitle: "",
  summary: "",
  contact: { phone: "", email: "", github: "", linkedin: "", customLinks: [] },
  address: { country: "", city: "" },
  experience: [],
  education: [],
  technicalSkills: [],
  softSkills: [],
  language: [],
  customSections: [],
  profileImage: "",
  layout: { sectionOrder: [...DEFAULT_SECTION_ORDER], visibleSections: {} },
};

export default function useCVForm(showToast, autoSaveFunction = null, user = null) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState({});

  const autoSaveTimerRef = useRef(null);
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const triggerAutoSave = useCallback(() => {
    if (!autoSaveFunction) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await autoSaveFunction(formRef.current);
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [autoSaveFunction]);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    triggerAutoSave();
  };
  const setContact = (key) => (e) => {
    setForm((f) => ({ ...f, contact: { ...f.contact, [key]: e.target.value } }));
    triggerAutoSave();
  };
  const setAddress = (key) => (e) => {
    setForm((f) => ({ ...f, address: { ...f.address, [key]: e.target.value } }));
    triggerAutoSave();
  };

  const makeArr = (key) => ({
    add: (tmpl) => { setForm((f) => ({ ...f, [key]: [...f[key], tmpl] })); triggerAutoSave(); },
    remove: (i) => { setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) })); triggerAutoSave(); },
    update: (i, field, val) => {
      setForm((f) => { const a = [...f[key]]; a[i] = { ...a[i], [field]: val }; return { ...f, [key]: a }; });
      triggerAutoSave();
    },
    moveUp: (i) => {
      setForm((f) => { if (!i) return f; const a = [...f[key]];[a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...f, [key]: a }; });
      triggerAutoSave();
    },
    moveDown: (i) => {
      setForm((f) => { if (i >= f[key].length - 1) return f; const a = [...f[key]];[a[i], a[i + 1]] = [a[i + 1], a[i]]; return { ...f, [key]: a }; });
      triggerAutoSave();
    },
  });

  const exp = makeArr("experience");
  const edu = makeArr("education");

  // onAddCustomSectionKey / onRemoveCustomSectionKey are injected by useCVEditor
  // so the editor state (activeSections) can stay in sync.
  const addCustomSection = (onAddKey) => {
    // Compute new index from current form state (before update)
    const newIndex = form.customSections.length;
    setForm((f) => ({ ...f, customSections: [...f.customSections, newCustomSection()] }));
    if (onAddKey) onAddKey(makeCustomSectionKey(newIndex));
    triggerAutoSave();
  };
  const removeCustomSection = (si, onRemoveKey) => {
    setForm((f) => ({ ...f, customSections: f.customSections.filter((_, i) => i !== si) }));
    if (onRemoveKey) onRemoveKey(si, form.customSections.length - 1);
    triggerAutoSave();
  };
  const updateCustomSectionTitle = (si, val) => {
    setForm((f) => { const a = [...f.customSections]; a[si] = { ...a[si], title: val }; return { ...f, customSections: a }; });
    triggerAutoSave();
  };
  const addCustomItem = (si) => {
    setForm((f) => { const a = [...f.customSections]; a[si] = { ...a[si], items: [...a[si].items, newCustomItem()] }; return { ...f, customSections: a }; });
    triggerAutoSave();
  };
  const removeCustomItem = (si, ii) => {
    setForm((f) => { const a = [...f.customSections]; a[si] = { ...a[si], items: a[si].items.filter((_, i) => i !== ii) }; return { ...f, customSections: a }; });
    triggerAutoSave();
  };
  const updateCustomItem = (si, ii, field, val) => {
    setForm((f) => { const a = [...f.customSections]; const items = [...a[si].items]; items[ii] = { ...items[ii], [field]: val }; a[si] = { ...a[si], items }; return { ...f, customSections: a }; });
    triggerAutoSave();
  };

  const updateField = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const addCustomLink = () => {
    setForm((f) => ({
      ...f,
      contact: {
        ...f.contact,
        customLinks: [...(f.contact.customLinks || []), { label: "", url: "", icon: "globe" }]
      }
    }));
    triggerAutoSave();
  };

  const removeCustomLink = (i) => {
    setForm((f) => ({
      ...f,
      contact: {
        ...f.contact,
        customLinks: f.contact.customLinks.filter((_, idx) => idx !== i)
      }
    }));
    triggerAutoSave();
  };

  const updateCustomLink = (i, field, val) => {
    setForm((f) => {
      const a = [...(f.contact.customLinks || [])];
      a[i] = { ...a[i], [field]: val };
      return { ...f, contact: { ...f.contact, customLinks: a } };
    });
    triggerAutoSave();
  };

  const fetchSuggestions = useCallback(async (field, context = {}) => {
    setIsLoadingSuggestions((prev) => ({ ...prev, [field]: true }));
    try {
      const requestBody = buildSuggestionBody(field, form, context);
      const response = await api.post(`/suggestions/${field}`, requestBody);
      const responseData = response.data;
      let suggestionsList = responseData?.data?.suggestions || [];
      if (field === "summary-single") {
        const single = responseData?.data?.suggestion;
        suggestionsList = single ? [single] : [];
      }
      if (!suggestionsList || suggestionsList.length === 0) {
        suggestionsList = getFallbackSuggestions(field, form);
      }
      setSuggestions((prev) => ({ ...prev, [field]: suggestionsList }));
    } catch (error) {
      console.error(`Error fetching ${field} suggestions:`, error);
      setSuggestions((prev) => ({ ...prev, [field]: getFallbackSuggestions(field, form) }));
    } finally {
      setIsLoadingSuggestions((prev) => ({ ...prev, [field]: false }));
    }
  }, [form]);

  const fetchSuggestionsRef = useRef(fetchSuggestions);
  fetchSuggestionsRef.current = fetchSuggestions;

  const debouncedFetchSuggestions = useMemo(
    () => debounce((field, context) => { fetchSuggestionsRef.current(field, context); }, 2000),
    [],
  );

  const fetchSingleSummarySuggestion = useCallback(() => {
    fetchSuggestions("summary-single", {
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
      skills: [...(form.technicalSkills || []), ...(form.softSkills || [])],
      userAccount: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
    });
  }, [form, user, fetchSuggestions]);

  const handleSuggestionSelect = useCallback((field, value) => {
    const updaters = {
      "job-title": () => { setForm((f) => ({ ...f, jobTitle: value })); },
      jobTitle: () => { setForm((f) => ({ ...f, jobTitle: value })); },
      summary: () => { setForm((f) => ({ ...f, summary: value })); },
      "summary-single": () => { setForm((f) => ({ ...f, summary: value })); },
      skills: () => { if (!form.technicalSkills.includes(value)) setForm((f) => ({ ...f, technicalSkills: [...form.technicalSkills, value] })); },
      "soft-skills": () => { if (!form.softSkills.includes(value)) setForm((f) => ({ ...f, softSkills: [...form.softSkills, value] })); },
      languages: () => {
        const langArray = form.language || [];
        const langNames = langArray.map((l) => typeof l === "string" ? l : l.name);
        if (!langNames.includes(value)) {
          const newLang = typeof value === "string" ? { name: value, level: "A1" } : value;
          setForm((f) => ({ ...f, language: [...langArray, newLang] }));
        }
      },
    };
    const updater = updaters[field];
    if (updater) updater();
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
    triggerAutoSave();
  }, [form.technicalSkills, form.softSkills, form.language, triggerAutoSave]);

  const getFilteredFormData = useCallback((activeSections) => {
    const f = { ...form };
    f.fullName = form.fullName || "";
    const sectionClearMap = {
      summary: { jobTitle: "", summary: "" },
      contact: { contact: { phone: "", email: "", github: "", linkedin: "" } },
      address: { address: { country: "", city: "" } },
      experience: { experience: [] },
      education: { education: [] },
      technicalSkills: { technicalSkills: [] },
      softSkills: { softSkills: [] },
      language: { language: [] },
    };
    for (const [section, clear] of Object.entries(sectionClearMap)) {
      if (!activeSections.includes(section)) Object.assign(f, clear);
    }
    // Filter and reorder customSections based on per-section active keys
    const activeCustomKeys = activeSections.filter((k) => k && k.startsWith("customSection__"));
    if (activeCustomKeys.length === 0) {
      f.customSections = [];
    } else {
      f.customSections = activeCustomKeys
        .map((k) => {
          const idx = parseInt(k.replace("customSection__", ""), 10);
          return form.customSections[idx];
        })
        .filter(Boolean);
    }
    f.layout = { ...(f.layout || {}), sectionOrder: activeSections };
    return f;
  }, [form]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512000) { showToast("error", "toast.image_too_large"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setForm((f) => ({ ...f, profileImage: ev.target.result })); triggerAutoSave(); };
    reader.readAsDataURL(file);
  };
  const removeProfileImage = () => { setForm((f) => ({ ...f, profileImage: "" })); triggerAutoSave(); };

  const handlers = {
    setForm,
    triggerAutoSave,
    exp,
    edu,
    set,
    setContact,
    setAddress,
    addCustomSection,
    removeCustomSection,
    updateCustomSectionTitle,
    addCustomItem,
    removeCustomItem,
    updateCustomItem,
    updateField,
    addCustomLink,
    removeCustomLink,
    updateCustomLink,
    suggestions,
    isLoadingSuggestions,
    fetchSuggestions: debouncedFetchSuggestions,
    fetchSingleSummarySuggestion,
    handleSuggestionSelect,
  };

  return {
    form,
    setForm,
    handlers,
    getFilteredFormData,
    handleImageUpload,
    removeProfileImage,
    isSaving,
    lastSavedAt,
    suggestions,
    isLoadingSuggestions,
    fetchSuggestions: debouncedFetchSuggestions,
    fetchSingleSummarySuggestion,
    handleSuggestionSelect,
  };
}
