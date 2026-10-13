import { 
  Building2, 
  MapPin, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles,
  Search
} from 'lucide-react'
import rawDorms from './data/dorms.json'
import type { Dormitory } from './types/dorm'

const dorms: Dormitory[] = rawDorms as Dormitory[]

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Fixed Left Sidebar (Filter Placeholder) */}
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between p-6">
        <div className="space-y-6">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                Salzburg Dorms
              </h1>
              <p className="text-xs text-slate-500">Student Housing Finder</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Filter Placeholders */}
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                Phase 1
              </span>
            </div>

            {/* Search Input Placeholder */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Search Residence</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Glockengasse..."
                  disabled
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Provider Filter Placeholder */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Provider</label>
              <select
                disabled
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
              >
                <option>All Providers (OeAD, Home4Students...)</option>
              </select>
            </div>

            {/* Price Range Placeholder */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">Max Monthly Rent</span>
                <span className="text-slate-400">€700</span>
              </div>
              <input
                type="range"
                disabled
                className="w-full accent-blue-600 cursor-not-allowed opacity-50"
              />
            </div>

            {/* Amenities Checklist Placeholder */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Popular Amenities</label>
              <div className="space-y-1.5">
                {['Gym', 'Study rooms', 'Music practice', 'Bicycle storage'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-xs text-slate-400 cursor-not-allowed">
                    <input type="checkbox" disabled className="rounded border-slate-300 text-blue-600" />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>{dorms.length} dormitories loaded</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Data
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8">
        {/* Top Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Student Housing Comparison
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Explore and compare dormitories, prices, and amenities in Salzburg.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-medium self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{dorms.length} listings available</span>
            </div>
          </div>
        </header>

        {/* Dorm Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dorms.map((dorm, index) => {
            const firstBooking = dorm.bookingOptions?.[0]
            const firstRoom = firstBooking?.rooms?.[0]
            const provider = firstBooking?.provider ?? 'Direct Provider'
            const monthlyRent = firstRoom?.monthlyRentEur

            return (
              <div
                key={`${dorm.dormitoryName}-${index}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200/80 p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-slate-900 leading-snug">
                      {dorm.dormitoryName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{dorm.address}</span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Building Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {dorm.buildingAmenities && dorm.buildingAmenities.length > 0 ? (
                        dorm.buildingAmenities.map((amenity, aIdx) => (
                          <span
                            key={aIdx}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No amenities listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Provider & Monthly Rent */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-end justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Provider
                    </span>
                    <span className="text-sm font-medium text-slate-800 truncate block mt-0.5">
                      {provider}
                    </span>
                    {firstRoom?.roomType && (
                      <span className="text-xs text-slate-500 block truncate">
                        {firstRoom.roomType}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {monthlyRent !== undefined ? 'From' : 'Rent'}
                    </span>
                    <div className="flex items-baseline justify-end gap-0.5 mt-0.5">
                      {monthlyRent !== undefined ? (
                        <>
                          <span className="text-2xl font-bold tracking-tight text-slate-900">
                            €{monthlyRent}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/mo</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          On request
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
