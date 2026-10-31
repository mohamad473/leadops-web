import 'server-only';
import nodemailer from 'nodemailer';
import { config } from './config';

export async function sendLoginEmail(to: string, link: string): Promise<void> {
  if (!config.smtp.host) {
    // Development: no SMTP configured, so print the link where the developer can see it.
    console.log(`\n[LeadOps] Sign-in link for ${to} (valid 15 minutes):\n${link}\n`);
    return;
  }
  const transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined
  });
  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Your LeadOps sign-in link',
    text: `Sign in to LeadOps:\n\n${link}\n\nThe link works once and expires in 15 minutes. If you did not ask for it, ignore this email.`,
    html: `<p>Sign in to LeadOps:</p><p><a href="${link}">Sign in</a></p><p style="color:#5b6475">The link works once and expires in 15 minutes. If you did not ask for it, ignore this email.</p>`
  });
}
