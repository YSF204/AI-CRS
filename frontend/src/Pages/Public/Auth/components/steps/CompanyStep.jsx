import { Step } from '../Stepper';
import AuthInput from '../AuthInput';

const heading    = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--fg)', marginBottom: 16 };
const sectionLbl = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg)', marginBottom: 8, marginTop: 4, paddingBottom: 4, borderBottom: '2px solid #FFE630' };

export default function CompanyStep({ field }) {
  return (
    <Step>
      <h2 style={heading}>Company Details</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <AuthInput label="Company Name"   placeholder="Acme Corp"  required {...field('companyName')} />
        <AuthInput label="License Number" placeholder="BR-12345"   required {...field('companyLicense')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <AuthInput label="Contact Email" type="email" placeholder="hr@company.com"    required {...field('contactEmail')} />
        <AuthInput label="Website"       type="url"   placeholder="https://company.com"       {...field('website')} />
      </div>
      <div style={sectionLbl}>Branch Office</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
        <AuthInput label="Branch Name" placeholder="HQ"       required {...field('branchName')} />
        <AuthInput label="City"        placeholder="Hebron"   required {...field('branchCity')} />
        <AuthInput label="Street"      placeholder="Main St"  required {...field('branchStreet')} />
      </div>
    </Step>
  );
}
