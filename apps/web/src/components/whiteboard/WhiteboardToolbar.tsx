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
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-card border border-border rounded-2xl shadow-sm text-foreground">
      {/* Tool Selection Group */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
        <button
          onClick={() => setTool('select')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'select' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Select & Pan (V)"
          aria-label="Select tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('pen')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'pen' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Pen (P)"
          aria-label="Pen tool"
        >
          <Pen className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('line')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'line' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Line (L)"
          aria-label="Line tool"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('arrow')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'arrow' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Arrow (A)"
          aria-label="Arrow tool"
        >
          <MoveRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('rectangle')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'rectangle' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Rectangle (R)"
          aria-label="Rectangle tool"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('circle')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'circle' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Circle (C)"
          aria-label="Circle tool"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('text')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'text' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
            }`}
          title="Text Box (T)"
          aria-label="Text tool"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('eraser')}
          disabled={readOnly}
          className={`p-1.5 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
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
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
          {PALETTE.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              disabled={readOnly}
              className={`w-5 h-5 rounded-full border transition-transform ${color === c.id ? 'scale-125 ring-2 ring-foreground border-background' : 'border-border hover:scale-110'
                }`}
              style={{ backgroundColor: c.id }}
              title={c.label}
              aria-label={`Select color ${c.label}`}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
          {STROKES.map((s) => (
            <button
              key={s.width}
              onClick={() => setStrokeWidth(s.width)}
              disabled={readOnly}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${strokeWidth === s.width
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-surface-hover text-foreground-secondary hover:text-foreground'
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
          className="p-1.5 rounded-lg hover:bg-surface text-foreground-secondary hover:text-foreground disabled:opacity-40 transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || readOnly}
          className="p-1.5 rounded-lg hover:bg-surface text-foreground-secondary hover:text-foreground disabled:opacity-40 transition-colors"
          title="Redo (Ctrl+Y)"
          aria-label="Redo action"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Zoom Controls */}
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg hover:bg-surface text-foreground-secondary hover:text-foreground transition-colors"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium w-12 text-center text-foreground-secondary">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg hover:bg-surface text-foreground-secondary hover:text-foreground transition-colors"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors text-foreground-muted hover:text-foreground"
          title="Reset Zoom to 100%"
          aria-label="Reset zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Math Template Button */}
        <button
          onClick={onInsertMathTemplate}
          disabled={readOnly}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-surface text-foreground hover:bg-surface-hover border border-border transition-colors"
          title="Insert formula/diagram template"
        >
          <Sparkles className="w-3.5 h-3.5 text-foreground-secondary" />
          <span>Formula</span>
        </button>

        {/* Accessible Objects Tree */}
        <button
          onClick={onShowAccessibleList}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors text-foreground-secondary hover:text-foreground"
          title="View accessible board elements list"
          aria-label="Accessible elements list"
        >
          <List className="w-4 h-4" />
        </button>

        {/* History Revisions */}
        <button
          onClick={onShowHistory}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors text-foreground-secondary hover:text-foreground"
          title="View board revision history"
          aria-label="Revision history"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Clear Board */}
        <button
          onClick={onClear}
          disabled={readOnly}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-foreground-muted hover:text-destructive transition-colors disabled:opacity-40"
          title="Clear canvas"
          aria-label="Clear whiteboard"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Save Checkpoint */}
        <button
          onClick={onSave}
          disabled={isSaving || readOnly}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
          title="Save board checkpoint now"
          aria-label="Save whiteboard"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
        {saveStatus && (
          <span className="text-[10px] uppercase font-semibold text-foreground-muted tracking-wider">
            {saveStatus}
          </span>
        )}
      </div>
    </div>
  );
};
