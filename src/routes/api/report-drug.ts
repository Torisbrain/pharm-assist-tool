import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "../../lib/auth";

export const Route = createFileRoute("/api/report-drug")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const body = await request.json();
          
          // Validate required fields
          if (!body.drugName || !body.reason || !body.location) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
          }

          // Optional Auth Check
          let userId = null;
          const authHeader = request.headers.get("Authorization");
          if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const payload = await verifyToken(token);
            if (payload) {
              userId = payload.id;
            }
          }

          console.log("New Drug Report Received:", body, "User ID:", userId);

          // Implementation for Cloudflare D1
          const db = context?.env?.DB;
          if (!db) {
            console.error("Database connection missing");
            return Response.json({ error: "Database connection missing" }, { status: 500 });
          }

          try {
            await db.prepare(
              "INSERT INTO reports (id, user_id, drug_name, nafdac_number, batch_number, pharmacy_name, location, reason, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(
              crypto.randomUUID(),
              userId,
              body.drugName,
              body.nafdac || body.nafdac_number || null,
              body.batchNumber || body.batch_number || null,
              body.pharmacyName || body.pharmacy_name || null,
              body.location,
              body.reason,
              body.description || null,
              "pending",
              Math.floor(Date.now() / 1000)
            ).run();
          } catch (dbErr) {
            console.error("Database storage error:", dbErr);
            return Response.json({ error: "Failed to store report" }, { status: 500 });
          }

          return Response.json({ 
            success: true, 
            message: "Report submitted successfully"
          });
        } catch (error) {
          console.error("API error:", error);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
