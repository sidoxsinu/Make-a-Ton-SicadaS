import "server-only";
import nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: SendMailOptions): Promise<{ sent: boolean; messageId?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const from = process.env.MAIL_FROM || '"Brightloop SMS" <billing@brightloop.local>';

  if (!host || !user || !pass) {
    // In dev / test when SMTP credentials are not provided, log and return simulated success
    console.log(`[SMTP SIMULATED] To: ${options.to} | Subject: ${options.subject}`);
    return { sent: true, messageId: "simulated-msg-id" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { sent: true, messageId: info.messageId };
}

