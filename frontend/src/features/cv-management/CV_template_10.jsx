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

const SectionHeader = ({ title }) => (
  <h2 className="text-[15px] font-bold uppercase text-gray-900 mb-3 tracking-widest border-b-[2px] border-gray-900 pb-1 m-0">
    {title}
  </h2>
);

const StandardATSTemplate = ({ userName = "", cvData, highlights = {} }) => {
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
  if (cvData.address?.country || cvData.address?.city) {
    const location = [cvData.address.city, cvData.address.country]
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
        padding: "15mm", // Balanced A4 margins
      }}
    >
      <header className="mb-6 flex flex-col items-center">
        <h1 className="text-[34px] font-extrabold text-gray-900 tracking-tight leading-none mt-0 mb-2">
          {userName}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[13px] text-gray-800 font-medium">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('summary')}>
              <SectionHeader title="Summary" />
              <p className="text-[13px] md:text-[14px] text-gray-800 leading-[1.6] whitespace-pre-wrap break-words m-0">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="cv-page-group mb-5">
                <div className="break-inside-avoid">
                  <SectionHeader title="Professional Experience" />
                  {cvData.experience.slice(0, 1).map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-gray-900 m-0">
                            {exp.position}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-700 font-semibold uppercase tracking-wider">
                              {dur}
                            </span>
                          )}
                        </div>
                        {exp.institutionName && (
                          <div className="text-[14px] text-gray-700 font-semibold mt-0 mb-1.5">
                            {exp.institutionName}
                          </div>
                        )}
                        {exp.summary && (
                          <div className="text-[13px] md:text-[14px] text-gray-800 leading-[1.6] whitespace-pre-wrap break-words m-0">
                            {/* Standard ATS bullets format often best kept clean */}
                            {exp.summary.split('\n').map((line, i) => {
                              const trimmedLine = line.trim();
                              if (!trimmedLine) return null;
                              return (
                                <div key={i} className="flex mb-1 pl-2">
                                  <span className="mr-3 text-gray-600">•</span>
                                  <span>{trimmedLine.replace(/^[-•]\s*/, '')}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-5 block">
                  {cvData.experience.slice(1).map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index + 1} className="break-inside-avoid" style={getHighlightStyle(`experience_${index + 1}_institutionName`, `experience_${index + 1}_position`, `experience_${index + 1}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-gray-900 m-0">
                            {exp.position}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-700 font-semibold uppercase tracking-wider">
                              {dur}
                            </span>
                          )}
                        </div>
                        {exp.institutionName && (
                          <div className="text-[14px] text-gray-700 font-semibold mt-0 mb-1.5">
                            {exp.institutionName}
                          </div>
                        )}
                        {exp.summary && (
                          <div className="text-[13px] md:text-[14px] text-gray-800 leading-[1.6] whitespace-pre-wrap break-words m-0">
                            {/* Standard ATS bullets format often best kept clean */}
                            {exp.summary.split('\n').map((line, i) => {
                              const trimmedLine = line.trim();
                              if (!trimmedLine) return null;
                              return (
                                <div key={i} className="flex mb-1 pl-2">
                                  <span className="mr-3 text-gray-600">•</span>
                                  <span>{trimmedLine.replace(/^[-•]\s*/, '')}</span>
                                </div>
                              );
                            })}
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
              <section key="education" className="cv-page-group mb-5">
                <div className="break-inside-avoid">
                  <SectionHeader title="Education" />
                  {cvData.education.slice(0, 1).map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index} style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-gray-900 m-0">
                            {edu.certification}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-700 font-semibold uppercase tracking-wider">
                              {dur}
                            </span>
                          )}
                        </div>
                        <div className="text-[14px] text-gray-700 font-semibold mt-0 m-0">
                          {edu.institutionName}
                        </div>
                        {edu.summary && (
                          <div className="text-[13px] md:text-[14px] text-gray-800 mt-1 leading-[1.6] whitespace-pre-wrap break-words pl-2 m-0">
                            {edu.summary}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-4 block">
                  {cvData.education.slice(1).map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index + 1} className="break-inside-avoid" style={getHighlightStyle(`education_${index + 1}_institutionName`, `education_${index + 1}_certification`, `education_${index + 1}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-gray-900 m-0">
                            {edu.certification}
                          </h3>
                          {dur && (
                            <span className="text-[13px] text-gray-700 font-semibold uppercase tracking-wider">
                              {dur}
                            </span>
                          )}
                        </div>
                        <div className="text-[14px] text-gray-700 font-semibold mt-0 m-0">
                          {edu.institutionName}
                        </div>
                        {edu.summary && (
                          <div className="text-[13px] md:text-[14px] text-gray-800 mt-1 leading-[1.6] whitespace-pre-wrap break-words pl-2 m-0">
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
                <section key="technicalSkills" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('technicalSkills')}>
                  <SectionHeader title="Technical Skills" />
                  {hasGroups ? (
                    <div className="flex flex-col gap-1.5">
                      {groups.map((g, gi) => (
                        <div key={gi} className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="text-[13px] font-bold text-gray-800 shrink-0">{g.title}:</span>
                          <span className="text-[12.5px] text-gray-600">{g.skills.join(' · ')}</span>
                        </div>
                      ))}
                      {loose.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] md:text-[14px] text-gray-800 list-none m-0 mt-0.5">
                          {loose.map((s, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2 text-gray-600">•</span><span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] md:text-[14px] text-gray-800">
                      {cvData.technicalSkills.map((skill, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-gray-600">•</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })() : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Soft Skills" />
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] md:text-[14px] text-gray-800">
                  {cvData.softSkills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-gray-600">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] md:text-[14px] text-gray-800">
                  {cvData.language.map((item, index) => {
                    const displayText =
                      typeof item === "string"
                        ? item
                        : `${item.name} (${item.level})`;
                    return (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-gray-600">•</span>
                        <span>{displayText}</span>
                      </li>
                    );
                  })}
                </ul>
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
                className="cv-page-group mb-5"
              >
                <div className="break-inside-avoid">
                  <SectionHeader title={section.title} />
                    {section.items.slice(0, 1).map((item, itemIndex) => {
                      const dur = fmtDuration(item.durationFrom, item.durationTo);
                      return (
                        <div
                          key={itemIndex}
                          style={getHighlightStyle(`customSections_${sectionIndex}_items_${itemIndex}_description`)}
                        >
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="text-[15px] font-bold text-gray-900 m-0">
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
                              <span className="text-[13px] text-gray-700 font-semibold uppercase tracking-wider">
                                {dur}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-[13px] md:text-[14px] text-gray-800 leading-[1.6] whitespace-pre-wrap break-words mt-1 pl-2 m-0">
                              {item.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                <div className="space-y-4 block">
                  {section.items.slice(1).map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div
                        key={itemIndex + 1}
                        className="break-inside-avoid"
                        style={getHighlightStyle(`customSections_${sectionIndex}_items_${itemIndex + 1}_description`)}
                      >
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-gray-900 m-0">
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
                            <span className="text-[13px] text-gray-700 font-semibold uppercase tracking-wider">
                              {dur}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-[13px] md:text-[14px] text-gray-800 leading-[1.6] whitespace-pre-wrap break-words mt-1 pl-2 m-0">
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
          if (key.includes("Skills") || key === "language")
            return sectionBlocks[key];
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default StandardATSTemplate;
