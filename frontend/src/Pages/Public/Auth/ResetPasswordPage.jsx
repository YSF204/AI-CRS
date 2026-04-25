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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
              Reset Password
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
              Enter your new password below. Make sure it's strong and secure.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              {/* Password */}
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
                      border: `4px solid ${errors.password ? "#ba1a1a" : "#1b1c15"}`,
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
                      color: "#1b1c15",
                      padding: 0,
                      opacity: 0.6,
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    style={{
                      color: "#ba1a1a",
                      fontSize: 12,
                      marginTop: 6,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
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
                      border: `4px solid ${errors.passwordConfirm ? "#ba1a1a" : "#1b1c15"}`,
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
                      color: "#1b1c15",
                      padding: 0,
                      opacity: 0.6,
                    }}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.passwordConfirm && (
                  <p
                    style={{
                      color: "#ba1a1a",
                      fontSize: 12,
                      marginTop: 6,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {errors.passwordConfirm}
                  </p>
                )}
              </div>

              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12,
                  color: "#1b1c15",
                  fontWeight: 600,
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Strong password requirements:
                <br />+ At least 8 characters
                <br />+ Mix of uppercase, lowercase, numbers, and symbols
              </p>

              <button
                type="submit"
                disabled={loading || !password || !passwordConfirm}
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
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock size={18} strokeWidth={2.5} />
                    Reset Password
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
              Password Reset Successful!
            </h1>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: "#1b1c15",
                fontWeight: 500,
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

            <Link
              to="/forgot-password"
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
              Request New Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
