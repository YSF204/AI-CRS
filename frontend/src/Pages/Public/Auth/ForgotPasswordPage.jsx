import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  Loader,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../../services/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("form"); // form, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/forgotPassword", { email });

      if (response.data.status === "success") {
        setStatus("success");
        setMessage(
          response.data.message || "Password reset link sent to your email.",
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setLoading(false);
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
          <>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
                color: "var(--fg)",
                marginBottom: 8,
              }}
            >
              Forgot Password?
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: "var(--fg-muted)",
                marginBottom: "clamp(1rem, 2.5%, 1.5rem)",
              }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 8,
                    color: "var(--fg)",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "3px solid var(--border-color)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--teal)")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border-color)")
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: 14,
                  background: loading ? "var(--fg-muted)" : "#FFE630",
                  color: "#0a0a0a",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  border: "3px solid #0a0a0a",
                  boxShadow: "3px 3px 0 #0a0a0a",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Reset Link
                  </>
                )}
              </button>

              <Link
                to="/auth?mode=login"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 16,
                  color: "var(--teal)",
                  textDecoration: "none",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--yellow)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--teal)")}
              >
                ← Back to Login
              </Link>
            </form>
          </>
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
                setEmail("");
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
