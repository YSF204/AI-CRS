import React from 'react';

const BlueAccentResumeTemplate = ({ 
  userName = "HERMAN WALTON", 
  profileImage, // Optional prop for the image URL
  cvData 
}) => {
  if (!cvData) return null;

  // Helper to format contact info with the pipe separator " | "
  const contactItems = [];
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city].filter(Boolean).join(', ');
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);

  // Reusable Section Header Component matching the blue double-line style
  const SectionHeader = ({ title }) => (
    <div className="border-y-[2px] border-blue-400/60 py-1 mb-3 mt-6">
      <h2 className="text-[15px] font-bold uppercase text-blue-600 tracking-wider">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 md:p-14 text-gray-800 font-sans shadow-md">
      
      {/* HEADER SECTION (Text Left, Image Right) */}
      <header className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 uppercase mb-2">
            {userName}
          </h1>
          <h2 className="text-xl font-bold text-gray-900 uppercase mb-2 tracking-wide">
            {cvData.jobTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-700">
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < contactItems.length - 1 && (
                  <span className="text-gray-400">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* PROFILE PICTURE */}
        {profileImage && (
          <div className="w-28 h-32 flex-shrink-0">
            <img 
              src={profileImage} 
              alt={userName} 
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
      </header>

      {/* SUMMARY */}
      {cvData.summary && (
        <section>
          <SectionHeader title="Summary" />
          <p className="text-sm text-gray-800 leading-relaxed text-justify">
            {cvData.summary}
          </p>
        </section>
      )}

      {/* PROFESSIONAL EXPERIENCE */}
      {cvData.experience && cvData.experience.length > 0 && (
        <section>
          <SectionHeader title="Professional Experience" />
          <div className="flex flex-col gap-4">
            {cvData.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row justify-between items-baseline mb-1">
                  <h3 className="text-[15px] font-bold text-gray-900">
                    {exp.position}{exp.institutionName ? `, ${exp.institutionName}` : ''}
                  </h3>
                  {exp.duration && (
                    <div className="text-[14px] text-gray-900 font-bold sm:text-right mt-1 sm:mt-0">
                      {exp.duration}
                    </div>
                  )}
                </div>
                {exp.summary && (
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line ml-4 mt-1 list-disc-wrapper">
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
          <div className="flex flex-col gap-4">
            {cvData.education.map((edu, index) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                  <h3 className="text-[15px] font-bold text-gray-900">
                    {edu.certification}
                  </h3>
                  {edu.duration && (
                    <div className="text-[14px] text-gray-900 font-bold sm:text-right mt-1 sm:mt-0">
                      {edu.duration}
                    </div>
                  )}
                </div>
                {edu.institutionName && (
                  <p className="text-sm text-gray-800 mb-1">
                    {edu.institutionName}
                  </p>
                )}
                {edu.summary && (
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line ml-4">
                    {edu.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TECHNICAL SKILLS (4-Column Grid) */}
      {cvData.technicalSkills && cvData.technicalSkills.length > 0 && (
        <section>
          <SectionHeader title="Technical Skills" />
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-4 text-sm text-gray-700">
            {cvData.technicalSkills.map((skill, index) => (
              <li key={index}>
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CUSTOM SECTIONS (Dynamically handled, useful for 'Additional Information') */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        cvData.customSections.map((section, sectionIndex) => (
          <section key={sectionIndex}>
            <SectionHeader title={section.title} />
            <div className="flex flex-col gap-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="text-sm text-gray-800">
                  <span className="font-bold text-gray-900 mr-2">
                    • {item.name}:
                  </span>
                  <span>{item.description}</span>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      [Link]
                    </a>
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

export default BlueAccentResumeTemplate;