import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Layers,
  FlaskConical,
  GitCompare,
  Activity,
  FileText,
  Settings,
  Terminal,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agents', label: 'Agent Registry', icon: Bot },
  { to: '/benchmarks', label: 'Benchmark Library', icon: Layers },
  { to: '/experiments', label: 'Experiments & Runs', icon: FlaskConical },
  { to: '/comparisons', label: 'Agent Comparison', icon: GitCompare },
  { to: '/traces', label: 'Trace Explorer (ATIF)', icon: Activity },
  { to: '/reports', label: 'Reports & Export', icon: FileText },
  { to: '/settings', label: 'Integrations & Health', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#14171E] border-r-2 border-[#2B313E] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b-2 border-[#2B313E] bg-[#171A22]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D9FF47] border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-[2px_2px_0px_0px_#000]">
              R
            </div>
            <div>
              <div className="font-black tracking-wider text-lg text-white">RELIABENCH</div>
              <div className="text-[10px] uppercase font-bold text-[#D9FF47] tracking-widest">
                Agent Reliability OS
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded font-bold text-sm tracking-wide transition-all border-2 ${
                    isActive
                      ? 'bg-[#427BFF] text-white border-black shadow-[3px_3px_0px_0px_#000] translate-x-1'
                      : 'text-[#9BA6B8] border-transparent hover:text-white hover:bg-[#1C212B]'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Diagnostic Status */}
      <div className="p-4 border-t-2 border-[#2B313E] bg-[#0E1015]">
        <div className="flex items-center justify-between text-xs font-mono text-[#9BA6B8] mb-2">
          <span>HARBOR v0.25.0</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9FF47] animate-pulse"></span>
        </div>
        <div className="text-[11px] text-[#9BA6B8]">
          Repeatability & Failure Injection Platform
        </div>
      </div>
    </aside>
  );
};

