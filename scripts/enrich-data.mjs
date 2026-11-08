import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DORMS_PATH = path.resolve(__dirname, '../src/data/dorms.json');
const POIS_PATH = path.resolve(__dirname, '../src/data/pois.json');

const USER_AGENT = 'SalzburgStudentHousingComparison/1.0 (https://github.com/mathewwj)';

// Key destinations in Salzburg
const KEY_DESTINATIONS = {
  faculty: {
    id: 'faculty-techno-z',
    name: 'PLUS Faculty (Jakob-Haringer-Str. 2)',
    shortName: 'Faculty (Techno-Z)',
    address: 'Jakob-Haringer-Straße 2, 5020 Salzburg',
    category: 'faculty',
    lat: 47.82292,
    lng: 13.04053,
  },
  trainStation: {
    id: 'salzburg-hbf',
    name: 'Salzburg Hauptbahnhof',
    shortName: 'Main Train Station',
    address: 'Südtiroler Platz 1, 5020 Salzburg',
    category: 'station',
    lat: 47.81285,
    lng: 13.04560,
  },
};

// Known fallback coordinates for Salzburg dorms in case Nominatim misses range house numbers
const FALLBACK_COORDS = {
  'Glockengasse Residence': { lat: 47.80494, lng: 13.04754 },
  'Haus Humboldt': { lat: 47.79185, lng: 13.05981 },
  'Haus Paracelsus': { lat: 47.81242, lng: 13.05288 },
  'Haus Merian': { lat: 47.81082, lng: 13.04628 },
  'Strubergasse (ÖJAB-Haus Salzburg)': { lat: 47.80876, lng: 13.03095 },
  'Priesterhausgasse / Schwarzes Rössl': { lat: 47.80168, lng: 13.04618 },
  'Internationales Kolleg': { lat: 47.79156, lng: 13.07155 },
  'Franz von Sales Kolleg': { lat: 47.79825, lng: 13.02982 },
  'Europa Kolleg': { lat: 47.79751, lng: 13.02735 },
  'Mozart Studentenheim': { lat: 47.80839, lng: 13.04393 },
  'Leonardo Studentenheim': { lat: 47.81475, lng: 13.05638 },
  'Paris Lodron': { lat: 47.80652, lng: 13.05675 },
  'PMU Studentenheim': { lat: 47.81055, lng: 13.03329 },
  'Wolf-Dietrich-Heim': { lat: 47.80492, lng: 13.04566 },
  'Thomas-Michels-Heim': { lat: 47.80614, lng: 13.04855 },
  '@HOME Studentenwohnheim': { lat: 47.81174, lng: 13.03305 },
  'Salzburger Lehrerhaus': { lat: 47.79982, lng: 13.03152 },
  'Dr. Franz Rehrl Studentenheim': { lat: 47.79371, lng: 13.05568 },
  'Techno-Z Student Residence (Campus 2)': { lat: 47.82255, lng: 13.04145 },
  'Techno-Z Student Residence (Campus 3)': { lat: 47.82195, lng: 13.04225 },
  'Techno-Z Student Residence (Campus 4)': { lat: 47.82165, lng: 13.04185 },
  'Kolpinghaus Salzburg': { lat: 47.81928, lng: 13.03985 },
  'Evangelisches Studentenheim (Katharina von Bora)': { lat: 47.79558, lng: 13.04215 },
  'Intercultural Student House St. Joe (Haus Michael / KHG)': { lat: 47.80025, lng: 13.03942 },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeAddress(dormName, address) {
  // Normalize range numbers like "10-18" -> "10" for Nominatim
  const normalizedAddress = address.replace(/(\d+)-\d+/, '$1');
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(normalizedAddress)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: Number(parseFloat(data[0].lat).toFixed(5)),
          lng: Number(parseFloat(data[0].lon).toFixed(5)),
        };
      }
    }
  } catch (err) {
    console.warn(`Geocoding warning for ${dormName}:`, err.message);
  }
  return FALLBACK_COORDS[dormName];
}

function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function fetchValhallaRoute(from, to, costing) {
  try {
    const res = await fetch('https://valhalla1.openstreetmap.de/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify({
        locations: [
          { lat: from.lat, lon: from.lng },
          { lat: to.lat, lon: to.lng },
        ],
        costing,
        units: 'kilometers',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const summary = data.trip?.summary;
      if (summary) {
        return {
          durationMin: Math.max(1, Math.round(summary.time / 60)),
          distanceKm: Number(summary.length.toFixed(2)),
        };
      }
    }
  } catch (err) {
    console.warn(`Valhalla ${costing} error:`, err.message);
  }
  // Fallback estimate if Valhalla rate-limits
  const directKm = haversineKm(from, to) * 1.28;
  const speedKmh = costing === 'pedestrian' ? 4.8 : 16.5;
  return {
    durationMin: Math.max(1, Math.round((directKm / speedKmh) * 60)),
    distanceKm: Number(directKm.toFixed(2)),
  };
}

