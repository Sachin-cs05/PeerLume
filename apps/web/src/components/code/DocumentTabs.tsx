import React, { useState } from 'react';
import { FileCode, Plus, X } from 'lucide-react';
import type { CodeDocumentDto, WorkspaceRole } from '@peerlume/shared';
import { SUPPORTED_LANGUAGES } from '@peerlume/shared';

interface DocumentTabsProps {
  documents: CodeDocumentDto[];
  activeDocId: string;
  role: WorkspaceRole;
  onSelectDoc: (docId: string) => void;
  onCreateDoc: (title: string, language: string) => void;
  onDeleteDoc: (docId: string) => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  documents,
  activeDocId,
  role,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('typescript');

  const canEdit = role === 'OWNER' || role === 'EDITOR';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onCreateDoc(newTitle.trim(), newLanguage);
      setNewTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center overflow-x-auto gap-1 scrollbar-none py-0.5">
      {documents.map((doc) => {
        const isActive = doc.id === activeDocId;
        return (
          <div
            key={doc.id}
            onClick={() => onSelectDoc(doc.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
              isActive
                ? 'bg-card text-foreground font-semibold border-border shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover border-transparent'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-foreground' : 'text-foreground-muted'}`} />
            <span>{doc.title}</span>

            {canEdit && documents.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete file "${doc.title}"?`)) {
                    onDeleteDoc(doc.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-0.5 rounded"
                title="Delete file"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* New File Button */}
      {canEdit && (
        <div className="relative">
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
              <input
                type="text"
                placeholder="filename.ext"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="bg-surface text-foreground text-xs px-2 py-1 rounded focus:outline-none border border-border w-28"
              />
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="bg-surface text-foreground-secondary text-xs px-1.5 py-1 rounded border border-border focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-2 py-1 bg-foreground text-background rounded text-xs font-semibold hover:bg-foreground/90"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 text-foreground-muted hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg border border-transparent transition-colors"
              title="Add document"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New File</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
