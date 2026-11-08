import { useMemo, useState } from 'react';
import rawDorms from './data/dorms.json';
import rawPois from './data/pois.json';
import type { Dormitory, FilterState, POIsData } from './types/dorm';
import { DEFAULT_FILTERS, evaluateDorm } from './utils/dormFilters';
import Sidebar from './components/Sidebar';
import DormMap from './components/DormMap';

const dorms: Dormitory[] = rawDorms as Dormitory[];
const pois: POIsData = rawPois as POIsData;

export default function App() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedDormName, setSelectedDormName] = useState<string | null>(null);

  const evaluatedDorms = useMemo(
    () => dorms.map((dorm) => evaluateDorm(dorm, filters)),
    [filters]
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex">
      <Sidebar
        filters={filters}
        onChangeFilters={setFilters}
        evaluatedDorms={evaluatedDorms}
        selectedDormName={selectedDormName}
        onSelectDorm={setSelectedDormName}
      />

      <DormMap
        evaluatedDorms={evaluatedDorms}
        destinations={pois.destinations}
        supermarkets={pois.supermarkets}
        filters={filters}
        selectedDormName={selectedDormName}
        onSelectDorm={setSelectedDormName}
      />
    </div>
  );
}
