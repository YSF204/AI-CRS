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
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                <Sparkles size={28} style={{ color: "var(--nm-warning)" }} />
                CV Templates
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--nm-text-tertiary)",
                  marginTop: "0.5rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Choose a template to get started.
              </p>
            </div>

            <div
              className="stat-pill"
              style={{ 
                gap: "0.5rem", 
                flexShrink: 0, 
                alignSelf: "flex-start",
                border: '4px solid var(--nm-ink)',
                padding: '8px 16px',
                background: 'var(--nm-surface)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '11px',
                textTransform: 'uppercase'
              }}
            >
              <Layers size={14} strokeWidth={2.5} />
              <span>{TEMPLATES.length} Templates</span>
            </div>
          </div>

          <div
            style={{
              height: 8,
              background:
                "repeating-linear-gradient(90deg, var(--nm-primary) 0, var(--nm-primary) 24px, transparent 24px, transparent 32px)",
              marginTop: "1.5rem",
              border: "4px solid var(--nm-ink)",
            }}
          />
        </div>

        {apiError && (
          <div
            className="nm-card mb-6 p-4"
            style={{
              background: "var(--nm-error)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            {apiError}
          </div>
        )}

        <div
          className="grid gap-8"
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
          className="mt-16 text-center"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            color: "var(--nm-text-tertiary)",
            letterSpacing: "0.15em",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Select a template to start building your CV.
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
