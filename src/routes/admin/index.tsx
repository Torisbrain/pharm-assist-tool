import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  // In a real app, these would be fetched from /api/admin/stats
  const stats = [
    { title: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-600' },
    { title: 'Verifications Today', value: '432', icon: ShieldCheck, color: 'text-green-600' },
    { title: 'Pending Reports', value: '12', icon: AlertTriangle, color: 'text-amber-600' },
    { title: 'Revenue (MTD)', value: '₦840,000', icon: TrendingUp, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 \${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Flagged Drugs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Augmentin 625mg', reason: 'Suspected counterfeit pack', date: '2 hours ago' },
                { name: 'Paracetamol Syrup', reason: 'Expired batch found in Mushin', date: '5 hours ago' },
                { name: 'Artemether Injection', reason: 'Broken seal on multiple packs', date: '1 day ago' },
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{report.name}</p>
                    <p className="text-sm text-slate-500">{report.reason}</p>
                  </div>
                  <span className="text-xs text-slate-400">{report.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">NAFDAC Greenbook Proxy</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">D1 Database</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Paystack Webhooks</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
