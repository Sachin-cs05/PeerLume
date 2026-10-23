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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            <h2 className="text-base font-semibold">Whiteboard Revision History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close revisions modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 flex-1 overflow-hidden">
          {/* Checkpoints list */}
          <div className="overflow-y-auto p-3 space-y-2 max-h-80 sm:max-h-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">Saved Snapshots</p>
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No saved revisions yet. Use &ldquo;Save&rdquo; to create a snapshot.</div>
            ) : (
              revisions.map((rev) => (
                <button
                  key={rev.id}
                  onClick={() => setSelectedId(rev.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors border ${
                    selectedId === rev.id
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {rev.description || 'Saved Checkpoint'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {rev.elements.length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(rev.createdAt).toLocaleString()}</span>
                  </div>
                  {rev.createdBy && (
                    <p className="text-[11px] text-slate-400 mt-0.5">By {rev.createdBy.fullName}</p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Revision Preview Details */}
          <div className="p-4 flex flex-col justify-between overflow-y-auto">
            {selectedRev ? (
              <div>
                <h3 className="text-sm font-semibold mb-2">Revision Overview</h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p><span className="font-semibold text-slate-900 dark:text-white">Created:</span> {new Date(selectedRev.createdAt).toLocaleString()}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">Description:</span> {selectedRev.description || 'Snapshot'}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-white">Total Objects:</span> {selectedRev.elements.length}</p>
                  {selectedRev.createdBy && (
                    <p><span className="font-semibold text-slate-900 dark:text-white">Saved by:</span> {selectedRev.createdBy.fullName}</p>
                  )}
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-950 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold mb-1 text-slate-500">Elements Summary:</p>
                  {selectedRev.elements.length === 0 ? (
                    <p className="text-xs text-slate-400">Empty board state</p>
                  ) : (
                    <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                      {selectedRev.elements.slice(0, 8).map((el, idx) => (
                        <li key={idx} className="truncate">
                          • <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{el.type}</span>: {el.text ? `"${el.text}"` : `${el.color} stroke`}
                        </li>
                      ))}
                      {selectedRev.elements.length > 8 && (
                        <li className="text-[11px] text-slate-400 italic">
                          + {selectedRev.elements.length - 8} more objects...
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">Select a checkpoint to view details</div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={!selectedRev || restoring || readOnly}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 shadow-sm"
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
