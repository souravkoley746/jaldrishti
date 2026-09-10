/**
 * HotspotPanel Component
 * Key vulnerable Barasat waterlogging hotspots with real-time risk tiers.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Waves, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { FloodHotspot, FloodRiskLevel } from '../types';

export const HotspotPanel: React.FC = () => {
  const { currentTimestep, selectedLocationId, setSelectedHotspot } = useFloodStore();

  const { data: hotspots } = useQuery({
    queryKey: ['flood-hotspots', currentTimestep],
    queryFn: () => JaldrishtiApi.getHotspots(currentTimestep),
  });

  const getRiskBadge = (risk: FloodRiskLevel) => {
    switch (risk) {
      case 'CLOSED':
        return 'bg-purple-950 text-purple-300 border-purple-600';
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-600';
      case 'HIGH':
        return 'bg-red-950 text-red-300 border-red-600';
      case 'CAUTION':
        return 'bg-amber-950 text-amber-300 border-amber-600';
      case 'SAFE':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-600';
    }
  };

  return (
    <div id="hotspots-panel" className="space-y-2 text-slate-100 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Vulnerable Hotspot Catalog</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
          {hotspots?.length || 0} MONITORED
        </span>
      </div>

      <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {hotspots?.map((spot) => {
          const isSelected = selectedLocationId === spot.id;
          return (
            <div
              key={spot.id}
              id={`hotspot-item-${spot.id}`}
              onClick={() => setSelectedHotspot(spot)}
              className={`p-2.5 rounded border transition-all cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 leading-tight">
                    {spot.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Ward {spot.ward_no} • Elev: {spot.elevation_m}m MSL
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getRiskBadge(
                    spot.risk_level
                  )}`}
                >
                  {spot.risk_level}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                <div className="flex items-center space-x-1">
                  <Waves className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-400">Depth:</span>
                  <strong className="text-rose-400">{spot.predicted_depth_cm} cm</strong>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  <span className="text-slate-400">Drain:</span>
                  <strong className="text-indigo-300">{spot.drain_utilization_pct}%</strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-sans line-clamp-2">
                {spot.primary_cause}
              </p>

              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 pt-0.5">
                <span>Click for Causal Physics Attribution</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
