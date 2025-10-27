// server/utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Check if email credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email credentials missing. Skipping actual email send...");
      console.log(`
--- Simulated Email ---
To: ${to}
Subject: ${subject}
Text: ${text}
------------------------
      `);
      return; // Exit gracefully
    }

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SkillForge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    // Don't throw — just log it (so we don’t crash API responses)
  }
};
