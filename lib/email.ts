import { Resend } from "resend";

export async function sendEmail(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.NUDGE_FROM_EMAIL ?? "nudge@yourdomain.com";
  const to     = process.env.NUDGE_TO_EMAIL;

  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (!to)     throw new Error("NUDGE_TO_EMAIL is not set");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
