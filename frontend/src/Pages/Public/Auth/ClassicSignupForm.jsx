import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { signupSchema } from "../../../schema/auth.schema";
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

  const validationData = {
    ...form,
    role: role.toUpperCase(),
    age: parseInt(form.age) || 0,
  };
  const { errors, touched, touch, touchAll } = useFormValidation(
    signupSchema,
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
          !errors.email
        );
      case 2:
        return !!(form.gender && form.age && !errors.age);
      case 3:
        return !!(
          form.password.length >= 8 &&
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

  const handleRoleSelect = (r) => {
    setRole(r);
    setTimeout(() => advanceRef.current?.(), 0);
  };

  const handleComplete = async () => {
    setErrorMsg("");
    try {
      const parsed = signupSchema.safeParse(validationData);
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        setErrorMsg(firstIssue?.message || "Validation failed");
        console.log("Validation errors:", parsed.error.issues);
        return;
      }

      const d = parsed.data;
      const body = {
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        password: d.password,
        passwordConfirm: d.passwordConfirm,
        gender: d.gender,
        role: d.role,
        age: d.age,
        telephone: d.telephone ? [d.telephone] : [],
      };

      if (d.role === "EMPLOYER") {
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
      console.error("Registration error:", err.response?.data);
      const serverMessage = err.response?.data?.message;
      setErrorMsg(
        serverMessage || "Registration failed. Please try again.",
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const steps = [
    <RoleStep key="role" role={role} onSelectRole={handleRoleSelect} />,
    <PersonalStep key="personal" field={field} />,
    <ProfileStep key="profile" form={form} setForm={setForm} field={field} />,
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
        <form onSubmit={handleSubmit} noValidate>
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
        </form>
      )}
    </>
  );
}