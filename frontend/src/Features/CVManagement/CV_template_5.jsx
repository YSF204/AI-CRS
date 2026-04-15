import React from 'react';

const TwoColumnResumeTemplate = ({
  userName = "",
  profileImage,
  cvData
}) => {
  if (!cvData) return null;

  const fmtDuration = (from, to) => {
    if (from && to) return `${from} – ${to}`;
    if (from) return from;
    if (to) return to;
    return '';
  };

  const displayImage = cvData.profileImage || profileImage || null;

  // Separate custom sections for Sidebar vs Main Column based on title
  const sidebarSectionTitles = ['hobbies', 'reference', 'references'];
  const sidebarCustomSections = cvData.customSections?.filter(sec =>
    sidebarSectionTitles.includes(sec.title.toLowerCase())
  ) || [];
  const mainCustomSections = cvData.customSections?.filter(sec =>
    !sidebarSectionTitles.includes(sec.title.toLowerCase())
  ) || [];

  // Reusable Component for the Timeline Items (Experience & Education)
  const TimelineItem = ({ leftText1, leftText2, leftText3, title, description, isLast }) => (
    <div className="flex relative break-inside-avoid">
      <div className="w-[30%] pr-5 text-left pt-0.5">
        <div className="text-gray-800 font-medium text-xs md:text-[13px] uppercase tracking-wide">{leftText1}</div>
        {leftText2 && <div className="text-gray-500 text-xs md:text-[13px]">{leftText2}</div>}
        {leftText3 && <div className="text-gray-400 text-[11px] md:text-[12px] mt-1">{leftText3}</div>}
      </div>
      <div className="relative flex flex-col items-center w-3.5 flex-shrink-0">
        <div className="w-2 h-2 bg-gray-600 rounded-full mt-1.5 z-10"></div>
        {!isLast && <div className="absolute top-3 bottom-[-1.5rem] left-1/2 -translate-x-1/2 w-[1px] bg-gray-300"></div>}
      </div>
      <div className="w-[70%] pl-5 pb-5">
        <h4 className="font-bold text-gray-800 text-xs md:text-[13px] mb-1">{title}</h4>
        {description && (
          <div className="text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{description}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white flex font-sans"
         style={{
           overflowWrap: 'anywhere',
           wordBreak: 'break-word',
           width: '210mm',
           minHeight: '297mm',
           margin: '0 auto',
           boxSizing: 'border-box',
           position: 'relative'
         }}>

      {/* LEFT COLUMN (SIDEBAR) */}
      <div className="w-[32%] bg-[#4b4b4b] text-gray-200 flex flex-col"
           style={{
             minWidth: 0,
             boxSizing: 'border-box',
             padding: '10mm'
           }}>
        {/* Profile Image */}
        <div className="mb-6 flex justify-center">
          {displayImage ? (
            <img src={displayImage} alt={userName} className="w-36 h-36 rounded-full object-cover border-2 border-gray-400" />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-400">
              <span className="text-gray-300 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* ABOUT ME */}
        {cvData.summary && (
          <div className="mb-6">
            <h3 className="uppercase text-xs md:text-sm font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">About Me</h3>
            <p className="text-xs md:text-[13px] leading-relaxed text-gray-300 whitespace-pre-wrap break-words">{cvData.summary}</p>
          </div>
        )}

        {/* LINKS */}
        {(cvData.contact?.linkedin || cvData.contact?.github) && (
          <div className="mb-6">
            <h3 className="uppercase text-xs md:text-sm font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">Links</h3>
            <div className="flex flex-col gap-2.5 text-xs md:text-[13px]">
              {cvData.contact.linkedin && (
                <div>
                  <span className="font-bold text-white block mb-0.5">LinkedIn:</span>
                  <a href={`https://${cvData.contact.linkedin}`} className="text-gray-300 hover:text-white underline break-all">{cvData.contact.linkedin}</a>
                </div>
              )}
              {cvData.contact.github && (
                <div>
                  <span className="font-bold text-white block mb-0.5">GitHub:</span>
                  <a href={`https://${cvData.contact.github}`} className="text-gray-300 hover:text-white underline break-all">{cvData.contact.github}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TECHNICAL SKILLS — simple tags, no fake bars */}
        {cvData.technicalSkills && cvData.technicalSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-xs md:text-sm font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">Technical Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.technicalSkills.map((skill, index) => (
                <span key={index} className="uppercase text-[10px] md:text-[11px] text-gray-300 tracking-wider font-medium bg-gray-600/50 px-2 py-0.5 rounded-sm">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* SOFT SKILLS */}
        {cvData.softSkills && cvData.softSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-xs md:text-sm font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">Soft Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.softSkills.map((skill, index) => (
                <span key={index} className="uppercase text-[10px] md:text-[11px] text-gray-300 tracking-wider font-medium bg-gray-600/50 px-2 py-0.5 rounded-sm">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* LANGUAGES — simple tags, no fake bars */}
        {cvData.language && cvData.language.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-xs md:text-sm font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">Languages</h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.language.map((lang, index) => (
                <span key={index} className="uppercase text-[10px] md:text-[11px] text-gray-300 tracking-wider font-medium bg-gray-600/50 px-2 py-0.5 rounded-sm">{lang}</span>
              ))}
            </div>
          </div>
        )}

        {/* SIDEBAR CUSTOM SECTIONS (Hobbies, References) */}
        {sidebarCustomSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="uppercase text-xs md:text-sm font-bold tracking-widest text-white mb-2.5 border-b border-gray-500 pb-1.5">{section.title}</h3>
            <div className="flex flex-col gap-2 text-xs md:text-[13px] text-gray-300">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx}>
                  {section.title.toLowerCase() === 'hobbies' ? (
                    <span className="uppercase tracking-wider">• {item.name}</span>
                  ) : (
                    <>
                      <div className="font-bold text-white uppercase">{item.name}</div>
                      {item.description && <div className="whitespace-pre-wrap break-words">{item.description}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN (MAIN CONTENT) */}
      <div className="w-[68%] flex flex-col"
           style={{
             minWidth: 0,
             boxSizing: 'border-box',
             padding: '10mm'
           }}>
        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-[32px] md:text-[36px] font-black uppercase text-gray-700 leading-none mb-2 tracking-tight">
              {userName.split(' ').map((name, i) => (
                <span key={i} className="block">{name}</span>
              ))}
            </h1>
            <h2 className="text-xs md:text-[13px] font-bold uppercase tracking-[0.2em] text-gray-500">{cvData.jobTitle}</h2>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] md:text-[12px] text-gray-500 text-right">
            {(cvData.address?.street || cvData.address?.city) && (
              <div className="flex items-center justify-end gap-2">
                <span>{[cvData.address.street, cvData.address.city].filter(Boolean).join(', ')}</span>
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              </div>
            )}
            {cvData.contact?.phone && (
              <div className="flex items-center justify-end gap-2">
                <span>{cvData.contact.phone}</span>
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              </div>
            )}
            {cvData.contact?.email && (
              <div className="flex items-center justify-end gap-2">
                <span>{cvData.contact.email}</span>
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
              </div>
            )}
          </div>
        </div>

        {(() => {
          const mainBlocks = {
            experience: cvData.experience && cvData.experience.length > 0 ? (
              <div key="experience" className="break-inside-avoid mb-5">
                <h3 className="uppercase text-xs md:text-[14px] font-bold tracking-widest text-gray-800 mb-5 border-b border-gray-400 pb-1">Work Experience</h3>
                <div className="block">
                  {cvData.experience.map((exp, index) => {
                    const dur = fmtDuration(exp.durationFrom, exp.durationTo);
                    return (
                      <TimelineItem
                        key={index}
                        leftText1={exp.institutionName}
                        leftText2={""}
                        leftText3={dur}
                        title={exp.position}
                        description={exp.summary}
                        isLast={index === cvData.experience.length - 1}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null,
            education: cvData.education && cvData.education.length > 0 ? (
              <div key="education" className="break-inside-avoid mb-5">
                <h3 className="uppercase text-xs md:text-[14px] font-bold tracking-widest text-gray-800 mb-5 border-b border-gray-400 pb-1">Education</h3>
                <div className="block">
                  {cvData.education.map((edu, index) => {
                    const dur = fmtDuration(edu.durationFrom, edu.durationTo);
                    return (
                      <TimelineItem
                        key={index}
                        leftText1={edu.institutionName}
                        leftText2={""}
                        leftText3={dur}
                        title={edu.certification}
                        description={edu.summary}
                        isLast={index === cvData.education.length - 1}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null,
          };

          const sectionOrder = cvData.layout?.sectionOrder || ['experience', 'education', 'customSections', 'technicalSkills', 'softSkills', 'language'];

          return sectionOrder.map(key => {
            if (key === 'customSections' && mainCustomSections.length > 0) {
              return mainCustomSections.map((section, idx) => (
                <div key={`custom-${idx}`} className="break-inside-avoid mb-5">
                  <h3 className="uppercase text-xs md:text-[14px] font-bold tracking-widest text-gray-800 mb-5 border-b border-gray-400 pb-1">{section.title}</h3>
                  <div className="block">
                    {section.items.map((item, itemIdx) => {
                      const dur = fmtDuration(item.durationFrom, item.durationTo);
                      return (
                        <TimelineItem
                          key={itemIdx}
                          leftText1={dur}
                          leftText2={""}
                          leftText3={""}
                          title={item.link ? (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.name}</a>
                          ) : item.name}
                          description={item.description}
                          isLast={itemIdx === section.items.length - 1}
                        />
                      );
                    })}
                  </div>
                </div>
              ));
            }
            if (key === 'summary') return null;
            if (key === 'technicalSkills' || key === 'softSkills' || key === 'language') return null; // rendered in sidebar
            return mainBlocks[key];
          });
        })()}
      </div>
    </div>
  );
};

export default TwoColumnResumeTemplate;