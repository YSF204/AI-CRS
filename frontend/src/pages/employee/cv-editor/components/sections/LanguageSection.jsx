import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import Field from "../Field";

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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-tight text-[var(--nm-text-primary)] mb-2">
          Languages
        </h2>
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          List the languages you speak and your proficiency level.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-3 items-end">
          <Field label="Language Name">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="nm-input"
              placeholder="e.g., English, Spanish, French"
            />
          </Field>
          <Field label="Proficiency Level">
            <select
              value={inputLevel}
              onChange={(e) => setInputLevel(e.target.value)}
              className="nm-input"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={addLanguage}
            className="nm-btn nm-btn-primary h-[48px] px-4"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {normalizedLanguages.map((language, index) => (
            <div
              key={`${language.name}-${language.level}-${index}`}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--nm-surface-high)] text-[var(--nm-text-primary)] border-2 border-[var(--nm-ink)] font-mono text-sm"
            >
              <span>
                {language.name} — {language.level}
              </span>
              <button
                type="button"
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
