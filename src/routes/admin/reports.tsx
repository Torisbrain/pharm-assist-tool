import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Eye, CheckCircle, XCircle, Loader2, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/admin/reports')({
  component: AdminReports,
})

function AdminReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/reports', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load reports')
      // Fallback to mock data for demo if API fails
      setReports([
        { 
          id: '1', 
          drug_name: 'Augmentin 625mg', 
          reason: 'Suspected counterfeit pack', 
          status: 'pending', 
          created_at: Math.floor(Date.now()/1000) - 3600,
          nafdac_number: '04-1234',
          location: 'Ikeja, Lagos',
          pharmacy_name: 'HealthPlus Ikeja'
        },
        { 
          id: '2', 
          drug_name: 'Paracetamol Syrup', 
          reason: 'Expired batch found', 
          status: 'pending', 
          created_at: Math.floor(Date.now()/1000) - 7200,
          nafdac_number: 'A4-5678',
          location: 'Mushin, Lagos'
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleAction = async (id: string, status: 'resolved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id, status })
      })
      
      if (!response.ok) throw new Error('Failed to update report')
      
      toast.success(`Report marked as ${status}`)
      setReports(reports.map(r => r.id === id ? { ...r, status } : r))
      if (selectedReport?.id === id) setSelectedReport(null)
    } catch (err) {
      toast.error('Failed to update report')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drug Safety Reports</h2>
          <p className="text-muted-foreground">Review and manage suspicious drug reports from users.</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {reports.filter(r => r.status === 'pending').length} Pending Review
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div>
                      {report.drug_name}
                      {report.nafdac_number && (
                        <p className="text-xs font-normal text-muted-foreground">NAFDAC: {report.nafdac_number}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {report.location || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(report.created_at)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={report.status === 'pending' ? 'default' : report.status === 'resolved' ? 'success' : 'secondary'}
                      className={report.status === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" onClick={() => setSelectedReport(report)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                            <DialogDescription>
                              Submitted on {formatDate(report.created_at)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium uppercase text-muted-foreground">Drug Name</label>
                                <p className="text-sm font-semibold">{report.drug_name}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium uppercase text-muted-foreground">NAFDAC Number</label>
                                <p className="text-sm">{report.nafdac_number || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium uppercase text-muted-foreground">Batch Number</label>
                                <p className="text-sm">{report.batch_number || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium uppercase text-muted-foreground">Pharmacy</label>
                                <p className="text-sm">{report.pharmacy_name || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase text-muted-foreground">Location</label>
                              <p className="text-sm">{report.location || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase text-muted-foreground">Reason</label>
                              <p className="text-sm font-medium text-red-600">{report.reason}</p>
                            </div>
                            {report.description && (
                              <div>
                                <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                                <p className="text-sm bg-muted p-2 rounded mt-1 italic">"{report.description}"</p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            {report.status === 'pending' && (
                              <>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(report.id, 'rejected')}>
                                  <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(report.id, 'resolved')}>
                                  <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                                </Button>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
