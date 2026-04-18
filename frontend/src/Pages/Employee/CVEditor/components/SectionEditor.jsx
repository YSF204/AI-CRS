import React from "react";
import SummarySection from "./sections/SummarySection";
import ContactSection from "./sections/ContactSection";
import AddressSection from "./sections/AddressSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import LanguageSection from "./sections/LanguageSection";

export default function SectionEditor({
  section,
  form,
  handlers,
  handleImageUpload,
  removeProfileImage,
}) {
  const renderSection = () => {
    switch (section) {
      case "summary":
        return <SummarySection form={form} handlers={handlers} />;
      case "contact":
        return <ContactSection form={form} handlers={handlers} />;
      case "address":
        return <AddressSection form={form} handlers={handlers} />;
      case "experience":
        return <ExperienceSection form={form} handlers={handlers} />;
      case "education":
        return <EducationSection form={form} handlers={handlers} />;
      case "technicalSkills":
        return (
          <SkillsSection type="technical" form={form} handlers={handlers} />
        );
      case "softSkills":
        return <SkillsSection type="soft" form={form} handlers={handlers} />;
      case "language":
        return <LanguageSection form={form} handlers={handlers} />;
      default:
        return <div>Section not implemented</div>;
    }
  };

  return <div className="section-editor space-y-6">{renderSection()}</div>;
}
