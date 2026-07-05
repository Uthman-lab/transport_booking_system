import nodemailer from "nodemailer";

// Server-only SMTP mailer for app-sent emails (currently the invite link).
// Reuses your Brevo SMTP credentials. Env (all server-only, never NEXT_PUBLIC):
//   SMTP_HOST (e.g. smtp-relay.brevo.com), SMTP_PORT (587),
//   SMTP_USER (Brevo login), SMTP_PASS (Brevo SMTP key),
//   SMTP_FROM (a verified sender email), SMTP_FROM_NAME (optional).

export function isMailerConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

function fromAddress(): string {
  const email = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "";
  const name = process.env.SMTP_FROM_NAME ?? "UBBS";
  return `"${name}" <${email}>`;
}

export type InviteEmailInput = {
  to: string;
  fullName: string;
  link: string;
  role: string;
};

// Sends the invite email. Throws if SMTP isn't configured or the send fails —
// callers treat it as best-effort so the admin still gets the copyable link.
export async function sendInviteEmail(input: InviteEmailInput): Promise<void> {
  if (typeof window !== "undefined") {
    throw new Error("sendInviteEmail must only run on the server.");
  }
  if (!isMailerConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2>You've been invited to UBBS</h2>
      <p>Hi ${escapeHtml(input.fullName)}, you've been added as <strong>${escapeHtml(input.role)}</strong> on the University Bus Booking System.</p>
      <p>Click below to set your password and sign in:</p>
      <p>
        <a href="${input.link}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">
          Accept invitation
        </a>
      </p>
      <p style="color:#666;font-size:13px">If the button doesn't work, paste this link into your browser:<br>${input.link}</p>
    </div>`;

  await transport.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: "You've been invited to UBBS",
    text: `You've been invited to UBBS as ${input.role}. Set your password: ${input.link}`,
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
