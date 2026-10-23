import React, { useState } from 'react';
import type { LearningResourceDto } from '@peerlume/shared';
import {
  FileText,
  Link as LinkIcon,
  Code,
  Download,
  Copy,
  Check,
  Trash2,
  Edit2,
  Lock,
  Globe,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { apiService } from '../../services/api.js';

interface ResourceCardProps {
  resource: LearningResourceDto;
  onEdit?: (resource: LearningResourceDto) => void;
  onDelete?: (resourceId: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const isOwner = user?.id === resource.creatorId;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!resource.content) return;
    try {
      await navigator.clipboard.writeText(resource.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedDate = new Date(resource.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const typeConfig: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; border: string; bg: string }
  > = {
    NOTE: {
      label: 'Note',
      icon: <FileText className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/10',
    },
    LINK: {
      label: 'Link',
      icon: <LinkIcon className="w-3.5 h-3.5" />,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/10',
    },
    CODE: {
      label: 'Code Snippet',
      icon: <Code className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/10',
    },
    DOCUMENT: {
      label: 'File Document',
      icon: <Download className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
      bg: 'bg-purple-500/10',
    },
  };

  const config = typeConfig[resource.type] || typeConfig.NOTE;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-lg">
      <div className="space-y-3">
        {/* Header: Type Badge, Title, Privacy, Action icons */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}
            >
              {config.icon}
              <span>{config.label}</span>
            </span>

            {resource.isPrivate ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Private</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                <Globe className="w-3 h-3 text-teal-400" />
                <span>Shared</span>
              </span>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(resource)}
                  aria-label="Edit resource"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(resource.id)}
                  aria-label="Delete resource"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-white mb-1">{resource.title}</h3>
          {resource.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{resource.description}</p>
          )}
        </div>

        {/* Content Type Variations */}

        {/* 1. Note Content */}
        {resource.type === 'NOTE' && resource.content && (
          <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {resource.content}
          </div>
        )}

        {/* 2. Link Resource */}
        {resource.type === 'LINK' && resource.url && (
          <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="truncate min-w-0">
              <span className="text-xs text-brand-400 font-medium truncate block">
                {resource.url}
              </span>
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200 bg-brand-500/10 hover:bg-brand-500/20 px-2.5 py-1 rounded-lg border border-brand-500/20 shrink-0 transition-colors"
            >
              <span>Visit</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* 3. Code Snippet */}
        {resource.type === 'CODE' && resource.content && (
          <div className="relative group">
            <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-t-xl border border-b-0 border-slate-800 text-[11px] text-slate-400">
              <span className="font-mono uppercase font-semibold text-emerald-400">
                {resource.language || 'code'}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-b-xl p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed max-h-48">
              <code>{resource.content}</code>
            </pre>
          </div>
        )}

        {/* 4. Document / File Attachment */}
        {resource.type === 'DOCUMENT' && (
          <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-white truncate block">
                  {resource.fileName || 'Attached Document'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {formatFileSize(resource.fileSize)} • {resource.mimeType || 'file'}
                </span>
              </div>
            </div>

            <a
              href={apiService.resources.getDownloadUrl(resource.id)}
              download={resource.fileName || 'document'}
              className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/20 shrink-0 transition-colors font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer Info: Creator & Session info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center text-[9px] text-white font-bold">
            {resource.creatorName.charAt(0)}
          </div>
          <span>{isOwner ? 'Created by you' : resource.creatorName}</span>
        </div>

        <div className="flex items-center gap-3">
          {resource.sessionTitle && (
            <span className="inline-flex items-center gap-1 text-slate-400" title={`Associated with session: ${resource.sessionTitle}`}>
              <Calendar className="w-3 h-3 text-brand-400" />
              <span className="truncate max-w-[120px]">{resource.sessionTitle}</span>
            </span>
          )}
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
