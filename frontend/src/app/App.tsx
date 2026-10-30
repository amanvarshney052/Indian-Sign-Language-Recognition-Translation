import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './router';

export const App: React.FC = () => {
  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    return localStorage.getItem('isl_mock_mode_override') === 'true';
  });

  const handleToggleMockMode = () => {
    setIsMockMode((prev) => {
      const next = !prev;
      localStorage.setItem('isl_mock_mode_override', String(next));
      return next;
    });
  };

  return (
    <HashRouter>
      <AppRoutes
        isMockMode={isMockMode}
        onToggleMockMode={handleToggleMockMode}
      />
    </HashRouter>
  );
};

export default App;

