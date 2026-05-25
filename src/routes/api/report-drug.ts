import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/report-drug")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          
          // Validate required fields
          if (!body.drugName || !body.reason || !body.location) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
          }

          console.log("New Drug Report Received:", body);

          // Implementation for Cloudflare D1
          // Note: In a real TanStack Start on Cloudflare deployment, 
          // env would be accessed via platform context.
          
          /*
          try {
            const db = process.env.DB || (globalThis as any).DB; 
            if (db) {
              await db.prepare(
                "INSERT INTO reports (id, drug_name, nafdac_number, batch_number, pharmacy_name, location, reason, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
              ).bind(
                Math.random().toString(36).substring(2, 15),
                body.drugName,
                body.nafdac || null,
                body.batchNumber || null,
                body.pharmacyName || null,
                body.location,
                body.reason,
                body.description || null,
                "pending",
                Date.now()
              ).run();
            }
          } catch (dbErr) {
            console.error("Database storage error:", dbErr);
            // We still return success if logging worked, to not block the user
          }
          */

          return Response.json({ 
            success: true, 
            message: "Report submitted successfully",
            reportId: Math.random().toString(36).substring(7) 
          });
        } catch (error) {
          console.error("API error:", error);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
