import React from 'react';
import { Globe, Twitter, Instagram, Youtube, Linkedin, Github, Facebook } from 'lucide-react';

export const getSocialIcon = (iconName, size = 16) => {
  const props = { size, strokeWidth: 2 };
  switch (iconName) {
    case 'globe': return <Globe {...props} />;
    case 'twitter': return <Twitter {...props} />;
    case 'instagram': return <Instagram {...props} />;
    case 'youtube': return <Youtube {...props} />;
    case 'linkedin': return <Linkedin {...props} />;
    case 'github': return <Github {...props} />;
    case 'facebook': return <Facebook {...props} />;
    default: return <Globe {...props} />;
  }
};

export const getSocialName = (iconName) => {
  switch (iconName) {
    case 'globe': return 'Website';
    case 'twitter': return 'X (Twitter)';
    case 'instagram': return 'Instagram';
    case 'youtube': return 'YouTube';
    case 'linkedin': return 'LinkedIn';
    case 'github': return 'GitHub';
    case 'facebook': return 'Facebook';
    default: return 'Link';
  }
};

export default getSocialIcon;
