import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./auth.schema.js";

const validEmployee = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  password: "Password1",
  passwordConfirm: "Password1",
  gender: "MALE",
  role: "EMPLOYEE",
  age: 24,
  telephone: ["0591234567"],
};

describe("authentication schemas", () => {
  it("normalizes login email addresses", () => {
    const result = loginSchema.parse({
      email: "  TEST@Example.COM ",
      password: "Password1",
    });

    expect(result.email).toBe("test@example.com");
  });

  it("accepts a complete employee registration", () => {
    const result = signupSchema.safeParse(validEmployee);

    expect(result.success).toBe(true);
  });

  it("returns usable Zod issues for invalid registration data", () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      email: "not-an-email",
      password: "weak",
      passwordConfirm: "weak",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThan(0);
    expect(result.error.issues.map((issue) => issue.message)).toContain(
      "Invalid email address",
    );
  });

  it("requires company details for employer registration", () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      role: "EMPLOYER",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.map((issue) => issue.message)).toContain(
      "Company details are required for Employers",
    );
  });

  it("accepts a complete employer registration", () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      role: "EMPLOYER",
      company: {
        name: "Test Company",
        license: "LIC-123",
        contactEmail: "company@example.com",
        website: "https://example.com",
        branches: [
          {
            name: "Main",
            city: "Ramallah",
            street: "Test Street",
          },
        ],
      },
    });

    expect(result.success).toBe(true);
  });
});
