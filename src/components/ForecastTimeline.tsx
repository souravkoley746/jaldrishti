/**
 * ForecastTimeline Component
 * 0 - 180 Minute 2D Hydrodynamic Nowcast Time Scrubber & Hyetograph Controller
 */

import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  CloudRain,
  Waves,
  Zap,
} from 'lucide-react';
import { useFloodStore, FORECAST_TIMESTEPS, ForecastTimestep } from '../store/useFloodStore';

export const ForecastTimeline: React.FC = () => {
  const {
    currentTimestep,
    setTimestep,
    nextTimestep,
    prevTimestep,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
  } = useFloodStore();

  // Simulation playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 2000 / playbackSpeed;
    const interval = setInterval(() => {
      nextTimestep();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, nextTimestep]);

  // Precipitation hyetograph intensity profile for Barasat nowcast (mm/h)
  const rainfallProfile: Record<ForecastTimestep, number> = {
    0: 44.5,
    15: 48.0,
    30: 38.2,
    45: 28.5,
    60: 19.0,
    90: 12.5,
    120: 7.0,
    180: 3.5,
  };

  // Peak depth profile (cm)
  const depthProfile: Record<ForecastTimestep, number> = {
    0: 12.0,
    15: 26.5,
    30: 42.0,
    45: 56.0,
    60: 52.5,
    90: 38.0,
    120: 22.0,
    180: 8.5,
  };

  return (
    <div
      id="forecast-timeline-scrubber"
      className="bg-slate-950/95 border-t border-slate-800 text-slate-100 px-4 py-2 select-none z-20 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-prev-timestep"
            onClick={prevTimestep}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Step Back 15 Minutes"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-play-pause-timeline"
            onClick={togglePlay}
            className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-cyan-600 text-white hover:bg-cyan-500'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>SIMULATE</span>
              </>
            )}
          </button>

          <button
            id="btn-next-timestep"
            onClick={nextTimestep}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Step Forward 15 Minutes"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded text-[10px] font-mono p-0.5 ml-1">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-slate-800 text-cyan-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* 0 - 180 Minute Scrub Timeline */}
        <div className="flex-1 px-4">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-400">
            <span className="flex items-center space-x-1">
              <CloudRain className="w-3 h-3 text-cyan-400" />
              <span>Rainfall Hyetograph & Hydrodynamic Surge Curve</span>
            </span>
            <span className="text-cyan-300 font-bold">
              Active: {currentTimestep === 0 ? 'NOW (T+0)' : `+${currentTimestep} MIN FORECAST`}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
            {FORECAST_TIMESTEPS.map((step) => {
              const isSelected = currentTimestep === step;
              const rain = rainfallProfile[step];
              const depth = depthProfile[step];

              return (
                <button
                  key={step}
                  id={`timeline-step-${step}`}
                  onClick={() => setTimestep(step)}
                  className={`p-1 rounded text-center transition-all border flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-500 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-500'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono font-black ${
                      isSelected ? 'text-cyan-300' : 'text-slate-300'
                    }`}
                  >
                    {step === 0 ? 'NOW' : `+${step}m`}
                  </span>

                  {/* Micro hyetograph bar */}
                  <div className="w-full bg-slate-950 h-3 rounded flex items-end my-0.5 overflow-hidden px-0.5">
                    <div
                      className={`w-full rounded-t transition-all ${
                        depth >= 50
                          ? 'bg-purple-500'
                          : depth >= 35
                          ? 'bg-rose-500'
                          : depth >= 20
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ height: `${Math.min(100, (depth / 60) * 100)}%` }}
                    />
                  </div>

                  <span className="text-[8px] font-mono text-slate-400">{depth}cm</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advisory Badge */}
        <div className="hidden lg:flex flex-col items-end text-right font-mono text-[9px] text-slate-400 border-l border-slate-800 pl-3">
          <span className="text-amber-400 font-bold uppercase tracking-wider">
            Operational Protocol
          </span>
          <span>Recommended based on current flood forecast.</span>
        </div>
      </div>
    </div>
  );
};
