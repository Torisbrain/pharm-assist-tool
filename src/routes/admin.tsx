import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Filter, 
  Forward, 
  History, 
  Loader2, 
  MessageSquare, 
  MoreVertical, 
  Search, 
  ShieldAlert,
  Calendar,
  MapPin,
  Pill,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

interface DrugReport {
  id: string;
  drugName: string;
  nafdac: string;
  batchNumber: string;
  pharmacyName: string;
  location: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "forwarded";
  createdAt: string;
}

function AdminDashboard() {
  const [reports, setReports] = useState<DrugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reports");
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusUpdate = (id: string, newStatus: DrugReport["status"]) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`Report status updated to ${newStatus}`);
    
    // In real app, call API:
    // fetch(`/api/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) })
  };

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch = r.drugName.toLowerCase().includes(search.toLowerCase()) || 
                          r.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: DrugReport["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Pending</Badge>;
      case "reviewed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Reviewed</Badge>;
      case "forwarded":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Forwarded to NAFDAC</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    const map: Record<string, string> = {
      counterfeit: "Suspected Counterfeit",
      expired: "Expired Product",
      "side-effects": "Unusual Side Effects",
      packaging: "Poor Packaging",
      "no-nafdac": "No NAFDAC Number",
      other: "Other"
    };
    return map[reason] || reason;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/20">
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Flagged Product Review</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Admin Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
              <History className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground uppercase font-medium">Total Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground uppercase font-medium">Awaiting Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'forwarded').length}</div>
              <p className="text-xs text-muted-foreground uppercase font-medium">Forwarded to NAFDAC</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex flex-col justify-center">
               <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                 <AlertTriangle className="h-4 w-4" /> 82% Response Rate
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by drug name or location..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="forwarded">Forwarded</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading drug reports...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-card/50">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No reports found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{report.drugName}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                           <span className="flex items-center gap-1"><Pill className="h-3.5 w-3.5" /> {report.nafdac || "No NAFDAC"}</span>
                           <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                           <span className="flex items-center gap-1 font-medium text-red-600"><AlertTriangle className="h-3.5 w-3.5" /> {getReasonLabel(report.reason)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, "reviewed")}>
                            Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, "forwarded")}>
                            Forward to NAFDAC
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                      <div className="space-y-2 rounded-md bg-muted/50 p-3">
                         <div className="flex items-center gap-2 font-semibold">
                            <Building2 className="h-4 w-4 text-primary" /> Source Info
                         </div>
                         <p><span className="text-muted-foreground">Pharmacy:</span> {report.pharmacyName || "Not specified"}</p>
                         <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {report.location}</p>
                         <p><span className="text-muted-foreground">Batch:</span> {report.batchNumber || "Unknown"}</p>
                      </div>
                      <div className="space-y-2 p-1">
                         <div className="font-semibold">User Observation</div>
                         <p className="text-muted-foreground line-clamp-3 leading-relaxed italic">
                           "{report.description || "No additional comments provided."}"
                         </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col border-t sm:border-t-0 sm:border-l bg-muted/20">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-auto py-6 sm:px-4 flex flex-col gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => handleStatusUpdate(report.id, "reviewed")}
                      disabled={report.status !== 'pending'}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">Mark Reviewed</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-auto py-6 sm:px-4 flex flex-col gap-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                      onClick={() => handleStatusUpdate(report.id, "forwarded")}
                      disabled={report.status === 'forwarded'}
                    >
                      <Forward className="h-5 w-5" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">NAFDAC Alert</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
