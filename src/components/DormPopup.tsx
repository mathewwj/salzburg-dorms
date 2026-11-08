import {
  Bike,
  Bus,
  ExternalLink,
  Footprints,
  GraduationCap,
  MapPin,
  TrainFront,
  CheckCircle2,
  Bath,
  Utensils,
  Sparkles,
} from 'lucide-react';
import type { Dormitory, FilterState } from '../types/dorm';
import {
  isPrivateBathroom,
  isPrivateKitchen,
  matchesProviderFilter,
  roomMatchesFilters,
  type PriceTier,
} from '../utils/dormFilters';

interface DormPopupProps {
  dorm: Dormitory;
  effectiveMinPrice: number | null;
  priceTier: PriceTier;
  filters: FilterState;
}

export default function DormPopup({
  dorm,
  effectiveMinPrice,
  priceTier,
  filters,
}: DormPopupProps) {
  const facultyCommute = dorm.commute?.faculty;
  const stationCommute = dorm.commute?.trainStation;

  return (
    <div className="w-[390px] max-h-[520px] overflow-y-auto p-4 text-slate-100 space-y-4">
      {/* Header */}
      <div className="pr-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-white leading-snug">
            {dorm.dormitoryName}
          </h3>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-bold border ${priceTier.badgeClass}`}
          >
            {effectiveMinPrice !== null ? `From €${effectiveMinPrice}` : 'On request'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span>{dorm.address}</span>
        </div>
      </div>

      {/* Commute Distances & Times (Monday 10:00 AM) */}
      {dorm.commute && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Commute Times & Distances
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
              Mon 10:00 AM
            </span>
          </div>

          {/* Destination 1: Faculty */}
          {facultyCommute && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Faculty (Jakob-Haringer-Str. 2)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {/* Walk */}
                <div className="bg-slate-950/70 rounded-md p-1.5 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Footprints className="w-3 h-3 text-emerald-400" />
                    <span>Walk</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {facultyCommute.walk.durationMin} min
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {facultyCommute.walk.distanceKm} km
                  </div>
                </div>

                {/* Bike */}
                <div className="bg-slate-950/70 rounded-md p-1.5 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Bike className="w-3 h-3 text-sky-400" />
                    <span>Bike</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {facultyCommute.bike.durationMin} min
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {facultyCommute.bike.distanceKm} km
                  </div>
                </div>

                {/* Public Transport */}
                <div className="bg-slate-950/70 rounded-md p-1.5 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Bus className="w-3 h-3 text-amber-400" />
                    <span>Transit</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {facultyCommute.transit.durationMin} min
                  </div>
                  <div
                    className="text-[10px] text-amber-300/90 truncate"
                    title={`Lines: ${facultyCommute.transit.lines.join(', ')} (${facultyCommute.transit.transfers} transfers)`}
                  >
                    {facultyCommute.transit.lines.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Destination 2: Main Train Station */}
          {stationCommute && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                <TrainFront className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Main Train Station (Salzburg Hbf)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {/* Walk */}
                <div className="bg-slate-950/70 rounded-md p-1.5 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Footprints className="w-3 h-3 text-emerald-400" />
                    <span>Walk</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {stationCommute.walk.durationMin} min
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {stationCommute.walk.distanceKm} km
                  </div>
                </div>

                {/* Bike */}
                <div className="bg-slate-950/70 rounded-md p-1.5 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Bike className="w-3 h-3 text-sky-400" />
                    <span>Bike</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {stationCommute.bike.durationMin} min
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {stationCommute.bike.distanceKm} km
                  </div>
                </div>

                {/* Public Transport */}
                <div className="bg-slate-950/70 rounded-md p-1.5 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Bus className="w-3 h-3 text-amber-400" />
                    <span>Transit</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {stationCommute.transit.durationMin} min
                  </div>
                  <div
                    className="text-[10px] text-amber-300/90 truncate"
                    title={`Lines: ${stationCommute.transit.lines.join(', ')} (${stationCommute.transit.transfers} transfers)`}
                  >
                    {stationCommute.transit.lines.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rooms & Booking Providers */}
      <div className="space-y-2.5">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Booking Options & Rooms
        </span>

        {dorm.bookingOptions.map((booking, bIdx) => {
          const providerMatches = matchesProviderFilter(booking, filters.providerFilter);
          const linkUrl = booking.sourceLinks?.applicationPortal || booking.primaryUrl;

          return (
            <div
              key={bIdx}
              className={`rounded-xl border p-3 space-y-2 ${
                providerMatches
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-slate-900/30 border-slate-800/40 opacity-55'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {booking.provider}
                  </span>
                  {booking.logistics?.acceptsSummerSemester && (
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                      Summer Sem. OK
                    </span>
                  )}
                </div>
                {linkUrl && (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {booking.rooms && booking.rooms.length > 0 ? (
                <div className="space-y-1.5">
                  {booking.rooms.map((room, rIdx) => {
                    const isMatch = roomMatchesFilters(room, filters);
                    const privBath = isPrivateBathroom(room.bathroomSetup);
                    const privKitch = isPrivateKitchen(room.kitchenSetup);

                    return (
                      <div
                        key={rIdx}
                        className={`rounded-lg p-2 border flex items-center justify-between gap-2 ${
                          isMatch
                            ? 'bg-slate-950/80 border-slate-800'
                            : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-200 truncate">
                            {room.roomType}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Bath className="w-3 h-3 text-slate-500" />
                              {privBath ? 'Private Bath' : 'Shared Bath'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Utensils className="w-3 h-3 text-slate-500" />
                              {privKitch ? 'Private Kitchen' : 'Shared Kitchen'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-white">
                            €{room.monthlyRentEur}
                            <span className="text-[10px] font-normal text-slate-400">/mo</span>
                          </div>
                          {room.depositEur != null && (
                            <div className="text-[10px] text-slate-500">
                              Dep: €{room.depositEur}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Room pricing unlisted publicly — check operator website.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Building Amenities & Facilities */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Amenities & Facilities
        </span>
        {dorm.buildingAmenities && dorm.buildingAmenities.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {dorm.buildingAmenities.map((am, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-800/90 text-slate-300 border border-slate-700/60"
              >
                <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                {am}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No specific amenities listed</p>
        )}

        {(dorm.bikeStorage || dorm.laundryFacilities) && (
          <div className="text-[11px] text-slate-400 space-y-1 pt-1">
            {dorm.bikeStorage && (
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{dorm.bikeStorage}</span>
              </div>
            )}
            {dorm.laundryFacilities && (
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{dorm.laundryFacilities}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
