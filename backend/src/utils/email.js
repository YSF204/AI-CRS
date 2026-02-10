import nodemailer from "nodemailer";

const sender = {
  address: process.env.EMAIL_USERNAME,
  name: "AI-CRS App",
};

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  console.log("Attempting to send email to:", options.email);
  await transport.sendMail({
    from: `${sender.name} <${sender.address}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html || `<p>${options.text}</p>`,
  });
  console.log("Email sent successfully!");
};

export default sendEmail;
