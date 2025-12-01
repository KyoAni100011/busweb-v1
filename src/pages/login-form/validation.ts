import { zod } from '@/lib/utils';
import { z } from 'zod';

export const SignUpSchema = zod(
  z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
);

export type SignUp = typeof SignUpSchema.__type;
