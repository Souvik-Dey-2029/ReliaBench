import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Settings as SettingsIcon, ShieldCheck, Terminal, Cpu, Database, CheckCircle2, XCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <SettingsIcon size={28} className="text-[#9BA6B8]" />
          <span>System Diagnostics & Adapters</span>
        </h1>
        <p className="text-sm text-[#9BA6B8]">
          Operational readiness and integration status of execution sandboxes, model gateways, and storage.
        </p>
      </div>

      {loading ? (
        <div className="font-mono text-[#D9FF47]">[ QUERYING SYSTEM INTEGRATIONS... ]</div>
      ) : health ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Harbor Adapter */}
          <div className="neo-box p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#2B313E]">
              <div className="flex items-center gap-2">
                <Terminal size={20} className="text-[#D9FF47]" />
                <h3 className="font-bold text-white text-lg">Harbor Execution Engine</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  health.adapters.harbor.available
                    ? 'bg-[#142B20] text-[#D9FF47] border border-[#234A35]'
                    : 'bg-amber-950/40 text-amber-400 border border-amber-800'
                }`}
              >
                {health.adapters.harbor.mode}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-[#2B313E]/40 text-[#9BA6B8]">
                <span>Required Version:</span>
                <span className="text-white font-bold">{health.adapters.harbor.required_version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#2B313E]/40 text-[#9BA6B8]">
                <span>CLI Installed:</span>
                <span className={health.adapters.harbor.available ? 'text-[#D9FF47]' : 'text-[#FF725E]'}>
                  {health.adapters.harbor.available ? 'YES' : 'NO (Using Simulator Runner)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#2B313E]/40 text-[#9BA6B8]">
                <span>Docker Sandbox Daemon:</span>
                <span className={health.adapters.harbor.docker_available ? 'text-[#D9FF47]' : 'text-amber-400'}>
                  {health.adapters.harbor.docker_available ? 'AVAILABLE' : 'OFFLINE (Safe Host Mode)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-[#9BA6B8]">
                <span>Trajectory Format:</span>
                <span className="text-[#35D5E8]">ATIF-v1.8 Compatible</span>
              </div>
            </div>

            <p className="text-[11px] text-[#9BA6B8]">
              When Harbor CLI and Docker are active, trials run in isolated containers. Otherwise, Reliabench transparently switches to the deterministic Simulator Adapter to protect the host OS while maintaining full ATIF data fidelity.
            </p>
          </div>

          {/* Model Gateway (Bifrost) */}
          <div className="neo-box p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#2B313E]">
              <div className="flex items-center gap-2">
                <Cpu size={20} className="text-[#427BFF]" />
                <h3 className="font-bold text-white text-lg">Bifrost Model Gateway</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1B202A] text-slate-400 border border-[#2B313E]">
                {health.adapters.bifrost.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-[#2B313E]/40 text-[#9BA6B8]">
                <span>Gateway Status:</span>
                <span className="text-slate-400">{health.adapters.bifrost.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#2B313E]/40 text-[#9BA6B8]">
                <span>Target Endpoint:</span>
                <span className="text-white">{health.adapters.bifrost.endpoint}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[#9BA6B8]">
                <span>Telemetry Accounting:</span>
                <span className="text-[#35D5E8]">Token / Latency Tracking</span>
              </div>
            </div>

            <p className="text-[11px] text-[#9BA6B8]">
              Bifrost provides unified OpenAI-compatible routing and microsecond-level request accounting. It is optional for the initial milestone and can be enabled via <code className="text-[#35D5E8]">ENABLE_BIFROST_GATEWAY=true</code>.
            </p>
          </div>

          {/* Storage & Database Diagnostics */}
          <div className="neo-box p-6 space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2B313E]">
              <Database size={20} className="text-[#7048D9]" />
              <h3 className="font-bold text-white text-lg">Storage & Relational Database</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                <div className="text-[#9BA6B8]">Relational DB</div>
                <div className="text-white font-bold mt-1">SQLite 3 (PostgreSQL-Ready)</div>
                <div className="text-[10px] text-[#D9FF47] mt-1">Connected & Migrated</div>
              </div>

              <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                <div className="text-[#9BA6B8]">ATIF Trajectories</div>
                <div className="text-white font-bold mt-1">artifacts/trajectories/</div>
                <div className="text-[10px] text-[#35D5E8] mt-1">Local Filesystem Storage</div>
              </div>

              <div className="bg-[#111318] p-3 rounded border border-[#2B313E]">
                <div className="text-[#9BA6B8]">Logs & Reports</div>
                <div className="text-white font-bold mt-1">artifacts/reports/</div>
                <div className="text-[10px] text-[#7048D9] mt-1">JSON & CSV Generators Active</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

