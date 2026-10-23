import React, { useState, useEffect } from 'react';
import type { LearningResourceDto } from '@peerlume/shared';
import { apiService } from '../../services/api.js';
import { ResourceCard } from '../../components/workspace/ResourceCard.js';
import { NoteEditor } from '../../components/workspace/NoteEditor.js';
import { FileUpload } from '../../components/workspace/FileUpload.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import {
  FileText,
  Link as LinkIcon,
  Code,
  Upload,
  Plus,
  Sparkles,
  Search,
  X,
  Lock,
  Globe,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const [resources, setResources] = useState<LearningResourceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOTE' | 'CODE' | 'LINK' | 'DOCUMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<'ALL' | 'PRIVATE' | 'SHARED'>('ALL');

  // Modals
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<LearningResourceDto | null>(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Link form state
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkPrivate, setLinkPrivate] = useState(false);

  // Code form state
  const [codeTitle, setCodeTitle] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeDesc, setCodeDesc] = useState('');
  const [codePrivate, setCodePrivate] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.resources.list();
      if (res.data) {
        setResources(res.data);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await apiService.resources.delete(id);
      fetchResources();
    } catch {
      // Handled
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    try {
      const res = await apiService.resources.create({
        type: 'LINK',
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        description: linkDesc.trim() || undefined,
        isPrivate: linkPrivate,
      });

      if (res.data) {
        setIsLinkModalOpen(false);
        setLinkTitle('');
        setLinkUrl('');
        setLinkDesc('');
        fetchResources();
      }
    } catch {
      // Handled
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeTitle.trim() || !codeContent) return;

    try {
      const res = await apiService.resources.create({
        type: 'CODE',
        title: codeTitle.trim(),
        content: codeContent,
        language: codeLang,
        description: codeDesc.trim() || undefined,
        isPrivate: codePrivate,
      });

      if (res.data) {
        setIsCodeModalOpen(false);
        setCodeTitle('');
        setCodeContent('');
        setCodeDesc('');
        fetchResources();
      }
    } catch {
      // Handled
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((r) => {
    if (activeTab !== 'ALL' && r.type !== activeTab) return false;
    if (privacyFilter === 'PRIVATE' && !r.isPrivate) return false;
    if (privacyFilter === 'SHARED' && r.isPrivate) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      const matchContent = r.content?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchContent;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Knowledge-Sharing Workspace • Phase 5</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Study Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Store study notes, share external documentation, code snippets, and PDFs with learning partners.
          </p>
        </div>

        {/* Quick Create Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => {
              setEditingNote(null);
              setIsNoteEditorOpen(true);
            }}
          >
            New Note
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Code className="w-4 h-4" />}
            onClick={() => setIsCodeModalOpen(true)}
          >
            Code Snippet
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LinkIcon className="w-4 h-4" />}
            onClick={() => setIsLinkModalOpen(true)}
          >
            Share Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsFileUploadOpen(true)}
          >
            Upload File
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Search and Privacy Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, links, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Privacy Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setPrivacyFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              privacyFilter === 'ALL' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPrivacyFilter('SHARED')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              privacyFilter === 'SHARED' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Shared</span>
          </button>
          <button
            onClick={() => setPrivacyFilter('PRIVATE')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              privacyFilter === 'PRIVATE' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Private</span>
          </button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Types' },
          { id: 'NOTE', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
          { id: 'CODE', label: 'Code Snippets', icon: <Code className="w-4 h-4" /> },
          { id: 'LINK', label: 'External Links', icon: <LinkIcon className="w-4 h-4" /> },
          { id: 'DOCUMENT', label: 'Documents', icon: <Upload className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Resources */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading workspace resources...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No resources found</h3>
            <p className="text-xs text-slate-400">
              Your workspace is currently empty. Start taking notes or share code snippets with friends!
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingNote(null);
              setIsNoteEditorOpen(true);
            }}
          >
            Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onEdit={(r) => {
                setEditingNote(r);
                setIsNoteEditorOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Note Editor Modal */}
      {isNoteEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setIsNoteEditorOpen(false);
                setEditingNote(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <NoteEditor
              initialNote={editingNote}
              onSuccess={() => {
                setIsNoteEditorOpen(false);
                setEditingNote(null);
                fetchResources();
              }}
              onCancel={() => {
                setIsNoteEditorOpen(false);
                setEditingNote(null);
              }}
            />
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {isFileUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsFileUploadOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <FileUpload
              onSuccess={() => {
                setIsFileUploadOpen(false);
                fetchResources();
              }}
              onCancel={() => setIsFileUploadOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Share External Link</h3>
            </div>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., React 19 Official Documentation"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Notes about this link..."
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={linkPrivate}
                  onChange={(e) => setLinkPrivate(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-0"
                />
                <span>Keep this link private (only visible to you)</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsLinkModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Snippet Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Save Code Snippet</h3>
            </div>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Snippet Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., QuickSort in Python"
                    value={codeTitle}
                    onChange={(e) => setCodeTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="sql">SQL</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Code *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="// Paste your code snippet here"
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={codePrivate}
                  onChange={(e) => setCodePrivate(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-0"
                />
                <span>Keep this code snippet private</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsCodeModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Snippet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
