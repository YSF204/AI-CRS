import { Briefcase, User } from 'lucide-react';
import { Step } from '../Stepper';
import RoleCard from '../RoleCard';
import { useTranslation } from '../../../../../context/LanguageContext';

const heading = { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--nm-text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const subtext  = { fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--nm-text-secondary)', marginBottom: 32 };

export default function RoleStep({ role, onSelectRole }) {
  const { t } = useTranslation();

  return (
    <Step>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={heading}>{t('auth.iam')}</h2>
        <p style={subtext}>{t('auth.chooseRole')}</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <RoleCard
            icon={<User size={32} strokeWidth={2.5} />}
            label={t('auth.employee')} desc={t('auth.employeeRoleDesc')}
            selected={role === 'EMPLOYEE'} color="var(--nm-primary)"
            onClick={() => onSelectRole('EMPLOYEE')}
          />
          <RoleCard
            icon={<Briefcase size={32} strokeWidth={2.5} />}
            label={t('auth.employer')} desc={t('auth.employerRoleDesc')}
            selected={role === 'EMPLOYER'} color="var(--nm-warning)"
            onClick={() => onSelectRole('EMPLOYER')}
          />
        </div>
      </div>
    </Step>
  );
}
