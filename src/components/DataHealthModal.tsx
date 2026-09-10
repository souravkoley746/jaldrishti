/**
 * JALDRISHTI - DATA HEALTH & INGESTION TELEMETRY
 * Status for every source: LIVE | STALE | DEGRADED | DATA_UNAVAILABLE
 * Detailed tracking of Radar, Rain Gauges, SWMM GIS, DEM, IoT Water Level Sensors, NWP Weather
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  ShieldCheck,
  Search,
  Activity,
  Layers,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { DataFeedSourceHealth, DataHealthStatus } from '../types';

export const DataHealthModal: React.FC = () => {
  const { dataHealthOpen, setDataHealthOpen } = useFloodStore();
  const [sources, setSources] = useState<DataFeedSourceHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchFeeds = () => {
    setLoading(true);
    JaldrishtiApi.getDataHealthFeeds().then((res) => {
      setSources(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (dataHealthOpen) {
      fetchFeeds();
    }
  }, [dataHealthOpen]);

  if (!dataHealthOpen) return null;

  const filteredSources = sources.filter((src) => {
    const matchesFilter = filter === 'ALL' || src.status === filter;
    const matchesSearch =
      src.source_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.source_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: DataHealthStatus) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </span>
        );
      case 'STALE':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>STALE</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>DEGRADED</span>
          </span>
        );
      case 'DATA_UNAVAILABLE':
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>DATA_UNAVAILABLE</span>
          </span>
        );
    }
  };

  const liveCount = sources.filter((s) => s.status === 'LIVE').length;
  const staleCount = sources.filter((s) => s.status === 'STALE').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Real-Time Data Ingestion & Feed Health
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 rounded uppercase">
                  {liveCount}/{sources.length} FEEDS LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-source telemetry health matrix covering radar, IoT rain gauges, SWMM sewer GIS, and micro-DEM.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchFeeds}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Feeds"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => setDataHealthOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {(['ALL', 'LIVE', 'STALE', 'DEGRADED', 'DATA_UNAVAILABLE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  filter === st
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search feed name or protocol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center font-mono text-slate-400">
              <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Auditing live sensor feeds and telemetry sockets...
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No data feeds matching current filter.
            </div>
          ) : (
            filteredSources.map((src) => (
              <div
                key={src.source_id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {src.source_id}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {src.source_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {src.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                    <span>Protocol: <strong className="text-slate-300">{src.protocol}</strong></span>
                    <span>•</span>
                    <span>Sync: <strong className="text-indigo-300">{src.frequency}</strong></span>
                    <span>•</span>
                    <span>Latency: <strong className="text-emerald-400">{src.latency_ms} ms</strong></span>
                    <span>•</span>
                    <span>Packet Loss: <strong className={src.packet_loss_pct > 0.5 ? 'text-amber-400' : 'text-emerald-400'}>{src.packet_loss_pct}%</strong></span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/80">
                  {getStatusBadge(src.status)}
                  <span className="text-[10px] font-mono text-slate-500 mt-1">
                    Updated: {src.last_updated}
                  </span>
                  {src.failover_active && (
                    <span className="text-[9px] font-mono text-amber-400 mt-0.5 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                      NWP FAILOVER ACTIVE
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Telemetry Protocol: WMO-GRIB2, MQTT, LoRaWAN, CoAP & PostGIS</span>
          <button
            onClick={() => setDataHealthOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Close Feed Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
