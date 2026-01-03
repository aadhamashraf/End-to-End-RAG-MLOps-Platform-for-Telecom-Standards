import { CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface EvaluationRun {
  id: string;
  date: string;
  datasetVersion: string;
  modelVersion: string;
  accuracy: number;
  faithfulness: number;
  hallucinationRate: number;
  status: 'passed' | 'failed' | 'warning';
}

const evaluationRuns: EvaluationRun[] = [
  {
    id: 'eval-2026-01-03',
    date: '2026-01-03',
    datasetVersion: 'v3.2',
    modelVersion: 'Llama-3-Telecom-QLoRA-v1.2',
    accuracy: 0.89,
    faithfulness: 0.92,
    hallucinationRate: 0.04,
    status: 'passed'
  },
  {
    id: 'eval-2025-12-28',
    date: '2025-12-28',
    datasetVersion: 'v3.1',
    modelVersion: 'Llama-3-Telecom-QLoRA-v1.1',
    accuracy: 0.86,
    faithfulness: 0.88,
    hallucinationRate: 0.07,
    status: 'warning'
  },
  {
    id: 'eval-2025-12-20',
    date: '2025-12-20',
    datasetVersion: 'v3.0',
    modelVersion: 'Llama-3-Telecom-QLoRA-v1.0',
    accuracy: 0.82,
    faithfulness: 0.85,
    hallucinationRate: 0.11,
    status: 'failed'
  },
];

const failureExamples = [
  {
    id: 'fail-1',
    query: 'What is the maximum bandwidth for FR2 in Release 16?',
    expectedAnswer: '400 MHz for FR2 as specified in TS 38.101-2',
    actualAnswer: '800 MHz for FR2',
    issue: 'Hallucination - cited incorrect bandwidth value',
    severity: 'high',
    missingCitation: 'TS 38.101-2 §5.3'
  },
  {
    id: 'fail-2',
    query: 'How does beam management work in NR?',
    expectedAnswer: 'Beam management includes beam selection, beam refinement, and beam recovery procedures',
    actualAnswer: 'Beam management uses P-1, P-2, and P-3 procedures as defined in the specification',
    issue: 'Overconfident - provided specific procedure names without source',
    severity: 'medium',
    missingCitation: 'TS 38.213 §4.1'
  },
  {
    id: 'fail-3',
    query: 'What are the key features of network slicing?',
    expectedAnswer: 'Network slicing enables dedicated virtual networks with isolation, customization, and resource allocation',
    actualAnswer: 'Network slicing is a technique for dividing networks',
    issue: 'Incomplete answer - missing key technical details',
    severity: 'low',
    missingCitation: 'TS 23.501 §5.15'
  },
];

export function Evaluation() {
  const latestRun = evaluationRuns[0];
  const previousRun = evaluationRuns[1];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getMetricChange = (current: number, previous: number) => {
    const diff = current - previous;
    const isPositive = diff > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`flex items-center gap-1 text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {(diff > 0 ? '+' : '')}{(diff * 100).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">Evaluation (LLM-as-a-Judge)</h2>
        <p className="text-slate-600">
          Automated quality assessment and failure mode analysis
        </p>
      </div>

      {/* Latest Run Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Latest Evaluation Run</h3>
          <div className="flex items-center gap-2">
            {getStatusIcon(latestRun.status)}
            <span className="text-sm capitalize">{latestRun.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-slate-600 mb-1">Accuracy</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{(latestRun.accuracy * 100).toFixed(1)}%</span>
              {getMetricChange(latestRun.accuracy, previousRun.accuracy)}
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${latestRun.accuracy * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-600 mb-1">Faithfulness</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{(latestRun.faithfulness * 100).toFixed(1)}%</span>
              {getMetricChange(latestRun.faithfulness, previousRun.faithfulness)}
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full" 
                style={{ width: `${latestRun.faithfulness * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-600 mb-1">Hallucination Rate</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{(latestRun.hallucinationRate * 100).toFixed(1)}%</span>
              {getMetricChange(-latestRun.hallucinationRate, -previousRun.hallucinationRate)}
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-red-600 rounded-full" 
                style={{ width: `${latestRun.hallucinationRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Runs Table */}
      <div className="bg-white rounded-lg border border-slate-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3>Evaluation Runs History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Dataset</th>
                <th className="px-4 py-3 text-left">Model Version</th>
                <th className="px-4 py-3 text-left">Accuracy</th>
                <th className="px-4 py-3 text-left">Faithfulness</th>
                <th className="px-4 py-3 text-left">Hallucination</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {evaluationRuns.map((run, idx) => (
                <tr key={run.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">{run.date}</td>
                  <td className="px-4 py-3">{run.datasetVersion}</td>
                  <td className="px-4 py-3 text-xs">{run.modelVersion}</td>
                  <td className="px-4 py-3">{(run.accuracy * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3">{(run.faithfulness * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3">{(run.hallucinationRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className="capitalize">{run.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure Analysis */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="mb-4">Failure Analysis View</h3>
        <p className="text-sm text-slate-600 mb-4">
          Detailed examination of problematic responses
        </p>
        
        <div className="space-y-4">
          {failureExamples.map((failure) => (
            <div key={failure.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="mb-1">Query</div>
                  <div className="text-sm text-slate-600">{failure.query}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  failure.severity === 'high' ? 'bg-red-100 text-red-700' :
                  failure.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {failure.severity.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Expected Answer</div>
                  <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                    {failure.expectedAnswer}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-600 mb-1">Actual Answer</div>
                  <div className="text-sm bg-red-50 p-2 rounded border border-red-200">
                    {failure.actualAnswer}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-900">Issue: </span>
                  <span className="text-slate-600">{failure.issue}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm mt-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-900">Missing Citation: </span>
                  <span className="text-blue-600">{failure.missingCitation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
