export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[] | unknown;
  };
  timestamp: string;
}

export type StandardResponse<T> = ApiResponse<T> | ApiErrorResponse;

export interface HealthDatabaseStatus {
  status: 'connected' | 'disconnected' | 'unconfigured';
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckData {
  status: 'ok' | 'degraded';
  name: string;
  tagline: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database: HealthDatabaseStatus;
}

// -----------------------------------------------------------------------------
// Authentication Types & DTOs
// -----------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  hasProfile: boolean;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  college: string;
  degree: string;
  branch: string;
  semester: string;
  acceptedTerms: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

// -----------------------------------------------------------------------------
// Student Profile Types & DTOs
// -----------------------------------------------------------------------------

export type PreferredLearningMode = 'ONLINE' | 'IN_PERSON' | 'HYBRID';
export type ProfileVisibility = 'PUBLIC' | 'CAMPUS_ONLY' | 'CONNECTIONS_ONLY';
export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SkillDto {
  id: string;
  name: string;
  category?: string | null;
}

export interface TeachingSkillDto {
  id: string;
  skillId: string;
  name: string;
  category?: string | null;
  proficiency: SkillProficiency;
}

export interface LearningGoalDto {
  id: string;
  skillId: string;
  name: string;
  category?: string | null;
  targetDescription?: string | null;
  priority: GoalPriority;
}

export interface StudentProfileDto {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string | null;
  college: string;
  degree: string;
  branch: string;
  semester: string;
  bio?: string | null;
  languages: string[];
  preferredLearningMode: PreferredLearningMode;
  visibility: ProfileVisibility;
  teachingSkills: TeachingSkillDto[];
  learningGoals: LearningGoalDto[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
  college?: string;
  degree?: string;
  branch?: string;
  semester?: string;
  bio?: string | null;
  languages?: string[];
  preferredLearningMode?: PreferredLearningMode;
  visibility?: ProfileVisibility;
}

export interface UpdateTeachingSkillsInput {
  skills: {
    name: string;
    category?: string;
    proficiency: SkillProficiency;
  }[];
}

export interface UpdateLearningGoalsInput {
  goals: {
    name: string;
    category?: string;
    targetDescription?: string;
    priority: GoalPriority;
  }[];
}

// -----------------------------------------------------------------------------
// Phase 3: Connections, Matching & Discovery Types
// -----------------------------------------------------------------------------

export type ConnectionStatus =
  | 'NONE'
  | 'FRIENDS'
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'BLOCKED';

export interface StudentSearchItem {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  college: string;
  degree: string;
  branch: string;
  semester: string;
  bio?: string | null;
  languages: string[];
  preferredLearningMode: PreferredLearningMode;
  visibility: ProfileVisibility;
  teachingSkills: { name: string; proficiency: SkillProficiency }[];
  learningGoals: { name: string; priority: GoalPriority }[];
  connectionStatus: ConnectionStatus;
  connectionRequestId?: string;
  connectionId?: string;
}

export interface MatchExplanation {
  type: 'TEACH_TO_LEARN' | 'RECIPROCAL' | 'SHARED_GOAL' | 'LANGUAGE' | 'ACADEMIC';
  text: string;
  skills?: string[];
}

export interface PartnerRecommendation {
  student: StudentSearchItem;
  matchScore: number; // 0 to 100
  scoreBreakdown: {
    teachToLearn: number; // Max 50
    reciprocal: number;   // Max 25
    sharedGoals: number;  // Max 15
    language: number;     // Max 10
  };
  explanations: MatchExplanation[];
  isSaved?: boolean;
}

export interface FriendRequestDto {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  sender: StudentSearchItem;
  receiver: StudentSearchItem;
  createdAt: string;
}

export interface FriendConnectionDto {
  id: string;
  friendId: string;
  student: StudentSearchItem;
  connectedAt: string;
}

export interface UserBlockDto {
  id: string;
  blockedId: string;
  blockedStudent: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    college?: string;
  };
  reason?: string | null;
  createdAt: string;
}

export interface SavedPartnerDto {
  id: string;
  savedStudentId: string;
  student: StudentSearchItem;
  notes?: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

