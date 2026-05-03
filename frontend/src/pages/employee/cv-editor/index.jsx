import React from "react";
import DashboardNav from "../../../components/shared/DashboardNav";
import { TEMPLATES } from "../../../features/cv-management/index.js";
import useCVEditor from "./hooks/useCVEditor";
import ActionBar from "./components/ActionBar";
import Toast from "./components/Toast";
import Sidebar from "./components/Sidebar";
import EditorContent from "./components/EditorContent";
import LivePreview from "./components/LivePreview";
import PreviewModal from "./components/PreviewModal";
import AnalysisModal from "./components/AnalysisModal";
import SkillGapModal from "./components/SkillGapModal";

export default function CVEditor() {
  const {
    id,
    user,
    cv,
    loading,
    saving,
    showExitPrompt,
    setShowExitPrompt,
    toast,
    sidebarOpen,
    setSidebarOpen,
    activeSections,
    collapsedSections,
    showPreview,
    setShowPreview,
    downloadingPdf,
    showTemplateSelector,
    setShowTemplateSelector,
    dragOverKey,
    previewRef,
    form,
    setForm,
    handlers,
    handleImageUpload,
    removeProfileImage,
    isSaving,
    lastSavedAt,
    suggestions,
    isLoadingSuggestions,
    fetchSuggestions,
    fetchSingleSummarySuggestion,
    handleSuggestionSelect,
    userName,
    filteredFormData,
    handleBack,
    handleSave,
    toggleSection,
    toggleCollapse,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    handleDownloadPdf,
    handleChangeTemplate,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    highlights,
    analyzing,
    showSkillGap,
    setShowSkillGap,
    staleAnalysis,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
    navigate,
  } = useCVEditor();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--nm-bg)",
          color: "var(--nm-text-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--nm-text-secondary)",
          }}
        >
          LOADING CV…
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "var(--nm-bg)",
        color: "var(--nm-text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Nav ── */}
      <div className="flex-shrink-0 dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div
        className="dashboard-shell cv-editor-shell flex flex-1 min-h-0 flex-col"
        style={{ padding: 0, paddingRight: 0, overflow: "visible" }}
      >
        {/* ── Action bar ── */}
        <ActionBar
          form={form}
          saving={saving}
          isAutoSaving={isSaving}
          lastSavedAt={lastSavedAt}
          analyzing={analyzing}
          downloadingPdf={downloadingPdf}
          atsScore={analysisResult?.atsScore}
          onSave={handleSave}
          onAnalyze={handleAnalyze}
          onSkillGap={() => setShowSkillGap(true)}
          onPreview={() => setShowPreview(true)}
          onDownloadPdf={handleDownloadPdf}
          onChangeTemplate={() => setShowTemplateSelector(true)}
          onBack={handleBack}
        />

        {/* ── Toast ── */}
        <Toast toast={toast} />

        {/* ── 3-column content ── */}
        <div className="cv-editor-layout" style={{ position: 'relative', zIndex: 1 }}>
          {/* ══ SIDEBAR ══ */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeSections={activeSections}
            toggleSection={toggleSection}
          />

          {/* ══ CENTER: form cards ══ */}
          <div className="cv-editor-center">
            <EditorContent
              form={form}
              setForm={setForm}
              user={user}
              cv={cv}
              activeSections={activeSections}
              collapsedSections={collapsedSections}
              handlers={handlers}
              toggleSection={toggleSection}
              toggleCollapse={toggleCollapse}
              dragOverKey={dragOverKey}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              handleImageUpload={handleImageUpload}
              removeProfileImage={removeProfileImage}
              fetchSuggestions={fetchSuggestions}
              fetchSingleSummarySuggestion={fetchSingleSummarySuggestion}
              handleSuggestionSelect={handleSuggestionSelect}
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              onAnalyzeSection={handleAnalyzeSection}
            />
          </div>

          {/* ══ RIGHT: live preview ══ */}
          <div ref={previewRef} className="cv-editor-preview">
            <LivePreview
              formData={filteredFormData()}
              userName={userName}
              templateId={cv?.templateId || 1}
              highlights={highlights}
            />
          </div>
        </div>
      </div>

      {/* ── Full-screen Preview Modal ── */}
      <PreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        userName={userName}
        getFilteredFormData={filteredFormData}
        templateId={cv?.templateId || 1}
        downloadingPdf={downloadingPdf}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* ── Analysis Modal ── */}
      <AnalysisModal
        show={showAnalysis}
        analysis={analysisResult}
        stale={staleAnalysis}
        currentData={form}
        userName={user?.firstName || "Candidate"}
        templateId={form.templateId || cv?.templateId || 1}
        onClose={() => setShowAnalysis(false)}
        onApply={handleApplyAnalysis}
      />

      {/* ── Skill Gap Modal ── */}
      <SkillGapModal
        show={showSkillGap}
        cvData={filteredFormData()}
        onClose={() => setShowSkillGap(false)}
        onAnalyze={handleSkillGapAnalysis}
      />

      {/* ── Template Selector Modal ── */}
      {showTemplateSelector && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setShowTemplateSelector(false)}
        >
          <div
            className="nm-card"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "1200px",
              maxHeight: "85vh",
              background: "var(--nm-bg)",
              borderWidth: "6px",
              boxShadow: "20px 20px 0 var(--nm-ink)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px 32px",
                background: "var(--nm-ink)",
                borderBottom: "4px solid var(--nm-ink)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#fff",
                  marginRight: "auto",
                }}
              >
                Template Configuration Matrix
              </span>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="nm-btn"
                style={{
                  padding: "10px 24px",
                  background: "var(--nm-error)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 12,
                  textTransform: "uppercase",
                }}
              >
                Abort
              </button>
            </div>

            {/* Templates Grid */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "32px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "24px",
                scrollbarWidth: "thin",
              }}
            >
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleChangeTemplate(tmpl.id)}
                  disabled={saving || cv?.templateId === tmpl.id}
                  className="nm-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    padding: "24px",
                    border: "4px solid var(--nm-ink)",
                    background:
                      cv?.templateId === tmpl.id
                        ? "var(--nm-primary)"
                        : "var(--nm-surface)",
                    boxShadow:
                      cv?.templateId === tmpl.id
                        ? "none"
                        : "6px 6px 0 var(--nm-ink)",
                    transform:
                      cv?.templateId === tmpl.id
                        ? "translate(4px, 4px)"
                        : "none",
                    cursor:
                      saving || cv?.templateId === tmpl.id
                        ? "not-allowed"
                        : "pointer",
                    opacity: saving ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "140px",
                      background: "var(--nm-bg)",
                      border: "3px solid var(--nm-ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
                    }}
                  >
                    {tmpl.id === 1 ? "📄" : tmpl.id === 5 ? "👤" : "📝"}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color:
                        cv?.templateId === tmpl.id
                          ? "#fff"
                          : "var(--nm-text-primary)",
                    }}
                  >
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Exit Prompt Modal ── */}
      {showExitPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="nm-card bg-[var(--nm-bg)] p-8 max-w-md w-full mx-4 flex flex-col gap-6">
            <h3 className="font-[var(--font-display)] font-black text-xl uppercase tracking-tight">
              ABORT SEQUENCE?
            </h3>
            <p className="font-mono text-xs text-[var(--nm-text-secondary)] uppercase font-bold leading-relaxed">
              Your CV data has not been fully committed to the central database. 
              Discarding now will result in permanent loss of progress.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <button
                disabled={saving}
                onClick={() => navigate("/employee/cvs")}
                className="nm-btn w-full"
                style={{ borderColor: 'var(--nm-error)', color: 'var(--nm-error)' }}
              >
                DISCARD CHANGES
              </button>
              <button
                onClick={() => setShowExitPrompt(false)}
                className="nm-btn nm-btn-primary w-full"
              >
                CONTINUE EDITING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
