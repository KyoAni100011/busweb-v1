import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const zod = <T extends z.ZodTypeAny>(schema: T) => {
  return schema as T & { __type: z.infer<T> };
};
