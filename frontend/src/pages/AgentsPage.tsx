import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Agent } from '../services/types';
import { Bot, Plus, Trash2, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    framework: 'custom',
    version: '1.0.0',
    adapter_type: 'simulator',
    model_provider: 'anthropic',
    model_name: 'claude-3-7-sonnet'
  });

  const loadAgents = () => {
    setLoading(true);
    api.getAgents()
      .then(setAgents)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAgent(form);
      setShowModal(false);
      setForm({
        name: '',
        description: '',
        framework: 'custom',
        version: '1.0.0',
        adapter_type: 'simulator',
        model_provider: 'anthropic',
        model_name: 'claude-3-7-sonnet'
      });
      loadAgents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this agent definition?')) {
      await api.deleteAgent(id);
      loadAgents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bot size={28} className="text-[#427BFF]" />
            <span>Agent Registry</span>
          </h1>
          <p className="text-sm text-[#9BA6B8]">
            Manage registered candidate agents, framework adapters, and underlying models.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="neo-btn bg-[#427BFF] text-white hover:bg-[#3269e6]"
        >
          <Plus size={16} />
          <span>Register Agent</span>
        </button>
      </div>

      {loading ? (
        <div className="font-mono text-[#D9FF47]">[ QUERYING AGENT REGISTRY... ]</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="neo-box p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white">{agent.name}</h3>
                    <div className="text-xs font-mono text-[#35D5E8]">v{agent.version}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#142B20] text-[#D9FF47] border border-[#234A35]">
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-[#9BA6B8] mb-4 min-h-[3rem]">
                  {agent.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs font-mono bg-[#111318] p-3 rounded border border-[#2B313E] mb-4">
                  <div className="flex justify-between text-[#9BA6B8]">
                    <span>Framework:</span>
                    <span className="text-white font-bold">{agent.framework}</span>
                  </div>
                  <div className="flex justify-between text-[#9BA6B8]">
                    <span>Adapter:</span>
                    <span className="text-[#35D5E8]">{agent.adapter_type}</span>
                  </div>
                  <div className="flex justify-between text-[#9BA6B8]">
                    <span>Model:</span>
                    <span className="text-[#D9FF47]">{agent.model_name || 'N/A'}</span>
                  </div>
                  {agent.is_demo && (
                    <div className="mt-1 pt-1 border-t border-[#2B313E] text-[10px] text-[#FF725E] font-bold">
                      * SYNTHETIC BENCHMARK AGENT
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#2B313E]">
                <span className="text-[10px] text-[#9BA6B8] font-mono">
                  {new Date(agent.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="text-xs text-[#FF725E] hover:text-red-400 font-mono flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="neo-box bg-[#171A21] border-2 border-[#427BFF] p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Register New Agent</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded focus:border-[#427BFF] outline-none"
                  placeholder="e.g. MySoftwareAgent-v1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded focus:border-[#427BFF] outline-none h-20"
                  placeholder="Agent responsibilities and tools..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Framework
                  </label>
                  <select
                    value={form.framework}
                    onChange={(e) => setForm({ ...form, framework: e.target.value })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  >
                    <option value="custom">Custom</option>
                    <option value="harbor_native">Harbor Native</option>
                    <option value="autogen">AutoGen</option>
                    <option value="crewai">CrewAI</option>
                    <option value="langchain">LangChain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Adapter Type
                  </label>
                  <select
                    value={form.adapter_type}
                    onChange={(e) => setForm({ ...form, adapter_type: e.target.value })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  >
                    <option value="simulator">Simulator (Deterministic)</option>
                    <option value="harbor_cli">Harbor CLI (v0.25.0)</option>
                    <option value="rest_api">Custom REST API</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Model Provider
                  </label>
                  <input
                    type="text"
                    value={form.model_provider}
                    onChange={(e) => setForm({ ...form, model_provider: e.target.value })}
                    className="w-full bg-[#111318] border border-[#2B313E] px-3 py-2 text-white font-mono text-sm rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#9BA6B8] mb-1">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={form.model_name}
                    onChange={(e) => setForm({ ...form, model_name: e.target.value })}
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
                  className="neo-btn bg-[#427BFF] text-white hover:bg-[#3269e6]"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

