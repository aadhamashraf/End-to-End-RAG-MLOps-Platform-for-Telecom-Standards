import { Search, FileText, Target, Lightbulb, TestTube, Settings } from 'lucide-react';
import { ModuleType } from '../App';

interface SidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const modules = [
  { id: 'ask' as ModuleType, icon: Search, label: 'Ask Standards' },
  { id: 'documents' as ModuleType, icon: FileText, label: 'Document Explorer' },
  { id: 'personalization' as ModuleType, icon: Target, label: 'Personalization' },
  { id: 'explainability' as ModuleType, icon: Lightbulb, label: 'Explainability' },
  { id: 'evaluation' as ModuleType, icon: TestTube, label: 'Evaluation' },
  { id: 'system' as ModuleType, icon: Settings, label: 'System & MLOps' },
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-slate-400 text-xs uppercase tracking-wider">Modules</h2>
      </div>
      
      <nav className="flex-1 p-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{module.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
