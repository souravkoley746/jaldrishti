/**
 * MapFocusControls Component
 * Quick 1-click GIS Focus Pill Bar (FLOOD, RAIN, ROADS, DRAINAGE, INFRA, ROUTES)
 */

import React from 'react';
import {
  Layers,
  Waves,
  CloudRain,
  GitBranch,
  Building2,
  Navigation,
  MapPin,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { MapFocusPreset } from '../types';

export const MapFocusControls: React.FC = () => {
  const { mapFocusPreset, setMapFocusPreset } = useFloodStore();

  const presets: { id: MapFocusPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'ALL LAYERS', icon: <Layers className="w-3 h-3" /> },
    { id: 'FLOOD', label: 'FLOOD DEPTH', icon: <Waves className="w-3 h-3 text-rose-400" /> },
    { id: 'RAIN', label: 'RADAR RAIN', icon: <CloudRain className="w-3 h-3 text-cyan-400" /> },
    { id: 'DRAINAGE', label: '1D SEWERS', icon: <GitBranch className="w-3 h-3 text-indigo-400" /> },
    { id: 'ROADS', label: 'ROADS', icon: <MapPin className="w-3 h-3 text-slate-300" /> },
    { id: 'INFRA', label: 'CRITICAL INFRA', icon: <Building2 className="w-3 h-3 text-emerald-400" /> },
    { id: 'ROUTES', label: 'SAFE ROUTES', icon: <Navigation className="w-3 h-3 text-amber-400" /> },
  ];

  return (
    <div
      id="map-focus-presets"
      className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-slate-800 rounded-lg p-1 shadow-2xl backdrop-blur-md flex items-center space-x-1 font-mono text-[11px] select-none"
    >
      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 border-r border-slate-800 hidden sm:inline-block">
        Focus:
      </span>
      {presets.map((preset) => {
        const isActive = mapFocusPreset === preset.id;
        return (
          <button
            key={preset.id}
            id={`preset-btn-${preset.id.toLowerCase()}`}
            onClick={() => setMapFocusPreset(preset.id)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all font-bold tracking-tight ${
              isActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/80 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            {preset.icon}
            <span className="whitespace-nowrap">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
};
