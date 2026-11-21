import { useState } from 'react';
import { api } from '../services/api';
import { ExecutionRecord, ReliabilityMetrics } from '../types';
import type { UiState } from './useUiState';

export function useReliability(ui: UiState) {
  const { notify } = ui;

  const [reliabilityMetrics, setReliabilityMetrics] = useState<ReliabilityMetrics | null>(null);
  const [failedRuns, setFailedRuns] = useState<ExecutionRecord[]>([]);

  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);

  const loadReliabilityData = async () => {
    try {
      const [m, f] = await Promise.all([
        api.getReliabilityMetrics(),
        api.getFailures(),
      ]);
      if (m) setReliabilityMetrics(m);
      if (f && f.length > 0) setFailedRuns(f);
    } catch {
      // Fallback
    }
  };

  const handleRetryFailure = async (record: ExecutionRecord) => {
    setIsRetryingId(record.id);
    try {
      const res = await api.retryFailure(record.id);
      if (res.success) {
        notify(`Retry scheduled for ${record.id}: ${res.message}`);
        await loadReliabilityData();
      } else {
        notify(`Retry rejected: ${res.message}`);
      }
    } catch (err: any) {
      notify(`Failed to retry: ${err.message}`);
    } finally {
      setIsRetryingId(null);
    }
  };

  const handleSimulateFailure = async (type: string) => {
    try {
      const sim = await api.simulateFailure(type, 'Discovery', `SIM-${Date.now()}`);
      if (sim) {
        notify(`Simulated ${type} failure injected (${sim.status})`);
        await loadReliabilityData();
      }
    } catch {
      notify('Simulation failed');
    }
  };

  return {
    reliabilityMetrics, setReliabilityMetrics, failedRuns, setFailedRuns, isRetryingId,
    setIsRetryingId, loadReliabilityData, handleRetryFailure, handleSimulateFailure,
  };
}

export type ReliabilityState = ReturnType<typeof useReliability>;
