import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const sender = {
    address: process.env.EMAIL_USERNAME,
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
