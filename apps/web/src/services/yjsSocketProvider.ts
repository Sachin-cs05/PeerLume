import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import type { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@peerlume/shared';
import type { WorkspaceRole } from '@peerlume/shared';

const PEER_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
];

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return PEER_COLORS[Math.abs(hash) % PEER_COLORS.length];
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface YjsProviderUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role: WorkspaceRole;
}

export class SocketIoYjsProvider {
  public readonly doc: Y.Doc;
  public readonly awareness: Awareness;
  public status: ConnectionStatus = 'connecting';
  public userRole: WorkspaceRole = 'EDITOR';

  private socket: Socket;
  private workspaceId: string;
  private documentId: string;
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private isDestroyed = false;

  constructor(
    socket: Socket,
    workspaceId: string,
    documentId: string,
    user: YjsProviderUser,
    existingDoc?: Y.Doc
  ) {
    this.socket = socket;
    this.workspaceId = workspaceId;
    this.documentId = documentId;
    this.doc = existingDoc || new Y.Doc();
    this.awareness = new Awareness(this.doc);

    // Set local user awareness
    const userColor = getUserColor(user.id);
    this.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.name,
      color: userColor,
      avatar: user.avatarUrl || null,
      role: user.role,
    });

    this.setupListeners();
    this.joinWorkspace();
  }

  public onStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private setupListeners(): void {
    // 1. Local document edits -> emit to server
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== this && !this.isDestroyed) {
        this.socket.emit(SOCKET_EVENTS.CODE_DOC_UPDATE, {
          workspaceId: this.workspaceId,
          documentId: this.documentId,
          update: Array.from(update),
        });
      }
    });

    // 2. Local awareness changes (cursors, selection) -> emit to server
    this.awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
      if (origin !== this && !this.isDestroyed) {
        const changedClients = added.concat(updated).concat(removed);
        const update = encodeAwarenessUpdate(this.awareness, changedClients);
        this.socket.emit(SOCKET_EVENTS.CODE_AWARENESS_UPDATE, {
          workspaceId: this.workspaceId,
          documentId: this.documentId,
          update: Array.from(update),
        });
      }
    });

    // 3. Incoming initial document sync from server
    this.socket.on(SOCKET_EVENTS.CODE_SYNC_INIT, this.handleSyncInit);

    // 4. Incoming incremental CRDT update from peers
    this.socket.on(SOCKET_EVENTS.CODE_DOC_UPDATE, this.handleDocUpdate);

    // 5. Incoming peer awareness updates (remote cursors, presence)
    this.socket.on(SOCKET_EVENTS.CODE_AWARENESS_UPDATE, this.handleAwarenessUpdate);

    // 6. Socket connection status
    this.socket.on(SOCKET_EVENTS.CONNECT, this.handleConnect);
    this.socket.on(SOCKET_EVENTS.DISCONNECT, this.handleDisconnect);
    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, this.handleError);
  }

  private joinWorkspace(): void {
    this.setStatus('connecting');
    this.socket.emit(
      SOCKET_EVENTS.CODE_JOIN,
      {
        workspaceId: this.workspaceId,
        documentId: this.documentId,
      },
      (res: any) => {
        if (res && res.success) {
          if (res.role) {
            this.userRole = res.role;
          }
          this.setStatus('connected');
        } else {
          this.setStatus('error');
        }
      }
    );
  }

  private handleSyncInit = (payload: any): void => {
    if (
      payload?.workspaceId === this.workspaceId &&
      payload?.documentId === this.documentId &&
      payload?.state
    ) {
      try {
        const stateBytes = new Uint8Array(payload.state);
        Y.applyUpdate(this.doc, stateBytes, this);
        if (payload.role) {
          this.userRole = payload.role;
        }
        this.setStatus('connected');
      } catch (err) {
        console.error('Failed to apply initial Yjs sync state:', err);
      }
    }
  };

  private handleDocUpdate = (payload: any): void => {
    if (
      payload?.workspaceId === this.workspaceId &&
      payload?.documentId === this.documentId &&
      payload?.update
    ) {
      try {
        const updateBytes = new Uint8Array(payload.update);
        Y.applyUpdate(this.doc, updateBytes, this);
      } catch (err) {
        console.error('Failed to apply remote document update:', err);
      }
    }
  };

  private handleAwarenessUpdate = (payload: any): void => {
    if (
      payload?.workspaceId === this.workspaceId &&
      payload?.documentId === this.documentId &&
      payload?.update
    ) {
      try {
        const updateBytes = new Uint8Array(payload.update);
        applyAwarenessUpdate(this.awareness, updateBytes, this);
      } catch (err) {
        console.error('Failed to apply remote awareness update:', err);
      }
    }
  };

  private handleConnect = (): void => {
    this.joinWorkspace();
  };

  private handleDisconnect = (): void => {
    this.setStatus('disconnected');
  };

  private handleError = (): void => {
    this.setStatus('error');
  };

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Leave room
    this.socket.emit(SOCKET_EVENTS.CODE_LEAVE, {
      workspaceId: this.workspaceId,
      documentId: this.documentId,
    });

    // Remove socket event listeners
    this.socket.off(SOCKET_EVENTS.CODE_SYNC_INIT, this.handleSyncInit);
    this.socket.off(SOCKET_EVENTS.CODE_DOC_UPDATE, this.handleDocUpdate);
    this.socket.off(SOCKET_EVENTS.CODE_AWARENESS_UPDATE, this.handleAwarenessUpdate);
    this.socket.off(SOCKET_EVENTS.CONNECT, this.handleConnect);
    this.socket.off(SOCKET_EVENTS.DISCONNECT, this.handleDisconnect);
    this.socket.off(SOCKET_EVENTS.CONNECT_ERROR, this.handleError);

    // Destroy awareness and clean listeners
    this.awareness.destroy();
    this.statusListeners.clear();
  }
}
