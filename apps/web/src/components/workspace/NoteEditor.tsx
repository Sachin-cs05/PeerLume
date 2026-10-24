import React, { useState } from 'react';
import type { LearningResourceDto, CreateResourceInput } from '@peerlume/shared';
import { apiService } from '../../services/api.js';
import { Button } from '../ui/Button.js';
import { Alert } from '../ui/Alert.js';
import { FileText, Lock, Globe, Save, CheckCircle2, Clock } from 'lucide-react';

interface NoteEditorProps {
  initialNote?: LearningResourceDto | null;
  sessionId?: string;
  onSuccess: (resource: LearningResourceDto) => void;
  onCancel: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  initialNote,
  sessionId,
  onSuccess,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [description, setDescription] = useState(initialNote?.description || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [isPrivate, setIsPrivate] = useState(initialNote?.isPrivate ?? true);

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(initialNote);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Note title is required');
      return;
    }

    setSavingStatus('saving');
    try {
      if (isEditing && initialNote) {
        const res = await apiService.resources.update(initialNote.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          content,
          isPrivate,
        });

        if (res.error) {
          setError(res.error);
          setSavingStatus('failed');
          return;
        }

        if (res.data) {
          setSavingStatus('saved');
          setTimeout(() => onSuccess(res.data!), 600);
        }
      } else {
        const input: CreateResourceInput = {
          type: 'NOTE',
          title: title.trim(),
          description: description.trim() || undefined,
          content,
          isPrivate,
          sessionId,
        };

        const res = await apiService.resources.create(input);
        if (res.error) {
          setError(res.error);
          setSavingStatus('failed');
          return;
        }

        if (res.data) {
          setSavingStatus('saved');
          setTimeout(() => onSuccess(res.data!), 600);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
      setSavingStatus('failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-surface border border-border text-foreground">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isEditing ? 'Edit Study Note' : 'Create Study Note'}
            </h3>
            <p className="text-xs text-foreground-muted">
              {isEditing ? `Last modified ${new Date().toLocaleTimeString()}` : 'Write and save notes in your workspace'}
            </p>
          </div>
        </div>

        {/* Live Saving Status Pill */}
        {savingStatus === 'saving' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-foreground text-xs">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </span>
        )}
        {savingStatus === 'saved' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved</span>
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">
          Note Title *
        </label>
        <input
          type="text"
          required
          placeholder="e.g., Dynamic Programming Memoization Notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {/* Description / Summary */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">
          Short Summary or Tags
        </label>
        <input
          type="text"
          placeholder="e.g., CS301, Midterm prep, Top-down recursion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {/* Note Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-foreground">
            Note Content (Markdown supported)
          </label>
          <span className="text-[11px] text-foreground-muted">
            {wordCount} words • {charCount} chars
          </span>
        </div>
        <textarea
          rows={10}
          placeholder="# Study Notes&#10;&#10;- Key Concept 1: ...&#10;- Formula: ..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg p-3.5 text-sm font-sans text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground transition-colors leading-relaxed font-mono resize-none"
        />
      </div>

      {/* Privacy Switch */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-3.5">
        <div className="flex items-center gap-2.5">
          {isPrivate ? (
            <Lock className="w-4 h-4 text-foreground-muted" />
          ) : (
            <Globe className="w-4 h-4 text-foreground-muted" />
          )}
          <div>
            <div className="text-xs font-semibold text-foreground">
              {isPrivate ? 'Private Note' : 'Shared Resource'}
            </div>
            <div className="text-[11px] text-foreground-muted">
              {isPrivate
                ? 'Only visible to you'
                : sessionId
                ? 'Visible to participants of this session'
                : 'Visible to your connected learning partners'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPrivate(!isPrivate)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
            isPrivate ? 'bg-surface-elevated' : 'bg-foreground'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
              isPrivate ? 'translate-x-1 bg-foreground-muted' : 'translate-x-6 bg-background'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={savingStatus === 'saving'}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={savingStatus === 'saving'}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEditing ? 'Save Changes' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
};
