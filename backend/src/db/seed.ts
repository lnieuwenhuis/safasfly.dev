import {
  BlogPost,
  CaseStudy,
  OfferPackage,
  Project,
  RetainerPlan,
  ServiceLandingPage,
  SiteProfile,
  SocialLink,
} from '../types/models.js';

export const seedProfile: Omit<SiteProfile, 'updatedAt'> = {
  name: 'Lars Nieuwenhuis',
  gamertag: 'Safasfly',
  title: 'Solo Freelance Full-Stack Developer',
  bio: 'I help service businesses and SaaS teams launch, improve, and host production-ready websites and web apps without agency overhead.',
  location: 'Netherlands',
  email: 'lnieuwenhuis48@icloud.com',
  nicheOffer: 'I build and host conversion-focused websites in 7-14 days for businesses that need speed and reliability.',
  responseSla: 'I reply to qualified inquiries within 24 hours.',
  availability: 'Currently accepting 2 new client slots this month.',
  bookingUrl: 'https://calendly.com/safasfly/intro-call',
  hourlyRateFrom: 'EUR 75/hour',
  monthlyHostingFrom: 'EUR 99/month',
};

export const seedSocials: Array<Omit<SocialLink, 'id'>> = [
  {
    platform: 'GitHub',
    url: 'https://github.com/lnieuwenhuis',
    icon: 'github',
    sortOrder: 1,
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/lars-nieuwenhuis-b85848159/',
    icon: 'linkedin',
    sortOrder: 2,
  },
  {
    platform: 'X',
    url: 'https://twitter.com/safasfly',
    icon: 'x',
    sortOrder: 3,
  },
];

export const seedProjects: Array<Omit<Project, 'createdAt' | 'updatedAt'>> = [
  {
    id: 'chat-app',
    name: 'Real-time Chat App',
    description:
      'A production chat platform with real-time messaging, account auth, and persistent conversations for support teams.',
    url: 'https://chat.safasfly.dev',
    backend: ['Go', 'MariaDB', 'Docker'],
    frontend: ['React', 'TypeScript', 'Tailwind CSS'],
    featured: true,
  },
  {
    id: 'ai-chat',
    name: 'AI Chat Assistant',
    description:
      'AI customer support interface with OpenRouter integration, prompt control, and operational dashboards.',
    url: 'https://ai.safasfly.dev',
    backend: ['Go', 'MariaDB', 'Docker'],
    frontend: ['React', 'TypeScript', 'Tailwind CSS'],
    featured: true,
  },
  {
    id: 'booking-site',
    name: 'Booking Funnel Website',
    description:
      'Lead-focused business website with qualification forms, booking flow, and analytics instrumentation.',
    url: 'https://www.safasfly.dev',
    backend: ['Hono', 'SQLite', 'Docker'],
    frontend: ['React', 'TypeScript', 'Vite'],
    featured: false,
  },
];

export const seedOffers: Array<Omit<OfferPackage, 'updatedAt'>> = [
  {
    id: 'starter-site',
    name: 'Starter Website',
    description: 'For local businesses that need a professional online presence quickly.',
    priceFrom: 'EUR 1,250',
    timeline: '7 days',
    revisions: '2 revision rounds',
    hosting: 'Managed hosting optional from EUR 99/month',
    includes: ['Up to 5 pages', 'Mobile-first design', 'Contact form setup', 'Basic SEO setup'],
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'growth-funnel',
    name: 'Growth Funnel Build',
    description: 'For teams that need lead capture, analytics, and conversion-focused pages.',
    priceFrom: 'EUR 2,800',
    timeline: '10-14 days',
    revisions: '3 revision rounds',
    hosting: 'Managed hosting and monitoring included first month',
    includes: ['Landing pages + funnels', 'Qualification form', 'Calendar integration', 'Event tracking'],
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'custom-app',
    name: 'Custom Web App',
    description: 'For custom business logic, portals, or internal tooling with full-stack delivery.',
    priceFrom: 'EUR 4,500',
    timeline: '3-6 weeks',
    revisions: 'Milestone-based scope reviews',
    hosting: 'Cloud deployment and maintenance available',
    includes: ['Frontend + backend', 'Database design', 'Auth/session setup', 'Deployment pipeline'],
    featured: false,
    sortOrder: 3,
  },
];

export const seedRetainers: Array<Omit<RetainerPlan, 'updatedAt'>> = [
  {
    id: 'retainer-core',
    name: 'Core Retainer',
    hoursPerMonth: 10,
    price: 'EUR 750/month',
    hostingIncluded: true,
    supportSla: 'Response within 1 business day',
    includes: ['Bug fixes', 'Content updates', 'Security patching', 'Hosting + backups'],
    sortOrder: 1,
  },
  {
    id: 'retainer-growth',
    name: 'Growth Retainer',
    hoursPerMonth: 20,
    price: 'EUR 1,450/month',
    hostingIncluded: true,
    supportSla: 'Response within 12 hours',
    includes: ['Feature delivery', 'A/B iterations', 'Performance monitoring', 'Monthly strategy call'],
    sortOrder: 2,
  },
  {
    id: 'retainer-priority',
    name: 'Priority Retainer',
    hoursPerMonth: 35,
    price: 'EUR 2,450/month',
    hostingIncluded: true,
    supportSla: 'Same-day response',
    includes: ['Priority queue', 'Continuous delivery', 'Incident support', 'Dedicated roadmap execution'],
    sortOrder: 3,
  },
];

