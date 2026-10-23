import type {
  ApiResponse,
  ApiErrorResponse,
  HealthCheckData,
  AuthUser,
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  StudentProfileDto,
  UpdateProfileInput,
  SkillDto,
  SkillProficiency,
  GoalPriority,
} from '@peerlume/shared';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      credentials: 'include', // Ensures HttpOnly cookies are transmitted
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorBody = body as ApiErrorResponse | null;
      const errorMessage =
        errorBody?.error?.message ||
        `Request failed with status ${response.status} (${response.statusText})`;

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const successBody = body as ApiResponse<T>;
    return {
      data: successBody ? successBody.data : null,
      error: null,
      status: response.status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network connection error';
    return {
      data: null,
      error: message,
      status: 0,
    };
  }
}

export const apiService = {
  // System Health
  async getHealth(): Promise<ApiResult<HealthCheckData>> {
    return apiRequest<HealthCheckData>('/health');
  },

  // Authentication
  auth: {
    async register(input: RegisterInput): Promise<ApiResult<{ user: AuthUser }>> {
      return apiRequest<{ user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async login(input: LoginInput): Promise<ApiResult<{ user: AuthUser }>> {
      return apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async logout(): Promise<ApiResult<null>> {
      return apiRequest<null>('/auth/logout', {
        method: 'POST',
      });
    },

    async getMe(): Promise<ApiResult<{ user: AuthUser }>> {
      return apiRequest<{ user: AuthUser }>('/auth/me');
    },

    async forgotPassword(email: string): Promise<ApiResult<null>> {
      return apiRequest<null>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    async resetPassword(input: ResetPasswordInput): Promise<ApiResult<null>> {
      return apiRequest<null>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async verifyEmail(token: string): Promise<ApiResult<null>> {
      return apiRequest<null>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },

    async resendVerification(email: string): Promise<ApiResult<null>> {
      return apiRequest<null>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  },

  // Student Profiles
  profile: {
    async getMyProfile(): Promise<ApiResult<StudentProfileDto>> {
      return apiRequest<StudentProfileDto>('/profile/me');
    },

    async updateMyProfile(input: UpdateProfileInput): Promise<ApiResult<StudentProfileDto>> {
      return apiRequest<StudentProfileDto>('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },

    async getSkills(query?: string): Promise<ApiResult<SkillDto[]>> {
      const q = query ? `?q=${encodeURIComponent(query)}` : '';
      return apiRequest<SkillDto[]>(`/profile/skills${q}`);
    },

    async setTeachingSkills(
      skills: { name: string; category?: string; proficiency: SkillProficiency }[]
    ): Promise<ApiResult<StudentProfileDto>> {
      return apiRequest<StudentProfileDto>('/profile/teaching-skills', {
        method: 'PUT',
        body: JSON.stringify({ skills }),
      });
    },

    async setLearningGoals(
      goals: { name: string; category?: string; targetDescription?: string; priority: GoalPriority }[]
    ): Promise<ApiResult<StudentProfileDto>> {
      return apiRequest<StudentProfileDto>('/profile/learning-goals', {
        method: 'PUT',
        body: JSON.stringify({ goals }),
      });
    },
  },
};
