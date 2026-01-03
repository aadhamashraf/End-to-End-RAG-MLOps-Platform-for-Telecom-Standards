import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { evaluationAPI, handleAPIError } from '@/lib/api';

export function Evaluation() {
  const [runs, setRuns] = useState<any[]>([]);
  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [runsData, failuresData] = await Promise.all([
        evaluationAPI.getRuns(),
        evaluationAPI.getFailures()
      ]);
      setRuns(runsData);
      setFailures(failuresData);
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
          <p>Error loading evaluation data: {error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">Evaluation Dashboard</h2>
        <p className="text-slate-600">
          Track RAG pipeline performance and analyze failures
        </p>
      </div>

      {/* Recent Runs Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold">Recent Evaluation Runs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Dataset</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3">Accuracy</th>
                <th className="px-6 py-3">Faithfulness</th>
                <th className="px-6 py-3">Hallucinations</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4">{run.date}</td>
                  <td className="px-6 py-4">{run.datasetVersion}</td>
                  <td className="px-6 py-4">{run.modelVersion}</td>
                  <td className="px-6 py-4 font-medium text-green-600">
                    {(run.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">{(run.faithfulness * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-red-500">{(run.hallucinationRate * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${run.status === 'success' ? 'bg-green-100 text-green-800' :
                        run.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500">No evaluation runs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure Analysis */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Failure Analysis (Recent Issues)</h3>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {failures.map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-slate-900">"{item.query}"</p>
                <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium whitespace-nowrap">
                  {item.issue}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Generated Answer</p>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                    {item.actualAnswer}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Expected / Issue Detail</p>
                  <p className="text-slate-700 bg-green-50 p-2 rounded border border-green-100">
                    {item.expectedAnswer}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {failures.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p>No failures reported recently. Great job!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
