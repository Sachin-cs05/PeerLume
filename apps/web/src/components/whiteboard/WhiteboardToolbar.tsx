import React from 'react';
import type { WhiteboardTool } from '@peerlume/shared';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Minus,
  MoveRight,
  Type,
  MousePointer,
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
  History,
  ZoomIn,
  ZoomOut,
  Maximize2,
  List,
  Sparkles,
} from 'lucide-react';

interface WhiteboardToolbarProps {
  tool: WhiteboardTool;
  setTool: (tool: WhiteboardTool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  onShowAccessibleList: () => void;
  onInsertMathTemplate: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isSaving: boolean;
  saveStatus: 'saved' | 'saving' | 'dirty' | 'failed';
  readOnly: boolean;
}

const PALETTE = [
  { id: '#6366f1', label: 'Indigo' },
  { id: '#f43f5e', label: 'Rose' },
  { id: '#10b981', label: 'Emerald' },
  { id: '#f59e0b', label: 'Amber' },
  { id: '#0ea5e9', label: 'Sky' },
  { id: '#a855f7', label: 'Purple' },
  { id: '#0f172a', label: 'Slate' },
  { id: '#ffffff', label: 'White' },
];

const STROKES = [
  { width: 2, label: 'Thin' },
  { width: 4, label: 'Medium' },
  { width: 8, label: 'Thick' },
  { width: 14, label: 'Marker' },
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onShowHistory,
  onShowAccessibleList,
  onInsertMathTemplate,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isSaving,
  saveStatus,
  readOnly,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-700 dark:text-slate-200">
      {/* Tool Selection Group */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button
          onClick={() => setTool('select')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'select' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Select & Pan (V)"
          aria-label="Select tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('pen')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'pen' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Pen (P)"
          aria-label="Pen tool"
        >
          <Pen className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('line')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'line' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Line (L)"
          aria-label="Line tool"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('arrow')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'arrow' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Arrow (A)"
          aria-label="Arrow tool"
        >
          <MoveRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('rectangle')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'rectangle' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Rectangle (R)"
          aria-label="Rectangle tool"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('circle')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'circle' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Circle (C)"
          aria-label="Circle tool"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('text')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'text' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Text Box (T)"
          aria-label="Text tool"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('eraser')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${
            tool === 'eraser' ? 'bg-brand-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Eraser (E)"
          aria-label="Eraser tool"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Colors & Widths */}
      <div className="flex items-center gap-2">
        {/* Color Palette */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {PALETTE.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              disabled={readOnly}
              className={`w-5 h-5 rounded-full border transition-transform ${
                color === c.id ? 'scale-125 ring-2 ring-brand-500 border-white' : 'border-slate-300 dark:border-slate-600 hover:scale-110'
              }`}
              style={{ backgroundColor: c.id }}
              title={c.label}
              aria-label={`Select color ${c.label}`}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {STROKES.map((s) => (
            <button
              key={s.width}
              onClick={() => setStrokeWidth(s.width)}
              disabled={readOnly}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                strokeWidth === s.width
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title={`${s.label} stroke`}
            >
              {s.width}px
            </button>
          ))}
        </div>
      </div>

      {/* Undo/Redo & Zoom & Math Template */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo || readOnly}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || readOnly}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          title="Redo (Ctrl+Y)"
          aria-label="Redo action"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Zoom Controls */}
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium w-12 text-center text-slate-500">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700"
          title="Reset Zoom to 100%"
          aria-label="Reset zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Math Template Button */}
        <button
          onClick={onInsertMathTemplate}
          disabled={readOnly}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 transition-colors"
          title="Insert formula/diagram template"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Formula</span>
        </button>

        {/* Accessible Objects Tree */}
        <button
          onClick={onShowAccessibleList}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
          title="View accessible board elements list"
          aria-label="Accessible elements list"
        >
          <List className="w-4 h-4" />
        </button>

        {/* History Revisions */}
        <button
          onClick={onShowHistory}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
          title="View board revision history"
          aria-label="Revision history"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Clear Board */}
        <button
          onClick={onClear}
          disabled={readOnly}
          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors disabled:opacity-40"
          title="Clear canvas"
          aria-label="Clear whiteboard"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Save Checkpoint */}
        <button
          onClick={onSave}
          disabled={isSaving || readOnly}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          title="Save board checkpoint now"
          aria-label="Save whiteboard"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
        {saveStatus && (
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
            {saveStatus}
          </span>
        )}
      </div>
    </div>
  );
};
