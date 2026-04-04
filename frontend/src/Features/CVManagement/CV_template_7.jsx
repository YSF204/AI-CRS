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
    <div className="my-6">
      <hr className="border-t-[1px] border-gray-300 mb-4" />
      <h2 className="text-center text-[15px] font-bold uppercase tracking-widest text-gray-800">{title}</h2>
      <hr className="border-t-[1px] border-gray-300 mt-4" />
    </div>
  );

  return (
    <div className="bg-white p-12 md:p-16 text-gray-800 font-sans" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-[42px] font-bold uppercase tracking-wide text-gray-900 mb-2">{userName}</h1>
        <h2 className="text-lg text-gray-600 mb-4">{cvData.jobTitle}</h2>
        <div className="border-y-[1px] border-gray-300 py-3 mb-2">
          <div className="flex flex-wrap justify-center items-center gap-2 text-[14px] text-gray-700">
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
              <p className="text-[14.5px] text-gray-800 leading-[1.7] text-justify whitespace-pre-wrap break-words">{cvData.summary}</p>
            </section>
          ) : null,
          technicalSkills: cvData.technicalSkills && cvData.technicalSkills.length > 0 ? (
            <section key="technicalSkills" className="break-inside-avoid">
              <SectionHeader title="Technical Strengths" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 pl-4 text-[14px] text-gray-800 list-disc">
                {cvData.technicalSkills.map((skill, index) => <li key={index} className="pl-1">{skill}</li>)}
              </ul>
            </section>
          ) : null,
          softSkills: cvData.softSkills && cvData.softSkills.length > 0 ? (
            <section key="softSkills" className="break-inside-avoid">
              <SectionHeader title="Core Competencies" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 pl-4 text-[14px] text-gray-800 list-disc">
                {cvData.softSkills.map((skill, index) => <li key={index} className="pl-1">{skill}</li>)}
              </ul>
            </section>
          ) : null,
          language: cvData.language && cvData.language.length > 0 ? (
            <section key="language" className="break-inside-avoid">
              <SectionHeader title="Languages" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 pl-4 text-[14px] text-gray-800 list-disc">
                {cvData.language.map((skill, index) => <li key={index} className="pl-1">{skill}</li>)}
              </ul>
            </section>
          ) : null,
          experience: cvData.experience && cvData.experience.length > 0 ? (
            <section key="experience" className="break-inside-avoid">
              <SectionHeader title="Professional Experience" />
              <div className="space-y-6 block">
                {cvData.experience.map((exp, index) => {
                  const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                  return (
                    <div key={index} className="break-inside-avoid">
                      <div className="text-[14.5px] text-gray-800 mb-2">
                        <span className="font-bold">{exp.position}</span>
                        {exp.institutionName && <span> | {exp.institutionName}</span>}
                        {dur && <span> | {dur}</span>}
                      </div>
                      {exp.summary && <div className="text-[14.5px] text-gray-800 leading-[1.7] whitespace-pre-wrap break-words ml-5">{exp.summary}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          education: cvData.education && cvData.education.length > 0 ? (
            <section key="education" className="break-inside-avoid">
              <SectionHeader title="Education" />
              <div className="space-y-6 block">
                {cvData.education.map((edu, index) => {
                  const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                  return (
                    <div key={index} className="break-inside-avoid">
                      <div className="text-[14.5px] text-gray-800 mb-2">
                        <span className="font-bold">{edu.certification}</span>
                        {edu.institutionName && <span> | {edu.institutionName}</span>}
                        {dur && <span> | {dur}</span>}
                      </div>
                      {edu.summary && <div className="text-[14.5px] text-gray-800 leading-[1.7] whitespace-pre-wrap break-words ml-5">{edu.summary}</div>}
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
                <div className="space-y-5 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div key={itemIndex} className="break-inside-avoid">
                        <div className="text-[14.5px] text-gray-800 mb-1">
                          <span className="font-bold">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.name}</a>
                            ) : item.name}
                          </span>
                          {dur && <span> | {dur}</span>}
                        </div>
                        {item.description && <div className="text-[14.5px] text-gray-800 leading-[1.7] whitespace-pre-wrap break-words ml-5">{item.description}</div>}
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