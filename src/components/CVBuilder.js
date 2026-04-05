import React, { useState } from 'react';

const CVBuilder = () => {
  const [customSection, setCustomSection] = useState('');
  const [customFields, setCustomFields] = useState([]);

  const handleCustomSectionChange = (value) => {
    setCustomSection(value);
    if (value === 'projects') {
      setCustomFields(['Project Name', 'Description', 'Technologies Used']);
    } else if (value === 'hobbies') {
      setCustomFields(['Hobby Name', 'Description', 'Years of Experience']);
    } else if (value === 'others') {
      setCustomFields(['Section Name', 'Custom Field 1', 'Custom Field 2']);
    } else {
      setCustomFields([]);
    }
  };

  return (
    <div>
      <select onChange={(e) => handleCustomSectionChange(e.target.value)}>
        <option value="">Select Custom Section</option>
        <option value="projects">Projects</option>
        <option value="hobbies">Hobbies</option>
        <option value="others">Others</option>
      </select>
      {customFields.map((field, index) => (
        <input key={index} placeholder={field} />
      ))}
    </div>
  );
};

export default CVBuilder;