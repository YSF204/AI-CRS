import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USERNAME;
  const emailPass = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPass) {
    const missingVars = [
      !emailUser ? "EMAIL_USERNAME" : null,
      !emailPass ? "EMAIL_PASSWORD" : null,
    ].filter(Boolean);

    throw new Error(
      `Email service is not configured. Missing environment variable(s): ${missingVars.join(", ")}`,
    );
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const sender = {
    address: emailUser,
    name: "AI-CRS App",
  };

  console.log("Attempting to send email to:", options.email);

  await transport.sendMail({
    from: `${sender.name} <${sender.address}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || options.message,
    html: options.html || `<p>${options.text || options.message}</p>`,
  });

  console.log("Email sent successfully!");
};

export default sendEmail;