export const seedCaseStudies: Array<Omit<CaseStudy, 'updatedAt'>> = [
  {
    id: 'saas-onboarding',
    title: 'SaaS Onboarding Funnel Rebuild',
    clientName: 'B2B SaaS Startup',
    industry: 'SaaS',
    challenge: 'Their trial signup flow dropped users before activation due to unclear onboarding and slow page loads.',
    solution: 'Rebuilt the onboarding funnel with faster UI, event tracking, and clearer conversion copy.',
    outcome: 'Trial-to-activation rate improved by 31% in 6 weeks.',
    testimonialQuote: 'Lars moved fast and shipped with zero drama. We saw measurable gains quickly.',
    testimonialAuthor: 'Founder, B2B SaaS Startup',
    projectUrl: 'https://www.safasfly.dev',
    featured: true,
  },
  {
    id: 'local-business-bookings',
    title: 'Local Service Booking Website',
    clientName: 'Regional Service Business',
    industry: 'Local Services',
    challenge: 'Website looked outdated and generated inconsistent lead quality.',
    solution: 'Built a new website with qualification forms, booking CTA, and trust signals.',
    outcome: 'Qualified lead volume increased by 2.1x in the first month.',
    testimonialQuote: 'Communication was direct and the website paid for itself quickly.',
    testimonialAuthor: 'Owner, Regional Service Business',
    projectUrl: 'https://www.safasfly.dev',
    featured: true,
  },
];

export const seedServicePages: Array<Omit<ServiceLandingPage, 'updatedAt'>> = [
  {
    id: 'service-local-business-nl',
    slug: 'website-development-for-local-businesses-netherlands',
    title: 'Website Development for Local Businesses (Netherlands)',
    audience: 'Local businesses',
    city: 'Netherlands',
    summary: 'Fast, conversion-first websites for local businesses that need more calls and bookings.',
    offer: 'Launch-ready site in 7-14 days with managed hosting options.',
    seoDescription: 'Freelance website developer in the Netherlands for local businesses.',
    ctaLabel: 'Book a strategy call',
  },
  {
    id: 'service-saas-conversion',
    slug: 'saas-conversion-landing-pages',
    title: 'SaaS Conversion Landing Pages',
    audience: 'SaaS teams',
    city: 'Remote',
    summary: 'Landing pages and onboarding funnels focused on activation and trial conversion.',
    offer: 'Instrumented pages with analytics, tracking, and rapid iteration workflow.',
    seoDescription: 'Freelance SaaS landing page developer for conversion optimization.',
    ctaLabel: 'Discuss your funnel',
  },
  {
    id: 'service-maintenance-hosting',
    slug: 'ongoing-website-maintenance-and-hosting',
    title: 'Ongoing Website Maintenance and Hosting',
    audience: 'Growing businesses',
    city: 'Remote',
    summary: 'Keep your site secure, up-to-date, and monitored with a single monthly plan.',
    offer: 'Backups, SSL, uptime monitoring, incident response, and content updates.',
    seoDescription: 'Managed website maintenance and hosting for business websites.',
    ctaLabel: 'See retainer plans',
  },
];

export const seedBlogPosts: Array<Omit<BlogPost, 'updatedAt'>> = [
  {
    id: 'website-cost-2026',
    slug: 'how-much-does-a-business-website-cost-2026',
    title: 'How Much Does a Business Website Cost in 2026?',
    excerpt: 'A practical breakdown of website pricing, hidden costs, and how to budget for delivery and hosting.',
    body: 'A business website budget should separate one-time build costs from recurring hosting and maintenance. The biggest pricing drivers are scope, integrations, and turnaround speed. For many service businesses, a focused website with clear conversion paths beats a bloated build.',
    category: 'Pricing',
    readTime: '6 min read',
    publishedAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'retainer-vs-one-off',
    slug: 'retainer-vs-one-off-web-development',
    title: 'Retainer vs One-Off Development: Which Fits Your Business?',
    excerpt: 'When to buy fixed-scope projects and when a monthly development retainer gives better outcomes.',
    body: 'If your roadmap changes monthly, retainers reduce friction and keep momentum. For clear, finite goals, one-off delivery can be more cost-effective. Most growing businesses use a hybrid: project launch first, then a maintenance or growth retainer.',
    category: 'Strategy',
    readTime: '5 min read',
    publishedAt: '2026-01-27T09:00:00.000Z',
  },
  {
    id: 'speed-matters-leads',
    slug: 'why-site-speed-still-drives-lead-conversion',
    title: 'Why Site Speed Still Drives Lead Conversion',
    excerpt: 'Slow landing pages lose buyers before your offer is even seen. Here is how to fix it.',
    body: 'Performance affects trust and action. A fast first impression keeps users engaged long enough to evaluate your offer. Prioritize image optimization, script discipline, and measured third-party usage to preserve conversion rates.',
    category: 'Performance',
    readTime: '4 min read',
    publishedAt: '2026-02-03T09:00:00.000Z',
  },
];
