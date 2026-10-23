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
  StudentSearchItem,
  PartnerRecommendation,
  FriendRequestDto,
  FriendConnectionDto,
  UserBlockDto,
  SavedPartnerDto,
  PaginatedResult,
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

  // Phase 3: Connections & Friends
  connections: {
    async sendRequest(receiverId: string, message?: string): Promise<ApiResult<{ status: string; message: string }>> {
      return apiRequest<{ status: string; message: string }>('/connections/requests', {
        method: 'POST',
        body: JSON.stringify({ receiverId, message }),
      });
    },

    async getIncomingRequests(): Promise<ApiResult<FriendRequestDto[]>> {
      return apiRequest<FriendRequestDto[]>('/connections/requests/incoming');
    },

    async getOutgoingRequests(): Promise<ApiResult<FriendRequestDto[]>> {
      return apiRequest<FriendRequestDto[]>('/connections/requests/outgoing');
    },

    async acceptRequest(requestId: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/connections/requests/${requestId}/accept`, {
        method: 'POST',
      });
    },

    async declineRequest(requestId: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/connections/requests/${requestId}/decline`, {
        method: 'POST',
      });
    },

    async cancelRequest(requestId: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/connections/requests/${requestId}`, {
        method: 'DELETE',
      });
    },

    async getFriends(search?: string): Promise<ApiResult<FriendConnectionDto[]>> {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return apiRequest<FriendConnectionDto[]>(`/connections${query}`);
    },

    async removeFriend(connectionId: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/connections/${connectionId}`, {
        method: 'DELETE',
      });
    },
  },

  // Phase 3: Discovery & Learning Partner Matching
  discovery: {
    async getRecommendedPartners(filters?: {
      q?: string;
      skill?: string;
      college?: string;
      branch?: string;
      semester?: string;
      language?: string;
      preferredMode?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResult<PaginatedResult<PartnerRecommendation>>> {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.skill) params.set('skill', filters.skill);
      if (filters?.college) params.set('college', filters.college);
      if (filters?.branch) params.set('branch', filters.branch);
      if (filters?.semester) params.set('semester', filters.semester);
      if (filters?.language) params.set('language', filters.language);
      if (filters?.preferredMode) params.set('preferredMode', filters.preferredMode);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiRequest<PaginatedResult<PartnerRecommendation>>(`/discovery/partners${qs}`);
    },
  },

  // Phase 3: Student Search & Profiles
  students: {
    async search(filters?: {
      q?: string;
      college?: string;
      branch?: string;
      semester?: string;
      teachingSkill?: string;
      learningGoal?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResult<PaginatedResult<StudentSearchItem>>> {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.college) params.set('college', filters.college);
      if (filters?.branch) params.set('branch', filters.branch);
      if (filters?.semester) params.set('semester', filters.semester);
      if (filters?.teachingSkill) params.set('teachingSkill', filters.teachingSkill);
      if (filters?.learningGoal) params.set('learningGoal', filters.learningGoal);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiRequest<PaginatedResult<StudentSearchItem>>(`/students${qs}`);
    },

    async getPublicDetails(studentId: string): Promise<ApiResult<StudentSearchItem>> {
      return apiRequest<StudentSearchItem>(`/students/${studentId}`);
    },
  },

  // Phase 3: User Blocking
  blocks: {
    async blockStudent(studentId: string, reason?: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/blocks/${studentId}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    async unblockStudent(studentId: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/blocks/${studentId}`, {
        method: 'DELETE',
      });
    },

    async getBlockedStudents(): Promise<ApiResult<UserBlockDto[]>> {
      return apiRequest<UserBlockDto[]>('/blocks');
    },
  },

  // Phase 3: Saved Partners
  savedPartners: {
    async savePartner(studentId: string, notes?: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/saved-partners/${studentId}`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
    },

    async removeSavedPartner(studentId: string): Promise<ApiResult<null>> {
      return apiRequest<null>(`/saved-partners/${studentId}`, {
        method: 'DELETE',
      });
    },

    async getSavedPartners(): Promise<ApiResult<SavedPartnerDto[]>> {
      return apiRequest<SavedPartnerDto[]>('/saved-partners');
    },
  },
};

export const api = apiService;

