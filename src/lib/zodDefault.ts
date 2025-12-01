import { z } from 'zod';

export function getDefaultValues<T extends z.ZodTypeAny>(
  schema: T
): z.infer<T> {
  const def = schema._def;

  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const shape: any = def.shape();
      const result: any = {};
      for (const key in shape) {
        result[key] = getDefaultValues(shape[key]);
      }
      return result;
    }

    case z.ZodFirstPartyTypeKind.ZodString:
      return '' as any;

    case z.ZodFirstPartyTypeKind.ZodNumber:
      return 0 as any;

    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return false as any;

    case z.ZodFirstPartyTypeKind.ZodArray:
      return [] as any;

    case z.ZodFirstPartyTypeKind.ZodNullable:
      return null as any;
  }
}
