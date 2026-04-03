import React from 'react';

const ExecutiveResumeTemplate = ({ userName = "", cvData }) => {
  if (!cvData) return null;

  // Helper to format contact info with the bullet separator " • "
  const contactItems = [];
  if (cvData.address?.city || cvData.address?.street) {
    const location = [cvData.address.city, cvData.address.street].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  // Reusable Section Header Component matching the image's style
  const SectionHeader = ({ title }) => (
    <div className="border-y-[1.5px] border-gray-400 py-1.5 mb-3 mt-6">
      <h2 className="text-[15px] font-bold uppercase text-gray-800 tracking-wide">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 text-gray-900 font-sans shadow-md">
      
      {/* HEADER SECTION */}
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {userName}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-700">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 text-xs px-1">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary">
              <SectionHeader title="Professional Summary" />
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line text-justify">{cvData.summary}</p>
            </section>
          ) : null,
          experience: cvData.experience && cvData.experience.length > 0 ? (
            <section key="experience">
              <SectionHeader title="Professional Experience" />
              <div className="flex flex-col gap-5">
                {cvData.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex flex-col sm:flex-row justify-between items-baseline mb-1">
                      <div>
                        <h3 className="text-[15px] font-bold text-gray-800">{exp.position}</h3>
                        <p className="text-sm text-gray-800 font-medium">{exp.institutionName}</p>
                      </div>
                      {exp.duration && <div className="text-sm text-gray-800 font-bold sm:text-right mt-1 sm:mt-0">{exp.duration}</div>}
                    </div>
                    {exp.summary && <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mt-2">{exp.summary}</div>}
                  </div>
                ))}
              </div>
            </section>
          ) : null,
          education: cvData.education && cvData.education.length > 0 ? (
            <section key="education">
              <SectionHeader title="Education" />
              <div className="flex flex-col gap-4">
                {cvData.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="text-[15px] font-bold text-gray-800 mb-0.5">{edu.certification}</h3>
                    <p className="text-sm text-gray-800">
                      {edu.institutionName}
                      {edu.summary && ` • ${edu.summary}`}
                      {edu.duration && ` • ${edu.duration}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null,
          skills: (cvData.technicalSkills?.length > 0 || cvData.softSkills?.length > 0 || cvData.language?.length > 0) ? (
            <section key="skills">
              <SectionHeader title="Expert-Level Skills" />
              <ul className="text-sm text-gray-800 space-y-2">
                {cvData.softSkills && cvData.softSkills.length > 0 && <li><span className="font-bold">Leadership: </span>{cvData.softSkills.join(', ')}</li>}
                {cvData.technicalSkills && cvData.technicalSkills.length > 0 && <li><span className="font-bold">Technical: </span>{cvData.technicalSkills.join(', ')}</li>}
                {cvData.language && cvData.language.length > 0 && <li><span className="font-bold">Languages: </span>{cvData.language.join(', ')}</li>}
              </ul>
            </section>
          ) : null,
          technicalSkills: cvData.technicalSkills?.length > 0 ? (
            <section key="technicalSkills">
              <SectionHeader title="Technical Skills" />
              <p className="text-sm text-gray-800">{cvData.technicalSkills.join(', ')}</p>
            </section>
          ) : null,
          softSkills: cvData.softSkills?.length > 0 ? (
            <section key="softSkills">
              <SectionHeader title="Soft Skills" />
              <p className="text-sm text-gray-800">{cvData.softSkills.join(', ')}</p>
            </section>
          ) : null,
          language: cvData.language?.length > 0 ? (
            <section key="language">
              <SectionHeader title="Languages" />
              <p className="text-sm text-gray-800">{cvData.language.join(', ')}</p>
            </section>
          ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || ['summary', 'experience', 'education', 'customSections', 'technicalSkills', 'softSkills', 'language'];

        return sectionOrder.map(key => {
          if (key === 'customSections' && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section key={`custom-${sectionIndex}`}>
                <SectionHeader title={section.title} />
                <div className="flex flex-col gap-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-1">
                        <h3 className="text-[15px] font-bold text-gray-800">{item.name}</h3>
                        {item.duration && <div className="text-sm text-gray-800 font-medium sm:text-right">{item.duration}</div>}
                      </div>
                      {item.description && <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{item.description}</div>}
                      {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block mt-1">View Project/Link</a>}
                    </div>
                  ))}
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

export default ExecutiveResumeTemplate;