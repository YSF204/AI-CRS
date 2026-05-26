import { z } from "zod";

// Login: only validate that email is valid and a password was supplied.
// Enforcing complexity rules here locks out users whose valid passwords
// predate the current rules — this is a UX and security issue.
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Signup: ADMIN is intentionally excluded from the public role list.
// Admins are provisioned directly in the DB — allowing self-registration as
// ADMIN is a privilege-escalation vulnerability.
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .regex(/^[^0-9]*$/, "First name should not contain numbers"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .regex(/^[^0-9]*$/, "Last name should not contain numbers"),
    email: z.string().trim().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase character")
      .regex(/[a-z]/, "Password must contain at least one lowercase character")
      .regex(/[0-9]/, "Password must contain at least one number"),
    passwordConfirm: z.string().min(1, "Please confirm your password"),
    gender: z.enum(["MALE", "FEMALE"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    role: z.enum(["EMPLOYEE", "EMPLOYER"], {
      errorMap: () => ({ message: "Please select a role" }),
    }),
    age: z.coerce.number().min(18, "Min age 18").max(119, "Max age 119"),
    telephone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits.")
      .optional()
      .or(z.literal("")),
    companyName: z.string().optional(),
    companyLicense: z.string().optional(),
    contactEmail: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    website: z.string().optional(),
    branchName: z.string().optional(),
    branchCity: z.string().optional(),
    branchStreet: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  })
  .superRefine((data, ctx) => {
    if (data.role === "EMPLOYER") {
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is required",
          path: ["companyName"],
        });
      }
      if (!data.companyLicense?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License number is required",
          path: ["companyLicense"],
        });
      }
      if (!data.contactEmail?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Contact email is required",
          path: ["contactEmail"],
        });
      }
      if (!data.branchName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Branch name is required",
          path: ["branchName"],
        });
      }
      if (!data.branchCity?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required",
          path: ["branchCity"],
        });
      }
      if (!data.branchStreet?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Street is required",
          path: ["branchStreet"],
        });
      }
    }
  });
