import { Step } from '../Stepper';
import AuthInput from '../AuthInput';

const heading = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--fg)', marginBottom: 16 };

export default function PersonalStep({ field }) {
  return (
    <Step>
      <h2 style={heading}>Personal Information</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <AuthInput label="First Name" placeholder="Yousef"   required {...field('firstName')} />
        <AuthInput label="Last Name"  placeholder="AL Bakri" required {...field('lastName')} />
      </div>
      <AuthInput label="Email" type="email" placeholder="you@example.com" required {...field('email')} />
    </Step>
  );
}
