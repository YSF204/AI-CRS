import { Briefcase, User } from 'lucide-react';
import { Step } from '../Stepper';
import RoleCard from '../RoleCard';

const heading = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--fg)', marginBottom: 16 };
const subtext  = { fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--fg-muted)', marginBottom: 20 };

export default function RoleStep({ role, onSelectRole }) {
  return (
    <Step>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={heading}>I am an...</h2>
        <p style={subtext}>Choose your account type to get started</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <RoleCard
            icon={<User size={28} />}
            label="Employee" desc="Looking for a job"
            selected={role === 'EMPLOYEE'} color="#FFE630"
            onClick={() => onSelectRole('EMPLOYEE')}
          />
          <RoleCard
            icon={<Briefcase size={28} />}
            label="Employer" desc="Hiring talent"
            selected={role === 'EMPLOYER'} color="#4ECDC4"
            onClick={() => onSelectRole('EMPLOYER')}
          />
        </div>
      </div>
    </Step>
  );
}
