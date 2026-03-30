import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ViewerPage } from './pages/ViewerPage';
import { CommandPalette } from './components/CommandPalette';
import { api } from './lib/api';
import { usePreferencesStore } from './stores/preferencesStore';

function RedirectToFirst() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    api.prototypes.list().then((protos) => {
      if (protos.length > 0) setTarget(`/viewer/${protos[0].id}`);
    });
  }, []);

  if (!target) return null;
  return <Navigate to={target} replace />;
}

export function App() {
  const theme = usePreferencesStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectToFirst />} />
        <Route path="/viewer/:prototypeId" element={<ViewerPage />} />
        <Route path="/viewer/:prototypeId/:versionId" element={<ViewerPage />} />
      </Routes>
      <CommandPalette />
    </BrowserRouter>
  );
}
