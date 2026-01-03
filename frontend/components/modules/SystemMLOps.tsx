import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Activity, Database, Loader2 } from 'lucide-react';
import { adminAPI, queryAPI, MetricsResponse, HealthResponse, handleAPIError } from '@/lib/api';

export function SystemMLOps() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsData, healthData] = await Promise.all([
        adminAPI.getMetrics(),
        queryAPI.getHealth(),
      ]);
      setMetrics(metricsData);
      setHealth(healthData);
      setError(null);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const systemHealth = [
    {
      component: 'Embedding Service',
      status: health?.model_loaded ? 'healthy' : 'unknown',
    },
    {
      component: 'Vector Database',
      status: health?.vector_store_count !== undefined ? 'healthy' : 'unknown',
      info: health?.vector_store_count !== undefined ? `${health.vector_store_count} docs` : undefined
    },
    {
      component: 'LLM Inference',
      status: health?.model_loaded ? 'healthy' : 'degraded',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Metrics</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">System & MLOps Dashboard</h2>
        <p className="text-slate-600">
          Real-time system status and performance metrics
        </p>
        {health && (
          <div className="mt-2 text-sm text-slate-500">
            Last updated: {new Date(health.timestamp).toLocaleString()}
          </div>
        )}
      </div>

      {/* System Metrics from Backend */}
      {metrics && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h3>System Metrics</h3>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">Total Queries</div>
              <div className="text-2xl font-bold text-blue-600">{metrics.total_queries}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Total Documents</div>
              <div className="text-2xl font-bold text-green-600">{metrics.total_documents}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-purple-600">{metrics.total_users}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Avg Rating</div>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.avg_rating ? metrics.avg_rating.toFixed(2) : 'N/A'}
              </div>
            </div>
          </div>

          {metrics.recent_queries && metrics.recent_queries.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium mb-3">Recent Queries</h4>
              <div className="space-y-2">
                {metrics.recent_queries.slice(0, 5).map((q) => (
                  <div key={q.id} className="text-sm text-slate-600 flex items-center justify-between">
                    <span className="truncate flex-1">{q.question}</span>
                    <span className="text-xs text-slate-400 ml-4">
                      {new Date(q.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Health */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3>System Health</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Component</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Info</th>
              </tr>
            </thead>
            <tbody>
              {systemHealth.map((component, idx) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-4 py-3">{component.component}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {component.status === 'healthy' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={`capitalize ${component.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {component.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {component.info || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
