import React, { useState, useEffect, useCallback } from 'react';
import type { PartnerRecommendation, StudentSearchItem } from '@peerlume/shared';
import {
  Compass,
  Search,
  RefreshCw,
  Sparkles,
  Users,
  X,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { StudentCard } from '../../components/discovery/StudentCard.js';
import { api } from '../../services/api.js';

export const DiscoverPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'recommended' | 'directory'>('recommended');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [preferredMode, setPreferredMode] = useState<string>('');

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Result lists
  const [recommendations, setRecommendations] = useState<PartnerRecommendation[]>([]);
  const [directoryStudents, setDirectoryStudents] = useState<StudentSearchItem[]>([]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (viewMode === 'recommended') {
      const res = await api.discovery.getRecommendedPartners({
        q: searchQuery || undefined,
        skill: skillFilter || undefined,
        college: collegeFilter || undefined,
        branch: branchFilter || undefined,
        semester: semesterFilter || undefined,
        language: languageFilter || undefined,
        preferredMode: preferredMode || undefined,
        page,
        limit,
      });

      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setRecommendations(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.total);
      }
    } else {
      const res = await api.students.search({
        q: searchQuery || undefined,
        college: collegeFilter || undefined,
        branch: branchFilter || undefined,
        semester: semesterFilter || undefined,
        teachingSkill: skillFilter || undefined,
        page,
        limit,
      });

      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setDirectoryStudents(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.total);
      }
    }
  }, [
    viewMode,
    searchQuery,
    skillFilter,
    collegeFilter,
    branchFilter,
    semesterFilter,
    languageFilter,
    preferredMode,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSkillFilter('');
    setCollegeFilter('');
    setBranchFilter('');
    setSemesterFilter('');
    setLanguageFilter('');
    setPreferredMode('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      skillFilter ||
      collegeFilter ||
      branchFilter ||
      semesterFilter ||
      languageFilter ||
      preferredMode
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900/40 via-purple-900/20 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>Learning Partner Discovery</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Discover Learning Partners
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Connect with peers who can mentor you in the skills you want to learn, and share what you know in return.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start md:self-center shadow-lg">
              <button
                onClick={() => {
                  setViewMode('recommended');
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'recommended'
                    ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Smart Matching</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('directory');
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'directory'
                    ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Students</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, bio, or college..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Skill Filter */}
            <div className="relative">
              <BookOpen className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by skill (e.g. Python, React)"
                value={skillFilter}
                onChange={(e) => {
                  setSkillFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* College Filter */}
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by college / university"
                value={collegeFilter}
                onChange={(e) => {
                  setCollegeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Branch Filter */}
            <div>
              <input
                type="text"
                placeholder="Filter by branch (e.g. CS, Mechanical)"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Learning Mode */}
              <select
                value={preferredMode}
                onChange={(e) => {
                  setPreferredMode(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none"
              >
                <option value="">Any Learning Mode</option>
                <option value="ONLINE">Online Only</option>
                <option value="IN_PERSON">In-Person Only</option>
                <option value="HYBRID">Hybrid</option>
              </select>

              {/* Language Filter */}
              <input
                type="text"
                placeholder="Language (e.g. English)"
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 placeholder-slate-500 focus:outline-none max-w-[140px]"
              />

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span>
                Found <strong className="text-white">{totalItems}</strong> {totalItems === 1 ? 'peer' : 'peers'}
              </span>
              <button
                onClick={fetchResults}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Refresh list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area: Loading, Error, Empty, or Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 h-72 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                </div>
                <div className="h-8 bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-3 max-w-lg mx-auto">
            <p className="text-sm text-rose-300">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchResults}>
              Retry Discovery
            </Button>
          </div>
        ) : (viewMode === 'recommended' && recommendations.length === 0) ||
          (viewMode === 'directory' && directoryStudents.length === 0) ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Learning Partners Found</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {hasActiveFilters
                  ? 'Try broadening your skill keywords, campus filters, or clearing specific constraints to see more students.'
                  : 'Update your teaching skills and learning goals in your profile to discover compatible peers!'}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear Active Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => (window.location.href = '/profile/edit')}
              >
                Add Your Skills & Goals
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viewMode === 'recommended'
              ? recommendations.map((rec) => (
                  <StudentCard
                    key={rec.student.id}
                    student={rec.student}
                    recommendation={rec}
                    onRefresh={fetchResults}
                  />
                ))
              : directoryStudents.map((st) => (
                  <StudentCard key={st.id} student={st} onRefresh={fetchResults} />
                ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-400 font-medium">
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
