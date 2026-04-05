// New file or add to existing
const nodemailer = require("nodemailer"); // Assume installed

async function sendToEmployer(employerId, formData, cvFile) {
  const employer = await Employer.findById(employerId);
  // Send email with application details
  const transporter = nodemailer.createTransporter(/* config */);
  await transporter.sendMail({
    to: employer.email,
    subject: "New Job Application",
    text: `Application details: ${JSON.stringify(formData)}`,
    attachments: [{ filename: "cv.pdf", content: cvFile }],
  });
}

module.exports = { sendToEmployer };
