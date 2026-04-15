import React from 'react';

const ExecutiveResumeTemplate = ({ userName = "", cvData }) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return '';
  };

  const contactItems = [];
  if (cvData.address?.city || cvData.address?.street) {
    const location = [cvData.address.city, cvData.address.street].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  const SectionHeader = ({ title }) => (
    <div className="border-y-2 border-gray-300 py-1.5 mb-2.5 mt-5">
      <h2 className="text-[13px] font-bold uppercase text-gray-800 tracking-wide">{title}</h2>
    </div>
  );

  return (
    <div className="bg-white text-gray-900 font-sans"
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
      <header className="text-center mb-5">
        <h1 className="text-[26px] md:text-[30px] lg:text-[34px] font-bold text-gray-800 mb-1.5">{userName}</h1>
        <div className="flex flex-wrap justify-center items-center gap-1.5 text-xs md:text-sm text-gray-700">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && <span className="text-gray-400 text-xs px-1">•</span>}
            </React.Fragment>
          ))}
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid">
              <SectionHeader title="Professional Summary" />
              <p className="text-xs md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-justify">{cvData.summary}</p>
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
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-800">{exp.position}</h3>
                          <p className="text-xs md:text-sm text-gray-800 font-medium">{exp.institutionName}</p>
                        </div>
                        {dur && <div className="text-xs md:text-sm text-gray-800 font-bold sm:text-right mt-1 sm:mt-0">{dur}</div>}
                      </div>
                      {exp.summary && <div className="text-xs md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1.5">{exp.summary}</div>}
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
                      <h3 className="text-[13px] font-bold text-gray-800 mb-0.5">{edu.certification}</h3>
                      <p className="text-xs md:text-sm text-gray-800">
                        {edu.institutionName}
                        {edu.summary && ` • ${edu.summary}`}
                        {dur && ` • ${dur}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
          technicalSkills: cvData.technicalSkills?.length > 0 ? (
            <section key="technicalSkills" className="break-inside-avoid">
              <SectionHeader title="Technical Skills" />
              <p className="text-xs md:text-sm text-gray-800">{cvData.technicalSkills.join(', ')}</p>
            </section>
          ) : null,
          softSkills: cvData.softSkills?.length > 0 ? (
            <section key="softSkills" className="break-inside-avoid">
              <SectionHeader title="Soft Skills" />
              <p className="text-xs md:text-sm text-gray-800">{cvData.softSkills.join(', ')}</p>
            </section>
          ) : null,
          language: cvData.language?.length > 0 ? (
            <section key="language" className="break-inside-avoid">
              <SectionHeader title="Languages" />
              <p className="text-xs md:text-sm text-gray-800">{cvData.language.join(', ')}</p>
            </section>
          ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || ['summary', 'experience', 'education', 'customSections', 'technicalSkills', 'softSkills', 'language'];

        return sectionOrder.map(key => {
          if (key === 'customSections' && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section key={`custom-${sectionIndex}`} className="break-inside-avoid">
                <SectionHeader title={section.title} />
                <div className="space-y-3 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div key={itemIndex} className="break-inside-avoid">
                        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                          <h3 className="text-[13px] font-bold text-gray-800">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.name}</a>
                            ) : item.name}
                          </h3>
                          {dur && <div className="text-xs md:text-sm text-gray-800 font-medium sm:text-right">{dur}</div>}
                        </div>
                        {item.description && <div className="text-xs md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{item.description}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ));
          }
          if (key.includes('Skills') || key === 'language') return sectionBlocks[key];
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default ExecutiveResumeTemplate;