import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BenchmarkTask } from '../services/types';
import { Layers, Plus, Clock, ShieldCheck, FileCode, CheckCircle2 } from 'lucide-react';

export const BenchmarksPage: React.FC = () => {
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    version: '1.0.0',
    category: 'Security & Web',
    difficulty: 'MEDIUM' as const,
    description: '',
    instruction: '',
    expected_outcome: '',
    verification_method: 'ASSERTION_SCRIPT' as const,
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
        version: '1.0.0',
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center pb-6 border-b border-[#2D332B]">
        <div>
          <h1 className="text-2xl font-black text-[#E8DDC8] flex items-center gap-2">
            <Layers size={26} className="text-[#C49A55]" />
            <span>Benchmark Task Library</span>
          </h1>
          <p className="text-xs text-[#A7A393] font-sans mt-0.5">
            Standardized multi-turn evaluation tasks inspired by AgentClash challenge packs and Harbor specifications.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="reliabench-btn reliabench-btn-lime"
        >
          <Plus size={15} />
          <span>New Challenge Task</span>
        </button>
      </div>

      {loading ? (
        <div className="font-mono text-xs text-[#C7D94C]">[ LOADING BENCHMARK TASKS... ]</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="reliabench-panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#C7D94C] uppercase tracking-wider">
                    {task.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#89977A]">v{task.version}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        task.difficulty === 'HARD'
                          ? 'bg-[#2B1D1D] text-[#FF725E] border-[#5E2A2A]'
                          : task.difficulty === 'MEDIUM'
                          ? 'bg-[#292A1A] text-[#C49A55] border-[#5E5A2A]'
                          : 'bg-[#1D2B1C] text-[#C7D94C] border-[#3B5436]'
                      }`}
                    >
                      {task.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#E8DDC8] mb-2">{task.name}</h3>
                <p className="text-xs text-[#A7A393] mb-4 font-sans">{task.description}</p>

                <div className="space-y-2 mb-4 font-mono">
                  <div className="bg-[#141713] p-3 rounded border border-[#2D332B]">
                    <div className="text-[10px] uppercase font-bold text-[#F06B45] mb-1">
                      Task Prompt Delivered to Agent
                    </div>
                    <div className="text-xs text-[#E8DDC8]">
                      {task.instruction}
                    </div>
                  </div>

                  <div className="bg-[#141713] p-3 rounded border border-[#2D332B]">
                    <div className="text-[10px] uppercase font-bold text-[#C7D94C] mb-1">
                      Verification Assertion & Target Reward
                    </div>
                    <div className="text-xs text-[#E8DDC8]">
                      {task.expected_outcome}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#2D332B] text-xs font-mono text-[#89977A]">
                <div className="flex items-center gap-1">
                  <Clock size={13} className="text-[#F06B45]" />
                  <span>{task.time_limit_seconds}s timeout</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#C7D94C]" />
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
          <div className="reliabench-panel bg-[#1D211C] border border-[#C49A55] p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold text-[#E8DDC8] mb-4 font-mono">Create Benchmark Challenge Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#A7A393] mb-1 font-mono">
                  Task Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#141713] border border-[#2D332B] px-3 py-2 text-[#E8DDC8] font-mono text-xs rounded outline-none"
                  placeholder="e.g. BugFix: Memory Leak in Async Worker"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#A7A393] mb-1 font-mono">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#141713] border border-[#2D332B] px-3 py-2 text-[#E8DDC8] font-mono text-xs rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#A7A393] mb-1 font-mono">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                    className="w-full bg-[#141713] border border-[#2D332B] px-3 py-2 text-[#E8DDC8] font-mono text-xs rounded"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#A7A393] mb-1 font-mono">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#141713] border border-[#2D332B] px-3 py-2 text-[#E8DDC8] font-mono text-xs rounded h-16 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#A7A393] mb-1 font-mono">
                  Task Instruction (Prompt given to Agent)
                </label>
                <textarea
                  required
                  value={form.instruction}
                  onChange={(e) => setForm({ ...form, instruction: e.target.value })}
                  className="w-full bg-[#141713] border border-[#2D332B] px-3 py-2 text-[#E8DDC8] font-mono text-xs rounded h-20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#A7A393] mb-1 font-mono">
                  Expected Outcome & Verification Assertions
                </label>
                <input
                  type="text"
                  required
                  value={form.expected_outcome}
                  onChange={(e) => setForm({ ...form, expected_outcome: e.target.value })}
                  className="w-full bg-[#141713] border border-[#2D332B] px-3 py-2 text-[#E8DDC8] font-mono text-xs rounded"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2D332B]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#2D332B] text-xs text-[#A7A393] font-bold uppercase font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="reliabench-btn reliabench-btn-lime"
                >
                  Save Challenge Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
