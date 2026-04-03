import { Step } from '../Stepper';
import AuthInput from '../AuthInput';

const heading = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--fg)', marginBottom: 16 };

export default function SecurityStep({ field }) {
  return (
    <Step>
      <h2 style={heading}>Security</h2>
      <AuthInput label="Password"         type="password" placeholder="••••••••" required {...field('password')} />
      <AuthInput label="Confirm Password" type="password" placeholder="••••••••" required {...field('passwordConfirm')} />
    </Step>
  );
}
