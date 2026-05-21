import React from "react";
import { Plus, User, ImagePlus, Trash2 } from "lucide-react";
import SectionCard from "./SectionCard";
import { isCustomSectionKey, getCustomSectionIndex } from "../constants";

export default function EditorContent({
  form,
  setForm,
  user,
  cv,
  activeSections,
  collapsedSections,
  handlers,
  toggleSection,
  toggleCollapse,
  dragOverKey,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  handleImageUpload,
  removeProfileImage,
  fetchSuggestions,
  fetchSingleSummarySuggestion,
  handleSuggestionSelect,
  suggestions,
  isLoadingSuggestions,
  onAnalyzeSection,
  isMobile,
  onMoveUp,
  onMoveDown,
}) {
  if (activeSections.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-10">
        <div className="w-16 h-16 border-[3px] border-dashed border-[var(--border-color)] flex items-center justify-center">
          <Plus size={24} className="text-[var(--fg-muted)]" />
        </div>
        <div>
          <p className="font-['Space_Grotesk'] font-black text-base uppercase tracking-tight">
            No sections yet
          </p>
          <p className="font-mono text-xs text-[var(--fg-muted)] mt-1">
            {isMobile
              ? "Tap the Sections tab below to add sections to your CV"
              : "Click any section in the left sidebar to add it to your CV"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-6 w-full max-w-full" style={isMobile ? { padding: "16px", gap: "12px" } : {}}>
      {/* Static Section: Name Override */}
      <div className="nm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b-4 border-[var(--nm-ink)] bg-[var(--nm-primary)]">
          <User size={18} color="#fff" strokeWidth={2.5} />
          <span className="font-[var(--font-display)] font-black text-xs uppercase tracking-[0.15em] text-white flex-1">
            Identity Override
          </span>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <label className="font-mono text-[11px] uppercase font-bold tracking-widest text-[var(--nm-text-tertiary)]">
            Override System Designation
          </label>
          <input
            className="nm-input"
            placeholder={
              user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : "DEFAULT_USER"
            }
            value={form.fullName}
            onChange={(e) => handlers.updateField("fullName", e.target.value)}
          />
          <p className="font-mono text-[10px] text-[var(--nm-text-tertiary)] uppercase font-bold">
            Note: This value overrides the account primary name for document generation purposes.
          </p>
        </div>
      </div>

      {/* Profile image upload — shown for Two-Column template (id:5) */}
      {cv?.templateId === 5 && (
        <div className="nm-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b-4 border-[var(--nm-ink)] bg-[var(--nm-warning)]">
            <ImagePlus size={18} color="#fff" strokeWidth={2.5} />
            <span className="font-[var(--font-display)] font-black text-xs uppercase tracking-[0.15em] text-white flex-1">
              Visual Asset: Profile
            </span>
          </div>
          <div className="p-6 flex items-center gap-6">
            {form.profileImage ? (
              <>
                <img
                  src={form.profileImage}
                  alt="Profile"
                  className="w-24 h-24 object-cover border-4 border-[var(--nm-ink)]"
                />
                <div className="flex flex-col gap-3">
                  <label className="nm-btn" style={{ fontSize: "11px", padding: "8px 16px", minHeight: "40px" }}>
                    <ImagePlus size={14} strokeWidth={2.5} /> RE-UPLOAD
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    onClick={removeProfileImage}
                    className="nm-btn"
                    style={{ fontSize: "11px", padding: "8px 16px", minHeight: "40px", borderColor: "var(--nm-error)", color: "var(--nm-error)" }}
                  >
                    <Trash2 size={14} strokeWidth={2.5} /> DELETE
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 w-full py-10 border-4 border-dashed border-[var(--nm-ink)] bg-[var(--nm-surface-low)] text-[var(--nm-text-tertiary)] font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--nm-surface-high)] transition-colors cursor-pointer">
                <ImagePlus size={24} strokeWidth={2} />
                <span>Upload Profile Data (Max: 512KB)</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Draggable (desktop) / Accordion (mobile) section cards */}
      <div className="flex flex-col gap-6" style={isMobile ? { gap: "10px" } : {}}>
        {activeSections.map((key, index) => {
          if (isMobile) {
                      // Mobile: no drag-and-drop, use up/down arrows
            return (
              <SectionCard
                key={key}
                sectionKey={key}
                form={form}
                handlers={handlers}
                onRemove={() => {
                  if (isCustomSectionKey(key)) {
                    handlers.removeCustomSection(getCustomSectionIndex(key));
                  } else {
                    toggleSection(key);
                  }
                }}
                collapsed={!!collapsedSections[key]}
                onToggleCollapse={() => toggleCollapse(key)}
                fetchSuggestions={fetchSuggestions}
                fetchSingleSummarySuggestion={fetchSingleSummarySuggestion}
                handleSuggestionSelect={handleSuggestionSelect}
                suggestions={suggestions}
                isLoadingSuggestions={isLoadingSuggestions}
                onAnalyzeSection={onAnalyzeSection}
                isMobile={true}
                onMoveUp={() => onMoveUp(key)}
                onMoveDown={() => onMoveDown(key)}
                isFirst={index === 0}
                isLast={index === activeSections.length - 1}
              />
            );
          }

                    // Desktop: drag-and-drop enabled
          return (
            <div
              key={key}
              draggable
              onDragStart={() => onDragStart(key)}
              onDragOver={(e) => onDragOver(e, key)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(key)}
              onDragEnd={onDragEnd}
              style={{
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
                transform: dragOverKey === key ? "scale(1.02)" : "none",
                cursor: "grab",
              }}
            >
              <SectionCard
                sectionKey={key}
                form={form}
                handlers={handlers}
                onRemove={() => {
                  if (isCustomSectionKey(key)) {
                    handlers.removeCustomSection(getCustomSectionIndex(key));
                  } else {
                    toggleSection(key);
                  }
                }}
                collapsed={!!collapsedSections[key]}
                onToggleCollapse={() => toggleCollapse(key)}
                fetchSuggestions={fetchSuggestions}
                fetchSingleSummarySuggestion={fetchSingleSummarySuggestion}
                handleSuggestionSelect={handleSuggestionSelect}
                suggestions={suggestions}
                isLoadingSuggestions={isLoadingSuggestions}
                onAnalyzeSection={onAnalyzeSection}
                isMobile={false}
              />
            </div>
          );
        })}
      </div>
      <div className="h-20" />
    </div>
  );
}
