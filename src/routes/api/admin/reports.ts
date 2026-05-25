import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "../../../lib/auth";

export const Route = createFileRoute("/api/admin/reports")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const db = context?.env?.DB;
        if (!db) {
          return Response.json({ error: "Database connection missing" }, { status: 500 });
        }

        // Admin Auth Check
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin in D1
        const user = await db.prepare("SELECT is_admin FROM users WHERE id = ?").bind(payload.id).first();
        if (!user || !user.is_admin) {
          return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        try {
          const { results } = await db.prepare(
            "SELECT * FROM reports ORDER BY created_at DESC"
          ).all();
          
          return Response.json(results);
        } catch (err) {
          console.error("D1 Fetch Error:", err);
          return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
        }
      },
      POST: async ({ request, context }) => {
        const db = context?.env?.DB;
        if (!db) {
          return Response.json({ error: "Database connection missing" }, { status: 500 });
        }

        // Admin Auth Check
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const user = await db.prepare("SELECT is_admin FROM users WHERE id = ?").bind(payload.id).first();
        if (!user || !user.is_admin) {
          return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        try {
          const { id, status } = await request.json();
          if (!id || !status) {
            return Response.json({ error: "Missing id or status" }, { status: 400 });
          }

          await db.prepare("UPDATE reports SET status = ? WHERE id = ?").bind(status, id).run();
          return Response.json({ success: true });
        } catch (err) {
          console.error("D1 Update Error:", err);
          return Response.json({ error: "Failed to update report" }, { status: 500 });
        }
      }
    },
  },
});
