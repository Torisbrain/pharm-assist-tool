import { createFileRoute } from "@tanstack/react-router";
import { verifyApiKey } from "../../lib/auth";
import { gbSearch, rowToResult } from "../../lib/nafdac";

export const Route = createFileRoute("/api/drug/$nafdac")({
  server: {
    handlers: {
      GET: async ({ params, request, context }: { params: { nafdac: string }; request: Request; context: any }) => {
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) {
          return Response.json({ error: "Missing API Key" }, { status: 401 });
        }

        const db = context?.env?.DB;
        const apiResult = await verifyApiKey(apiKey, db);
        if (!apiResult) {
          return Response.json({ error: "Invalid or inactive API Key" }, { status: 403 });
        }

        const nafdac = params.nafdac;
        const KV = context?.env?.KV;

        try {
          // Search Greenbook by NAFDAC number
          const rows = await gbSearch(nafdac, 1, KV);

          if (rows.length > 0) {
            return Response.json(rowToResult(rows[0], []));
          }

          return Response.json({ error: "Drug not found" }, { status: 404 });
        } catch (err) {
          console.error("API drug lookup error:", err);
          return Response.json({ error: "Lookup failed" }, { status: 500 });
        }
      },
    },
  },
});
