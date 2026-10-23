import React from 'react';
import type { WhiteboardElement } from '@peerlume/shared';
import { X, Type, Square, Circle, Minus, MoveRight, Pen } from 'lucide-react';

interface AccessibleBoardObjectsProps {
  isOpen: boolean;
  onClose: () => void;
  elements: WhiteboardElement[];
}

export const AccessibleBoardObjects: React.FC<AccessibleBoardObjectsProps> = ({
  isOpen,
  onClose,
  elements,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4 text-purple-400" />;
      case 'rectangle':
        return <Square className="w-4 h-4 text-indigo-400" />;
      case 'circle':
        return <Circle className="w-4 h-4 text-blue-400" />;
      case 'line':
        return <Minus className="w-4 h-4 text-emerald-400" />;
      case 'arrow':
        return <MoveRight className="w-4 h-4 text-amber-400" />;
      default:
        return <Pen className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Accessible Whiteboard Elements"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold">Accessible Whiteboard Elements ({elements.length})</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close accessible elements dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2.5">
          {elements.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">The whiteboard is currently empty.</p>
          ) : (
            elements.map((el, index) => (
              <div
                key={el.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shrink-0 mt-0.5">
                  {getIcon(el.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                      #{index + 1} {el.type}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: el.color }}
                      title={`Color: ${el.color}`}
                    />
                  </div>
                  {el.text ? (
                    <p className="text-sm font-medium mt-1 text-slate-900 dark:text-white break-words">
                      &ldquo;{el.text}&rdquo;
                    </p>
                  ) : el.points ? (
                    <p className="text-xs text-slate-500 mt-1">
                      Freehand stroke with {el.points.length} coordinate points ({el.strokeWidth}px width)
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      Shape bounds: {Math.round(el.width || 0)}px × {Math.round(el.height || 0)}px at position ({Math.round(el.x || 0)}, {Math.round(el.y || 0)})
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
