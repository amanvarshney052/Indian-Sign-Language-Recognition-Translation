import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { TranslatePage } from '../pages/TranslatePage';
import { VocabularyPage } from '../pages/VocabularyPage';
import { HistoryPage } from '../pages/HistoryPage';
import { SettingsPage } from '../pages/SettingsPage';

interface AppRoutesProps {
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  isMockMode,
  onToggleMockMode,
}) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout
            isMockMode={isMockMode}
            onToggleMockMode={onToggleMockMode}
          />
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="translate" element={<TranslatePage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route
          path="settings"
          element={
            <SettingsPage
              isMockMode={isMockMode}
              onToggleMockMode={onToggleMockMode}
            />
          }
        />
        {/* Wildcard fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

