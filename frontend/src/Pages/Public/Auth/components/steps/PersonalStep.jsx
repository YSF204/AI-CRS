import { useState, useEffect } from "react";
import { Step } from "../Stepper";
import AuthInput from "../AuthInput";
import api from "../../../../../services/api";

const heading = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 24,
  color: "var(--nm-text-primary)",
  marginBottom: 24,
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
};

export default function PersonalStep({ field, onEmailDuplicateStatus }) {
  const [emailCheckError, setEmailCheckError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Re-check email when component mounts (user returned to this step)
  useEffect(() => {
    const email = field("email").value?.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      handleEmailCheck(email);
    }
  }, []);

  const handleEmailCheck = async (email) => {
    setCheckingEmail(true);
    try {
      const res = await api.get(
        `/auth/check-email?email=${encodeURIComponent(email)}`,
      );
      if (res.data.exists) {
        setEmailCheckError("EXISTS");
        onEmailDuplicateStatus?.(true);
      } else {
        setEmailCheckError("");
        onEmailDuplicateStatus?.(false);
      }
    } catch {
      onEmailDuplicateStatus?.(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleEmailBlur = async (e) => {
    const email = e.target.value.trim();
    setEmailCheckError("");

    // Only check if email looks valid
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onEmailDuplicateStatus?.(false);
      return;
    }

    await handleEmailCheck(email);
  };

  const emailFieldProps = field("email");

  return (
    <Step>
      <h2 style={heading}>Personal Info</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px",
        }}
      >
        <AuthInput
          label="First Name"
          placeholder="Yousef"
          required
          {...field("firstName")}
        />
        <AuthInput
          label="Last Name"
          placeholder="AL Bakri"
          required
          {...field("lastName")}
        />
      </div>
      <div style={{ position: "relative" }}>
        <AuthInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          {...emailFieldProps}
          onBlur={(e) => {
            // Call the original touch handler
            if (emailFieldProps.onBlur) emailFieldProps.onBlur(e);
            handleEmailBlur(e);
          }}
          error={emailCheckError === "EXISTS" ? "" : emailFieldProps.error}
        />
        {checkingEmail && (
          <div
            style={{
              fontSize: 12,
              color: "var(--nm-text-tertiary)",
              fontFamily: "var(--font-body)",
              marginTop: -14,
              marginBottom: 8,
            }}
          >
            Checking email…
          </div>
        )}
        {emailCheckError === "EXISTS" && (
          <div
            style={{
              fontSize: 12,
              color: "var(--nm-error)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              marginTop: -14,
              marginBottom: 8,
            }}
          >
            An account with this email already exists.{" "}
            <a
              href="/auth?mode=login"
              style={{
                color: "var(--nm-primary)",
                textDecoration: "underline",
                fontWeight: 700,
              }}
            >
              Log in instead.
            </a>
          </div>
        )}
      </div>
    </Step>
  );
}