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

// -----------------------------------------------------------------------------
// Phase 4: Chat, Calls & Notifications Types
// -----------------------------------------------------------------------------

export type MessageType = 'TEXT' | 'CODE' | 'LINK' | 'RESOURCE' | 'FILE';

export interface MessageMetadata {
  language?: string; // For code snippets (e.g. javascript, python, cpp)
  url?: string;      // For shared links
  title?: string;    // Title of link or snippet
  fileName?: string; // Safe attachment name
  fileSize?: number; // In bytes
  mimeType?: string; // MIME type
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  type: MessageType;
  content: string;
  metadata?: MessageMetadata | null;
  isRead: boolean;
  readAt?: string | null;
  clientTempId?: string | null;
  createdAt: string;
}

export interface SendMessageInput {
  content: string;
  type?: MessageType;
  metadata?: MessageMetadata;
  clientTempId?: string;
}

export interface ConversationParticipant {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  college?: string;
  isOnline?: boolean;
}

export interface ConversationDto {
  id: string;
  participant: ConversationParticipant;
  lastMessage?: MessageDto | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CallType = 'AUDIO' | 'VIDEO';
export type CallStatus =
  | 'INITIATED'
  | 'RINGING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'MISSED'
  | 'ENDED'
  | 'FAILED';

export interface CallSessionDto {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string | null;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string | null;
  type: CallType;
  status: CallStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiateCallInput {
  receiverId: string;
  type: CallType;
}

export interface WebRtcSignalPayload {
  callId: string;
  senderId: string;
  receiverId: string;
  sdp?: { type: 'offer' | 'answer' | 'pranswer' | 'rollback'; sdp?: string };
  candidate?: {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  };
  reason?: string;
}

export type NotificationType =
  | 'FRIEND_REQUEST_RECEIVED'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'CALL_INCOMING'
  | 'CALL_MISSED'
  | 'SESSION_INVITATION_RECEIVED'
  | 'SESSION_INVITATION_ACCEPTED'
  | 'SESSION_INVITATION_DECLINED'
  | 'SESSION_RESCHEDULE_PROPOSED'
  | 'SESSION_RESCHEDULE_RESOLVED'
  | 'SESSION_CANCELLED'
  | 'SESSION_REMINDER';

export interface NotificationDto {
  id: string;
  userId: string;
  actorId?: string | null;
  actorName?: string | null;
  actorAvatar?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// -----------------------------------------------------------------------------
// Phase 5: Sessions, Calendar, Workspace & Dashboard Types
// -----------------------------------------------------------------------------

export type SessionMode = 'ONLINE' | 'IN_PERSON';
export type SessionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'RESCHEDULE_REQUESTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type ParticipantRole = 'ORGANIZER' | 'INVITEE';
export type ParticipantStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type RescheduleStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type ResourceType = 'NOTE' | 'LINK' | 'CODE' | 'DOCUMENT';

export interface SessionParticipantDto {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  college?: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  declinedReason?: string | null;
}

export interface RescheduleProposalDto {
  id: string;
  sessionId: string;
  proposerId: string;
  proposerName: string;
  proposedStartTime: string;
  proposedEndTime: string;
  proposedTimeZone: string;
  reason?: string | null;
  status: RescheduleStatus;
  createdAt: string;
}

export interface LearningSessionDto {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string | null;
  title: string;
  topic: string;
  description?: string | null;
  objectives?: string | null;
  startTime: string; // UTC ISO
  endTime: string;   // UTC ISO
  timeZone: string;
  mode: SessionMode;
  location?: string | null;
  meetingUrl?: string | null;
  status: SessionStatus;
  cancelReason?: string | null;
  notes?: string | null;
  participants: SessionParticipantDto[];
  rescheduleProposals?: RescheduleProposalDto[];
  resourcesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionInput {
  title: string;
  topic: string;
  description?: string;
  objectives?: string;
  startTime: string; // UTC ISO
  endTime: string;   // UTC ISO
  timeZone?: string;
  mode?: SessionMode;
  location?: string;
  inviteeIds: string[];
  notes?: string;
}

export interface ProposeRescheduleInput {
  proposedStartTime: string;
  proposedEndTime: string;
  proposedTimeZone?: string;
  reason?: string;
}

export interface AvailabilityConflict {
  hasConflict: boolean;
  conflictingSessions: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface LearningResourceDto {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
  sessionId?: string | null;
  sessionTitle?: string | null;
  targetUserId?: string | null;
  type: ResourceType;
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceInput {
  sessionId?: string;
  targetUserId?: string;
  type: ResourceType;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  isPrivate?: boolean;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  isPrivate?: boolean;
}

export interface ActivityItemDto {
  id: string;
  type: 'SESSION' | 'RESOURCE' | 'CONNECTION' | 'GOAL';
  title: string;
  description?: string;
  timestamp: string;
}

export interface DashboardSummaryDto {
  upcomingSessionsCount: number;
  pendingInvitationsCount: number;
  completedSessionsCount: number;
  totalStudyHours: number;
  learningGoalsCount: number;
  teachingSkillsCount: number;
  sharedResourcesCount: number;
  recentActivity: ActivityItemDto[];
  upcomingSessions: LearningSessionDto[];
  pendingInvitations: LearningSessionDto[];
  recentResources: LearningResourceDto[];
}


