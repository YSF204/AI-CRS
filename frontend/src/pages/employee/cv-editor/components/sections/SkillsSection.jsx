import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import SuggestionBox from "../SuggestionBox";

/**
 * SkillsSection - Handles technical and soft skills input
 * Single Responsibility: Render skills form and integrate suggestion UI
 */
export default function SkillsSection({ type, form, handlers, fetchSuggestions, handleSuggestionSelect, suggestions, isLoadingSuggestions }) {
  const [input, setInput] = useState("");
  const field = type === "technical" ? "technicalSkills" : "softSkills";
  const skills = form[field] || [];
  const title = type === "technical" ? "Technical Skills" : "Soft Skills";
  const placeholder =
    type === "technical"
      ? "e.g., JavaScript, React, Node.js"
      : "e.g., Communication, Leadership, Problem Solving";
  const suggestionField = type === "technical" ? "skills" : "soft-skills";

  const addSkill = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      handlers.updateField(field, [...skills, input.trim()]);
      setInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    handlers.updateField(
      field,
      skills.filter((skill) => skill !== skillToRemove),
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Trigger suggestions if user has typed something meaningful
    if (value.length > 2) {
      fetchSuggestions(suggestionField, {
        currentSkills: skills,
        skillType: type,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-4">
          {title}
        </h2>
        <p className="font-mono text-sm text-(--fg-muted) mb-6">
          List your {type.toLowerCase()} skills. Press Enter or click Add to
          include them.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="brutal-input flex-1"
            placeholder={placeholder}
          />
          <button
            onClick={addSkill}
            className="brutal-btn px-4 py-2 flex items-center gap-2"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Suggestions for skills */}
        <SuggestionBox
          suggestions={suggestions[suggestionField] || []}
          onSelect={(suggestion) => setInput(suggestion)}
          isLoading={isLoadingSuggestions[suggestionField] || false}
        />

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-(--teal) text-black rounded font-mono text-sm"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
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
