import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { 
  AlertTriangle, 
  ArrowLeft, 
  Building2, 
  ClipboardList, 
  MapPin, 
  Pill, 
  Send,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/report")({
  component: ReportDrug,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      drugName: (search.drugName as string) || "",
      nafdac: (search.nafdac as string) || "",
    };
  },
});

function ReportDrug() {
  const { drugName, nafdac } = useSearch({ from: "/report" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    drugName: drugName || "",
    nafdac: nafdac || "",
    batchNumber: "",
    pharmacyName: "",
    location: "",
    reason: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.drugName || !formData.reason || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/report-drug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Report submitted successfully.");
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      console.error("Report error:", error);
      toast.error("There was an error submitting your report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-background py-12 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="text-center border-green-100 bg-green-50/30">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-green-800">Report Received</CardTitle>
              <CardDescription className="text-green-700">
                Thank you for your report. Your contribution helps keep Nigerian pharmacies safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 mb-6">
                Our team will review the details and, if necessary, forward this information to NAFDAC for further investigation.
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate({ to: "/" })}>
                  Return to Home
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                  Submit Another Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-muted/20 py-8 px-4 sm:py-12">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={() => navigate({ to: "/" })}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </button>

        <header className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm text-red-600 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Report Suspicious Product
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Help us stop fake drugs</h1>
          <p className="mt-2 text-muted-foreground">
            Provide details about the drug and where you found it. Your report is confidential.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Drug Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Pill className="h-4 w-4" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">Product Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="drugName">Drug Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="drugName" 
                    placeholder="e.g. Panadol Extra" 
                    value={formData.drugName}
                    onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="nafdac">NAFDAC Number</Label>
                    <Input 
                      id="nafdac" 
                      placeholder="e.g. A4-0123" 
                      value={formData.nafdac}
                      onChange={(e) => setFormData({ ...formData, nafdac: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="batch">Batch Number</Label>
                    <Input 
                      id="batch" 
                      placeholder="e.g. BN9902" 
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Building2 className="h-4 w-4" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">Purchase Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="pharmacy">Pharmacy Name</Label>
                  <Input 
                    id="pharmacy" 
                    placeholder="e.g. HealthPlus, local chemist, etc." 
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (City, State) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="location" 
                      className="pl-9"
                      placeholder="e.g. Ikeja, Lagos" 
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <ClipboardList className="h-4 w-4" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">Incident Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason for Reporting <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.reason} 
                    onValueChange={(val) => setFormData({ ...formData, reason: val })}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counterfeit">Suspected Counterfeit</SelectItem>
                      <SelectItem value="expired">Expired Product</SelectItem>
                      <SelectItem value="side-effects">Unusual Side Effects</SelectItem>
                      <SelectItem value="packaging">Poor/Tampered Packaging</SelectItem>
                      <SelectItem value="no-nafdac">No NAFDAC Number</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Additional Comments</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what made you suspicious about this product..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t px-6 py-4">
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Submit Confidential Report</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By submitting, you agree to our Terms of Service. Fake reports are subject to legal action.
        </p>
      </div>
    </main>
  );
}
