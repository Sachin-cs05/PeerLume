import React, { useState } from 'react';
import {
  Save,
  Copy,
  History,
  Share2,
  Check,
  Code2,
  Edit2,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@peerlume/shared';
import type { WorkspaceRole } from '@peerlume/shared';
import type { ConnectionStatus } from '../../services/yjsSocketProvider';

interface WorkspaceHeaderProps {
  title: string;
  sessionTitle?: string | null;
  role: WorkspaceRole;
  language: string;
  connectionStatus: ConnectionStatus;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  version: number;
  isOwner: boolean;
  onLanguageChange: (lang: string) => void;
  onTitleChange: (newTitle: string) => void;
  onSave: () => void;
  onCopy: () => void;
  onOpenRevisions: () => void;
  onToggleSandbox: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  sessionTitle,
  role,
  language,
  connectionStatus,
  saveStatus,
  version,
  isOwner,
  onLanguageChange,
  onTitleChange,
  onSave,
  onCopy,
  onOpenRevisions,
  onToggleSandbox,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim() && titleInput !== title) {
      onTitleChange(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="bg-card border-b border-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-foreground">
      {/* Left: Title, Session context, and Role */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-xs">
          <Code2 className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            {isEditingTitle && isOwner ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  autoFocus
                  className="bg-surface text-foreground font-bold text-base px-2 py-0.5 rounded border border-foreground focus:outline-none"
                />
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-foreground font-bold text-base">{title}</h1>
                {isOwner && (
                  <button
                    onClick={() => {
                      setTitleInput(title);
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-foreground transition-opacity p-0.5"
                    title="Rename workspace"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Role Badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                role === 'OWNER'
                  ? 'bg-surface-elevated text-foreground border-border'
                  : 'bg-surface text-foreground-secondary border-border-subtle'
              }`}
            >
              {role}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-foreground-muted mt-0.5">
            {sessionTitle && (
              <span className="flex items-center gap-1 text-foreground-secondary font-medium">
                <Calendar className="w-3 h-3 text-foreground-muted" />
                Session: {sessionTitle}
              </span>
            )}
            <span>v{version}</span>
          </div>
        </div>
      </div>

      {/* Middle: Status Pills */}
      <div className="flex items-center gap-2.5">
        {/* Connection Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            connectionStatus === 'connected'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
              : connectionStatus === 'connecting'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 animate-pulse'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="capitalize">{connectionStatus}</span>
        </div>

        {/* Save Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            saveStatus === 'saved'
              ? 'bg-surface text-foreground-secondary border-border-subtle'
              : saveStatus === 'saving'
              ? 'bg-surface text-foreground border-border animate-pulse'
              : saveStatus === 'unsaved'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
          }`}
        >
          <span>
            {saveStatus === 'saved'
              ? '✓ Saved'
              : saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'unsaved'
              ? '● Unsaved'
              : 'Save Failed'}
          </span>
        </div>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={role === 'VIEWER'}
          className="bg-surface text-foreground text-xs font-medium rounded-lg px-2.5 py-1.5 border border-border focus:outline-none focus:border-foreground disabled:opacity-60 cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSandbox}
          className="p-2 text-foreground-secondary hover:text-foreground bg-surface hover:bg-surface-hover rounded-lg border border-border transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          title="Sandbox security & starter templates"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-foreground-muted" />
          <span className="hidden sm:inline">Templates & Sandbox</span>
        </button>

        <button
          onClick={onOpenRevisions}
          className="p-2 text-foreground-secondary hover:text-foreground bg-surface hover:bg-surface-hover rounded-lg border border-border transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          title="View document revisions"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Revisions</span>
        </button>

        <button
          onClick={onCopy}
          className="p-2 text-foreground-secondary hover:text-foreground bg-surface hover:bg-surface-hover rounded-lg border border-border transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          title="Copy full code to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Copy</span>
        </button>

        <button
          onClick={handleShareLink}
          className="p-2 text-foreground-secondary hover:text-foreground bg-surface hover:bg-surface-hover rounded-lg border border-border transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
          title="Copy workspace share link"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

        {role !== 'VIEWER' && (
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Save code checkpoint (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        )}
      </div>
    </header>
  );
};
