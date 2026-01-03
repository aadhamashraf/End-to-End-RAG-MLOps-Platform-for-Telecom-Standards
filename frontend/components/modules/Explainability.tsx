import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { HelpCircle, Loader2 } from 'lucide-react';
import { explainabilityAPI, handleAPIError, ExplainabilityDashboardResponse } from '@/lib/api';

export function Explainability() {
  const [data, setData] = useState<ExplainabilityDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const dashboard = await explainabilityAPI.getDashboard();
      setData(dashboard);
      setError(null);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
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
          <p>Error loading dashboard: {error}</p>
          <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  // Fallback
  if (!data) return null;

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
          Contribution score per retrieved chunk (Top Sources)
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.answerAttribution} layout="vertical">
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
              {data.answerAttribution && data.answerAttribution.map((_, index) => (
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
            What influenced the document ranking (Last 100 queries)
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.retrievalFactors}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ factor, value }) => `${factor}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.retrievalFactors && data.retrievalFactors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Queries List */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="mb-4">Recent Analyzed Queries</h3>
          <div className="space-y-3">
            {data.recentQueries && data.recentQueries.map((q) => (
              <div key={q.id} className="p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                {q.text}
              </div>
            ))}
            {!data.recentQueries?.length && <div className="text-slate-400 text-sm">No recent queries found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
