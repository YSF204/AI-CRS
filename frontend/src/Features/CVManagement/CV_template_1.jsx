
const ResumeTemplate = ({ userName, cvData }) => {
  if (!cvData) return null;

  // Combine skills from the schema into a single array for the grid layout
  const allSkills = [
    ...(cvData.technicalSkills || []),
    ...(cvData.softSkills || []),
    ...(cvData.language || [])
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 text-gray-800 font-sans shadow-lg">
      
      {/* HEADER SECTION */}
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-widest text-gray-900 mb-2">
          {userName}
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-700 font-medium tracking-wide">
          {cvData.jobTitle}
        </h2>
      </header>

      {/* CONTACT INFO */}
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
        {cvData.contact?.phone && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{cvData.contact.phone}</span>
          </div>
        )}
        {cvData.contact?.email && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{cvData.contact.email}</span>
          </div>
        )}
        {(cvData.address?.street || cvData.address?.city) && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{cvData.address.street}{cvData.address.street && cvData.address.city ? ', ' : ''}{cvData.address.city}</span>
          </div>
        )}
      </div>

      <hr className="border-t-[1.5px] border-gray-400 mb-8" />

      {/* ABOUT ME */}
      {cvData.summary && (
        <section className="mb-8 border-b-[1.5px] border-gray-400 pb-8">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-3">
            About Me
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed text-justify">
            {cvData.summary}
          </p>
        </section>
      )}

      {/* EDUCATION */}
      {cvData.education && cvData.education.length > 0 && (
        <section className="mb-8 border-b-[1.5px] border-gray-400 pb-8">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-4">
            Education
          </h3>
          <div className="flex flex-col gap-5">
            {cvData.education.map((edu, index) => (
              <div key={index}>
                <p className="text-sm text-gray-500 mb-1">
                  {edu.institutionName} | {edu.duration}
                </p>
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  {edu.certification}
                </h4>
                {edu.summary && (
                  <p className="text-gray-700 text-sm leading-relaxed text-justify">
                    {edu.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {cvData.experience && cvData.experience.length > 0 && (
        <section className="mb-8 border-b-[1.5px] border-gray-400 pb-8">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-4">
            Work Experience
          </h3>
          <div className="flex flex-col gap-5">
            {cvData.experience.map((exp, index) => (
              <div key={index}>
                <p className="text-sm text-gray-500 mb-1">
                  {exp.institutionName} | {exp.duration}
                </p>
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  {exp.position}
                </h4>
                {exp.summary && (
                  <p className="text-gray-700 text-sm leading-relaxed text-justify">
                    {exp.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CUSTOM SECTIONS (DYNAMIC) */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        cvData.customSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-8 border-b-[1.5px] border-gray-400 pb-8">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-4">
              {section.title}
            </h3>
            <div className="flex flex-col gap-5">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  {item.duration && (
                    <p className="text-sm text-gray-500 mb-1">
                      {item.duration}
                    </p>
                  )}
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    {item.name}
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 text-sm ml-2 font-normal hover:underline"
                      >
                        [Link]
                      </a>
                    )}
                  </h4>
                  {item.description && (
                    <p className="text-gray-700 text-sm leading-relaxed text-justify">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {/* SKILLS */}
      {allSkills.length > 0 && (
        <section className="mb-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 mb-4">
            Skills
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-700 list-disc list-inside">
            {allSkills.map((skill, index) => (
              <li key={index} className="marker:text-gray-400">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
};

export default ResumeTemplate;