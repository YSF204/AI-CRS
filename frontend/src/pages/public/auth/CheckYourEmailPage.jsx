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
      setResendMessage(
        "If your account still needs verification, a fresh email is on the way.",
      );
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
        padding: "clamp(1.5rem, 5%, 4rem)",
        background: "var(--nm-bg)",
      }}
    >
      <div
        className="nm-card"
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--nm-surface)",
          borderWidth: "4px",
          boxShadow: "10px 10px 0 var(--nm-ink)",
          padding: "clamp(2rem, 5%, 3.5rem)",
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <div
            style={{
              background: "var(--nm-primary)",
              padding: 20,
              marginBottom: 32,
              border: "4px solid var(--nm-ink)",
              boxShadow: "4px 4px 0 var(--nm-ink)",
            }}
          >
            <Mail size={48} color="#fff" strokeWidth={2.5} />
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--nm-text-primary)",
              textAlign: "center",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
            }}
          >
            Check Your Email
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--nm-text-secondary)",
              textAlign: "center",
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            We&apos;ve sent a verification link to:
          </p>

          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 800,
              color: "var(--nm-text-primary)",
              textAlign: "center",
              marginBottom: 32,
              wordBreak: "break-all",
              textDecoration: "underline",
              textDecorationColor: "var(--nm-primary)",
              textDecorationThickness: "3px",
            }}
          >
            {email}
          </p>

          {resendMessage && (
            <div
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: 20,
                background: "var(--nm-success)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                border: "4px solid var(--nm-ink)",
                boxShadow: "4px 4px 0 var(--nm-ink)",
              }}
            >
              {resendMessage}
            </div>
          )}

          {resendError && (
            <div
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: 20,
                background: "var(--nm-error)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                border: "4px solid var(--nm-ink)",
                boxShadow: "4px 4px 0 var(--nm-ink)",
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
              gap: 16,
            }}
          >
            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="nm-btn"
              style={{
                width: "100%",
                padding: "16px",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: "var(--nm-primary)",
                color: "#fff",
                opacity: resendLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {resendLoading && (
                <Loader size={18} className="animate-spin" strokeWidth={2.5} />
              )}
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>

            <button
              onClick={onBackClick}
              className="nm-btn"
              style={{
                width: "100%",
                padding: "16px",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: "var(--nm-surface)",
                color: "var(--nm-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
