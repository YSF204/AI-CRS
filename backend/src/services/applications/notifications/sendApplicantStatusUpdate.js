import { sendEmail } from "../../../utils/email.js";
import { buildApplicationStatusUpdateEmail } from "../../shared/emailTemplateService.js";

export const sendApplicantStatusUpdate = async ({ applicantEmail, fullName, status }) => {
    if (!applicantEmail) {
        return { sent: false };
    }

    const template = buildApplicationStatusUpdateEmail({ fullName, status });

    await sendEmail({
        email: applicantEmail,
        subject: template.subject,
        html: template.html,
        message: template.message,
    });

    return { sent: true };
};

export default sendApplicantStatusUpdate;
