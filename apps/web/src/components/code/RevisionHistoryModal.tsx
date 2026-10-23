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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Revision History</h3>
              <p className="text-xs text-slate-400">{documentTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-sm">Loading revisions...</span>
          </div>
        ) : revisions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No revisions recorded yet for this document.
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Revision List (Left) */}
            <div className="w-1/3 border-r border-slate-800 overflow-y-auto divide-y divide-slate-800/60">
              {revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                const date = new Date(rev.createdAt);

                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                      {rev.description || 'Snapshot checkpoint'}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
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
            <div className="w-2/3 flex flex-col bg-slate-950 overflow-hidden">
              {selectedRevision && (
                <>
                  <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/60">
                    <span className="text-slate-400">
                      {new Date(selectedRevision.createdAt).toLocaleString()} by{' '}
                      <strong className="text-slate-200">{selectedRevision.creatorName}</strong>
                    </span>

                    {canRestore && (
                      <button
                        onClick={() => handleRestore(selectedRevision.id)}
                        disabled={restoringId === selectedRevision.id}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{restoringId === selectedRevision.id ? 'Restoring...' : 'Restore'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre selection:bg-indigo-500 selection:text-white">
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
