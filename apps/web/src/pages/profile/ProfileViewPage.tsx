import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Layers,
  Calendar,
  Globe,
  Edit3,
  Eye,
  Sparkles,
  Target,
  Shield,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Alert } from '../../components/ui/Alert.js';
import { apiService } from '../../services/api.js';
import type { StudentProfileDto } from '@peerlume/shared';

export const ProfileViewPage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPublic, setPreviewPublic] = useState(false);

  useEffect(() => {
    apiService.profile
      .getMyProfile()
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
        } else {
          setError(res.error || 'Failed to load profile');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading student profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto p-6 py-12">
        <Alert variant="error" title="Profile Error">
          {error || 'Unable to retrieve your student profile.'}
        </Alert>
        <div className="mt-4">
          <Link to="/dashboard">
            <Button variant="secondary">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const proficiencyColors = {
    BEGINNER: 'neutral',
    INTERMEDIATE: 'neutral',
    ADVANCED: 'neutral',
  } as const;

  const priorityColors = {
    LOW: 'neutral',
    MEDIUM: 'neutral',
    HIGH: 'neutral',
  } as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Public Preview Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span>{previewPublic ? 'Peer Public Preview' : 'My Student Profile'}</span>
            <Badge variant="outline" size="sm">
              {previewPublic ? 'Public View' : 'Private View'}
            </Badge>
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            {previewPublic
              ? 'This is how your profile appears to other students across the PeerLearn network.'
              : 'Manage your academic details, skills you teach, and learning goals.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => setPreviewPublic(!previewPublic)}
          >
            {previewPublic ? 'Exit Public Preview' : 'Preview Public View'}
          </Button>

          {!previewPublic && (
            <Link to="/profile/edit">
              <Button variant="primary" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="border-border bg-card p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Header section with Avatar and Bio */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-24 h-24 rounded-2xl object-cover border border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-3xl font-bold text-foreground shadow-sm">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{profile.fullName}</h2>
              <Badge variant="outline" size="sm">Student</Badge>
              {!previewPublic && (
                <Badge variant="outline" size="sm">
                  Visibility: {profile.visibility.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <p className="text-sm text-foreground-secondary leading-relaxed max-w-2xl">
              {profile.bio || (
                <span className="italic text-foreground-muted">
                  No biography provided yet. Click &quot;Edit Profile&quot; to add a brief introduction.
                </span>
              )}
            </p>

            {!previewPublic && profile.email && (
              <p className="text-xs text-foreground-muted font-mono">
                Email: {profile.email} (Private to you)
              </p>
            )}
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-foreground-muted flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-foreground-secondary" /> College
            </span>
            <span className="text-sm font-semibold text-foreground block truncate" title={profile.college}>
              {profile.college}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-foreground-muted flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-foreground-secondary" /> Degree
            </span>
            <span className="text-sm font-semibold text-foreground block truncate" title={profile.degree}>
              {profile.degree}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-foreground-muted flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-foreground-secondary" /> Branch
            </span>
            <span className="text-sm font-semibold text-foreground block truncate" title={profile.branch}>
              {profile.branch}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-foreground-muted flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-foreground-secondary" /> Semester
            </span>
            <span className="text-sm font-semibold text-foreground block truncate" title={profile.semester}>
              {profile.semester}
            </span>
          </div>
        </div>

        {/* Secondary Info: Languages & Learning Mode */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-foreground-muted" />
            <span className="text-foreground-secondary">Languages:</span>
            <div className="flex flex-wrap gap-1.5">
              {profile.languages.length > 0 ? (
                profile.languages.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 rounded bg-surface text-foreground font-medium border border-border">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-foreground-muted italic">None specified</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground-muted" />
            <span className="text-foreground-secondary">Preferred Learning Mode:</span>
            <span className="px-2.5 py-0.5 rounded-full font-medium bg-surface text-foreground border border-border">
              {profile.preferredLearningMode}
            </span>
          </div>
        </div>
      </Card>

      {/* Skills & Learning Goals Dual Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teaching Skills */}
        <Card className="border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-bold text-lg">
              <Sparkles className="w-5 h-5 text-foreground-secondary" />
              <h3>Skills I Can Teach</h3>
            </div>
            <Badge variant="outline" size="sm">{profile.teachingSkills.length} skills</Badge>
          </div>
          <p className="text-xs text-foreground-secondary">
            Topics and concepts you can mentor or explain to fellow students.
          </p>

          <div className="space-y-2.5 pt-2">
            {profile.teachingSkills.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-foreground-muted text-xs">
                No teaching skills added yet.{' '}
                {!previewPublic && (
                  <Link to="/profile/edit" className="text-foreground underline font-medium">
                    Add skills you can share
                  </Link>
                )}
              </div>
            ) : (
              profile.teachingSkills.map((ts) => (
                <div
                  key={ts.id}
                  className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-sm text-foreground block">{ts.name}</span>
                    {ts.category && (
                      <span className="text-[11px] text-foreground-muted">{ts.category}</span>
                    )}
                  </div>
                  <Badge variant={proficiencyColors[ts.proficiency]} size="sm">
                    {ts.proficiency}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Learning Goals */}
        <Card className="border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-bold text-lg">
              <Target className="w-5 h-5 text-foreground-secondary" />
              <h3>Skills I Want to Learn</h3>
            </div>
            <Badge variant="outline" size="sm">{profile.learningGoals.length} goals</Badge>
          </div>
          <p className="text-xs text-foreground-secondary">
            Areas you want to master through collaboration with study partners.
          </p>

          <div className="space-y-2.5 pt-2">
            {profile.learningGoals.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-foreground-muted text-xs">
                No learning goals added yet.{' '}
                {!previewPublic && (
                  <Link to="/profile/edit" className="text-foreground underline font-medium">
                    Add topics you want to learn
                  </Link>
                )}
              </div>
            ) : (
              profile.learningGoals.map((lg) => (
                <div
                  key={lg.id}
                  className="p-3 rounded-xl bg-surface border border-border space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">{lg.name}</span>
                    <Badge variant={priorityColors[lg.priority]} size="sm">
                      {lg.priority} Priority
                    </Badge>
                  </div>
                  {lg.targetDescription && (
                    <p className="text-xs text-foreground-secondary">{lg.targetDescription}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Safety & Autonomous Architecture Note */}
      <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between text-xs text-foreground-secondary">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-foreground-secondary" />
          <span>Profile data is self-governed and protected by student privacy controls.</span>
        </div>
      </div>
    </div>
  );
};
