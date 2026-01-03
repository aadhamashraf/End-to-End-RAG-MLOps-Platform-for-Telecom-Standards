import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { HelpCircle } from 'lucide-react';

const answerAttributionData = [
  { source: 'TS 38.300 §7.1', contribution: 42 },
  { source: 'TS 23.501 §5.2', contribution: 31 },
  { source: 'TS 38.214 §6.1', contribution: 18 },
  { source: 'TS 22.261 §7.2', contribution: 9 },
];

const retrievalFactors = [
  { factor: 'Semantic Match', value: 45, color: '#3b82f6' },
  { factor: 'Keyword Match', value: 25, color: '#8b5cf6' },
  { factor: 'Domain Boost', value: 18, color: '#ec4899' },
  { factor: 'Release Recency', value: 12, color: '#f59e0b' },
];

const documentRankingExplanation = {
  document: 'TS 38.300 §7.1 - URLLC Support',
  reasons: [
    {
      factor: 'High Semantic Similarity',
      score: 0.87,
      explanation: 'Query embeddings closely match document content about latency guarantees and scheduling mechanisms'
    },
    {
      factor: 'Domain Relevance',
      score: 1.0,
      explanation: 'Document tagged with URLLC and 5G Core domains, matching query classification'
    },
    {
      factor: 'Release Match',
      score: 1.0,
      explanation: 'Release 17 specification matches query filter'
    },
    {
      factor: 'User Preference',
      score: 0.92,
      explanation: 'Historical interaction shows high relevance for URLLC-related queries'
    },
  ]
};

export function Explainability() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">Explainability (XAI for RAG)</h2>
        <p className="text-slate-600">
          Understanding why specific answers and documents are retrieved
        </p>
      </div>

      {/* Answer Attribution */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3>Answer Attribution</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Contribution score per retrieved chunk to the generated answer
        </p>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={answerAttributionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="source" type="category" width={150} tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Bar dataKey="contribution" fill="#3b82f6" radius={[0, 8, 8, 0]}>
              {answerAttributionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`rgba(59, 130, 246, ${1 - index * 0.2})`} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Retrieval Factors */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="mb-4">Retrieval Factor Breakdown</h3>
          <p className="text-sm text-slate-600 mb-4">
            What influenced the document ranking?
          </p>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={retrievalFactors}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ factor, value }) => `${factor}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {retrievalFactors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Semantic vs Keyword */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="mb-4">Search Strategy Analysis</h3>
          <p className="text-sm text-slate-600 mb-6">
            Balance between semantic understanding and keyword matching
          </p>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Semantic Match</span>
                <span className="text-sm">45%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '45%' }} />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Neural embedding similarity using fine-tuned Llama-3 model
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Keyword Match</span>
                <span className="text-sm">25%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '25%' }} />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                BM25 lexical matching for technical terminology
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Metadata Boost</span>
                <span className="text-sm">30%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-600 rounded-full" style={{ width: '30%' }} />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Domain tags, release filtering, and user preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Ranking Explanation */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="mb-2">Why This Document Ranked Highest?</h3>
        <div className="mb-4 px-4 py-3 bg-blue-50 rounded-lg text-sm">
          {documentRankingExplanation.document}
        </div>
        
        <div className="space-y-4">
          {documentRankingExplanation.reasons.map((reason, idx) => (
            <div key={idx} className="border-l-4 border-blue-600 pl-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{reason.factor}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  Score: {reason.score.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{reason.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
