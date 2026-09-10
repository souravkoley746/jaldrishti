/**
 * FocusModeOverlay Component
 * Quick Response / Focus Mode HUD for Emergency Dispatchers & Live Demonstrations
 * Zero clutter: Delivers the 5 Core Questions within 5 seconds.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  CloudRain,
  Waves,
  Timer,
  MapPin,
  Navigation,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';

export const FocusModeOverlay: React.FC = () => {
  const {
    currentTimestep,
    operationMode,
    setViewExperience,
    setRoutingModalOpen,
    setActiveRightTab,
    setRightPanelOpen,
    setSelectedLocationId,
  } = useFloodStore();

  const { data: summary } = useQuery({
    queryKey: ['catchment-summary', currentTimestep, operationMode],
    queryFn: () => JaldrishtiApi.getCatchmentSummary(currentTimestep, operationMode),
    refetchInterval: 15000,
  });

  const handleViewActions = () => {
    setViewExperience('COMMAND_CENTER');
    setActiveRightTab('decisions');
    setRightPanelOpen(true);
  };

  const handleViewRoutes = () => {
    setRoutingModalOpen(true);
  };

  const handleInspectHotspot = () => {
    setViewExperience('COMMAND_CENTER');
    setSelectedLocationId('road_102');
    setActiveRightTab('intelligence');
    setRightPanelOpen(true);
  };

  return (
    <div
      id="focus-mode-hud"
      className="absolute top-4 left-4 z-30 max-w-md w-[92%] bg-slate-950/95 border-2 border-rose-600/90 rounded-2xl p-5 shadow-2xl backdrop-blur-xl select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
            Barasat Municipality • Quick Response HUD
          </span>
          <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <span>City Status Overview</span>
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-mono text-xs font-black tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>HIGH FLOOD RISK</span>
        </div>
      </div>

      {/* 4 Critical High-Contrast Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Rainfall */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono mb-1">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span>Rainfall Rate</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-cyan-300">
              {summary?.current_avg_rainfall_mm_hr ?? 38.3}
            </span>
            <span className="text-xs font-mono text-slate-400">mm/hr</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono font-bold mt-1 block">
            Convective Storm
          </span>
        </div>

        {/* Expected Peak Depth */}
        <div className="bg-slate-900/90 border border-rose-900/60 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono mb-1">
            <Waves className="w-4 h-4 text-rose-400" />
            <span>Peak Depth</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-rose-400">
              {summary?.peak_predicted_depth_cm ?? 39.0}
            </span>
            <span className="text-xs font-mono text-slate-400">cm</span>
          </div>
          <span className="text-[10px] text-rose-400 font-mono font-bold mt-1 block">
            Impasse at &gt; 35cm
          </span>
        </div>

        {/* Flood Countdown */}
        <div className="bg-slate-900/90 border border-amber-900/60 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono mb-1">
            <Timer className="w-4 h-4 text-amber-400" />
            <span>Flood In</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-amber-300">18</span>
            <span className="text-xs font-mono text-slate-400">MINUTES</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold mt-1 block">
            Lead Time to Inundation
          </span>
        </div>

        {/* Critical Hotspots */}
        <div
          onClick={handleInspectHotspot}
          className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono mb-1">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Hotspots</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-emerald-300">
              {summary?.critical_wards_count ?? 3}
            </span>
            <span className="text-xs font-mono text-slate-400">CRITICAL</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold mt-1 block">
            Champadali More • Ward 4
          </span>
        </div>
      </div>

      {/* Two High-Priority Action Buttons */}
      <div className="space-y-2.5">
        <button
          id="btn-focus-safe-routes"
          onClick={handleViewRoutes}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/60 transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>VIEW SAFE EVACUATION ROUTES</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-focus-recommended-actions"
          onClick={handleViewActions}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold font-mono text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all"
        >
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>VIEW RECOMMENDED MUNICIPAL ACTIONS</span>
        </button>
      </div>

      {/* Switcher back to Full GIS Command Center */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Simplified Focus Mode Active</span>
        <button
          id="btn-switch-to-full-command"
          onClick={() => setViewExperience('COMMAND_CENTER')}
          className="text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-1"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Switch to Full GIS Command Center</span>
        </button>
      </div>
    </div>
  );
};
