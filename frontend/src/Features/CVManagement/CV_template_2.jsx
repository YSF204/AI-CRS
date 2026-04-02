import React from 'react';

const MinimalResumeTemplate = ({ userName = "FULL NAME", cvData }) => {
  if (!cvData) return null;

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
    <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 text-gray-900 font-sans shadow-md">
      
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

      {/* OBJECTIVE / SUMMARY */}
      {cvData.summary && (
        <section className="mb-6">
          <h3 className="text-base font-bold uppercase text-gray-900 mb-1">
            Objective
          </h3>
          <hr className="border-t-[1.5px] border-gray-400 mb-3" />
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {cvData.summary}
          </p>
        </section>
      )}

      {/* EDUCATION */}
      {cvData.education && cvData.education.length > 0 && (
        <section className="mb-6">
          <h3 className="text-base font-bold uppercase text-gray-900 mb-1">
            Education
          </h3>
          <hr className="border-t-[1.5px] border-gray-400 mb-3" />
          <div className="flex flex-col gap-4">
            {cvData.education.map((edu, index) => (
              <div key={index}>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{edu.certification}</span>
                  {edu.institutionName && ` | ${edu.institutionName}`}
                  {edu.duration && ` | ${edu.duration}`}
                </p>
                {edu.summary && (
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                    {edu.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXPERIENCE / INTERNSHIP */}
      {cvData.experience && cvData.experience.length > 0 && (
        <section className="mb-6">
          <h3 className="text-base font-bold uppercase text-gray-900 mb-1">
            Experience
          </h3>
          <hr className="border-t-[1.5px] border-gray-400 mb-3" />
          <div className="flex flex-col gap-4">
            {cvData.experience.map((exp, index) => (
              <div key={index}>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{exp.institutionName}</span>
                  {exp.position && ` | ${exp.position}`}
                  {exp.duration && ` | ${exp.duration}`}
                </p>
                {exp.summary && (
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                    {exp.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {(cvData.technicalSkills?.length > 0 || cvData.softSkills?.length > 0 || cvData.language?.length > 0) && (
        <section className="mb-6">
          <h3 className="text-base font-bold uppercase text-gray-900 mb-1">
            Skills
          </h3>
          <hr className="border-t-[1.5px] border-gray-400 mb-3" />
          <ul className="text-sm text-gray-800 space-y-1.5">
            {cvData.technicalSkills && cvData.technicalSkills.length > 0 && (
              <li>
                <span className="font-medium">Programming/Tools: </span>
                {cvData.technicalSkills.join(', ')}
              </li>
            )}
            {cvData.softSkills && cvData.softSkills.length > 0 && (
              <li>
                <span className="font-medium">Soft Skills: </span>
                {cvData.softSkills.join(', ')}
              </li>
            )}
            {cvData.language && cvData.language.length > 0 && (
              <li>
                <span className="font-medium">Languages: </span>
                {cvData.language.join(', ')}
              </li>
            )}
          </ul>
        </section>
      )}

      {/* CUSTOM SECTIONS (Always dynamically mapped) */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        cvData.customSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-6">
            <h3 className="text-base font-bold uppercase text-gray-900 mb-1">
              {section.title}
            </h3>
            <hr className="border-t-[1.5px] border-gray-400 mb-3" />
            <div className="flex flex-col gap-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{item.name}</span>
                    {item.duration && ` | ${item.duration}`}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        [Link]
                      </a>
                    )}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                      {item.description}
                    </p>
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

export default MinimalResumeTemplate;