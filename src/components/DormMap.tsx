import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type {
  DestinationPOI,
  Dormitory,
  FilterState,
  SupermarketPOI,
} from '../types/dorm';
import {
  PRICE_TIERS,
  type EvaluatedDorm,
} from '../utils/dormFilters';
import DormPopup from './DormPopup';

interface DormMapProps {
  evaluatedDorms: EvaluatedDorm[];
  destinations: DestinationPOI[];
  supermarkets: SupermarketPOI[];
  filters: FilterState;
  selectedDormName: string | null;
  onSelectDorm: (dormName: string | null) => void;
}

// Helper component to fly to a selected dorm and handle map size invalidation when panel toggles
function MapSelectionController({
  selectedDorm,
}: {
  selectedDorm: Dormitory | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    // Allow flexbox layout to settle when the left detail panel opens/closes
    const timer = setTimeout(() => {
      map.invalidateSize({ pan: false });
      if (selectedDorm?.coordinates) {
        const { lat, lng } = selectedDorm.coordinates;
        map.panTo([lat, lng], { animate: true, duration: 0.4 });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [selectedDorm, map]);

  useMapEvents({
    click: () => {
      // Optional: keep panel open or allow map drag freely
    },
  });

  return null;
}

function createDormIcon(item: EvaluatedDorm, isSelected: boolean): L.DivIcon {
  const { effectiveMinPrice, priceTier } = item;
  const priceLabel = effectiveMinPrice !== null ? `€${effectiveMinPrice}` : 'N/A';
  const scaleStyle = isSelected
    ? 'transform: scale(1.22); box-shadow: 0 0 0 3px #ffffff, 0 0 18px rgba(59,130,246,0.9), 0 8px 20px rgba(0,0,0,0.85); z-index: 1000;'
    : 'box-shadow: 0 4px 10px rgba(0,0,0,0.6);';

  const html = `
    <div style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 8px;
      border-radius: 9999px;
      background-color: ${priceTier.bgHex};
      color: ${priceTier.textHex};
      border: 2px solid ${priceTier.borderHex};
      font-weight: 800;
      font-size: 11px;
      line-height: 1;
      white-space: nowrap;
      transition: transform 0.15s ease;
      cursor: pointer;
      ${scaleStyle}
    ">
      ${priceLabel}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-dorm-marker',
    iconSize: [52, 24],
    iconAnchor: [26, 12],
  });
}

function createDestinationIcon(dest: DestinationPOI): L.DivIcon {
  const isFaculty = dest.category === 'faculty';
  const bg = isFaculty ? '#4f46e5' : '#0284c7'; // indigo-600 vs sky-600
  const border = isFaculty ? '#a5b4fc' : '#7dd3fc';
  const badgeText = isFaculty ? '🎓 Faculty (Techno-Z)' : '🚆 Salzburg Hbf';

  const html = `
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 8px;
      background-color: ${bg};
      color: #ffffff;
      border: 2px solid ${border};
      font-weight: 700;
      font-size: 11px;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: 0 0 16px ${bg}99, 0 4px 12px rgba(0,0,0,0.7);
    ">
      <span>${badgeText}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-destination-marker',
    iconSize: [130, 28],
    iconAnchor: [65, 14],
    popupAnchor: [0, -14],
  });
}

function createSupermarketIcon(brand: SupermarketPOI['brand']): L.DivIcon {
  let bg = '#334155';
  let fg = '#cbd5e1';
  let border = '#475569';
  let symbol = '🛒';

  switch (brand) {
    case 'Spar':
      bg = '#064e3b';
      fg = '#6ee7b7';
      border = '#059669';
      symbol = '🌲';
      break;
    case 'Billa':
      bg = '#78350f';
      fg = '#fde047';
      border = '#d97706';
      symbol = 'B';
      break;
    case 'Hofer':
      bg = '#1e3a8a';
      fg = '#93c5fd';
      border = '#3b82f6';
      symbol = 'H';
      break;
    case 'Lidl':
      bg = '#1e3a8a';
      fg = '#fef08a';
      border = '#eab308';
      symbol = 'L';
      break;
    case 'Penny':
      bg = '#7f1d1d';
      fg = '#fca5a5';
      border = '#dc2626';
      symbol = 'P';
      break;
    case 'Bio':
      bg = '#14532d';
      fg = '#86efac';
      border = '#22c55e';
      symbol = '🌿';
      break;
  }

  const html = `
    <div class="poi-non-interactive" style="
      width: 18px;
      height: 18px;
      border-radius: 5px;
      background-color: ${bg};
      color: ${fg};
      border: 1px solid ${border};
      opacity: 0.52;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 800;
      pointer-events: none;
    ">
      ${symbol}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'poi-non-interactive',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function DormMap({
  evaluatedDorms,
  destinations,
  supermarkets,
  filters,
  selectedDormName,
  onSelectDorm,
}: DormMapProps) {
  const visibleDorms = useMemo(
    () => evaluatedDorms.filter((d) => d.matches && d.dorm.coordinates),
    [evaluatedDorms]
  );

  const selectedEvaluated = useMemo(
    () => evaluatedDorms.find((d) => d.dorm.dormitoryName === selectedDormName),
    [evaluatedDorms, selectedDormName]
  );

  return (
    <div className="flex flex-1 h-screen min-w-0 bg-slate-950 overflow-hidden">
      {/* Map Canvas */}
      <div className="relative flex-1 h-screen min-w-0">
        <MapContainer
          center={[47.802, 13.048]}
          zoom={14}
          className="w-full h-full z-0"
          zoomControl={true}
        >
          {/* Clean Minimalistic Dark Canvas Basemap (ArcGIS Dark Gray Canvas) */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16}
            maxZoom={19}
          />
          {/* Subtle minimal street/neighborhood reference labels on top */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16}
            maxZoom={19}
            opacity={0.65}
          />

          <MapSelectionController selectedDorm={selectedEvaluated?.dorm} />

          {/* Background Non-Clickable Supermarkets Layer */}
          {filters.showSupermarkets &&
            supermarkets.map((sm) => (
              <Marker
                key={sm.id}
                position={[sm.lat, sm.lng]}
                icon={createSupermarketIcon(sm.brand)}
                interactive={false}
                keyboard={false}
                zIndexOffset={-500}
              />
            ))}

          {/* Key Destination Markers (Faculty & Main Train Station) */}
          {destinations.map((dest) => (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createDestinationIcon(dest)}
              zIndexOffset={800}
            >
              <Popup>
                <div className="p-3.5 text-slate-100 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    {dest.category === 'faculty' ? 'University Faculty' : 'Transit Hub'}
                  </div>
                  <div className="text-sm font-bold text-white">{dest.name}</div>
                  <div className="text-xs text-slate-400">{dest.address}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Interactive Price-Colored Dormitory Markers */}
          {visibleDorms.map((item) => {
            const { dorm } = item;
            const coords = dorm.coordinates!;
            const isSelected = dorm.dormitoryName === selectedDormName;

            return (
              <Marker
                key={dorm.dormitoryName}
                position={[coords.lat, coords.lng]}
                icon={createDormIcon(item, isSelected)}
                zIndexOffset={isSelected ? 1000 : 200}
                eventHandlers={{
                  click: () => onSelectDorm(dorm.dormitoryName),
                }}
              />
            );
          })}
        </MapContainer>

        {/* Floating Legend Overlay */}
        <div className="absolute bottom-6 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl text-xs text-slate-200 space-y-2.5 max-w-xs pointer-events-auto">
          <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
            Dorm Monthly Rent Color
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {Object.entries(PRICE_TIERS).map(([key, tier]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border"
                  style={{
                    backgroundColor: tier.bgHex,
                    borderColor: tier.borderHex,
                  }}
                />
                <span className="text-[11px] text-slate-300">{tier.rangeText}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
              Map POIs
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
              <span className="px-1.5 py-0.5 rounded bg-indigo-600/80 text-white font-semibold">
                🎓 Faculty
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-600/80 text-white font-semibold">
                🚆 Hbf
              </span>
            </div>
            {filters.showSupermarkets && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                  🌲
                </span>
                <span>Spar</span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-950 text-yellow-300 border border-amber-700 font-bold">
                  B
                </span>
                <span>Billa</span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-950 text-blue-300 border border-blue-700 font-bold">
                  H
                </span>
                <span>Hofer</span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-950 text-yellow-200 border border-yellow-600 font-bold">
                  L
                </span>
                <span>Lidl</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right-Hand Side Detail Panel (summoned when a dorm is clicked) */}
      {selectedEvaluated && (
        <DormPopup
          dorm={selectedEvaluated.dorm}
          effectiveMinPrice={selectedEvaluated.effectiveMinPrice}
          priceTier={selectedEvaluated.priceTier}
          filters={filters}
          onClose={() => onSelectDorm(null)}
        />
      )}
    </div>
  );
}
