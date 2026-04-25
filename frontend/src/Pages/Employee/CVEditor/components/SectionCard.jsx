import React from "react";
import {
  GripVertical,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  getSectionMeta,
  inpCls,
  txtCls,
  newExp,
  newEdu,
  newCustomItem,
  CUSTOM_SECTION_TYPES,
} from "../constants";
import TagInput from "./TagInput";
import Field from "./Field";
import RepeatableItem from "./RepeatableItem";
import AddBtn from "./AddBtn";
import SummarySection from "./SectionCardSummary.jsx";
import LanguageSection from "./sections/LanguageSection.jsx";

export default function SectionCard({
  sectionKey,
  form,
  handlers,
  onRemove,
  collapsed,
  onToggleCollapse,
  fetchSuggestions,
  fetchSingleSummarySuggestion,
  handleSuggestionSelect,
  suggestions,
  isLoadingSuggestions,
  onAnalyzeSection,
}) {
  const meta = getSectionMeta(sectionKey);
  const Icon = meta.icon;
  const {
    setForm,
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
  } = handlers;

  const formBody = () => {
    switch (sectionKey) {
      case "summary":
        return (
          <SummarySection
            form={form}
            handlers={handlers}
            fetchSingleSummarySuggestion={fetchSingleSummarySuggestion}
            isLoadingSuggestions={isLoadingSuggestions}
            suggestions={suggestions}
            handleSuggestionSelect={handleSuggestionSelect}
          />
        );

      case "contact":
        return (
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
        );

      case "address":
        return (
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input
                className={inpCls}
                value={form.address.city}
                onChange={handlers.setAddress("city")}
                placeholder="San Francisco"
              />
            </Field>
            <Field label="Street">
              <input
                className={inpCls}
                value={form.address.street}
                onChange={handlers.setAddress("street")}
                placeholder="42 Market St"
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
        return (
          <div className="flex flex-col gap-4">
            {form.customSections.length === 0 && (
              <p className="text-center font-mono text-xs text-[var(--fg-muted)] py-2">
                Add a custom section (Projects, Certifications, etc.)
              </p>
            )}
            {form.customSections.map((section, si) => {
              const sectionTypeConfig =
                CUSTOM_SECTION_TYPES.find(
                  (t) => t.value === section.sectionType,
                ) || CUSTOM_SECTION_TYPES[2];
              const hasNameField = sectionTypeConfig.fields.includes("name");
              const hasDescriptionField =
                sectionTypeConfig.fields.includes("description");
              const hasDurationFields =
                sectionTypeConfig.fields.includes("durationFrom") &&
                sectionTypeConfig.fields.includes("durationTo");
              const hasLinkField = sectionTypeConfig.fields.includes("link");

              return (
                <div
                  key={`custom-section-wrapper-${si}`}
                  className="border-2 border-[var(--border-color)] bg-[var(--bg)]"
                >
                  <div className="flex items-center gap-2.5 px-3 py-2 border-b-2 border-[var(--border-color)] bg-[var(--card-bg)]">
                    {/* Section Type Selector */}
                    <select
                      className="bg-[var(--bg)] border border-[var(--border-color)] text-[var(--fg)] px-2 py-1 font-mono text-xs outline-none focus:border-[var(--yellow)] rounded"
                      value={section.sectionType || "other"}
                      onChange={(e) => {
                        const newSections = [...form.customSections];
                        const selectedType =
                          CUSTOM_SECTION_TYPES.find(
                            (t) => t.value === e.target.value,
                          ) || CUSTOM_SECTION_TYPES[2];
                        newSections[si].sectionType = e.target.value;
                        // Auto-set title to defaultTitle for projects and hobbies
                        if (selectedType?.defaultTitle) {
                          newSections[si].title = selectedType.defaultTitle;
                        } else if (section.sectionType === "other") {
                          newSections[si].title = "";
                        }
                        setForm((f) => ({ ...f, customSections: newSections }));
                      }}
                      placeholder={
                        section.sectionType === "other"
                          ? "Section title (e.g. Certifications)"
                          : ""
                      }
                      disabled={section.sectionType === "other"}
                    >
                      {CUSTOM_SECTION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    {/* Section Title Input */}
                    <input
                      className="flex-1 bg-transparent border-none outline-none font-['Space_Grotesk'] font-bold text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]"
                      value={section.title}
                      onChange={(e) =>
                        updateCustomSectionTitle(si, e.target.value)
                      }
                      placeholder={
                        section.sectionType === "other"
                          ? "Section title (e.g. Certifications)"
                          : ""
                      }
                      disabled={section.sectionType !== "other"}
                    />

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeCustomSection(si)}
                      className="text-red-500 hover:text-red-700 flex items-center p-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-3 flex flex-col gap-2">
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
                                onChange={(e) =>
                                  updateCustomItem(
                                    si,
                                    ii,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder={
                                  sectionTypeConfig.value === "projects"
                                    ? "Project name"
                                    : sectionTypeConfig.value ===
                                        "certifications"
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
                                  className={`${inpCls}`}
                                  value={item.durationFrom}
                                  onChange={(e) =>
                                    updateCustomItem(
                                      si,
                                      ii,
                                      "durationFrom",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="2022-01"
                                />
                              </Field>
                              <Field label="End">
                                <input
                                  type="month"
                                  className={`${inpCls}`}
                                  value={item.durationTo}
                                  onChange={(e) =>
                                    updateCustomItem(
                                      si,
                                      ii,
                                      "durationTo",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="2024-12"
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
                                onChange={(e) =>
                                  updateCustomItem(
                                    si,
                                    ii,
                                    "link",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://..."
                              />
                            </Field>
                          )}

                          {hasDescriptionField && (
                            <Field
                              label={
                                sectionTypeConfig.value === "hobbies"
                                  ? "Details"
                                  : "Description"
                              }
                            >
                              <textarea
                                className={`${txtCls} min-h-[56px]`}
                                value={item.description}
                                onChange={(e) =>
                                  updateCustomItem(
                                    si,
                                    ii,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Brief description..."
                              />
                            </Field>
                          )}

                          <div className="flex justify-end">
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
                </div>
              );
            })}
            <button
              type="button"
              onClick={addCustomSection}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-[var(--yellow)] text-[var(--fg)] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider hover:bg-[rgba(255,230,48,0.08)] transition-colors"
            >
              <Plus size={14} /> Add Custom Section
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="nm-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b-4 border-[var(--nm-ink)]"
        style={{ background: meta.accent }}
      >
        <div
          style={{
            cursor: "grab",
            opacity: 0.6,
            display: "flex",
            alignItems: "center",
          }}
        >
          <GripVertical size={18} color={meta.textColor} strokeWidth={2.5} />
        </div>
        <Icon size={18} style={{ color: meta.textColor }} strokeWidth={2.5} />
        <span
          className="font-[var(--font-display)] font-black text-xs uppercase tracking-[0.15em] flex-1"
          style={{ color: meta.textColor }}
        >
          {meta.label}
        </span>

        <div className="flex items-center gap-2">
          {/* Analyze */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyzeSection(sectionKey);
            }}
            title={`Analyze ${meta.label}`}
            className="nm-btn"
            style={{
              padding: "6px 12px",
              minHeight: "32px",
              background: "rgba(0,0,0,0.1)",
              borderColor: meta.textColor,
              color: meta.textColor,
              fontSize: "10px",
              borderWidth: "2px",
            }}
          >
            <Sparkles size={12} strokeWidth={3} /> REVIEW
          </button>
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "EXPAND_SECTION" : "COLLAPSE_SECTION"}
            className="nm-btn"
            style={{
              padding: "6px",
              minHeight: "32px",
              background: "rgba(0,0,0,0.1)",
              borderColor: meta.textColor,
              color: meta.textColor,
              borderWidth: "2px",
            }}
          >
            <ChevronDown
              size={14}
              strokeWidth={3}
              style={{
                transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>
          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="nm-btn"
            style={{
              padding: "6px 12px",
              minHeight: "32px",
              background: "rgba(0,0,0,0.1)",
              borderColor: meta.textColor,
              color: meta.textColor,
              fontSize: "10px",
              borderWidth: "2px",
            }}
          >
            <X size={12} strokeWidth={3} /> REMOVE
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      <div
        style={{
          maxHeight: collapsed ? 0 : 4000,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          background: "var(--nm-bg)",
        }}
      >
        <div className="p-6">{formBody()}</div>
      </div>
    </div>
  );
}
