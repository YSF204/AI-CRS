import { sendEmail } from "../../../utils/email.js";
import { buildApplicationSubmittedApplicantEmail } from "../../shared/emailTemplateService.js";

export const sendApplicantConfirmation = async ({ applicant, job, matchPercentage }) => {
    if (!applicant?.email) {
        return { sent: false };
    }

    const template = buildApplicationSubmittedApplicantEmail({
        applicant,
        job,
        matchPercentage,
    });

    await sendEmail({
        email: applicant.email,
        subject: template.subject,
        html: template.html,
    });

    return { sent: true };
};

export default sendApplicantConfirmation;
