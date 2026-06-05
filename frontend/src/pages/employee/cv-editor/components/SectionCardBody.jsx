import React from "react";
import {
  X,
  Plus,
  Trash2,
} from "lucide-react";
import {
  inpCls,
  txtCls,
  newExp,
  newEdu,
  CUSTOM_SECTION_TYPES,
  CUSTOM_SECTION_KEY_PREFIX,
  getCustomSectionIndex,
  isCustomSectionKey,
} from "../constants";
import TagInput from "./TagInput";
import Field from "./Field";
import RepeatableItem from "./RepeatableItem";
import AddBtn from "./AddBtn";
import SummarySection from "./SectionCardSummary.jsx";
import LanguageSection from "./sections/LanguageSection.jsx";

export default function SectionCardBody({ sectionKey, form, handlers }) {
  const {
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
    addCustomLink,
    removeCustomLink,
    updateCustomLink,
  } = handlers;

  switch (sectionKey) {
    case "summary":
      return (
        <SummarySection
          form={form}
          handlers={handlers}
          fetchSingleSummarySuggestion={handlers.fetchSingleSummarySuggestion}
          isLoadingSuggestions={handlers.isLoadingSuggestions}
          suggestions={handlers.suggestions}
          handleSuggestionSelect={handlers.handleSuggestionSelect}
        />
      );

    case "contact":
      return (
        <div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Phone",
                key: "phone",
                placeholder: "+1 (555) 000-0000",
              },
              {
                label: "Email",
                key: "email",
                placeholder: "you@example.com",
              },
              {
                label: "LinkedIn",
                key: "linkedin",
                placeholder: "linkedin.com/in/username",
              },
              {
                label: "GitHub",
                key: "github",
                placeholder: "github.com/username",
              },
            ].map(({ label, key, placeholder }) => (
              <Field key={key} label={label}>
                <input
                  className={inpCls}
                  value={form.contact[key]}
                  onChange={handlers.setContact(key)}
                  placeholder={placeholder}
                />
              </Field>
            ))}
          </div>

          <div className="mt-4">
            <div className="font-mono text-[11px] uppercase font-bold tracking-widest text-[var(--nm-text-primary)] mb-2 block">
              Custom Links
            </div>
            <div className="flex flex-col gap-2">
              {(form.contact.customLinks || []).map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    className={inpCls}
                    value={link.icon || "globe"}
                    onChange={(e) => updateCustomLink(i, "icon", e.target.value)}
                  >
                    <option value="globe">Website</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                  </select>
                  <input
                    className={inpCls}
                    value={link.url}
                    onChange={(e) => updateCustomLink(i, "url", e.target.value)}
                    placeholder="URL (https://...)"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomLink(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomLink}
                className="flex items-center justify-center gap-1.5 w-full py-2 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[10px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors"
              >
                <Plus size={11} /> Add Custom Link
              </button>
            </div>
          </div>
        </div>
      );

    case "address":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country">
            <input
              className={inpCls}
              value={form.address.country}
              onChange={handlers.setAddress("country")}
              placeholder="e.g. United States"
            />
          </Field>
          <Field label="City">
            <input
              className={inpCls}
              value={form.address.city}
              onChange={handlers.setAddress("city")}
              placeholder="e.g. San Francisco"
            />
          </Field>
        </div>
      );

    case "experience":
      return (
        <div className="flex flex-col gap-3">
          {form.experience.length === 0 && (
            <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-3">
              No entries yet — add one below.
            </p>
          )}
          {form.experience.map((item, i) => (
            <RepeatableItem
              key={`experience-${i}`}
              onDelete={() => exp.remove(i)}
              onMoveUp={() => exp.moveUp(i)}
              onMoveDown={() => exp.moveDown(i)}
              canUp={i > 0}
              canDown={i < form.experience.length - 1}
            >
              <div className="grid grid-cols-2 gap-2">
                <Field label="Company / Institution">
                  <input
                    className={inpCls}
                    value={item.institutionName}
                    onChange={(e) =>
                      exp.update(i, "institutionName", e.target.value)
                    }
                    placeholder="Google Inc."
                  />
                </Field>
                <Field label="Position / Role">
                  <input
                    className={inpCls}
                    value={item.position}
                    onChange={(e) =>
                      exp.update(i, "position", e.target.value)
                    }
                    placeholder="Senior Engineer"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start">
                    <input
                      type="month"
                      className={`${inpCls}`}
                      value={item.durationFrom}
                      onChange={(e) =>
                        exp.update(i, "durationFrom", e.target.value)
                      }
                      placeholder="2021-01"
                    />
                  </Field>
                  <Field label="End">
                    <input
                      type="month"
                      className={`${inpCls}`}
                      value={item.durationTo}
                      onChange={(e) =>
                        exp.update(i, "durationTo", e.target.value)
                      }
                      placeholder="2024-12"
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    className={txtCls}
                    value={item.summary}
                    onChange={(e) => exp.update(i, "summary", e.target.value)}
                    placeholder="Key achievements..."
                  />
                </Field>
              </div>
            </RepeatableItem>
          ))}
          <AddBtn
            label="Add Experience Entry"
            onClick={() => exp.add(newExp())}
          />
        </div>
      );

    case "education":
      return (
        <div className="flex flex-col gap-3">
          {form.education.length === 0 && (
            <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-3">
              No entries yet — add one below.
            </p>
          )}
          {form.education.map((item, i) => (
            <RepeatableItem
              key={`education-${i}`}
              onDelete={() => edu.remove(i)}
              onMoveUp={() => edu.moveUp(i)}
              onMoveDown={() => edu.moveDown(i)}
              canUp={i > 0}
              canDown={i < form.education.length - 1}
            >
              <div className="grid grid-cols-2 gap-2">
                <Field label="Institution">
                  <input
                    className={inpCls}
                    value={item.institutionName}
                    onChange={(e) =>
                      edu.update(i, "institutionName", e.target.value)
                    }
                    placeholder="MIT"
                  />
                </Field>
                <Field label="Degree / Certification">
                  <input
                    className={inpCls}
                    value={item.certification}
                    onChange={(e) =>
                      edu.update(i, "certification", e.target.value)
                    }
                    placeholder="B.Sc. Computer Science"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start">
                    <input
                      type="month"
                      className={`${inpCls}`}
                      value={item.durationFrom}
                      onChange={(e) =>
                        edu.update(i, "durationFrom", e.target.value)
                      }
                      placeholder="2018-08"
                    />
                  </Field>
                  <Field label="End">
                    <input
                      type="month"
                      className={`${inpCls}`}
                      value={item.durationTo}
                      onChange={(e) =>
                        edu.update(i, "durationTo", e.target.value)
                      }
                      placeholder="2022-06"
                    />
                  </Field>
                </div>
                <Field label="Notes / Honors">
                  <textarea
                    className={txtCls}
                    value={item.summary}
                    onChange={(e) => edu.update(i, "summary", e.target.value)}
                    placeholder="Graduated with honors..."
                  />
                </Field>
              </div>
            </RepeatableItem>
          ))}
          <AddBtn
            label="Add Education Entry"
            onClick={() => edu.add(newEdu())}
          />
        </div>
      );

    case "technicalSkills":
      return (
        <div>
          <Field
            label="Technical Skills"
            hint="press Enter or comma to add a tag"
          >
            <TagInput
              value={form.technicalSkills}
              onChange={set("technicalSkills")}
              placeholder="React, Node.js, Python..."
            />
          </Field>
        </div>
      );

    case "softSkills":
      return (
        <div>
          <Field label="Soft Skills" hint="press Enter or comma to add">
            <TagInput
              value={form.softSkills}
              onChange={set("softSkills")}
              placeholder="Leadership, Communication..."
            />
          </Field>
        </div>
      );

    case "language":
      return <LanguageSection form={form} handlers={handlers} />;

    case "customSections":
      // Legacy fallback: render all custom sections (should not normally be reached)
      return (
        <div className="flex flex-col gap-4">
          <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-2">
            Use the sidebar to manage individual custom sections.
          </p>
        </div>
      );

    default: {
      // Per-section custom section key: customSection__N
      if (isCustomSectionKey(sectionKey)) {
        const si = getCustomSectionIndex(sectionKey);
        const section = form.customSections?.[si];
        if (!section) return null;

        const sectionTypeConfig =
          CUSTOM_SECTION_TYPES.find((t) => t.value === section.sectionType) || CUSTOM_SECTION_TYPES[3];
        const hasNameField = sectionTypeConfig.fields.includes("name");
        const hasDescriptionField = sectionTypeConfig.fields.includes("description");
        const hasDurationFields =
          sectionTypeConfig.fields.includes("durationFrom") &&
          sectionTypeConfig.fields.includes("durationTo");
        const hasLinkField = sectionTypeConfig.fields.includes("link");

        return (
          <div className="flex flex-col gap-3">
            {/* Section header: type selector + title input */}
            <div className="flex items-center gap-2.5 p-3 border-2 border-[var(--border-color)] bg-[var(--card-bg)]">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor={`section-type-${si}`} className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--nm-text-tertiary)]">
                  Section Type
                </label>
                <select
                  id={`section-type-${si}`}
                  className="bg-[var(--nm-bg)] border-2 border-[var(--nm-ink)] text-[var(--nm-text-primary)] px-2 py-1.5 font-mono text-xs outline-none focus:border-[var(--nm-primary)] nm-input"
                  value={section.sectionType || "other"}
                  onChange={(e) => {
                    const selectedType =
                      CUSTOM_SECTION_TYPES.find((t) => t.value === e.target.value) || CUSTOM_SECTION_TYPES[3];
                    const newSections = form.customSections.map((s, i) =>
                      i === si
                        ? {
                            ...s,
                            sectionType: e.target.value,
                            title: selectedType?.defaultTitle || s.title,
                          }
                        : s
                    );
                    setForm((f) => ({ ...f, customSections: newSections }));
                    triggerAutoSave();
                  }}
                >
                  {CUSTOM_SECTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor={`section-title-${si}`} className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--nm-text-tertiary)]">
                  Section Title
                </label>
                <input
                  id={`section-title-${si}`}
                  className="nm-input"
                  value={section.title}
                  onChange={(e) => updateCustomSectionTitle(si, e.target.value)}
                  placeholder="e.g. My Projects, Awards..."
                />
              </div>
            </div>

            {/* Items */}
            {section.items.map((item, ii) => (
              <div
                key={`custom-section-${si}-item-${ii}`}
                className="border border-[var(--border-color)] p-2.5 bg-[var(--card-bg)] flex flex-col gap-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  {hasNameField && (
                    <Field
                      label={
                        sectionTypeConfig.value === "projects"
                          ? "Project"
                          : sectionTypeConfig.value === "certifications"
                          ? "Certification"
                          : sectionTypeConfig.value === "hobbies"
                          ? "Hobby"
                          : "Name"
                      }
                    >
                      <input
                        className={inpCls}
                        value={item.name}
                        onChange={(e) => updateCustomItem(si, ii, "name", e.target.value)}
                        placeholder={
                          sectionTypeConfig.value === "projects"
                            ? "Project name"
                            : sectionTypeConfig.value === "certifications"
                            ? "Certification name"
                            : sectionTypeConfig.value === "hobbies"
                            ? "Hobby name"
                            : "Name"
                        }
                      />
                    </Field>
                  )}

                  {hasDurationFields && (
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Start">
                        <input
                          type="month"
                          className={inpCls}
                          value={item.durationFrom}
                          onChange={(e) => updateCustomItem(si, ii, "durationFrom", e.target.value)}
                        />
                      </Field>
                      <Field label="End">
                        <input
                          type="month"
                          className={inpCls}
                          value={item.durationTo}
                          onChange={(e) => updateCustomItem(si, ii, "durationTo", e.target.value)}
                        />
                      </Field>
                    </div>
                  )}

                  {hasLinkField && (
                    <Field
                      label={
                        sectionTypeConfig.value === "projects"
                          ? "Project Link"
                          : sectionTypeConfig.value === "certifications"
                          ? "Certification Link"
                          : "Link (optional)"
                      }
                    >
                      <input
                        className={inpCls}
                        value={item.link}
                        onChange={(e) => updateCustomItem(si, ii, "link", e.target.value)}
                        placeholder="https://..."
                      />
                    </Field>
                  )}

                  {hasDescriptionField && (
                    <Field
                      label={sectionTypeConfig.value === "hobbies" ? "Details" : "Description"}
                    >
                      <textarea
                        className={`${txtCls} min-h-[56px]`}
                        value={item.description}
                        onChange={(e) => updateCustomItem(si, ii, "description", e.target.value)}
                        placeholder="Brief description..."
                      />
                    </Field>
                  )}

                  <div className="flex justify-end col-span-2">
                    <button
                      type="button"
                      onClick={() => removeCustomItem(si, ii)}
                      className="flex items-center gap-1 border border-red-400 text-red-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 hover:bg-red-50 transition-colors"
                    >
                      <X size={9} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addCustomItem(si)}
              className="flex items-center justify-center gap-1.5 w-full py-2 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[10px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors"
            >
              <Plus size={11} /> Add{" "}
              {sectionTypeConfig.label === "Hobbies" ? "Hobby" : "Item"}
            </button>
          </div>
        );
      }
      return null;
    }
  }
}
