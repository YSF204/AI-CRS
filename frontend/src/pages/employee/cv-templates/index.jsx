import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Layers } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import { TEMPLATES } from "../../../features/cv-management/index.js";
import TemplateCard from "./components/TemplateCard";
import CreateModal from "./components/CreateModal";

export default function CVTemplates() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSelectTemplate = (template) => {
    setSelected(template);
    setModalOpen(true);
  };

  const handleCreate = async (jobTitle) => {
    if (!selected) return;
    setLoading(true);
    setApiError("");
    try {
      navigate("/employee/cv-editor/new", {
        state: { jobTitle, templateId: selected.id },
      });
    } catch (err) {
      setApiError("Unable to route to CV editor. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="dashboard-nav-area">
        <DashboardNav role="employee" />
      </div>

      <div className="dashboard-shell py-6">
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1
                className="flex items-center gap-3"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                <Sparkles size={28} style={{ color: "#facc15" }} />
                CV Templates
              </h1>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.78rem",
                  color: "var(--fg-muted)",
                  marginTop: "0.5rem",
                }}
              >
                {TEMPLATES.length} professionally designed templates — click one
                to get started.
              </p>
            </div>

            <div
              className="stat-pill"
              style={{ gap: "0.5rem", flexShrink: 0, alignSelf: "flex-start" }}
            >
              <Layers size={14} />
              <span>{TEMPLATES.length} Templates</span>
            </div>
          </div>

          <div
            style={{
              height: 4,
              background:
                "repeating-linear-gradient(90deg, #facc15 0, #facc15 24px, transparent 24px, transparent 32px)",
              marginTop: "1.5rem",
              border: "2px solid var(--border-color)",
            }}
          />
        </div>

        {apiError && (
          <div
            className="brutal-card mb-6 p-4"
            style={{
              background: "#f97316",
              color: "#0a0a0a",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.8rem",
            }}
          >
            {apiError}
          </div>
        )}

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {TEMPLATES.map((template, i) => (
            <div
              key={template.id}
              style={{ animationDelay: `${0.05 + i * 0.07}s` }}
            >
              <TemplateCard
                template={template}
                isSelected={selected?.id === template.id}
                onSelect={handleSelectTemplate}
              />
            </div>
          ))}
        </div>

        <div
          className="mt-10 text-center"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.72rem",
            color: "var(--fg-muted)",
            letterSpacing: "0.08em",
          }}
        >
          Click any template to preview and create your CV →
        </div>
      </div>

      {modalOpen && selected && (
        <CreateModal
          template={selected}
          onClose={() => {
            setModalOpen(false);
            setApiError("");
          }}
          onCreate={handleCreate}
          loading={loading}
        />
      )}
    </div>
  );
}
