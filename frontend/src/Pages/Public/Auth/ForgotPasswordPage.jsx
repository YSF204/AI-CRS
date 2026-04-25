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
        background: "#fbfaee",
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
          background: "#fbfaee",
          borderBottom: "4px solid #1b1c15",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "#1b1c15",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={20} strokeWidth={3} />
          <span
            style={{
              background: "#1e51f6",
              color: "#ffffff",
              padding: "4px 8px",
              fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)",
              letterSpacing: "-0.03em",
              border: "4px solid #1b1c15",
              fontWeight: 800,
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
          background: "#ffffff",
          border: "4px solid #1b1c15",
          boxShadow: "8px 8px 0px 0px #1b1c15",
          padding: "clamp(1.5rem, 4%, 2.5rem)",
          marginTop: 60,
          borderRadius: 0,
        }}
      >
        {status === "form" && (
          <>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
                color: "#1b1c15",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Forgot Password?
            </h1>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: "#1b1c15",
                marginBottom: "clamp(1rem, 2.5%, 1.5rem)",
                fontWeight: 500,
              }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 8,
                    color: "#1b1c15",
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
                    border: "4px solid #1b1c15",
                    background: "#ffffff",
                    color: "#1b1c15",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    borderRadius: 0,
                    transition: "background-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.backgroundColor = "#e9e9dd")}
                  onBlur={(e) => (e.target.style.backgroundColor = "#ffffff")}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: 15,
                  background: loading ? "#e9e9dd" : "#1e51f6",
                  color: loading ? "#1b1c15" : "#ffffff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  border: "4px solid #1b1c15",
                  borderRadius: 0,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "transform 0.15s ease",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translate(2px, 2px)")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "translate(0px, 0px)")}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} strokeWidth={2.5} />
                    Send Reset Link
                  </>
                )}
              </button>

              <Link
                to="/auth?mode=login"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 24,
                  color: "#1b1c15",
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#1e51f6")}
                onMouseLeave={(e) => (e.target.style.color = "#1b1c15")}
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
                background: "#ffffff",
                border: "4px solid #1b1c15",
                borderRadius: 0,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <CheckCircle2 size={48} color="#1e51f6" strokeWidth={2.5} />
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                color: "#1b1c15",
                textAlign: "center",
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}
            >
              Check Your Email
            </h1>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: "#1b1c15",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              {message} The link will expire in 10 minutes.
            </p>

            <Link
              to="/auth?mode=login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "16px",
                background: "#fbfaee",
                color: "#1b1c15",
                textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                border: "4px solid #1b1c15",
                borderRadius: 0,
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(2px, 2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(0px, 0px)")}
            >
              Back to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div
              style={{
                background: "#ffffff",
                border: "4px solid #ba1a1a",
                borderRadius: 0,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <AlertCircle size={48} color="#ba1a1a" strokeWidth={2.5} />
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                color: "#1b1c15",
                textAlign: "center",
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}
            >
              Error
            </h1>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: "#1b1c15",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: 32,
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
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "16px",
                background: "#fbfaee",
                color: "#1b1c15",
                textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                border: "4px solid #1b1c15",
                borderRadius: 0,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(2px, 2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(0px, 0px)")}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
