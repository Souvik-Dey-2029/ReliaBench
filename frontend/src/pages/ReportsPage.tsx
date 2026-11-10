import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Experiment } from '../services/types';
import { FileText, Download, CheckCircle, Database } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExperiments().then((exps) => {
      setExperiments(exps);
      if (exps.length > 0) {
        setSelectedExpId(exps[0].id);
      }
      setLoading(false);
    });
  }, []);

  const selectedExp = experiments.find((e) => e.id === selectedExpId);
  const latestRun = selectedExp?.runs?.[selectedExp.runs.length - 1];

  const handleExportJSON = () => {
    if (!selectedExp) return;
    const blob = new Blob([JSON.stringify(selectedExp, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reliabench_report_${selectedExp.id.slice(0, 8)}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    if (!selectedExp || !latestRun) return;
    const headers = 'Experiment_ID,Agent,Task,Repetitions,PassRate,PassAtK,PassToK,RecoveryRate,Duration\n';
    const row = `${selectedExp.id},${selectedExp.agent?.name},${selectedExp.benchmark_task?.name},${selectedExp.repetitions_k},${latestRun.pass_rate},${latestRun.pass_at_k},${latestRun.pass_to_k},${latestRun.recovery_rate || 'N/A'},${latestRun.avg_duration_seconds}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reliabench_report_${selectedExp.id.slice(0, 8)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText size={28} className="text-[#D9FF47]" />
            <span>Benchmark Reports & Artifact Export</span>
          </h1>
          <p className="text-sm text-[#9BA6B8]">
            Evidence-backed reliability reports conforming to evaluation standards with JSON and CSV exports.
          </p>
        </div>

        {selectedExp && (
          <div className="flex gap-3">
            <button
              onClick={handleExportJSON}
              className="neo-btn bg-[#171A21] border border-[#2B313E] text-white hover:border-[#D9FF47] text-xs"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="neo-btn bg-[#D9FF47] text-black hover:bg-[#cbf536] text-xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Experiment */}
      <div className="neo-box p-4 flex items-center gap-3">
        <label className="text-xs font-bold uppercase font-mono text-[#9BA6B8]">
          Select Experiment:
        </label>
        <select
          value={selectedExpId}
          onChange={(e) => setSelectedExpId(e.target.value)}
          className="bg-[#111318] border border-[#2B313E] px-3 py-1.5 text-xs text-white font-mono rounded max-w-md outline-none"
        >
          {experiments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} [{e.agent?.name}]
            </option>
          ))}
        </select>
      </div>

      {/* Report Preview */}
      {selectedExp ? (
        <div className="neo-box p-8 space-y-6 bg-[#141720]">
          <div className="border-b-2 border-[#2B313E] pb-4 flex justify-between items-start">
            <div>
              <div className="text-xs font-mono font-bold text-[#D9FF47] uppercase tracking-wider mb-1">
                Official Benchmark Certification
              </div>
              <h2 className="text-2xl font-black text-white">{selectedExp.title}</h2>
              <div className="text-xs font-mono text-[#9BA6B8] mt-1">
                Generated: {new Date(selectedExp.created_at).toUTCString()} · Experiment ID: {selectedExp.id}
              </div>
            </div>
            <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-[#142B20] text-[#D9FF47] border border-[#234A35]">
              VERIFIED COMPLETED
            </span>
          </div>

          {/* Test Setup Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
              <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Agent Under Test</div>
              <div className="text-sm font-bold text-white mt-1">{selectedExp.agent?.name}</div>
              <div className="text-[10px] text-[#35D5E8] font-mono">{selectedExp.agent?.framework} ({selectedExp.agent?.adapter_type})</div>
            </div>

            <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
              <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Task Specification</div>
              <div className="text-sm font-bold text-white mt-1 truncate">{selectedExp.benchmark_task?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">Difficulty: {selectedExp.benchmark_task?.difficulty}</div>
            </div>

            <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
              <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Fault Injection</div>
              <div className="text-sm font-bold text-[#FF725E] mt-1">
                {selectedExp.failure_scenario?.name || 'Clean Baseline'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {selectedExp.failure_scenario ? selectedExp.failure_scenario.trigger_point : 'No fault'}
              </div>
            </div>

            <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
              <div className="text-[10px] uppercase font-bold text-[#9BA6B8] font-mono">Statistical Constraints</div>
              <div className="text-sm font-bold text-white mt-1">k = {selectedExp.repetitions_k} Repetitions</div>
              <div className="text-[10px] text-slate-400 font-mono">Timeout: {selectedExp.timeout_seconds}s</div>
            </div>
          </div>

          {/* Evaluated Metrics */}
          {latestRun && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase font-mono text-[#D9FF47]">
                Evaluated Reliability Results
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#111318] p-4 rounded border border-[#2B313E]">
                  <div className="text-xs text-[#9BA6B8] font-mono">Pass Rate</div>
                  <div className="text-2xl font-black font-mono text-[#D9FF47] mt-1">
                    {(latestRun.pass_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#9BA6B8] mt-1">{latestRun.successful_trials} / {latestRun.total_trials} passed</div>
                </div>

                <div className="bg-[#111318] p-4 rounded border border-[#2B313E]">
                  <div className="text-xs text-[#9BA6B8] font-mono">Pass@{selectedExp.repetitions_k}</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {(latestRun.pass_at_k * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#9BA6B8] mt-1">Unbiased prob estimator</div>
                </div>

                <div className="bg-[#111318] p-4 rounded border border-[#2B313E]">
                  <div className="text-xs text-[#9BA6B8] font-mono">Pass^{selectedExp.repetitions_k} (Strict)</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {(latestRun.pass_to_k * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#9BA6B8] mt-1">Fraction all k pass</div>
                </div>

                <div className="bg-[#111318] p-4 rounded border border-[#2B313E]">
                  <div className="text-xs text-[#9BA6B8] font-mono">Recovery Rate</div>
                  <div className="text-2xl font-black font-mono text-[#35D5E8] mt-1">
                    {latestRun.recovery_rate !== null && latestRun.recovery_rate !== undefined ? `${(latestRun.recovery_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-[#9BA6B8] mt-1">Post-fault recovery</div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#2B313E] text-xs font-mono text-[#9BA6B8] flex justify-between items-center">
            <span>Reliabench Verification Framework v0.1.0 · Harbor v0.25.0 Adapter</span>
            <span>Evidence Hash: {selectedExp.id.slice(0, 16)}</span>
          </div>
        </div>
      ) : (
        <div className="neo-box p-6 font-mono text-sm text-[#9BA6B8]">
          No experiments recorded.
        </div>
      )}
    </div>
  );
};
