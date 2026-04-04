import React from 'react';

const MinimalResumeTemplate = ({ userName = "", cvData }) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return '';
  };

  // Helper to neatly format contact info with the pipe separator " | "
  const contactItems = [];
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.address?.city || cvData.address?.street) {
    const location = [cvData.address.street, cvData.address.city].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  return (
    <div className="bg-white p-12 md:p-16 text-gray-900 font-sans" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
      
      {/* HEADER SECTION */}
      <header className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-gray-900 mb-2">
          {userName}
        </h1>
        <h2 className="text-sm md:text-base uppercase tracking-[0.15em] text-gray-700">
          {cvData.jobTitle}
        </h2>
      </header>

      {/* CONTACT INFO */}
      <div className="border-y-[1.5px] border-gray-400 py-3 mb-6">
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-800">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 px-1">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="mb-6">
              <h3 className="text-base font-bold uppercase text-gray-900 mb-1">Objective</h3>
              <hr className="border-t-[1.5px] border-gray-400 mb-3" />
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{cvData.summary}</p>
            </section>
          ) : null,
          education: cvData.education && cvData.education.length > 0 ? (
            <section key="education" className="mb-6">
              <h3 className="text-base font-bold uppercase text-gray-900 mb-1">Education</h3>
              <hr className="border-t-[1.5px] border-gray-400 mb-3" />
              <div className="flex flex-col gap-4">
                {cvData.education.map((edu, index) => {
                  const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                  return (
                    <div key={index}>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{edu.certification}</span>
                        {edu.institutionName && ` | ${edu.institutionName}`}
                        {dur && ` | ${dur}`}
                      </p>
                      {edu.summary && <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{edu.summary}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          experience: cvData.experience && cvData.experience.length > 0 ? (
            <section key="experience" className="mb-6">
              <h3 className="text-base font-bold uppercase text-gray-900 mb-1">Experience</h3>
              <hr className="border-t-[1.5px] border-gray-400 mb-3" />
              <div className="flex flex-col gap-4">
                {cvData.experience.map((exp, index) => {
                  const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                  return (
                    <div key={index}>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{exp.institutionName}</span>
                        {exp.position && ` | ${exp.position}`}
                        {dur && ` | ${dur}`}
                      </p>
                      {exp.summary && <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{exp.summary}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          technicalSkills: cvData.technicalSkills?.length > 0 ? (
            <section key="technicalSkills" className="mb-6">
              <h3 className="text-base font-bold uppercase text-gray-900 mb-1">Technical Skills</h3>
              <hr className="border-t-[1.5px] border-gray-400 mb-3" />
              <p className="text-sm text-gray-800">{cvData.technicalSkills.join(', ')}</p>
            </section>
          ) : null,
          softSkills: cvData.softSkills?.length > 0 ? (
            <section key="softSkills" className="mb-6">
              <h3 className="text-base font-bold uppercase text-gray-900 mb-1">Soft Skills</h3>
              <hr className="border-t-[1.5px] border-gray-400 mb-3" />
              <p className="text-sm text-gray-800">{cvData.softSkills.join(', ')}</p>
            </section>
          ) : null,
          language: cvData.language?.length > 0 ? (
            <section key="language" className="mb-6">
              <h3 className="text-base font-bold uppercase text-gray-900 mb-1">Languages</h3>
              <hr className="border-t-[1.5px] border-gray-400 mb-3" />
              <p className="text-sm text-gray-800">{cvData.language.join(', ')}</p>
            </section>
          ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || ['summary', 'education', 'experience', 'customSections', 'technicalSkills', 'softSkills', 'language'];
        
        return sectionOrder.map((key) => {
          if (key === 'customSections' && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section key={`custom-${sectionIndex}`} className="mb-6">
                <h3 className="text-base font-bold uppercase text-gray-900 mb-1">{section.title}</h3>
                <hr className="border-t-[1.5px] border-gray-400 mb-3" />
                <div className="flex flex-col gap-4">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div key={itemIndex}>
                        <p className="text-sm text-gray-800">
                          {item.link ? (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{item.name}</a>
                          ) : (
                            <span className="font-medium">{item.name}</span>
                          )}
                          {dur && ` | ${dur}`}
                        </p>
                        {item.description && <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{item.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ));
          }
          if (key.includes('Skills') || key === 'language') {
             return sectionBlocks[key];
          }
          return sectionBlocks[key];
        });
      })()}

    </div>
  );
};

export default MinimalResumeTemplate;