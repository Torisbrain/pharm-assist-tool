import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, CheckCircle2, MapPin, Package, Building2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  drugName?: string;
  nafdacNumber?: string;
}

export function ReportModal({ isOpen, onClose, drugName: initialDrugName, nafdacNumber: initialNafdac }: ReportModalProps) {
  const [drugName, setDrugName] = useState(initialDrugName || "");
  const [nafdac, setNafdac] = useState(initialNafdac || "");
  const [batchNumber, setBatchNumber] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          drug_name: drugName,
          reason: reason,
          nafdac_number: nafdac,
          batch_number: batchNumber,
          pharmacy_name: pharmacyName,
          location: location,
          description: description,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit report. Are you logged in?");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        // Reset fields after successful submission
        setReason("");
        setBatchNumber("");
        setPharmacyName("");
        setLocation("");
        setDescription("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Report Suspicious Drug
          </DialogTitle>
          <DialogDescription>
            Help us keep others safe by reporting counterfeit or expired medications.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Report Submitted</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Thank you for your report. Our team will review it and take necessary actions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drug_name">Drug Name</Label>
                <div className="relative">
                  <Input
                    id="drug_name"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="e.g. Panadol"
                    required
                    className="pl-9"
                  />
                  <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nafdac">NAFDAC Number</Label>
                <Input
                  id="nafdac"
                  value={nafdac}
                  onChange={(e) => setNafdac(e.target.value)}
                  placeholder="e.g. 04-1234"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch Number</Label>
                <Input
                  id="batch"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. B12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacy">Pharmacy Name</Label>
                <div className="relative">
                  <Input
                    id="pharmacy"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="Where was it bought?"
                    className="pl-9"
                  />
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Purchase Location (City/State)</Label>
              <div className="relative">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ikeja, Lagos"
                  className="pl-9"
                />
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reporting</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Counterfeit, Expired, Bad reaction..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any other details about why this drug is suspicious..."
                className="min-h-[80px]"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
