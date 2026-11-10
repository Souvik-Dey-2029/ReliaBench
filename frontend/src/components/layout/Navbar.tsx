import React from 'react';
import { Terminal, Shield, Zap, Search } from 'lucide-react';

interface NavbarProps {
  activeMode?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeMode = 'SIMULATOR_DEMO' }) => {
  const isSimulator = activeMode.includes('SIMULATOR') || activeMode.includes('DEMO');

  return (
    <header className="h-16 bg-[#14171E] border-b-2 border-[#2B313E] px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Environment Mode Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold uppercase border-2 shadow-[2px_2px_0px_0px_#000] ${
            isSimulator
              ? 'bg-[#FF725E] text-black border-black'
              : 'bg-[#D9FF47] text-black border-black'
          }`}
        >
          <Zap size={14} />
          <span>{isSimulator ? 'SIMULATOR MODE (DEMO DATA)' : 'HARBOR ENGINE ACTIVE'}</span>
        </div>

        <div className="text-xs text-[#9BA6B8] hidden md:block font-mono">
          Global AI Hackathon | PS02: AI Agent Benchmarking
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#171A22] border-2 border-[#2B313E] px-3 py-1.5 text-xs text-[#9BA6B8] font-mono">
          <Terminal size={14} className="text-[#35D5E8]" />
          <span>v0.1.0-alpha</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#427BFF] border-2 border-black flex items-center justify-center font-bold text-xs text-white shadow-[2px_2px_0px_0px_#000]">
          AG
        </div>
      </div>
    </header>
  );
};

