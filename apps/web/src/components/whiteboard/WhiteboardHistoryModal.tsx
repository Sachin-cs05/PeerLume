import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.js';
import type { WhiteboardRevisionDto } from '@peerlume/shared';
import { X, History, RotateCcw, Clock } from 'lucide-react';

interface WhiteboardHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onRestore: (revisionId: string) => Promise<void>;
  readOnly: boolean;
}

export const WhiteboardHistoryModal: React.FC<WhiteboardHistoryModalProps> = ({
  isOpen,
  onClose,
  roomId,
  onRestore,
  readOnly,
}) => {
  const [revisions, setRevisions] = useState<WhiteboardRevisionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiService.studyRooms
        .listRevisions(roomId)
        .then((res) => {
          if (res.data) {
            setRevisions(res.data);
            if (res.data.length > 0) {
              setSelectedId(res.data[0].id);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const selectedRev = revisions.find((r) => r.id === selectedId);

  const handleConfirmRestore = async () => {
    if (!selectedId) return;
    setRestoring(true);
    try {
      await onRestore(selectedId);
      onClose();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Whiteboard Revision History"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-foreground" />
            <h2 className="text-base font-semibold">Whiteboard Revision History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close revisions modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border flex-1 overflow-hidden">
          {/* Checkpoints list */}
          <div className="overflow-y-auto p-3 space-y-2 max-h-80 sm:max-h-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted px-2">Saved Snapshots</p>
            {loading ? (
              <div className="py-8 text-center text-foreground-muted text-sm">Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div className="py-8 text-center text-foreground-muted text-sm">No saved revisions yet. Use &ldquo;Save&rdquo; to create a snapshot.</div>
            ) : (
              revisions.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => setSelectedId(rev.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors border ${
                    selectedId === rev.id
                      ? 'bg-surface border-border-strong text-foreground'
                      : 'hover:bg-surface-hover border-border text-foreground-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {rev.description || 'Saved Checkpoint'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                      {rev.elements.length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-foreground-muted">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(rev.createdAt).toLocaleString()}</span>
                  </div>
                  {rev.createdBy && (
                    <p className="text-[11px] text-foreground-muted mt-0.5">By {rev.createdBy.fullName}</p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Revision Preview Details */}
          <div className="p-4 flex flex-col justify-between overflow-y-auto">
            {selectedRev ? (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-foreground">Revision Overview</h3>
                <div className="space-y-2 text-xs text-foreground-secondary mb-4 bg-surface p-3 rounded-xl border border-border">
                  <p><span className="font-semibold text-foreground">Created:</span> {new Date(selectedRev.createdAt).toLocaleString()}</p>
                  <p><span className="font-semibold text-foreground">Description:</span> {selectedRev.description || 'Snapshot'}</p>
                  <p><span className="font-semibold text-foreground">Total Objects:</span> {selectedRev.elements.length}</p>
                  {selectedRev.createdBy && (
                    <p><span className="font-semibold text-foreground">Saved by:</span> {selectedRev.createdBy.fullName}</p>
                  )}
                </div>

                <div className="border border-border rounded-xl p-3 bg-surface max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold mb-1 text-foreground-muted">Elements Summary:</p>
                  {selectedRev.elements.length === 0 ? (
                    <p className="text-xs text-foreground-muted">Empty board state</p>
                  ) : (
                    <ul className="text-xs space-y-1 text-foreground-secondary">
                      {selectedRev.elements.slice(0, 8).map((el, idx) => (
                        <li key={idx} className="truncate">
                          • <span className="capitalize font-medium text-foreground">{el.type}</span>: {el.text ? `"${el.text}"` : `${el.color} stroke`}
                        </li>
                      ))}
                      {selectedRev.elements.length > 8 && (
                        <li className="text-[11px] text-foreground-muted italic">
                          + {selectedRev.elements.length - 8} more objects...
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-foreground-muted text-sm">Select a checkpoint to view details</div>
            )}

            <div className="pt-4 border-t border-border mt-4 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border text-foreground hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={!selectedRev || restoring || readOnly}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{restoring ? 'Restoring...' : 'Restore Revision'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
