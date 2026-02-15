export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  backend: string[];
  frontend: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutInfo {
  name: string;
  gamertag: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  avatar?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}
