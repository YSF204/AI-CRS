import { Briefcase, User } from 'lucide-react';
import { Step } from '../Stepper';
import RoleCard from '../RoleCard';

const heading = { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--nm-text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const subtext  = { fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--nm-text-secondary)', marginBottom: 32 };

export default function RoleStep({ role, onSelectRole }) {
  return (
    <Step>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={heading}>I am an...</h2>
        <p style={subtext}>Choose your account type to get started</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <RoleCard
            icon={<User size={32} strokeWidth={2.5} />}
            label="Employee" desc="Looking for a job"
            selected={role === 'EMPLOYEE'} color="var(--nm-primary)"
            onClick={() => onSelectRole('EMPLOYEE')}
          />
          <RoleCard
            icon={<Briefcase size={32} strokeWidth={2.5} />}
            label="Employer" desc="Hiring talent"
            selected={role === 'EMPLOYER'} color="var(--nm-warning)"
            onClick={() => onSelectRole('EMPLOYER')}
          />
        </div>
      </div>
    </Step>
  );
}
