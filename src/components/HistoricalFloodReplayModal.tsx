/**
 * JALDRISHTI - HISTORICAL FLOOD REPLAY SYSTEM
 * Timeline sequence: RAIN STARTS -> RUNOFF -> DRAINAGE STRESS -> SURCHARGE -> FLOODING -> PEAK FLOOD
 * Strictly labeled: HISTORICAL REPLAY / SIMULATION MODE (Never presented as live).
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CloudRain,
  Activity,
  AlertTriangle,
  Layers,
  Clock,
  ShieldCheck,
  ChevronRight,
  Droplets,
  Gauge,
  Workflow,
  Info,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { HistoricalReplayEvent, HistoricalReplayStep, ReplayStage } from '../types';

const STAGE_ORDER: ReplayStage[] = [
  'RAIN_STARTS',
  'RUNOFF',
  'DRAINAGE_STRESS',
  'SURCHARGE',
  'FLOODING',
  'PEAK_FLOOD',
];

export const HistoricalFloodReplayModal: React.FC = () => {
  const {
    historicalReplayOpen,
    setHistoricalReplayOpen,
    setOperationMode,
    setTimestep,
  } = useFloodStore();

  const [events, setEvents] = useState<HistoricalReplayEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('EVENT-2024-MONSOON-01');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  useEffect(() => {
    JaldrishtiApi.getHistoricalReplayEvents().then((data) => {
      setEvents(data);
    });
  }, []);

  const activeEvent = events.find((e) => e.event_id === selectedEventId) || events[0];
  const activeStep: HistoricalReplayStep | undefined = activeEvent?.steps[currentStepIndex];

  // Auto-playback loop
  useEffect(() => {
    if (!isPlaying || !activeEvent) return;

    const intervalTime = 3000 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < activeEvent.steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, activeEvent, playbackSpeed]);

  if (!historicalReplayOpen || !activeEvent || !activeStep) return null;

  const handleApplyToMap = (step: HistoricalReplayStep) => {
    // Map offset min to forecast timestep
    if (step.timestep_offset_min <= -30) setTimestep(0);
    else if (step.timestep_offset_min <= 0) setTimestep(15);
    else if (step.timestep_offset_min <= 30) setTimestep(30);
    else setTimestep(60);
    setOperationMode('SIMULATION');
  };

  const getStageColor = (stage: ReplayStage, isActive: boolean) => {
    if (!isActive) return 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300';
    switch (stage) {
      case 'RAIN_STARTS':
        return 'bg-cyan-950 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/50';
      case 'RUNOFF':
        return 'bg-blue-950 border-blue-500 text-blue-300 ring-2 ring-blue-500/50';
      case 'DRAINAGE_STRESS':
        return 'bg-indigo-950 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/50';
      case 'SURCHARGE':
        return 'bg-amber-950 border-amber-500 text-amber-300 ring-2 ring-amber-500/50';
      case 'FLOODING':
        return 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/50';
      case 'PEAK_FLOOD':
        return 'bg-purple-950 border-purple-500 text-purple-300 ring-2 ring-purple-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header with Strict Mode Labels */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Historical Flood Replay & Hydrodynamic Timeline
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 rounded uppercase">
                  HISTORICAL REPLAY MODE
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded">
                  CALIBRATED BENCHMARK
                </span>
              </div>
              <p className="text-xs text-amber-300/80 flex items-center mt-0.5 space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Notice: All telemetry represents historical calibration datasets. Strictly prohibited from live operational dispatch.</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPlaying(false);
              setHistoricalReplayOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Event Selector & Benchmark Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                Select Calibrated Historical Benchmark Event:
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {events.map((evt) => (
                  <button
                    key={evt.event_id}
                    onClick={() => {
                      setSelectedEventId(evt.event_id);
                      setCurrentStepIndex(0);
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                      selectedEventId === evt.event_id
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {evt.title} ({evt.date_formatted})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL PRECIPITATION</span>
                <span className="font-bold text-cyan-400">{activeEvent.total_rainfall_mm} mm</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px]">DURATION</span>
                <span className="font-bold text-indigo-300">{activeEvent.duration_hours} Hours</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px]">PEAK INUNDATION</span>
                <span className="font-bold text-rose-400">{activeEvent.peak_inundation_area_sqkm} sq.km</span>
              </div>
            </div>
          </div>

          {/* HYDROLOGICAL TIMELINE STEPPER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>Hydrological Causal Chain Progression</span>
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                Step {currentStepIndex + 1} of {STAGE_ORDER.length} ({activeStep.stage.replace('_', ' ')})
              </span>
            </div>

            {/* Stepper Chain Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {activeEvent.steps.map((step, idx) => {
                const isActive = currentStepIndex === idx;
                const isPassed = currentStepIndex > idx;

                return (
                  <button
                    key={step.stage}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      handleApplyToMap(step);
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${getStageColor(
                      step.stage,
                      isActive
                    )}`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-mono font-bold">
                        0{idx + 1}
                      </span>
                      {isPassed && <span className="text-[9px] text-emerald-400 font-mono">DONE</span>}
                      {isActive && <span className="text-[9px] text-cyan-300 font-mono font-bold animate-pulse">ACTIVE</span>}
                    </div>
                    <div className="font-bold text-xs leading-tight tracking-tight uppercase">
                      {step.stage.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] opacity-75 font-mono mt-1">
                      {step.timestep_offset_min > 0 ? `T+${step.timestep_offset_min}m` : `T${step.timestep_offset_min}m`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE STAGE DEEP-DIVE CARD */}
          <div className="p-5 rounded-xl bg-slate-950 border border-cyan-900/60 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-cyan-400">
                    {activeStep.label}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold">
                    HYDROLOGICAL PHASE: {activeStep.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{activeStep.description}</p>
              </div>

              {/* Apply Step to Main Digital Twin Map */}
              <button
                onClick={() => {
                  handleApplyToMap(activeStep);
                  setHistoricalReplayOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg self-start md:self-auto"
              >
                <span>View on GIS Digital Twin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stage Physical & Surcharge Telemetry Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block flex items-center space-x-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  <span>Rainfall Intensity</span>
                </span>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
                  {activeStep.rain_intensity_mm_hr} <span className="text-xs font-normal text-slate-400">mm/hr</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block flex items-center space-x-1">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span>Catchment Runoff</span>
                </span>
                <div className="text-lg font-bold font-mono text-blue-300 mt-1">
                  {activeStep.catchment_runoff_cumecs} <span className="text-xs font-normal text-slate-400">m³/s</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  <span>Drain Network Stress</span>
                </span>
                <div className="text-lg font-bold font-mono text-indigo-300 mt-1">
                  {activeStep.drainage_network_stress_pct}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Surcharged Manholes</span>
                </span>
                <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                  {activeStep.surcharged_nodes_count} <span className="text-xs font-normal text-slate-400">Nodes</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block flex items-center space-x-1">
                  <Gauge className="w-3 h-3 text-rose-400" />
                  <span>Max Inundation Depth</span>
                </span>
                <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                  {activeStep.max_depth_cm} <span className="text-xs font-normal text-slate-400">cm</span>
                </div>
              </div>
            </div>

            {/* Scientific Hydrological Mechanic Explanation */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase block">
                  Hydrodynamic Physics & Conservation Principle:
                </span>
                <p className="text-xs font-mono text-slate-300 mt-0.5 leading-relaxed">
                  {activeStep.hydrological_mechanic}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Playback Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Controls: Play/Pause/Prev/Next/Reset */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Timeline to Inception"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
              }}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev Phase
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE REPLAY' : 'PLAY TIMELINE'}</span>
            </button>

            <button
              onClick={() => {
                if (currentStepIndex < activeEvent.steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
              }}
              disabled={currentStepIndex === activeEvent.steps.length - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next Phase
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-500">SPEED:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded ${
                  playbackSpeed === spd
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
