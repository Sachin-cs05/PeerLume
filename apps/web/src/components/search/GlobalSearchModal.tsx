import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.js';
import type { SearchResultItem, SearchEntityType } from '@peerlume/shared';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<SearchEntityType>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      apiService.search
        .query(query.trim(), activeType)
        .then((res) => {
          if (res.data) {
            setResults(res.data.results);
            setSelectedIndex(0);
          }
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        navigate(selected.url);
        onClose();
      }
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'student':
        return <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-surface text-foreground border border-border">Student</span>;
      case 'friend':
        return <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-surface text-foreground border border-border">Friend</span>;
      case 'session':
        return <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-surface text-foreground border border-border">Session</span>;
      case 'resource':
        return <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-surface text-foreground border border-border">Resource</span>;
      case 'workspace':
        return <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-surface text-foreground border border-border">Code</span>;
      case 'study_room':
        return <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-surface text-foreground border border-border">Study Room</span>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden text-foreground transform transition-all duration-200 animate-in fade-in zoom-in-95 ease-out"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-border">
          <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, friends, sessions, code workspaces, study rooms..."
            className="w-full px-3 py-4 bg-transparent outline-none text-base placeholder:text-foreground-muted focus:ring-0 text-foreground"
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-foreground-muted hover:text-foreground rounded-md transition-colors"
              aria-label="Clear search input"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:inline-block text-xs px-2 py-0.5 text-foreground-muted border border-border rounded bg-surface ml-2">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border overflow-x-auto text-xs">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'students', label: 'Students' },
              { id: 'friends', label: 'Friends' },
              { id: 'study_rooms', label: 'Study Rooms' },
              { id: 'workspaces', label: 'Code' },
              { id: 'sessions', label: 'Sessions' },
              { id: 'resources', label: 'Resources' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveType(cat.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] ${
                activeType === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface text-foreground-secondary hover:text-foreground border border-border-subtle'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2" role="listbox">
          {loading ? (
            <div className="py-12 text-center text-foreground-muted">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-foreground border-t-transparent rounded-full mb-2"></div>
              <p className="text-sm">Searching across LearnPeer...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}`}
                role="option"
                aria-selected={idx === selectedIndex}
                onClick={() => {
                  navigate(item.url);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 hover:translate-x-1 ${
                  idx === selectedIndex
                    ? 'bg-surface border border-border-strong text-foreground'
                    : 'hover:bg-surface text-foreground-secondary hover:text-foreground border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-foreground-secondary transition-transform duration-150 group-hover:scale-105">
                    {item.type === 'student' || item.type === 'friend' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : item.type === 'study_room' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ) : item.type === 'workspace' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    ) : item.type === 'session' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm truncate text-foreground">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-foreground-muted truncate">{item.subtitle}</p>}
                  </div>
                </div>
                <div className="shrink-0 ml-3">
                  {getBadge(item.type)}
                </div>
              </div>
            ))
          ) : query ? (
            <div className="py-12 text-center text-foreground-muted">
              <p className="text-sm">No matching items found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-foreground-muted mt-1">Try searching for other topics, friend names, or sessions.</p>
            </div>
          ) : (
            <div className="py-8 text-center text-foreground-muted text-xs">
              Type to search across LearnPeer or use <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↓</kbd> to navigate
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-border text-xs text-foreground-muted">
          <div className="flex items-center gap-3">
            <span><kbd className="font-semibold text-foreground">↵</kbd> Select</span>
            <span><kbd className="font-semibold text-foreground">↑↓</kbd> Navigate</span>
            <span><kbd className="font-semibold text-foreground">esc</kbd> Close</span>
          </div>
          <span>Permission-aware Global Search</span>
        </div>
      </div>
    </div>
  );
};
