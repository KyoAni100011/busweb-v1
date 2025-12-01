import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDefaultValues } from './zodDefault';
import { z } from 'zod';

export function useZodForm<S extends z.ZodTypeAny>(schema: S) {
  return useForm<z.infer<S>>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(schema),
  });
}
