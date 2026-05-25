import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  History,
  Heart,
  CreditCard,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Search,
  MapPin,
  ArrowRight,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, Badge as AvatarBadge } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard")({
  component: UserDashboard,
  head: () => ({
    meta: [
      { title: "User Dashboard — PharmVerify NG" },
      {
        name: "description",
        content: "Manage your drug verification history, saved pharmacies, and subscription status.",
      },
    ],
  }),
});

interface VerificationRecord {
  id: string;
  date: string;
  name: string;
  nafdac: string;
  status: "Verified" | "Flagged" | "Unknown";
}

const HISTORY: VerificationRecord[] = [
  { id: "1", date: "2026-05-24", name: "Panadol Extra", nafdac: "A4-0123", status: "Verified" },
  { id: "2", date: "2026-05-22", name: "Coartem", nafdac: "A4-5566", status: "Verified" },
  { id: "3", date: "2026-05-20", name: "FakeTram 100mg", nafdac: "None", status: "Flagged" },
  { id: "4", date: "2026-05-15", name: "Amoxil 500mg", nafdac: "A4-7781", status: "Verified" },
];

const SAVED_PHARMACIES = [
  { id: "p1", name: "HealthPlus — Ikeja", address: "12 Allen Avenue, Ikeja", phone: "+234 800 432 1100" },
  { id: "p2", name: "MedPlus — Lekki", address: "Admiralty Way, Lekki Phase 1", phone: "+234 800 555 2210" },
];

function UserDashboard() {
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    plan: "Free",
    verificationsThisMonth: 12,
    limit: 20,
  });

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-muted/20 sm:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex flex-col items-center border-b p-6 text-center">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">JD</AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-foreground">{user.name}</h2>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <Badge variant="secondary" className="mt-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
            {user.plan} Account
          </Badge>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {[
            { label: "Overview", icon: BarChart3, active: true },
            { label: "History", icon: History },
            { label: "Saved Pharmacies", icon: Heart },
            { label: "Subscription", icon: CreditCard },
            { label: "Account Settings", icon: Settings },
          ].map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${item.active ? "bg-muted" : ""}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John</h1>
              <p className="text-muted-foreground">Here's what's happening with your health security dashboard.</p>
            </div>
            <Button asChild className="gap-2 shadow-sm">
              <Link to="/">
                <Search className="h-4 w-4" />
                Verify New Drug
              </Link>
            </Button>
          </header>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Checks</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+5 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Flagged Drugs</CardTitle>
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Potentially unsafe items</p>
              </CardContent>
            </Card>
            <Card className="col-span-1 sm:col-span-2 lg:col-span-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Verification Limit</CardTitle>
                   <Badge variant="outline" className="bg-background text-[10px]">PRO Recommended</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl font-bold">{user.verificationsThisMonth} / {user.limit}</span>
                  <span className="text-xs font-medium text-muted-foreground">{Math.round((user.verificationsThisMonth / user.limit) * 100)}% Used</span>
                </div>
                <Progress value={(user.verificationsThisMonth / user.limit) * 100} className="h-2 bg-background" />
                <p className="mt-3 text-xs text-muted-foreground">
                  Upgrade to <span className="font-semibold text-primary">Pro</span> for unlimited verifications.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent History */}
            <Card className="lg:col-span-2 overflow-hidden border-none shadow-sm ring-1 ring-border">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Verifications</CardTitle>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {HISTORY.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          item.status === 'Verified' ? 'bg-green-100 text-green-600' : 
                          item.status === 'Flagged' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {item.status === 'Verified' ? <ShieldCheck className="h-5 w-5" /> : 
                           item.status === 'Flagged' ? <ShieldAlert className="h-5 w-5" /> : <ShieldQuestion className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.nafdac} • {item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={
                          item.status === 'Verified' ? 'border-green-200 bg-green-50 text-green-700' : 
                          item.status === 'Flagged' ? 'border-red-200 bg-red-50 text-red-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                        }>
                          {item.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t bg-muted/10 p-3">
                 <p className="text-xs text-muted-foreground italic">Showing last 4 checks</p>
              </CardFooter>
            </Card>

            {/* Side Panels */}
            <div className="space-y-6">
              {/* Saved Pharmacies */}
              <Card className="border-none shadow-sm ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="text-lg">Saved Pharmacies</CardTitle>
                  <CardDescription>Quick access to your favorites.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {SAVED_PHARMACIES.map((p) => (
                    <div key={p.id} className="group relative rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                      <h4 className="font-semibold text-sm line-clamp-1">{p.name}</h4>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{p.address}</span>
                      </div>
                      <Link 
                        to="/pharmacies" 
                        search={{ q: p.name }}
                        className="absolute inset-0 z-10 opacity-0"
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link to="/pharmacies">Find more pharmacies</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Upgrade Promo */}
              <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/20 mb-2">
                     <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Go PRO</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Get unlimited checks and real-time health alerts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2 text-xs">
                     <li className="flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3" /> Unlimited Verifications
                     </li>
                     <li className="flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3" /> SMS Emergency Alerts
                     </li>
                     <li className="flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3" /> Priority Pharmacist Chat
                     </li>
                   </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full font-bold">Upgrade for ₦2,000/mo</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
