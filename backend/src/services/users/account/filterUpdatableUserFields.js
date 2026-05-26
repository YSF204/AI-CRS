export const filterUpdatableUserFields = (payload) => {
    const allowedFields = ["firstName", "lastName", "email", "gender", "telephone", "age"];
    const filtered = {};

    Object.keys(payload || {}).forEach((key) => {
        if (allowedFields.includes(key)) {
            filtered[key] = payload[key];
        }
    });

    return filtered;
};

export default filterUpdatableUserFields;
