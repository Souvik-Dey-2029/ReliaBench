import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Experiment, Agent, BenchmarkTask, FailureScenario } from '../services/types';
import { FlaskConical, Play, Plus, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [failures, setFailures] = useState<FailureScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    agent_id: '',
    benchmark_task_id: '',
    failure_scenario_id: '',
    repetitions_k: 3,
    timeout_seconds: 180
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [exps, ags, bms, fails] = await Promise.all([
        api.getExperiments(),
        api.getAgents(),
        api.getBenchmarks(),
        api.getFailures()
      ]);
      setExperiments(exps);
      setAgents(ags);
      setTasks(bms);
      setFailures(fails);

      if (ags.length > 0 && bms.length > 0) {
        setForm((prev) => ({
          ...prev,
          agent_id: prev.agent_id || ags[0].id,
          benchmark_task_id: prev.benchmark_task_id || bms[0].id
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createExperiment({
        ...form,
        failure_scenario_id: form.failure_scenario_id || undefined
      });
      // Automatically trigger execution
      await api.startExperiment(created.id);
      setShowModal(false);
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStart = async (id: string) => {
    await api.startExperiment(id);
    loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FlaskConical size={28} className="text-[#7048D9]" />
            <span>Benchmark Experiments & Runs</span>
          </h1>
          <p className="text-sm text-[#9BA6B8]">
            Configure repeatable multi-trial evaluations ($k$ repetitions) with controlled fault injection.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAll}
            className="neo-btn bg-[#1C212B] text-white hover:bg-[#252C39]"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="neo-btn bg-[#7048D9] text-white hover:bg-[#603cc2]"
          >
            <Plus size={16} />
            <span>New Experiment</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-[#D9FF47]">[ FETCHING BENCHMARK RUNS... ]</div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => {
            const latestRun = exp.runs && exp.runs.length > 0 ? exp.runs[exp.runs.length - 1] : null;

            return (
              <div key={exp.id} className="neo-box p-6">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-4 pb-4 border-b border-[#2B313E]">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-lg text-white">{exp.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#142B20] text-[#D9FF47] border border-[#234A35]">
                        {exp.status}
                      </span>
                      {exp.is_demo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-800">
                          DEMO SEEDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-[#9BA6B8] flex gap-4">
                      <span>Agent: <strong className="text-[#35D5E8]">{exp.agent?.name}</strong></span>
                      <span>Task: <strong className="text-white">{exp.benchmark_task?.name}</strong></span>
                      <span>
                        Fault: <strong className={exp.failure_scenario ? 'text-[#FF725E]' : 'text-slate-400'}>
                          {exp.failure_scenario?.name || 'Clean Run (No Fault)'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {exp.status !== 'RUNNING' && (
                      <button
                        onClick={() => handleStart(exp.id)}
                        className="neo-btn bg-[#D9FF47] text-black hover:bg-[#cbf536] text-xs py-1.5 px-3"
                      >
                        <Play size={14} />
                        <span>Re-Execute</span>
                      </button>
                    )}
                    {latestRun && (
                      <Link
                        to={`/traces?run_id=${latestRun.id}`}
                        className="neo-btn bg-[#35D5E8] text-black hover:bg-[#25c4d6] text-xs py-1.5 px-3"
                      >
                        Inspect ATIF Trace
                      </Link>
                    )}
                  </div>
                </div>

                {/* Scorecard Metrics Bar */}
                {latestRun ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                      <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                        <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Pass Rate</div>
                        <div className="text-xl font-black font-mono text-[#D9FF47]">
                          {(latestRun.pass_rate * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                        <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Pass@{exp.repetitions_k}</div>
                        <div className="text-xl font-black font-mono text-white">
                          {(latestRun.pass_at_k * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                        <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Pass^{exp.repetitions_k} (Strict)</div>
                        <div className="text-xl font-black font-mono text-white">
                          {(latestRun.pass_to_k * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                        <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Recovery Rate</div>
                        <div className="text-xl font-black font-mono text-[#35D5E8]">
                          {latestRun.recovery_rate !== null && latestRun.recovery_rate !== undefined ? `${(latestRun.recovery_rate * 100).toFixed(0)}%` : 'N/A'}
                        </div>
                      </div>

                      <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                        <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Mean Duration</div>
                        <div className="text-xl font-black font-mono text-white">
                          {latestRun.avg_duration_seconds}s
                        </div>
                      </div>

                      <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                        <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Duration Variance</div>
                        <div className="text-xl font-black font-mono text-slate-300">
                          {latestRun.duration_variance}s²
                        </div>
                      </div>
                    </div>

                    {/* Repeated Trials Breakdown */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-[#9BA6B8] font-mono">
                        Trials Iteration Breakdown (k = {exp.repetitions_k})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {latestRun.trials.map((trial) => (
                          <div
                            key={trial.id}
                            className={`p-3 rounded border text-xs font-mono flex items-center justify-between ${
                              trial.status === 'PASSED'
                                ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                                : trial.status === 'RECOVERED'
                                ? 'bg-cyan-950/20 border-cyan-800 text-cyan-300'
                                : 'bg-red-950/20 border-red-800 text-red-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {trial.status === 'PASSED' ? (
                                <CheckCircle2 size={16} />
                              ) : trial.status === 'RECOVERED' ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <XCircle size={16} />
                              )}
                              <span>Trial #{trial.trial_number}: <strong>{trial.status}</strong></span>
                            </div>
                            <span>{trial.duration_seconds}s</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[#9BA6B8]">
                    No execution trials recorded yet. Click Re-Execute to start evaluation.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Experiment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="neo-box bg-[#171A21] border-2 border-[#7048D9] p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-white mb-4">Configure Benchmark Experiment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Experiment Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded outline-none"
                  placeholder="e.g. Claude-Code: Stress Test with Tool Timeout"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Candidate Agent
                </label>
                <select
                  value={form.agent_id}
                  onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.framework} / {a.adapter_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Benchmark Task
                </label>
                <select
                  value={form.benchmark_task_id}
                  onChange={(e) => setForm({ ...form, benchmark_task_id: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} [{t.difficulty}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Controlled Failure Scenario (Optional)
                </label>
                <select
                  value={form.failure_scenario_id}
                  onChange={(e) => setForm({ ...form, failure_scenario_id: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                >
                  <option value="">None (Clean Baseline Execution)</option>
                  {failures.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code}) [{f.severity}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Repetitions (k)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.repetitions_k}
                    onChange={(e) => setForm({ ...form, repetitions_k: parseInt(e.target.value) || 3 })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  />
                  <span className="text-[10px] text-[#9BA6B8]">Evaluates Pass@k & Pass^k</span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Timeout (Seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={form.timeout_seconds}
                    onChange={(e) => setForm({ ...form, timeout_seconds: parseInt(e.target.value) || 180 })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2B313E]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#2B313E] text-sm text-[#9BA6B8] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn bg-[#7048D9] text-white hover:bg-[#603cc2]"
                >
                  Launch Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
