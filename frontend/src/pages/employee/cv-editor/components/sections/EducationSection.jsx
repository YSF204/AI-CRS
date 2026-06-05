import React, { useState } from "react";
import { X, Plus, GraduationCap } from "lucide-react";

export default function EducationSection({ form, handlers }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const education = form.education || [];

  const [currentItem, setCurrentItem] = useState({
    institutionName: "",
    certification: "",
    durationFrom: "",
    durationTo: "",
    summary: "",
  });

  const resetForm = () => {
    setCurrentItem({
      institutionName: "",
      certification: "",
      durationFrom: "",
      durationTo: "",
      summary: "",
    });
    setEditingIndex(null);
  };

  const addEducation = () => {
    if (currentItem.institutionName && currentItem.certification) {
      if (editingIndex !== null) {
        const updated = [...education];
        updated[editingIndex] = currentItem;
        handlers.updateField("education", updated);
      } else {
        handlers.updateField("education", [...education, currentItem]);
      }
      resetForm();
      handlers.triggerAutoSave?.();
    }
  };

  const editEducation = (index) => {
    setCurrentItem(education[index]);
    setEditingIndex(index);
  };

  const removeEducation = (index) => {
    handlers.updateField(
      "education",
      education.filter((_, i) => i !== index),
    );
    handlers.triggerAutoSave?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] uppercase mb-4">
          Education
        </h2>
        <p className="font-mono text-sm text-(--fg-muted) mb-6">
          Add your educational background and qualifications.
        </p>
      </div>

      {/* Add/Edit Form */}
      <div className="brutal-card bg-(--card-bg) p-6 space-y-4">
        <h3 className="font-bold font-['Space_Grotesk'] uppercase text-lg">
          {editingIndex !== null ? "Edit Education" : "Add Education"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edu-inst" className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              Institution Name *
            </label>
            <input
              id="edu-inst"
              type="text"
              value={currentItem.institutionName}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  institutionName: e.target.value,
                })
              }
              className="brutal-input w-full"
              placeholder="University or School name"
            />
          </div>

          <div>
            <label htmlFor="edu-cert" className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              Degree/Certification *
            </label>
            <input
              id="edu-cert"
              type="text"
              value={currentItem.certification}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  certification: e.target.value,
                })
              }
              className="brutal-input w-full"
              placeholder="Bachelor of Science, High School Diploma, etc."
            />
          </div>

          <div>
            <label htmlFor="edu-from" className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              From
            </label>
            <input
              id="edu-from"
              type="month"
              value={currentItem.durationFrom}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, durationFrom: e.target.value })
              }
              className="brutal-input w-full"
            />
          </div>

          <div>
            <label htmlFor="edu-to" className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
              To
            </label>
            <input
              id="edu-to"
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
          <label htmlFor="edu-desc" className="block font-mono text-sm font-bold mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            id="edu-desc"
            value={currentItem.summary}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, summary: e.target.value })
            }
            className="brutal-input w-full h-24 resize-none"
            placeholder="Describe your studies, achievements, GPA, etc..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={addEducation}
            disabled={
              !currentItem.institutionName || !currentItem.certification
            }
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

      {/* Education List */}
      <div className="space-y-3">
        {education.map((edu, index) => (
          <div key={index} className="brutal-card bg-(--card-bg) p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold font-['Space_Grotesk'] text-lg">
                  {edu.certification}
                </h4>
                <p className="font-mono text-sm text-(--fg-muted)">
                  {edu.institutionName}
                </p>
                <p className="font-mono text-xs text-(--fg-muted)">
                  {edu.durationFrom} - {edu.durationTo}
                </p>
                {edu.summary && (
                  <p className="font-mono text-sm mt-2">{edu.summary}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editEducation(index)}
                  className="brutal-btn px-3 py-1 text-xs"
                  style={{ background: "var(--yellow)", color: "#0a0a0a" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => removeEducation(index)}
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
