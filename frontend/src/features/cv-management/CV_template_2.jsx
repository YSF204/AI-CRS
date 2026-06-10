import React from "react";
import { getSocialIcon, getSocialName } from "./SocialIcons";

const cleanUrlDisplay = (url) => {
  if (typeof url !== "string") return url;
  return url
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/$/, "");
};

const ensureAbsoluteUrl = (url) => {
  if (typeof url !== "string") return url;
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

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
  if (cvData.contact?.phone) {
    contactItems.push(
      <a href={`tel:${cvData.contact.phone}`} className="text-inherit hover:underline">
        {cvData.contact.phone}
      </a>
    );
  }
  if (cvData.contact?.email) {
    contactItems.push(
      <a href={`mailto:${cvData.contact.email}`} className="text-inherit hover:underline">
        {cvData.contact.email}
      </a>
    );
  }
  if (cvData.address?.street || cvData.address?.city || cvData.address?.country) {
    const location = [cvData.address.street, cvData.address.city, cvData.address.country]
      .filter(Boolean)
      .join(", ");
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.linkedin) {
    contactItems.push(
      <a href={ensureAbsoluteUrl(cvData.contact.linkedin)} target="_blank" rel="noopener noreferrer" className="text-inherit hover:text-gray-900 inline-flex items-center align-middle" title="LinkedIn">
        {getSocialIcon('linkedin', 14)}
      </a>
    );
  }
  if (cvData.contact?.github) {
    contactItems.push(
      <a href={ensureAbsoluteUrl(cvData.contact.github)} target="_blank" rel="noopener noreferrer" className="text-inherit hover:text-gray-900 inline-flex items-center align-middle" title="GitHub">
        {getSocialIcon('github', 14)}
      </a>
    );
  }
  if (cvData.contact?.customLinks) {
    cvData.contact.customLinks.forEach(link => {
      if (link.url) {
        contactItems.push(
          <a href={ensureAbsoluteUrl(link.url)} target="_blank" rel="noopener noreferrer" className="text-inherit hover:text-gray-900 inline-flex items-center align-middle" title={link.label || getSocialName(link.icon)}>
            {getSocialIcon(link.icon, 14)}
          </a>
        );
      }
    });
  }

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
        <h1 className="text-[26px] md:text-[30px] font-bold uppercase tracking-tight text-gray-900 mt-0 mb-0">
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
              <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                Objective
              </h3>
              <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
              <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words m-0">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          education:
            cvData.education && cvData.education.length > 0 ? (
              <section key="education" className="mb-4">
                <div className="break-inside-avoid cv-page-group">
                  <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                    Education
                  </h3>
                  <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                  <div className="space-y-4 block">
                    {cvData.education.slice(0, 1).map((edu, index) => {
                      const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                      return (
                        <div key={0} className="break-inside-avoid" style={getHighlightStyle(`education_0_institutionName`, `education_0_certification`, `education_0_summary`)}>
                          <p className="text-[13.5px] md:text-sm text-gray-900 mt-0 mb-0">
                            <span className="font-semibold">
                              {edu.certification}
                            </span>
                            {edu.institutionName && ` | ${edu.institutionName}`}
                            {dur && (
                              <span className="text-gray-500">{` | ${dur}`}</span>
                            )}
                          </p>
                          {edu.summary && (
                            <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words m-0">
                              {edu.summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {cvData.education.length > 1 && (
                  <div className="space-y-4 block mt-2">
                    {cvData.education.slice(1).map((edu, index) => {
                      const actualIndex = index + 1;
                      const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                      return (
                        <div key={actualIndex} className="break-inside-avoid" style={getHighlightStyle(`education_${actualIndex}_institutionName`, `education_${actualIndex}_certification`, `education_${actualIndex}_summary`)}>
                          <p className="text-[13.5px] md:text-sm text-gray-900 mt-0 mb-0">
                            <span className="font-semibold">
                              {edu.certification}
                            </span>
                            {edu.institutionName && ` | ${edu.institutionName}`}
                            {dur && (
                              <span className="text-gray-500">{` | ${dur}`}</span>
                            )}
                          </p>
                          {edu.summary && (
                            <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words m-0">
                              {edu.summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="mb-4">
                <div className="break-inside-avoid cv-page-group">
                  <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                    Experience
                  </h3>
                  <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                  <div className="space-y-4 block">
                    {cvData.experience.slice(0, 1).map((exp, index) => {
                      const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                      return (
                        <div key={0} className="break-inside-avoid" style={getHighlightStyle(`experience_0_institutionName`, `experience_0_position`, `experience_0_summary`)}>
                          <p className="text-[13.5px] md:text-sm text-gray-900 mt-0 mb-0">
                            <span className="font-semibold">
                              {exp.institutionName}
                            </span>
                            {exp.position && ` | ${exp.position}`}
                            {dur && (
                              <span className="text-gray-500">{` | ${dur}`}</span>
                            )}
                          </p>
                          {exp.summary && (
                            <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words m-0">
                              {exp.summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {cvData.experience.length > 1 && (
                  <div className="space-y-4 block mt-2">
                    {cvData.experience.slice(1).map((exp, index) => {
                      const actualIndex = index + 1;
                      const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                      return (
                        <div key={actualIndex} className="break-inside-avoid" style={getHighlightStyle(`experience_${actualIndex}_institutionName`, `experience_${actualIndex}_position`, `experience_${actualIndex}_summary`)}>
                          <p className="text-[13.5px] md:text-sm text-gray-900 mt-0 mb-0">
                            <span className="font-semibold">
                              {exp.institutionName}
                            </span>
                            {exp.position && ` | ${exp.position}`}
                            {dur && (
                              <span className="text-gray-500">{` | ${dur}`}</span>
                            )}
                          </p>
                          {exp.summary && (
                            <p className="text-[13.5px] md:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap break-words m-0">
                              {exp.summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null,
          technicalSkills:
            cvData.technicalSkills?.length > 0 ? (() => {
              const groups = [];
              const loose = [];
              cvData.technicalSkills.forEach(s => {
                const m = typeof s === 'string' && s.match(/^([^:]+):\s*(.+)$/);
                if (m) groups.push({ title: m[1].trim(), skills: m[2].split(',').map(x => x.trim()).filter(Boolean) });
                else loose.push(s);
              });
              const hasGroups = groups.length > 0;
              return (
                <section
                  key="technicalSkills"
                  className="break-inside-avoid mb-4"
                  style={getHighlightStyle('technicalSkills')}
                >
                  <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                    Technical Skills
                  </h3>
                  <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                  {hasGroups ? (
                    <div className="flex flex-col gap-1.5">
                      {groups.map((g, gi) => (
                        <div key={gi} className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="text-[13px] font-bold text-gray-800 shrink-0">{g.title}:</span>
                          <span className="text-[12.5px] text-gray-600">{g.skills.join(' · ')}</span>
                        </div>
                      ))}
                      {loose.length > 0 && (
                        <p className="text-[13.5px] md:text-sm text-gray-800 m-0">{loose.join(", ")}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed m-0">
                      {cvData.technicalSkills.join(", ")}
                    </p>
                  )}
                </section>
              );
            })() : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid mb-4" style={getHighlightStyle('softSkills')}>
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                  Soft Skills
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed m-0">
                  {cvData.softSkills.join(", ")}
                </p>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="break-inside-avoid mb-4" style={getHighlightStyle('language')}>
                <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                  Languages
                </h3>
                <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                <p className="text-[13.5px] md:text-sm text-gray-800 leading-relaxed m-0">
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

        let customSectionCounter = 0;
        return sectionOrder.map((key) => {
          const isCustom = key.startsWith("customSection__");
          const isLegacyCustom = key === "customSections";
          if ((isCustom || isLegacyCustom) && cvData.customSections?.length > 0) {
            let sectionsToRender = [];
            if (isLegacyCustom) {
              sectionsToRender = cvData.customSections;
            } else {
              sectionsToRender = [cvData.customSections[customSectionCounter++]].filter(Boolean);
            }
            
            return sectionsToRender.map((section, loopIdx) => {
              const sectionIndex = isLegacyCustom ? loopIdx : (customSectionCounter - 1);
            return (
              <section
                key={`custom-${sectionIndex}`}
                className="mb-4"
              >
                <div className="break-inside-avoid cv-page-group">
                  <h3 className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-gray-900 mt-0 mb-1">
                    {section.title}
                  </h3>
                  <hr className="border-t-[1.5px] border-gray-300 mt-1 mb-2" />
                  <div className="space-y-4 block">
                    {section.items.slice(0, 1).map((item, itemIndex) => {
                      const dur = fmtDuration(item.durationFrom, item.durationTo);
                      return (
                        <div
                          key={0}
                          className="break-inside-avoid"
                          style={getHighlightStyle(`customSections_${sectionIndex}_items_0_description`)}
                        >
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="text-[13px] font-bold text-gray-900 m-0">
                              <span>{item.name}</span>
                              {item.link && (
                                <a
                                  href={ensureAbsoluteUrl(item.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  <svg className="w-3.5 h-3.5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                              )}
                            </h3>
                            {dur && (
                              <span className="text-xs md:text-sm text-gray-500">
                                {dur}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3 mt-1 m-0">
                              {item.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {section.items.length > 1 && (
                  <div className="space-y-4 block mt-4">
                    {section.items.slice(1).map((item, itemIndex) => {
                      const actualIndex = itemIndex + 1;
                      const dur = fmtDuration(item.durationFrom, item.durationTo);
                      return (
                        <div
                          key={actualIndex}
                          className="break-inside-avoid"
                          style={getHighlightStyle(`customSections_${sectionIndex}_items_${actualIndex}_description`)}
                        >
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="text-[13px] font-bold text-gray-900 m-0">
                              <span>{item.name}</span>
                              {item.link && (
                                <a
                                  href={ensureAbsoluteUrl(item.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  <svg className="w-3.5 h-3.5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                              )}
                            </h3>
                            {dur && (
                              <span className="text-xs md:text-sm text-gray-500">
                                {dur}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3 mt-1 m-0">
                              {item.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          });
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
