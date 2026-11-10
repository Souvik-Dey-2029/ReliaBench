import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Experiment } from '../services/types';
import { GitCompare, Trophy, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export const ComparisonsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExperiments()
      .then((exps) => {
        setExperiments(exps);
        // Pre-select first 2-3 experiments
        const initial = exps.slice(0, 3).map((e) => e.id);
        setSelectedIds(initial);
        if (initial.length > 0) {
          api.getComparisons(initial).then((res) => setComparisonResults(res.comparisons));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // Keep at least one
      next = selectedIds.filter((item) => item !== id);
    } else {
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    const res = await api.getComparisons(next);
    setComparisonResults(res.comparisons);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <GitCompare size={28} className="text-[#35D5E8]" />
          <span>Agent Comparison Matrix</span>
        </h1>
        <p className="text-sm text-[#9BA6B8]">
          Side-by-side reliability analysis under identical benchmark conditions, repeated trials, and injected faults.
        </p>
      </div>

      {/* Select Experiments Bar */}
      <div className="neo-box p-4">
        <div className="text-xs uppercase font-bold text-[#9BA6B8] mb-2 font-mono">
          Select Experiments to Compare ({selectedIds.length} Selected)
        </div>
        <div className="flex flex-wrap gap-2">
          {experiments.map((exp) => {
            const isSelected = selectedIds.includes(exp.id);
            return (
              <button
                key={exp.id}
                onClick={() => handleToggle(exp.id)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded border transition-all ${
                  isSelected
                    ? 'bg-[#35D5E8] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-[#111318] text-[#9BA6B8] border-[#2B313E] hover:border-slate-500'
                }`}
              >
                {exp.agent?.name} — {exp.title.slice(0, 30)}...
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {comparisonResults.length > 0 && (
        <div className="neo-box p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[#2B313E] text-xs font-mono text-[#9BA6B8] uppercase">
                <th className="py-3 px-4">Metric / Dimension</th>
                {comparisonResults.map((c, i) => (
                  <th key={i} className="py-3 px-4">
                    <div className="text-[#35D5E8] text-sm font-black">{c.agent_name}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{c.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313E] font-mono text-xs">
              {/* Task & Setup */}
              <tr>
                <td className="py-3 px-4 font-bold text-white">Benchmark Task</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 text-[#9BA6B8]">{c.task_name}</td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Fault Injected</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4">
                    <span className={c.failure_injected !== 'None (Clean)' ? 'text-[#FF725E] font-bold' : 'text-slate-400'}>
                      {c.failure_injected}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Repetitions (k)</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4">{c.repetitions_k}</td>
                ))}
              </tr>

              {/* Core Metrics */}
              <tr className="bg-[#171B24]">
                <td className="py-3 px-4 font-bold text-[#D9FF47]">Pass Rate (Overall)</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 font-black text-lg text-[#D9FF47]">
                    {(c.pass_rate * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Pass@k (At least 1 success)</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 font-bold text-white">
                    {(c.pass_at_k * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Pass^k (All k succeed)</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 font-bold text-white">
                    {(c.pass_to_k * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="bg-[#171B24]">
                <td className="py-3 px-4 font-bold text-[#35D5E8]">Fault Recovery Rate</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 font-bold text-[#35D5E8]">
                    {c.recovery_rate !== null ? `${(c.recovery_rate * 100).toFixed(1)}%` : 'N/A (Clean Run)'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Mean Duration</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4">{c.avg_duration_seconds}s</td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Duration Variance (s²)</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 text-slate-400">{c.duration_variance}</td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-white">Avg Cost per Run (USD)</td>
                {comparisonResults.map((c, i) => (
                  <td key={i} className="py-3 px-4 text-[#D9FF47]">
                    {c.avg_cost_usd ? `$${c.avg_cost_usd.toFixed(4)}` : 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

