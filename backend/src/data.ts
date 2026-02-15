import { Project, AboutInfo, SocialLink } from './types';

export const aboutInfo: AboutInfo = {
  name: "Lars Nieuwenhuis",
  gamertag: "Safasfly",
  title: "Full Stack Web Developer",
  bio: "I'm a passionate full-stack developer with a love for building modern, responsive web applications. I specialize in TypeScript, React, and Go, with experience in cloud deployment and containerization.",
  location: "Netherlands",
  email: "contact@safasfly.dev"
};

export const socialLinks: SocialLink[] = [
  {
    platform: "GitHub",
    url: "https://github.com/safasfly",
    icon: "github"
  },
  {
    platform: "LinkedIn",
    url: "https://linkedin.com/in/larsnieuwenhuis",
    icon: "linkedin"
  },
  {
    platform: "Twitter",
    url: "https://twitter.com/safasfly",
    icon: "twitter"
  }
];

export const projects: Project[] = [
  {
    id: "chat-app",
    name: "Real-time Chat App",
    description: "A real-time chat application with live messaging capabilities. Features user authentication, message persistence, and real-time communication.",
    url: "https://chat.safasfly.dev",
    backend: ["Go", "MariaDB", "Docker"],
    frontend: ["React", "TypeScript", "Tailwind CSS"],
    featured: true
  },
  {
    id: "ai-chat",
    name: "AI Chat App",
    description: "An AI-powered chat application that uses OpenRouter to generate responses. Users can have conversations with the AI in a natural language manner.",
    url: "https://ai.safasfly.dev",
    backend: ["Go", "MariaDB", "Docker"],
    frontend: ["React", "TypeScript", "Tailwind CSS"],
    featured: true
  }
];
