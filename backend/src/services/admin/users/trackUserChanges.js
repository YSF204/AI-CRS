export const buildUserChangeList = ({ previousUser, updatedUser, includePasswordChange = false }) => {
    const previousValues = {
        firstName: previousUser.firstName,
        lastName: previousUser.lastName,
        email: previousUser.email,
        role: previousUser.role,
        gender: previousUser.gender,
        age: previousUser.age,
        telephone: (previousUser.telephone || []).join(", "),
        accountStatus: previousUser.accountStatus,
    };

    const updatedValues = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        gender: updatedUser.gender,
        age: updatedUser.age,
        telephone: (updatedUser.telephone || []).join(", "),
        accountStatus: updatedUser.accountStatus,
    };

    const changes = Object.keys(updatedValues).reduce((acc, key) => {
        if (previousValues[key] !== updatedValues[key]) {
            acc.push({
                label: key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase()),
                from: previousValues[key] ?? "-",
                to: updatedValues[key] ?? "-",
            });
        }
        return acc;
    }, []);

    if (includePasswordChange) {
        changes.push({
            label: "Password",
            from: "******",
            to: "Updated",
        });
    }

    return changes;
};

export const addCompanyChanges = ({ changes, previousCompany = {}, updatedCompany = {} }) => {
    const companyFields = [
        ["name", "Company Name"],
        ["license", "Company License"],
        ["contactEmail", "Contact Email"],
        ["website", "Website"],
    ];

    companyFields.forEach(([field, label]) => {
        const before = previousCompany[field] || "-";
        const after = updatedCompany[field] || "-";

        if (before !== after) {
            changes.push({ label, from: before, to: after });
        }
    });

    return changes;
};

export default {
    buildUserChangeList,
    addCompanyChanges,
};
