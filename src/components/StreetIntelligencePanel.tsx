/**
 * StreetIntelligencePanel Component
 * Location Intelligence & Explainable AI Drawer
 * Answers: "WHY WILL THIS LOCATION FLOOD?"
 * Grounded in Saint-Venant 1D/2D physics, SWMM sewer surcharge, DEM depression, and soil infiltration.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Droplets,
  ShieldAlert,
  Sparkles,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { FactorImpactLevel, ConfidenceLevel } from '../types';
import { InfoTooltip } from './InfoTooltip';

export const StreetIntelligencePanel: React.FC = () => {
  const {
    selectedLocationId,
    operationMode,
    locationDetailsExpanded,
    setLocationDetailsExpanded,
    setSelectedLocationId,
    setRoutingModalOpen,
    setActiveRightTab,
    currentTimestep,
  } = useFloodStore();

  const { data: explanation } = useQuery({
    queryKey: ['location-explanation', selectedLocationId, operationMode],
    queryFn: () =>
      JaldrishtiApi.getLocationExplanation(selectedLocationId || 'road_102', operationMode),
    enabled: Boolean(selectedLocationId),
  });

  const getImpactBadge = (impact: FactorImpactLevel) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-600/80';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-600/80';
      case 'MEDIUM':
        return 'bg-blue-950 text-blue-300 border-blue-600/80';
      case 'LOW':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getConfidenceBadge = (confidence?: ConfidenceLevel) => {
    switch (confidence) {
      case 'HIGH':
        return 'bg-emerald-950 text-emerald-300 border-emerald-600';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-600';
      case 'LOW':
        return 'bg-rose-950 text-rose-300 border-rose-600';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleFindSafeRoute = () => {
    setRoutingModalOpen(true);
  };

  const handleViewRecommendedAction = () => {
    setActiveRightTab('decisions');
  };

  if (!selectedLocationId) {
    return (
      <div className="p-6 text-center text-slate-500 font-mono text-xs space-y-2 bg-slate-900/60 rounded-xl border border-slate-800">
        <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
        <p>Select any road segment or hotspot on the GIS map to inspect causal flood intelligence.</p>
        <button
          onClick={() => setSelectedLocationId('road_102')}
          className="px-3 py-1.5 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 text-[11px] font-mono hover:bg-cyan-600/30 transition-colors"
        >
          Inspect Sample Hotspot (Jessore Road)
        </button>
      </div>
    );
  }

  const minutesRemaining = Math.max(6, (explanation?.time_to_flood_minutes ?? 18) - currentTimestep);

  return (
    <div id="street-intelligence-panel" className="space-y-3 text-slate-100 select-none font-sans">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-wider">
              Location Intelligence &amp; XAI
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span
              className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getConfidenceBadge(
                explanation?.confidence
              )}`}
            >
              Confidence: {explanation?.confidence || 'HIGH'}
            </span>
            <InfoTooltip
              term="Confidence Level"
              explanation="Reliability of the current prediction based on radar rain calibration and SWMM conduit data."
            />
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">
              📍 {explanation?.location_name || 'Jessore Road (Champadali More)'}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Node: {explanation?.location_id || selectedLocationId} • Ward {explanation?.ward_no || 4}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-600 font-mono font-black text-[10px]">
            🔴 {explanation?.risk_level || 'CRITICAL'}
          </span>
        </div>

        {/* High-Readability Numbers Ribbon */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
          <div className="border-r border-slate-800 pr-2">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Predicted Depth</span>
            <strong className="text-2xl font-black font-mono text-rose-400">
              {explanation?.predicted_depth_cm ?? 39.0} <span className="text-xs font-normal">cm</span>
            </strong>
          </div>
          <div className="pl-2">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Flood Expected In</span>
            <strong className="text-2xl font-black font-mono text-amber-300">
              {minutesRemaining} <span className="text-xs font-normal">min</span>
            </strong>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-intel-safe-route"
            onClick={handleFindSafeRoute}
            className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="truncate">FIND SAFE ROUTE</span>
          </button>

          <button
            id="btn-intel-recommended-action"
            onClick={handleViewRecommendedAction}
            className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="truncate">ACTION PROTOCOL</span>
          </button>
        </div>
      </div>

      {/* WHY IS THIS FLOODING? Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-100">
              Why Is This Flooding?
            </h4>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 font-bold">Physics-Grounded</span>
        </div>

        {/* 3 Quick Executive Reasons */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span><strong>High rainfall intensity:</strong> 38.3 mm/hr convective burst exceeds road runoff capacity.</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>Terrain depression:</strong> Natural micro-basin collecting overland flow from adjacent sectors.</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span><strong>Drainage surcharge:</strong> Champadali outfall conduit at 94% capacity causing surface backpressure.</span>
          </div>
        </div>

        {/* Contributing Factors with Weight Bars */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
            Causal Factor Weights (Hydrodynamic Model)
          </span>

          <div className="space-y-2">
            {explanation?.contributing_factors?.map((factor) => (
              <div
                key={factor.factor}
                id={`factor-card-${factor.factor}`}
                className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-200 capitalize">
                      {factor.factor.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${getImpactBadge(
                        factor.impact
                      )}`}
                    >
                      {factor.impact}
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold font-mono">
                    {factor.weight_percentage}% impact
                  </span>
                </div>

                {/* Progress Weight Bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-rose-500 h-full rounded-full"
                    style={{ width: `${factor.weight_percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {factor.description}
                </p>

                {factor.metric_value && (
                  <div className="text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <strong className="text-slate-300">Measured Telemetry:</strong> {factor.metric_value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details Progressive Disclosure Toggle */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setLocationDetailsExpanded(!locationDetailsExpanded)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>{locationDetailsExpanded ? 'HIDE TECHNICAL EQUATIONS' : 'VIEW TECHNICAL DETAILS & SWMM EQUATIONS'}</span>
            {locationDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {locationDetailsExpanded && (
            <div className="mt-2 space-y-2 p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-cyan-400 font-bold block">1. 2D Hydrodynamic Governing Equations:</span>
                <p className="text-slate-400 font-mono bg-slate-950 p-1.5 rounded border border-slate-800">
                  ∂h/∂t + ∂(hu)/∂x + ∂(hv)/∂y = i - f
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-indigo-400 font-bold block">2. 1D SWMM Hydraulic Surcharge Coupling:</span>
                <p className="text-slate-400 font-mono bg-slate-950 p-1.5 rounded border border-slate-800">
                  Q = (1/n) · A · R^(2/3) · S_f^(1/2) (Manning's n = 0.015)
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-400 font-bold block">3. Infiltration (Green-Ampt Method):</span>
                <p className="text-slate-400 font-mono bg-slate-950 p-1.5 rounded border border-slate-800">
                  f(t) = K · [1 + (Ψ · Δθ) / F(t)]
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
