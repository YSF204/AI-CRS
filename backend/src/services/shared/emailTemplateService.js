const baseHtml = ({ title, body }) => `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; background:#f4f6f8; padding:24px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; border:1px solid #e7e8ea; overflow:hidden;">
      <div style="padding:24px; background:#101827; color:#ffffff; text-align:center;">
        <h1 style="margin:0; font-size:24px;">${title}</h1>
      </div>
      <div style="padding:24px;">${body}</div>
      <div style="padding:16px 24px; background:#f8fafc; color:#556072; font-size:12px;">AI-CRS Team</div>
    </div>
  </div>
`;

export const buildAdminCreateAccountEmail = (user) => ({
    subject: "Welcome to AI-CRS",
    html: baseHtml({
        title: "Account Created",
        body: `
      <p>Hello ${user.firstName},</p>
      <p>Your account has been created by an administrator.</p>
      <p><strong>Email:</strong> ${user.email}<br/><strong>Role:</strong> ${user.role}</p>
    `,
    }),
});

export const buildAdminUpdateAccountEmail = (user, changes = []) => {
    const changeRows = changes.length
        ? changes
            .map(
                ({ label, from, to }) =>
                    `<tr><td style="padding:8px;border:1px solid #eee;">${label}</td><td style="padding:8px;border:1px solid #eee;">${from}</td><td style="padding:8px;border:1px solid #eee;">${to}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="3" style="padding:8px;border:1px solid #eee;">No user-visible fields changed.</td></tr>`;

    return {
        subject: "Your AI-CRS account was updated",
        html: baseHtml({
            title: "Account Updated",
            body: `
        <p>Hello ${user.firstName},</p>
        <p>Your account was updated by an administrator.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead><tr><th style="padding:8px;border:1px solid #eee;text-align:left;">Field</th><th style="padding:8px;border:1px solid #eee;text-align:left;">Before</th><th style="padding:8px;border:1px solid #eee;text-align:left;">After</th></tr></thead>
          <tbody>${changeRows}</tbody>
        </table>
      `,
        }),
    };
};

export const buildAdminDeleteAccountEmail = (user) => ({
    subject: "Your AI-CRS account was deactivated",
    html: baseHtml({
        title: "Account Deactivated",
        body: `
      <p>Hello ${user.firstName},</p>
      <p>Your account has been deactivated by an administrator.</p>
      <p>If this is unexpected, contact support.</p>
    `,
    }),
});

export const buildApplicationSubmittedEmployerEmail = ({
    employerName,
    applicant,
    job,
    matchPercentage,
    breakdown,
}) => ({
    subject: `New Application: ${applicant.fullName} for ${job.position}`,
    html: baseHtml({
        title: "New Application Received",
        body: `
      <p>Hi ${employerName || "Employer"},</p>
      <p>New application for <strong>${job.position}</strong>.</p>
      <p><strong>Name:</strong> ${applicant.fullName}<br/><strong>Email:</strong> ${applicant.email}</p>
      <p><strong>Match:</strong> ${matchPercentage ?? "Pending"}%</p>
      <p>
        Technical: ${breakdown.technicalSkillsMatch}%<br/>
        Experience: ${breakdown.experienceMatch}%<br/>
        Soft skills: ${breakdown.softSkillsMatch}%<br/>
        Languages: ${breakdown.languagesMatch}%
      </p>
    `,
    }),
});

export const buildApplicationSubmittedApplicantEmail = ({ applicant, job, matchPercentage }) => ({
    subject: `Application Confirmation: ${applicant.fullName} - ${job.position}`,
    html: baseHtml({
        title: "Application Submitted",
        body: `
      <p>Hi ${applicant.fullName},</p>
      <p>Your application for <strong>${job.position}</strong> was submitted successfully.</p>
      <p><strong>Current match:</strong> ${matchPercentage ?? "Pending"}%</p>
    `,
    }),
});

export const buildApplicationStatusUpdateEmail = ({ fullName, status }) => {
    const statusMessage =
        status === "accepted"
            ? "Congratulations! Your application has been accepted!"
            : "Thank you for your application. You have not been selected for this round.";

    return {
        subject: "Application Status Update",
        message: `Hi ${fullName},\n\n${statusMessage}\n\nBest regards,\nThe AI-CRS Team`,
        html: baseHtml({
            title: "Application Status Updated",
            body: `<p>Hi ${fullName},</p><p>${statusMessage}</p>`,
        }),
    };
};

export const buildDeleteConfirmationEmail = ({ fullName, deleteURL }) => ({
    subject: "Confirm Account Deletion - AI-CRS",
    text: `Please confirm your account deletion: ${deleteURL}`,
    html: baseHtml({
        title: "Account Deletion Request",
        body: `
      <p>Hello ${fullName},</p>
      <p>We received a request to delete your account.</p>
      <p><a href="${deleteURL}">Confirm account deletion</a></p>
    `,
    }),
});

export default {
    buildAdminCreateAccountEmail,
    buildAdminUpdateAccountEmail,
    buildAdminDeleteAccountEmail,
    buildApplicationSubmittedEmployerEmail,
    buildApplicationSubmittedApplicantEmail,
    buildApplicationStatusUpdateEmail,
    buildDeleteConfirmationEmail,
};
