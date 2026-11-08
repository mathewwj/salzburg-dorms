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
  X,
  Info,
  CalendarClock,
  ReceiptEuro,
} from 'lucide-react';
import type { Dormitory, FilterState } from '../types/dorm';
import {
  isPrivateBathroom,
  isPrivateKitchen,
  matchesProviderFilter,
  roomMatchesFilters,
  type PriceTier,
} from '../utils/dormFilters';

interface DormDetailPanelProps {
  dorm: Dormitory;
  effectiveMinPrice: number | null;
  priceTier: PriceTier;
  filters: FilterState;
  onClose: () => void;
}

export default function DormPopup({
  dorm,
  effectiveMinPrice,
  priceTier,
  filters,
  onClose,
}: DormDetailPanelProps) {
  const facultyCommute = dorm.commute?.faculty;
  const stationCommute = dorm.commute?.trainStation;

  return (
    <aside className="w-[410px] shrink-0 h-screen bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col z-[500] shadow-2xl text-slate-100 select-text">
      {/* Sticky Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold border ${priceTier.badgeClass}`}
            >
              {effectiveMinPrice !== null ? `From €${effectiveMinPrice}/mo` : 'On request'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {priceTier.label}
            </span>
          </div>
          <h2 className="font-bold text-lg text-white leading-snug mt-1.5">
            {dorm.dormitoryName}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span>{dorm.address}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/70 transition-colors cursor-pointer shrink-0"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Commute Distances & Times (Monday 10:00 AM) */}
        {dorm.commute && (
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Commute Times & Distances
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 font-medium">
                Mon 10:00 AM
              </span>
            </div>

            {/* Destination 1: Faculty */}
            {facultyCommute && (
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Faculty (Jakob-Haringer-Str. 2)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* Walk */}
                  <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Walk</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {facultyCommute.walk.durationMin} min
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {facultyCommute.walk.distanceKm} km
                    </div>
                  </div>

                  {/* Bike */}
                  <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                      <Bike className="w-3.5 h-3.5 text-sky-400" />
                      <span>Bike</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {facultyCommute.bike.durationMin} min
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {facultyCommute.bike.distanceKm} km
                    </div>
                  </div>

                  {/* Public Transport */}
                  <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                      <Bus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transit</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {facultyCommute.transit.durationMin} min
                    </div>
                    <div
                      className="text-[10px] text-amber-300/90 truncate"
                      title={`Lines: ${facultyCommute.transit.lines.join(', ')} (${facultyCommute.transit.transfers} transfers)`}
                    >
                      Line {facultyCommute.transit.lines.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Destination 2: Main Train Station */}
            {stationCommute && (
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                  <TrainFront className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Main Train Station (Salzburg Hbf)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* Walk */}
                  <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Walk</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {stationCommute.walk.durationMin} min
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {stationCommute.walk.distanceKm} km
                    </div>
                  </div>

                  {/* Bike */}
                  <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                      <Bike className="w-3.5 h-3.5 text-sky-400" />
                      <span>Bike</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {stationCommute.bike.durationMin} min
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {stationCommute.bike.distanceKm} km
                    </div>
                  </div>

                  {/* Public Transport */}
                  <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                      <Bus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transit</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {stationCommute.transit.durationMin} min
                    </div>
                    <div
                      className="text-[10px] text-amber-300/90 truncate"
                      title={`Lines: ${stationCommute.transit.lines.join(', ')} (${stationCommute.transit.transfers} transfers)`}
                    >
                      Line {stationCommute.transit.lines.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rooms & Booking Providers */}
        <div className="space-y-3">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Booking Options & Rooms
          </span>

          {dorm.bookingOptions.map((booking, bIdx) => {
            const providerMatches = matchesProviderFilter(booking, filters.providerFilter);
            const linkUrl = booking.sourceLinks?.applicationPortal || booking.primaryUrl;

            return (
              <div
                key={bIdx}
                className={`rounded-xl border p-3.5 space-y-3 ${
                  providerMatches
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-slate-950/30 border-slate-800/40 opacity-55'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {booking.provider}
                    </span>
                    {booking.logistics?.acceptsSummerSemester && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                        Summer Sem. OK
                      </span>
                    )}
                  </div>
                  {linkUrl && (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                    >
                      <span>Apply / Info</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {booking.rooms && booking.rooms.length > 0 ? (
                  <div className="space-y-2">
                    {booking.rooms.map((room, rIdx) => {
                      const isMatch = roomMatchesFilters(room, filters);
                      const privBath = isPrivateBathroom(room.bathroomSetup);
                      const privKitch = isPrivateKitchen(room.kitchenSetup);
                      const roomLink =
                        (typeof room.url === 'string' && room.url) ||
                        booking.sourceLinks?.roomsAndPricing ||
                        booking.sourceLinks?.applicationPortal ||
                        booking.primaryUrl;

                      const cardContent = (
                        <>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                              <span className="truncate">{room.roomType}</span>
                              {roomLink && (
                                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Bath className="w-3 h-3 text-sky-400" />
                                {privBath ? 'Private Bath' : room.bathroomSetup || 'Shared Bath'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Utensils className="w-3 h-3 text-amber-400" />
                                {privKitch ? 'Private Kitchen' : room.kitchenSetup || 'Shared Kitchen'}
                              </span>
                            </div>
                            {room.cleaningServices && (
                              <div className="text-[10px] text-slate-500">
                                {room.cleaningServices}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                              €{room.monthlyRentEur}
                              <span className="text-[10px] font-normal text-slate-400">/mo</span>
                            </div>
                            {room.depositEur != null && (
                              <div className="text-[10px] text-slate-400">
                                Deposit: €{room.depositEur}
                              </div>
                            )}
                          </div>
                        </>
                      );

                      if (roomLink) {
                        return (
                          <a
                            key={rIdx}
                            href={roomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${room.roomType} details / pricing on provider website`}
                            className={`group block rounded-lg p-2.5 border flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                              isMatch
                                ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/80 hover:bg-slate-800/80 hover:shadow-md'
                                : 'bg-slate-900/30 border-slate-800/40 hover:border-slate-700 opacity-50 hover:opacity-80'
                            }`}
                          >
                            {cardContent}
                          </a>
                        );
                      }

                      return (
                        <div
                          key={rIdx}
                          className={`rounded-lg p-2.5 border flex items-start justify-between gap-2.5 ${
                            isMatch
                              ? 'bg-slate-900/90 border-slate-800'
                              : 'bg-slate-900/30 border-slate-800/40 opacity-50'
                          }`}
                        >
                          {cardContent}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Room pricing unlisted publicly — check operator website.
                  </div>
                )}

                {/* Extra Fees & Logistics */}
                {(booking.mandatoryExtraFees?.length ||
                  booking.logistics?.moveInRules ||
                  booking.specialNotes?.length) && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                    {booking.mandatoryExtraFees && booking.mandatoryExtraFees.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <ReceiptEuro className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-300">Fees:</strong>{' '}
                          {booking.mandatoryExtraFees.join(' • ')}
                        </span>
                      </div>
                    )}
                    {booking.logistics?.moveInRules && (
                      <div className="flex items-start gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{booking.logistics.moveInRules}</span>
                      </div>
                    )}
                    {booking.specialNotes && booking.specialNotes.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{booking.specialNotes.join(' ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Building Amenities & Facilities */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Amenities & Facilities
          </span>
          {dorm.buildingAmenities && dorm.buildingAmenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {dorm.buildingAmenities.map((am, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-800/90 text-slate-200 border border-slate-700/60"
                >
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  {am}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific amenities listed</p>
          )}

          {(dorm.bikeStorage || dorm.laundryFacilities) && (
            <div className="text-xs text-slate-300 space-y-1.5 pt-1">
              {dorm.bikeStorage && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{dorm.bikeStorage}</span>
                </div>
              )}
              {dorm.laundryFacilities && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{dorm.laundryFacilities}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
