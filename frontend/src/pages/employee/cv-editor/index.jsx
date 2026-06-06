import React, { useState } from "react";
import DashboardNav from "../../../components/shared/DashboardNav";
import { TEMPLATES } from "../../../features/cv-management/index.js";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import useCVEditor from "./hooks/useCVEditor";
import { useTranslation } from "../../../context/LanguageContext";

// Shared components
import ActionBar from "./components/ActionBar";
import Toast from "./components/Toast";
import Sidebar from "./components/Sidebar";
import EditorContent from "./components/EditorContent";
import LivePreview from "./components/LivePreview";
import PreviewModal from "./components/PreviewModal";
import AnalysisModal from "./components/AnalysisModal";
import SkillGapModal from "./components/SkillGapModal";
import TemplateSelector from "./components/TemplateSelector";

// Mobile-only components
import MobileTabBar from "./components/MobileTabBar";
import MobileSectionsTab from "./components/MobileSectionsTab";
import MobileBottomSheet from "./components/MobileBottomSheet";

export default function CVEditor() {
  const { t } = useTranslation();
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
    onMoveUp,
    onMoveDown,
    handleDownloadPdf,
    handleChangeTemplate,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    highlights,
    analyzing,
    analysisProgress,
    showSkillGap,
    setShowSkillGap,
    handleAnalyze,
    handleAnalyzeSection,
    handleApplyAnalysis,
    handleSkillGapAnalysis,
    navigate,
  } = useCVEditor();

  // Mobile state
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [mobileTab, setMobileTab] = useState("editor");
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // ── Loading state ────────────────────────────────────────────────────────
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
          {t("cvEditor.loadingCv")}
        </span>
      </div>
    );
  }

  // ── Shared props for EditorContent ───────────────────────────────────────
  const editorContentProps = {
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
    onAnalyzeSection: handleAnalyzeSection,
    isMobile,
    onMoveUp,
    onMoveDown,
  };

  // ── Shared props for ActionBar ───────────────────────────────────────────
  const actionBarProps = {
    form,
    saving,
    isAutoSaving: isSaving,
    lastSavedAt,
    analyzing,
    downloadingPdf,
    atsScore: analysisResult?.atsScore,
    onSave: handleSave,
    onAnalyze: handleAnalyze,
    onSkillGap: () => setShowSkillGap(true),
    onPreview: () => setShowPreview(true),
    onDownloadPdf: handleDownloadPdf,
    onChangeTemplate: () => setShowTemplateSelector(true),
    onBack: handleBack,
    isMobile,
  };

  // ── Shared modals (used by both layouts) ─────────────────────────────────
  const sharedModals = (
    <>
      <PreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        userName={userName}
        getFilteredFormData={filteredFormData}
        templateId={cv?.templateId || 1}
        downloadingPdf={downloadingPdf}
        onDownloadPdf={handleDownloadPdf}
      />

      <AnalysisModal
        show={showAnalysis}
        analysis={analysisResult}
        currentData={form}
        userName={user?.firstName || "Candidate"}
        templateId={form.templateId || cv?.templateId || 1}
        onClose={() => setShowAnalysis(false)}
        onApply={handleApplyAnalysis}
      />

      <SkillGapModal
        show={showSkillGap}
        cvData={filteredFormData()}
        onClose={() => setShowSkillGap(false)}
        onAnalyze={handleSkillGapAnalysis}
      />

      <TemplateSelector
        show={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        templates={TEMPLATES}
        currentTemplateId={cv?.templateId || 1}
        onSelect={handleChangeTemplate}
        saving={saving}
        userName={userName}
        getFilteredFormData={filteredFormData}
      />

      {/* Analysis Progress Bar (bottom-right) */}
      {analyzing && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? 72 : 24,
            right: 24,
            zIndex: 9999,
            width: 280,
            background: "var(--nm-surface)",
            border: "4px solid var(--nm-ink)",
            boxShadow: "6px 6px 0 var(--nm-ink)",
            padding: "16px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nm-text-primary)" }}>
              {t("cvEditor.aiAnalysis")}
            </span>
            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--nm-primary)" }}>
              {analysisProgress}%
            </span>
          </div>
          <div style={{ width: "100%", height: 10, background: "var(--nm-surface-high)", border: "2px solid var(--nm-ink)" }}>
            <div
              style={{
                height: "100%",
                width: `${analysisProgress}%`,
                background: "var(--nm-primary)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.7rem", color: "var(--nm-text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {analysisProgress < 30
              ? t("atsAudit.loadingCvData")
              : analysisProgress < 60
              ? t("atsAudit.runningAtsScoring")
              : analysisProgress < 90
              ? t("atsAudit.generatingRecs")
              : t("atsAudit.almostDone")}
          </p>
        </div>
      )}

      {/* Exit Prompt Modal */}
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
              {t("cvEditor.unsavedChanges")}
            </h3>
            <p className="font-mono text-xs text-[var(--nm-text-secondary)] uppercase font-bold leading-relaxed">
              {t("cvEditor.unsavedChangesDesc")}
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <button
                disabled={saving}
                onClick={() => navigate("/employee/cvs")}
                className="nm-btn w-full"
                style={{ borderColor: "var(--nm-error)", color: "var(--nm-error)" }}
              >
                {t("cvEditor.discardChanges")}
              </button>
              <button
                onClick={() => setShowExitPrompt(false)}
                className="nm-btn nm-btn-primary w-full"
              >
                {t("cvEditor.continueEditing")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div
        className="cv-editor-mobile-layout"
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
        {/* DashboardNav (burger icon only on mobile) */}
        <div className="dashboard-nav-area">
          <DashboardNav role="employee" />
        </div>

        {/* Mobile Action Bar */}
        <ActionBar {...actionBarProps} />

        {/* Toast */}
        <Toast toast={toast} />

        {/* Hidden preview container for PDF generation on mobile */}
        <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none", opacity: 0 }}>
          <div ref={previewRef}>
            <LivePreview
              formData={filteredFormData()}
              userName={userName}
              templateId={cv?.templateId || 1}
              highlights={highlights}
            />
          </div>
        </div>

        {/* Tab content area */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* SECTIONS TAB */}
          {mobileTab === "sections" && (
            <MobileSectionsTab
              activeSections={activeSections}
              toggleSection={toggleSection}
              onOpenSheet={() => setBottomSheetOpen(true)}
              form={form}
            />
          )}

          {/* EDITOR TAB */}
          {mobileTab === "editor" && (
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              <EditorContent {...editorContentProps} />
            </div>
          )}

          {/* PREVIEW TAB */}
          {mobileTab === "preview" && (
            <LivePreview
              formData={filteredFormData()}
              userName={userName}
              templateId={cv?.templateId || 1}
              highlights={highlights}
              isMobileTab={true}
            />
          )}
        </div>

        {/* Bottom Sheet (section picker) */}
        <MobileBottomSheet
          open={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          activeSections={activeSections}
          toggleSection={toggleSection}
          onAddCustomSection={handlers.addCustomSection}
        />

        {/* Fixed Tab Bar */}
        <MobileTabBar
          activeTab={mobileTab}
          onChange={setMobileTab}
          activeSections={activeSections}
        />

        {/* Shared Modals */}
        {sharedModals}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (unchanged)
  // ════════════════════════════════════════════════════════════════════════
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
      {/* Nav */}
      <div className="flex-shrink-0 dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div
        className="dashboard-shell cv-editor-shell flex flex-1 min-h-0 flex-col"
        style={{ padding: 0, paddingRight: 0, overflow: "visible" }}
      >
        {/* Action bar */}
        <ActionBar {...actionBarProps} />

        {/* Toast */}
        <Toast toast={toast} />

        {/* 3-column content */}
        <div className="cv-editor-layout" style={{ position: "relative", zIndex: 1 }}>
          {/* SIDEBAR */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeSections={activeSections}
            toggleSection={toggleSection}
            onAddCustomSection={handlers.addCustomSection}
            form={form}
          />

          {/* CENTER: form cards */}
          <div className="cv-editor-center">
            <EditorContent {...editorContentProps} />
          </div>

          {/* RIGHT: live preview */}
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

      {/* Shared Modals */}
      {sharedModals}
    </div>
  );
}
