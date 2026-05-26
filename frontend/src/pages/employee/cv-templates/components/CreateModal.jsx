import React, { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import {
  MOCK_CV_DATA,
  MOCK_USER_NAME,
} from "../../../../features/cv-management/mockCvData.js";

export default function CreateModal({ template, onClose, onCreate, loading }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const ModalPreviewComponent = template.component;

  const ZOOM = 0.72;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title for your CV.");
      return;
    }
    onCreate(title.trim());
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.72)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="brutal-card"
        style={{
          width: "80vw",
          height: "96vh",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            flex: "1 1 0",
            minWidth: 0,
            background: "#b8b4ac",
            borderRight: "3px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "9px 16px",
              borderBottom: "2px solid var(--border-color)",
              background: "var(--nav-bg)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: c,
                    border: "1.5px solid rgba(0,0,0,0.18)",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.58rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                marginLeft: 6,
              }}
            >
              Live Preview — {template.name}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.58rem",
                color: "var(--fg-muted)",
                letterSpacing: "0.06em",
              }}
            >
              A4 · {Math.round(ZOOM * 100)}%
            </span>
          </div>

          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                zoom: ZOOM,
                width: 794,
                minHeight: 1123,
                flexShrink: 0,
                background: "#fff",
                boxShadow:
                  "0 6px 32px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.10)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <ModalPreviewComponent
                userName={MOCK_USER_NAME}
                cvData={MOCK_CV_DATA}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            width: 300,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            padding: "1.6rem",
            gap: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--fg-muted)",
                  marginBottom: "0.3rem",
                }}
              >
                Using template
              </div>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  margin: 0,
                  color: "var(--fg)",
                  lineHeight: 1.2,
                }}
              >
                {template.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="nm-btn"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                minHeight: "unset",
                flexShrink: 0,
                background: "var(--nm-surface)",
              }}
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <span
            style={{
              display: "inline-block",
              width: "fit-content",
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "3px 10px",
              border: "3px solid var(--nm-ink)",
              background: template.accent,
              color: "#fff",
            }}
          >
            {template.tag || `Template ${template.id}`}
          </span>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "var(--nm-text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {template.description}
          </p>

          <div style={{ borderTop: "4px solid var(--nm-ink)", opacity: 0.1 }} />

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--nm-text-tertiary)] mb-2 block"
                htmlFor="cv-title-input"
              >
                CV / Job Title
              </label>
              <input
                id="cv-title-input"
                type="text"
                className="nm-input w-full"
                placeholder="e.g. Frontend Developer…"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
                disabled={loading}
              />
              {error && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "var(--nm-error)",
                    marginTop: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <button
                id="create-cv-submit-btn"
                type="submit"
                className="nm-btn nm-btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  "CREATING…"
                ) : (
                  <>
                    CREATE CV <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="nm-btn w-full"
                style={{ background: "var(--nm-surface)" }}
                disabled={loading}
              >
                CANCEL
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
