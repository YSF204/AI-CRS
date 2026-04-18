import React, { useState } from "react";
import { X, Plus } from "lucide-react";

export default function LanguageSection({ form, handlers }) {
  const [input, setInput] = useState("");
  const languages = form.language || [];

  const addLanguage = () => {
    if (input.trim() && !languages.includes(input.trim())) {
      handlers.updateField("language", [...languages, input.trim()]);
      setInput("");
    }
  };

  const removeLanguage = (languageToRemove) => {
    handlers.updateField(
      "language",
      languages.filter((lang) => lang !== languageToRemove),
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
          List the languages you speak. Press Enter or click Add to include
          them.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="brutal-input flex-1"
            placeholder="e.g., English, Spanish, French"
          />
          <button
            onClick={addLanguage}
            className="brutal-btn px-4 py-2 flex items-center gap-2"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((language, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-(--teal) text-black rounded font-mono text-sm"
            >
              {language}
              <button
                onClick={() => removeLanguage(language)}
                className="hover:bg-black hover:bg-opacity-20 rounded p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
