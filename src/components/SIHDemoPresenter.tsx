/**
 * SIHDemoPresenter Component
 * Guided 8-Step Interactive Narrative Engine for Smart India Hackathon & Municipal Demonstrations
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Navigation,
  Waves,
  GitBranch,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';

interface DemoStepMeta {
  step: number;
  title: string;
  badge: string;
  badgeColor: string;
  narrative: string;
  highlightedTakeaway: string;
  icon: React.ReactNode;
}

const DEMO_STEPS: DemoStepMeta[] = [
  {
    step: 1,
    title: 'CURRENT CONVECTIVE RAINFALL INCEPTION',
    badge: 'STAGE 1: HYDROMETEOROLOGY',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700',
    narrative:
      'Kolkata Doppler Weather Radar (DWR) and 5 IoT AWS ground stations detect heavy convective rain cell (38.5 mm/hr) actively moving over Barasat Municipality Ward 4.',
    highlightedTakeaway: 'High-frequency telemetry ingested with zero lag.',
    icon: <Waves className="w-4 h-4 text-cyan-400" />,
  },
  {
    step: 2,
    title: '0–3 HOUR INUNDATION NOWCASTING',
    badge: 'STAGE 2: HYDRODYNAMIC PINN',
    badgeColor: 'bg-sky-950 text-sky-300 border-sky-700',
    narrative:
      'HydroGNN Physics-Informed Neural Network predicts citywide 2D overland flow in 142 ms (18,500x faster than CFD), predicting peak depth across roads at T+45 min.',
    highlightedTakeaway: 'Physics-constrained Saint-Venant shallow water equations solved in real time.',
    icon: <Sparkles className="w-4 h-4 text-sky-400" />,
  },
  {
    step: 3,
    title: 'CRITICAL HOTSPOT DETECTED',
    badge: 'STAGE 3: SPATIAL RISK DETECTION',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    narrative:
      'Jessore Rd - Champadali More junction is flagged as CRITICAL with expected flood depth of 42.0 cm, threatening major arterial traffic.',
    highlightedTakeaway: 'Spatial risk classifier alerts municipal command 42 minutes before inundation.',
    icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  },
  {
    step: 4,
    title: 'FLOOD LEAD TIME COUNTDOWN',
    badge: 'STAGE 4: ACTIONABLE WINDOW',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-700',
    narrative:
      'Signature countdown timer calculates 18:24 minutes remaining before road impassability threshold (>35 cm) is breached at an inflow velocity of +0.8 cm/min.',
    highlightedTakeaway: 'Provides emergency commanders with a clear, definitive action window.',
    icon: <Waves className="w-4 h-4 text-rose-400" />,
  },
  {
    step: 5,
    title: 'EXPLAINABLE AI: WHY WILL IT FLOOD?',
    badge: 'STAGE 5: PHYSICAL EXPLAINABILITY',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700',
    narrative:
      'Unlike black-box AI, JALDRISHTI decomposes flood causality: 45% Storm Sewer Surcharge + 35% Topographic Depression Sink + 20% High Impervious Surface Runoff.',
    highlightedTakeaway: 'Causal transparency builds trust with municipal engineers and administrators.',
    icon: <HelpCircle className="w-4 h-4 text-indigo-400" />,
  },
  {
    step: 6,
    title: '1D UNDERGROUND SEWER SURCHARGE',
    badge: 'STAGE 6: 1D/2D DRAINAGE COUPLING',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-700',
    narrative:
      'Coupled EPA SWMM 5.2 dynamic wave engine reveals underground trunk sewer COND-CHAMP-01 is choked at 118% capacity, causing backwater surcharging through manholes.',
    highlightedTakeaway: '1D conduits and 2D overland flood fields are coupled dynamically.',
    icon: <GitBranch className="w-4 h-4 text-purple-400" />,
  },
  {
    step: 7,
    title: 'CITY EMERGENCY DECISION SUPPORT',
    badge: 'STAGE 7: ACTIONABLE DISPATCH',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    narrative:
      'Decision Support Engine provides targeted municipal directives: Stage NDRF boats at Ward 4, dispatch 2 dewatering pumps to Champadali, and alert Traffic Police to divert NH-12.',
    highlightedTakeaway: 'Directly converts predictive science into department-specific action.',
    icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
  },
  {
    step: 8,
    title: 'FLOOD-SAFE AMBULANCE GREEN CORRIDOR',
    badge: 'STAGE 8: RESILIENT MOBILITY',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    narrative:
      'Emergency Routing Engine computes clearance-safe corridor for Ambulance from Central Fire Station to District Hospital, bypassing 42cm deep Champadali via NH-12 Bypass (max 8.5cm).',
    highlightedTakeaway: 'Saves lives by guaranteeing hospital accessibility during extreme weather.',
    icon: <Navigation className="w-4 h-4 text-amber-400" />,
  },
];

export const SIHDemoPresenter: React.FC = () => {
  const {
    sihDemoActive,
    sihDemoStep,
    nextSIHDemoStep,
    prevSIHDemoStep,
    setSIHDemoStep,
    exitSIHDemo,
  } = useFloodStore();

  if (!sihDemoActive) return null;

  const currentStepData = DEMO_STEPS[sihDemoStep - 1] || DEMO_STEPS[0];

  return (
    <div
      id="sih-demo-presenter"
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-slate-950/95 border-2 border-cyan-500 rounded-xl p-4 shadow-2xl backdrop-blur-xl select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black font-mono tracking-wider text-cyan-300 uppercase">
                SIH Scientific Presentation Mode
              </span>
              <span
                className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${currentStepData.badgeColor}`}
              >
                {currentStepData.badge}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Step {sihDemoStep} of 8 • Live Interactive Script
            </span>
          </div>
        </div>

        {/* Step dots & Exit */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            {DEMO_STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => setSIHDemoStep(s.step)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s.step === sihDemoStep
                    ? 'bg-cyan-400 ring-2 ring-cyan-400/50 scale-125'
                    : s.step < sihDemoStep
                    ? 'bg-cyan-700'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Jump to Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>

          <button
            id="btn-exit-sih-demo"
            onClick={exitSIHDemo}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-600 text-slate-400 hover:text-rose-300 text-xs font-mono transition-colors"
            title="Exit Demo Presentation Mode"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Demo</span>
          </button>
        </div>
      </div>

      {/* Main Presentation Step Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-3 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-slate-100 uppercase tracking-tight">
              {currentStepData.step}. {currentStepData.title}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentStepData.narrative}
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded">
            <span className="text-cyan-400 font-bold">Judges Takeaway:</span>
            <span>{currentStepData.highlightedTakeaway}</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          <button
            id="btn-sih-next-step"
            onClick={nextSIHDemoStep}
            disabled={sihDemoStep === 8}
            className={`w-full py-2 px-3 rounded text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md ${
              sihDemoStep === 8
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50'
            }`}
          >
            <span>{sihDemoStep === 8 ? 'DEMO COMPLETE' : 'NEXT STEP'}</span>
            {sihDemoStep < 8 && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            id="btn-sih-prev-step"
            onClick={prevSIHDemoStep}
            disabled={sihDemoStep === 1}
            className={`w-full py-1.5 px-3 rounded text-xs font-mono flex items-center justify-center space-x-1.5 transition-all ${
              sihDemoStep === 1
                ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>PREVIOUS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
