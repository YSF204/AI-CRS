import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  ArrowLeft,
  Loader,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("form"); // form, success, error
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link. Token is missing.");
    }
  }, [token]);

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
    setMessage("");

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
        setStatus("success");
        setMessage("Your password has been reset successfully!");

        // Auto-login user with the returned token
        if (response.data.token) {
          setTimeout(() => {
            login(response.data.token);
            navigate("/");
          }, 2000);
        }
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Failed to reset password. Please try again or request a new link.",
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
              Password Reset Successful!
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
              {message} You'll be logged in automatically.
            </p>
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

            <Link
              to="/forgot-password"
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
              Request New Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
