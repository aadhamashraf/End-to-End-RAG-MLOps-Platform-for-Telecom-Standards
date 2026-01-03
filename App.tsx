import { useState } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { AskStandards } from './components/modules/AskStandards';
import { DocumentExplorer } from './components/modules/DocumentExplorer';
import { Personalization } from './components/modules/Personalization';
import { Explainability } from './components/modules/Explainability';
import { Evaluation } from './components/modules/Evaluation';
import { SystemMLOps } from './components/modules/SystemMLOps';

export type ModuleType = 'ask' | 'documents' | 'personalization' | 'explainability' | 'evaluation' | 'system';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('ask');

  const renderModule = () => {
    switch (activeModule) {
      case 'ask':
        return <AskStandards />;
      case 'documents':
        return <DocumentExplorer />;
      case 'personalization':
        return <Personalization />;
      case 'explainability':
        return <Explainability />;
      case 'evaluation':
        return <Evaluation />;
      case 'system':
        return <SystemMLOps />;
      default:
        return <AskStandards />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
