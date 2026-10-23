import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, X, BookOpen } from 'lucide-react';
import { STARTER_TEMPLATES, SUPPORTED_LANGUAGES } from '@peerlume/shared';

interface ExecutionSandboxPanelProps {
  currentLanguage: string;
  canEdit: boolean;
  onResetToTemplate: (templateCode: string) => void;
  onClose: () => void;
}

export const ExecutionSandboxPanel: React.FC<ExecutionSandboxPanelProps> = ({
  currentLanguage,
  canEdit,
  onResetToTemplate,
  onClose,
}) => {
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  const templateCode = STARTER_TEMPLATES[selectedLang] || STARTER_TEMPLATES['typescript'] || '';

  const handleApply = () => {
    if (confirm(`Reset active document to starter template for ${selectedLang.toUpperCase()}? Current edits will be replaced.`)) {
      onResetToTemplate(templateCode);
      onClose();
    }
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 w-80 md:w-96 flex flex-col h-full shadow-2xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Templates & Sandbox</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sandbox Security Notice */}
        <div className="p-3.5 bg-slate-950/80 border border-indigo-500/20 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Execution Sandbox Boundary</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Arbitrary server-side execution is strictly disabled on this deployment to protect host resources and student privacy. Real-time collaborative CRDT editing and persistence are fully live.
          </p>
        </div>

        {/* Starter Templates */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Language Starter Templates
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} Template
              </option>
            ))}
          </select>
        </div>

        {/* Template Code Preview */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-slate-400">Template Preview:</div>
          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
            {templateCode}
          </pre>
        </div>

        {canEdit && (
          <button
            onClick={handleApply}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Document to Template</span>
          </button>
        )}
      </div>
    </div>
  );
};
