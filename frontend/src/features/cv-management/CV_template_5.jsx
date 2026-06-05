import React, { useRef, useState, useEffect } from "react";
import { getSocialIcon, getSocialName } from "./SocialIcons";

// 297 mm expressed in CSS pixels at 96 DPI (the browser standard).
// Used to snap the outer container to whole-page multiples so the
// dark sidebar always fills to the bottom of the last page.
const PAGE_HEIGHT_PX = (297 * 96) / 25.4;

const TimelineItem = ({
  leftText1,
  leftText2,
  leftText3,
  title,
  description,
  isLast,
  highlightStyle = {},
}) => (
  <div className="flex relative break-inside-avoid" style={highlightStyle}>
    <div className="w-[30%] pr-5 text-left pt-0.5">
      <div className="text-gray-800 font-medium text-xs md:text-[13px] uppercase tracking-wide">
        {leftText1}
      </div>
      {leftText2 && (
        <div className="text-gray-500 text-xs md:text-[13px]">
          {leftText2}
        </div>
      )}
      {leftText3 && (
        <div className="text-gray-400 text-[11px] md:text-[12px] mt-1">
          {leftText3}
        </div>
      )}
    </div>
    <div className="relative flex flex-col items-center w-3.5 flex-shrink-0">
      <div className="w-2 h-2 bg-gray-600 rounded-full mt-1.5 z-10"></div>
      {!isLast && (
        <div className="absolute top-3 bottom-[-1.5rem] left-1/2 -translate-x-1/2 w-[1px] bg-gray-300"></div>
      )}
    </div>
    <div className="w-[70%] pl-5 pb-5">
      <h4 className="font-bold text-gray-800 text-xs md:text-[13px] mb-1">
        {title}
      </h4>
      {description && (
        <div className="text-[13px] md:text-[13.5px] text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
          {description}
        </div>
      )}
    </div>
  </div>
);

