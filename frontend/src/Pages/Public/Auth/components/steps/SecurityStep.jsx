import { Step } from "../Stepper";
import AuthInput from "../AuthInput";

const heading = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 24,
  color: "var(--nm-text-primary)",
  marginBottom: 24,
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
};

export default function SecurityStep({ field }) {
  return (
    <Step>
      <h2 style={heading}>Security</h2>
      <AuthInput
        label="Create Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        {...field("password")}
      />
      <AuthInput
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        {...field("passwordConfirm")}
      />
    </Step>
  );
}