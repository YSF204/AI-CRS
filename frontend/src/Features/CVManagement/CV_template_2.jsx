import React from "react";

const MinimalResumeTemplate = ({ userName = "", cvData }) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return "";
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
        <h1 className="text-[28px] md:text-[34px] font-bold uppercase tracking-tight text-gray-900 mb-0">
          {userName}
        </h1>
        <h2 className="text-sm md:text-base uppercase tracking-[0.15em] text-gray-700">
          {cvData.jobTitle}
        </h2>
      </header>

      {/* CONTACT INFO */}
      <div className="border-y-2 border-gray-300 py-0.5 mb-6">
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
            <section key="summary" className="break-inside-avoid mb-6">
              <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                Objective
              </h3>
              <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
              <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          education:
            cvData.education && cvData.education.length > 0 ? (
              <section key="education" className="break-inside-avoid mb-6">
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Education
                </h3>
                <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
                <div className="space-y-4 block">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid">
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
              <section key="experience" className="break-inside-avoid mb-6">
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Experience
                </h3>
                <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
                <div className="space-y-4 block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid">
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
                className="break-inside-avoid mb-6"
              >
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Technical Skills
                </h3>
                <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed">
                  {cvData.technicalSkills.join(", ")}
                </p>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid mb-6">
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Soft Skills
                </h3>
                <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed">
                  {cvData.softSkills.join(", ")}
                </p>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="break-inside-avoid mb-6">
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Languages
                </h3>
                <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
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
                className="break-inside-avoid mb-6"
              >
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-900 mb-1">
                  {section.title}
                </h3>
                <hr className="border-t-2 border-gray-300 mt-1 mb-3" />
                <div className="space-y-4 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div key={itemIndex} className="break-inside-avoid">
                        <p className="text-[13.5px] md:text-sm text-gray-900">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {item.name}
                            </a>
                          ) : (
                            <span className="font-semibold">{item.name}</span>
                          )}
                          {dur && (
                            <span className="text-gray-500">{` | ${dur}`}</span>
                          )}
                        </p>
                        {item.description && (
                          <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words">
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
