import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (env.emailUser && env.emailPassword) {
    transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465,
      auth: { user: env.emailUser, pass: env.emailPassword },
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const info = await getTransporter().sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
  });
  if (env.nodeEnv !== 'production') {
    console.log('[email]', subject, '->', to);
    if (info.message) console.log(info.message.toString());
  }
  return info;
}

export function verifyEmailTemplate(name, url) {
  return `<p>Hi ${name},</p><p>Verify your SewaLink account:</p><p><a href="${url}">${url}</a></p>`;
}

export function resetEmailTemplate(name, url) {
  return `<p>Hi ${name},</p><p>Reset your SewaLink password:</p><p><a href="${url}">${url}</a></p>`;
}
