import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

export async function sendInviteEmail({ to, title, whenLocal, joinUrl, location }) {
  const subject = `Invitation: ${title}`;
  const html = `
    <p>You are invited to <b>${title}</b>.</p>
    <p><b>When:</b> ${whenLocal}</p>
    ${joinUrl ? `<p><b>Join:</b> <a href="${joinUrl}">${joinUrl}</a></p>` : ''}
    ${location ? `<p><b>Location:</b> ${location}</p>` : ''}
    <p>— Sent by Convene</p>
  `;
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
}
