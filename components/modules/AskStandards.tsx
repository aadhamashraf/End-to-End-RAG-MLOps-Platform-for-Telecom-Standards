import { useState } from 'react';
import { Send, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

const mockResponse = {
  answer: `URLLC (Ultra-Reliable Low-Latency Communication) latency guarantees in Release 17 are achieved through several key mechanisms:

• **Enhanced Scheduling Techniques**: Dynamic grant-free transmission enables deterministic latency for critical services, reducing scheduling delays from up to 4ms to sub-1ms

• **Duplication and Diversity**: Packet duplication across multiple carriers or transmission paths ensures reliability of 99.9999% (one failure per million packets)

• **Priority Handling**: Time-sensitive communication (TSC) introduces strict QoS mechanisms with preemption capabilities to guarantee <1ms air interface latency

• **Resource Reservation**: Configured grant (CG) Type 1 and Type 2 allow pre-allocated resources, eliminating scheduling request overhead for periodic traffic`,
  confidence: 0.89,
  grounded: true,
  evaluationPass: true,
  retrievedChunks: [
    {
      specId: 'TS 38.300',
      release: 'Rel-17',
      clause: '§7.1',
      similarity: 0.87,
      text: 'For URLLC services, the gNB may configure grant-free transmission schemes to minimize latency. The target for URLLC is to support a user plane latency of 0.5ms for UL and 0.5ms for DL...'
    },
    {
      specId: 'TS 23.501',
      release: 'Rel-17',
      clause: '§5.27.2',
      similarity: 0.82,
      text: 'Time Sensitive Communication (TSC) support includes end-to-end latency requirements. The 5G System supports deterministic communication with specified latency bounds...'
    },
    {
      specId: 'TS 38.214',
      release: 'Rel-17',
      clause: '§6.1.2.1',
      similarity: 0.79,
      text: 'Configured grant configuration includes periodicity, time domain resource allocation, and MCS configuration. Type 1 CG requires no dynamic signaling after RRC configuration...'
    }
  ]
};

export function AskStandards() {
  const [query, setQuery] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['URLLC', '5G Core']);

  const availableTags = ['URLLC', 'v2X', '5G Core', 'RAN', 'Network Slicing', 'QoS', 'Security'];
  const releases = ['Rel-15', 'Rel-16', 'Rel-17', 'Rel-18'];
  const specTypes = ['TS', 'TR'];

  const handleSubmit = () => {
    if (query.trim()) {
      setShowResponse(true);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="h-full flex">
      {/* Left side - Query and Answer */}
      <div className="flex-1 flex flex-col p-6">
        {/* Query Input Panel */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about telecom standards..."
            className="w-full h-24 resize-none border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Domain Tags */}
          <div className="mt-3 mb-3">
            <label className="text-xs text-slate-600 mb-2 block">Domain Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-3">
            <div className="flex-1">
              <label className="text-xs text-slate-600 mb-1 block">Release</label>
              <div className="relative">
                <select className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm appearance-none bg-white">
                  <option>All Releases</option>
                  {releases.map(rel => (
                    <option key={rel}>{rel}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="text-xs text-slate-600 mb-1 block">Spec Type</label>
              <div className="relative">
                <select className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm appearance-none bg-white">
                  <option>All Types</option>
                  {specTypes.map(type => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Query
          </button>
        </div>

        {/* Answer Panel */}
        {showResponse && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 flex-1 overflow-auto">
            <div className="flex items-center gap-3 mb-4">
              <h3>Generated Answer</h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  Confidence: {mockResponse.confidence}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Grounded Sources
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Evaluation Pass
                </span>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {mockResponse.answer.split('\n\n').map((paragraph, idx) => (
                <div key={idx} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph.split('\n').map((line, lineIdx) => (
                    <div key={lineIdx} className={line.startsWith('•') ? 'ml-4 mb-2' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Retrieved Context */}
      {showResponse && (
        <div className="w-96 border-l border-slate-200 bg-slate-50 p-6 overflow-auto">
          <h3 className="mb-4">Retrieved Context</h3>
          
          <div className="space-y-4">
            {mockResponse.retrievedChunks.map((chunk, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-blue-600 mb-1">
                      {chunk.specId} – {chunk.clause}
                    </div>
                    <div className="text-xs text-slate-500">{chunk.release}</div>
                  </div>
                  <div className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {chunk.similarity.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-sm text-slate-600 leading-relaxed">
                  {chunk.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
