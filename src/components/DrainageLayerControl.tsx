/**
 * DrainageLayerControl Component
 * 1D SWMM Stormwater network diagnostics, pump station telemetry & outfall sluice states.
 */

import React, { useState } from 'react';
import { GitBranch, Activity, Power, ShieldCheck, AlertCircle } from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';

export const DrainageLayerControl: React.FC = () => {
  const { currentTimestep } = useFloodStore();
  const [pumpOverride, setPumpOverride] = useState<boolean>(true);

  return (
    <div
      id="drainage-layer-control"
      className="bg-slate-900/90 border border-slate-800 rounded p-2.5 text-slate-100 select-none space-y-2"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Drainage & Pump Operations</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60">
          1D SWMM
        </span>
      </div>

      <div className="space-y-1.5 text-[10px] font-mono">
        {/* Outfall Canal Status */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-1.5 rounded flex items-center justify-between">
          <span className="text-slate-400">Sunti River Outfall:</span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            HIGH TIDE LOCK
          </span>
        </div>

        {/* Major Dewatering Pump Station */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-1.5 rounded flex items-center justify-between">
          <div>
            <span className="text-slate-300 font-semibold block">Champadali Station Pump</span>
            <span className="text-slate-500 text-[9px]">Cap: 15,000 m³/hr</span>
          </div>
          <button
            onClick={() => setPumpOverride(!pumpOverride)}
            className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[9px] font-bold border transition-colors ${
              pumpOverride
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600/80'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Power className="w-2.5 h-2.5" />
            <span>{pumpOverride ? 'ACTIVE (100%)' : 'STANDBY'}</span>
          </button>
        </div>

        {/* Sethpukur Basin Sluice Gate */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-1.5 rounded flex items-center justify-between">
          <div>
            <span className="text-slate-300 font-semibold block">Sethpukur Sluice Flap</span>
            <span className="text-slate-500 text-[9px]">Backflow Preventer</span>
          </div>
          <span className="text-rose-400 font-bold px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800/60">
            SURCHARGED (120%)
          </span>
        </div>
      </div>
    </div>
  );
};
