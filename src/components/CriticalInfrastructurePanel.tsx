/**
 * CriticalInfrastructurePanel Component
 * Real-time operational intelligence and ingress flood risk monitoring for:
 * - Hospitals
 * - Fire Stations
 * - Police Stations
 * - Railway Stations
 * - Emergency Shelters
 * Computes: Facility Risk, Access Route Risk, and Alternative Route Availability.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  HeartPulse,
  Flame,
  Shield,
  Train,
  Home,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Navigation,
  ArrowUpRight,
  Waves,
  MapPin,
  Route,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { JaldrishtiApi } from '../services/api';
import {
  CriticalInfrastructureNode,
  CriticalInfrastructureType,
  FloodRiskLevel,
  AccessRouteRiskLevel,
} from '../types';

export const CriticalInfrastructurePanel: React.FC = () => {
  const {
    currentTimestep,
    operationMode,
    selectedInfraId,
    setSelectedInfraId,
    setRoutingModalOpen,
    setDestinationCoords,
  } = useFloodStore();

  const [selectedFilter, setSelectedFilter] = useState<CriticalInfrastructureType | 'ALL'>('ALL');

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['critical-infrastructure', currentTimestep, operationMode],
    queryFn: () => JaldrishtiApi.getCriticalInfrastructure(currentTimestep, operationMode),
  });

  const getFacilityIcon = (type: CriticalInfrastructureType) => {
    switch (type) {
      case 'HOSPITAL':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
      case 'FIRE_STATION':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'POLICE':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case 'RAILWAY':
        return <Train className="w-3.5 h-3.5 text-indigo-400" />;
      case 'EMERGENCY_SHELTER':
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRiskBadge = (risk: FloodRiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
      case 'CLOSED':
        return 'bg-rose-950 text-rose-300 border-rose-600/80';
      case 'HIGH':
        return 'bg-red-950 text-red-300 border-red-600/80';
      case 'CAUTION':
        return 'bg-amber-950 text-amber-300 border-amber-600/80';
      case 'SAFE':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-600/80';
    }
  };

  const getAccessRouteBadge = (risk: AccessRouteRiskLevel) => {
    switch (risk) {
      case 'INACCESSIBLE':
        return 'bg-purple-950 text-purple-300 border-purple-600';
      case 'COMPROMISED':
        return 'bg-rose-950 text-rose-300 border-rose-600';
      case 'SAFE':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-600';
    }
  };

  const filteredFacilities =
    facilities?.filter((f) => selectedFilter === 'ALL' || f.type === selectedFilter) || [];

  const handleRouteToFacility = (facility: CriticalInfrastructureNode) => {
    setDestinationCoords([facility.coordinates[1], facility.coordinates[0]]);
    setRoutingModalOpen(true);
  };

  return (
    <div id="critical-infrastructure-panel" className="space-y-3 text-slate-100 select-none">
      {/* Title Header */}
      <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>Critical Municipal Infrastructure</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {filteredFacilities.length} NODES
          </span>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-[9px] font-mono">
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'HOSPITAL', label: 'Hospitals' },
              { id: 'FIRE_STATION', label: 'Fire' },
              { id: 'POLICE', label: 'Police' },
              { id: 'RAILWAY', label: 'Rail' },
              { id: 'EMERGENCY_SHELTER', label: 'Shelters' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item.id)}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap border ${
                selectedFilter === item.id
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities List */}
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {filteredFacilities.map((facility) => {
          const isSelected = selectedInfraId === facility.id;

          return (
            <div
              key={facility.id}
              id={`infra-card-${facility.id}`}
              onClick={() => setSelectedInfraId(facility.id)}
              className={`p-3 rounded border transition-all space-y-2 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Name & Facility Risk */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <div className="p-1 rounded bg-slate-900 border border-slate-800 mt-0.5">
                    {getFacilityIcon(facility.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 leading-tight">
                      {facility.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ward {facility.ward_no} • Elev: {facility.elevation_m}m MSL
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getRiskBadge(
                      facility.facility_risk
                    )}`}
                  >
                    Facility: {facility.facility_risk}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                    {facility.facility_water_depth_cm} cm depth
                  </span>
                </div>
              </div>

              {/* Ingress / Access Route Assessment */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded p-2 text-[10px] font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Route className="w-3 h-3 text-cyan-400" />
                    <span>Access Route Risk:</span>
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded border ${getAccessRouteBadge(
                      facility.access_route_risk
                    )}`}
                  >
                    {facility.access_route_risk}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Ingress: {facility.access_road_name}</span>
                  <strong className="text-rose-400">{facility.access_road_predicted_depth_cm} cm</strong>
                </div>

                {/* Alternative Route Availability */}
                <div className="pt-1 border-t border-slate-800 text-slate-300 font-sans">
                  <span className="text-[9px] font-mono font-bold text-amber-400 block uppercase">
                    Alternative Route Availability:
                  </span>
                  <p className="text-[10px] leading-relaxed mt-0.5">
                    {facility.alternative_route_availability}
                  </p>
                </div>
              </div>

              {/* Operational Advisory & Action Button */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[9px] font-mono text-emerald-400 truncate max-w-[200px]">
                  {facility.operational_status}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRouteToFacility(facility);
                  }}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-[9px] font-mono flex items-center space-x-1 transition-all"
                >
                  <Navigation className="w-3 h-3 text-amber-400" />
                  <span>Route Here</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
