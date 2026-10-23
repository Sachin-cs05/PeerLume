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
    INTERMEDIATE: 'brand',
    ADVANCED: 'success',
  } as const;

  const priorityColors = {
    LOW: 'neutral',
    MEDIUM: 'warning',
    HIGH: 'danger',
  } as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Public Preview Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{previewPublic ? 'Peer Public Preview' : 'My Student Profile'}</span>
            <Badge variant={previewPublic ? 'warning' : 'brand'} size="sm">
              {previewPublic ? 'Public View' : 'Private View'}
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {previewPublic
              ? 'This is how your profile appears to other students across the PeerLume network.'
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
      <Card className="border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-8">
        {/* Header section with Avatar and Bio */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-500/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-brand-500/20">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
              <Badge variant="brand" size="sm">Student</Badge>
              {!previewPublic && (
                <Badge variant={profile.visibility === 'PUBLIC' ? 'success' : 'warning'} size="sm">
                  Visibility: {profile.visibility.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {profile.bio || (
                <span className="italic text-slate-500">
                  No biography provided yet. Click &quot;Edit Profile&quot; to add a brief introduction.
                </span>
              )}
            </p>

            {!previewPublic && profile.email && (
              <p className="text-xs text-slate-400 font-mono">
                Email: {profile.email} (Private to you)
              </p>
            )}
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" /> College
            </span>
            <span className="text-sm font-semibold text-white block truncate" title={profile.college}>
              {profile.college}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" /> Degree
            </span>
            <span className="text-sm font-semibold text-white block truncate" title={profile.degree}>
              {profile.degree}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Branch
            </span>
            <span className="text-sm font-semibold text-white block truncate" title={profile.branch}>
              {profile.branch}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Semester
            </span>
            <span className="text-sm font-semibold text-white block truncate" title={profile.semester}>
              {profile.semester}
            </span>
          </div>
        </div>

        {/* Secondary Info: Languages & Learning Mode */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Languages:</span>
            <div className="flex flex-wrap gap-1.5">
              {profile.languages.length > 0 ? (
                profile.languages.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">None specified</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Preferred Learning Mode:</span>
            <span className="px-2.5 py-0.5 rounded-full font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {profile.preferredLearningMode}
            </span>
          </div>
        </div>
      </Card>

      {/* Skills & Learning Goals Dual Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teaching Skills */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3>Skills I Can Teach</h3>
            </div>
            <Badge variant="brand" size="sm">{profile.teachingSkills.length} skills</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Topics and concepts you can mentor or explain to fellow students.
          </p>

          <div className="space-y-2.5 pt-2">
            {profile.teachingSkills.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No teaching skills added yet.{' '}
                {!previewPublic && (
                  <Link to="/profile/edit" className="text-brand-400 underline">
                    Add skills you can share
                  </Link>
                )}
              </div>
            ) : (
              profile.teachingSkills.map((ts) => (
                <div
                  key={ts.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-sm text-slate-200 block">{ts.name}</span>
                    {ts.category && (
                      <span className="text-[11px] text-slate-400">{ts.category}</span>
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
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Target className="w-5 h-5 text-teal-400" />
              <h3>Skills I Want to Learn</h3>
            </div>
            <Badge variant="success" size="sm">{profile.learningGoals.length} goals</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Areas you want to master through collaboration with study partners.
          </p>

          <div className="space-y-2.5 pt-2">
            {profile.learningGoals.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No learning goals added yet.{' '}
                {!previewPublic && (
                  <Link to="/profile/edit" className="text-teal-400 underline">
                    Add topics you want to learn
                  </Link>
                )}
              </div>
            ) : (
              profile.learningGoals.map((lg) => (
                <div
                  key={lg.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">{lg.name}</span>
                    <Badge variant={priorityColors[lg.priority]} size="sm">
                      {lg.priority} Priority
                    </Badge>
                  </div>
                  {lg.targetDescription && (
                    <p className="text-xs text-slate-400">{lg.targetDescription}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Safety & Autonomous Architecture Note */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Profile data is self-governed and protected by student privacy controls.</span>
        </div>
        <span className="text-slate-500">PeerLume Phase 2 Architecture</span>
      </div>
    </div>
  );
};
