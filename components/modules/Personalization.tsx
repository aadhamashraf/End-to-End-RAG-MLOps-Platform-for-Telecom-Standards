import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const topInterestsData = [
  { topic: 'URLLC', queries: 45 },
  { topic: 'v2X', queries: 38 },
  { topic: 'Scheduling', queries: 32 },
  { topic: '5G Core', queries: 28 },
  { topic: 'Network Slicing', queries: 22 },
  { topic: 'QoS', queries: 18 },
];

const domainHeatmapData = [
  { domain: 'RAN', week1: 12, week2: 15, week3: 18, week4: 22 },
  { domain: '5G Core', week1: 8, week2: 11, week3: 14, week4: 16 },
  { domain: 'v2X', week1: 5, week2: 8, week3: 12, week4: 15 },
  { domain: 'URLLC', week1: 10, week2: 14, week3: 18, week4: 20 },
];

const rankingInfluence = [
  { doc: 'TS 38.300 §7.1', beforeScore: 0.72, afterScore: 0.87 },
  { doc: 'TS 23.501 §5.27', beforeScore: 0.68, afterScore: 0.82 },
  { doc: 'TS 38.214 §6.1', beforeScore: 0.65, afterScore: 0.79 },
  { doc: 'TS 22.261 §7', beforeScore: 0.61, afterScore: 0.73 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function Personalization() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">Personalization Dashboard</h2>
        <p className="text-slate-600">
          Your query patterns and adaptive search behavior
        </p>
      </div>

      {/* Top Interests */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="mb-4">Top Queried Topics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topInterestsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="queries" radius={[8, 8, 0, 0]}>
              {topInterestsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain Heatmap */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3>Domain Activity Trend (Last 4 Weeks)</h3>
        </div>
        
        <div className="space-y-3">
          {domainHeatmapData.map((domain) => (
            <div key={domain.domain}>
              <div className="text-sm mb-1">{domain.domain}</div>
              <div className="grid grid-cols-4 gap-2">
                {[domain.week1, domain.week2, domain.week3, domain.week4].map((value, idx) => {
                  const intensity = Math.min(value / 25, 1);
                  return (
                    <div
                      key={idx}
                      className="h-12 rounded flex items-center justify-center text-xs transition-all hover:scale-105"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`,
                        color: intensity > 0.5 ? 'white' : '#1e293b'
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-end gap-4 mt-4 text-xs text-slate-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded"
                style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Ranking Influence */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="mb-2">Ranking Influence Visualization</h3>
        <p className="text-sm text-slate-600 mb-4">
          How personalization re-ranks documents based on your query history
        </p>
        
        <div className="space-y-4">
          {rankingInfluence.map((item, idx) => (
            <div key={idx} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
              <div className="text-sm mb-2">{item.doc}</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Before Personalization</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-slate-400 h-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${item.beforeScore * 100}%` }}
                      >
                        <span className="text-xs text-white">{item.beforeScore.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-600 mb-1">After Personalization</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${item.afterScore * 100}%` }}
                      >
                        <span className="text-xs text-white">{item.afterScore.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{((item.afterScore - item.beforeScore) * 100).toFixed(1)}% improvement</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
