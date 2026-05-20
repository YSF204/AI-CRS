import React from "react";
import { getSocialIcon, getSocialName } from "./SocialIcons";

const ATSProvenTemplate = ({ userName = "", cvData, highlights = {} }) => {
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
  if (cvData.address?.country || cvData.address?.city) {
    const location = [cvData.address.city, cvData.address.country]
      .filter(Boolean)
      .join(", ");
    if (location) contactItems.push(location);
  }
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
    <h2 className="text-[15px] font-bold uppercase text-black mb-2 border-b-[1.5px] border-black pb-1 tracking-widest">
      {title}
    </h2>
  );

  return (
    <div
      className="bg-white text-black font-serif"
      style={{
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        padding: "20mm", // Standard A4 margins
      }}
    >
      <header className="text-center mb-6">
        <h1 className="text-[36px] font-bold text-black leading-none mb-2">
          {userName}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-1.5 text-[14px] text-black">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span className="text-gray-400 mx-1">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('summary')}>
              <SectionHeader title="Professional Summary" />
              <p className="text-[14px] text-black leading-relaxed whitespace-pre-wrap break-words">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="cv-page-group mb-5">
                <div className="break-inside-avoid">
                  <SectionHeader title="Experience" />
                  {cvData.experience.slice(0, 1).map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-black">
                            {exp.position}
                          </h3>
                          {dur && (
                            <span className="text-[14px] text-black font-semibold">
                              {dur}
                            </span>
                          )}
                        </div>
                        {exp.institutionName && (
                          <div className="text-[14.5px] italic text-black mb-1">
                            {exp.institutionName}
                          </div>
                        )}
                        {exp.summary && (
                          <div className="text-[14px] text-black leading-relaxed whitespace-pre-wrap break-words mt-1">
                            {/* Standard ATS bullets format often best kept clean */}
                            {exp.summary.split('\n').map((line, i) => {
                              const trimmedLine = line.trim();
                              if (!trimmedLine) return null;
                              return (
                                <div key={i} className="flex mb-1">
                                  <span className="mr-2">•</span>
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
                <div className="space-y-4 block">
                  {cvData.experience.slice(1).map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index + 1} className="break-inside-avoid" style={getHighlightStyle(`experience_${index + 1}_institutionName`, `experience_${index + 1}_position`, `experience_${index + 1}_summary`)}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] font-bold text-black">
                            {exp.position}
                          </h3>
                          {dur && (
                            <span className="text-[14px] text-black font-semibold">
                              {dur}
                            </span>
                          )}
                        </div>
                        {exp.institutionName && (
                          <div className="text-[14.5px] italic text-black mb-1">
                            {exp.institutionName}
                          </div>
                        )}
                        {exp.summary && (
                          <div className="text-[14px] text-black leading-relaxed whitespace-pre-wrap break-words mt-1">
                            {/* Standard ATS bullets format often best kept clean */}
                            {exp.summary.split('\n').map((line, i) => {
                              const trimmedLine = line.trim();
                              if (!trimmedLine) return null;
                              return (
                                <div key={i} className="flex mb-1">
                                  <span className="mr-2">•</span>
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
                          <h3 className="text-[15px] font-bold text-black">
                            {edu.institutionName}
                          </h3>
                          {dur && (
                            <span className="text-[14px] text-black font-semibold">
                              {dur}
                            </span>
                          )}
                        </div>
                        <div className="text-[14.5px] italic text-black">
                          {edu.certification}
                        </div>
                        {edu.summary && (
                          <div className="text-[14px] text-black mt-1 leading-relaxed whitespace-pre-wrap break-words">
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
                          <h3 className="text-[15px] font-bold text-black">
                            {edu.institutionName}
                          </h3>
                          {dur && (
                            <span className="text-[14px] text-black font-semibold">
                              {dur}
                            </span>
                          )}
                        </div>
                        <div className="text-[14.5px] italic text-black">
                          {edu.certification}
                        </div>
                        {edu.summary && (
                          <div className="text-[14px] text-black mt-1 leading-relaxed whitespace-pre-wrap break-words">
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
              <section key="technicalSkills" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('technicalSkills')}>
                <SectionHeader title="Technical Skills" />
                <p className="text-[14px] text-black leading-relaxed">
                  {cvData.technicalSkills.join(", ")}
                </p>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills?.length > 0 ? (
              <section key="softSkills" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Soft Skills" />
                <p className="text-[14px] text-black leading-relaxed">
                  {cvData.softSkills.join(", ")}
                </p>
              </section>
            ) : null,
          language:
            cvData.language?.length > 0 ? (
              <section key="language" className="cv-page-group break-inside-avoid mb-5" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <p className="text-[14px] text-black leading-relaxed">
                  {cvData.language
                    .map((item) =>
                      typeof item === "string"
                        ? item
                        : `${item.name} (${item.level})`,
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
                          <h3 className="text-[15px] font-bold text-black">
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
                            <span className="text-[14px] text-black font-semibold">
                              {dur}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-[14px] text-black leading-relaxed whitespace-pre-wrap break-words mt-1">
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
                          <h3 className="text-[15px] font-bold text-black">
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
                            <span className="text-[14px] text-black font-semibold">
                              {dur}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-[14px] text-black leading-relaxed whitespace-pre-wrap break-words mt-1">
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

export default ATSProvenTemplate;
