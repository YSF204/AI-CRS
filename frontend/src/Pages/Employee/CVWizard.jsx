import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import ActionButton from "../../components/shared/ActionButton";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { DEFAULT_SECTION_ORDER, getSectionMeta } from "./CVEditor/constants";
import useCVForm from "./CVEditor/hooks/useCVForm";
import SectionEditor from "./CVEditor/components/SectionEditor";
import LivePreview from "./CVEditor/components/LivePreview";
import AnalysisModal from "./CVEditor/components/AnalysisModal";

export default function CVWizard() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sections = DEFAULT_SECTION_ORDER.filter(
    (section) => section !== "customSections",
  ); // Exclude custom sections for now

  const {
    form,
    setForm,
    handlers,
    getFilteredFormData,
    handleImageUpload,
    removeProfileImage,
  } = useCVForm((type, msg) => {
    // Simple toast implementation
    alert(`${type}: ${msg}`);
  });

  useEffect(() => {
    const loadCV = async () => {
      try {
        if (id === "new") {
          // Create new CV
          setCv({ _id: "new", userId: user._id });
          setLoading(false);
          return;
        }

        const res = await api.get(`/cvs/${id}`);
        const cvData = res.data?.data?.cv;
        if (cvData) {
          setCv(cvData);
          // Load form data
          setForm({
            fullName: cvData.fullName || "",
            summary: cvData.summary || "",
            contact: {
              email: cvData.contact?.email || "",
              phone: cvData.contact?.phone || "",
              linkedin: cvData.contact?.linkedin || "",
              github: cvData.contact?.github || "",
            },
            address: cvData.address || "",
            experience: cvData.experience || [],
            education: cvData.education || [],
            technicalSkills: cvData.technicalSkills || [],
            softSkills: cvData.softSkills || [],
            language: cvData.language || [],
            customSections: cvData.customSections || [],
          });
        }
      } catch (error) {
        console.error("Failed to load CV:", error);
        alert("Failed to load CV");
        navigate("/employee/cvs");
      } finally {
        setLoading(false);
      }
    };

    loadCV();
  }, [id, user._id, setForm, navigate]);

  const currentSection = sections[currentStep];
  const sectionMeta = getSectionMeta(currentSection);
  const isLastStep = currentStep === sections.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // Get all form data (don't filter - we want the full data)
      const allFormData = getFilteredFormData(DEFAULT_SECTION_ORDER);
      const sectionData = allFormData[currentSection];

      console.log("Analyzing section:", currentSection, "Data:", sectionData);

      // Validate section data before sending
      let isDataEmpty = false;
      if (!sectionData) {
        isDataEmpty = true;
      } else if (
        typeof sectionData === "string" &&
        sectionData.trim().length === 0
      ) {
        isDataEmpty = true;
      } else if (Array.isArray(sectionData) && sectionData.length === 0) {
        isDataEmpty = true;
      } else if (
        typeof sectionData === "object" &&
        Object.keys(sectionData).every((key) => !sectionData[key])
      ) {
        isDataEmpty = true;
      }

      if (isDataEmpty) {
        alert(
          `Please fill in the ${sectionMeta.label} section before analyzing.`,
        );
        setAnalyzing(false);
        return;
      }

      // Call AI analysis API
      const response = await api.post("/cvs/analyze-section", {
        section: currentSection,
        data: sectionData,
        fullName: form.fullName,
      });

      console.log("Analysis response:", response.data);

      if (response.data?.success && response.data?.data) {
        setAnalysisResult(response.data.data);
        setShowAnalysis(true);
      } else {
        alert("Unable to generate analysis. Please try again.");
      }
    } catch (error) {
      console.error("Analysis error details:", error.response?.data || error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Analysis failed. Please try again.";
      alert(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cvData = {
        ...getFilteredFormData(),
        userId: user._id,
      };

      if (id === "new") {
        const res = await api.post("/cvs", cvData);
        navigate(`/employee/cv-editor/${res.data.data.cv._id}`);
      } else {
        await api.patch(`/cvs/${id}`, cvData);
        alert("CV saved successfully!");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save CV");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    await handleSave();
    navigate("/employee/cvs");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg) text-(--fg)">
        <div className="dashboard-nav-area">
          <DashboardNav role="employee" />
        </div>
        <div className="dashboard-shell py-6">
          <div className="brutal-card p-8 bg-(--card-bg) text-center">
            <p className="font-mono text-sm text-(--fg-muted)">Loading CV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold font-['Space_Grotesk'] uppercase tracking-tight">
                CV Builder
              </h1>
              <p className="font-mono text-sm text-[var(--fg-muted)] mt-1">
                Step {currentStep + 1} of {sections.length}: {sectionMeta.label}
              </p>
            </div>
            <ActionButton
              variant="prism"
              onClick={() => navigate("/employee/cvs")}
              className="px-4 py-2 flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to CVs
            </ActionButton>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--border-color)] rounded-full h-2">
            <div
              className="bg-[var(--teal)] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Editor on Left (Bigger), Preview on Right */}
      <div className="flex flex-col lg:flex-row gap-4 p-8 min-h-[calc(100vh-140px)]">
        {/* Left Column: Section Editor - Bigger */}
        <div className="flex-[2] min-w-0">
          <div className="brutal-card bg-[var(--card-bg)] p-8 h-full border-4 border-[var(--border-color)]">
            <SectionEditor
              section={currentSection}
              form={form}
              handlers={handlers}
              handleImageUpload={handleImageUpload}
              removeProfileImage={removeProfileImage}
            />
          </div>
        </div>

        {/* Right Column: Live Preview - Smaller, Optional */}
        <div className="flex-1 min-w-0 hidden lg:flex flex-col gap-4">
          <ActionButton
            variant="prism"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-3 font-bold uppercase w-full"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </ActionButton>
          {showPreview && (
            <div className="brutal-card bg-[var(--card-bg)] p-0 flex-1 flex flex-col border-4 border-[var(--border-color)]">
              <LivePreview
                formData={form}
                userName={form.fullName}
                templateId={1}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 p-8 bg-[var(--bg)] border-t-4 border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
        <ActionButton
          variant="prism"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="px-6 py-3 flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </ActionButton>

        <div className="flex gap-2 flex-wrap">
          {/* Mobile Preview Button */}
          <ActionButton
            variant="prism"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-3 font-bold flex items-center gap-2 lg:hidden"
          >
            {showPreview ? "Hide" : "Show"} Preview
          </ActionButton>

          <ActionButton
            variant="ai-gold"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-3 flex items-center gap-2"
          >
            <Sparkles size={16} />
            {analyzing ? "Analyzing..." : "Analyze"}
          </ActionButton>

          {isLastStep ? (
            <ActionButton
              variant="prism"
              onClick={handleFinish}
              disabled={saving}
              className="px-6 py-3 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {saving ? "Saving..." : "Finish"}
            </ActionButton>
          ) : (
            <ActionButton
              variant="prism"
              onClick={handleNext}
              className="px-6 py-3 flex items-center gap-2"
            >
              Next Section
              <ChevronRight size={16} />
            </ActionButton>
          )}
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-h-[90vh] overflow-y-auto bg-[var(--card-bg)] border-4 border-[var(--border-color)] rounded">
              <div className="sticky top-0 bg-[var(--nav-bg)] p-4 border-b-4 border-[var(--border-color)] flex justify-between items-center">
                <h2 className="font-['Space_Grotesk'] font-bold uppercase">
                  CV Preview
                </h2>
                <ActionButton
                  variant="prism"
                  onClick={() => setShowPreview(false)}
                  className="px-3 py-1 text-sm"
                >
                  Close
                </ActionButton>
              </div>
              <div className="p-4">
                <LivePreview
                  formData={form}
                  userName={form.fullName}
                  templateId={1}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {showAnalysis && (
        <AnalysisModal
          analysis={analysisResult}
          section={currentSection}
          onClose={() => setShowAnalysis(false)}
          onApply={(suggestions) => {
            // Apply suggestions to form
            handlers.updateSection(currentSection, suggestions);
            setShowAnalysis(false);
          }}
        />
      )}
    </div>
  );
}
