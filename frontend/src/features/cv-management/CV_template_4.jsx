import React from "react";
import { getSocialIcon, getSocialName } from "./SocialIcons";

const BlueAccentResumeTemplate = ({ userName = "", profileImage, cvData, highlights = {} }) => {
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
  if (cvData.address?.street || cvData.address?.city) {
    const location = [cvData.address.street, cvData.address.city]
      .filter(Boolean)
      .join(", ");
    if (location) contactItems.push(location);
  }
  if (cvData.contact?.phone) contactItems.push(cvData.contact.phone);
  if (cvData.contact?.email) contactItems.push(cvData.contact.email);
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
    <div className="border-y-[1.5px] border-blue-400/60 py-1 mb-2 mt-4">
      <h2 className="text-[13px] md:text-[14px] font-bold uppercase text-blue-600 tracking-wider">
        {title}
      </h2>
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
      <header className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h1 className="text-[26px] md:text-[30px] font-extrabold text-blue-600 uppercase mb-1">
            {userName}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-[13px] md:text-[14px] text-gray-700">
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                <span>{item}</span>
                {index < contactItems.length - 1 && (
                  <span className="text-gray-400">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {profileImage && (
          <div className="w-24 h-28 flex-shrink-0">
            <img
              src={profileImage}
              alt={userName}
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
      </header>

      {(() => {
        const sectionBlocks = {
          summary: cvData.summary ? (
            <section key="summary" className="break-inside-avoid" style={getHighlightStyle('summary')}>
              <SectionHeader title="Summary" />
              <p className="text-[13px] md:text-[14px] text-gray-800 leading-relaxed text-justify whitespace-pre-wrap break-words">
                {cvData.summary}
              </p>
            </section>
          ) : null,
          experience:
            cvData.experience && cvData.experience.length > 0 ? (
              <section key="experience" className="">
                <SectionHeader title="Professional Experience" />
                <div className="space-y-3.5 block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}>
                        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                          <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-900">
                            {exp.position}
                            {exp.institutionName
                              ? `, ${exp.institutionName}`
                              : ""}
                          </h3>
                          {dur && (
                            <div className="text-[13px] md:text-[14px] text-gray-900 font-bold sm:text-right mt-1 sm:mt-0">
                              {dur}
                            </div>
                          )}
                        </div>
                        {exp.summary && (
                          <div className="text-[13px] md:text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3 mt-1">
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
                <div className="space-y-3.5 block">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <div key={index} className="break-inside-avoid" style={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}>
                        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-0.5">
                          <h3 className="text-[13.5px] md:text-[14px] font-bold text-gray-900">
                            {edu.certification}
                          </h3>
                          {dur && (
                            <div className="text-[13px] md:text-[14px] text-gray-900 font-bold sm:text-right mt-1 sm:mt-0">
                              {dur}
                            </div>
                          )}
                        </div>
                        {edu.institutionName && (
                          <p className="text-[13px] md:text-[14px] text-gray-800 mb-1">
                            {edu.institutionName}
                          </p>
                        )}
                        {edu.summary && (
                          <div className="text-[13px] md:text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words ml-3">
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
            cvData.technicalSkills && cvData.technicalSkills.length > 0 ? (
              <section key="technicalSkills" className="break-inside-avoid" style={getHighlightStyle('technicalSkills')}>
                <SectionHeader title="Technical Skills" />
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-3 text-[13px] md:text-[14px] text-gray-700">
                  {cvData.technicalSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </section>
            ) : null,
          softSkills:
            cvData.softSkills && cvData.softSkills.length > 0 ? (
              <section key="softSkills" className="break-inside-avoid" style={getHighlightStyle('softSkills')}>
                <SectionHeader title="Soft Skills" />
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-3 text-[13px] md:text-[14px] text-gray-700">
                  {cvData.softSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </section>
            ) : null,
          language:
            cvData.language && cvData.language.length > 0 ? (
              <section key="language" className="break-inside-avoid" style={getHighlightStyle('language')}>
                <SectionHeader title="Languages" />
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-1 gap-x-3 text-[13px] md:text-[14px] text-gray-700">
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
            return cvData.customSections.map((section, sectionIndex) => (
              <section
                key={`custom-${sectionIndex}`}
                className=""
              >
                <SectionHeader title={section.title} />
                <div className="space-y-2 block">
                  {section.items.map((item, itemIndex) => {
                    const dur = fmtDuration(item.durationFrom, item.durationTo);
                    return (
                      <div
                        key={itemIndex}
                        className="text-[13px] md:text-[14px] text-gray-800 break-inside-avoid"
                        style={getHighlightStyle(`customSections_${sectionIndex}_items_${itemIndex}_description`)}
                      >
                        <span className="font-bold text-gray-900 mr-2">
                          •{" "}
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
                          {dur ? ` | ${dur}` : ""}:
                        </span>
                        <span>{item.description}</span>
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

export default BlueAccentResumeTemplate;
