import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from '../auth.schema.js';

// ─────────────────────────────────────────────────────────────
//  loginSchema
// ─────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('passes with valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: 'Pass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: 'PASSWORD1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: 'PasswordOnly',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty fields', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
//  signupSchema
// ─────────────────────────────────────────────────────────────

describe('signupSchema', () => {
  const validEmployee = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password1',
    passwordConfirm: 'Password1',
    gender: 'MALE',
    role: 'EMPLOYEE',
    age: 25,
  };

  it('passes for a valid employee signup', () => {
    const result = signupSchema.safeParse(validEmployee);
    expect(result.success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      passwordConfirm: 'DifferentPass1',
    });
    expect(result.success).toBe(false);
    const messages = result.error.issues.map(e => e.message);
    expect(messages).toContain("Passwords don't match");
  });

  it('rejects names containing numbers', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      firstName: 'John123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects age below 18', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      age: 15,
    });
    expect(result.success).toBe(false);
  });

  it('rejects age above 119', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      age: 200,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid gender', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      gender: 'OTHER',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      role: 'SUPERADMIN',
    });
    expect(result.success).toBe(false);
  });

  it('requires company details when role is EMPLOYER', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      role: 'EMPLOYER',
      // no company details
    });
    expect(result.success).toBe(false);
  });

  it('passes for EMPLOYER with valid company details', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      role: 'EMPLOYER',
      company: {
        name: 'Acme Corp',
        license: 'LIC-12345',
        contactEmail: 'hr@acme.com',
        website: '',
        branches: [
          { name: 'HQ', city: 'Ramallah', street: 'Main St' },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects EMPLOYER with empty branches array', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      role: 'EMPLOYER',
      company: {
        name: 'Acme Corp',
        license: 'LIC-12345',
        contactEmail: 'hr@acme.com',
        branches: [],
      },
    });
    expect(result.success).toBe(false);
  });

  it('allows optional telephone field', () => {
    const result = signupSchema.safeParse(validEmployee);
    expect(result.success).toBe(true);
  });

  it('coerces age from string to number', () => {
    const result = signupSchema.safeParse({
      ...validEmployee,
      age: '25',
    });
    expect(result.success).toBe(true);
  });
});
