import { useState } from 'react';
import { EditorPage } from './pages/EditorPage';
import { TemplateManagementPage } from './pages/TemplateManagementPage';

type Screen = { name: 'templates' } | { name: 'editor'; templateId?: string };

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'templates' });
  if (screen.name === 'editor') return <EditorPage initialTemplateId={screen.templateId} onBack={() => setScreen({ name: 'templates' })} />;
  return <TemplateManagementPage onEdit={(templateId) => setScreen({ name: 'editor', templateId })} />;
}

export default App;
