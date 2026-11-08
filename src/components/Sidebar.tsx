import {
  Building2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Bike,
  Bus,
  Footprints,
  Bath,
  Utensils,
  Sun,
  ShoppingCart,
  GraduationCap,
} from 'lucide-react';
import type {
  CommuteMode,
  FilterState,
  RoomCategory,
} from '../types/dorm';
import {
  DEFAULT_FILTERS,
  type EvaluatedDorm,
} from '../utils/dormFilters';

interface SidebarProps {
  filters: FilterState;
  onChangeFilters: (next: FilterState) => void;
  evaluatedDorms: EvaluatedDorm[];
  selectedDormName: string | null;
  onSelectDorm: (dormName: string) => void;
}

const ROOM_CATEGORY_OPTIONS: { id: RoomCategory; label: string; description: string }[] = [
  { id: 'single', label: 'Single (1 person)', description: 'Private bedroom / WG / Studio' },
  { id: 'shared', label: 'Shared (2+ people)', description: 'Twin / double bedroom' },
];

const AMENITY_OPTIONS: { id: string; label: string }[] = [
  { id: 'gym', label: 'Gym / Sports' },
  { id: 'music', label: 'Music Room' },
  { id: 'outdoor', label: 'Terrace / Park' },
  { id: 'social', label: 'Party / Lounge' },
  { id: 'study', label: 'Library / Study' },
  { id: 'parking', label: 'Car Parking' },
];

const COMMUTE_LIMITS: { value: number | null; label: string }[] = [
  { value: null, label: 'Any' },
  { value: 10, label: '≤ 10m' },
  { value: 15, label: '≤ 15m' },
  { value: 20, label: '≤ 20m' },
  { value: 30, label: '≤ 30m' },
];

