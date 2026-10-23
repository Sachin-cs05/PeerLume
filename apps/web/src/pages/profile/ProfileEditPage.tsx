import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Target,
  User,
  Globe,
  Lock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Alert } from '../../components/ui/Alert.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { apiService } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import type {
  PreferredLearningMode,
  ProfileVisibility,
  SkillProficiency,
  GoalPriority,
} from '@peerlume/shared';

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [preferredLearningMode, setPreferredLearningMode] = useState<PreferredLearningMode>('HYBRID');
  const [visibility, setVisibility] = useState<ProfileVisibility>('PUBLIC');

  // Teaching skills state
  const [teachingSkills, setTeachingSkills] = useState<
    { name: string; category?: string; proficiency: SkillProficiency }[]
  >([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>('INTERMEDIATE');

  // Learning goals state
  const [learningGoals, setLearningGoals] = useState<
    { name: string; category?: string; targetDescription?: string; priority: GoalPriority }[]
  >([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<GoalPriority>('MEDIUM');

  useEffect(() => {
    apiService.profile
      .getMyProfile()
      .then((res) => {
        if (res.data) {
          const p = res.data;
          setFullName(p.fullName);
          setAvatarUrl(p.avatarUrl || '');
          setCollege(p.college);
          setDegree(p.degree);
          setBranch(p.branch);
          setSemester(p.semester);
          setBio(p.bio || '');
          setLanguages(p.languages || []);
          setPreferredLearningMode(p.preferredLearningMode);
          setVisibility(p.visibility);
          setTeachingSkills(
            p.teachingSkills.map((ts) => ({
              name: ts.name,
              category: ts.category || 'General',
              proficiency: ts.proficiency,
            }))
          );
          setLearningGoals(
            p.learningGoals.map((lg) => ({
              name: lg.name,
              category: lg.category || 'General',
              targetDescription: lg.targetDescription || '',
              priority: lg.priority,
            }))
          );
        } else {
          setError(res.error || 'Failed to fetch profile details');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguages(languages.filter((l) => l !== langToRemove));
  };

  const handleAddTeachingSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (teachingSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('You have already added this teaching skill.');
      return;
    }
    setTeachingSkills([
      ...teachingSkills,
      { name: trimmed, proficiency: newSkillProficiency },
    ]);
    setNewSkillName('');
    setError(null);
  };

  const handleRemoveTeachingSkill = (index: number) => {
    setTeachingSkills(teachingSkills.filter((_, i) => i !== index));
  };

  const handleAddLearningGoal = () => {
    const trimmed = newGoalName.trim();
    if (!trimmed) return;
    if (learningGoals.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('You have already added this learning goal.');
      return;
    }
    setLearningGoals([
      ...learningGoals,
      {
        name: trimmed,
        targetDescription: newGoalDescription.trim() || undefined,
        priority: newGoalPriority,
      },
    ]);
    setNewGoalName('');
    setNewGoalDescription('');
    setError(null);
  };

  const handleRemoveLearningGoal = (index: number) => {
    setLearningGoals(learningGoals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // 1. Update basic profile fields
      const profileResult = await apiService.profile.updateMyProfile({
        fullName,
        avatarUrl: avatarUrl.trim() || null,
        college,
        degree,
        branch,
        semester,
        bio: bio.trim() || null,
        languages,
        preferredLearningMode,
        visibility,
      });

      if (profileResult.error) {
        throw new Error(profileResult.error);
      }

      // 2. Sync teaching skills
      const skillsResult = await apiService.profile.setTeachingSkills(teachingSkills);
      if (skillsResult.error) {
        throw new Error(skillsResult.error);
      }

      // 3. Sync learning goals
      const goalsResult = await apiService.profile.setLearningGoals(learningGoals);
      if (goalsResult.error) {
        throw new Error(goalsResult.error);
      }

      await refreshUser();
      setSuccess('Profile and skills updated successfully!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading profile editor..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Edit Student Profile
          </h1>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          isLoading={saving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save All Changes
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic & Academic Information */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-brand-400" />
            <h3>Basic & Academic Credentials</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              helperText="Paste a link to your student avatar or picture"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="College or University"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
            />

            <Input
              label="Degree / Course"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch / Department"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            />

            <Input
              label="Semester / Year"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Biography / Introduction
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              placeholder="Tell fellow students about your academic interests, study habits, or current projects..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 p-3 text-sm text-slate-100 placeholder-slate-400 backdrop-blur-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-600"
            />
            <p className="text-right text-[11px] text-slate-500">{bio.length} / 500 characters</p>
          </div>
        </Card>

        {/* Preferences: Learning Mode & Visibility */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-teal-400" />
            <h3>Study Preferences & Privacy Controls</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Preferred Learning Mode
              </label>
              <select
                value={preferredLearningMode}
                onChange={(e) => setPreferredLearningMode(e.target.value as PreferredLearningMode)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 p-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="HYBRID">Hybrid (Online & In-Person)</option>
                <option value="ONLINE">Online Study Sessions Only</option>
                <option value="IN_PERSON">In-Person Campus Meetups Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Profile Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 p-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="PUBLIC">Public (All PeerLume Students)</option>
                <option value="CAMPUS_ONLY">Campus Only (My College)</option>
                <option value="CONNECTIONS_ONLY">Connections Only (Mutual Friends)</option>
              </select>
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Languages Spoken
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. English, Spanish, Hindi"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLanguage();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddLanguage}>
                Add Language
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Skills I Can Teach Manager */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3>Skills I Can Teach (Mentorship & Exchange)</h3>
            </div>
            <span className="text-xs text-slate-400">{teachingSkills.length} added</span>
          </div>

          {/* Add skill input form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Skill name (e.g. Data Structures, React, Linear Algebra)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value as SkillProficiency)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-100"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <Button type="button" variant="primary" size="sm" onClick={handleAddTeachingSkill} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add
              </Button>
            </div>
          </div>

          {/* Skill items list */}
          <div className="space-y-2 pt-2">
            {teachingSkills.map((skill, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-sm text-white">{skill.name}</span>
                  <span className="ml-2 text-xs text-brand-300 font-mono">({skill.proficiency})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTeachingSkill(index)}
                  className="text-slate-400 hover:text-rose-400 p-1"
                  aria-label="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills I Want to Learn Manager */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Target className="w-5 h-5 text-teal-400" />
              <h3>Skills I Want to Learn (Learning Goals)</h3>
            </div>
            <span className="text-xs text-slate-400">{learningGoals.length} added</span>
          </div>

          {/* Add goal input form */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Topic or course goal (e.g. Operating Systems, System Design)"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <select
                  value={newGoalPriority}
                  onChange={(e) => setNewGoalPriority(e.target.value as GoalPriority)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-100"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Optional goal notes (e.g. Preparing for midterm exams / project collaboration)"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddLearningGoal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Goal
              </Button>
            </div>
          </div>

          {/* Goal items list */}
          <div className="space-y-2 pt-2">
            {learningGoals.map((goal, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-sm text-white">{goal.name}</span>
                  <span className="ml-2 text-xs text-amber-300 font-mono">({goal.priority} Priority)</span>
                  {goal.targetDescription && (
                    <p className="text-xs text-slate-400 mt-0.5">{goal.targetDescription}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLearningGoal(index)}
                  className="text-slate-400 hover:text-rose-400 p-1"
                  aria-label="Remove goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link to="/profile">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
