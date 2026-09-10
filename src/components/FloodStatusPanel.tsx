/**
 * FloodStatusPanel Component
 * Critical Status Summary & Key Catchment Telemetry
 * Answering within 5 seconds: WHAT IS HAPPENING, HOW SEVERE IS IT, WHEN WILL IT FLOOD, WHAT TO DO NOW.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CloudRain,
  Waves,
  GitBranch,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Activity,
  Navigation,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { InfoTooltip } from './InfoTooltip';

export const FloodStatusPanel: React.FC = () => {
  const {
    currentTimestep,
    operationMode,
    telemetryExpanded,
    setTelemetryExpanded,
    setRoutingModalOpen,
    setActiveRightTab,
    setRightPanelOpen,
  } = useFloodStore();

  const { data: summary } = useQuery({
    queryKey: ['catchment-summary', currentTimestep, operationMode],
    queryFn: () => JaldrishtiApi.getCatchmentSummary(currentTimestep, operationMode),
    refetchInterval: 15000,
  });

  const handleOpenRouting = () => {
    setRoutingModalOpen(true);
  };

  const handleOpenDecisions = () => {
    setActiveRightTab('decisions');
    setRightPanelOpen(true);
  };

  const minutesRemaining = Math.max(6, 42 - currentTimestep);

  return (
    <div
      id="flood-status-panel"
      className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 text-slate-100 select-none space-y-3.5 shadow-xl font-sans"
    >
      {/* Header with City & Severe Status */}
      <div className="border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-xs font-mono font-black tracking-wider uppercase text-slate-200">
              Current City Status
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
            Nowcast: T+{currentTimestep}m
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-600/90 px-2.5 py-1 rounded-lg">
            <span className="text-rose-400 font-mono font-black text-xs">🔴 CRITICAL FLOOD RISK</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {summary?.city_name || 'Barasat Municipality'}
          </span>
        </div>
      </div>

      {/* Grid of 4 Key Critical Numbers (Designed for high readability on projector) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Rainfall Intensity */}
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
            <span className="flex items-center space-x-1">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rainfall</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-cyan-300">
              {summary?.current_avg_rainfall_mm_hr ?? 38.3}
            </span>
            <span className="text-[10px] font-mono text-slate-400">mm/h</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 block font-semibold mt-0.5">
            Convective Cell
          </span>
        </div>

        {/* Peak Predicted Depth */}
        <div className="bg-slate-950 border border-rose-900/80 p-2.5 rounded-xl bg-gradient-to-br from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
            <span className="flex items-center space-x-1">
              <Waves className="w-3.5 h-3.5 text-rose-400" />
              <span>Peak Depth</span>
            </span>
            <InfoTooltip
              term="Water Depth"
              explanation="Simulated 2D surface water height above road grade level."
            />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-rose-400">
              {summary?.peak_predicted_depth_cm ?? 39.0}
            </span>
            <span className="text-[10px] font-mono text-slate-400">cm</span>
          </div>
          <span className="text-[9px] font-mono text-rose-400 block font-bold mt-0.5">
            CRITICAL IMPASSE
          </span>
        </div>

        {/* Flood Expected In */}
        <div className="bg-slate-950 border border-amber-900/60 p-2.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Flood In</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-amber-300">
              {minutesRemaining}
            </span>
            <span className="text-[10px] font-mono text-slate-400">minutes</span>
          </div>
          <span className="text-[9px] font-mono text-amber-400 block font-semibold mt-0.5">
            Champadali More
          </span>
        </div>

        {/* Critical Hotspots */}
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-0.5">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Hotspots</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-rose-400">
              {summary?.critical_wards_count ?? 3}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Critical</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 block font-semibold mt-0.5">
            5 High / 8 Med
          </span>
        </div>
      </div>

      {/* Primary Emergency Action Callouts */}
      <div className="space-y-1.5 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-quick-safe-routes"
            onClick={handleOpenRouting}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-900/30"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="truncate">VIEW SAFE ROUTES</span>
          </button>

          <button
            id="btn-quick-decisions"
            onClick={handleOpenDecisions}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-900/30"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="truncate">ACTIONS (5)</span>
          </button>
        </div>
      </div>

      {/* Progressive Disclosure: More Telemetry */}
      <div className="pt-1">
        <button
          onClick={() => setTelemetryExpanded(!telemetryExpanded)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span>{telemetryExpanded ? 'HIDE SECONDARY TELEMETRY' : 'MORE TELEMETRY & DRAINAGE STRESS'}</span>
          {telemetryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {telemetryExpanded && (
          <div className="mt-2 space-y-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center">
                Drainage Utilization:
                <InfoTooltip
                  term="Drainage Stress"
                  explanation="How close the underground stormwater network is to maximum pipe volume capacity."
                />
              </span>
              <span className="text-indigo-400 font-bold">
                {summary?.average_drain_utilization_pct ?? 88}% (Near Surcharge)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center">
                Surcharged Trunk Nodes:
                <InfoTooltip
                  term="Surcharge"
                  explanation="When the drainage system exceeds capacity and backpressure pushes water onto road surfaces."
                />
              </span>
              <span className="text-rose-400 font-bold">14 / 86 Manholes</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center">
                Soil Moisture (AMC-III):
                <InfoTooltip
                  term="Soil Saturation Index"
                  explanation="Antecedent Moisture Condition indicating soil capacity to absorb further rainfall."
                />
              </span>
              <span className="text-amber-300 font-bold">0.94 (Saturated)</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Dewatering Pumps:</span>
              <span className="text-emerald-400 font-bold">
                {summary?.pump_stations_operational ?? 8} / {summary?.pump_stations_total ?? 9} Operational
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
