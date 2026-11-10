import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardSummary } from '../services/types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Bot,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboardSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[#D9FF47]">
        [ LOADING RELIABENCH TELEMETRY ENGINE... ]
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="neo-box p-6 border-red-500 bg-red-950/20 text-red-300">
        <h3 className="font-bold text-lg mb-2">Failed to load platform summary</h3>
        <p className="text-sm font-mono">{error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="neo-box p-6 bg-gradient-to-r from-[#171A21] via-[#1B202A] to-[#171A21] border-l-8 border-l-[#427BFF] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#427BFF] text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
              AI BENCHMARKING PS02
            </span>
            <span className="text-xs font-mono text-[#9BA6B8]">
              Framework Independent · Repeated Trials · ATIF Evidence
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">
            "Same tasks. Same conditions. Measurable agent reliability."
          </h1>
          <p className="text-sm text-[#9BA6B8]">
            Benchmark autonomous agents beyond one-off lucky runs using controlled failure injection, Pass@k, and statistical recovery analysis.
          </p>
        </div>
        <Link
          to="/experiments"
          className="neo-btn bg-[#D9FF47] text-black hover:bg-[#cbf536] whitespace-nowrap"
        >
          <span>Run Experiment</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Rate */}
        <div className="neo-box p-5 border-t-4 border-t-[#D9FF47]">
          <div className="flex justify-between items-center text-[#9BA6B8] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Pass Rate</span>
            <CheckCircle2 size={18} className="text-[#D9FF47]" />
          </div>
          <div className="text-4xl font-black font-mono text-white">
            {(data.overall_pass_rate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-[#9BA6B8] mt-2 font-mono">
            Across {data.total_experiments} completed experiments
          </div>
        </div>

        {/* Avg Duration */}
        <div className="neo-box p-5 border-t-4 border-t-[#35D5E8]">
          <div className="flex justify-between items-center text-[#9BA6B8] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mean Execution Time</span>
            <Clock size={18} className="text-[#35D5E8]" />
          </div>
          <div className="text-4xl font-black font-mono text-white">
            {data.average_duration_seconds}s
          </div>
          <div className="text-xs text-[#9BA6B8] mt-2 font-mono">
            Wall-clock task completion
          </div>
        </div>

        {/* Registered Agents */}
        <div className="neo-box p-5 border-t-4 border-t-[#7048D9]">
          <div className="flex justify-between items-center text-[#9BA6B8] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Agents</span>
            <Bot size={18} className="text-[#7048D9]" />
          </div>
          <div className="text-4xl font-black font-mono text-white">
            {data.total_agents}
          </div>
          <div className="text-xs text-[#9BA6B8] mt-2 font-mono">
            Custom, Harbor & Autogen adapters
          </div>
        </div>

        {/* Benchmark Tasks */}
        <div className="neo-box p-5 border-t-4 border-t-[#FF725E]">
          <div className="flex justify-between items-center text-[#9BA6B8] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Benchmark Tasks</span>
            <Layers size={18} className="text-[#FF725E]" />
          </div>
          <div className="text-4xl font-black font-mono text-white">
            {data.total_benchmarks}
          </div>
          <div className="text-xs text-[#9BA6B8] mt-2 font-mono">
            Multi-turn challenges with verifiers
          </div>
        </div>
      </div>

      {/* Analytical Charts and Category Reliability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 neo-box p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-[#427BFF]" />
                <span>Reliability & Recovery Rate by Category</span>
              </h2>
              <p className="text-xs text-[#9BA6B8]">
                Comparing baseline task pass rate vs. recovery after controlled failure injection
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.reliability_distribution}>
                <XAxis dataKey="category" stroke="#9BA6B8" fontSize={12} />
                <YAxis stroke="#9BA6B8" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171A21', borderColor: '#2B313E', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="pass_rate" name="Pass Rate" fill="#427BFF" radius={[2, 2, 0, 0]} />
                <Bar dataKey="recovery_rate" name="Recovery Rate (Post-Failure)" fill="#D9FF47" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Injected Failures / Incidents */}
        <div className="neo-box p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-[#FF725E]" />
              <span>Failure Activity</span>
            </h2>
            <p className="text-xs text-[#9BA6B8] mb-4">
              Real-time failure injection trials and unhandled crash incidents
            </p>

            <div className="space-y-3">
              {data.recent_failures.length === 0 ? (
                <div className="text-xs text-[#9BA6B8] font-mono">No active failure events detected.</div>
              ) : (
                data.recent_failures.map((f, i) => (
                  <div key={i} className="p-3 bg-[#111318] border border-[#2B313E] rounded">
                    <div className="flex justify-between items-center text-xs font-bold text-[#FF725E]">
                      <span>{f.agent_name}</span>
                      <span className="font-mono text-[10px] text-[#9BA6B8]">
                        {new Date(f.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium mt-1 truncate">
                      {f.experiment_title}
                    </div>
                    <div className="text-[11px] text-[#9BA6B8] font-mono mt-1">
                      {f.error_message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link
            to="/traces"
            className="text-xs font-bold text-[#35D5E8] flex items-center gap-1 mt-4 hover:underline"
          >
            <span>Inspect trace timeline</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Experiments Table */}
      <div className="neo-box p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Benchmark Experiments</h2>
            <p className="text-xs text-[#9BA6B8]">Evaluated under repeated execution constraints</p>
          </div>
          <Link to="/experiments" className="text-xs font-bold text-[#427BFF] hover:underline">
            View All Experiments
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[#2B313E] text-[#9BA6B8] font-mono text-xs uppercase">
                <th className="py-3 px-4">Experiment Title</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Benchmark Task</th>
                <th className="py-3 px-4">Repetitions (k)</th>
                <th className="py-3 px-4">Pass Rate</th>
                <th className="py-3 px-4">Pass@k</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313E] font-mono text-xs">
              {data.recent_experiments.map((exp) => {
                const latestRun = exp.runs && exp.runs.length > 0 ? exp.runs[exp.runs.length - 1] : null;
                return (
                  <tr key={exp.id} className="hover:bg-[#1A1F29] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{exp.title}</td>
                    <td className="py-3 px-4 text-[#35D5E8]">{exp.agent?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-[#9BA6B8] truncate max-w-xs">{exp.benchmark_task?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{exp.repetitions_k}</td>
                    <td className="py-3 px-4">
                      {latestRun ? (
                        <span className="font-bold text-[#D9FF47]">
                          {(latestRun.pass_rate * 100).toFixed(0)}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {latestRun ? `${(latestRun.pass_at_k * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142B20] text-[#D9FF47] border border-[#234A35]">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

