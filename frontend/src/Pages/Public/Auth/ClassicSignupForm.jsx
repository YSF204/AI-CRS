import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import useFormValidation from "../../../hooks/useFormValidation";
import Stepper from "./components/Stepper";
import ErrorBanner from "./components/ErrorBanner";
import CheckYourEmailPage from "./CheckYourEmailPage";
import api from "../../../services/api";
import RoleStep from "./components/steps/RoleStep";
import PersonalStep from "./components/steps/PersonalStep";
import ProfileStep from "./components/steps/ProfileStep";
import SecurityStep from "./components/steps/SecurityStep";
import CompanyStep from "./components/steps/CompanyStep";

// Steps: [0] Role  [1] Personal  [2] Profile  [3] Security  [4?] Company
const STEP_FIELDS = [
  ["role"],
  ["firstName", "lastName", "email"],
  ["gender", "age", "telephone"],
  ["password", "passwordConfirm"],
  [
    "companyName",
    "companyLicense",
    "contactEmail",
    "branchName",
    "branchCity",
    "branchStreet",
  ],
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  age: "",
  password: "",
  passwordConfirm: "",
  telephone: "",
  companyName: "",
  companyLicense: "",
  contactEmail: "",
  website: "",
  branchName: "",
  branchCity: "",
  branchStreet: "",
};

export default function ClassicSignupForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [verificationEmail, setVerificationEmail] = useState(null);
  const [role, setRole] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const advanceRef = useRef(null);

  // Track phone and email duplicate validity from child components
  const [phoneValid, setPhoneValid] = useState(true);
  const [emailDuplicate, setEmailDuplicate] = useState(false);

  const validationData = {
    ...form,
    role: role.toUpperCase(),
    age: parseInt(form.age) || 0,
  };
  const { errors, touched, touch, touchAll } = useFormValidation(
    null,
    validationData,
  );

  const set = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
  const field = (name, overrides = {}) => {
    const { touchOnChange = false, ...restOverrides } = overrides;
    return {
      value: form[name],
      onChange: touchOnChange
        ? (e) => {
            set(name)(e);
            touch(name)();
          }
        : set(name),
      onFocus: touch(name),
      onBlur: touch(name),
      error: touched[name] ? errors[name] : "",
      ...restOverrides,
    };
  };

  const handleNextAttempt = (idx) => touchAll(STEP_FIELDS[idx] || []);

  const companyValid =
    form.companyName.trim() &&
    form.companyLicense.trim() &&
    form.contactEmail.trim() &&
    form.branchName.trim() &&
    form.branchCity.trim() &&
    form.branchStreet.trim() &&
    !errors.companyName &&
    !errors.companyLicense &&
    !errors.contactEmail;

  const canProceed = (idx) => {
    switch (idx) {
      case 0:
        return role !== "";
      case 1:
        return !!(
          form.firstName.trim() &&
          form.lastName.trim() &&
          form.email.trim() &&
          !errors.firstName &&
          !errors.lastName &&
          !errors.email &&
          !emailDuplicate
        );
      case 2: {
        // Phone: if they typed something, it must be exactly 10 digits
        const telVal = form.telephone || "";
        const telOk = telVal.length === 0 || telVal.length === 10;
        return !!(form.gender && form.age && !errors.age && telOk && phoneValid);
      }
      case 3:
        return !!(
          form.password.length >= 6 &&
          form.password === form.passwordConfirm &&
          !errors.password &&
          !errors.passwordConfirm
        );
      case 4:
        return companyValid;
      default:
        return true;
    }
  };

  // Clicking a role card saves role AND immediately jumps to next step
  const handleRoleSelect = (r) => {
    setRole(r);
    // Reset ALL role-specific fields when switching roles (FIX 3)
    setForm((prev) => ({
      ...prev,
      gender: "",
      age: "",
      telephone: "",
      companyName: "",
      companyLicense: "",
      contactEmail: "",
      website: "",
      branchName: "",
      branchCity: "",
      branchStreet: "",
    }));
    setPhoneValid(true);
    setEmailDuplicate(false);
    setTimeout(() => advanceRef.current?.(), 0); // defer so state update is committed first
  };

  const handleComplete = async () => {
    setErrorMsg("");
    try {
      const body = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        gender: form.gender,
        role: role.toUpperCase(),
        age: parseInt(form.age) || 0,
        telephone: form.telephone ? [form.telephone] : [],
      };

      if (role.toUpperCase() === "EMPLOYER") {
        body.company = {
          name: form.companyName,
          license: form.companyLicense,
          contactEmail: form.contactEmail,
          website: form.website || undefined,
          branches: [
            {
              name: form.branchName,
              city: form.branchCity,
              street: form.branchStreet,
            },
          ],
        };
      }

      const res = await api.post("/auth/register", body);

      // FIX #1: If requiresEmailVerification is true, show CheckYourEmailPage instead of logging in
      if (res.data.requiresEmailVerification) {
        setVerificationEmail(res.data.data.user.email);
        return;
      }

      const { token, data } = res.data;

      if (data.user.role === "EMPLOYER" && data.user.accountStatus === "PENDING") {
        navigate("/pending");
        return;
      }
      login(token, data.user);
      navigate("/");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  const steps = [
    <RoleStep key="role" role={role} onSelectRole={handleRoleSelect} />,
    <PersonalStep
      key="personal"
      field={field}
      onEmailDuplicateStatus={(isDuplicate) => setEmailDuplicate(isDuplicate)}
    />,
    <ProfileStep
      key="profile"
      form={form}
      setForm={setForm}
      field={field}
      onPhoneValidityChange={(isValid) => setPhoneValid(isValid)}
    />,
    <SecurityStep key="security" field={field} />,
    ...(role === "EMPLOYER"
      ? [<CompanyStep key="company" field={field} />]
      : []),
  ];

  return (
    <>
      {verificationEmail ? (
        <CheckYourEmailPage
          email={verificationEmail}
          onBackClick={() => setVerificationEmail(null)}
        />
      ) : (
        <>
          <ErrorBanner message={errorMsg} />
          <Stepper
            initialStep={1}
            onFinalStepCompleted={handleComplete}
            onNextAttempt={handleNextAttempt}
            backButtonText="← Back"
            nextButtonText="Continue →"
            canProceed={canProceed}
            advanceRef={advanceRef}
          >
            {steps}
          </Stepper>
        </>
      )}
    </>
  );
}
