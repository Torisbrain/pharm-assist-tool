import { createFileRoute } from "@tanstack/react-router";

// Mock data for initial development
const MOCK_REPORTS = [
  {
    id: "rep-1",
    drugName: "Panadol Extra",
    nafdac: "A4-0123",
    batchNumber: "BN4401",
    pharmacyName: "Local Chemist, Oyingbo",
    location: "Lagos Mainland, Lagos",
    reason: "counterfeit",
    description: "The packaging looks suspicious, colors are faded and spelling mistakes on the back.",
    status: "pending",
    createdAt: "2026-05-24T14:30:00Z",
  },
  {
    id: "rep-2",
    drugName: "Amoxil 500mg",
    nafdac: "A4-7781",
    batchNumber: "AMX-882",
    pharmacyName: "Sunshine Pharmacy",
    location: "Ibadan, Oyo",
    reason: "expired",
    description: "The expiry date on the pack was altered with a marker.",
    status: "reviewed",
    createdAt: "2026-05-23T09:15:00Z",
  },
  {
    id: "rep-3",
    drugName: "Unknown Malarial",
    nafdac: "None",
    batchNumber: "Unknown",
    pharmacyName: "Street Vendor",
    location: "Kano City, Kano",
    reason: "no-nafdac",
    description: "Sold without any NAFDAC registration number or manufacturer info.",
    status: "forwarded",
    createdAt: "2026-05-22T16:45:00Z",
  },
];

export const Route = createFileRoute("/api/admin/reports")({
  server: {
    handlers: {
      GET: async () => {
        // Implementation for Cloudflare D1
        /*
        try {
          const db = process.env.DB || (globalThis as any).DB;
          if (db) {
            const { results } = await db.prepare(
              "SELECT id, drug_name as drugName, nafdac_number as nafdac, batch_number as batchNumber, pharmacy_name as pharmacyName, location, reason, description, status, created_at as createdAt FROM reports ORDER BY created_at DESC"
            ).all();
            return Response.json(results);
          }
        } catch (err) {
          console.error("D1 Fetch Error:", err);
        }
        */
        
        return Response.json(MOCK_REPORTS);
      },
    },
  },
});
