// src/app/context/CMSContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { LandingCMSData } from "../lib/mockData";
import { initialLandingCMS } from "../lib/mockData";

interface CMSContextType {
  cms: LandingCMSData;
  loading: boolean;
  refreshCMS: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType>({
  cms: initialLandingCMS,
  loading: false,
  refreshCMS: async () => {},
});

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [cms, setCms] = useState<LandingCMSData>(initialLandingCMS);
  const [loading, setLoading] = useState(true);

  const fetchCMS = async () => {
    try {
      const res = await fetch("/api/admin/landing_cms");
      if (res.ok) {
        const data = await res.json();
        if (data && data.hero) {
          setCms(data);
        }
      }
    } catch (err) {
      console.warn("Using default CMS content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  return (
    <CMSContext.Provider value={{ cms, loading, refreshCMS: fetchCMS }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  return useContext(CMSContext);
}
