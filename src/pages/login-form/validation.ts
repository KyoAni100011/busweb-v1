import { zod } from '@/lib/utils';
import { z } from 'zod';

export const SignInSchema = zod(
  z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
);

export type SignIn = typeof SignInSchema.__type;

const PASSWORD_MESSAGE = '8+ chars, 1 uppercase, 1 number, 1 special character';

export const SignUpSchema = zod(
  z.object({
    username: z.string().min(3, 'Username is too short'),
    fullName: z.string().min(3, 'Full name is too short'),
    email: z.string().email(),
    password: z
      .string()
      .min(8, PASSWORD_MESSAGE)
      .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/u, PASSWORD_MESSAGE),
    confirmPassword: z.string().min(8, 'Please re-enter your password'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
);

export type SignUp = typeof SignUpSchema.__type;
