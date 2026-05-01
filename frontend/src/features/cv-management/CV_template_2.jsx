import React from "react";

const MinimalResumeTemplate = ({ userName = "", cvData, highlights = {} }) => {
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

  // Helper to neatly format contact info with the pipe separator " | "
  const contactItems = [];
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.address?.city || cvData.address?.street) {
    const location = [cvData.address.street, cvData.address.city]
      .filter(Boolean)
      .join(", ");
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

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
        padding: "15mm", // Improved padding for elegant framing
      }}
    >
      {/* HEADER SECTION */}
      <header className="text-center mb-2">
        <h1 className="text-[26px] md:text-[30px] font-bold uppercase tracking-tight text-gray-900 mb-0">
          {userName}
        </h1>
      </header>

      {/* CONTACT INFO */}
      <div className="border-y-[1.5px] border-gray-300 py-0.5 mb-4">
        <div className="flex flex-wrap justify-center items-center gap-1 text-[13px] md:text-sm text-gray-800">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 px-0.5">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid mb-4" style={getHighlightStyle('summary')}>
              <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                Objective
              </h3>
              <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
              <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          education:
            cvData.education && cvData.education.length > 0 ? (
              <section key="education" className="mb-4">
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Education
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <div className="space-y-4 block">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}>
                        <p className="text-[13.5px] md:text-sm text-gray-900">
                          <span className="font-semibold">
                            {edu.certification}
                          </span>
                          {edu.institutionName && ` | ${edu.institutionName}`}
                          {dur && (
                            <span className="text-gray-500">{` | ${dur}`}</span>
                          )}
                        </p>
                        {edu.summary && (
                          <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words">
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
              <section key="experience" className="mb-4">
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Experience
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <div className="space-y-4 block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <p className="text-[13.5px] md:text-sm text-gray-900">
                          <span className="font-semibold">
                            {exp.institutionName}
                          </span>
                          {exp.position && ` | ${exp.position}`}
                          {dur && (
                            <span className="text-gray-500">{` | ${dur}`}</span>
                          )}
                        </p>
                        {exp.summary && (
                          <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words">
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
              <section
                key="technicalSkills"
                className="break-inside-avoid mb-4"
                style={getHighlightStyle('technicalSkills')}
              >
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Technical Skills
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed">
                  {cvData.technicalSkills.join(", ")}
                </p>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid mb-4" style={getHighlightStyle('softSkills')}>
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Soft Skills
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed">
                  {cvData.softSkills.join(", ")}
                </p>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="break-inside-avoid mb-4" style={getHighlightStyle('language')}>
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Languages
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed">
                  {cvData.language
                    .map((item) =>
                      typeof item === "string"
                        ? item
                        : `${item.name} — ${item.level}`,
                    )
                    .join(", ")}
                </p>
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

        return sectionOrder.map((key) => {
          if (key === "customSections" && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section
                key={`custom-${sectionIndex}`}
                className="mb-4"
              >
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-1">
                  {section.title}
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <div className="space-y-4 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div 
                        key={itemIndex} 
                        className="break-inside-avoid"
                        style={getHighlightStyle(`customSections_${sectionIndex}_items_${itemIndex}_description`)}
                      >
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[13px] font-bold text-gray-900">
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
                          </h3>
                          {dur && (
                            <span className="text-xs md:text-sm text-gray-500">
                              {dur}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ));
          }
          if (key.includes("Skills") || key === "language") {
            return sectionBlocks[key];
          }
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default MinimalResumeTemplate;
