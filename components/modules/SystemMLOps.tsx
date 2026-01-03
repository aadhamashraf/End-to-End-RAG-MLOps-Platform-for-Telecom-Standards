import { CheckCircle, XCircle, Activity, Cpu, Database, Zap, Clock, HardDrive } from 'lucide-react';

const modelStatus = {
  baseModel: 'Meta-Llama-3-8B',
  fineTuning: 'QLoRA (Quantized Low-Rank Adaptation)',
  quantization: '4-bit NF4',
  inferenceBackend: 'ONNX Runtime',
  parameters: '8B',
  activeParameters: '2.1B (after quantization)',
  lora_rank: 16,
  lora_alpha: 32
};

const pipelineStatus = {
  lastRun: '2026-01-03 08:45:22',
  status: 'passed',
  evaluationGate: 'passed',
  deployedVersion: 'v1.2',
  buildDuration: '12m 34s',
  tests: {
    unit: { passed: 142, failed: 0 },
    integration: { passed: 38, failed: 0 },
    evaluation: { passed: true, accuracy: 0.89 }
  }
};

const resourceMetrics = {
  avgLatency: 245,
  p95Latency: 380,
  p99Latency: 520,
  memoryFootprint: 4.2,
  gpuUtilization: 65,
  inferenceMode: 'Local GPU (CUDA)',
  throughput: 24.5
};

const systemHealth = [
  { component: 'Embedding Service', status: 'healthy', uptime: '99.8%', latency: '12ms' },
  { component: 'Vector Database', status: 'healthy', uptime: '99.9%', latency: '8ms' },
  { component: 'LLM Inference', status: 'healthy', uptime: '99.5%', latency: '245ms' },
  { component: 'Document Indexer', status: 'healthy', uptime: '100%', latency: 'N/A' },
  { component: 'Evaluation Pipeline', status: 'healthy', uptime: '99.7%', latency: 'N/A' },
];

export function SystemMLOps() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="mb-2">System & MLOps Dashboard</h2>
        <p className="text-slate-600">
          Production model status, deployment pipeline, and resource monitoring
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Model Status */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3>Model Status</h3>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="text-slate-600">Base Model</div>
              <div>{modelStatus.baseModel}</div>
              
              <div className="text-slate-600">Fine-tuning Method</div>
              <div className="text-xs">{modelStatus.fineTuning}</div>
              
              <div className="text-slate-600">Quantization</div>
              <div>{modelStatus.quantization}</div>
              
              <div className="text-slate-600">Inference Backend</div>
              <div>{modelStatus.inferenceBackend}</div>
              
              <div className="text-slate-600">Total Parameters</div>
              <div>{modelStatus.parameters}</div>
              
              <div className="text-slate-600">Active Parameters</div>
              <div className="text-green-600">{modelStatus.activeParameters}</div>
              
              <div className="text-slate-600">LoRA Rank</div>
              <div>{modelStatus.lora_rank}</div>
              
              <div className="text-slate-600">LoRA Alpha</div>
              <div>{modelStatus.lora_alpha}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Model loaded and operational</span>
            </div>
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3>CI/CD Pipeline Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last Run</span>
              <span className="text-sm">{pipelineStatus.lastRun}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Build Duration</span>
              <span className="text-sm">{pipelineStatus.buildDuration}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Deployed Version</span>
              <span className="text-sm">{pipelineStatus.deployedVersion}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">CI Status</span>
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Passed
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Evaluation Gate</span>
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Passed (Accuracy: 0.89)
              </span>
            </div>
            
            <div className="text-xs text-slate-600 mt-3">
              <div>Unit Tests: {pipelineStatus.tests.unit.passed} passed</div>
              <div>Integration Tests: {pipelineStatus.tests.integration.passed} passed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Metrics */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3>Resource Awareness</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Latency</span>
            </div>
            <div className="mb-3">
              <div className="mb-1">Avg: {resourceMetrics.avgLatency}ms</div>
              <div className="text-xs text-slate-600">P95: {resourceMetrics.p95Latency}ms</div>
              <div className="text-xs text-slate-600">P99: {resourceMetrics.p99Latency}ms</div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Memory</span>
            </div>
            <div className="mb-3">
              <div className="mb-1">{resourceMetrics.memoryFootprint} GB</div>
              <div className="text-xs text-slate-600">GPU VRAM</div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '35%' }} />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">GPU Utilization</span>
            </div>
            <div className="mb-3">
              <div className="mb-1">{resourceMetrics.gpuUtilization}%</div>
              <div className="text-xs text-slate-600">Average</div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${resourceMetrics.gpuUtilization}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Throughput</span>
            </div>
            <div className="mb-3">
              <div className="mb-1">{resourceMetrics.throughput} req/s</div>
              <div className="text-xs text-slate-600">Average</div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-600 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600">Inference Mode:</span>
            <span>{resourceMetrics.inferenceMode}</span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3>System Health</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Component</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Uptime</th>
                <th className="px-4 py-3 text-left">Avg Latency</th>
              </tr>
            </thead>
            <tbody>
              {systemHealth.map((component, idx) => (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="px-4 py-3">{component.component}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 capitalize">{component.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{component.uptime}</td>
                  <td className="px-4 py-3">{component.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
