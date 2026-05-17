export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Pharmacy {
  name: string;
  address: string;
  distanceKm: number;
  phone: string;
  stock: StockStatus;
}

// Mock pharmacies — Nigerian context (Lagos / Abuja)
const POOL: Omit<Pharmacy, "stock" | "distanceKm">[] = [
  { name: "HealthPlus Pharmacy — Ikeja", address: "12 Allen Avenue, Ikeja, Lagos", phone: "+234 800 432 1100" },
  { name: "MedPlus Pharmacy — Lekki", address: "Admiralty Way, Lekki Phase 1, Lagos", phone: "+234 800 555 2210" },
  { name: "Alpha Pharmacy — Yaba", address: "84 Herbert Macaulay Way, Yaba, Lagos", phone: "+234 800 221 9988" },
  { name: "Emzor Pharmacy — Surulere", address: "23 Adeniran Ogunsanya, Surulere, Lagos", phone: "+234 800 110 4477" },
  { name: "Greenlife Pharmacy — Wuse 2", address: "Plot 45 Aminu Kano Cres, Wuse 2, Abuja", phone: "+234 800 778 6655" },
  { name: "Pharmaplus — Garki", address: "Area 11, Garki, Abuja", phone: "+234 800 994 3322" },
  { name: "NetPharmacy — Victoria Island", address: "Adeola Odeku St, Victoria Island, Lagos", phone: "+234 800 612 7788" },
  { name: "May & Baker Pharmacy — Apapa", address: "Wharf Road, Apapa, Lagos", phone: "+234 800 553 1109" },
];

const STOCK_CYCLE: StockStatus[] = ["In Stock", "In Stock", "Low Stock", "In Stock", "Out of Stock"];

export function findPharmacies(drug: string): Pharmacy[] {
  // Deterministic mock based on query length
  const seed = drug.trim().length || 1;
  return POOL.slice(0, 5).map((p, i) => ({
    ...p,
    distanceKm: Math.round((((i + 1) * 1.3 + (seed % 4)) + Number.EPSILON) * 10) / 10,
    stock: STOCK_CYCLE[(i + seed) % STOCK_CYCLE.length],
  }));
}
