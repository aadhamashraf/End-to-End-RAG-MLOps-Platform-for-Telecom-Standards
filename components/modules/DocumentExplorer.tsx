import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Search } from 'lucide-react';

interface SpecNode {
  id: string;
  name: string;
  type: 'org' | 'release' | 'spec' | 'clause';
  children?: SpecNode[];
  metadata?: {
    release?: string;
    lastIndexed?: string;
    embeddingVersion?: string;
    domain?: string[];
  };
}

const mockSpecTree: SpecNode[] = [
  {
    id: '3gpp',
    name: '3GPP',
    type: 'org',
    children: [
      {
        id: 'rel-17',
        name: 'Release 17',
        type: 'release',
        children: [
          {
            id: 'ts-38-300',
            name: 'TS 38.300 - NR Overall Description',
            type: 'spec',
            metadata: {
              release: 'Rel-17',
              lastIndexed: '2025-12-15',
              embeddingVersion: 'v2.1',
              domain: ['RAN', '5G Core']
            },
            children: [
              { id: 'ts-38-300-7', name: '§7 - Physical Layer', type: 'clause' },
              { id: 'ts-38-300-7-1', name: '§7.1 - URLLC Support', type: 'clause' },
            ]
          },
          {
            id: 'ts-23-501',
            name: 'TS 23.501 - System Architecture',
            type: 'spec',
            metadata: {
              release: 'Rel-17',
              lastIndexed: '2025-12-14',
              embeddingVersion: 'v2.1',
              domain: ['5G Core', 'Network Slicing']
            },
            children: [
              { id: 'ts-23-501-5', name: '§5 - 5G System Architecture', type: 'clause' },
              { id: 'ts-23-501-5-27', name: '§5.27 - Time Sensitive Communication', type: 'clause' },
            ]
          },
        ]
      },
      {
        id: 'rel-16',
        name: 'Release 16',
        type: 'release',
        children: [
          {
            id: 'ts-22-186',
            name: 'TS 22.186 - eV2X Requirements',
            type: 'spec',
            metadata: {
              release: 'Rel-16',
              lastIndexed: '2025-11-20',
              embeddingVersion: 'v2.0',
              domain: ['v2X', 'URLLC']
            }
          },
        ]
      }
    ]
  },
  {
    id: 'itu-t',
    name: 'ITU-T',
    type: 'org',
    children: [
      {
        id: 'sg13',
        name: 'Study Group 13',
        type: 'release',
        children: [
          {
            id: 'y-3172',
            name: 'Y.3172 - Architectural Framework for ML',
            type: 'spec',
            metadata: {
              release: 'ITU-T',
              lastIndexed: '2025-10-05',
              embeddingVersion: 'v2.1',
              domain: ['AI/ML', 'Architecture']
            }
          }
        ]
      }
    ]
  }
];

export function DocumentExplorer() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['3gpp', 'rel-17']));
  const [selectedSpec, setSelectedSpec] = useState<SpecNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const renderNode = (node: SpecNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedSpec?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-slate-100 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700' : ''
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            if (node.type === 'spec') {
              setSelectedSpec(node);
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
          
          <span className="text-sm">{node.name}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
          {mockSpecTree.map(node => renderNode(node))}
        </div>
      </div>

      {/* Right - Document Metadata Panel */}
      <div className="flex-1 p-6 overflow-auto bg-slate-50">
        {selectedSpec ? (
          <div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h2 className="mb-4">{selectedSpec.name}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Release Version</div>
                  <div className="text-sm">{selectedSpec.metadata?.release || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-600 mb-1">Last Indexed</div>
                  <div className="text-sm">{selectedSpec.metadata?.lastIndexed || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-600 mb-1">Embedding Version</div>
                  <div className="text-sm">{selectedSpec.metadata?.embeddingVersion || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-600 mb-1">Domain Classification</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSpec.metadata?.domain?.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="mb-4">Document Preview</h3>
              
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <div className="text-slate-900 mb-2">§7.1 URLLC Support</div>
                  <div className="text-slate-600 leading-relaxed">
                    Ultra-Reliable Low-Latency Communication (URLLC) is characterized by strict requirements 
                    on latency and reliability. The 5G system supports URLLC services with the following capabilities...
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-slate-900 mb-2">Table 7.1-1: URLLC Parameters</div>
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Parameter</th>
                          <th className="px-3 py-2 text-left">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td className="px-3 py-2">User Plane Latency</td>
                          <td className="px-3 py-2">0.5ms - 1ms</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="px-3 py-2">Reliability</td>
                          <td className="px-3 py-2">99.999% - 99.9999%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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
