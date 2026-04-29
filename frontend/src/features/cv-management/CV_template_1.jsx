import React from "react";

const ResumeTemplate = ({ userName, cvData, highlights = {} }) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return "";
  };

  const getHighlightStyle = (...fieldIds) => {
    if (!highlights) return {};
    for (const id of fieldIds) {
      if (highlights[id] === 'warning') return { outline: '3px dashed #ff5f57', outlineOffset: '2px', backgroundColor: 'rgba(255, 95, 87, 0.05)', borderRadius: '2px' };
      if (highlights[id] === 'suggestion') return { outline: '3px dashed #0a84ff', outlineOffset: '2px', backgroundColor: 'rgba(10, 132, 255, 0.05)', borderRadius: '2px' };
    }
    return {};
  };

  const sectionBlocks = {
    summary: cvData.summary ? (
      <section
        key="summary"
        className="break-inside-avoid mb-3 border-b-2 border-gray-200 pb-2"
        style={getHighlightStyle('summary')}
      >
        <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-2.5">
          About Me
        </h3>
        <p className="text-gray-700 text-sm leading-snug text-justify whitespace-pre-wrap break-words">
          {cvData.summary}
        </p>
      </section>
    ) : null,

    education:
      cvData.education && cvData.education.length > 0 ? (
        <section
          key="education"
          className="break-inside-avoid mb-3 border-b-2 border-gray-200 pb-2"
        >
          <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-3">
            Education
          </h3>
          <div className="space-y-2 block">
            {cvData.education.map((edu, index) => {
              const dur = fmtDuration(edu.durationFrom, edu.durationTo);
              return (
                <div key={index} className="break-inside-avoid" style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}>
                  <p className="text-xs md:text-sm text-gray-500 mb-0.5">
                    {edu.institutionName}
                    {dur ? ` | ${dur}` : ""}
                  </p>
                  <h4 className="text-sm md:text-base font-bold text-gray-900 mb-0.5">
                    {edu.certification}
                  </h4>
                  {edu.summary && (
                    <p className="text-gray-700 text-sm leading-snug text-justify whitespace-pre-wrap break-words">
                      {edu.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null,

    experience:
      cvData.experience && cvData.experience.length > 0 ? (
        <section
          key="experience"
          className="break-inside-avoid mb-3 border-b-2 border-gray-200 pb-2"
        >
          <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-3">
            Work Experience
          </h3>
          <div className="space-y-2 block">
            {cvData.experience.map((exp, index) => {
              const dur = fmtDuration(exp.durationFrom, exp.durationTo);
              return (
                <div key={index} className="break-inside-avoid" style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                  <p className="text-xs md:text-sm text-gray-500 mb-0.5">
                    {exp.institutionName}
                    {dur ? ` | ${dur}` : ""}
                  </p>
                  <h4 className="text-sm md:text-base font-bold text-gray-900 mb-0.5">
                    {exp.position}
                  </h4>
                  {exp.summary && (
                    <p className="text-gray-700 text-sm leading-snug text-justify whitespace-pre-wrap break-words">
                      {exp.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null,

    technicalSkills:
      cvData.technicalSkills?.length > 0 ? (
        <section key="technicalSkills" className="break-inside-avoid mb-3" style={getHighlightStyle('technicalSkills')}>
          <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-2.5">
            Technical Skills
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-1.5 gap-x-3 text-xs md:text-sm text-gray-700 list-disc list-inside">
            {cvData.technicalSkills.map((skill, index) => (
              <li key={index} className="marker:text-gray-400">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      ) : null,

    softSkills:
      cvData.softSkills?.length > 0 ? (
        <section key="softSkills" className="break-inside-avoid mb-3" style={getHighlightStyle('softSkills')}>
          <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-2.5">
            Soft Skills
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-1.5 gap-x-3 text-xs md:text-sm text-gray-700 list-disc list-inside">
            {cvData.softSkills.map((skill, index) => (
              <li key={index} className="marker:text-gray-400">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      ) : null,

    language:
      cvData.language?.length > 0 ? (
        <section key="language" className="break-inside-avoid mb-3" style={getHighlightStyle('language')}>
          <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-2.5">
            Languages
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-1.5 gap-x-3 text-xs md:text-sm text-gray-700 list-disc list-inside">
            {cvData.language.map((item, index) => {
              const displayText =
                typeof item === "string"
                  ? item
                  : `${item.name} — ${item.level}`;
              return (
                <li key={index} className="marker:text-gray-400">
                  {displayText}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null,
  };

  const sectionOrder = cvData.layout?.sectionOrder || [
    "summary",
    "education",
    "experience",
    "customSections",
    "technicalSkills",
    "softSkills",
    "language",
  ];

  return (
    <div
      className="bg-white text-gray-900 font-sans"
      style={{
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        padding: "10mm", // Reduced A4 professional margins (10mm = 37.8px)
      }}
    >
      {/* HEADER SECTION */}
      <header className="text-center mb-3">
        <h1 className="text-[28px] md:text-[32px] lg:text-[36px] font-bold uppercase tracking-wider text-gray-900 mb-1.5">
          {userName}
        </h1>
        <h2 className="text-base md:text-lg text-gray-700 font-semibold tracking-wide">
          {cvData.jobTitle}
        </h2>
      </header>

      {/* CONTACT INFO */}
      <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-1.5 text-xs md:text-sm text-gray-600 mb-3">
        {cvData.contact?.phone && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{cvData.contact.phone}</span>
          </div>
        )}
        {cvData.contact?.email && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>{cvData.contact.email}</span>
          </div>
        )}
        {(cvData.address?.street || cvData.address?.city) && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {cvData.address.street}
              {cvData.address.street && cvData.address.city ? ", " : ""}
              {cvData.address.city}
            </span>
          </div>
        )}
        {cvData.contact?.linkedin && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span>{cvData.contact.linkedin}</span>
          </div>
        )}
        {cvData.contact?.github && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>{cvData.contact.github}</span>
          </div>
        )}
      </div>

      <hr className="border-t-2 border-gray-300 mb-3" />

      {/* DYNAMIC SECTIONS */}
      {sectionOrder.map((key) => {
        if (key === "customSections" && cvData.customSections?.length > 0) {
          return cvData.customSections.map((section, sectionIndex) => (
            <section
              key={`custom-${sectionIndex}`}
              className="break-inside-avoid mb-3 border-b-2 border-gray-200 pb-2"
            >
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-gray-900 mb-3">
                {section.title}
              </h3>
              <div className="space-y-2 block">
                {section.items.map((item, itemIndex) => {
                  const dur = fmtDuration(item.durationFrom, item.durationTo);
                  return (
                    <div key={itemIndex} className="break-inside-avoid">
                      {dur && (
                        <p className="text-xs md:text-sm text-gray-500 mb-0.5">
                          {dur}
                        </p>
                      )}
                      <h4 className="text-sm md:text-base font-bold text-gray-900 mb-0.5">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h4>
                      {item.description && (
                        <p className="text-gray-700 text-sm leading-snug text-justify whitespace-pre-wrap break-words">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ));
        }
        return sectionBlocks[key];
      })}
    </div>
  );
};

export default ResumeTemplate;
