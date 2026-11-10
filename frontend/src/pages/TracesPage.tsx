import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Experiment, ATIFTrajectory } from '../services/types';
import { Activity, Terminal, ArrowDown, ChevronRight, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export const TracesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const runIdParam = searchParams.get('run_id');

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(runIdParam);
  const [trajectory, setTrajectory] = useState<ATIFTrajectory | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExperiments().then((exps) => {
      setExperiments(exps);
      const firstValidRun = exps.flatMap((e) => e.runs)[0];
      const targetRunId = runIdParam || (firstValidRun ? firstValidRun.id : null);
      if (targetRunId) {
        setSelectedRunId(targetRunId);
        loadTrajectory(targetRunId);
      } else {
        setLoading(false);
      }
    });
  }, [runIdParam]);

  const loadTrajectory = async (runId: string) => {
    setLoading(true);
    try {
      const traj = await api.getRunTrajectory(runId);
      setTrajectory(traj);
      setSelectedStepIndex(0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId);
    loadTrajectory(runId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Activity size={28} className="text-[#35D5E8]" />
          <span>Execution Trace Inspector (ATIF v1.8)</span>
        </h1>
        <p className="text-sm text-[#9BA6B8]">
          Inspect recorded-run evidence conforming to Harbor's Agent Trajectory Interchange Format (ATIF).
        </p>
      </div>

      {/* Select Run */}
      <div className="neo-box p-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono font-bold text-[#9BA6B8] uppercase mr-2">
          Select Run:
        </span>
        {experiments.flatMap((e) =>
          e.runs.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectRun(r.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded border transition-all ${
                selectedRunId === r.id
                  ? 'bg-[#35D5E8] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-[#111318] text-[#9BA6B8] border-[#2B313E] hover:border-slate-500'
              }`}
            >
              {e.agent?.name} ({r.pass_rate === 1.0 ? 'PASSED' : 'RECOVERED/FAILED'}) — Run {r.id.slice(0, 8)}
            </button>
          ))
        )}
      </div>

      {loading ? (
        <div className="font-mono text-[#D9FF47]">[ PARSING ATIF TRAJECTORY ARTIFACTS... ]</div>
      ) : trajectory ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Timeline / Waterfall List */}
          <div className="neo-box p-4 space-y-2 max-h-[700px] overflow-y-auto">
            <div className="text-xs font-bold uppercase text-[#9BA6B8] font-mono mb-3">
              Trajectory Sequence ({trajectory.steps.length} Steps)
            </div>

            {trajectory.steps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const isError = step.observation?.results?.some((r) => r.is_error);

              return (
                <div
                  key={step.step_id}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3 rounded border cursor-pointer font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-[#1B2230] border-[#35D5E8] shadow-[3px_3px_0px_0px_#35D5E8]'
                      : 'bg-[#111318] border-[#2B313E] hover:border-slate-500 text-[#9BA6B8]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>Step #{step.step_id}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                          step.source === 'user'
                            ? 'bg-[#7048D9] text-white'
                            : step.source === 'agent'
                            ? 'bg-[#427BFF] text-white'
                            : 'bg-[#142B20] text-[#D9FF47]'
                        }`}
                      >
                        {step.source}
                      </span>
                    </span>
                    {isError && (
                      <span className="text-[10px] text-[#FF725E] font-bold">ERROR</span>
                    )}
                  </div>

                  <div className="truncate text-slate-300 text-[11px]">
                    {step.message || (step.tool_calls ? `Tool: ${step.tool_calls[0].function_name}` : 'Observation result')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Payload Inspector */}
          <div className="lg:col-span-2 neo-box p-6 space-y-4">
            {trajectory.steps[selectedStepIndex] ? (
              (() => {
                const s = trajectory.steps[selectedStepIndex];
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-4 border-b border-[#2B313E]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-xl text-white">Step #{s.step_id}</h3>
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-[#427BFF] text-white">
                            Source: {s.source}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#9BA6B8] mt-1">
                          Timestamp: {new Date(s.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {s.metrics && (
                        <div className="text-right text-xs font-mono">
                          <div className="text-[#D9FF47] font-bold">
                            Tokens: {s.metrics.prompt_tokens + s.metrics.completion_tokens}
                          </div>
                          <div className="text-[#9BA6B8]">
                            Cost: ${s.metrics.cost.toFixed(4)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Agent Message / Plan */}
                    {s.message && (
                      <div className="space-y-1">
                        <div className="text-xs uppercase font-bold text-[#427BFF] font-mono">Message</div>
                        <div className="bg-[#111318] p-3 rounded border border-[#2B313E] text-xs font-mono text-white">
                          {s.message}
                        </div>
                      </div>
                    )}

                    {/* Reasoning Content */}
                    {s.reasoning_content && (
                      <div className="space-y-1">
                        <div className="text-xs uppercase font-bold text-[#7048D9] font-mono">Reasoning (Thinking)</div>
                        <div className="bg-[#111318] p-3 rounded border border-[#2B313E] text-xs font-mono text-slate-300">
                          {s.reasoning_content}
                        </div>
                      </div>
                    )}

                    {/* Outbound Tool Calls */}
                    {s.tool_calls && s.tool_calls.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase font-bold text-[#35D5E8] font-mono">Tool Invocations</div>
                        {s.tool_calls.map((tc, idx) => (
                          <div key={idx} className="bg-[#111318] p-3 rounded border border-[#2B313E] space-y-2">
                            <div className="text-xs font-mono font-bold text-white flex justify-between">
                              <span>Function: {tc.function_name}</span>
                              <span className="text-[#9BA6B8] text-[10px]">ID: {tc.tool_call_id}</span>
                            </div>
                            <pre className="text-[11px] font-mono text-[#35D5E8] bg-black/40 p-2 rounded overflow-x-auto">
                              {JSON.stringify(tc.arguments, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Environment Observation */}
                    {s.observation && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase font-bold text-[#D9FF47] font-mono">Environment Observation</div>
                        {s.observation.results.map((r, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded border text-xs font-mono space-y-1 ${
                              r.is_error
                                ? 'bg-red-950/20 border-red-800 text-red-300'
                                : 'bg-[#111318] border-[#2B313E] text-white'
                            }`}
                          >
                            <div className="flex justify-between text-[10px] text-[#9BA6B8]">
                              <span>Result for {r.tool_call_id}</span>
                              <span className={r.is_error ? 'text-[#FF725E] font-bold' : 'text-[#D9FF47]'}>
                                {r.is_error ? 'ERROR' : 'SUCCESS'}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap">{r.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Raw ATIF JSON Payload */}
                    <div className="pt-4 border-t border-[#2B313E]">
                      <details className="text-xs font-mono text-[#9BA6B8] cursor-pointer">
                        <summary className="font-bold hover:text-white">View Full Step ATIF JSON</summary>
                        <pre className="mt-2 p-3 bg-black/60 rounded border border-[#2B313E] text-[10px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(s, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>
      ) : (
        <div className="neo-box p-6 font-mono text-sm text-[#9BA6B8]">
          No recorded trajectory found. Execute a benchmark experiment to inspect ATIF execution traces.
        </div>
      )}
    </div>
  );
};

