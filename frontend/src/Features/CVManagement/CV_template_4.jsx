import React from 'react';

const BlueAccentResumeTemplate = ({ 
  userName = "", 
  profileImage,
  cvData 
}) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return '';
  };

  const contactItems = [];
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  const SectionHeader = ({ title }) => (
    <div className="border-y-2 border-blue-400/60 py-1 mb-2.5 mt-5">
      <h2 className="text-[13px] font-bold uppercase text-blue-600 tracking-wider">{title}</h2>
    </div>
  );

  return (
    <div className="bg-white text-gray-800 font-sans"
         style={{
           overflowWrap: 'anywhere',
           wordBreak: 'break-word',
           width: '210mm',
           minHeight: '297mm',
           margin: '0 auto',
           boxSizing: 'border-box',
           position: 'relative',
           padding: '15mm' // Standard A4 professional margins
         }}>
      <header className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h1 className="text-[26px] md:text-[30px] lg:text-[34px] font-extrabold text-blue-600 uppercase mb-1.5">{userName}</h1>
          <h2 className="text-base md:text-lg font-bold text-gray-900 uppercase mb-1.5 tracking-wide">{cvData.jobTitle}</h2>
          <div className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm text-gray-700">
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < contactItems.length - 1 && <span className="text-gray-400">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        {profileImage && (
          <div className="w-24 h-28 flex-shrink-0">
            <img src={profileImage} alt={userName} className="w-full h-full object-cover object-top" />
          </div>
        )}
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid">
              <SectionHeader title="Summary" />
              <p className="text-xs md:text-sm text-gray-800 leading-relaxed text-justify whitespace-pre-wrap break-words">{cvData.summary}</p>
            </section>
          ) : null,
          experience: cvData.experience && cvData.experience.length > 0 ? (
            <section key="experience" className="break-inside-avoid">
              <SectionHeader title="Professional Experience" />
              <div className="space-y-3.5 block">
                {cvData.experience.map((exp, index) => {
                  const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                  return (
                    <div key={index} className="break-inside-avoid">
                      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                        <h3 className="text-[13px] font-bold text-gray-900">
                          {exp.position}{exp.institutionName ? `, ${exp.institutionName}` : ''}
                        </h3>
                        {dur && <div className="text-xs md:text-sm text-gray-900 font-bold sm:text-right mt-1 sm:mt-0">{dur}</div>}
                      </div>
                      {exp.summary && <div className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3 mt-1">{exp.summary}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          education: cvData.education && cvData.education.length > 0 ? (
            <section key="education" className="break-inside-avoid">
              <SectionHeader title="Education" />
              <div className="space-y-3.5 block">
                {cvData.education.map((edu, index) => {
                  const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                  return (
                    <div key={index} className="break-inside-avoid">
                      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                        <h3 className="text-[13px] font-bold text-gray-900">{edu.certification}</h3>
                        {dur && <div className="text-xs md:text-sm text-gray-900 font-bold sm:text-right mt-1 sm:mt-0">{dur}</div>}
                      </div>
                      {edu.institutionName && <p className="text-xs md:text-sm text-gray-800 mb-1">{edu.institutionName}</p>}
                      {edu.summary && <div className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3">{edu.summary}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          technicalSkills: cvData.technicalSkills && cvData.technicalSkills.length > 0 ? (
            <section key="technicalSkills" className="break-inside-avoid">
              <SectionHeader title="Technical Skills" />
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-3 text-xs md:text-sm text-gray-700">
                {cvData.technicalSkills.map((skill, index) => <li key={index}>{skill}</li>)}
              </ul>
            </section>
          ) : null,
          softSkills: cvData.softSkills && cvData.softSkills.length > 0 ? (
            <section key="softSkills" className="break-inside-avoid">
              <SectionHeader title="Soft Skills" />
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-3 text-xs md:text-sm text-gray-700">
                {cvData.softSkills.map((skill, index) => <li key={index}>{skill}</li>)}
              </ul>
            </section>
          ) : null,
          language: cvData.language && cvData.language.length > 0 ? (
            <section key="language" className="break-inside-avoid">
              <SectionHeader title="Languages" />
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-3 text-xs md:text-sm text-gray-700">
                {cvData.language.map((skill, index) => <li key={index}>{skill}</li>)}
              </ul>
            </section>
          ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || ['summary', 'experience', 'education', 'customSections', 'technicalSkills', 'softSkills', 'language'];

        return sectionOrder.map(key => {
          if (key === 'customSections' && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section key={`custom-${sectionIndex}`} className="break-inside-avoid">
                <SectionHeader title={section.title} />
                <div className="space-y-2 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div key={itemIndex} className="text-xs md:text-sm text-gray-800 break-inside-avoid">
                        <span className="font-bold text-gray-900 mr-2">• {item.link ? (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.name}</a>
                        ) : item.name}{dur ? ` | ${dur}` : ''}:</span>
                        <span>{item.description}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ));
          }
          if (key === 'skills') return null;
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default BlueAccentResumeTemplate;