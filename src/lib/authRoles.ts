const FALLBACK_ADMIN_IDENTIFIERS = ['1ce79eed-93db-4124-984c-437c4a9b993f', 'admin'];

export interface RoleDescriptor {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  slug?: string | null;
}

export interface RoleAwareUser {
  roleId?: string | null;
  role?: RoleDescriptor | string | null;
  roleName?: string | null;
  roleCode?: string | null;
  roleSlug?: string | null;
  roles?: Array<RoleDescriptor | string | null> | RoleDescriptor | string | null;
}

const envIdentifiers = (import.meta.env.VITE_ADMIN_ROLE_IDS ?? '')
  .split(',')
  .map((identifier) => identifier.trim())
  .filter(Boolean)
  .map((identifier) => identifier.toLowerCase());

const ADMIN_ROLE_IDENTIFIERS = envIdentifiers.length > 0
  ? envIdentifiers
  : FALLBACK_ADMIN_IDENTIFIERS.map((identifier) => identifier.toLowerCase());

const normalize = (value?: string | null) => {
  if (!value) {

    return null;
  }

  return value.trim().toLowerCase();
};

const collectRoleFields = (
  value: unknown,
  accumulator: Array<string | null | undefined>
) => {
  if (!value) {
    return;
  }

  if (typeof value === 'string') {
    accumulator.push(value);

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectRoleFields(item, accumulator));

    return;
  }

  if (typeof value === 'object') {
    const descriptor = value as RoleDescriptor;
    accumulator.push(descriptor.id, descriptor.name, descriptor.code, descriptor.slug);
  }
};

const extractRoleStrings = (data: RoleAwareUser) => {
  const roleStrings: Array<string | null | undefined> = [data.roleId];
  const roleValue = data.role;

  collectRoleFields(roleValue, roleStrings);
  collectRoleFields(data.roles, roleStrings);

  const record = data as Record<string, unknown>;
  const alternateKeys = ['roleName', 'roleCode', 'roleSlug'];

  alternateKeys.forEach((key) => {
    const value = record[key];
    collectRoleFields(value, roleStrings);
  });

  return roleStrings
    .map((roleString) => normalize(roleString))
    .filter((roleString): roleString is string => Boolean(roleString));
};

export const isAdminRole = (data?: RoleAwareUser | null) => {
  if (!data) {

    return false;
  }

  const candidates = extractRoleStrings(data);


  return candidates.some((candidate) => ADMIN_ROLE_IDENTIFIERS.includes(candidate));
};
