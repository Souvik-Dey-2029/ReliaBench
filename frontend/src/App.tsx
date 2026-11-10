import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ComparisonsPage } from './pages/ComparisonsPage';
import { TracesPage } from './pages/TracesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/benchmarks" element={<BenchmarksPage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/comparisons" element={<ComparisonsPage />} />
          <Route path="/traces" element={<TracesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
