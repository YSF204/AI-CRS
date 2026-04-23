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

export default function PersonalStep({ field }) {
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
      <AuthInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        required
        {...field("email")}
      />
    </Step>
  );
}
