import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.js';
import { useAuth } from '../../context/AuthContext.js';
import type {
  StudyRoomDto,
  WhiteboardElement,
  WhiteboardTool,
  StudyRoomRole,
} from '@peerlume/shared';
import { SOCKET_EVENTS } from '@peerlume/shared';
import { WhiteboardToolbar } from '../../components/whiteboard/WhiteboardToolbar.js';
import { WhiteboardCanvas } from '../../components/whiteboard/WhiteboardCanvas.js';
import { WhiteboardHistoryModal } from '../../components/whiteboard/WhiteboardHistoryModal.js';
import { AccessibleBoardObjects } from '../../components/whiteboard/AccessibleBoardObjects.js';
import { StudyRoomCallPanel } from '../../components/study-room/StudyRoomCallPanel.js';
import { StudyRoomResourcesTab } from '../../components/study-room/StudyRoomResourcesTab.js';
import {
  ChevronLeft,
  LogOut,
  Power,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';

export const StudyRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<StudyRoomDto | null>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [historyStack, setHistoryStack] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  // Toolbar State
  const [tool, setTool] = useState<WhiteboardTool>('pen');
  const [color, setColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [zoom, setZoom] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'failed'>('saved');
  const [isSaving, setIsSaving] = useState(false);

  // Modals & Panels
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [accessibleListOpen, setAccessibleListOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'call' | 'resources' | 'participants'>('call');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine user role
  const participant = room?.participants?.find((p) => p.userId === user?.id && !p.leftAt);
  const isOwner = room?.creatorId === user?.id || participant?.role === 'OWNER';
  const role: StudyRoomRole = isOwner ? 'OWNER' : participant?.role || 'EDITOR';
  const isViewer = role === 'VIEWER';

  // Load study room and whiteboard
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);

    apiService.studyRooms
      .get(roomId)
      .then((res) => {
        if (res.data) {
          setRoom(res.data);
          const board = res.data.whiteboards?.[0];
          if (board && Array.isArray(board.elements)) {
            setElements(board.elements);
            setHistoryStack([board.elements]);
          }
        } else {
          setError(res.error || 'Failed to load study room');
        }
      })
      .catch((err) => setError(err?.message || 'Error loading study room'))
      .finally(() => setLoading(false));
  }, [roomId]);

  // Socket room join & lifecycle
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit(SOCKET_EVENTS.STUDY_ROOM_JOIN, { roomId }, (res: any) => {
      if (res?.success) {
        // Fetch current active whiteboard
        socket.emit(SOCKET_EVENTS.WHITEBOARD_INIT, { roomId }, (initRes: any) => {
          if (initRes?.success && Array.isArray(initRes.elements)) {
            setElements(initRes.elements);
            setHistoryStack([initRes.elements]);
          }
        });
      }
    });

    const handleSaved = (data: { roomId: string; version: number }) => {
      if (data.roomId === roomId) {
        setSaveStatus('saved');
        setIsSaving(false);
      }
    };

    const handleRoomEnded = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        setRoom((prev) => (prev ? { ...prev, isActive: false } : prev));
      }
    };

    socket.on(SOCKET_EVENTS.WHITEBOARD_SAVED, handleSaved);
    socket.on(SOCKET_EVENTS.STUDY_ROOM_ENDED, handleRoomEnded);

    return () => {
      socket.emit(SOCKET_EVENTS.STUDY_ROOM_LEAVE, { roomId });
      socket.off(SOCKET_EVENTS.WHITEBOARD_SAVED, handleSaved);
      socket.off(SOCKET_EVENTS.STUDY_ROOM_ENDED, handleRoomEnded);
    };
  }, [socket, roomId]);

  const handleCommitStep = useCallback(
    (step: {
      type: 'element:add' | 'element:update' | 'element:delete' | 'clear';
      element?: WhiteboardElement;
      elementId?: string;
    }) => {
      if (isViewer) return;

      setSaveStatus('dirty');
      if (socket && roomId) {
        const boardId = room?.whiteboards?.[0]?.id || 'main';
        socket.emit(SOCKET_EVENTS.WHITEBOARD_DRAW_STEP, {
          roomId,
          boardId,
          step,
        });
      }
    },
    [socket, roomId, room, isViewer]
  );

  const handleElementsChange = (newElements: WhiteboardElement[]) => {
    setHistoryStack((prev) => [...prev, newElements]);
    setRedoStack([]);
    setElements(newElements);
    setSaveStatus('dirty');
  };

  const handleUndo = () => {
    if (historyStack.length <= 1 || isViewer) return;
    const current = historyStack[historyStack.length - 1];
    const previous = historyStack[historyStack.length - 2];

    setRedoStack((prev) => [...prev, current]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setElements(previous);
    handleCommitStep({ type: 'clear' });
    previous.forEach((el) => handleCommitStep({ type: 'element:add', element: el }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || isViewer) return;
    const next = redoStack[redoStack.length - 1];

    setHistoryStack((prev) => [...prev, next]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setElements(next);
    handleCommitStep({ type: 'clear' });
    next.forEach((el) => handleCommitStep({ type: 'element:add', element: el }));
  };

  const handleClear = () => {
    if (isViewer) return;
    if (window.confirm('Are you sure you want to clear the entire whiteboard?')) {
      handleElementsChange([]);
      handleCommitStep({ type: 'clear' });
    }
  };

  const handleSave = async () => {
    if (!roomId || isViewer) return;
    setIsSaving(true);
    setSaveStatus('saving');

    const res = await apiService.studyRooms.saveWhiteboard(roomId, 'Manual Save Checkpoint');
    if (res.data) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('failed');
    }
    setIsSaving(false);
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!roomId || isViewer) return;
    const res = await apiService.studyRooms.restoreRevision(roomId, revisionId);
    if (res.data && Array.isArray(res.data.elements)) {
      const restored = res.data.elements;
      setElements(restored);
      setHistoryStack((prev) => [...prev, restored]);
      setSaveStatus('saved');
    }
  };

  const handleInsertMathTemplate = () => {
    if (isViewer) return;
    const mathTemplates = [
      'f(x) = ∫ e^(-t²) dt',
      '∇ × B = μ₀J + μ₀ε₀(∂E/∂t)',
      'det(A - λI) = 0',
      'E = mc²',
    ];
    const formula = mathTemplates[Math.floor(Math.random() * mathTemplates.length)];

    const id = `formula-${Date.now()}`;
    const newElement: WhiteboardElement = {
      id,
      type: 'text',
      x: 80 + Math.random() * 40,
      y: 80 + Math.random() * 40,
      text: formula,
      color: '#a855f7',
      strokeWidth: 4,
    };

    handleElementsChange([...elements, newElement]);
    handleCommitStep({ type: 'element:add', element: newElement });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    await apiService.studyRooms.leave(roomId);
    navigate('/study-rooms');
  };

  const handleEndRoom = async () => {
    if (!roomId || !isOwner) return;
    if (window.confirm('Are you sure you want to end this study room for all participants?')) {
      await apiService.studyRooms.end(roomId);
      navigate('/study-rooms');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-foreground border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-foreground-secondary">Loading collaborative study room...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-card border border-border rounded-3xl text-center shadow-lg">
        <ShieldAlert className="w-12 h-12 text-foreground mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground">Unable to Enter Study Room</h2>
        <p className="text-xs text-foreground-secondary mt-2 mb-6">{error || 'Room not found or access revoked.'}</p>
        <Link
          to="/study-rooms"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Study Rooms</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 min-h-[calc(100vh-4rem)]">
      {/* Room Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-card border border-border rounded-2xl shadow-sm text-foreground">
        <div className="flex items-center gap-3">
          <Link
            to="/study-rooms"
            className="p-1.5 rounded-xl hover:bg-surface text-foreground-muted hover:text-foreground transition-colors"
            title="Back to Study Rooms"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-sm">
                {room.title}
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border ${
                role === 'OWNER'
                  ? 'bg-surface text-foreground border-border-strong font-semibold'
                  : 'bg-surface text-foreground-secondary border-border'
              }`}>
                {role}
              </span>
              {!room.isActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-foreground-muted border border-border font-medium">
                  Ended
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-secondary truncate max-w-md">
              {room.topic}
            </p>
          </div>
        </div>

        {/* Status Indicators & Room Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* Connection status */}
          <span className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface border border-border px-2.5 py-1 rounded-xl">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isConnected ? 'Sync Active' : 'Disconnected'}</span>
          </span>

          {/* Save Status Badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-xl font-medium border ${
              saveStatus === 'saving'
                ? 'bg-surface text-foreground border-border animate-pulse'
                : saveStatus === 'dirty'
                ? 'bg-surface text-foreground-secondary border-border'
                : saveStatus === 'failed'
                ? 'bg-surface text-foreground border-border'
                : 'bg-surface text-foreground-secondary border-border'
            }`}
          >
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'dirty'
              ? 'Unsaved changes'
              : saveStatus === 'failed'
              ? 'Save failed'
              : 'Saved'}
          </span>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl border border-border hover:bg-surface text-foreground transition-colors"
            title="Copy room link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-foreground-muted" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>

          {/* Leave Room */}
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl border border-border hover:bg-surface text-foreground-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>

          {/* End Room (Owner only) */}
          {isOwner && room.isActive && (
            <button
              onClick={handleEndRoom}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-medium transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span>End Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Study Room Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Left 3 Cols: Whiteboard Workspace */}
        <div className="lg:col-span-3 flex flex-col gap-2 min-h-[580px]">
          <WhiteboardToolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            canUndo={historyStack.length > 1}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onSave={handleSave}
            onShowHistory={() => setHistoryModalOpen(true)}
            onShowAccessibleList={() => setAccessibleListOpen(true)}
            onInsertMathTemplate={handleInsertMathTemplate}
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
            onZoomOut={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
            onResetZoom={() => setZoom(1)}
            isSaving={isSaving}
            saveStatus={saveStatus}
            readOnly={isViewer || !room.isActive}
          />

          <div className="flex-1 w-full relative">
            <WhiteboardCanvas
              roomId={room.id}
              boardId={room.whiteboards?.[0]?.id || 'main'}
              elements={elements}
              onElementsChange={handleElementsChange}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              zoom={zoom}
              readOnly={isViewer || !room.isActive}
              onCommitStep={handleCommitStep}
            />
          </div>
        </div>

        {/* Right 1 Col: Collaboration Sidebar */}
        <div className="flex flex-col gap-3">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveSidebarTab('call')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeSidebarTab === 'call'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Call
            </button>
            <button
              onClick={() => setActiveSidebarTab('resources')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeSidebarTab === 'resources'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Notes & Code
            </button>
            <button
              onClick={() => setActiveSidebarTab('participants')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                activeSidebarTab === 'participants'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Peers ({room.participants?.filter((p) => !p.leftAt).length || 1})
            </button>
          </div>

          {/* Active Tab Content */}
          {activeSidebarTab === 'call' && (
            <StudyRoomCallPanel
              roomId={room.id}
              participants={room.participants || []}
              currentUserId={user?.id || ''}
            />
          )}

          {activeSidebarTab === 'resources' && (
            <StudyRoomResourcesTab
              sessionId={room.sessionId}
              roomId={room.id}
            />
          )}

          {activeSidebarTab === 'participants' && (
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm text-foreground flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Collaborators ({room.participants?.filter((p) => !p.leftAt).length || 1})
                </span>
              </div>

              <div className="space-y-2">
                {room.participants
                  ?.filter((p) => !p.leftAt)
                  .map((p) => (
                    <div
                      key={p.userId}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
                          {p.user?.fullName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {p.user?.fullName} {p.userId === user?.id && '(You)'}
                          </p>
                          <span className="text-[10px] text-foreground-muted capitalize">{p.role}</span>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revisions History Modal */}
      <WhiteboardHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        roomId={room.id}
        onRestore={handleRestoreRevision}
        readOnly={isViewer || !room.isActive}
      />

      {/* Accessible Elements List */}
      <AccessibleBoardObjects
        isOpen={accessibleListOpen}
        onClose={() => setAccessibleListOpen(false)}
        elements={elements}
      />
    </div>
  );
};
