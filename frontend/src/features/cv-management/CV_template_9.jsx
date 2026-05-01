import React from "react";

const MinimalATSTemplate = ({ userName = "", cvData, highlights = {} }) => {
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
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city]
      .filter(Boolean)
      .join(", ");
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);

  const SectionHeader = ({ title }) => (
    <h2 className="text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-2 border-b-[1px] border-gray-400 pb-1">
      {title}
    </h2>
  );

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
        padding: "15mm", // Balanced A4 margins
      }}
    >
      <header className="mb-4 text-center">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1.5">
          {userName}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-2 text-[13px] text-gray-700">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-300 mx-1">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid mb-5" style={getHighlightStyle('summary')}>
              <SectionHeader title="Professional Summary" />
              <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="mb-5">
                <SectionHeader title="Experience" />
                <div className="space-y-4 block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[14px] font-bold text-gray-900">
                            {exp.position}
                            {exp.institutionName && (
                              <span className="font-normal text-gray-600">, {exp.institutionName}</span>
                            )}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">
                              {dur}
                            </span>
                          )}
                        </div>
                        {exp.summary && (
                          <div className="text-[13px] md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1">
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
                <div className="space-y-3 block">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[14px] font-bold text-gray-900">
                            {edu.institutionName}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">
                              {dur}
                            </span>
                          )}
                        </div>
                        <div className="text-[14px] text-gray-800">
                          {edu.certification}
                        </div>
                        {edu.summary && (
                          <div className="text-[13px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words">
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
              <section key="technicalSkills" className="break-inside-avoid mb-5" style={getHighlightStyle('technicalSkills')}>
                <SectionHeader title="Technical Skills" />
                <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed">
                  <span className="font-semibold mr-1">Skills:</span>
                  {cvData.technicalSkills.join(" • ")}
                </p>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid mb-5" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Soft Skills" />
                <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed">
                  <span className="font-semibold mr-1">Competencies:</span>
                  {cvData.softSkills.join(" • ")}
                </p>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="break-inside-avoid mb-5" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed">
                  <span className="font-semibold mr-1">Languages:</span>
                  {cvData.language
                    .map((item) =>
                      typeof item === "string"
                        ? item
                        : `${item.name} (${item.level})`,
                    )
                    .join(" • ")}
                </p>
              </section>
            ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || [
          "summary",
          "experience",
          "education",
          "technicalSkills",
          "softSkills",
          "language",
          "customSections",
        ];

        return sectionOrder.map((key) => {
          if (key === "customSections" && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section
                key={`custom-${sectionIndex}`}
                className="mb-5"
              >
                <SectionHeader title={section.title} />
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
                          <h3 className="text-[14px] font-bold text-gray-900">
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {item.name}
                              </a>
                            ) : (
                              item.name
                            )}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">
                              {dur}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-[13px] md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1">
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
          if (key.includes("Skills") || key === "language")
            return sectionBlocks[key];
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default MinimalATSTemplate;
