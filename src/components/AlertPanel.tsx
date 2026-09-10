/**
 * AlertPanel Component
 * Real-time municipal warnings, street closure advisories, and lead-time alerts.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Clock,
  MapPin,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { MunicipalAlert } from '../types';

export const AlertPanel: React.FC = () => {
  const { currentTimestep, setSelectedLocationId } = useFloodStore();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['municipal-alerts', currentTimestep],
    queryFn: () => JaldrishtiApi.getMunicipalAlerts(currentTimestep),
  });

  const getSeverityBadge = (severity: MunicipalAlert['severity']) => {
    switch (severity) {
      case 'EMERGENCY':
        return 'bg-rose-950 text-rose-300 border-rose-600/80 animate-pulse';
      case 'CRITICAL':
        return 'bg-red-950 text-red-300 border-red-700/80';
      case 'WARNING':
        return 'bg-amber-950 text-amber-300 border-amber-600/80';
      case 'ADVISORY':
      default:
        return 'bg-cyan-950 text-cyan-300 border-cyan-700/80';
    }
  };

  return (
    <div id="alerts-panel" className="space-y-2 text-slate-100 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Active Municipal Warnings</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
          {alerts?.length || 0} ACTIVE
        </span>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {alerts?.map((alert) => (
          <div
            key={alert.id}
            id={`alert-card-${alert.id}`}
            className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded p-2.5 space-y-1.5 transition-colors"
          >
            {/* Header: Severity & Lead time */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getSeverityBadge(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
              <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Lead Time: <strong className="text-slate-200">{alert.lead_time_minutes}m</strong></span>
              </div>
            </div>

            {/* Title & Affected Street */}
            <div>
              <h4 className="text-xs font-semibold text-slate-100 leading-tight">
                {alert.title}
              </h4>
              <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>
                  Ward {alert.ward_no} • {alert.affected_road}
                </span>
              </div>
            </div>

            {/* Depth Metric & Recommended Action */}
            <div className="bg-slate-900/80 border border-slate-800/80 p-1.5 rounded space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Predicted Depth:</span>
                <span className="text-rose-400 font-bold">{alert.predicted_depth_cm} cm</span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                <strong className="text-amber-400 font-mono text-[9px] uppercase block">Action:</strong>
                {alert.recommended_action}
              </p>
            </div>

            <button
              onClick={() => setSelectedLocationId('road_102')}
              className="w-full text-center text-[10px] font-mono py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700/60 flex items-center justify-center space-x-1 transition-colors"
            >
              <span>Inspect Causal Factors</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
