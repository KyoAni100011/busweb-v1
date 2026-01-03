import api from '@/lib/api';
import type { RoleAwareUser } from '@/lib/authRoles';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  full_name?: string;
}

export interface AuthUser extends RoleAwareUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message?: string;
  token?: string;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toRecord = (value: unknown): UnknownRecord | null => {
  if (!isRecord(value)) {
    return null;
  }

  return value as UnknownRecord;
};

const toStringOrNull = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  return null;
};

const gatherRecords = (value: unknown, depth = 0): UnknownRecord[] => {
  const record = toRecord(value);
  if (!record) {
    return [];
  }

  if (depth > 4) {
    return [record];
  }

  const nestedKeys = ['data', 'result', 'payload', 'attributes'];
  const nested = nestedKeys.flatMap((key) =>
    gatherRecords(record[key], depth + 1)
  );

  return [record, ...nested];
};

const decodeJwtPayload = (token: string): UnknownRecord => {
  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) {
      return {};
    }

    const normalizedPayload = payloadSegment
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padding =
      normalizedPayload.length % 4 === 0
        ? ''
        : '='.repeat(4 - (normalizedPayload.length % 4));
    const base64 = `${normalizedPayload}${padding}`;
    const json = atob(base64);
    const decoded = decodeURIComponent(
      Array.from(json)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(decoded) as UnknownRecord;
  } catch (error) {
    console.warn('[auth.service] Failed to decode JWT payload:', error);

    return {};
  }
};

const resolveToken = (records: UnknownRecord[]): string | null => {
  const tokenKeys = ['token', 'accessToken', 'access_token'];

  for (const record of records) {
    for (const key of tokenKeys) {
      const token = toStringOrNull(record[key]);
      if (token) {
        return token;
      }
    }
  }

  return null;
};

const resolveRefreshToken = (records: UnknownRecord[]): string | null => {
  const refreshKeys = ['refreshToken', 'refresh_token'];

  for (const record of records) {
    for (const key of refreshKeys) {
      const refreshToken = toStringOrNull(record[key]);
      if (refreshToken) {
        return refreshToken;
      }
    }
  }

  return null;
};

const resolveUserRecord = (records: UnknownRecord[]): UnknownRecord | null => {
  const userKeys = ['user', 'account', 'profile', 'userData'];

  for (const record of records) {
    for (const key of userKeys) {
      const candidate = toRecord(record[key]);
      if (candidate) {
        return candidate;
      }
    }
  }

  return null;
};

const normalizeAuthResponse = (payload: unknown): AuthResponse => {
  const records = gatherRecords(payload);
  const token = resolveToken(records);

  if (!token) {
    throw new Error('Authentication token missing from response');
  }

  const refreshToken = resolveRefreshToken(records) ?? undefined;
  const jwtPayload = decodeJwtPayload(token);
  const userRecord = resolveUserRecord(records) ?? {};

  const idCandidate =
    toStringOrNull(userRecord.id) ??
    toStringOrNull(jwtPayload.sub) ??
    toStringOrNull(jwtPayload.id) ??
    toStringOrNull(jwtPayload.userId) ??
    toStringOrNull(jwtPayload.user_id) ??
    'unknown';

  const emailCandidate =
    toStringOrNull(userRecord.email) ??
    toStringOrNull(jwtPayload.email) ??
    toStringOrNull(jwtPayload.user_email) ??
    '';

  const nameCandidate =
    toStringOrNull(userRecord.name) ??
    toStringOrNull(jwtPayload.name) ??
    toStringOrNull(jwtPayload.fullName) ??
    toStringOrNull(jwtPayload.displayName) ??
    null;

  const roleIdCandidate =
    toStringOrNull(userRecord.roleId) ??
    toStringOrNull(jwtPayload.roleId) ??
    toStringOrNull(jwtPayload.role_id) ??
    toStringOrNull(jwtPayload.roleCode) ??
    toStringOrNull(jwtPayload.role_code) ??
    toStringOrNull(jwtPayload.role) ??
    null;

  const roleValue = (userRecord.role ??
    jwtPayload.role ??
    null) as AuthUser['role'];

  const rolesValue =
    (userRecord.roles as AuthUser['roles']) ??
    (jwtPayload.roles as AuthUser['roles']) ??
    (jwtPayload.authorities as AuthUser['roles']) ??
    null;

  const roleNameCandidate =
    toStringOrNull(userRecord.roleName) ??
    toStringOrNull(jwtPayload.roleName) ??
    toStringOrNull(jwtPayload.role) ??
    toStringOrNull(jwtPayload.role_name) ??
    null;

  const roleCodeCandidate =
    toStringOrNull(userRecord.roleCode) ??
    toStringOrNull(jwtPayload.roleCode) ??
    toStringOrNull(jwtPayload.role_code) ??
    null;

  const roleSlugCandidate =
    toStringOrNull(userRecord.roleSlug) ??
    toStringOrNull(jwtPayload.roleSlug) ??
    toStringOrNull(jwtPayload.role_slug) ??
    null;

  const user: AuthUser = {
    id: idCandidate,
    email: emailCandidate,
    name: nameCandidate,
    roleId: roleIdCandidate,
    role: roleValue,
    roles: rolesValue,
    roleName: roleNameCandidate,
    roleCode: roleCodeCandidate,
    roleSlug: roleSlugCandidate,
  };

  if (!user.email) {
    console.warn(
      '[auth.service] Email missing from auth response, downstream components may rely on it.'
    );
  }

  return {
    token,
    refreshToken,
    user,
  };
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);

    return normalizeAuthResponse(response.data);
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const fullNameValue = credentials.full_name ?? credentials.fullName;

    const payload = {
      email: credentials.email,
      password: credentials.password,
      username: credentials.username,
      full_name: fullNameValue,
    };

    const response = await api.post('/auth/register', payload);

    if ((response.data as any)?.token) {
      return normalizeAuthResponse(response.data);
    }

    return response.data as RegisterResponse;
  },

  loginWithGoogle: async () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    return new Promise(() => {});
  },

  getMyProfile: async (token: string): Promise<any> => {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return normalizeAuthResponse(response.data);
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
