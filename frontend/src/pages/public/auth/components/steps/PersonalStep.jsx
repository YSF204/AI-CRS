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

export default function PersonalStep({ field, onEmailDuplicateStatus }) {
  const { t } = useTranslation();
  const emailFieldProps = field("email");

  return (
    <Step>
      <h2 style={heading}>{t("auth.personalInfo")}</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px",
        }}
      >
        <AuthInput
          label={t("auth.firstName")}
          placeholder={t("auth.firstNamePlaceholder", {}, "First name")}
          required
          {...field("firstName")}
        />
        <AuthInput
          label={t("auth.lastName")}
          placeholder={t("auth.lastNamePlaceholder", {}, "Last name")}
          required
          {...field("lastName")}
        />
      </div>
      <div style={{ position: "relative" }}>
        <AuthInput
          label={t("auth.email")}
          type="email"
          placeholder="you@example.com"
          required
          {...emailFieldProps}
          onBlur={(e) => {
            if (emailFieldProps.onBlur) emailFieldProps.onBlur(e);
            onEmailDuplicateStatus?.(false);
          }}
        />
      </div>
    </Step>
  );
}
