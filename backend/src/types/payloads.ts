export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  budgetRange: string;
  timeline: string;
  projectType: string;
  source: string;
}

export interface LeadCapturePayload {
  email: string;
  name: string;
  company: string;
  website: string;
  useCase: string;
}

export interface AnalyticsEventPayload {
  eventName: string;
  path: string;
  metadata?: Record<string, unknown>;
}

export interface LoginPayload {
  email: string;
  password: string;
}
