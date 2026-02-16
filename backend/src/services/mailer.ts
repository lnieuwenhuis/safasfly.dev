import nodemailer from 'nodemailer';
import { AppEnv } from '../config/env.js';
import { ContactRequest } from '../types/models.js';

export async function notifyContactRequest(env: AppEnv, request: ContactRequest): Promise<boolean> {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });

    const qualification = [
      `Budget: ${request.budgetRange || 'not specified'}`,
      `Timeline: ${request.timeline || 'not specified'}`,
      `Project type: ${request.projectType || 'not specified'}`,
      `Source: ${request.source || 'not specified'}`,
    ].join('\n');

    await transporter.sendMail({
      from: env.smtpUser,
      to: env.contactEmail,
      replyTo: request.email,
      subject: `[Portfolio Contact] ${request.subject}`,
      text: `Name: ${request.name}\nEmail: ${request.email}\n\n${qualification}\n\nMessage:\n${request.message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Email:</strong> ${request.email}</p>
        <p><strong>Subject:</strong> ${request.subject}</p>
        <p><strong>Budget:</strong> ${request.budgetRange || 'not specified'}</p>
        <p><strong>Timeline:</strong> ${request.timeline || 'not specified'}</p>
        <p><strong>Project Type:</strong> ${request.projectType || 'not specified'}</p>
        <p><strong>Source:</strong> ${request.source || 'not specified'}</p>
        <h3>Message</h3>
        <p>${request.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send contact notification email', error);
    return false;
  }
}
