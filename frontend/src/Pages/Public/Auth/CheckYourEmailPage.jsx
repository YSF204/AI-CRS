import { useState } from "react";
import { Mail, ArrowLeft, Loader } from "lucide-react";
import api from "../../../services/api";

export default function CheckYourEmailPage({ email, onBackClick }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage("");
    setResendError("");

    try {
      await api.post("/auth/resend-verification-email", { email });
      setResendMessage("✓ Verification email sent! Check your inbox.");
    } catch (err) {
      setResendError(
        err.response?.data?.message ||
          "Failed to resend email. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
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
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--card-bg)",
          border: "3px solid var(--border-color)",
          boxShadow: "8px 8px 0 var(--shadow-color)",
          padding: "clamp(2rem, 4%, 3rem)",
        }}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div
            style={{
              background: "var(--teal)",
              borderRadius: "50%",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Mail size={48} color="#0a0a0a" />
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
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            We've sent a verification link to:
          </p>

          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--fg)",
              textAlign: "center",
              marginBottom: 24,
              wordBreak: "break-all",
            }}
          >
            {email}
          </p>

          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: "var(--fg-muted)",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Click the link in the email to verify your account and log in. The
            link expires in 24 hours.
          </p>

          {resendMessage && (
            <div
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: 16,
                background: "var(--teal)",
                color: "#0a0a0a",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
                border: "2px solid #0a0a0a",
              }}
            >
              {resendMessage}
            </div>
          )}

          {resendError && (
            <div
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: 16,
                background: "var(--coral)",
                color: "#0a0a0a",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
                border: "2px solid #0a0a0a",
              }}
            >
              {resendError}
            </div>
          )}

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              style={{
                width: "100%",
                padding: "12px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: "3px solid #0a0a0a",
                background: "#FFE630",
                color: "#0a0a0a",
                cursor: resendLoading ? "not-allowed" : "pointer",
                boxShadow: "3px 3px 0 #0a0a0a",
                opacity: resendLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {resendLoading && <Loader size={16} className="animate-spin" />}
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>

            <button
              onClick={onBackClick}
              style={{
                width: "100%",
                padding: "12px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                border: "3px solid #0a0a0a",
                background: "transparent",
                color: "#0a0a0a",
                cursor: "pointer",
                boxShadow: "3px 3px 0 #0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
