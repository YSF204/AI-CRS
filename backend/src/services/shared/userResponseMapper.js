export const mapUserResponse = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: user.telephone,
    accountStatus: user.accountStatus,
    profilePic: user.profilePic,
    isEmailVerified: user.isEmailVerified,
    authProvider: user.authProvider,
});

export default {
    mapUserResponse,
};
