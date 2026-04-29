import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader, ArrowLeft } from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. Token is missing.");
          return;
        }

        const response = await api.get(`/auth/verify-email/${token}`);

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. Please try again or request a new verification link.",
        );
      }
    };

    verifyEmail();
  }, [token, login, navigate]);

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
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader
              className="animate-spin mb-6"
              size={48}
              color="var(--teal)"
            />
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
              Verifying Email
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                color: "var(--fg-muted)",
                textAlign: "center",
              }}
            >
              We're verifying your email address...
            </p>
          </div>
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
              Email Verified!
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                color: "var(--fg-muted)",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {message}
            </p>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <button
                onClick={() => navigate("/auth?mode=login")}
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
                  cursor: "pointer",
                  boxShadow: "3px 3px 0 #0a0a0a",
                }}
              >
                Go to Login
              </button>
            </div>
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
              <XCircle size={48} color="#0a0a0a" />
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
              Verification Failed
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

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <button
                onClick={() => navigate("/auth?mode=login")}
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
                  cursor: "pointer",
                  boxShadow: "3px 3px 0 #0a0a0a",
                }}
              >
                Try Logging In
              </button>

              <button
                onClick={() => navigate("/")}
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
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
