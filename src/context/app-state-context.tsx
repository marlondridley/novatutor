
"use client";

import { createContext, useState, ReactNode } from 'react';

type AppStateContextType = {
  hasCompletedPlanner: boolean;
  setHasCompletedPlanner: (hasCompleted: boolean) => void;
};

export const AppStateContext = createContext<AppStateContextType>({
  hasCompletedPlanner: false,
  setHasCompletedPlanner: () => {},
});

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [hasCompletedPlanner, setHasCompletedPlanner] = useState(false);

  return (
    <AppStateContext.Provider value={{ hasCompletedPlanner, setHasCompletedPlanner }}>
      {children}
    </AppStateContext.Provider>
  );
};
