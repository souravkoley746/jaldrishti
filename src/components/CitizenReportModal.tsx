/**
 * CitizenReportModal Component
 * Allows residents to report localized waterlogging, choked drains, and road blockages
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle2,
  Send,
  Waves,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';

export const CitizenReportModal: React.FC = () => {
  const { citizenReportModalOpen, setCitizenReportModalOpen } = useFloodStore();
  const [ward, setWard] = useState('4');
  const [landmark, setLandmark] = useState('Near Champadali Bus Stand');
  const [estimatedDepth, setEstimatedDepth] = useState('ANKLE'); // ANKLE, KNEE, WAIST
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!citizenReportModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setCitizenReportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        id="citizen-report-dialog"
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight">
                Report Waterlogging / Choked Drain
              </h3>
              <p className="text-xs text-slate-400">Barasat Citizen Flood Reporting</p>
            </div>
          </div>
          <button
            onClick={() => setCitizenReportModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Report Transmitted to Municipal EOC</h4>
            <p className="text-xs text-slate-400">
              Your field report has been logged with coordinates and forwarded to the Barasat Drainage Control Room.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                Municipality Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="1">Ward 1 (Nabapally North)</option>
                <option value="2">Ward 2 (Kalyani Expressway)</option>
                <option value="3">Ward 3 (Hospital Road)</option>
                <option value="4">Ward 4 (Champadali More / Jessore Rd) - ACTIVE HOTSPOT</option>
                <option value="5">Ward 5 (Barasat Junction)</option>
                <option value="6">Ward 6 (Kadamgachhi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                Street / Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="e.g. Near Pioneer College / Jessore Rd"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                Estimated Water Depth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ANKLE', label: 'Ankle (~10cm)', color: 'text-amber-400' },
                  { id: 'KNEE', label: 'Knee (~30cm)', color: 'text-rose-400' },
                  { id: 'WAIST', label: 'Waist (>50cm)', color: 'text-rose-500 font-bold' },
                ].map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setEstimatedDepth(d.id)}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono text-center transition-all ${
                      estimatedDepth === d.id
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={d.color}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                Description / Observed Drain Status
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="e.g. Storm drain blocked with debris, road impassable for two-wheelers."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-submit-citizen-report"
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-950/50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Field Report to EOC</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