async function fetchTransitRoute(from, to, walkFallback) {
  // Average Monday at 10:00 AM Europe/Vienna (09:00 UTC in standard time)
  const monday10amUtc = '2026-11-09T09:00:00Z';
  const url = `https://api.transitous.org/api/v1/plan?fromPlace=${from.lat},${from.lng}&toPlace=${to.lat},${to.lng}&time=${monday10amUtc}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) {
      const data = await res.json();
      const itineraries = data.itineraries || [];
      // Filter itineraries arriving within reasonable window and pick best duration
      if (itineraries.length > 0) {
        // Sort by total duration
        const sorted = [...itineraries].sort((a, b) => a.duration - b.duration);
        const best = sorted[0];
        const lines = [];
        for (const leg of best.legs || []) {
          if (leg.mode !== 'WALK' && leg.routeShortName) {
            if (!lines.includes(leg.routeShortName)) {
              lines.push(leg.routeShortName);
            }
          }
        }
        return {
          durationMin: Math.max(1, Math.round(best.duration / 60)),
          transfers: best.transfers ?? Math.max(0, lines.length - 1),
          lines: lines.length > 0 ? lines : ['Walk only (faster)'],
        };
      }
    }
  } catch (err) {
    console.warn('Transitous error:', err.message);
  }
  return {
    durationMin: walkFallback.durationMin,
    transfers: 0,
    lines: ['Walk'],
  };
}

function classifySupermarketBrand(name = '', brand = '') {
  const combined = `${name} ${brand}`.toLowerCase();
  if (combined.includes('spar') || combined.includes('interspar') || combined.includes('eurospar')) {
    return 'Spar';
  }
  if (combined.includes('billa')) return 'Billa';
  if (combined.includes('hofer')) return 'Hofer';
  if (combined.includes('lidl')) return 'Lidl';
  if (combined.includes('penny')) return 'Penny';
  if (combined.includes('denns') || combined.includes('biomarkt')) return 'Bio';
  return 'Supermarket';
}

async function fetchSupermarkets() {
  console.log('Fetching Salzburg supermarkets from Overpass API...');
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="supermarket"](47.775,13.005,47.840,13.085);
      way["shop"="supermarket"](47.775,13.005,47.840,13.085);
    );
    out center;
  `;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (res.ok) {
      const data = await res.json();
      const supermarkets = [];
      const seenCoords = new Set();
      for (const el of data.elements || []) {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) continue;
        const name = el.tags?.name || el.tags?.brand || 'Supermarket';
        const brand = classifySupermarketBrand(name, el.tags?.brand);
        const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
        if (seenCoords.has(key)) continue;
        seenCoords.add(key);
        supermarkets.push({
          id: `sm-${el.id}`,
          name,
          brand,
          category: 'supermarket',
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
        });
      }
      console.log(`Found ${supermarkets.length} supermarkets in Salzburg.`);
      return supermarkets;
    }
  } catch (err) {
    console.warn('Overpass API error:', err.message);
  }
  return [];
}

async function main() {
  const raw = await fs.readFile(DORMS_PATH, 'utf-8');
  const dorms = JSON.parse(raw);

  console.log(`Enriching ${dorms.length} dormitories with coordinates and Monday 10:00 AM routes...`);

  for (let i = 0; i < dorms.length; i++) {
    const dorm = dorms[i];
    if (dorm.coordinates && dorm.commute?.faculty && dorm.commute?.trainStation) {
      console.log(`[${i + 1}/${dorms.length}] Skipping ${dorm.dormitoryName} (already enriched)`);
      continue;
    }
    console.log(`[${i + 1}/${dorms.length}] Processing ${dorm.dormitoryName}...`);

    const coords = await geocodeAddress(dorm.dormitoryName, dorm.address);
    dorm.coordinates = coords;
    await sleep(350);

    // Commute to Faculty
    const facWalk = await fetchValhallaRoute(coords, KEY_DESTINATIONS.faculty, 'pedestrian');
    await sleep(250);
    const facBike = await fetchValhallaRoute(coords, KEY_DESTINATIONS.faculty, 'bicycle');
    await sleep(250);
    const facTransit = await fetchTransitRoute(coords, KEY_DESTINATIONS.faculty, facWalk);

    // Commute to Main Train Station
    const hbfWalk = await fetchValhallaRoute(coords, KEY_DESTINATIONS.trainStation, 'pedestrian');
    await sleep(250);
    const hbfBike = await fetchValhallaRoute(coords, KEY_DESTINATIONS.trainStation, 'bicycle');
    await sleep(250);
    const hbfTransit = await fetchTransitRoute(coords, KEY_DESTINATIONS.trainStation, hbfWalk);

    dorm.commute = {
      queriedAt: 'Monday 10:00 AM',
      faculty: {
        walk: facWalk,
        bike: facBike,
        transit: facTransit,
      },
      trainStation: {
        walk: hbfWalk,
        bike: hbfBike,
        transit: hbfTransit,
      },
    };

    console.log(
      `   -> Coords: (${coords.lat}, ${coords.lng}) | Faculty: Walk ${facWalk.durationMin}m (${facWalk.distanceKm}km), Bike ${facBike.durationMin}m (${facBike.distanceKm}km), Transit ${facTransit.durationMin}m [${facTransit.lines.join(', ')}]`
    );
  }

  await fs.writeFile(DORMS_PATH, JSON.stringify(dorms, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${DORMS_PATH}`);

  try {
    const existingPois = JSON.parse(await fs.readFile(POIS_PATH, 'utf-8'));
    if (existingPois.supermarkets && existingPois.supermarkets.length > 0) {
      console.log(`Supermarkets already present in ${POIS_PATH} (${existingPois.supermarkets.length}). Skipping Overpass.`);
      return;
    }
  } catch {
    // Proceed to fetch supermarkets
  }

  const supermarkets = await fetchSupermarkets();
  const poisData = {
    destinations: Object.values(KEY_DESTINATIONS),
    supermarkets,
  };
  await fs.writeFile(POIS_PATH, JSON.stringify(poisData, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${POIS_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
