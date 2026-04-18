import React from "react";
import { Plus, User, ImagePlus, Trash2 } from "lucide-react";
import SectionCard from "./SectionCard";

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
            Click any section in the left sidebar to add it to your CV
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-4 w-full max-w-full">
      {/* Static Section: Name Override */}
      <div className="border-[3px] border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden w-full">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b-[3px] border-[var(--border-color)] bg-[var(--yellow)]">
          <User size={15} color="#000" />
          <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-[0.1em] text-[#0a0a0a] flex-1">
            CV Name Holder
          </span>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <label className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#0a0a0a]">
            Who is this CV for?
          </label>
          <input
            className="w-full p-2.5 border-2 border-[var(--border-color)] bg-[var(--bg)] text-sm font-mono focus:outline-none focus:bg-[var(--yellow)]/10"
            placeholder={
              user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : "Default Name"
            }
            value={form.fullName}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullName: e.target.value }))
            }
          />
          <p className="font-mono text-[8px] text-[var(--fg-muted)]">
            Type any name here to override your account name on the CV preview
            and PDF.
          </p>
        </div>
      </div>

      {/* Profile image upload — shown for Two-Column template (id:5) */}
      {cv?.templateId === 5 && (
        <div className="border-[3px] border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b-[3px] border-[var(--border-color)] bg-[#6c63ff]">
            <ImagePlus size={15} style={{ color: "#fff" }} />
            <span className="font-['Space_Grotesk'] font-black text-xs uppercase tracking-[0.1em] text-white flex-1">
              Profile Photo
            </span>
          </div>
          <div className="p-4 flex items-center gap-4">
            {form.profileImage ? (
              <>
                <img
                  src={form.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border-color)]"
                />
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--fg)] px-3 py-1.5 border-2 border-[var(--border-color)] bg-[var(--bg)] hover:border-[var(--fg)] transition-colors">
                    <ImagePlus size={11} /> Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={removeProfileImage}
                    className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={10} /> Remove
                  </button>
                </div>
              </>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[var(--border-color)] text-[var(--fg-muted)] font-mono text-[11px] font-bold uppercase tracking-wider hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors cursor-pointer">
                <ImagePlus size={14} /> Upload Profile Photo (max 500KB)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Draggable section cards */}
      {activeSections.map((key) => (
        <div
          key={key}
          draggable
          onDragStart={() => onDragStart(key)}
          onDragOver={(e) => onDragOver(e, key)}
          onDragLeave={onDragLeave}
          onDrop={() => onDrop(key)}
          onDragEnd={onDragEnd}
          style={{
            transition: "transform 0.15s ease, opacity 0.15s ease",
            transform: dragOverKey === key ? "scale(1.01)" : "none",
            borderTop:
              dragOverKey === key
                ? "3px solid var(--yellow)"
                : "3px solid transparent",
            cursor: "grab",
          }}
        >
          <SectionCard
            sectionKey={key}
            form={form}
            handlers={handlers}
            onRemove={() => toggleSection(key)}
            collapsed={!!collapsedSections[key]}
            onToggleCollapse={() => toggleCollapse(key)}
            fetchSuggestions={fetchSuggestions}
            fetchSingleSummarySuggestion={fetchSingleSummarySuggestion}
            handleSuggestionSelect={handleSuggestionSelect}
            suggestions={suggestions}
            isLoadingSuggestions={isLoadingSuggestions}
          />
        </div>
      ))}
      <div className="h-12" />
    </div>
  );
}
