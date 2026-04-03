import React from 'react';

const CenteredFormalTemplate = ({ userName = "CHRISTINE RIVERA", cvData }) => {
  if (!cvData) return null;

  // Combine contact info into a single line separated by pipes
  const contactItems = [];
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  // Combine all skills for the Core Strengths section
  const allSkills = [
    ...(cvData.technicalSkills || []),
    ...(cvData.softSkills || []),
    ...(cvData.language || [])
  ];

  // Reusable Section Header Component
  const SectionHeader = ({ title }) => (
    <div className="my-6">
      <hr className="border-t-[1px] border-gray-300 mb-4" />
      <h2 className="text-center text-[15px] font-bold uppercase tracking-widest text-gray-800">
        {title}
      </h2>
      <hr className="border-t-[1px] border-gray-300 mt-4" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 text-gray-800 font-sans shadow-md">
      
      {/* HEADER SECTION */}
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-[42px] font-bold uppercase tracking-wide text-gray-900 mb-2">
          {userName}
        </h1>
        <h2 className="text-lg text-gray-600 mb-4">
          {cvData.jobTitle}
        </h2>
        
        {/* Contact info wrapping line */}
        <div className="border-y-[1px] border-gray-300 py-3 mb-2">
          <div className="flex flex-wrap justify-center items-center gap-2 text-[14px] text-gray-700">
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < contactItems.length - 1 && (
                  <span className="text-gray-400 font-light px-1">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* CAREER SUMMARY */}
      {cvData.summary && (
        <section>
          <SectionHeader title="Career Summary" />
          <p className="text-[14.5px] text-gray-800 leading-[1.7] text-justify whitespace-pre-line">
            {cvData.summary}
          </p>
        </section>
      )}

      {/* CORE STRENGTHS / SKILLS (3-Column Bulleted List) */}
      {allSkills.length > 0 && (
        <section>
          <SectionHeader title="Core Strengths" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 pl-4 text-[14px] text-gray-800 list-disc">
            {allSkills.map((skill, index) => (
              <li key={index} className="pl-1">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PROFESSIONAL EXPERIENCE */}
      {cvData.experience && cvData.experience.length > 0 && (
        <section>
          <SectionHeader title="Professional Experience" />
          <div className="flex flex-col gap-6">
            {cvData.experience.map((exp, index) => (
              <div key={index}>
                <div className="text-[14.5px] text-gray-800 mb-2">
                  <span className="font-bold">{exp.position}</span>
                  {exp.institutionName && <span> | {exp.institutionName}</span>}
                  {exp.duration && <span> | {exp.duration}</span>}
                </div>
                {exp.summary && (
                  <div className="text-[14.5px] text-gray-800 leading-[1.7] whitespace-pre-line ml-5">
                    {/* Assuming summary contains bullet points mapped to • or - */}
                    {exp.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {cvData.education && cvData.education.length > 0 && (
        <section>
          <SectionHeader title="Education" />
          <div className="flex flex-col gap-6">
            {cvData.education.map((edu, index) => (
              <div key={index}>
                <div className="text-[14.5px] text-gray-800 mb-2">
                  <span className="font-bold">{edu.certification}</span>
                  {edu.institutionName && <span> | {edu.institutionName}</span>}
                  {edu.duration && <span> | {edu.duration}</span>}
                </div>
                {edu.summary && (
                  <div className="text-[14.5px] text-gray-800 leading-[1.7] whitespace-pre-line ml-5">
                    {edu.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CUSTOM SECTIONS (Dynamically handled) */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        cvData.customSections.map((section, sectionIndex) => (
          <section key={sectionIndex}>
            <SectionHeader title={section.title} />
            <div className="flex flex-col gap-5">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <div className="text-[14.5px] text-gray-800 mb-1">
                    <span className="font-bold">{item.name}</span>
                    {item.duration && <span> | {item.duration}</span>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        [Link]
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-[14.5px] text-gray-800 leading-[1.7] whitespace-pre-line ml-5">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

    </div>
  );
};

export default CenteredFormalTemplate;