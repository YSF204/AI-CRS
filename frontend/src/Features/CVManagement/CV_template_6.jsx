import React from 'react';

const FederalResumeTemplate = ({ userName = "CAROL COOPER", cvData }) => {
  if (!cvData) return null;

  // Helper to format contact info with the pipe separator " | "
  const contactItems = [];
  if (cvData.contact?.phone) contactItems.push(<span key="phone"><strong>Phone:</strong> {cvData.contact.phone}</span>);
  if (cvData.contact?.email) contactItems.push(<span key="email"><strong>Email:</strong> {cvData.contact.email}</span>);
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city].filter(Boolean).join(', ');
    if (location) contactItems.push(<span key="address"><strong>Address:</strong> {location}</span>);
  }

  // Reusable Section Header Component matching the "Line - Centered Title - Line" style
  const SectionHeader = ({ title }) => (
    <div className="my-5">
      <hr className="border-t-[1px] border-gray-400 mb-1.5" />
      <h2 className="text-center text-[13px] font-bold uppercase tracking-[0.15em] text-gray-800">
        {title}
      </h2>
      <hr className="border-t-[1px] border-gray-400 mt-1.5" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 text-gray-800 font-sans shadow-md">
      
      {/* HEADER SECTION */}
      <header className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.3em] text-gray-800 mb-3 ml-[0.3em]">
          {userName}
        </h1>
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-600 mb-4">
          {cvData.jobTitle}
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-800">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              {item}
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 font-normal px-1">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* OPTIONAL FEDERAL ANNOUNCEMENT BLOCK (Handled via the first customSection if named 'Federal Details') */}
      {cvData.customSections?.find(sec => sec.title.toLowerCase() === 'federal details') && (
        <div className="border-y-[3px] border-double border-gray-400 py-2 mb-6 text-center text-[12px] text-gray-800 leading-relaxed font-medium">
          {cvData.customSections
            .find(sec => sec.title.toLowerCase() === 'federal details')
            .items.map((item, idx) => (
              <span key={idx} className="mr-3 last:mr-0 whitespace-pre-line">
                <strong>{item.name}:</strong> {item.description}
                {idx < cvData.customSections.find(sec => sec.title.toLowerCase() === 'federal details').items.length - 1 && " |"}
              </span>
            ))
          }
        </div>
      )}

      {/* PROFESSIONAL STATEMENT (SUMMARY) */}
      {cvData.summary && (
        <section className="mb-6">
          <SectionHeader title="Professional Statement" />
          <div className="text-[13px] text-gray-800 leading-relaxed text-justify whitespace-pre-line">
            {cvData.summary}
          </div>
        </section>
      )}

      {/* WORK EXPERIENCES */}
      {cvData.experience && cvData.experience.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Work Experiences" />
          <div className="flex flex-col gap-6">
            {cvData.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline text-[13px] text-gray-900 mb-1">
                  <div>
                    <span className="font-bold">{exp.position}</span>
                    {exp.institutionName && <span> | <strong>Employer:</strong> {exp.institutionName}</span>}
                  </div>
                  {exp.duration && (
                    <div className="font-medium">{exp.duration}</div>
                  )}
                </div>
                {exp.summary && (
                  <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line mt-2 text-justify">
                    {exp.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION (2-Column Grid) */}
      {cvData.education && cvData.education.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Education" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {cvData.education.map((edu, index) => (
              <div key={index} className="text-[13px]">
                <div className="font-bold text-gray-900">
                  {edu.certification} {edu.duration && `| ${edu.duration}`}
                </div>
                <div className="text-gray-700 mt-0.5">
                  {edu.institutionName}
                </div>
                {edu.summary && (
                  <div className="text-gray-600 mt-1 whitespace-pre-line">
                    {edu.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CUSTOM SECTIONS (Dynamically Mapped - Uses 2-Column Grid for 'Professional Development' or 'Skills') */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        cvData.customSections
          .filter(sec => sec.title.toLowerCase() !== 'federal details') // Filter out the special federal block if used
          .map((section, sectionIndex) => {
            // Determine if this section should use a grid layout based on common short-item sections
            const useGrid = ['professional development', 'skills', 'certifications'].includes(section.title.toLowerCase());
            
            return (
              <section key={sectionIndex} className="mb-6">
                <SectionHeader title={section.title} />
                <div className={useGrid ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4" : "flex flex-col gap-4"}>
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="text-[13px]">
                      <div className="font-bold text-gray-900">
                        {item.name} {item.duration && `| ${item.duration}`}
                      </div>
                      {item.description && (
                        <div className="text-gray-700 mt-0.5 whitespace-pre-line">
                          {item.description}
                        </div>
                      )}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
                          View Details
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })
      )}

      {/* STANDARD SKILLS FALLBACK (Rendered as a simple grid) */}
      {(cvData.technicalSkills?.length > 0 || cvData.softSkills?.length > 0 || cvData.language?.length > 0) && (
        <section className="mb-6">
          <SectionHeader title="Skills & Languages" />
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-[13px] text-gray-800 list-disc list-inside">
            {[...(cvData.technicalSkills || []), ...(cvData.softSkills || []), ...(cvData.language || [])].map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
};

export default FederalResumeTemplate;