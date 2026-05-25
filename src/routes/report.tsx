import { createFileRoute } from "@tanstack/react-router";
import { ReportModal } from "@/components/ReportModal";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

function ReportPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Report Suspicious Product</h1>
      <p className="text-muted-foreground mb-8">
        If you have encountered a suspicious or counterfeit drug, please report it immediately.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90"
      >
        Open Report Form
      </button>
      
      <ReportModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}
