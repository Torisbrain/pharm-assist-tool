import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

export const APIRoute = createAPIFileRoute('/api/pharmacies')({
  POST: async ({ request }) => {
    try {
      const { lat, lng } = await request.json();

      if (!lat || !lng) {
        return json({
          pharmacies: [],
          message: 'Location required to find nearby pharmacies.'
        });
      }

      let pharmacies = await fetchPharmacies(lat, lng, 5000);
      if (pharmacies.length === 0) {
        pharmacies = await fetchPharmacies(lat, lng, 10000);
      }

      if (pharmacies.length === 0) {
        return json({
          pharmacies: [],
          message: 'No pharmacies found nearby. Visit nafdac.gov.ng for listings in your state.'
        });
      }

      return json({ pharmacies });

    } catch (error) {
      console.error('Pharmacies error:', error);
      return json({
        pharmacies: [],
        message: 'Could not load pharmacies. Please try again.'
      });
    }
  }
});

async function fetchPharmacies(lat: number, lng: number, radius: number) {
  const query = `[out:json][timeout:15];node["amenity"="pharmacy"](around:${radius},${lat},${lng});out body 10;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' }
  });

  const data = await response.json();
  if (!data.elements?.length) return [];

  return data.elements.map((place: any) => ({
    id: String(place.id),
    name: place.tags?.name || 'Pharmacy',
    address: [
      place.tags?.['addr:housenumber'],
      place.tags?.['addr:street'],
      place.tags?.['addr:city'] || place.tags?.['addr:state']
    ].filter(Boolean).join(', ') || 'Address not listed',
    phone: place.tags?.phone || place.tags?.['contact:phone'] || 'Not listed',
    distance: calcDistance(lat, lng, place.lat, place.lon),
    status: 'IN_STOCK',
    lat: place.lat,
    lng: place.lon
  })).sort((a: any, b: any) => a.distance - b.distance);
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
}
