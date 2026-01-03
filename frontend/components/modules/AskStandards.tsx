import { useState } from 'react';
import { Send, ChevronDown, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { queryAPI, QueryRequest, QueryResponse, handleAPIError } from '@/lib/api';

export function AskStandards() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['URLLC', '5G Core']);
  const [selectedRelease, setSelectedRelease] = useState<string>('');
  const [selectedSpecType, setSelectedSpecType] = useState<string>('');

  const availableTags = ['URLLC', 'v2X', '5G Core', 'RAN', 'Network Slicing', 'QoS', 'Security'];
  const releases = ['Rel-15', 'Rel-16', 'Rel-17', 'Rel-18'];
  const specTypes = ['TS', 'TR'];

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Build request
      const requestData: QueryRequest = {
        question: query,
        top_k: 5,
        filters: {},
      };

      // Add filters if selected
      if (selectedRelease) {
        requestData.filters!.release = selectedRelease;
      }
      if (selectedTags.length > 0) {
        requestData.filters!.domain = selectedTags[0]; // Use first tag as primary domain
      }
      if (selectedSpecType) {
        requestData.filters!.spec_type = selectedSpecType;
      }

      // Call API
      const result = await queryAPI.submitQuery(requestData);
      setResponse(result);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
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
            disabled={loading}
          />

          {/* Domain Tags */}
          <div className="mt-3 mb-3">
            <label className="text-xs text-slate-600 mb-2 block">Domain Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } disabled:opacity-50`}
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
                <select
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm appearance-none bg-white"
                  value={selectedRelease}
                  onChange={(e) => setSelectedRelease(e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Releases</option>
                  {releases.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-xs text-slate-600 mb-1 block">Spec Type</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm appearance-none bg-white"
                  value={selectedSpecType}
                  onChange={(e) => setSelectedSpecType(e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Types</option>
                  {specTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Query
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Answer Panel */}
        {response && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 flex-1 overflow-auto">
            <div className="flex items-center gap-3 mb-4">
              <h3>Generated Answer</h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Grounded Sources
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {response.answer.split('\n\n').map((paragraph, idx) => (
                <div key={idx} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph.split('\n').map((line, lineIdx) => (
                    <div key={lineIdx} className={line.startsWith('•') || line.startsWith('-') ? 'ml-4 mb-2' : ''}>
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
      {response && response.sources && response.sources.length > 0 && (
        <div className="w-96 border-l border-slate-200 bg-slate-50 p-6 overflow-auto">
          <h3 className="mb-4">Retrieved Context ({response.sources.length})</h3>

          <div className="space-y-4">
            {response.sources.map((source, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-blue-600 font-medium mb-1">
                      {source.metadata.spec_id}
                    </div>
                    <div className="text-xs text-slate-500">{source.metadata.release}</div>
                    {source.metadata.domains && source.metadata.domains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {source.metadata.domains.map((domain, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            {domain}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                    {source.score.toFixed(2)}
                  </div>
                </div>

                <div className="text-sm text-slate-600 leading-relaxed">
                  {source.text.length > 200 ? source.text.substring(0, 200) + '...' : source.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