const TwoColumnResumeTemplate = ({ userName = "", profileImage, cvData, highlights = {} }) => {
  if (!cvData) return null;

  // ── Page-snapping logic ──────────────────────────────────────────────────
  // We watch the outer container with a ResizeObserver.  Whenever the
  // rendered height changes we round it UP to the nearest 297 mm page
  // boundary and store that as minHeight.  This makes the dark sidebar
  // background fill all the way to the bottom of page 2 (or 3, …) even
  // when the right-column content doesn't reach the page foot.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const containerRef = useRef(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [minHeightMM, setMinHeightMM] = useState(297);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalc = () => {
      // scrollHeight gives us the true content height regardless of
      // what minHeight is set to, as long as we measure BEFORE we
      // update state.  ResizeObserver runs after paint so by the time
      // it fires the previous minHeight is already applied; we need
      // the content height, which equals scrollHeight when the element
      // is not overflowed (flex stretch).  This converges in ≤2 frames.
      const contentH = el.scrollHeight;
      const pages    = Math.max(1, Math.ceil(contentH / PAGE_HEIGHT_PX));
      const newMM    = pages * 297;
      setMinHeightMM(prev => (prev === newMM ? prev : newMM));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  // Re-run whenever cvData changes so a newly added section is measured.
  }, [cvData]);

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

  const displayImage = cvData.profileImage || profileImage || null;

  // Separate custom sections for Sidebar vs Main Column based on title
  const sidebarSectionTitles = ["hobbies", "reference", "references"];
  const sidebarCustomSections =
    cvData.customSections?.filter((sec) =>
      sidebarSectionTitles.includes(sec.title.toLowerCase()),
    ) || [];
  const mainCustomSections =
    cvData.customSections?.filter(
      (sec) => !sidebarSectionTitles.includes(sec.title.toLowerCase()),
    ) || [];

  return (
    <div
      ref={containerRef}
      className="flex font-sans"
      style={{
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        width: "210mm",
        // Snapped to the nearest whole-page multiple by the ResizeObserver
        // above — guarantees the dark sidebar fills to the page foot.
        minHeight: `${minHeightMM}mm`,
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        // The sidebar background lives on the OUTER container so it
        // always fills the full minHeight, not just the sidebar content.
        background: "linear-gradient(to right, #4b4b4b 32%, #ffffff 32%)",
      }}
    >
      {/* LEFT COLUMN (SIDEBAR) */}
      {/* bg colour comes from the outer container gradient — no need for bg-[#4b4b4b] here */}
      <div
        className="w-[32%] text-gray-200 flex flex-col"
        style={{
          minWidth: 0,
          boxSizing: "border-box",
          padding: "10mm",
        }}
      >
        {/* Profile Image */}
        <div className="mb-6 flex justify-center">
          {displayImage ? (
            <img
              src={displayImage}
              alt={userName}
              className="w-36 h-36 rounded-full object-cover border-2 border-gray-400"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-400">
              <span className="text-gray-300 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* ABOUT ME */}
        {cvData.summary && (
          <div className="mb-4 break-inside-avoid" style={getHighlightStyle('summary')}>
            <h3 className="uppercase text-[13px] md:text-[13.5px] font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">
              About Me
            </h3>
            <p className="text-xs md:text-[13px] leading-relaxed text-gray-300 whitespace-pre-wrap break-words">
              {cvData.summary}
            </p>
          </div>
        )}

        {/* LINKS */}
        {(cvData.contact?.linkedin || cvData.contact?.github || (cvData.contact?.customLinks && cvData.contact.customLinks.length > 0)) && (
          <div className="mb-4 break-inside-avoid">
            <h3 className="uppercase text-[13px] md:text-[13.5px] font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">
              Links
            </h3>
            <div className="flex flex-col gap-2.5 text-xs md:text-[13px]">
              {cvData.contact.linkedin && (
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    LinkedIn:
                  </span>
                  <a
                    href={`https://${cvData.contact.linkedin}`}
                    className="text-gray-300 hover:text-white underline break-all"
                  >
                    {cvData.contact.linkedin}
                  </a>
                </div>
              )}
              {cvData.contact.github && (
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    GitHub:
                  </span>
                  <a
                    href={`https://${cvData.contact.github}`}
                    className="text-gray-300 hover:text-white underline break-all"
                  >
                    {cvData.contact.github}
                  </a>
                </div>
              )}
              {(cvData.contact.customLinks || []).map((link, i) => (
                link.url && (
                  <div key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-gray-300 underline break-all"
                    >
                      {getSocialName(link.icon)}
                    </a>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* TECHNICAL SKILLS — simple tags, no fake bars */}
        {cvData.technicalSkills && cvData.technicalSkills.length > 0 && (
          <div className="mb-4 break-inside-avoid" style={getHighlightStyle('technicalSkills')}>
            <h3 className="uppercase text-[13px] md:text-[13.5px] font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.technicalSkills.map((skill, index) => (
                <span
                  key={index}
                  className="uppercase text-[10px] md:text-[11px] text-gray-300 tracking-wider font-medium bg-gray-600/50 px-2 py-0.5 rounded-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SOFT SKILLS */}
        {cvData.softSkills && cvData.softSkills.length > 0 && (
          <div className="mb-4 break-inside-avoid" style={getHighlightStyle('softSkills')}>
            <h3 className="uppercase text-[13px] md:text-[13.5px] font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.softSkills.map((skill, index) => (
                <span
                  key={index}
                  className="uppercase text-[10px] md:text-[11px] text-gray-300 tracking-wider font-medium bg-gray-600/50 px-2 py-0.5 rounded-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* LANGUAGES — simple tags, no fake bars */}
        {cvData.language && cvData.language.length > 0 && (
          <div className="mb-4 break-inside-avoid" style={getHighlightStyle('language')}>
            <h3 className="uppercase text-[13px] md:text-[13.5px] font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">
              Languages
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.language.map((item, index) => {
                const displayText =
                  typeof item === "string"
                    ? item
                    : `${item.name} — ${item.level}`;
                return (
                  <span
                    key={index}
                    className="uppercase text-[10px] md:text-[11px] text-gray-300 tracking-wider font-medium bg-gray-600/50 px-2 py-0.5 rounded-sm"
                  >
                    {displayText}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* SIDEBAR CUSTOM SECTIONS (Hobbies, References) */}
        {sidebarCustomSections.map((section, idx) => (
          <div key={idx} className="mb-4 break-inside-avoid">
            <h3 className="uppercase text-[13px] md:text-[13.5px] font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">
              {section.title}
            </h3>
            <div className="flex flex-col gap-2 text-xs md:text-[13px] text-gray-300">
              {section.items.map((item, itemIdx) => {
                const realSectionIdx = cvData.customSections.indexOf(section);
                return (
                  <div 
                    key={itemIdx}
                    style={getHighlightStyle(`customSections_${realSectionIdx}_items_${itemIdx}_description`)}
                    className="p-1"
                  >
                    {section.title.toLowerCase() === "hobbies" ? (
                      <span className="uppercase tracking-wider">
                        • {item.name}
                      </span>
                    ) : (
                      <>
                        <div className="font-bold text-white uppercase">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="whitespace-pre-wrap break-words">
                            {item.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN (MAIN CONTENT) */}
      <div
        className="w-[68%] flex flex-col"
        style={{
          minWidth: 0,
          boxSizing: "border-box",
          padding: "10mm",
        }}
      >
        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-[28px] md:text-[32px] font-black uppercase text-gray-700 leading-none mb-2 tracking-tight">
              {userName.split(" ").map((name, i) => (
                <span key={i} className="block">
                  {name}
                </span>
              ))}
            </h1>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] md:text-[12px] text-gray-500 text-right">
            {(cvData.address?.street || cvData.address?.city) && (
              <div className="flex items-center justify-end gap-2">
                <span>
                  {[cvData.address.street, cvData.address.city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                <svg
                  className="w-4 h-4 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {cvData.contact?.phone && (
              <div className="flex items-center justify-end gap-2">
                <span>{cvData.contact.phone}</span>
                <svg
                  className="w-4 h-4 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
            )}
            {cvData.contact?.email && (
              <div className="flex items-center justify-end gap-2">
                <span>{cvData.contact.email}</span>
                <svg
                  className="w-4 h-4 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {(() => {
          const mainBlocks = {
            experience:
              cvData.experience && cvData.experience.length > 0 ? (
                <div key="experience" className="cv-page-group mb-5">
                  <div className="break-inside-avoid">
                    <h3 className="uppercase text-xs md:text-[14px] font-bold tracking-widest text-gray-800 mb-5 border-b border-gray-400 pb-1">
                      Work Experience
                    </h3>
                    {cvData.experience.slice(0, 1).map((exp, index) => {
                      const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                      return (
                        <TimelineItem
                          key={index}
                          leftText1={exp.institutionName}
                          leftText2={""}
                          leftText3={dur}
                          title={exp.position}
                          description={exp.summary}
                          isLast={cvData.experience.length === 1}
                          highlightStyle={getHighlightStyle(`experience_${index}_institutionName`, `experience_${index}_position`, `experience_${index}_summary`)}
                        />
                      );
                    })}
                  </div>
                  <div className="block">
                    {cvData.experience.slice(1).map((exp, index) => {
                      const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                      return (
                        <TimelineItem
                          key={index + 1}
                          leftText1={exp.institutionName}
                          leftText2={""}
                          leftText3={dur}
                          title={exp.position}
                          description={exp.summary}
                          isLast={index + 1 === cvData.experience.length - 1}
                          highlightStyle={getHighlightStyle(`experience_${index + 1}_institutionName`, `experience_${index + 1}_position`, `experience_${index + 1}_summary`)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null,
            education:
              cvData.education && cvData.education.length > 0 ? (
                <div key="education" className="cv-page-group mb-5">
                  <div className="break-inside-avoid">
                    <h3 className="uppercase text-xs md:text-[14px] font-bold tracking-widest text-gray-800 mb-5 border-b border-gray-400 pb-1">
                      Education
                    </h3>
                    {cvData.education.slice(0, 1).map((edu, index) => {
                      const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                      return (
                        <TimelineItem
                          key={index}
                          leftText1={edu.institutionName}
                          leftText2={""}
                          leftText3={dur}
                          title={edu.certification}
                          description={edu.summary}
                          isLast={cvData.education.length === 1}
                          highlightStyle={getHighlightStyle(`education_${index}_institutionName`, `education_${index}_certification`, `education_${index}_summary`)}
                        />
                      );
                    })}
                  </div>
                  <div className="block">
                    {cvData.education.slice(1).map((edu, index) => {
                      const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                      return (
                        <TimelineItem
                          key={index + 1}
                          leftText1={edu.institutionName}
                          leftText2={""}
                          leftText3={dur}
                          title={edu.certification}
                          description={edu.summary}
                          isLast={index + 1 === cvData.education.length - 1}
                          highlightStyle={getHighlightStyle(`education_${index + 1}_institutionName`, `education_${index + 1}_certification`, `education_${index + 1}_summary`)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null,
          };

          const sectionOrder = cvData.layout?.sectionOrder || [
            "experience",
            "education",
            "customSections",
            "technicalSkills",
            "softSkills",
            "language",
          ];

          return sectionOrder.map((key) => {
            const isCustom = key.startsWith("customSection__");
            const isLegacyCustom = key === "customSections";
            if (isCustom || isLegacyCustom) {
              const sectionIdx = isCustom ? parseInt(key.replace("customSection__", ""), 10) : -1;
              const sectionsToRender = isCustom
                ? [cvData.customSections[sectionIdx]].filter(Boolean).filter(
                    (sec) => !sidebarSectionTitles.includes(sec.title.toLowerCase())
                  )
                : mainCustomSections;
              if (!sectionsToRender || sectionsToRender.length === 0) return null;
              return sectionsToRender.map((section, loopIdx) => {
                const realSectionIdx = cvData.customSections.indexOf(section);
                return (
                  <div key={`custom-${loopIdx}`} className="cv-page-group mb-5">
                    <div className="break-inside-avoid">
                      <h3 className="uppercase text-xs md:text-[14px] font-bold tracking-widest text-gray-800 mb-5 border-b border-gray-400 pb-1">
                        {section.title}
                      </h3>
                      {section.items.slice(0, 1).map((item, itemIdx) => {
                        const dur = fmtDuration(
                          item.durationFrom,
                          item.durationTo,
                        );
                        return (
                          <TimelineItem
                            key={itemIdx}
                            leftText1={dur}
                            leftText2={""}
                            leftText3={""}
                            highlightStyle={getHighlightStyle(`customSections_${realSectionIdx}_items_${itemIdx}_description`)}
                            title={
                              item.link ? (
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
                              )
                            }
                            description={item.description}
                            isLast={section.items.length === 1}
                          />
                        );
                      })}
                    </div>
                    <div className="block">
                      {section.items.slice(1).map((item, itemIdx) => {
                        const dur = fmtDuration(
                          item.durationFrom,
                          item.durationTo,
                        );
                        return (
                          <TimelineItem
                            key={itemIdx + 1}
                            leftText1={dur}
                            leftText2={""}
                            leftText3={""}
                            highlightStyle={getHighlightStyle(`customSections_${realSectionIdx}_items_${itemIdx + 1}_description`)}
                            title={
                              item.link ? (
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
                              )
                            }
                            description={item.description}
                            isLast={itemIdx + 1 === section.items.length - 1}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              });
            }
            if (key === "summary") return null;
            if (
              key === "technicalSkills" ||
              key === "softSkills" ||
              key === "language"
            )
              return null; // rendered in sidebar
            return mainBlocks[key];
          });
        })()}
      </div>
    </div>
  );
};

export default TwoColumnResumeTemplate;
