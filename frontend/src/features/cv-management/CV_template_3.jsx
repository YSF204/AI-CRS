import React from "react";
import { getSocialIcon, getSocialName } from "./SocialIcons";

const ExecutiveResumeTemplate = ({ userName = "", cvData, highlights = {} }) => {
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
  if (cvData.address?.city || cvData.address?.street) {
    const location = [cvData.address.city, cvData.address.street]
      .filter(Boolean)
      .join(", ");
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.linkedin) contactItems.push(cvData.contact.linkedin);
  if (cvData.contact?.github) contactItems.push(cvData.contact.github);
  if (cvData.contact?.customLinks) {
    cvData.contact.customLinks.forEach(link => {
      if (link.url) {
        contactItems.push(
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {getSocialName(link.icon)}
          </a>
        );
      }
    });
  }

  const SectionHeader = ({ title }) => (
    <div className="border-y-[1.5px] border-gray-300 py-1.5 mb-2 mt-4">
      <h2 className="text-[13px] md:text-[14px] font-bold uppercase text-gray-800 tracking-wide">
        {title}
      </h2>
    </div>
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
        padding: "15mm", // Standard A4 professional margins
      }}
    >
      <header className="text-center mb-4">
        <h1 className="text-[26px] md:text-[30px] font-bold text-gray-800 mb-1">
          {userName}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-1.5 text-[13px] md:text-[14px] text-gray-700">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 text-xs px-1">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid" style={getHighlightStyle('summary')}>
              <SectionHeader title="Professional Summary" />
              <p className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-justify">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="">
                <div className="break-inside-avoid cv-page-group">
                  <SectionHeader title="Professional Experience" />
                  <div className="space-y-3.5 block">
                    {cvData.experience.slice(0, 1).map((exp, index) => {
                      const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                      return (
                        <div key={0} className="break-inside-avoid" style={getHighlightStyle(`experience_0_institutionName`, `experience_0_position`, `experience_0_summary`)}>
                          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                            <div>
                              <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-800">
                                {exp.position}
                              </h3>
                              <p className="text-[13px] md:text-[14px] text-gray-800 font-medium">
                                {exp.institutionName}
                              </p>
                            </div>
                            {dur && (
                              <div className="text-[13px] md:text-[14px] text-gray-800 font-bold sm:text-right mt-1 sm:mt-0">
                                {dur}
                              </div>
                            )}
                          </div>
                          {exp.summary && (
                            <div className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1.5">
                              {exp.summary}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {cvData.experience.length > 1 && (
                  <div className="space-y-3.5 block mt-2">
                    {cvData.experience.slice(1).map((exp, index) => {
                      const actualIndex = index + 1;
                      const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                      return (
                        <div key={actualIndex} className="break-inside-avoid" style={getHighlightStyle(`experience_${actualIndex}_institutionName`, `experience_${actualIndex}_position`, `experience_${actualIndex}_summary`)}>
                          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                            <div>
                              <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-800">
                                {exp.position}
                              </h3>
                              <p className="text-[13px] md:text-[14px] text-gray-800 font-medium">
                                {exp.institutionName}
                              </p>
                            </div>
                            {dur && (
                              <div className="text-[13px] md:text-[14px] text-gray-800 font-bold sm:text-right mt-1 sm:mt-0">
                                {dur}
                              </div>
                            )}
                          </div>
                          {exp.summary && (
                            <div className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1.5">
                              {exp.summary}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null,
          education:
            cvData.education && cvData.education.length > 0 ? (
              <section key="education" className="">
                <div className="break-inside-avoid cv-page-group">
                  <SectionHeader title="Education" />
                  <div className="space-y-3 block">
                    {cvData.education.slice(0, 1).map((edu, index) => {
                      const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                      return (
                        <div key={0} className="break-inside-avoid" style={getHighlightStyle(`education_0_institutionName`, `education_0_certification`, `education_0_summary`)}>
                          <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-800 mb-0.5">
                            {edu.certification}
                          </h3>
                          <p className="text-[13px] md:text-[14px] text-gray-800">
                            {edu.institutionName}
                            {edu.summary && ` • ${edu.summary}`}
                            {dur && ` • ${dur}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {cvData.education.length > 1 && (
                  <div className="space-y-3 block mt-2">
                    {cvData.education.slice(1).map((edu, index) => {
                      const actualIndex = index + 1;
                      const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                      return (
                        <div key={actualIndex} className="break-inside-avoid" style={getHighlightStyle(`education_${actualIndex}_institutionName`, `education_${actualIndex}_certification`, `education_${actualIndex}_summary`)}>
                          <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-800 mb-0.5">
                            {edu.certification}
                          </h3>
                          <p className="text-[13px] md:text-[14px] text-gray-800">
                            {edu.institutionName}
                            {edu.summary && ` • ${edu.summary}`}
                            {dur && ` • ${dur}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null,
          technicalSkills:
            cvData.technicalSkills?.length > 0 ? (
              <section key="technicalSkills" className="break-inside-avoid" style={getHighlightStyle('technicalSkills')}>
                <SectionHeader title="Technical Skills" />
                <p className="text-[13px] md:text-[14px] text-gray-800">
                  {cvData.technicalSkills.join(", ")}
                </p>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Soft Skills" />
                <p className="text-[13px] md:text-[14px] text-gray-800">
                  {cvData.softSkills.join(", ")}
                </p>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="break-inside-avoid" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <p className="text-[13px] md:text-[14px] text-gray-800">
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
          "experience",
          "education",
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
                className=""
              >
                <div className="break-inside-avoid cv-page-group">
                  <SectionHeader title={section.title} />
                  <div className="space-y-3 block">
                    {section.items.slice(0, 1).map((item, itemIndex) => {
                      const dur = fmtDuration(item.durationFrom, item.durationTo);
                      return (
                        <div
                          key={0}
                          className="break-inside-avoid"
                          style={getHighlightStyle(`customSections_${sectionIndex}_items_0_description`)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                            <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-800">
                              <span>{item.name}</span>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  <svg className="w-3.5 h-3.5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                              )}
                            </h3>
                            {dur && (
                              <div className="text-[13px] md:text-[14px] text-gray-800 font-medium sm:text-right">
                                {dur}
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                              {item.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {section.items.length > 1 && (
                  <div className="space-y-3 block mt-2">
                    {section.items.slice(1).map((item, itemIndex) => {
                      const actualIndex = itemIndex + 1;
                      const dur = fmtDuration(item.durationFrom, item.durationTo);
                      return (
                        <div
                          key={actualIndex}
                          className="break-inside-avoid"
                          style={getHighlightStyle(`customSections_${sectionIndex}_items_${actualIndex}_description`)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                            <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-800">
                              <span>{item.name}</span>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  <svg className="w-3.5 h-3.5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                              )}
                            </h3>
                            {dur && (
                              <div className="text-[13px] md:text-[14px] text-gray-800 font-medium sm:text-right">
                                {dur}
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                              {item.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

export default ExecutiveResumeTemplate;
