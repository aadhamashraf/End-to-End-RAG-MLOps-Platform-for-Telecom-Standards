import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, Search, Loader2 } from 'lucide-react';
import { documentsAPI, DocNode, handleAPIError } from '@/lib/api';

export function DocumentExplorer() {
  const [tree, setTree] = useState<DocNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['3gpp']));
  const [selectedSpec, setSelectedSpec] = useState<DocNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const data = await documentsAPI.getTree();
      setTree(data);
      setError(null);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpec = async (node: DocNode) => {
    setSelectedSpec(node);
    setPreviewContent(null);
    if (node.type === 'spec') {
      try {
        const contentData = await documentsAPI.getContent(node.id);
        setPreviewContent(contentData.content);
      } catch (err) {
        console.error("Failed to load content preview:", err);
        setPreviewContent("Failed to load content preview.");
      }
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: DocNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedSpec?.id === node.id;

    // Simple client-side filtering for demo
    if (searchQuery && node.type === 'spec' && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-slate-100 transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : ''
            }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            if (node.type === 'spec') {
              handleSelectSpec(node);
            }
          }}
        >
          {hasChildren && (
            <button className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {node.type === 'spec' && <FileText className="w-4 h-4 text-blue-600" />}

          <span className="text-sm truncate">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center text-red-600">
          <p>Error loading documents: {error}</p>
          <button onClick={fetchTree} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left - Spec Browser */}
      <div className="w-96 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {tree.map(node => renderNode(node))}
          {tree.length === 0 && (
            <div className="text-center p-4 text-slate-500 text-sm">No documents found. Ingest some PDFs!</div>
          )}
        </div>
      </div>

      {/* Right - Document Metadata Panel */}
      <div className="flex-1 p-6 overflow-auto bg-slate-50">
        {selectedSpec ? (
          <div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h2 className="mb-4 text-xl font-semibold">{selectedSpec.name}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Release Version</div>
                  <div className="text-sm">{selectedSpec.metadata?.release || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-600 mb-1">Last Indexed</div>
                  <div className="text-sm">
                    {selectedSpec.metadata?.lastIndexed
                      ? new Date(selectedSpec.metadata.lastIndexed).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-600 mb-1">Total Chunks</div>
                  <div className="text-sm">{selectedSpec.metadata?.total_chunks || 0}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-600 mb-1">Domain Classification</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSpec.metadata?.domains?.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {d}
                      </span>
                    ))}
                    {(!selectedSpec.metadata?.domains || selectedSpec.metadata.domains.length === 0) && (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="mb-4 font-medium">Document Preview</h3>

              {previewContent ? (
                <div className="p-4 bg-slate-50 rounded border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {previewContent}
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a specification to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
