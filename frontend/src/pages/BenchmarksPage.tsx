import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BenchmarkTask } from '../services/types';
import { Layers, Plus, Clock, ShieldCheck, FileCode } from 'lucide-react';

export const BenchmarksPage: React.FC = () => {
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Security & Web',
    difficulty: 'MEDIUM' as const,
    description: '',
    instruction: '',
    expected_outcome: '',
    verification_method: 'ASSERTION_SCRIPT',
    time_limit_seconds: 120
  });

  const loadTasks = () => {
    setLoading(true);
    api.getBenchmarks()
      .then(setTasks)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBenchmark(form);
      setShowModal(false);
      setForm({
        name: '',
        category: 'Security & Web',
        difficulty: 'MEDIUM',
        description: '',
        instruction: '',
        expected_outcome: '',
        verification_method: 'ASSERTION_SCRIPT',
        time_limit_seconds: 120
      });
      loadTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers size={28} className="text-[#FF725E]" />
            <span>Benchmark Task Library</span>
          </h1>
          <p className="text-sm text-[#9BA6B8]">
            Standardized multi-turn evaluation tasks inspired by AgentClash challenge packs and Harbor specifications.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="neo-btn bg-[#FF725E] text-black hover:bg-[#ff5d47]"
        >
          <Plus size={16} />
          <span>New Benchmark Task</span>
        </button>
      </div>

      {loading ? (
        <div className="font-mono text-[#D9FF47]">[ LOADING BENCHMARK TASKS... ]</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="neo-box p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono font-bold text-[#427BFF] uppercase tracking-wider">
                    {task.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      task.difficulty === 'HARD'
                        ? 'bg-red-950/40 text-[#FF725E] border-red-800'
                        : task.difficulty === 'MEDIUM'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-800'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {task.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-white mb-2">{task.name}</h3>
                <p className="text-xs text-[#9BA6B8] mb-4">{task.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                    <div className="text-[10px] uppercase font-bold text-[#35D5E8] mb-1 font-mono">
                      Agent Instruction
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      {task.instruction}
                    </div>
                  </div>

                  <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                    <div className="text-[10px] uppercase font-bold text-[#D9FF47] mb-1 font-mono">
                      Expected Outcome & Verifier
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      {task.expected_outcome}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#2B313E] text-xs font-mono text-[#9BA6B8]">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-[#35D5E8]" />
                  <span>{task.time_limit_seconds}s timeout</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#D9FF47]" />
                  <span>{task.verification_method}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Benchmark Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="neo-box bg-[#171A21] border-2 border-[#FF725E] p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Benchmark Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded outline-none"
                  placeholder="e.g. BugFix: Memory Leak in Async Worker"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded h-16 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Task Instruction (Prompt given to Agent)
                </label>
                <textarea
                  required
                  value={form.instruction}
                  onChange={(e) => setForm({ ...form, instruction: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded h-20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Expected Outcome & Verification Assertions
                </label>
                <input
                  type="text"
                  required
                  value={form.expected_outcome}
                  onChange={(e) => setForm({ ...form, expected_outcome: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                />
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
                  className="neo-btn bg-[#FF725E] text-black hover:bg-[#ff5d47]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

