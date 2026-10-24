import React, { useEffect, useState } from 'react';
import { History, RotateCcw, X, Clock, User, Loader2 } from 'lucide-react';
import type { DocumentRevisionDto } from '@peerlume/shared';
import { api } from '../../services/api';

interface RevisionHistoryModalProps {
  workspaceId: string;
  documentId: string;
  documentTitle: string;
  canRestore: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  workspaceId,
  documentId,
  documentTitle,
  canRestore,
  onClose,
  onRestored,
}) => {
  const [revisions, setRevisions] = useState<DocumentRevisionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<DocumentRevisionDto | null>(null);

  useEffect(() => {
    async function fetchRevisions() {
      try {
        const res = await api.codeWorkspaces.listRevisions(workspaceId, documentId);
        if (res.data) {
          setRevisions(res.data);
          if (res.data.length > 0) {
            setSelectedRevision(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching revisions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRevisions();
  }, [workspaceId, documentId]);

  const handleRestore = async (revId: string) => {
    if (!confirm('Are you sure you want to restore this revision? Current unsaved edits will be preserved as a new revision checkpoint.')) {
      return;
    }

    setRestoringId(revId);
    try {
      const res = await api.codeWorkspaces.restoreRevision(workspaceId, documentId, revId);
      if (res.data) {
        onRestored();
        onClose();
      }
    } catch (err) {
      console.error('Failed to restore revision:', err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden relative text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-foreground" />
            <div>
              <h3 className="text-base font-bold text-foreground">Revision History</h3>
              <p className="text-xs text-foreground-muted">{documentTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-foreground-muted gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
            <span className="text-sm">Loading revisions...</span>
          </div>
        ) : revisions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-foreground-muted text-sm">
            No revisions recorded yet for this document.
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Revision List (Left) */}
            <div className="w-1/3 border-r border-border overflow-y-auto divide-y divide-border-subtle">
              {revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                const date = new Date(rev.createdAt);

                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-surface-elevated border-l-2 border-foreground' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <div className="text-xs font-semibold text-foreground line-clamp-1 mb-1">
                      {rev.description || 'Snapshot checkpoint'}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 line-clamp-1">
                        <User className="w-3 h-3" />
                        {rev.creatorName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preview (Right) */}
            <div className="w-2/3 flex flex-col bg-surface overflow-hidden">
              {selectedRevision && (
                <>
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between text-xs bg-card">
                    <span className="text-foreground-muted">
                      {new Date(selectedRevision.createdAt).toLocaleString()} by{' '}
                      <strong className="text-foreground">{selectedRevision.creatorName}</strong>
                    </span>

                    {canRestore && (
                      <button
                        onClick={() => handleRestore(selectedRevision.id)}
                        disabled={restoringId === selectedRevision.id}
                        className="px-3 py-1 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{restoringId === selectedRevision.id ? 'Restoring...' : 'Restore'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-auto font-mono text-xs text-foreground leading-relaxed whitespace-pre selection:bg-foreground selection:text-background">
                    {selectedRevision.content}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
