import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState("form");
  const [message, setMessage] = useState("");

  const handleSuccess = (msg) => {
    setStatus("success");
    setMessage(msg);
  };

  const handleError = (msg) => {
    setStatus("error");
    setMessage(msg);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1rem, 4%, 3rem)",
        background: "var(--bg)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "clamp(0.6rem, 1.5%, 1rem) clamp(1.25rem, 3%, 2.5rem)",
          background: "var(--nav-bg)",
          borderBottom: "3px solid var(--border-color)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "var(--fg)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={18} />
          <span
            className="bg-brutal-yellow text-black font-bold"
            style={{
              padding: "0.1em 0.35em",
              fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)",
              letterSpacing: "-0.03em",
            }}
          >
            AI-CRS
          </span>
        </Link>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--card-bg)",
          border: "3px solid var(--border-color)",
          boxShadow: "8px 8px 0 var(--shadow-color)",
          padding: "clamp(1.5rem, 4%, 2.5rem)",
          marginTop: 60,
        }}
      >
        {status === "form" && (
          <ForgotPasswordForm onSuccess={handleSuccess} onError={handleError} />
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div
              style={{
                background: "var(--teal)",
                borderRadius: "50%",
                padding: 16,
                marginBottom: 24,
              }}
            >
              <CheckCircle2 size={48} color="#0a0a0a" />
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                color: "var(--fg)",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Check Your Email
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                color: "var(--fg-muted)",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {message} The link will expire in 10 minutes.
            </p>

            <Link
              to="/auth?mode=login"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#FFE630",
                color: "#0a0a0a",
                textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: "3px solid #0a0a0a",
                boxShadow: "3px 3px 0 #0a0a0a",
              }}
            >
              Back to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div
              style={{
                background: "var(--coral)",
                borderRadius: "50%",
                padding: 16,
                marginBottom: 24,
              }}
            >
              <AlertCircle size={48} color="#0a0a0a" />
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                color: "var(--fg)",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Error
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                color: "var(--fg-muted)",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>

            <button
              onClick={() => {
                setStatus("form");
                setMessage("");
              }}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#FFE630",
                color: "#0a0a0a",
                textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: "3px solid #0a0a0a",
                boxShadow: "3px 3px 0 #0a0a0a",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
