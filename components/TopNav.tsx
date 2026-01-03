import { User } from 'lucide-react';

export function TopNav() {
  return (
    <div className="h-14 bg-slate-900 text-white border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-sm">AS</span>
          </div>
          <h1 className="text-lg">Auto-Standard</h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Model:</span>
            <span className="text-blue-400">Llama-3-Telecom-QLoRA-v1.2</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Deployment:</span>
            <span className="text-green-400">Local / Quantized (4-bit)</span>
          </div>
        </div>
      </div>
      
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
        <User className="w-4 h-4" />
        <span className="text-sm">User Profile</span>
      </button>
    </div>
  );
}
