/**
 * LayerControl Component
 * Interactive GIS Layer Visibility & Opacity Toggle Matrix
 */

import React from 'react';
import {
  Layers,
  MapPin,
  Waves,
  CloudRain,
  GitBranch,
  Building2,
  Navigation,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';
import { useFloodStore } from '../store/useFloodStore';
import { MapLayerVisibility } from '../types';

export const LayerControl: React.FC = () => {
  const { layers, toggleLayer } = useFloodStore();

  const layerItems: {
    key: keyof MapLayerVisibility;
    label: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
  }[] = [
    {
      key: 'floodDepth',
      label: 'Flood Inundation Depth',
      description: '2D surface water depth choropleth (0-60+ cm)',
      icon: <Waves className="w-3.5 h-3.5" />,
      colorClass: 'text-rose-400',
    },
    {
      key: 'floodExtent',
      label: 'Flood Hazard Extent',
      description: 'Dynamic runoff boundary polygons',
      icon: <Flame className="w-3.5 h-3.5" />,
      colorClass: 'text-amber-400',
    },
    {
      key: 'rainfall',
      label: 'Doppler Radar Precipitation',
      description: '250m grid nowcast rainfall intensity',
      icon: <CloudRain className="w-3.5 h-3.5" />,
      colorClass: 'text-cyan-400',
    },
    {
      key: 'drainageNetwork',
      label: '1D Storm Drainage Network',
      description: 'Underground conduit pipes & culverts',
      icon: <GitBranch className="w-3.5 h-3.5" />,
      colorClass: 'text-indigo-400',
    },
    {
      key: 'drainageStress',
      label: 'Surcharge & Bottlenecks',
      description: 'Conduits exceeding 100% capacity',
      icon: <Flame className="w-3.5 h-3.5" />,
      colorClass: 'text-purple-400',
    },
    {
      key: 'roads',
      label: 'Road Network & Arterials',
      description: 'Jessore Rd, NH-12, Taki Rd corridors',
      icon: <MapPin className="w-3.5 h-3.5" />,
      colorClass: 'text-slate-300',
    },
    {
      key: 'criticalInfra',
      label: 'Critical Infrastructure',
      description: 'Hospitals, Fire Stn, Medical Colleges, Rail',
      icon: <Building2 className="w-3.5 h-3.5" />,
      colorClass: 'text-emerald-400',
    },
    {
      key: 'safeRoutes',
      label: 'Emergency Safe Mobility',
      description: 'Calculated green evacuation corridors',
      icon: <Navigation className="w-3.5 h-3.5" />,
      colorClass: 'text-amber-300',
    },
  ];

  return (
    <div
      id="gis-layer-control"
      className="bg-slate-900/90 border border-slate-800 rounded p-2.5 text-slate-100 select-none"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          <Layers className="w-3.5 h-3.5" />
          <span>GIS Digital Twin Layers</span>
        </div>
        <span className="text-[9px] font-mono text-slate-400">
          {Object.values(layers).filter(Boolean).length}/{layerItems.length} ACTIVE
        </span>
      </div>

      <div className="space-y-1">
        {layerItems.map((item) => {
          const isActive = layers[item.key];
          return (
            <button
              key={item.key}
              id={`layer-toggle-${item.key}`}
              onClick={() => toggleLayer(item.key)}
              className={`w-full flex items-center justify-between p-1.5 rounded text-left transition-colors font-mono text-[11px] ${
                isActive
                  ? 'bg-slate-950/80 border border-slate-700/80 text-slate-100'
                  : 'bg-slate-950/30 border border-slate-800/40 text-slate-500 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={isActive ? item.colorClass : 'text-slate-600'}>
                  {item.icon}
                </span>
                <div>
                  <span className="font-semibold block leading-tight">{item.label}</span>
                  <span className="text-[9px] text-slate-400 font-sans block">
                    {item.description}
                  </span>
                </div>
              </div>

              <div className="pl-2">
                {isActive ? (
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
