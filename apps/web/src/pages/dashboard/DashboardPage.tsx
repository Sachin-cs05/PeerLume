import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Mail,
  ShieldCheck,
  Compass,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Alert } from '../../components/ui/Alert.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiService } from '../../services/api.js';
import type { StudentProfileDto } from '@peerlume/shared';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    apiService.profile
      .getMyProfile()
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Dashboard • Phase 3</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {user?.fullName || 'Student'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your learning profile is active and ready for peer collaboration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/discover">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-4 h-4" />}>
              Find Partners
            </Button>
          </Link>
          <Link to="/connections">
            <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Connections
            </Button>
          </Link>
        </div>
      </div>

      {/* Email Verification Banner if unverified */}
      {user && !user.isEmailVerified && (
        <Alert variant="warning" title="Verification Pending">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span>
              Your student email is not yet verified. Verify your email to activate full peer discovery features.
            </span>
            <Link to="/verify-email">
              <Button size="sm" variant="outline" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                Verify Email
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Profile Overview Card */}
      <Card className="border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md shadow-brand-500/20">
              {user?.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.fullName}</h2>
              <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
            </div>
          </div>

          <Badge variant={user?.isEmailVerified ? 'success' : 'warning'} size="sm">
            {user?.isEmailVerified ? 'Verified Student' : 'Unverified'}
          </Badge>
        </div>

        {loadingProfile ? (
          <div className="py-6 text-center text-xs text-slate-500 animate-pulse">
            Loading student profile overview...
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                College
              </span>
              <span className="text-sm font-semibold text-white truncate block">
                {profile.college}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Degree & Branch
              </span>
              <span className="text-sm font-semibold text-white truncate block">
                {profile.degree} ({profile.branch})
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Teaching Skills
              </span>
              <span className="text-sm font-semibold text-brand-300">
                {profile.teachingSkills.length} configured
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Learning Goals
              </span>
              <span className="text-sm font-semibold text-teal-300">
                {profile.learningGoals.length} configured
              </span>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Upcoming Peer Features Status */}
      {/* Peer Collaboration Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Peer Collaboration Hub</h3>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Phase 3 Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Friends & Connections</h4>
              </div>
              <Badge variant="brand" size="sm">Active</Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manage your network of student peers, review incoming and outgoing requests, save bookmarks, and manage connections.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Peer-governed relationships
              </span>
              <Link to="/connections">
                <Button variant="outline" size="sm">
                  View Connections
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Discover Learning Partners</h4>
              </div>
              <Badge variant="success" size="sm">Smart Match</Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Find students whose teaching skills match what you want to learn, with transparent scoring and reciprocal skill matching.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-400" />
                Configurable weighted matching
              </span>
              <Link to="/discover">
                <Button variant="primary" size="sm">
                  Find Partners
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