export default function Sidebar({
  filters,
  onChangeFilters,
  evaluatedDorms,
  selectedDormName,
  onSelectDorm,
}: SidebarProps) {
  const matchingDorms = evaluatedDorms.filter((d) => d.matches);

  const toggleRoomCategory = (cat: RoomCategory) => {
    const exists = filters.roomCategories.includes(cat);
    const next = exists
      ? filters.roomCategories.filter((c) => c !== cat)
      : [...filters.roomCategories, cat];
    onChangeFilters({ ...filters, roomCategories: next });
  };

  const toggleAmenity = (id: string) => {
    const exists = filters.amenities.includes(id);
    const next = exists
      ? filters.amenities.filter((a) => a !== id)
      : [...filters.amenities, id];
    onChangeFilters({ ...filters, amenities: next });
  };

  return (
    <aside className="w-88 shrink-0 bg-slate-900 border-r border-slate-800 h-screen flex flex-col overflow-hidden select-none">
      {/* Top Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-white">
              Salzburg Dorms
            </h1>
            <p className="text-[11px] text-slate-400">
              {matchingDorms.length} of {evaluatedDorms.length} dorms shown
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChangeFilters(DEFAULT_FILTERS)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Scrollable Filters + Matching List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Search */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onChangeFilters({ ...filters, search: e.target.value })
              }
              placeholder="Search dorm name or street..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/90 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-lg text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Max Monthly Rent */}
        <div className="space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Max Monthly Rent</span>
            <span className="font-bold text-blue-400">
              {filters.maxRent >= 900 ? 'Any (€900)' : `≤ €${filters.maxRent}/mo`}
            </span>
          </div>
          <input
            type="range"
            min={305}
            max={900}
            step={10}
            value={filters.maxRent}
            onChange={(e) =>
              onChangeFilters({ ...filters, maxRent: Number(e.target.value) })
            }
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>€305</span>
            <span>€450</span>
            <span>€600</span>
            <span>€900</span>
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includeUnlistedPrice}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  includeUnlistedPrice: e.target.checked,
                })
              }
              className="rounded border-slate-700 bg-slate-800 text-blue-600"
            />
            <span>Include "Price on request" dorms</span>
          </label>
        </div>

        {/* Commute Time to Faculty */}
        <div className="space-y-2.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Max Commute to Faculty</span>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(
              [
                { id: 'bike', label: 'Bike', icon: Bike },
                { id: 'transit', label: 'Transit', icon: Bus },
                { id: 'walk', label: 'Walk', icon: Footprints },
              ] as { id: CommuteMode; label: string; icon: typeof Bike }[]
            ).map(({ id, label, icon: Icon }) => {
              const active = filters.commuteMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    onChangeFilters({ ...filters, commuteMode: id })
                  }
                  className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Max Minutes Pills */}
          <div className="grid grid-cols-5 gap-1">
            {COMMUTE_LIMITS.map((lim) => {
              const active = filters.maxCommuteMin === lim.value;
              return (
                <button
                  key={lim.label}
                  type="button"
                  onClick={() =>
                    onChangeFilters({ ...filters, maxCommuteMin: lim.value })
                  }
                  className={`py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {lim.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Provider */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Booking Provider / Operator</span>
          </label>
          <select
            value={filters.providerFilter}
            onChange={(e) =>
              onChangeFilters({ ...filters, providerFilter: e.target.value })
            }
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Providers (18 Dorms)</option>
            <option value="OEAD">OeAD Exchange Quota Available (6)</option>
            <option value="STUDENTENWERK">Salzburger Studentenwerk (7)</option>
            <option value="WIST">WIST Salzburg (3)</option>
            <option value="HOME4STUDENTS">Home4Students (1)</option>
            <option value="OEJAB">ÖJAB (1)</option>
            <option value="AKADEMIKERHILFE">Akademikerhilfe (1)</option>
            <option value="INDEPENDENT">Independent / Private / KHW (5)</option>
          </select>
        </div>

        {/* Room Type Chips (Single vs Shared) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Room Occupancy
            </label>
            <span className="text-[10px] text-slate-500">1 vs 2+ people</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {ROOM_CATEGORY_OPTIONS.map((opt) => {
              const active = filters.roomCategories.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleRoomCategory(opt.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs leading-tight">
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {opt.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy & Logistics Toggles */}
        <div className="space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <span className="block text-xs font-semibold text-slate-300">
            Room Privacy & Semester
          </span>
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-0.5">
            <span className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-sky-400" />
              <span>Private En-suite Bathroom</span>
            </span>
            <input
              type="checkbox"
              checked={filters.privateBathroomOnly}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  privateBathroomOnly: e.target.checked,
                })
              }
              className="rounded border-slate-700 bg-slate-800 text-blue-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-0.5">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Private Kitchenette</span>
            </span>
            <input
              type="checkbox"
              checked={filters.privateKitchenOnly}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  privateKitchenOnly: e.target.checked,
                })
              }
              className="rounded border-slate-700 bg-slate-800 text-blue-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer py-0.5">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-emerald-400" />
              <span>Accepts Summer Semester</span>
            </span>
            <input
              type="checkbox"
              checked={filters.summerSemesterOnly}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  summerSemesterOnly: e.target.checked,
                })
              }
              className="rounded border-slate-700 bg-slate-800 text-blue-600"
            />
          </label>
        </div>

        {/* Building Amenities */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Building Amenities
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AMENITY_OPTIONS.map((am) => {
              const active = filters.amenities.includes(am.id);
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={() => toggleAmenity(am.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {am.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Layers */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="flex items-center gap-1.5 font-medium">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Show Supermarkets on Map</span>
            </span>
            <input
              type="checkbox"
              checked={filters.showSupermarkets}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  showSupermarkets: e.target.checked,
                })
              }
              className="rounded border-slate-700 bg-slate-800 text-blue-600"
            />
          </label>
        </div>

        {/* Matching Dorms Quick-Jump List */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Matching Dorms ({matchingDorms.length})</span>
            <span className="text-[10px] font-normal text-slate-500">Click to focus</span>
          </div>

          <div className="space-y-1.5">
            {matchingDorms.map(({ dorm, effectiveMinPrice, priceTier }) => {
              const isSelected = dorm.dormitoryName === selectedDormName;
              const facCommute = dorm.commute?.faculty;

              return (
                <button
                  key={dorm.dormitoryName}
                  type="button"
                  onClick={() => onSelectDorm(dorm.dormitoryName)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500/80 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {dorm.dormitoryName}
                    </span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-bold border ${priceTier.badgeClass}`}
                    >
                      {effectiveMinPrice !== null ? `€${effectiveMinPrice}` : 'N/A'}
                    </span>
                  </div>
                  {facCommute && (
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                      <span>🎓 🚲 {facCommute.bike.durationMin}m</span>
                      <span>🚌 {facCommute.transit.durationMin}m</span>
                      <span>🚶 {facCommute.walk.durationMin}m</span>
                    </div>
                  )}
                </button>
              );
            })}

            {matchingDorms.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">
                No dorms match the current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
