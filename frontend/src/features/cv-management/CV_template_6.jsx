import React from "react";

const FederalResumeTemplate = ({ userName = "", cvData, highlights = {} }) => {
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

  const contactItems = [];
  if (cvData.contact?.phone)
    contactItems.push(
      <span key="phone">
        <strong>Phone:</strong> {cvData.contact.phone}
      </span>,
    );
  if (cvData.contact?.email)
    contactItems.push(
      <span key="email">
        <strong>Email:</strong> {cvData.contact.email}
      </span>,
    );
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city]
      .filter(Boolean)
      .join(", ");
    if (location)
      contactItems.push(
        <span key="address">
          <strong>Address:</strong> {location}
        </span>,
      );
  }
  if (cvData.contact?.linkedin)
    contactItems.push(
      <span key="linkedin">
        <strong>LinkedIn:</strong> {cvData.contact.linkedin}
      </span>,
    );
  if (cvData.contact?.github)
    contactItems.push(
      <span key="github">
        <strong>GitHub:</strong> {cvData.contact.github}
      </span>,
    );

  const SectionHeader = ({ title }) => (
    <div className="my-3">
      <hr className="border-t-[1.5px] border-gray-300 mb-1" />
      <h2 className="text-center text-[13px] md:text-sm font-bold uppercase tracking-[0.15em] text-gray-800">
        {title}
      </h2>
      <hr className="border-t-[1.5px] border-gray-300 mt-1" />
    </div>
  );

  return (
    <div
      className="bg-white text-gray-800 font-sans"
      style={{
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        padding: "15mm", // Standard A4 professional margins
      }}
    >
      <header className="text-center mb-4">
        <h1 className="text-[28px] md:text-[34px] font-semibold uppercase tracking-[0.2em] text-gray-800 mb-2">
          {userName}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-1.5 text-xs md:text-sm text-gray-800">
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

      {/* OPTIONAL FEDERAL ANNOUNCEMENT BLOCK */}
      {cvData.customSections?.find(
        (sec) => sec.title.toLowerCase() === "federal details",
      ) && (
          <div className="border-y-[2.5px] border-double border-gray-300 py-2 mb-5 text-center text-[11px] md:text-[12px] text-gray-800 leading-relaxed font-medium">
            {cvData.customSections
              .find((sec) => sec.title.toLowerCase() === "federal details")
              .items.map((item, idx) => (
                <span key={idx} className="mr-2 last:mr-0 whitespace-pre-line">
                  <strong>{item.name}:</strong> {item.description}
                  {idx <
                    cvData.customSections.find(
                      (sec) => sec.title.toLowerCase() === "federal details",
                    ).items.length -
                    1 && " |"}
                </span>
              ))}
          </div>
        )}

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid mb-5" style={getHighlightStyle('summary')}>
              <SectionHeader title="Professional Statement" />
              <div className="text-xs md:text-[13px] text-gray-800 leading-relaxed text-justify whitespace-pre-wrap break-words">
                {cvData.summary}
              </div>
            </section>
          ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="mb-5">
                <SectionHeader title="Work Experiences" />
                <div className="space-y-5 block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <div className="flex justify-between items-baseline text-[13px] md:text-sm text-gray-900 mb-1">
                          <div>
                            <span className="font-bold">{exp.position}</span>
                            {exp.institutionName && (
                              <span>
                                {" "}
                                | <strong>Employer:</strong>{" "}
                                {exp.institutionName}
                              </span>
                            )}
                          </div>
                          {dur && <div className="font-medium">{dur}</div>}
                        </div>
                        {exp.summary && (
                          <div className="text-[13px] md:text-[13.5px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1.5 text-left">
                            {exp.summary}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null,
          education:
            cvData.education && cvData.education.length > 0 ? (
              <section key="education" className="mb-5">
                <SectionHeader title="Education" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div
                        key={index}
                        className="text-[13px] md:text-sm break-inside-avoid"
                        style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}
                      >
                        <div className="font-bold text-gray-900">
                          {edu.certification}
                          {dur ? ` | ${dur}` : ""}
                        </div>
                        <div className="text-gray-700 mt-0.5">
                          {edu.institutionName}
                        </div>
                        {edu.summary && (
                          <div className="text-gray-600 mt-1 whitespace-pre-wrap break-words">
                            {edu.summary}
                          </div>
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
                className="break-inside-avoid mb-5"
                style={getHighlightStyle('technicalSkills')}
              >
                <SectionHeader title="Technical Skills" />
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-3.5 text-xs md:text-[13px] text-gray-800 list-disc list-inside">
                  {cvData.technicalSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid mb-5" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Soft Skills" />
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-3.5 text-xs md:text-[13px] text-gray-800 list-disc list-inside">
                  {cvData.softSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="break-inside-avoid mb-5" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-3.5 text-xs md:text-[13px] text-gray-800 list-disc list-inside">
                  {cvData.language.map((item, index) => {
                    const displayText =
                      typeof item === "string"
                        ? item
                        : `${item.name} — ${item.level}`;
                    return <li key={index}>{displayText}</li>;
                  })}
                </ul>
              </section>
            ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || [
          "summary",
          "experience",
          "education",
          "customSections",
          "technicalSkills",
          "softSkills",
          "language",
        ];

        return sectionOrder.map((key) => {
          if (key === "customSections" && cvData.customSections?.length > 0) {
            return cvData.customSections
              .filter((sec) => sec.title.toLowerCase() !== "federal details")
              .map((section, sectionIndex) => {
                const useGrid = [
                  "professional development",
                  "skills",
                  "certifications",
                ].includes(section.title.toLowerCase());
                return (
                  <section
                    key={`custom-${sectionIndex}`}
                    className="mb-5"
                  >
                    <SectionHeader title={section.title} />
                    <div
                      className={
                        useGrid
                          ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5"
                          : "flex flex-col gap-3.5"
                      }
                    >
                      {section.items.map((item, itemIndex) => {
                        const dur = fmtDuration(
                          item.durationFrom,
                          item.durationTo,
                        );
                        return (
                          <div
                            key={itemIndex}
                            className="text-xs md:text-[13px] break-inside-avoid"
                            style={getHighlightStyle(`customSections_${sectionIndex}_items_${itemIndex}_description`)}
                          >
                            <div className="font-bold text-gray-900">
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
                              {dur ? ` | ${dur}` : ""}
                            </div>
                            {item.description && (
                              <div className="text-gray-700 mt-0.5 whitespace-pre-wrap break-words">
                                {item.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              });
          }
          if (key === "skills") return null;
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default FederalResumeTemplate;
