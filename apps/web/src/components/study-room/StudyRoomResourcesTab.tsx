import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code2, ExternalLink, FileText } from 'lucide-react';
import { apiService } from '../../services/api.js';
import type { LearningResourceDto, CodeWorkspaceDto } from '@peerlume/shared';

interface StudyRoomResourcesTabProps {
  sessionId?: string | null;
  roomId: string;
}

export const StudyRoomResourcesTab: React.FC<StudyRoomResourcesTabProps> = ({
  sessionId,
  roomId: _roomId,
}) => {
  const [resources, setResources] = useState<LearningResourceDto[]>([]);
  const [workspaces, setWorkspaces] = useState<CodeWorkspaceDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchResources = sessionId
      ? apiService.resources.getSessionResources(sessionId)
      : apiService.resources.list();

    const fetchWorkspaces = apiService.codeWorkspaces.list();

    Promise.all([fetchResources, fetchWorkspaces])
      .then(([resRes, workRes]) => {
        if (resRes.data) setResources(resRes.data.slice(0, 5));
        if (workRes.data) {
          // If sessionId is present, prioritize workspaces for this session
          const filtered = sessionId
            ? workRes.data.filter((w) => w.sessionId === sessionId)
            : workRes.data;
          setWorkspaces(filtered.length > 0 ? filtered : workRes.data.slice(0, 3));
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100 flex flex-col gap-4">
      {/* Code Workspace Linkage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collaborative Code Workspace</h2>
          </div>
          <Link
            to="/code"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
          >
            <span>Open IDE</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {workspaces.length > 0 ? (
          <div className="space-y-1.5">
            {workspaces.map((w) => (
              <Link
                key={w.id}
                to={`/code/${w.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
              >
                <div className="truncate">
                  <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">{w.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{w.description || 'Code Workspace'}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
            <span>No linked code workspace yet.</span>
            <Link to="/code" className="block text-brand-500 font-medium mt-1">
              + Launch New Workspace
            </Link>
          </div>
        )}
      </div>

      {/* Session Resources */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Resources & Notes</h3>
          </div>
          <Link
            to="/workspace"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium"
          >
            All Resources
          </Link>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-slate-400">Loading resources...</div>
        ) : resources.length > 0 ? (
          <div className="space-y-1.5">
            {resources.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate text-slate-800 dark:text-slate-200">{r.title}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase shrink-0">
                  {r.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">
            No attached session resources found.
          </p>
        )}
      </div>
    </div>
  );
};
