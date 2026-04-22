const heading = {
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 24,
  color: 'var(--nm-text-primary)',
  marginBottom: 24,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
};

const sectionLbl = {
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 14,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--nm-text-primary)',
  marginBottom: 16,
  marginTop: 8,
  paddingBottom: 6,
  borderBottom: '4px solid var(--nm-primary)',
  display: 'inline-block',
};

export default function CompanyStep({ field }) {
  return (
    <Step>
      <h2 style={heading}>Company Profile</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <AuthInput label="Company Name"   placeholder="Acme Corp"  required {...field('companyName')} />
        <AuthInput label="License Number" placeholder="BR-12345"   required {...field('companyLicense')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <AuthInput label="Contact Email" type="email" placeholder="hr@company.com"    required {...field('contactEmail')} />
        <AuthInput label="Website"       type="url"   placeholder="https://company.com"       {...field('website')} />
      </div>
      <div style={sectionLbl}>Primary Branch</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
        <AuthInput label="Name" placeholder="HQ"       required {...field('branchName')} />
        <AuthInput label="City"        placeholder="Hebron"   required {...field('branchCity')} />
        <AuthInput label="Street"      placeholder="Main St"  required {...field('branchStreet')} />
      </div>
    </Step>
  );
}
