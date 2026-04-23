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

export default function ProfileStep({ form, setForm, field, errors = {} }) {
  const handleAgeChange = (e) => {
    const val = e.target.value;
    // Allow only digits
    if (val !== '' && !/^\d+$/.test(val)) return;
    setForm((prev) => ({ ...prev, age: val }));
  };

  const handleTelChange = (e) => {
    const val = e.target.value;
    // Allow only digits, max 10
    if (val !== '' && !/^\d*$/.test(val)) return;
    if (val.length > 10) return;
    setForm((prev) => ({ ...prev, telephone: val }));
  };

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
          min={1}
          max={100}
          required
          value={form.age}
          onChange={handleAgeChange}
          onFocus={() => {}}
          onBlur={() => {}}
          error={errors.age || ''}
        />
      </div>
      <AuthInput
        label="Phone Number"
        type="tel"
        placeholder="0598420206"
        maxLength={10}
        value={form.telephone}
        onChange={handleTelChange}
        onFocus={() => {}}
        onBlur={() => {}}
        error={errors.telephone || ''}
      />
    </Step>
  );
}
