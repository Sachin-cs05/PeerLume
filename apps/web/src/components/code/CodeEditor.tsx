import React, { useEffect, useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import type { SocketIoYjsProvider } from '../../services/yjsSocketProvider';
import type { WorkspaceRole } from '@peerlume/shared';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  provider: SocketIoYjsProvider | null;
  language: string;
  role: WorkspaceRole;
  onContentChange?: (content: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  provider,
  language,
  role,
  onContentChange,
}) => {
  const editorRef = useRef<any>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const isReadOnly = role === 'VIEWER';

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Set custom monaco theme preferences
    monaco.editor.defineTheme('peerlume-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
      ],
      colors: {
        'editor.background': '#0b0f19',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#1e293b55',
        'editorCursor.foreground': '#6366f1',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#94a3b8',
      },
    });

    monaco.editor.setTheme('peerlume-dark');
  };

  useEffect(() => {
    if (!editorRef.current || !provider || !isEditorReady) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Clean up previous binding if any
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    try {
      const yText = provider.doc.getText('monaco');

      // Bind Monaco Model to Yjs text and Awareness
      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        provider.awareness
      );

      bindingRef.current = binding;

      // Track local content changes for save status
      const updateListener = () => {
        onContentChange?.(yText.toString());
      };
      yText.observe(updateListener);

      return () => {
        yText.unobserve(updateListener);
        if (bindingRef.current) {
          bindingRef.current.destroy();
          bindingRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error binding Monaco with Yjs:', err);
    }
  }, [provider, isEditorReady, onContentChange]);

  // Update read-only state dynamically
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        readOnly: isReadOnly,
      });
    }
  }, [isReadOnly]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0b0f19] overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {isReadOnly && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
          <span>👀 Read-only mode: You have viewer permissions in this workspace.</span>
          <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">VIEWER</span>
        </div>
      )}

      <div className="relative flex-1 w-full h-full">
        <Editor
          height="100%"
          language={language === 'c++' ? 'cpp' : language}
          theme="peerlume-dark"
          options={{
            readOnly: isReadOnly,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
            lineNumbers: 'on',
            minimap: { enabled: false },
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
          }}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Initializing Collaborative Monaco Editor...</p>
            </div>
          }
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
};
