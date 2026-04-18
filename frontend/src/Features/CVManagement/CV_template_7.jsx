import React from 'react';

const CenteredFormalTemplate = ({ userName = "", cvData }) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return '';
  };

  const contactItems = [];
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  const SectionHeader = ({ title }) => (
    <div className="my-3">
      <hr className="border-t-2 border-gray-300 mb-2" />
      <h2 className="text-center text-xs md:text-sm font-bold uppercase tracking-widest text-gray-800">{title}</h2>
      <hr className="border-t-2 border-gray-300 mt-2" />
    </div>
  );

  return (
    <div className="bg-white text-gray-800 font-sans"
         style={{
           overflowWrap: 'anywhere',
           wordBreak: 'break-word',
           width: '210mm',
           height: '297mm',
           maxHeight: '297mm',
           margin: '0 auto',
           boxSizing: 'border-box',
           position: 'relative',
           padding: '10mm' // Reduced padding to fit more content
         }}>
      <header className="text-center mb-3">
        <h1 className="text-[24px] md:text-[30px] lg:text-[36px] font-bold uppercase tracking-wide text-gray-900 mb-1.5">{userName}</h1>
        <h2 className="text-sm md:text-base text-gray-600 mb-2">{cvData.jobTitle}</h2>
        <div className="border-y border-gray-300 py-1.5 mb-1">
          <div className="flex flex-wrap justify-center items-center gap-1 text-xs md:text-sm text-gray-700">
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < contactItems.length - 1 && <span className="text-gray-400 font-light px-1">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid">
              <SectionHeader title="Career Summary" />
              <p className="text-xs md:text-sm text-gray-800 leading-[1.6] text-justify whitespace-pre-wrap break-words">{cvData.summary}</p>
            </section>
          ) : null,
          technicalSkills: cvData.technicalSkills && cvData.technicalSkills.length > 0 ? (
            <section key="technicalSkills" className="break-inside-avoid">
              <SectionHeader title="Technical Strengths" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-2 pl-4 text-xs md:text-sm text-gray-800 list-disc">
                {cvData.technicalSkills.map((skill, index) => <li key={index} className="pl-1">{skill}</li>)}
              </ul>
            </section>
          ) : null,
          softSkills: cvData.softSkills && cvData.softSkills.length > 0 ? (
            <section key="softSkills" className="break-inside-avoid">
              <SectionHeader title="Core Competencies" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-2 pl-4 text-xs md:text-sm text-gray-800 list-disc">
                {cvData.softSkills.map((skill, index) => <li key={index} className="pl-1">{skill}</li>)}
              </ul>
            </section>
          ) : null,
          language: cvData.language && cvData.language.length > 0 ? (
            <section key="language" className="break-inside-avoid">
              <SectionHeader title="Languages" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-2 pl-4 text-xs md:text-sm text-gray-800 list-disc">
                {cvData.language.map((skill, index) => <li key={index} className="pl-1">{skill}</li>)}
              </ul>
            </section>
          ) : null,
          experience: cvData.experience && cvData.experience.length > 0 ? (
            <section key="experience" className="break-inside-avoid">
              <SectionHeader title="Professional Experience" />
              <div className="space-y-3 block">
                {cvData.experience.map((exp, index) => {
                  const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                  return (
                    <div key={index} className="break-inside-avoid">
                      <div className="text-xs md:text-sm text-gray-800 mb-1.5">
                        <span className="font-bold">{exp.position}</span>
                        {exp.institutionName && <span> | {exp.institutionName}</span>}
                        {dur && <span> | {dur}</span>}
                      </div>
                      {exp.summary && <div className="text-xs md:text-sm text-gray-800 leading-[1.6] whitespace-pre-wrap break-words ml-3">{exp.summary}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          education: cvData.education && cvData.education.length > 0 ? (
            <section key="education" className="break-inside-avoid">
              <SectionHeader title="Education" />
              <div className="space-y-3 block">
                {cvData.education.map((edu, index) => {
                  const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                  return (
                    <div key={index} className="break-inside-avoid">
                      <div className="text-xs md:text-sm text-gray-800 mb-1.5">
                        <span className="font-bold">{edu.certification}</span>
                        {edu.institutionName && <span> | {edu.institutionName}</span>}
                        {dur && <span> | {dur}</span>}
                      </div>
                      {edu.summary && <div className="text-xs md:text-sm text-gray-800 leading-[1.6] whitespace-pre-wrap break-words ml-3">{edu.summary}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || ['summary', 'technicalSkills', 'softSkills', 'language', 'experience', 'education', 'customSections'];

        return sectionOrder.map(key => {
          if (key === 'customSections' && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section key={`custom-${sectionIndex}`} className="break-inside-avoid">
                <SectionHeader title={section.title} />
                <div className="space-y-2.5 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div key={itemIndex} className="break-inside-avoid">
                        <div className="text-xs md:text-sm text-gray-800 mb-0.5">
                          <span className="font-bold">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.name}</a>
                            ) : item.name}
                          </span>
                          {dur && <span> | {dur}</span>}
                        </div>
                        {item.description && <div className="text-xs md:text-sm text-gray-800 leading-[1.6] whitespace-pre-wrap break-words ml-3">{item.description}</div>}
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

export default CenteredFormalTemplate;