"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCareLoopStore } from "@/hooks/useCareLoopStore";

type CareLoopContextType = ReturnType<typeof useCareLoopStore>;

const CareLoopContext = createContext<CareLoopContextType | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useCareLoopStore();

  return (
    <QueryClientProvider client={queryClient}>
      <CareLoopContext.Provider value={store}>
        {children}
      </CareLoopContext.Provider>
    </QueryClientProvider>
  );
}

export function useCareLoop() {
  const context = useContext(CareLoopContext);
  if (!context) {
    throw new Error("useCareLoop must be used within an AppProvider");
  }
  return context;
}
