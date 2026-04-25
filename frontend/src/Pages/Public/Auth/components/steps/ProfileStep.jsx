import { Step } from "../Stepper";
import AuthInput from "../AuthInput";
import GenderSelect from "../GenderSelect";

const heading = {
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 24,
  color: 'var(--nm-text-primary)',
  marginBottom: 24,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
};

export default function ProfileStep({ form, setForm, field }) {
  return (
    <Step>
      <h2 style={heading}>Additional Info</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px",
        }}
      >
        <GenderSelect
          value={form.gender}
          onChange={(g) => setForm((prev) => ({ ...prev, gender: g }))}
        />
        <AuthInput
          label="Age"
          type="number"
          placeholder="22"
          min="18"
          max="119"
          required
          {...field("age")}
        />
      </div>
      <AuthInput
        label="Phone Number"
        type="tel"
        placeholder="0598420206"
        {...field("telephone", { touchOnChange: true })}
      />
    </Step>
  );
}
