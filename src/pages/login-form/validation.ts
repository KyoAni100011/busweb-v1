import { zod } from '@/lib/utils';
import { z } from 'zod';

export const SignInSchema = zod(
  z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
);

export type SignIn = typeof SignInSchema.__type;

export const SignUpSchema = zod(
  z.object({
    username: z.string().min(3, 'Username is too short'),
    fullName: z.string().min(3, 'Full name is too short'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please re-enter your password'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
);

export type SignUp = typeof SignUpSchema.__type;
