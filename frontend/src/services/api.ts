import {
  DashboardSummary,
  Agent,
  BenchmarkTask,
  FailureScenario,
  Experiment,
  Run,
  ATIFTrajectory
} from './types';

const API_BASE = '/api/v1';

export const api = {
  // System
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  // Agents
  async getAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_BASE}/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create agent');
    return res.json();
  },

  async deleteAgent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/agents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete agent');
  },

  // Benchmarks
  async getBenchmarks(): Promise<BenchmarkTask[]> {
    const res = await fetch(`${API_BASE}/benchmarks`);
    if (!res.ok) throw new Error('Failed to fetch benchmark tasks');
    return res.json();
  },

  async createBenchmark(data: Partial<BenchmarkTask>): Promise<BenchmarkTask> {
    const res = await fetch(`${API_BASE}/benchmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create benchmark');
    return res.json();
  },

  // Failures
  async getFailures(): Promise<FailureScenario[]> {
    const res = await fetch(`${API_BASE}/failures`);
    if (!res.ok) throw new Error('Failed to fetch failure scenarios');
    return res.json();
  },

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    const res = await fetch(`${API_BASE}/experiments`);
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  async getExperiment(id: string): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch experiment details');
    return res.json();
  },

  async createExperiment(data: {
    title: string;
    agent_id: string;
    benchmark_task_id: string;
    failure_scenario_id?: string;
    repetitions_k: number;
    timeout_seconds: number;
  }): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to configure experiment');
    return res.json();
  },

  async startExperiment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/experiments/${id}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start experiment');
  },

  // Runs & ATIF Trajectories
  async getRun(id: string): Promise<Run> {
    const res = await fetch(`${API_BASE}/runs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch run');
    return res.json();
  },

  async getRunTrajectory(id: string): Promise<ATIFTrajectory> {
    const res = await fetch(`${API_BASE}/runs/${id}/trajectory`);
    if (!res.ok) throw new Error('Failed to fetch ATIF trajectory');
    return res.json();
  },

  // Comparisons
  async getComparisons(experimentIds: string[]): Promise<any> {
    const res = await fetch(`${API_BASE}/comparisons?experiment_ids=${experimentIds.join(',')}`);
    if (!res.ok) throw new Error('Failed to fetch comparisons');
    return res.json();
  }
};

