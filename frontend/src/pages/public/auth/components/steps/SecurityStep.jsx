import { useMemo } from "react";
import { Step } from "../Stepper";
import AuthInput from "../AuthInput";
import { useTranslation } from "../../../../../context/LanguageContext";

const heading = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 24,
  color: "var(--nm-text-primary)",
  marginBottom: 24,
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
};

const REQUIREMENTS = [
  { key: "auth.reqLength", fallback: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { key: "auth.reqUppercase", fallback: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { key: "auth.reqLowercase", fallback: "At least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { key: "auth.reqNumber", fallback: "At least one number", test: (pw) => /[0-9]/.test(pw) },
  {
    key: "auth.reqSpecial",
    fallback: "At least one special character (!@#$%^&* etc.)",
    test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
  },
];

const STRENGTH_LEVELS = [
  { key: "auth.strengthWeak", fallback: "Weak", color: "var(--nm-error, #e53e3e)" },
  { key: "auth.strengthWeak", fallback: "Weak", color: "var(--nm-error, #e53e3e)" },
  { key: "auth.strengthFair", fallback: "Fair", color: "var(--nm-warning, #dd6b20)" },
  { key: "auth.strengthGood", fallback: "Good", color: "#d4a017" },
  { key: "auth.strengthStrong", fallback: "Strong", color: "var(--nm-success, #38a169)" },
];

export default function SecurityStep({ field }) {
  const { t } = useTranslation();
  const passwordProps = field("password", { touchOnChange: true });
  const passwordValue = passwordProps.value || "";

  const { metCount, results } = useMemo(() => {
    const results = REQUIREMENTS.map((req) => ({
      ...req,
      met: req.test(passwordValue),
    }));
    return { metCount: results.filter((r) => r.met).length, results };
  }, [passwordValue]);

  // 0 met = no bar, 1-2 = Weak, 3 = Fair, 4 = Good, 5 = Strong
  const strengthIndex = metCount === 0 ? -1 : metCount <= 2 ? 0 : metCount - 2;
  const strength = strengthIndex >= 0 ? STRENGTH_LEVELS[strengthIndex] : null;
  const barPercent = metCount === 0 ? 0 : (metCount / 5) * 100;

  return (
    <Step>
      <h2 style={heading}>{t("auth.security")}</h2>
      <AuthInput
        label={t("auth.createPassword")}
        type="password"
        placeholder="••••••••"
        required
        {...passwordProps}
        error=""
      />

      {/* Password Strength Checklist — only show when user has typed */}
      {passwordValue.length > 0 && (
        <div
          style={{
            marginTop: -8,
            marginBottom: 20,
            padding: "12px 16px",
            background: "var(--nm-bg)",
            border: "3px solid var(--nm-ink)",
            boxShadow: "3px 3px 0 var(--nm-ink)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--nm-text-secondary)",
              marginBottom: 10,
            }}
          >
            {t("auth.passwordRequirements")}
          </div>

          {/* Requirement checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {results.map((req, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: req.met
                    ? "var(--nm-success, #38a169)"
                    : "var(--nm-text-tertiary)",
                  fontWeight: req.met ? 600 : 400,
                  transition: "color 0.2s ease",
                }}
              >
                <span style={{ fontSize: 13, flexShrink: 0 }}>
                  {req.met ? "✅" : "❌"}
                </span>
                {t(req.key, {}, req.fallback)}
              </div>
            ))}
          </div>

          {/* Strength bar */}
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--nm-text-secondary)",
                }}
              >
                {t("auth.strength")}
              </span>
              {strength && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: strength.color,
                  }}
                >
                  {t(strength.key, {}, strength.fallback)}
                </span>
              )}
            </div>
            <div
              style={{
                width: "100%",
                height: 6,
                background: "var(--nm-ink)",
                opacity: 0.1,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${barPercent}%`,
                  background: strength ? strength.color : "transparent",
                  opacity: 1,
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <AuthInput
        label={t("auth.confirmPassword")}
        type="password"
        placeholder="••••••••"
        required
        {...field("passwordConfirm")}
      />
    </Step>
  );
}
