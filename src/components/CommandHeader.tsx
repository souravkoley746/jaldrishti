/**
 * JALDRISHTI Command Header
 * Championship-Level Smart City Emergency Operations Bar
 * 4 Grouped Navigations: Operations, Mobility, Intelligence, Research
 * + Experience Switcher (Command Center, Focus Mode, Citizen)
 * + SIH 8-Step Presentation Demo Mode
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Clock,
  Navigation,
  Activity,
  Maximize2,
  Minimize2,
  Cpu,
  History,
  Award,
  Database,
  Fingerprint,
  ChevronDown,
  Layers,
  Sparkles,
  MapPin,
  Building2,
  GitBranch,
  HelpCircle,
  Play,
  SlidersHorizontal,
  Smartphone,
  CheckCircle2,
  Waves,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { OperationMode, ViewExperience } from '../types';

export const CommandHeader: React.FC = () => {
  const {
    operationMode,
    setOperationMode,
    viewExperience,
    setViewExperience,
    sihDemoActive,
    startSIHDemo,
    exitSIHDemo,
    setRoutingModalOpen,
    routingModalOpen,
    setHistoricalReplayOpen,
    setValidationLabOpen,
    setDataHealthOpen,
    setModelHealthOpen,
    setPredictionProvenanceOpen,
    setActiveRightTab,
    setRightPanelOpen,
    setSelectedLocationId,
    setMapFocusPreset,
  } = useFloodStore();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectNav = (action: () => void) => {
    action();
    setOpenDropdown(null);
  };

  return (
    <header
      id="jaldrishti-command-header"
      ref={dropdownRef}
      className="bg-slate-950 border-b border-slate-800 text-slate-100 px-3 py-1.5 flex items-center justify-between z-30 select-none shadow-2xl relative"
    >
      {/* Brand & Digital Twin Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400 bg-clip-text text-transparent">
              JALDRISHTI
            </h1>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-bold">
              BARASAT TWIN
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
            Coupled 1D/2D Urban Flood Intelligence & Emergency Mobility
          </p>
        </div>
      </div>

      {/* 4 Grouped Navigations: Operations, Mobility, Intelligence, Research */}
      <div className="hidden md:flex items-center space-x-1 font-mono text-xs">
        {/* 1. OPERATIONS DROPDOWN */}
        <div className="relative">
          <button
            id="nav-dropdown-operations"
            onClick={() => setOpenDropdown(openDropdown === 'operations' ? null : 'operations')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors font-bold ${
              openDropdown === 'operations'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPERATIONS</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'operations' && (
            <div className="absolute left-0 mt-1.5 w-56 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setViewExperience('COMMAND_CENTER');
                    setMapFocusPreset('ALL');
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-cyan-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold block">Live 2D Flood Map</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Overland depth & velocity fields</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setActiveRightTab('decisions');
                    setRightPanelOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-emerald-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold block">Municipal Decisions</span>
                  <span className="text-[10px] text-slate-400 font-sans block">NDRF staging & pump dispatch</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setActiveRightTab('hotspots');
                    setRightPanelOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-amber-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold block">Critical Hotspots</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Ranked flood risk junctions</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setActiveRightTab('alerts');
                    setRightPanelOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-rose-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="font-bold block">Active Alerts</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Ward-level broadcast alerts</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 2. MOBILITY DROPDOWN */}
        <div className="relative">
          <button
            id="nav-dropdown-mobility"
            onClick={() => setOpenDropdown(openDropdown === 'mobility' ? null : 'mobility')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors font-bold ${
              openDropdown === 'mobility'
                ? 'bg-slate-800 text-amber-300 border border-amber-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>MOBILITY</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'mobility' && (
            <div className="absolute left-0 mt-1.5 w-60 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setRoutingModalOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-amber-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold block">Flood-Safe Routing Engine</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Clearance-aware vehicle corridors</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setActiveRightTab('infrastructure');
                    setRightPanelOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-emerald-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold block">Critical Infrastructure</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Hospital & fire access route status</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 3. INTELLIGENCE DROPDOWN */}
        <div className="relative">
          <button
            id="nav-dropdown-intelligence"
            onClick={() => setOpenDropdown(openDropdown === 'intelligence' ? null : 'intelligence')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors font-bold ${
              openDropdown === 'intelligence'
                ? 'bg-slate-800 text-indigo-300 border border-indigo-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>INTELLIGENCE</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'intelligence' && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setSelectedLocationId('road_102');
                    setActiveRightTab('intelligence');
                    setRightPanelOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-indigo-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="font-bold block">Spatial Explainability (XAI)</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Decompose causes: Surcharge + Terrain</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setMapFocusPreset('DRAINAGE');
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-purple-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <GitBranch className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-bold block">1D Drainage Network Stress</span>
                  <span className="text-[10px] text-slate-400 font-sans block">SWMM hydraulic grade line & chokes</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleSelectNav(() => {
                    setModelHealthOpen(true);
                  })
                }
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-cyan-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold block">HydroGNN PINN Surrogate</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Physics-informed neural inference (142ms)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 4. RESEARCH & VALIDATION DROPDOWN */}
        <div className="relative">
          <button
            id="nav-dropdown-research"
            onClick={() => setOpenDropdown(openDropdown === 'research' ? null : 'research')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors font-bold ${
              openDropdown === 'research'
                ? 'bg-slate-800 text-sky-300 border border-sky-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>RESEARCH</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'research' && (
            <div className="absolute left-0 mt-1.5 w-64 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => handleSelectNav(() => setHistoricalReplayOpen(true))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-amber-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <History className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold block">Historical Flood Replay</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Step-by-step storm replay & physics</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectNav(() => setValidationLabOpen(true))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-indigo-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Award className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="font-bold block">Validation Lab</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Predicted vs observed IoU, MAE, RMSE</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectNav(() => setDataHealthOpen(true))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-emerald-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold block">Data Health & Feeds</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Radar, AWS gauges, SWMM telemetry</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectNav(() => setModelHealthOpen(true))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-cyan-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold block">Model Health & Architecture</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Physics engine & GPU surrogate stats</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectNav(() => setPredictionProvenanceOpen(true))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-sky-300 flex items-center space-x-2 text-xs transition-colors"
              >
                <Fingerprint className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="font-bold block">Prediction Lineage (Provenance)</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Audit trail & SHA-256 integrity</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Experience Switcher + SIH Demo Mode + Telemetry */}
      <div className="flex items-center space-x-2">
        {/* SIH Interactive Demo Mode Button */}
        <button
          id="btn-toggle-sih-demo"
          onClick={() => {
            if (sihDemoActive) {
              exitSIHDemo();
            } else {
              startSIHDemo();
            }
          }}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
            sihDemoActive
              ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-cyan-950/60 animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-700/70 hover:border-cyan-500'
          }`}
          title="Launch Guided 8-Step SIH Scientific Presentation Script"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{sihDemoActive ? 'DEMO ACTIVE' : 'SIH DEMO'}</span>
        </button>

        {/* View Experience Switcher: COMMAND CENTER | FOCUS MODE | CITIZEN */}
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 font-mono text-[10px]">
          {[
            { id: 'COMMAND_CENTER', label: 'COMMAND', icon: <Layers className="w-3 h-3" /> },
            { id: 'FOCUS_MODE', label: 'FOCUS', icon: <SlidersHorizontal className="w-3 h-3" /> },
            { id: 'CITIZEN', label: 'CITIZEN', icon: <Smartphone className="w-3 h-3" /> },
          ].map((exp) => (
            <button
              key={exp.id}
              id={`btn-exp-${exp.id.toLowerCase()}`}
              onClick={() => setViewExperience(exp.id as ViewExperience)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-all font-bold ${
                viewExperience === exp.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {exp.icon}
              <span>{exp.label}</span>
            </button>
          ))}
        </div>

        {/* Live Data Feed Health Indicator */}
        <button
          onClick={() => setDataHealthOpen(true)}
          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500 text-xs font-mono text-emerald-400 transition-colors"
          title="Data Feeds Status: 5 Live / 0 Degraded"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden lg:inline text-[11px] font-bold text-slate-300">FEEDS: LIVE</span>
        </button>

        {/* Simulation / Live Badge */}
        <div className="hidden xl:flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-0.5 font-mono text-[10px]">
          <span className="text-slate-500 mr-1">MODE:</span>
          <span className="text-cyan-400 font-bold">{operationMode}</span>
        </div>

        {/* Fullscreen Button */}
        <button
          id="btn-toggle-fullscreen"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="Toggle Fullscreen Command Mode"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Live Digital Clock */}
        <div className="font-mono text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-lg hidden md:block">
          {currentTime || '00:00:00'} IST
        </div>
      </div>
    </header>
  );
};
