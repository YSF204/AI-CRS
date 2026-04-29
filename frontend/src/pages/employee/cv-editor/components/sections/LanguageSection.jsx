import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const PROFICIENCY_LEVELS = [
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper Intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Proficient / Native" },
];

export default function LanguageSection({ form, handlers }) {
  const [inputName, setInputName] = useState("");
  const [inputLevel, setInputLevel] = useState("A1");
  const languages = form.language || [];

  // Convert legacy string-only languages to object format
  const normalizedLanguages = languages.map((lang) => {
    if (typeof lang === "string") {
      return { name: lang, level: "A1" };
    }
    return lang;
  });

  const addLanguage = () => {
    if (inputName.trim()) {
      const exists = normalizedLanguages.some(
        (lang) => lang.name.toLowerCase() === inputName.trim().toLowerCase(),
      );
      if (!exists) {
        handlers.updateField("language", [
          ...normalizedLanguages,
          { name: inputName.trim(), level: inputLevel },
        ]);
        setInputName("");
        setInputLevel("A1");
      }
    }
  };

  const removeLanguage = (index) => {
    handlers.updateField(
      "language",
      normalizedLanguages.filter((_, i) => i !== index),
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLanguage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-4">
          Languages
        </h2>
        <p className="font-mono text-sm text-(--fg-muted) mb-6">
          List the languages you speak and your proficiency level.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--nm-text-tertiary)] mb-2">
              Language Name
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-[44px] px-3 border border-[var(--border-color)] rounded font-mono text-sm"
              placeholder="e.g., English, Spanish, French"
            />
          </div>
          <div className="flex-1">
            <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--nm-text-tertiary)] mb-2">
              Proficiency Level
            </label>
            <select
              value={inputLevel}
              onChange={(e) => setInputLevel(e.target.value)}
              className="w-full h-[44px] px-3 border border-[var(--border-color)] rounded font-mono text-sm"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addLanguage}
            className="h-[44px] px-4 flex items-center gap-2 bg-[var(--nm-primary)] text-white border-2 border-[var(--nm-ink)] rounded font-mono text-xs font-bold uppercase"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {normalizedLanguages.map((language, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--nm-surface-high)] text-[var(--nm-text-primary)] rounded border border-[var(--nm-ink)] font-mono text-sm"
            >
              <span>
                {language.name} — {language.level}
              </span>
              <button
                onClick={() => removeLanguage(index)}
                className="hover:text-[var(--nm-error)] transition-colors p-0.5"
                title="Remove language"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
