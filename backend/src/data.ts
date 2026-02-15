import { Project, AboutInfo, SocialLink } from './types.js';

export const aboutInfo: AboutInfo = {
  name: 'Lars Nieuwenhuis',
  gamertag: 'Safasfly',
  title: 'Freelance Full Stack Developer',
  bio: 'I am a freelance developer who designs, builds, and deploys web products end-to-end. I focus on reliable backend services, fast frontend experiences, and straightforward infrastructure that stays easy to maintain.',
  location: 'Netherlands',
  email: 'lnieuwenhuis48@icloud.com',
};

export const socialLinks: SocialLink[] = [
  {
    platform: 'GitHub',
    url: 'https://github.com/lnieuwenhuis',
    icon: 'github',
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/lars-nieuwenhuis-b85848159/',
    icon: 'linkedin',
  },
  {
    platform: 'X',
    url: 'https://twitter.com/safasfly',
    icon: 'x',
  },
];

export const projects: Project[] = [
  {
    id: 'chat-app',
    name: 'Real-time Chat App',
    description:
      'A real-time chat application with live messaging capabilities. Features user authentication, message persistence, and real-time communication.',
    url: 'https://chat.safasfly.dev',
    backend: ['Go', 'MariaDB', 'Docker'],
    frontend: ['React', 'TypeScript', 'Tailwind CSS'],
    featured: true,
  },
  {
    id: 'ai-chat',
    name: 'AI Chat App',
    description:
      'An AI-powered chat application that uses OpenRouter to generate responses. Users can have conversations with the AI in a natural language manner.',
    url: 'https://ai.safasfly.dev',
    backend: ['Go', 'MariaDB', 'Docker'],
    frontend: ['React', 'TypeScript', 'Tailwind CSS'],
    featured: true,
  },
];
