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
    <div className="bg-card border-l border-border w-80 md:w-96 flex flex-col h-full shadow-2xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-foreground-secondary" />
          <span>Templates & Sandbox</span>
        </div>
        <button onClick={onClose} className="text-foreground-muted hover:text-foreground p-1 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sandbox Security Notice */}
        <div className="p-3.5 bg-surface border border-border-subtle rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <ShieldCheck className="w-4 h-4 text-foreground-secondary" />
            <span>Execution Sandbox Boundary</span>
          </div>
          <p className="text-foreground-secondary leading-relaxed text-[11px]">
            Arbitrary server-side execution is strictly disabled on this deployment to protect host resources and student privacy. Real-time collaborative CRDT editing and persistence are fully live.
          </p>
        </div>

        {/* Starter Templates */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground">
            Language Starter Templates
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
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
          <div className="text-[11px] font-medium text-foreground-muted">Template Preview:</div>
          <pre className="p-3 bg-surface rounded-xl border border-border font-mono text-[11px] text-foreground-secondary overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
            {templateCode}
          </pre>
        </div>

        {canEdit && (
          <button
            onClick={handleApply}
            className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Document to Template</span>
          </button>
        )}
      </div>
    </div>
  );
};
