/**
 * SafeRoutingModal Component
 * Flood-Safe Routing Engine UI
 * Inputs: FROM, TO, VEHICLE TYPE, DEPARTURE TIME, CALCULATE SAFE ROUTE
 * Output: ROUTE A (RECOMMENDED), ROUTE B, ROUTE C with Travel Time, Flood Exposure, Maximum Flood Depth, Roads Avoided.
 * Disclaimer: "Route recommendation is based on the latest available flood forecast."
 */

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Navigation,
  Shield,
  Clock,
  Waves,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Truck,
  Car,
  Flame,
  User,
  ShieldAlert,
  X,
  ArrowRight,
  Route,
  AlertOctagon,
  Info,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import { VehicleType, SafeRouteRequest, SafeRouteResponse, RouteOption } from '../types';

export const SafeRoutingModal: React.FC = () => {
  const {
    routingModalOpen,
    setRoutingModalOpen,
    selectedVehicleType,
    setSelectedVehicleType,
    currentTimestep,
    activeRouteResponse,
    setActiveRouteResponse,
    isCalculatingRoute,
    setIsCalculatingRoute,
  } = useFloodStore();

  const [fromPreset, setFromPreset] = useState<string>('FIRE_STATION');
  const [toPreset, setToPreset] = useState<string>('DISTRICT_HOSPITAL');
  const [departureTime, setDepartureTime] = useState<string>('NOW');
  const [selectedRouteTab, setSelectedRouteTab] = useState<string>('RT-A-SAFE-01');

  // Predefined Barasat Critical Hubs
  const presets: Record<string, { name: string; lat: number; lon: number }> = {
    FIRE_STATION: { name: 'Central Fire & Rescue Station (Ward 4)', lat: 22.7195, lon: 88.4815 },
    DISTRICT_HOSPITAL: { name: 'Govt Medical College & District Hospital (Ward 1)', lat: 22.7265, lon: 88.4785 },
    CHAMPADALI_MORE: { name: 'Champadali Bus Stand Hub (Ward 4)', lat: 22.7180, lon: 88.4845 },
    BARASAT_STN: { name: 'Barasat Railway Junction Gate (Ward 7)', lat: 22.7240, lon: 88.4870 },
    SETHPUKUR_HUB: { name: 'Sethpukur Relief Health Centre (Ward 33)', lat: 22.7275, lon: 88.4895 },
    STADIUM_SHELTER: { name: 'Barasat Stadium Emergency Shelter (Ward 14)', lat: 22.7150, lon: 88.4860 },
    NABAPALLY_MORE: { name: 'Nabapally Co-operative Junction (Ward 22)', lat: 22.7090, lon: 88.4910 },
  };

  const vehicleOptions: { type: VehicleType; label: string; icon: React.ReactNode; clearance: string }[] = [
    { type: 'AMBULANCE', label: 'AMBULANCE', icon: <Truck className="w-3.5 h-3.5" />, clearance: '20 cm clearance' },
    { type: 'POLICE', label: 'POLICE', icon: <ShieldAlert className="w-3.5 h-3.5" />, clearance: '15 cm clearance' },
    { type: 'BUS', label: 'BUS', icon: <Truck className="w-3.5 h-3.5" />, clearance: '25 cm clearance' },
    { type: 'CAR', label: 'CAR', icon: <Car className="w-3.5 h-3.5" />, clearance: '10 cm clearance' },
    { type: 'PEDESTRIAN', label: 'PEDESTRIAN', icon: <User className="w-3.5 h-3.5" />, clearance: '5 cm clearance' },
  ];

  const departureOptions = ['NOW', '+15 min', '+30 min', '+45 min', '+60 min'];

  const calculateRouteMutation = useMutation({
    mutationFn: async () => {
      setIsCalculatingRoute(true);
      const origin = presets[fromPreset];
      const dest = presets[toPreset];

      const req: SafeRouteRequest = {
        origin: { latitude: origin.lat, longitude: origin.lon },
        destination: { latitude: dest.lat, longitude: dest.lon },
        vehicle_type: selectedVehicleType,
        departure_time: departureTime,
        forecast_horizon_min: currentTimestep,
      };

      return await JaldrishtiApi.calculateSafeRoute(req);
    },
    onSuccess: (data: SafeRouteResponse) => {
      setActiveRouteResponse(data);
      setSelectedRouteTab(data.recommended_route.route_id);
      setIsCalculatingRoute(false);
    },
    onError: () => {
      setIsCalculatingRoute(false);
    },
  });

  if (!routingModalOpen) return null;

  const allRoutes: RouteOption[] = activeRouteResponse
    ? [activeRouteResponse.recommended_route, ...(activeRouteResponse.alternative_routes || [])]
    : [];

  const activeDisplayRoute =
    allRoutes.find((r) => r.route_id === selectedRouteTab) || activeRouteResponse?.recommended_route;

  return (
    <div
      id="safe-routing-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        id="safe-routing-modal"
        className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Flood-Safe Emergency Routing Engine
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Multi-objective optimization: Travel Time + Flood Risk + Water Depth + Road Closures
              </p>
            </div>
          </div>
          <button
            onClick={() => setRoutingModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-slate-100">
          {/* Inputs Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
            {/* FROM & TO */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-emerald-400 font-bold flex items-center space-x-1 uppercase">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>FROM (Origin)</span>
                </label>
                <select
                  id="route-input-from"
                  value={fromPreset}
                  onChange={(e) => setFromPreset(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  {Object.entries(presets).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-rose-400 font-bold flex items-center space-x-1 uppercase">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>TO (Destination)</span>
                </label>
                <select
                  id="route-input-to"
                  value={toPreset}
                  onChange={(e) => setToPreset(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  {Object.entries(presets).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* VEHICLE TYPE */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-bold uppercase block">
                VEHICLE TYPE (Flood Clearance Profile)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {vehicleOptions.map((opt) => (
                  <button
                    key={opt.type}
                    id={`vehicle-opt-${opt.type.toLowerCase()}`}
                    onClick={() => setSelectedVehicleType(opt.type)}
                    className={`p-2 rounded border text-center transition-all font-mono text-[10px] ${
                      selectedVehicleType === opt.type
                        ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-center mb-1">{opt.icon}</div>
                    <span className="block truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DEPARTURE TIME */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 font-bold uppercase flex items-center space-x-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>DEPARTURE TIME</span>
              </label>
              <div className="flex items-center space-x-1.5">
                {departureOptions.map((timeOpt) => (
                  <button
                    key={timeOpt}
                    onClick={() => setDepartureTime(timeOpt)}
                    className={`px-3 py-1 rounded text-xs font-mono border transition-all ${
                      departureTime === timeOpt
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {timeOpt}
                  </button>
                ))}
              </div>
            </div>

            {/* CALCULATE SAFE ROUTE BUTTON */}
            <button
              id="btn-calculate-safe-route"
              onClick={() => calculateRouteMutation.mutate()}
              disabled={isCalculatingRoute}
              className="w-full py-2.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>
                {isCalculatingRoute ? 'COMPUTING SAFE CORRIDOR...' : 'CALCULATE SAFE ROUTE'}
              </span>
            </button>
          </div>

          {/* ROUTE RESULTS */}
          {activeRouteResponse && activeDisplayRoute && (
            <div id="route-results-section" className="space-y-3">
              {/* Route Alternative Selector Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-0.5">
                {allRoutes.map((route, idx) => {
                  const isRec = route.route_type === 'RECOMMENDED_SAFE';
                  const isDanger = route.route_type === 'SHORTEST_UNCONSTRAINED';
                  const isSelected = route.route_id === activeDisplayRoute.route_id;

                  return (
                    <button
                      key={route.route_id}
                      onClick={() => setSelectedRouteTab(route.route_id)}
                      className={`px-3 py-1.5 rounded text-xs font-mono border flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                        isSelected
                          ? isRec
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                            : isDanger
                            ? 'bg-rose-950 text-rose-300 border-rose-500 font-bold'
                            : 'bg-indigo-950 text-indigo-300 border-indigo-500 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>
                        ROUTE {String.fromCharCode(65 + idx)}
                      </span>
                      {isRec && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-800/80 text-emerald-100 font-black">
                          RECOMMENDED
                        </span>
                      )}
                      {isDanger && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-800/80 text-rose-100 font-black">
                          FLOODED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Route Detailed Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-100 uppercase">
                      {activeDisplayRoute.route_label}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Distance: {activeDisplayRoute.distance_km} km • Multi-objective optimal
                    </span>
                  </div>
                  {activeDisplayRoute.route_type === 'RECOMMENDED_SAFE' && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded">
                      RECOMMENDED SAFE
                    </span>
                  )}
                </div>

                {/* 4 Essential Metrics */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Travel Time</span>
                    <strong className="text-base text-cyan-300">
                      {activeDisplayRoute.travel_time_minutes} min
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Flood Exposure</span>
                    <strong
                      className={`text-base ${
                        activeDisplayRoute.flood_exposure_score > 50
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {activeDisplayRoute.flood_exposure_score}/100
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Maximum Flood Depth
                    </span>
                    <strong
                      className={`text-base ${
                        activeDisplayRoute.max_predicted_flood_depth_cm > 15
                          ? 'text-rose-400'
                          : 'text-amber-300'
                      }`}
                    >
                      {activeDisplayRoute.max_predicted_flood_depth_cm} cm
                    </strong>
                  </div>
                </div>

                {/* Roads Avoided */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-slate-300">
                    <span className="flex items-center space-x-1 text-rose-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Roads Avoided ({activeDisplayRoute.avoided_roads.length})</span>
                    </span>
                    <span className="text-[9px] text-slate-400">
                      Bypassed due to depth &gt; clearance limit
                    </span>
                  </div>

                  {activeDisplayRoute.avoided_roads.length > 0 ? (
                    <div className="space-y-1">
                      {activeDisplayRoute.avoided_roads.map((ar) => (
                        <div
                          key={ar.segment_id}
                          className="bg-slate-900/90 border border-slate-800 p-2 rounded text-[10px] font-mono flex items-center justify-between"
                        >
                          <div>
                            <strong className="text-slate-200 block">{ar.road_name}</strong>
                            <span className="text-slate-400 text-[9px]">{ar.reason_avoided}</span>
                          </div>
                          <span className="text-rose-400 font-bold px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">
                            {ar.predicted_flood_depth_cm} cm
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                      No dangerous roads avoided (Direct unconstrained path traversed through flooded zone).
                    </div>
                  )}
                </div>

                {/* Segments Summary */}
                {activeDisplayRoute.segments && activeDisplayRoute.segments.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Route Segments &amp; Depths:
                    </span>
                    <div className="space-y-1">
                      {activeDisplayRoute.segments.map((seg) => (
                        <div
                          key={seg.segment_id}
                          className="flex items-center justify-between text-[9px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800/70"
                        >
                          <span className="text-slate-300">{seg.road_name}</span>
                          <span
                            className={
                              seg.predicted_flood_depth_cm > 15 ? 'text-rose-400 font-bold' : 'text-emerald-400'
                            }
                          >
                            {seg.predicted_flood_depth_cm} cm depth
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mandatory Disclaimer */}
                <div
                  id="route-safety-disclaimer"
                  className="mt-2 bg-amber-950/40 border border-amber-800/60 p-2 rounded text-center text-[10px] font-mono text-amber-300"
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span>
                      &ldquo;Route recommendation is based on the latest available flood forecast.&rdquo;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-400">
            Smart City Emergency Operations Center • Barasat GIS
          </span>
          <button
            onClick={() => setRoutingModalOpen(false)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded text-slate-200 transition-colors"
          >
            Apply to Digital Twin Map
          </button>
        </div>
      </div>
    </div>
  );
};

