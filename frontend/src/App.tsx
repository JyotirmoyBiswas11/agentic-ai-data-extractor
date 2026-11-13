import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUIStore } from './stores/uiStore';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysesListPage } from './pages/AnalysesListPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';

export const App: React.FC = () => {
  const { theme } = useUIStore();

  useEffect(() => {
    // Ensure document root class matches stored theme
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected application workspace routes */}
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analyses" element={<AnalysesListPage />} />
          <Route path="/analyses/:id" element={<AnalysisDetailPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
