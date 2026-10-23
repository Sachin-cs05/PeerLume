import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { WhiteboardElement, WhiteboardTool, WhiteboardPoint } from '@peerlume/shared';
import { useSocket } from '../../context/SocketContext.js';
import { SOCKET_EVENTS } from '@peerlume/shared';

interface WhiteboardCanvasProps {
  roomId: string;
  boardId: string;
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[]) => void;
  tool: WhiteboardTool;
  color: string;
  strokeWidth: number;
  zoom: number;
  readOnly: boolean;
  onCommitStep: (step: {
    type: 'element:add' | 'element:update' | 'element:delete' | 'clear';
    element?: WhiteboardElement;
    elementId?: string;
  }) => void;
}

interface RemoteCursor {
  userId: string;
  userName?: string;
  color: string;
  x: number;
  y: number;
  lastUpdated: number;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  roomId,
  boardId: _boardId,
  elements,
  onElementsChange,
  tool,
  color,
  strokeWidth,
  zoom,
  readOnly,
  onCommitStep,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<WhiteboardPoint[]>([]);
  const [startPoint, setStartPoint] = useState<WhiteboardPoint | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; text: string } | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map());

  // Socket listener for remote draw steps and cursors
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDrawStep = (data: {
      roomId: string;
      boardId: string;
      step: {
        type: 'element:add' | 'element:update' | 'element:delete' | 'clear';
        element?: WhiteboardElement;
        elementId?: string;
      };
      version: number;
    }) => {
      if (data.roomId !== roomId) return;

      if (data.step.type === 'clear') {
        onElementsChange([]);
      } else if (data.step.type === 'element:delete' && data.step.elementId) {
        onElementsChange(elements.filter((e) => e.id !== data.step.elementId));
      } else if (data.step.element) {
        const incoming = data.step.element;
        const exists = elements.some((e) => e.id === incoming.id);
        if (exists) {
          onElementsChange(elements.map((e) => (e.id === incoming.id ? incoming : e)));
        } else {
          onElementsChange([...elements, incoming]);
        }
      }
    };

    const handleRemoteCursor = (data: { roomId: string; userId: string; x: number; y: number }) => {
      if (data.roomId !== roomId) return;
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          userId: data.userId,
          color: '#6366f1',
          x: data.x,
          y: data.y,
          lastUpdated: Date.now(),
        });
        return next;
      });
    };

    socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_STEP, handleRemoteDrawStep);
    socket.on(SOCKET_EVENTS.WHITEBOARD_CURSOR, handleRemoteCursor);

    // Expire old remote cursors after 5 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => {
        let changed = false;
        const next = new Map();
        for (const [id, cursor] of prev.entries()) {
          if (now - cursor.lastUpdated < 6000) {
            next.set(id, cursor);
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 3000);

    return () => {
      socket.off(SOCKET_EVENTS.WHITEBOARD_DRAW_STEP, handleRemoteDrawStep);
      socket.off(SOCKET_EVENTS.WHITEBOARD_CURSOR, handleRemoteCursor);
      clearInterval(interval);
    };
  }, [socket, roomId, elements, onElementsChange]);

  // Transform coordinates accounting for DPI, Zoom, and Pan
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): WhiteboardPoint => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      return {
        x: (rawX - panOffset.x) / zoom,
        y: (rawY - panOffset.y) / zoom,
      };
    },
    [panOffset, zoom]
  );

  // Redraw canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI scale
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Apply Pan and Zoom
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Render grid pattern
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1 / zoom;
    const startX = -panOffset.x / zoom - ((-panOffset.x / zoom) % gridSize);
    const startY = -panOffset.y / zoom - ((-panOffset.y / zoom) % gridSize);
    const endX = startX + width / zoom + gridSize * 2;
    const endY = startY + height / zoom + gridSize * 2;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Render all elements
    elements.forEach((el) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (el.type) {
        case 'pen': {
          if (el.points && el.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            for (let i = 1; i < el.points.length; i++) {
              ctx.lineTo(el.points[i].x, el.points[i].y);
            }
            ctx.stroke();
          }
          break;
        }
        case 'line': {
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            ctx.beginPath();
            ctx.moveTo(el.x, el.y);
            ctx.lineTo(el.x + el.width, el.y + el.height);
            ctx.stroke();
          }
          break;
        }
        case 'arrow': {
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            const fromX = el.x;
            const fromY = el.y;
            const toX = el.x + el.width;
            const toY = el.y + el.height;
            const headLength = 12;
            const angle = Math.atan2(toY - fromY, toX - fromX);

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();

            // Arrow head
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(toX, toY);
            ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
          break;
        }
        case 'rectangle': {
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
          break;
        }
        case 'circle': {
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            const rx = Math.abs(el.width) / 2;
            const ry = Math.abs(el.height) / 2;
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'text': {
          if (el.x !== undefined && el.y !== undefined && el.text) {
            ctx.font = '500 16px Inter, system-ui, sans-serif';
            ctx.fillText(el.text, el.x, el.y);
          }
          break;
        }
      }
    });

    // Render active drawing in progress
    if (isDrawing && tool === 'pen' && currentPoints.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      ctx.stroke();
    } else if (isDrawing && startPoint && currentPoints.length > 0) {
      const endPoint = currentPoints[currentPoints.length - 1];
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;

      if (tool === 'rectangle') {
        ctx.strokeRect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
      } else if (tool === 'circle') {
        const rx = Math.abs(endPoint.x - startPoint.x) / 2;
        const ry = Math.abs(endPoint.y - startPoint.y) / 2;
        const cx = (startPoint.x + endPoint.x) / 2;
        const cy = (startPoint.y + endPoint.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [elements, panOffset, zoom, isDrawing, tool, color, strokeWidth, currentPoints, startPoint]);

  useEffect(() => {
    render();
  }, [render]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly && tool !== 'select') return;
    const pt = getCanvasCoords(e.clientX, e.clientY);

    if (tool === 'select' || e.button === 1 || (e as any).spaceKey) {
      // Pan mode
      setIsDrawing(true);
      setStartPoint({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (tool === 'text') {
      setTextInput({ x: pt.x, y: pt.y, text: '' });
      return;
    }

    if (tool === 'eraser') {
      // Find and remove element closest to click
      const target = elements.find((el) => {
        if (el.x !== undefined && el.y !== undefined) {
          const width = el.width || 40;
          const height = el.height || 40;
          return pt.x >= el.x - 10 && pt.x <= el.x + width + 10 && pt.y >= el.y - 10 && pt.y <= el.y + height + 10;
        }
        if (el.points) {
          return el.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 15);
        }
        return false;
      });

      if (target) {
        onCommitStep({ type: 'element:delete', elementId: target.id });
        onElementsChange(elements.filter((e) => e.id !== target.id));
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(pt);
    setCurrentPoints([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Broadcast local cursor
    const canvasPt = getCanvasCoords(e.clientX, e.clientY);
    if (socket && !readOnly) {
      socket.emit(SOCKET_EVENTS.WHITEBOARD_CURSOR, {
        roomId,
        x: Math.round(canvasPt.x),
        y: Math.round(canvasPt.y),
      });
    }

    if (!isDrawing) return;

    if (tool === 'select' && startPoint) {
      setPanOffset({
        x: e.clientX - startPoint.x,
        y: e.clientY - startPoint.y,
      });
      return;
    }

    const pt = getCanvasCoords(e.clientX, e.clientY);
    setCurrentPoints((prev) => [...prev, pt]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === 'select') {
      setStartPoint(null);
      return;
    }

    if (startPoint && currentPoints.length > 0) {
      const endPoint = currentPoints[currentPoints.length - 1];
      const id = `elem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      let newElement: WhiteboardElement | null = null;

      if (tool === 'pen') {
        newElement = {
          id,
          type: 'pen',
          points: currentPoints,
          color,
          strokeWidth,
        };
      } else if (tool === 'rectangle') {
        newElement = {
          id,
          type: 'rectangle',
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
          width: Math.abs(endPoint.x - startPoint.x),
          height: Math.abs(endPoint.y - startPoint.y),
          color,
          strokeWidth,
        };
      } else if (tool === 'circle') {
        newElement = {
          id,
          type: 'circle',
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
          width: Math.abs(endPoint.x - startPoint.x),
          height: Math.abs(endPoint.y - startPoint.y),
          color,
          strokeWidth,
        };
      } else if (tool === 'line') {
        newElement = {
          id,
          type: 'line',
          x: startPoint.x,
          y: startPoint.y,
          width: endPoint.x - startPoint.x,
          height: endPoint.y - startPoint.y,
          color,
          strokeWidth,
        };
      } else if (tool === 'arrow') {
        newElement = {
          id,
          type: 'arrow',
          x: startPoint.x,
          y: startPoint.y,
          width: endPoint.x - startPoint.x,
          height: endPoint.y - startPoint.y,
          color,
          strokeWidth,
        };
      }

      if (newElement) {
        onElementsChange([...elements, newElement]);
        onCommitStep({ type: 'element:add', element: newElement });
      }
    }

    setStartPoint(null);
    setCurrentPoints([]);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput || !textInput.text.trim()) {
      setTextInput(null);
      return;
    }

    const id = `text-${Date.now()}`;
    const newElement: WhiteboardElement = {
      id,
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: textInput.text.trim(),
      color,
      strokeWidth,
    };

    onElementsChange([...elements, newElement]);
    onCommitStep({ type: 'element:add', element: newElement });
    setTextInput(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`w-full h-full block ${
          tool === 'select' ? 'cursor-grab active:cursor-grabbing' : tool === 'eraser' ? 'cursor-crosshair' : 'cursor-crosshair'
        }`}
      />

      {/* Floating Text Input Box */}
      {textInput && (
        <form
          onSubmit={handleTextSubmit}
          className="absolute z-20"
          style={{
            left: `${textInput.x * zoom + panOffset.x}px`,
            top: `${textInput.y * zoom + panOffset.y}px`,
          }}
        >
          <input
            type="text"
            autoFocus
            value={textInput.text}
            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
            onBlur={handleTextSubmit}
            placeholder="Type note or formula..."
            className="px-2 py-1 text-sm bg-white dark:bg-slate-900 border-2 border-brand-500 rounded-lg shadow-lg outline-none text-slate-900 dark:text-white min-w-[140px]"
          />
        </form>
      )}

      {/* Remote Participant Cursors */}
      {Array.from(remoteCursors.values()).map((rc) => {
        const screenX = rc.x * zoom + panOffset.x;
        const screenY = rc.y * zoom + panOffset.y;
        return (
          <div
            key={rc.userId}
            className="absolute pointer-events-none transition-all duration-75 ease-out z-10"
            style={{ left: `${screenX}px`, top: `${screenY}px` }}
          >
            <svg
              className="w-4 h-4 text-brand-500 filter drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-500 text-white shadow whitespace-nowrap ml-2">
              Collaborator
            </span>
          </div>
        );
      })}
    </div>
  );
};
