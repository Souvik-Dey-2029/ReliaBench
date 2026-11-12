import React from 'react';
import { ShieldCheck, Cpu, Database } from 'lucide-react';

export type ProvenanceMode = 'DETERMINISTIC_HARNESS' | 'REAL_EXECUTION' | 'SIMULATOR';

interface ProvenanceBadgeProps {
  mode: ProvenanceMode | string;
  className?: string;
  showIcon?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  mode,
  className = '',
  showIcon = true,
}) => {
  const normMode = (mode || '').toUpperCase();

  if (normMode === 'REAL_EXECUTION') {
    return (
      <span
        title="Real Harbor runner in Docker sandbox"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-[#C7D94C]/20 text-[#8ea424] border border-[#C7D94C]/40 ${className}`}
      >
        {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-[#a8be2c]" />}
        REAL_EXECUTION
      </span>
    );
  }

  if (normMode === 'DETERMINISTIC_HARNESS') {
    return (
      <span
        title="Deterministic reliability core harness with seeded fault injection"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-[#F06B45]/20 text-[#F06B45] border border-[#F06B45]/40 ${className}`}
      >
        {showIcon && <Cpu className="w-3.5 h-3.5 text-[#F06B45]" />}
        DETERMINISTIC_HARNESS
      </span>
    );
  }

  // Default: SIMULATOR
  return (
    <span
      title="Synthetic demo baseline"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-[#89977A]/20 text-[#89977A] border border-[#89977A]/40 ${className}`}
    >
      {showIcon && <Database className="w-3.5 h-3.5 text-[#89977A]" />}
      SIMULATOR (SYNTHETIC)
    </span>
  );
};
