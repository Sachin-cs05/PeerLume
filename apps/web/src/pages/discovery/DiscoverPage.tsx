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
import { EmptyState } from '../../components/ui/EmptyState.js';
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
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-hover border border-border text-foreground text-xs font-medium">
                <Compass className="w-3.5 h-3.5" />
                <span>Partner Discovery</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Discover Learning Partners
              </h1>
              <p className="text-xs sm:text-sm text-foreground-secondary max-w-2xl leading-relaxed">
                Connect with peers who can mentor you in topics you want to learn, and exchange knowledge collaboratively.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-background p-1 rounded-lg border border-border shrink-0 self-start md:self-center">
              <button
                onClick={() => {
                  setViewMode('recommended');
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'recommended'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Matching</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('directory');
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'directory'
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Students</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, bio, or college..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-background border border-border text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground dark:focus:border-white focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>

            {/* Skill Filter */}
            <div className="relative">
              <BookOpen className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by skill (e.g. Python, React)"
                value={skillFilter}
                onChange={(e) => {
                  setSkillFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-background border border-border text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground dark:focus:border-white focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>

            {/* College Filter */}
            <div className="relative">
              <GraduationCap className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by university / campus"
                value={collegeFilter}
                onChange={(e) => {
                  setCollegeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-background border border-border text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground dark:focus:border-white focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>

            {/* Branch Filter */}
            <div>
              <input
                type="text"
                placeholder="Filter by branch (e.g. CS, EE)"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2 rounded-lg bg-background border border-border text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground dark:focus:border-white focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Learning Mode */}
              <select
                value={preferredMode}
                onChange={(e) => {
                  setPreferredMode(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground focus:outline-none"
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
                className="px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground placeholder:text-foreground-muted focus:outline-none max-w-[140px]"
              />

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface-hover text-foreground hover:bg-surface-hover/80 border border-border transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-foreground-muted">
              <span>
                Found <strong className="text-foreground">{totalItems}</strong> {totalItems === 1 ? 'peer' : 'peers'}
              </span>
              <button
                onClick={fetchResults}
                disabled={loading}
                className="p-1 rounded-md hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-card border border-border rounded-xl p-5 h-64 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-hover" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-surface-hover rounded w-3/4" />
                      <div className="h-3 bg-surface-hover rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-2.5 bg-surface-hover rounded w-full" />
                  <div className="h-2.5 bg-surface-hover rounded w-2/3" />
                </div>
                <div className="h-8 bg-surface-hover rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-xl bg-card border border-border text-center space-y-3 max-w-lg mx-auto">
            <p className="text-sm text-rose-500">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchResults}>
              Retry Discovery
            </Button>
          </div>
        ) : (viewMode === 'recommended' && recommendations.length === 0) ||
          (viewMode === 'directory' && directoryStudents.length === 0) ? (
          <EmptyState
            icon={<Compass className="w-6 h-6" />}
            title="No Learning Partners Found"
            description={
              hasActiveFilters
                ? 'Try broadening your skill keywords, campus filters, or clearing specific constraints to see more students.'
                : 'Update your teaching skills and learning goals in your profile to discover compatible peers!'
            }
            action={
              hasActiveFilters
                ? {
                  label: 'Clear Active Filters',
                  variant: 'outline',
                  onClick: handleResetFilters,
                }
                : {
                  label: 'Add Skills & Goals',
                  href: '/profile/edit',
                }
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="text-xs text-foreground-muted font-medium">
              Page <strong className="text-foreground">{page}</strong> of{' '}
              <strong className="text-foreground">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
