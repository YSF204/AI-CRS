import React, { useState } from "react";
import { X, Plus, Briefcase } from "lucide-react";

export default function ExperienceSection({ form, handlers }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const experiences = form.experience || [];

  const [currentItem, setCurrentItem] = useState({
    institutionName: "",
    position: "",
    durationFrom: "",
    durationTo: "",
    summary: "",
  });

  const resetForm = () => {
    setCurrentItem({
      institutionName: "",
      position: "",
      durationFrom: "",
      durationTo: "",
      summary: "",
    });
    setEditingIndex(null);
  };

  const addExperience = () => {
    if (currentItem.institutionName && currentItem.position) {
      if (editingIndex !== null) {
        const updated = [...experiences];
        updated[editingIndex] = currentItem;
        handlers.updateField("experience", updated);
      } else {
        handlers.updateField("experience", [...experiences, currentItem]);
      }
      resetForm();
      handlers.triggerAutoSave?.();
    }
  };

  const editExperience = (index) => {
    setCurrentItem(experiences[index]);
    setEditingIndex(index);
  };

  const removeExperience = (index) => {
    handlers.updateField(
      "experience",
      experiences.filter((_, i) => i !== index),
    );
    handlers.triggerAutoSave?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-4">
          Work Experience
        </h2>
        <p className="font-mono text-sm text-(--fg-muted) mb-6">
          Add your professional work experience, starting with the most recent.
        </p>
      </div>

      {/* Add/Edit Form */}
      <div className="brutal-card bg-(--card-bg) p-6 space-y-4">
        <h3 className="font-bold font-['Space_Grotesk'] uppercase text-lg">
          {editingIndex !== null ? "Edit Experience" : "Add Experience"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              Company Name *
            </label>
            <input
              type="text"
              value={currentItem.institutionName}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  institutionName: e.target.value,
                })
              }
              className="brutal-input w-full"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              Position *
            </label>
            <input
              type="text"
              value={currentItem.position}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, position: e.target.value })
              }
              className="brutal-input w-full"
              placeholder="Job title"
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              From
            </label>
            <input
              type="month"
              value={currentItem.durationFrom}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, durationFrom: e.target.value })
              }
              className="brutal-input w-full"
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              To
            </label>
            <input
              type="month"
              value={currentItem.durationTo}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, durationTo: e.target.value })
              }
              className="brutal-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={currentItem.summary}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, summary: e.target.value })
            }
            className="brutal-input w-full h-24 resize-none"
            placeholder="Describe your responsibilities and achievements..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={addExperience}
            disabled={!currentItem.institutionName || !currentItem.position}
            className="brutal-btn px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ background: "var(--teal)", color: "#0a0a0a" }}
          >
            <Plus size={16} />
            {editingIndex !== null ? "Update" : "Add"}
          </button>
          {editingIndex !== null && (
            <button onClick={resetForm} className="brutal-btn px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Experience List */}
      <div className="space-y-3">
        {experiences.map((exp, index) => (
          <div key={index} className="brutal-card bg-(--card-bg) p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold font-['Space_Grotesk'] text-lg">
                  {exp.position}
                </h4>
                <p className="font-mono text-sm text-(--fg-muted)">
                  {exp.institutionName}
                </p>
                <p className="font-mono text-xs text-(--fg-muted)">
                  {exp.durationFrom} - {exp.durationTo}
                </p>
                {exp.summary && (
                  <p className="font-mono text-sm mt-2">{exp.summary}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editExperience(index)}
                  className="brutal-btn px-3 py-1 text-xs"
                  style={{ background: "var(--yellow)", color: "#0a0a0a" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => removeExperience(index)}
                  className="brutal-btn px-3 py-1 text-xs"
                  style={{ background: "var(--coral)", color: "#0a0a0a" }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
