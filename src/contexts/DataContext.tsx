import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedReports } from '../data/reports';
import { checkBackend, type BackendStatus } from '../services/api';
import type { AnalyzeResponse, Report } from '../types';

interface DataContextValue {
  reports: Report[];
  status: BackendStatus;
  lastResult: AnalyzeResponse | null;
  setLastResult: (r: AnalyzeResponse | null) => void;
  addReport: (report: Omit<Report, 'id' | 'status' | 'created_at'>) => string;
  importReports: (rows: Report[]) => void;
  reportCount: {seeded: number;submitted: number;};
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: {children: React.ReactNode;}) {
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [lastResult, setLastResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    let active = true;
    checkBackend().then((s) => {
      if (active) setStatus(s);
    });
    return () => {
      active = false;
    };
  }, []);

  const addReport = useCallback((report: Omit<Report, 'id' | 'status' | 'created_at'>) => {
    const id = `YS-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const row: Report = {
      ...report,
      id,
      status: 'Pending validation',
      created_at: new Date().toISOString().slice(0, 10)
    };
    setReports((prev) => [row, ...prev]);
    return id;
  }, []);

  const importReports = useCallback((rows: Report[]) => {
    setReports((prev) => [...rows, ...prev]);
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      reports,
      status,
      lastResult,
      setLastResult,
      addReport,
      importReports,
      reportCount: {
        seeded: seedReports.length,
        submitted: reports.length - seedReports.length
      }
    }),
    [reports, status, lastResult, addReport, importReports]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}