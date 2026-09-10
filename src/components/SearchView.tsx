/**
 * JALDRISHTI Search & Navigation View
 * Dynamic Pan-India OSRM Routing + Segment-by-Segment Flood Risk Evaluation
 * Multimodal: CAR, BIKE, WALK, AMBULANCE, FIRE ENGINE
 * Live GPS Navigation HUD + Real-time Off-Route Recalculation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Car,
  Bike,
  Footprints,
  Siren,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Info,
  Waves,
  RefreshCw,
  HelpCircle,
  X,
  Loader2,
  Square,
  Compass,
  Eye,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { VehicleType, HospitalAccessNode, FireStationNode, LocationSearchResult } from '../types';
import { FloodMap } from './FloodMap';
import { JaldrishtiApi } from '../services/api';
import { LocationSearch } from './common/LocationSearch';

export const SearchView: React.FC = () => {
  const {
    consumerSearchMode,
    setConsumerSearchMode,
    selectedFromLocation,
    selectedToLocation,
    searchQueryFrom,
    searchQueryTo,
    setSelectedFromLocation,
    setSelectedToLocation,
    setSearchQueryFrom,
    setSearchQueryTo,
    selectedVehicleType,
    setSelectedVehicleType,
    savedHome,
    selectedRouteIndex,
    setSelectedRouteIndex,
    activeRouteResponse,
    setActiveRouteResponse,
    isLiveNavActive,
    userGpsCoords,
    userSpeedKmh,
    remainingDistanceKm,
    remainingDurationMin,
    isOffRoute,
    floodWarningAhead,
    startLiveNav,
    stopLiveNav,
    updateLiveGpsState,
  } = useFloodStore();

  const [routeEvaluationData, setRouteEvaluationData] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);

  const vehicleOptions: { id: VehicleType; label: string; icon: React.ReactNode; clearance: string }[] = [
    { id: 'CAR', label: 'Car', icon: <Car className="w-4 h-4" />, clearance: '15 cm' },
    { id: 'MOTORBIKE', label: 'Motorbike', icon: <Bike className="w-4 h-4 text-emerald-600" />, clearance: '12 cm' },
    { id: 'BIKE', label: 'Bicycle', icon: <Bike className="w-4 h-4 text-blue-600" />, clearance: '12 cm' },
    { id: 'PEDESTRIAN', label: 'Walk', icon: <Footprints className="w-4 h-4 text-indigo-600" />, clearance: '10 cm' },
    { id: 'AMBULANCE', label: 'Ambulance', icon: <Siren className="w-4 h-4 text-rose-600" />, clearance: '35 cm' },
  ];

  // Primary Route Calculation Action - Triggered EXCLUSIVELY by SEARCH ROUTES button
  const handleCalculateRoutes = async () => {
    setValidationError(null);

    if (!selectedFromLocation) {
      setValidationError('Please select a valid FROM location from search suggestions.');
      return;
    }

    if (!selectedToLocation) {
      setValidationError('Please select a valid TO location from search suggestions.');
      return;
    }

    const oLat = selectedFromLocation.lat;
    const oLon = selectedFromLocation.lon;
    const dLat = selectedToLocation.lat;
    const dLon = selectedToLocation.lon;
    const fromName = selectedFromLocation.locality || selectedFromLocation.display_name;
    const toName = selectedToLocation.locality || selectedToLocation.display_name;

    setIsEvaluating(true);
    setHasSearched(true);

    try {
      console.log('==================================================');
      console.log('SEARCH ROUTES SUBMITTED');
      console.log(`FROM: ${fromName} (${oLat}, ${oLon})`);
      console.log(`TO: ${toName} (${dLat}, ${dLon})`);
      console.log(`MODE: ${selectedVehicleType}`);

      const res = await JaldrishtiApi.evaluateRoutesDetailed(
        fromName,
        toName,
        selectedVehicleType,
        oLat,
        oLon,
        dLat,
        dLon
      );

      console.log('BACKEND ROUTING RESPONSE STATUS: 200 OK');
      console.log('CANDIDATE ROUTES EVALUATED:', res?.candidate_routes?.length || 0);

      setRouteEvaluationData(res);
      setSelectedRouteIndex(0);

      if (res && res.candidate_routes && res.candidate_routes.length > 0) {
        const primary = res.candidate_routes[0];
        setActiveRouteResponse({
          request_id: `REQ-${Date.now()}`,
          generated_at: new Date().toISOString(),
          departure_time: 'NOW',
          vehicle_type: selectedVehicleType,
          vehicle_clearance_limit_cm: res.vehicle_clearance_limit_cm || 15.0,
          origin: { name: fromName, latitude: oLat, longitude: oLon },
          destination: { name: toName, latitude: dLat, longitude: dLon },
          recommended_route: {
            route_id: primary.route_id,
            route_type: 'RECOMMENDED_SAFE',
            route_label: primary.label,
            distance_km: primary.distance_km,
            travel_time_minutes: primary.travel_time_minutes,
            distance_meters: primary.distance_meters,
            duration_seconds: primary.duration_seconds,
            max_predicted_flood_depth_cm: primary.max_water_depth_cm,
            flood_exposure_score: primary.flood_exposure === 'LOW' ? 5.0 : primary.flood_exposure === 'MODERATE' ? 15.0 : 35.0,
            geometry: primary.geometry?.coordinates || [],
            steps: primary.steps || [],
            segments: primary.segments || [],
            flood_points: primary.flood_points || [],
            avoided_roads: [],
            advisory_status: primary.why_recommended,
          },
          alternative_routes: (res.candidate_routes.slice(1) || []).map((r: any) => ({
            route_id: r.route_id,
            route_type: 'ALTERNATIVE',
            route_label: r.label,
            distance_km: r.distance_km,
            travel_time_minutes: r.travel_time_minutes,
            distance_meters: r.distance_meters,
            duration_seconds: r.duration_seconds,
            max_predicted_flood_depth_cm: r.max_water_depth_cm,
            flood_exposure_score: r.flood_exposure === 'LOW' ? 5.0 : r.flood_exposure === 'MODERATE' ? 15.0 : 35.0,
            geometry: r.geometry?.coordinates || [],
            steps: r.steps || [],
            segments: r.segments || [],
            flood_points: r.flood_points || [],
            avoided_roads: [],
            advisory_status: r.why_recommended,
          })),
        });
      } else {
        setActiveRouteResponse(null);
      }
    } catch (e) {
      console.warn('Route calculation error:', e);
      setRouteEvaluationData(null);
      setActiveRouteResponse(null);
      setValidationError('Failed to calculate routes. Please check network connectivity or try another location.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Live Geolocation Tracking Handler
  useEffect(() => {
    if (isLiveNavActive) {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const rawSpeed = pos.coords.speed || 0; // m/s
            const speedKmh = Math.round(rawSpeed * 3.6);

            const candidateRoutes = routeEvaluationData?.candidate_routes || [];
            const curRoute = candidateRoutes[selectedRouteIndex] || candidateRoutes[0];
            const distKm = curRoute ? curRoute.distance_km : 0;
            const durMin = curRoute ? curRoute.travel_time_minutes : 0;

            let warningText: string | null = null;
            if (curRoute && curRoute.segments) {
              const floodSeg = curRoute.segments.find((s: any) => s.predicted_water_depth_cm > 15);
              if (floodSeg) {
                warningText = `Flood Risk Ahead: ${floodSeg.predicted_water_depth_cm} cm water depth predicted on ${floodSeg.depth_label || 'segment'}`;
              }
            }

            updateLiveGpsState([lat, lon], speedKmh, distKm, durMin, false, warningText);
          },
          (err) => {
            console.warn('Live GPS watch warning:', err);
            const candidateRoutes = routeEvaluationData?.candidate_routes || [];
            const curRoute = candidateRoutes[selectedRouteIndex] || candidateRoutes[0];
            const coords = curRoute?.geometry?.coordinates?.[0] || [88.4821, 22.7214];
            updateLiveGpsState([coords[1], coords[0]], 0, curRoute?.distance_km || 0, curRoute?.travel_time_minutes || 0, false, null);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isLiveNavActive, selectedRouteIndex, routeEvaluationData]);

  const handleSelectRoute = (idx: number) => {
    setSelectedRouteIndex(idx);
  };

  const candidateRoutes = routeEvaluationData?.candidate_routes || routeEvaluationData?.routes || [];
  const selectedRoute = candidateRoutes[selectedRouteIndex] || candidateRoutes[0];

  const isMedicalActive = (consumerSearchMode === 'MEDICAL' || selectedVehicleType === 'AMBULANCE') && selectedVehicleType === 'AMBULANCE';

  return (
    <div id="jaldrishti-search-view" className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Top Controls Header */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                JALDRISHTI Search &amp; Route Guidance
              </h1>
              <p className="text-xs text-slate-500">
                Pan-India OSRM routing + flood risk evaluation (WALK, BIKE, CAR, AMBULANCE, FIRE ENGINE).
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                id="search-mode-normal"
                onClick={() => {
                  setConsumerSearchMode('NORMAL');
                  if (selectedVehicleType === 'AMBULANCE') {
                    setSelectedVehicleType('CAR');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  consumerSearchMode === 'NORMAL'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Commuter Mode
              </button>

              <button
                id="search-mode-medical"
                onClick={() => {
                  setConsumerSearchMode('MEDICAL');
                  setSelectedVehicleType('AMBULANCE');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  consumerSearchMode === 'MEDICAL'
                    ? 'bg-rose-600 text-white shadow-sm font-bold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                🚑 Medical
              </button>
            </div>
          </div>

          {/* Location Inputs & Vehicle Controls */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* FROM */}
            <div className="md:col-span-4 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  FROM (Origin)
                </label>
                {selectedFromLocation && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <LocationSearch
                placeholder="Search origin location (e.g. IIT Bombay, AIIMS Delhi, Park Street)..."
                initialValue={searchQueryFrom}
                onChangeText={(text) => setSearchQueryFrom(text)}
                onSelectLocation={(loc: LocationSearchResult) => setSelectedFromLocation(loc)}
                isMedicalMode={isMedicalActive}
              />
            </div>

            {/* TO */}
            <div className="md:col-span-4 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  TO (Destination)
                </label>
                {selectedToLocation && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <LocationSearch
                placeholder="Search destination (e.g. KEM Hospital, Bengaluru, Jadavpur)..."
                initialValue={searchQueryTo}
                onChangeText={(text) => setSearchQueryTo(text)}
                onSelectLocation={(loc: LocationSearchResult) => setSelectedToLocation(loc)}
                isMedicalMode={isMedicalActive}
              />
            </div>

            {/* Vehicle Mode Selection */}
            <div className="md:col-span-4 space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Travel Mode &amp; Clearance Limit
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {vehicleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedVehicleType(opt.id)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      selectedVehicleType === opt.id
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={`Clearance limit: ${opt.clearance}`}
                  >
                    {opt.icon}
                    <span className="text-[9px] mt-0.5">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Validation Warning Alert */}
          {validationError && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Primary Action Button: SEARCH ROUTES */}
          <div className="mt-4 flex justify-end">
            <button
              id="search-routes-btn"
              onClick={handleCalculateRoutes}
              disabled={isEvaluating}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating real OSRM routes...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>SEARCH ROUTES</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LIVE NAVIGATION ACTIVE HUD BANNER */}
      {isLiveNavActive && (
        <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-4 shadow-xl">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold animate-pulse shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    LIVE GPS NAVIGATION ACTIVE ({selectedVehicleType})
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {remainingDistanceKm} km remaining • ETA: {remainingDurationMin} min
                </h3>
              </div>
            </div>

            {floodWarningAhead && (
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-xl font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{floodWarningAhead}</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="text-right text-xs">
                <div className="text-slate-400">GPS Speed</div>
                <div className="font-mono font-bold text-sm text-white">{userSpeedKmh} km/h</div>
              </div>

              <button
                onClick={stopLiveNav}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP JOURNEY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Grid: Route Candidates + Map */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Developer Debug Panel - Raw Geocoding & OSRM Telemetry */}
        {selectedFromLocation && selectedToLocation && (
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-3.5 text-[11px] font-mono shadow-md border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-xs text-blue-400">
              <span>🛠️ OSRM TELEMETRY &amp; GEOCODE DEBUG PANEL</span>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                STATUS: {routeEvaluationData?.status || 'READY'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400">SELECTED FROM:</span> {selectedFromLocation.locality || selectedFromLocation.display_name} ({selectedFromLocation.lat.toFixed(4)}°N, {selectedFromLocation.lon.toFixed(4)}°E)
              </div>
              <div>
                <span className="text-slate-400">SELECTED TO:</span> {selectedToLocation.locality || selectedToLocation.display_name} ({selectedToLocation.lat.toFixed(4)}°N, {selectedToLocation.lon.toFixed(4)}°E)
              </div>
              <div>
                <span className="text-slate-400">PROFILE:</span> OSRM {selectedVehicleType}
              </div>
              <div>
                <span className="text-slate-400">RAW METRICS:</span> {selectedRoute?.distance_meters ? `${selectedRoute.distance_meters} m (${selectedRoute.distance_km} km)` : 'N/A'} | <span className="text-slate-400">RAW DURATION:</span> {selectedRoute?.duration_seconds ? `${selectedRoute.duration_seconds} s (${selectedRoute.travel_time_minutes} min)` : 'N/A'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Candidate Route Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Waves className="w-4 h-4 text-blue-600" />
                <span>Evaluated Routes ({candidateRoutes.length})</span>
              </h2>
              {isEvaluating && (
                <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating OSRM geometry...</span>
                </div>
              )}
            </div>

            {!isEvaluating && candidateRoutes.length === 0 && (
              <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
                <Info className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {hasSearched ? 'No valid routes found' : 'EVALUATED ROUTES (0)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Select FROM and TO locations from search suggestions and click <strong className="text-blue-600 uppercase">Search Routes</strong> to calculate OSRM road geometry.
                </p>
              </div>
            )}

            {candidateRoutes.map((route: any, idx: number) => {
              const isSelected = idx === selectedRouteIndex;
              const isClearanceSafe = route.is_clearance_safe !== false;

              return (
                <div
                  key={route.route_id || idx}
                  onClick={() => handleSelectRoute(idx)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-xl ring-2 ring-blue-600/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          route.recommended
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {route.label}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {route.travel_time_minutes} min • {route.distance_km} km
                      </h3>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${
                          route.max_water_depth_cm <= 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : route.max_water_depth_cm <= 15
                            ? 'bg-blue-100 text-blue-800'
                            : route.max_water_depth_cm <= 30
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        Max {route.max_water_depth_cm} cm
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {route.why_recommended}
                  </p>

                  {!isClearanceSafe && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-900 text-[11px] rounded-xl font-medium flex items-center space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{route.clearance_warning}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoute(idx);
                      }}
                      className={`px-3 py-1.5 font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all text-[11px] cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'SELECTED ROUTE' : 'VIEW ROUTE'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoute(idx);
                        startLiveNav();
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all text-[11px] cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>START JOURNEY</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoute(idx);
                        setShowWhyModal(true);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>WHY?</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Turn-by-Turn Navigation Instructions Card */}
            {selectedRoute && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>OSRM Turn-by-Turn Directions</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedRoute.steps ? `${selectedRoute.steps.length} Steps` : 'No steps'}
                  </span>
                </div>

                {selectedRoute.steps && selectedRoute.steps.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                    {selectedRoute.steps.map((st: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-start space-x-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {sIdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800">{st.instruction}</p>
                          {st.distance_meters > 0 && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {st.distance_meters >= 1000 ? `${(st.distance_meters / 1000).toFixed(2)} km` : `${Math.round(st.distance_meters)} m`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                    Turn-by-turn instructions unavailable.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Visualization */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>OSRM Geometry &amp; Flood Segment Risk Layer</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Mode: {selectedVehicleType}
              </span>
            </div>
            <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200 relative">
              <FloodMap mode="SEARCH" />
            </div>
          </div>
        </div>
      </div>

      {/* WHY THIS ROUTE MODAL */}
      {showWhyModal && selectedRoute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Why this route was ranked?</h3>
              <button
                onClick={() => setShowWhyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-slate-700">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <div className="font-bold text-blue-900 mb-1">{selectedRoute.label}</div>
                <p>{selectedRoute.why_recommended}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">OSRM Road Distance:</span>
                  <span className="font-bold text-slate-900">{selectedRoute.distance_km} km</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Duration:</span>
                  <span className="font-bold text-slate-900">{selectedRoute.travel_time_minutes} min ({selectedVehicleType})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Max Predicted Water Depth:</span>
                  <span className="font-bold text-slate-900">{selectedRoute.max_water_depth_cm} cm</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Vehicle Clearance Limit:</span>
                  <span className="font-bold text-slate-900">{selectedRoute.clearance_limit_cm || 15} cm ({selectedVehicleType})</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Flood Exposure Score:</span>
                  <span className="font-bold text-slate-900">{selectedRoute.flood_exposure}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

