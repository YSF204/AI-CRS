import React from 'react';
import ysf from "../../assets/Yousef.png"
const TwoColumnResumeTemplate = ({
  userName = "SHERLOCK HOLMES",
  profileImage = ysf, // Pass an image URL here
  cvData
}) => {
  if (!cvData) return null;

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
    <div className="flex relative">
      {/* Left side (Dates, Company, Location) */}
      <div className="w-[30%] pr-6 text-left pt-0.5">
        <div className="text-gray-800 font-medium text-[13px] uppercase tracking-wide">{leftText1}</div>
        <div className="text-gray-500 text-[13px]">{leftText2}</div>
        <div className="text-gray-400 text-[12px] mt-1">{leftText3}</div>
      </div>

      {/* Center Timeline Divider */}
      <div className="relative flex flex-col items-center w-4 flex-shrink-0">
        <div className="w-2.5 h-2.5 bg-gray-600 rounded-full mt-1.5 z-10"></div>
        {!isLast && <div className="absolute top-3 bottom-[-1.5rem] left-1/2 -translate-x-1/2 w-[1.5px] bg-gray-300"></div>}
      </div>

      {/* Right side (Title & Summary) */}
      <div className="w-[70%] pl-6 pb-6">
        <h4 className="font-bold text-gray-800 text-[15px] mb-1.5">{title}</h4>
        {description && (
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {description}
          </div>
        )}
      </div>
    </div>
  );

  // Reusable Component for Skill Bars
  const SkillBar = ({ name }) => (
    <div className="mb-4">
      <div className="uppercase text-[11px] text-gray-600 tracking-widest font-bold mb-1.5">{name}</div>
      <div className="h-1 bg-gray-200 w-full">
        <div className="h-full bg-gray-600 w-[85%]"></div> {/* 85% is simulated since schema lacks proficiency levels */}
      </div>
    </div>
  );

  return (
    <div className="max-w-[950px] mx-auto bg-white flex shadow-lg font-sans min-h-[1100px]">

      {/* LEFT COLUMN (SIDEBAR) */}
      <div className="w-[32%] bg-[#4b4b4b] text-gray-200 p-8 flex flex-col">
        {/* Profile Image */}
        <div className="mb-8 flex justify-center">
          {profileImage ? (
            <img
              src={ysf}
              alt={userName}
              className="w-40 h-40 rounded-full object-cover border-2 border-gray-400"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-400">
              <span className="text-gray-300 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* ABOUT ME */}
        {cvData.summary && (
          <div className="mb-8">
            <h3 className="uppercase text-sm font-bold tracking-widest text-white mb-3 border-b border-gray-500 pb-2">
              About Me
            </h3>
            <p className="text-[13px] leading-relaxed text-gray-300 text-justify">
              {cvData.summary}
            </p>
          </div>
        )}

        {/* LINKS */}
        {(cvData.contact?.linkedin || cvData.contact?.github) && (
          <div className="mb-8">
            <h3 className="uppercase text-sm font-bold tracking-widest text-white mb-3 border-b border-gray-500 pb-2">
              Links
            </h3>
            <div className="flex flex-col gap-3 text-[13px]">
              {cvData.contact.linkedin && (
                <div>
                  <span className="font-bold text-white block mb-0.5">LinkedIn:</span>
                  <a href={`https://${cvData.contact.linkedin}`} className="text-gray-300 hover:text-white underline break-all">
                    {cvData.contact.linkedin}
                  </a>
                </div>
              )}
              {cvData.contact.github && (
                <div>
                  <span className="font-bold text-white block mb-0.5">GitHub:</span>
                  <a href={`https://${cvData.contact.github}`} className="text-gray-300 hover:text-white underline break-all">
                    {cvData.contact.github}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SIDEBAR CUSTOM SECTIONS (Hobbies, References) */}
        {sidebarCustomSections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="uppercase text-sm font-bold tracking-widest text-white mb-3 border-b border-gray-500 pb-2">
              {section.title}
            </h3>
            <div className="flex flex-col gap-2 text-[13px] text-gray-300">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx}>
                  {section.title.toLowerCase() === 'hobbies' ? (
                    <span className="uppercase tracking-wider">• {item.name}</span>
                  ) : (
                    <>
                      <div className="font-bold text-white uppercase">{item.name}</div>
                      {item.description && <div className="whitespace-pre-line">{item.description}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN (MAIN CONTENT) */}
      <div className="w-[68%] p-10 flex flex-col">

        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1">
            <h1 className="text-4xl font-black uppercase text-gray-700 leading-none mb-2 tracking-tight">
              {userName.split(' ').map((name, i) => (
                <span key={i} className="block">{name}</span>
              ))}
            </h1>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-gray-500">
              {cvData.jobTitle}
            </h2>
          </div>

          <div className="flex flex-col gap-2 text-[12px] text-gray-500 text-right">
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

        {/* WORK EXPERIENCE */}
        {cvData.experience && cvData.experience.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-[14px] font-bold tracking-widest text-gray-800 mb-6 border-b border-gray-400 pb-1">
              Work Experience
            </h3>
            <div className="flex flex-col">
              {cvData.experience.map((exp, index) => (
                <TimelineItem
                  key={index}
                  leftText1={exp.institutionName}
                  leftText2={""} // Location isn't native to schema experience block, left blank or mapping
                  leftText3={exp.duration}
                  title={exp.position}
                  description={exp.summary}
                  isLast={index === cvData.experience.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {cvData.education && cvData.education.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-[14px] font-bold tracking-widest text-gray-800 mb-6 border-b border-gray-400 pb-1">
              Education
            </h3>
            <div className="flex flex-col">
              {cvData.education.map((edu, index) => (
                <TimelineItem
                  key={index}
                  leftText1={edu.institutionName}
                  leftText2={""}
                  leftText3={edu.duration}
                  title={edu.certification}
                  description={edu.summary}
                  isLast={index === cvData.education.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* MAIN CUSTOM SECTIONS */}
        {mainCustomSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="uppercase text-[14px] font-bold tracking-widest text-gray-800 mb-6 border-b border-gray-400 pb-1">
              {section.title}
            </h3>
            <div className="flex flex-col">
              {section.items.map((item, itemIdx) => (
                <TimelineItem
                  key={itemIdx}
                  leftText1={item.name}
                  leftText2={item.link ? "Link Available" : ""}
                  leftText3={item.duration}
                  title={item.name}
                  description={item.description}
                  isLast={itemIdx === section.items.length - 1}
                />
              ))}
            </div>
          </div>
        ))}

        {/* SKILLS */}
        {cvData.technicalSkills && cvData.technicalSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-[14px] font-bold tracking-widest text-gray-800 mb-4 border-b border-gray-400 pb-1">
              Skills
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {cvData.technicalSkills.map((skill, index) => (
                <SkillBar key={index} name={skill} />
              ))}
            </div>
          </div>
        )}

        {/* LANGUAGES */}
        {cvData.language && cvData.language.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-[14px] font-bold tracking-widest text-gray-800 mb-4 border-b border-gray-400 pb-1">
              Languages
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {cvData.language.map((lang, index) => (
                <SkillBar key={index} name={lang} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TwoColumnResumeTemplate;