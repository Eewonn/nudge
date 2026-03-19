import nodemailer from "nodemailer";

export async function sendEmail(subject: string, html: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to   = process.env.NUDGE_TO_EMAIL;

  if (!user) throw new Error("GMAIL_USER is not set");
  if (!pass) throw new Error("GMAIL_APP_PASSWORD is not set");
  if (!to)   throw new Error("NUDGE_TO_EMAIL is not set");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `"Nudge" <${user}>`,
    to,
    subject,
    html,
  });

  if (!info.messageId) throw new Error("Email failed to send");
}
