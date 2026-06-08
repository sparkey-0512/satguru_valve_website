import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, company, phone, email, message, turnstileToken } = req.body || {};

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required" });
  }

  // Turnstile bot check
  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    },
  );
  const botCheck = await verify.json();
  if (!botCheck.success) {
    return res.status(400).json({ error: "Bot verification failed" });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "website@satguruvalve.com", // your verified domain email
      to: "satguruvalve@gmail.com", // your Gmail where you read inquiries
      subject: `New Inquiry from ${name} — ${company || "N/A"}`,
      html: `
        <h2>New Website Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company || "Not provided"}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(400).json({ error: error.message || "Failed to send email" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
