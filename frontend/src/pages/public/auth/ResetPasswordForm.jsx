import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../../services/api";

export default function ResetPasswordForm({ token, onSuccess, onError }) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character (!@#$%^&*)";
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = "Please confirm your password";
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.patch(`/auth/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });

      if (response.data.status === "success") {
        onSuccess(
          "Your password has been reset successfully!",
          response.data.token || null,
        );
      }
    } catch (error) {
      onError(
        error.response?.data?.message ||
          "Failed to reset password. Please try again or request a new link.",
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
        Reset Password
      </h1>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          color: "var(--fg-muted)",
          marginBottom: "clamp(1rem, 2.5%, 1.5rem)",
        }}
      >
        Enter your new password below. Make sure it's strong and secure.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="reset-new-password"
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
            New Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="reset-new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong password"
              style={{
                width: "100%",
                padding: "12px 40px 12px 12px",
                border: `3px solid ${errors.password ? "var(--coral)" : "var(--border-color)"}`,
                background: "var(--bg)",
                color: "var(--fg)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = !errors.password
                  ? "var(--teal)"
                  : "var(--coral)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.password
                  ? "var(--coral)"
                  : "var(--border-color)")
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--fg-muted)",
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p
              style={{
                color: "var(--coral)",
                fontSize: 12,
                marginTop: 4,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="reset-confirm-password"
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
            Confirm Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="reset-confirm-password"
              type={showPasswordConfirm ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm your password"
              style={{
                width: "100%",
                padding: "12px 40px 12px 12px",
                border: `3px solid ${errors.passwordConfirm ? "var(--coral)" : "var(--border-color)"}`,
                background: "var(--bg)",
                color: "var(--fg)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = !errors.passwordConfirm
                  ? "var(--teal)"
                  : "var(--coral)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.passwordConfirm
                  ? "var(--coral)"
                  : "var(--border-color)")
              }
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--fg-muted)",
                padding: 0,
              }}
            >
              {showPasswordConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p
              style={{
                color: "var(--coral)",
                fontSize: 12,
                marginTop: 4,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {errors.passwordConfirm}
            </p>
          )}
        </div>

        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "var(--fg-muted)",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          Strong password requirements:
          <br />✓ At least 8 characters
          <br />✓ Mix of uppercase, lowercase, numbers, and symbols
        </p>

        <button
          type="submit"
          disabled={loading || !password || !passwordConfirm}
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
              Resetting...
            </>
          ) : (
            <>
              <Lock size={16} />
              Reset Password
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
