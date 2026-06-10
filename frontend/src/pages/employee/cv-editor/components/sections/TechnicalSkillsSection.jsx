import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Converts the flat string[] format used by the CV data model into
 * an array of { title, skills[] } groups for editing.
 *
 * "Frontend: React, NextJS"  →  { title: "Frontend", skills: ["React","NextJS"] }
 * "Docker"                   →  kept in an "Other" catch-all group
 */
function parseGroups(flatSkills) {
  const groups = [];
  const loose = [];

  (flatSkills || []).forEach((s) => {
    const m = typeof s === "string" && s.match(/^([^:]+):\s*(.+)$/);
    if (m) {
      groups.push({
        title: m[1].trim(),
        skills: m[2]
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      });
    } else {
      loose.push(s);
    }
  });

  // Wrap any loose skills in a catch-all group
  if (loose.length > 0) {
    groups.push({ title: "", skills: loose });
  }

  // Always start with at least one empty group
  if (groups.length === 0) {
    groups.push({ title: "", skills: [] });
  }

  return groups;
}

/**
 * Converts groups back to the flat string[] format for the CV data model.
 */
function serializeGroups(groups) {
  return groups
    .filter((g) => g.skills.length > 0 || g.title.trim())
    .flatMap((g) => {
      if (g.title.trim()) {
        const skillStr = g.skills.join(", ");
        return skillStr ? [`${g.title.trim()}: ${skillStr}`] : [];
      }
      // No title → individual flat skills
      return g.skills;
    });
}

export default function TechnicalSkillsSection({ form, handlers }) {
  const flatSkills = form.technicalSkills || [];
  const [groups, setGroups] = useState(() => parseGroups(flatSkills));
  const [skillInputs, setSkillInputs] = useState(() =>
    parseGroups(flatSkills).map(() => "")
  );

  // Sync back to form whenever groups change
  const sync = (nextGroups) => {
    setGroups(nextGroups);
    handlers.updateField("technicalSkills", serializeGroups(nextGroups));
  };

  // Keep skill inputs array in sync with groups count
  const ensureInputs = (nextGroups, nextInputs) => {
    while (nextInputs.length < nextGroups.length) nextInputs.push("");
    return nextInputs.slice(0, nextGroups.length);
  };

  const updateGroupTitle = (gi, value) => {
    const next = groups.map((g, i) => (i === gi ? { ...g, title: value } : g));
    sync(next);
  };

  const addGroup = () => {
    const next = [...groups, { title: "", skills: [] }];
    const nextInputs = ensureInputs(next, [...skillInputs, ""]);
    setSkillInputs(nextInputs);
    sync(next);
  };

  const removeGroup = (gi) => {
    const next = groups.filter((_, i) => i !== gi);
    const nextInputs = skillInputs.filter((_, i) => i !== gi);
    setSkillInputs(ensureInputs(next, nextInputs));
    sync(next);
  };

  const addSkill = (gi) => {
    const val = (skillInputs[gi] || "").trim();
    if (!val || groups[gi].skills.includes(val)) return;
    const next = groups.map((g, i) =>
      i === gi ? { ...g, skills: [...g.skills, val] } : g
    );
    const nextInputs = skillInputs.map((inp, i) => (i === gi ? "" : inp));
    setSkillInputs(nextInputs);
    sync(next);
  };

  const removeSkill = (gi, skill) => {
    const next = groups.map((g, i) =>
      i === gi ? { ...g, skills: g.skills.filter((s) => s !== skill) } : g
    );
    sync(next);
  };

  const handleSkillKeyDown = (e, gi) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(gi);
    }
    // Backspace on empty input removes last skill
    if (e.key === "Backspace" && !skillInputs[gi] && groups[gi].skills.length > 0) {
      const lastSkill = groups[gi].skills[groups[gi].skills.length - 1];
      removeSkill(gi, lastSkill);
    }
  };

  const CATEGORY_PRESETS = [
    "Frontend", "Backend", "Mobile", "DevOps", "Database",
    "Cloud", "AI / ML", "Testing", "Security", "Tools",
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-1">
          Technical Skills
        </h2>
        <p className="font-mono text-sm text-[var(--fg-muted)]">
          Organise your skills by category — e.g. <em>Frontend</em>, <em>Backend</em>, <em>DevOps</em>.
          Each category and its skills will appear as a labelled row on your CV.
        </p>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-3">
        {groups.map((group, gi) => (
          <div
            key={gi}
            className="border-2 border-[var(--border-color)] bg-[var(--card-bg)] p-3 flex flex-col gap-2.5"
          >
            {/* Row 1: Category title + presets + remove */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--fg-muted)]">
                  Category Title
                </label>
                <input
                  className="nm-input text-[13px]"
                  value={group.title}
                  onChange={(e) => updateGroupTitle(gi, e.target.value)}
                  placeholder="e.g. Frontend, Backend, DevOps…"
                  list={`presets-${gi}`}
                />
                <datalist id={`presets-${gi}`}>
                  {CATEGORY_PRESETS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(gi)}
                  title="Remove category"
                  className="mt-5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Row 2: Skill tags */}
            <div>
              <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--fg-muted)] block mb-1.5">
                Skills
              </label>

              {/* Tags + inline input */}
              <div className="flex flex-wrap gap-1.5 p-2 border-2 border-[var(--border-color)] bg-[var(--nm-bg)] min-h-[42px] focus-within:border-[var(--teal)] transition-colors">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--teal)] text-black font-mono text-[11px] font-bold rounded-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(gi, skill)}
                      className="hover:opacity-60 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInputs[gi] || ""}
                  onChange={(e) => {
                    const next = skillInputs.map((v, i) =>
                      i === gi ? e.target.value : v
                    );
                    setSkillInputs(next);
                  }}
                  onKeyDown={(e) => handleSkillKeyDown(e, gi)}
                  placeholder={
                    group.skills.length === 0
                      ? "Type a skill and press Enter…"
                      : "Add more…"
                  }
                  className="flex-1 min-w-[140px] bg-transparent outline-none font-mono text-[12px] text-[var(--fg)] placeholder-[var(--fg-muted)]"
                />
              </div>
              <p className="font-mono text-[9px] text-[var(--fg-muted)] mt-1">
                Press <kbd className="px-1 py-0.5 border border-[var(--border-color)] rounded text-[9px]">Enter</kbd> to add · <kbd className="px-1 py-0.5 border border-[var(--border-color)] rounded text-[9px]">⌫</kbd> to remove last
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category button */}
      <button
        type="button"
        onClick={addGroup}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[10px] font-bold uppercase tracking-wider hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
      >
        <Plus size={12} /> Add Category
      </button>
    </div>
  );
}
