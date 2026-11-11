import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Layers,
  FlaskConical,
  GitCompare,
  Activity,
  FileText,
  Settings,
  ArrowLeft
} from 'lucide-react';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/agents', label: 'Agent Registry', icon: Bot },
  { to: '/app/benchmarks', label: 'Benchmark Library', icon: Layers },
  { to: '/app/experiments', label: 'Experiments & Runs', icon: FlaskConical },
  { to: '/app/comparison', label: 'Agent Comparison', icon: GitCompare },
  { to: '/app/traces', label: 'Trace Explorer (ATIF)', icon: Activity },
  { to: '/app/reports', label: 'Reports & Export', icon: FileText },
  { to: '/app/integrations', label: 'Integrations & Health', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#141713] border-r border-[#2D332B] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2D332B] bg-[#171A16]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F06B45] border border-[#10120F] flex items-center justify-center font-black text-[#10120F] text-base shadow-[2px_2px_0px_0px_#10120F]">
              R
            </div>
            <div>
              <div className="font-black tracking-wider text-base text-[#E8DDC8]">RELIABENCH</div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#C7D94C] tracking-widest">
                Benchmarking Lab
              </div>
            </div>
          </div>
        </div>

        {/* Back to Landing Page Control */}
        <div className="p-3 border-b border-[#2D332B]/60">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold text-[#89977A] hover:text-[#E8DDC8] hover:bg-[#1D211C] rounded transition-all"
          >
            <ArrowLeft size={14} className="text-[#F06B45]" />
            <span>Back to Public Home</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs uppercase tracking-wider font-bold transition-all border ${
                    isActive
                      ? 'bg-[#1D211C] text-[#C7D94C] border-[#3B5436] shadow-[2px_2px_0px_0px_#10120F] translate-x-1'
                      : 'text-[#A7A393] border-transparent hover:text-[#E8DDC8] hover:bg-[#1A1E19]'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Diagnostic Status */}
      <div className="p-4 border-t border-[#2D332B] bg-[#10120F]">
        <div className="flex items-center justify-between text-xs font-mono text-[#89977A] mb-1">
          <span>HARBOR v0.25.0</span>
          <span className="w-2 h-2 rounded-full bg-[#C7D94C] animate-pulse"></span>
        </div>
        <div className="text-[10px] text-[#A7A393] font-mono">
          ATIF v1.8 · Pass@k Engine
        </div>
      </div>
    </aside>
  );
};
