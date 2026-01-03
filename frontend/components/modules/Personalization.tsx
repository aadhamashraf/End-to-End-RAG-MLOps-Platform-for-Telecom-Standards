import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Target, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { personalizationAPI, handleAPIError } from '@/lib/api';

export function Personalization() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Hardcoded user ID 1 for MVP
      const dashboard = await personalizationAPI.getDashboard(1);
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

  // Fallback for empty data
  if (!data) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">Personalization Dashboard</h2>
        <p className="text-slate-600">
          Tailored search experience based on your value activity and interests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Interests */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3>Top Interests</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Topics you search for most frequently
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topInterests} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="topic" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="relevance" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {data.topInterests && data.topInterests.map((_: any, index: number) => (
                  <Cell key={`cell - ${index} `} fill={`rgba(59, 130, 246, ${1 - index * 0.15})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Domain Activity */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3>Domain Activity</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Your query volume over the last 14 days
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.domainActivity}>
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Area type="monotone" dataKey="queries" stroke="#10b981" fillOpacity={1} fill="url(#colorQueries)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking Influence */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3>Ranking Influence</h3>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-slate-600">Personalization Impact</p>
            <p className="text-2xl font-semibold">High</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Boost Score</p>
            <p className="text-2xl font-semibold text-purple-600">+42%</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div className="bg-purple-600 h-4 rounded-full" style={{ width: '70%' }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Your preferences are actively re-ranking 70% of search results.
        </p>
      </div>
    </div>
  );
}
