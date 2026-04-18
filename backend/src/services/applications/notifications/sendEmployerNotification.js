import Application from "../../../models/Application.js";
import Employer from "../../../models/Employer.js";
import { sendEmail } from "../../../utils/email.js";
import { buildApplicationSubmittedEmployerEmail } from "../../shared/emailTemplateService.js";

export const sendEmployerNotification = async ({
    applicationId,
    employerId,
    applicant,
    job,
    matchPercentage,
    matchDetails,
}) => {
    const employer = await Employer.findById(employerId);
    if (!employer?.company?.contactEmail) {
        return { sent: false };
    }

    const template = buildApplicationSubmittedEmployerEmail({
        employerName: employer.company.name,
        applicant,
        job,
        matchPercentage,
        breakdown: matchDetails,
    });

    await sendEmail({
        email: employer.company.contactEmail,
        subject: template.subject,
        html: template.html,
    });

    await Application.findByIdAndUpdate(applicationId, { isNotified: true });
    return { sent: true };
};

export default sendEmployerNotification;
