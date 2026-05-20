import React from "react";
import { getSocialIcon, getSocialName } from "./SocialIcons";

const CenteredFormalTemplate = ({ userName = "", cvData, highlights = {} }) => {
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
    <div className="my-3">
      <hr className="border-t-2 border-gray-300 mb-2" />
      <h2 className="text-center text-xs md:text-sm font-bold uppercase tracking-widest text-gray-800">
        {title}
      </h2>
      <hr className="border-t-2 border-gray-300 mt-2" />
    </div>
  );

  return (
    <div
      className="bg-white text-gray-800 font-sans"
      style={{
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        width: "210mm",
        height: "297mm",
        maxHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        padding: "12mm", // Adjusted padding
      }}
    >
      <header className="text-center mb-3">
        <h1 className="text-[26px] md:text-[30px] font-bold uppercase tracking-wide text-gray-900 mb-1.5">
          {userName}
        </h1>

        <div className="border-y border-gray-300 py-1.5 mb-1">
          <div className="flex flex-wrap justify-center items-center gap-1 text-xs md:text-sm text-gray-700">
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < contactItems.length - 1 && (
                  <span className="text-gray-400 font-light px-1">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid" style={getHighlightStyle('summary')}>
              <SectionHeader title="Career Summary" />
              <p className="text-[13px] md:text-sm text-gray-800 leading-[1.6] text-left whitespace-pre-wrap break-words">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          technicalSkills:
            cvData.technicalSkills && cvData.technicalSkills.length > 0 ? (
              <section key="technicalSkills" className="break-inside-avoid" style={getHighlightStyle('technicalSkills')}>
                <SectionHeader title="Technical Strengths" />
                <ul className="grid grid-cols-3 gap-y-1 gap-x-2 pl-4 text-xs md:text-sm text-gray-800 list-disc">
                  {cvData.technicalSkills.map((skill, index) => (
                    <li key={index} className="pl-1">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills && cvData.softSkills.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Core Competencies" />
                <ul className="grid grid-cols-3 gap-y-1 gap-x-2 pl-4 text-xs md:text-sm text-gray-800 list-disc">
                  {cvData.softSkills.map((skill, index) => (
                    <li key={index} className="pl-1">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          language:
            cvData.language && cvData.language.length > 0 ? (
              <section key="language" className="break-inside-avoid" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <ul className="grid grid-cols-3 gap-y-1 gap-x-2 pl-4 text-xs md:text-sm text-gray-800 list-disc">
                  {cvData.language.map((item, index) => {
                    const displayText =
                      typeof item === "string"
                        ? item
                        : `${item.name} — ${item.level}`;
                    return (
                      <li key={index} className="pl-1">
                        {displayText}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="">
                <SectionHeader title="Professional Experience" />
                <div className="space-y-3 block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <div className="text-[13px] md:text-sm text-gray-800 mb-1">
                          <span className="font-bold text-gray-900">{exp.position}</span>
                          {exp.institutionName && (
                            <span> | {exp.institutionName}</span>
                          )}
                          {dur && <span> | {dur}</span>}
                        </div>
                        {exp.summary && (
                          <div className="text-[13px] md:text-sm text-gray-800 leading-[1.6] whitespace-pre-wrap break-words ml-2 border-l-2 border-gray-200 pl-2">
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
              <section key="education" className="">
                <SectionHeader title="Education" />
                <div className="space-y-3 block">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}>
                        <div className="text-xs md:text-sm text-gray-800 mb-1.5">
                          <span className="font-bold">{edu.certification}</span>
                          {edu.institutionName && (
                            <span> | {edu.institutionName}</span>
                          )}
                          {dur && <span> | {dur}</span>}
                        </div>
                        {edu.summary && (
                          <div className="text-xs md:text-sm text-gray-800 leading-[1.6] whitespace-pre-wrap break-words ml-3">
                            {edu.summary}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null,
        };

        const sectionOrder = cvData.layout?.sectionOrder || [
          "summary",
          "technicalSkills",
          "softSkills",
          "language",
          "experience",
          "education",
          "customSections",
        ];

        return sectionOrder.map((key) => {
          if (key === "customSections" && cvData.customSections?.length > 0) {
            return cvData.customSections.map((section, sectionIndex) => (
              <section
                key={`custom-${sectionIndex}`}
                className=""
              >
                <SectionHeader title={section.title} />
                <div className="space-y-2.5 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div 
                        key={itemIndex} 
                        className="break-inside-avoid"
                        style={getHighlightStyle(`customSections_${sectionIndex}_items_${itemIndex}_description`)}
                      >
                        <div className="text-xs md:text-sm text-gray-800 mb-0.5">
                          <span className="font-bold">
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
                          </span>
                          {dur && <span> | {dur}</span>}
                        </div>
                        {item.description && (
                          <div className="text-xs md:text-sm text-gray-800 leading-[1.6] whitespace-pre-wrap break-words ml-3">
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
          if (key === "skills") return null;
          return sectionBlocks[key];
        });
      })()}
    </div>
  );
};

export default CenteredFormalTemplate;
