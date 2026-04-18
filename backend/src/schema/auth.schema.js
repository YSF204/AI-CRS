import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
    .regex(/[a-z]/, 'Password must contain at least one lowercase character')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').regex(/^[^0-9]*$/, 'First name should not contain numbers'),
  lastName: z.string().min(1, 'Last name is required').regex(/^[^0-9]*$/, 'Last name should not contain numbers'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
    .regex(/[a-z]/, 'Password must contain at least one lowercase character')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  passwordConfirm: z.string().min(8, 'Password confirmation must be at least 8 characters'),
  gender: z.enum(['MALE', 'FEMALE'], { errorMap: () => ({ message: 'Gender must be MALE or FEMALE' }) }),
  role: z.enum(['EMPLOYEE', 'EMPLOYER', 'ADMIN'], { errorMap: () => ({ message: 'Invalid role' }) }),
  age: z.coerce.number().min(18, 'Age must be at least 18').max(119, 'Age must be less than 120'),
  telephone: z.array(z.string()).optional(),
  company: z.object({
    name: z.string().min(1, 'Company name is required'),
    license: z.string().min(1, 'License number is required'),
    contactEmail: z.string().email('Invalid contact email'),
    website: z.string().optional().or(z.literal('')),
    branches: z.array(z.object({
      name: z.string().min(1, 'Branch name is required'),
      city: z.string().min(1, 'City is required'),
      street: z.string().min(1, 'Street is required'),
    })).min(1, 'At least one branch is required'),
  }).optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
}).superRefine((data, ctx) => {
  if (data.role === 'EMPLOYER' && !data.company) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Company details are required for Employers', path: ['company'] });
  }
});
