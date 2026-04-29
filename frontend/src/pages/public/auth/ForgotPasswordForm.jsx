import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Loader,
} from "lucide-react";
import api from "../../../services/api";

export default function ForgotPasswordForm({ onSuccess, onError }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/forgotPassword", { email });

      if (response.data.status === "success") {
        onSuccess(
          response.data.message || "Password reset link sent to your email.",
        );
      }
    } catch (error) {
      onError(
        error.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
