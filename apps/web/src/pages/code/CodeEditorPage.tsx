import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { SocketIoYjsProvider } from '../../services/yjsSocketProvider';
import type { ConnectionStatus } from '../../services/yjsSocketProvider';
import { CodeEditor } from '../../components/code/CodeEditor';
import { WorkspaceHeader } from '../../components/code/WorkspaceHeader';
import { DocumentTabs } from '../../components/code/DocumentTabs';
import { ParticipantPresence } from '../../components/code/ParticipantPresence';
import { RevisionHistoryModal } from '../../components/code/RevisionHistoryModal';
import { ExecutionSandboxPanel } from '../../components/code/ExecutionSandboxPanel';
import type { CodeWorkspaceDto, WorkspaceRole } from '@peerlume/shared';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

export const CodeEditorPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [workspace, setWorkspace] = useState<CodeWorkspaceDto | null>(null);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statuses
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [docVersion, setDocVersion] = useState<number>(1);

  // Modals & Drawers
  const [showRevisions, setShowRevisions] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);

  // Active Provider Ref
  const providerRef = useRef<SocketIoYjsProvider | null>(null);
  const [activeProvider, setActiveProvider] = useState<SocketIoYjsProvider | null>(null);

  // Fetch workspace details
  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await api.codeWorkspaces.get(workspaceId);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setWorkspace(res.data);
        if (res.data.documents.length > 0 && !activeDocId) {
          setActiveDocId(res.data.documents[0].id);
          setDocVersion(res.data.documents[0].version);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, activeDocId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  // Connect Yjs Provider when activeDocId, socket, and user are ready
  useEffect(() => {
    if (!socket || !workspaceId || !activeDocId || !user) return;

    // Clean up previous provider
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
      setActiveProvider(null);
    }

    const currentDoc = workspace?.documents.find((d) => d.id === activeDocId);
    if (currentDoc) {
      setDocVersion(currentDoc.version);
    }

    const role: WorkspaceRole = workspace?.currentRole || 'EDITOR';

    const provider = new SocketIoYjsProvider(
      socket,
      workspaceId,
      activeDocId,
      {
        id: user.id,
        name: user.fullName || 'Student',
        avatarUrl: user.avatarUrl,
        role,
      }
    );

    const unsubStatus = provider.onStatus((status) => {
      setConnectionStatus(status);
    });

    providerRef.current = provider;
    setActiveProvider(provider);
    setSaveStatus('saved');

    return () => {
      unsubStatus();
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
        setActiveProvider(null);
      }
    };
  }, [socket, workspaceId, activeDocId, user, workspace?.currentRole]);

  // Save handler
  const handleSave = async (description?: string) => {
    if (!workspaceId || !activeDocId) return;
    setSaveStatus('saving');
    try {
      const res = await api.codeWorkspaces.saveDocument(workspaceId, activeDocId, description);
      if (res.data) {
        setSaveStatus('saved');
        setDocVersion(res.data.version);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Error saving document:', err);
      setSaveStatus('error');
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceId, activeDocId]);

  // Active document metadata
  const activeDocument = workspace?.documents.find((d) => d.id === activeDocId);
  const currentLanguage = activeDocument?.language || 'typescript';
  const role = workspace?.currentRole || 'VIEWER';
  const isOwner = role === 'OWNER';

  // Title change
  const handleTitleChange = async (newTitle: string) => {
    if (!workspaceId) return;
    try {
      const res = await api.codeWorkspaces.update(workspaceId, { title: newTitle });
      if (res.data) {
        setWorkspace((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
    } catch (err) {
      console.error('Failed to rename workspace:', err);
    }
  };

  // Language change
  const handleLanguageChange = async (newLang: string) => {
    if (!workspaceId || !activeDocId) return;
    try {
      const res = await api.codeWorkspaces.updateDocument(workspaceId, activeDocId, { language: newLang });
      if (res.data) {
        setWorkspace((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            documents: prev.documents.map((d) => (d.id === activeDocId ? { ...d, language: newLang } : d)),
          };
        });
      }
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };

  // Create new document tab
  const handleCreateDocument = async (title: string, language: string) => {
    if (!workspaceId) return;
    try {
      const res = await api.codeWorkspaces.createDocument(workspaceId, { title, language });
      if (res.data) {
        setWorkspace((prev) => {
          if (!prev) return null;
          return { ...prev, documents: [...prev.documents, res.data!] };
        });
        setActiveDocId(res.data.id);
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  // Delete document tab
  const handleDeleteDocument = async (docId: string) => {
    if (!workspaceId) return;
    try {
      await api.codeWorkspaces.deleteDocument(workspaceId, docId);
      setWorkspace((prev) => {
        if (!prev) return null;
        const filtered = prev.documents.filter((d) => d.id !== docId);
        if (activeDocId === docId && filtered.length > 0) {
          setActiveDocId(filtered[0].id);
        }
        return { ...prev, documents: filtered };
      });
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Copy code
  const handleCopyCode = () => {
    if (activeProvider) {
      const text = activeProvider.doc.getText('monaco').toString();
      navigator.clipboard.writeText(text);
    }
  };

  // Reset to starter template
  const handleResetToTemplate = (templateCode: string) => {
    if (activeProvider) {
      const yText = activeProvider.doc.getText('monaco');
      activeProvider.doc.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, templateCode);
      });
      handleSave('Reset to starter template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-base font-medium">Opening Collaborative Workspace...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Workspace Unavailable</h2>
          <p className="text-sm text-slate-400">{error || 'Workspace could not be loaded or access was denied.'}</p>
          <button
            onClick={() => navigate('/code')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspaces</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      {/* 1. Header */}
      <WorkspaceHeader
        title={workspace.title}
        sessionTitle={workspace.sessionTitle}
        role={role}
        language={currentLanguage}
        connectionStatus={connectionStatus}
        saveStatus={saveStatus}
        version={docVersion}
        isOwner={isOwner}
        onLanguageChange={handleLanguageChange}
        onTitleChange={handleTitleChange}
        onSave={() => handleSave('Manual save')}
        onCopy={handleCopyCode}
        onOpenRevisions={() => setShowRevisions(true)}
        onToggleSandbox={() => setShowSandbox((prev) => !prev)}
      />

      {/* 2. Document Tabs & Presence Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-1 flex items-center justify-between gap-4">
        <DocumentTabs
          documents={workspace.documents}
          activeDocId={activeDocId}
          role={role}
          onSelectDoc={setActiveDocId}
          onCreateDoc={handleCreateDocument}
          onDeleteDoc={handleDeleteDocument}
        />

        <ParticipantPresence
          workspaceId={workspace.id}
          participants={workspace.participants}
          awareness={activeProvider?.awareness || null}
          currentUserId={user?.id || ''}
          isOwner={isOwner}
          onParticipantAdded={(newP) => {
            setWorkspace((prev) => (prev ? { ...prev, participants: [...prev.participants, newP] } : null));
          }}
          onRoleChanged={(uid, newRole) => {
            setWorkspace((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                participants: prev.participants.map((p) => (p.userId === uid ? { ...p, role: newRole } : p)),
              };
            });
          }}
          onParticipantRemoved={(uid) => {
            setWorkspace((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                participants: prev.participants.filter((p) => p.userId !== uid),
              };
            });
          }}
        />
      </div>

      {/* 3. Editor & Side Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 h-full p-2 bg-slate-950">
          <CodeEditor
            provider={activeProvider}
            language={currentLanguage}
            role={role}
            onContentChange={() => {
              setSaveStatus('unsaved');
            }}
          />
        </main>

        {/* Sandbox / Starter Templates Drawer */}
        {showSandbox && (
          <ExecutionSandboxPanel
            currentLanguage={currentLanguage}
            canEdit={role !== 'VIEWER'}
            onResetToTemplate={handleResetToTemplate}
            onClose={() => setShowSandbox(false)}
          />
        )}
      </div>

      {/* 4. Revision History Modal */}
      {showRevisions && activeDocId && (
        <RevisionHistoryModal
          workspaceId={workspace.id}
          documentId={activeDocId}
          documentTitle={activeDocument?.title || 'Document'}
          canRestore={role !== 'VIEWER'}
          onClose={() => setShowRevisions(false)}
          onRestored={() => {
            fetchWorkspace();
            setSaveStatus('saved');
          }}
        />
      )}
    </div>
  );
};
