/**
 * CitizenMobileView Component
 * Simplified, accessible, mobile-first interface for citizens and commuters
 * Clean, legible, big touch targets, zero complex jargon.
 */

import React from 'react';
import {
  ShieldAlert,
  Navigation,
  Send,
  Building2,
  PhoneCall,
  Clock,
  Waves,
  CloudRain,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { FloodMap } from './FloodMap';

export const CitizenMobileView: React.FC = () => {
  const {
    setViewExperience,
    setRoutingModalOpen,
    setCitizenReportModalOpen,
  } = useFloodStore();

  return (
    <div id="citizen-mobile-view" className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>JALDRISHTI</span>
              <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-700 px-1.5 py-0.5 rounded">
                CITIZEN
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Barasat Municipal Flood Advisory</p>
          </div>
        </div>

        <button
          onClick={() => setViewExperience('COMMAND_CENTER')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Command Center</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="max-w-3xl w-full mx-auto p-4 space-y-4 pb-12">
        {/* Your Location Flood Threat Card */}
        <div className="bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-2 border-rose-600 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-black tracking-widest text-rose-300 uppercase">
                CRITICAL FLOOD ADVISORY
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Ward 4 • Jessore Road</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Heavy Waterlogging Expected in 18 Min
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Overland water depth is rising rapidly due to high rainfall (38.3 mm/hr). Roads around Champadali More will become impassable for two-wheelers and sedans.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Expected Peak Depth</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black font-mono text-rose-400">39</span>
                <span className="text-sm font-mono text-slate-300">cm</span>
              </div>
              <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">Exceeds car exhaust height</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Time to Impasse</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black font-mono text-amber-400">18</span>
                <span className="text-sm font-mono text-slate-300">min</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">Estimated 10:15 AM</span>
            </div>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="btn-citizen-safe-route"
            onClick={() => setRoutingModalOpen(true)}
            className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-between shadow-xl transition-all"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="text-sm font-black block uppercase tracking-tight">
                  Find Flood-Safe Route
                </span>
                <span className="text-xs font-medium text-slate-800">
                  Avoid inundated roads and blockages
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            id="btn-citizen-report-flood"
            onClick={() => setCitizenReportModalOpen(true)}
            className="p-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-between shadow-xl transition-all"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-black block uppercase tracking-tight">
                  Report Waterlogging
                </span>
                <span className="text-xs font-normal text-cyan-100">
                  Send photo & location to Municipal EOC
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Map Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Live Inundation & Roads Map</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">T+30 Min Forecast</span>
          </div>

          <div className="h-72 rounded-xl overflow-hidden border border-slate-800 relative">
            <FloodMap />
          </div>
        </div>

        {/* Nearby Emergency Shelters & Hospitals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Emergency Facilities Nearby</span>
          </h3>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Barasat Govt Medical College & Hospital
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Access: DRY ROUTE AVAILABLE (via NH-12)
                </span>
              </div>
              <a
                href="tel:108"
                className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1 hover:bg-emerald-900"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call 108</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Barasat Municipal Disaster Control Room
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  24x7 Emergency Help Desk
                </span>
              </div>
              <a
                href="tel:112"
                className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1 hover:bg-cyan-900"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call 112</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
