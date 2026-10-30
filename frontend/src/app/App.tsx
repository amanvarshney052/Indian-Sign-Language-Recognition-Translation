import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
    <BrowserRouter>
      <AppRoutes
        isMockMode={isMockMode}
        onToggleMockMode={handleToggleMockMode}
      />
    </BrowserRouter>
  );
};

export default App;

