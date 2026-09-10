/**
 * InfoTooltip Component
 * Non-intrusive hover/tap tooltip offering plain-language explanations of technical hydrological and GIS terms.
 */

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  term: string;
  explanation: string;
  inline?: boolean;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ term, explanation, inline = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={`relative ${inline ? 'inline-flex items-center' : 'block'} group`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-cyan-300 p-0.5 rounded focus:outline-none transition-colors ml-1 cursor-help"
        aria-label={`Explain ${term}`}
      >
        <Info className="w-3 h-3 text-slate-500 hover:text-cyan-400" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2 bg-slate-900/98 text-slate-200 text-[11px] font-sans rounded-lg border border-cyan-500/40 shadow-xl shadow-black/80 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-bold text-cyan-300 font-mono text-[10px] uppercase mb-0.5">
            ⓘ {term}
          </div>
          <p className="leading-snug text-slate-300">{explanation}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
};
