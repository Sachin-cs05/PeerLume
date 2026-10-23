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
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Title, Session context, and Role */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Code2 className="w-5 h-5" />
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
                  className="bg-slate-800 text-white font-bold text-lg px-2 py-0.5 rounded border border-indigo-500 focus:outline-none"
                />
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-white font-bold text-lg">{title}</h1>
                {isOwner && (
                  <button
                    onClick={() => {
                      setTitleInput(title);
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-0.5"
                    title="Rename workspace"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Role Badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                role === 'OWNER'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : role === 'EDITOR'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {role}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            {sessionTitle && (
              <span className="flex items-center gap-1 text-indigo-400">
                <Calendar className="w-3 h-3" />
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
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : connectionStatus === 'connecting'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-400'
                : connectionStatus === 'connecting'
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
          />
          <span className="capitalize">{connectionStatus}</span>
        </div>

        {/* Save Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            saveStatus === 'saved'
              ? 'bg-slate-800 text-slate-300 border-slate-700'
              : saveStatus === 'saving'
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 animate-pulse'
              : saveStatus === 'unsaved'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
          className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
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
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Sandbox security & starter templates"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Templates & Sandbox</span>
        </button>

        <button
          onClick={onOpenRevisions}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="View document revisions"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Revisions</span>
        </button>

        <button
          onClick={onCopy}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Copy full code to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Copy</span>
        </button>

        <button
          onClick={handleShareLink}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Copy workspace share link"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

        {role !== 'VIEWER' && (
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
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
