import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/alerts')({
  component: AdminAlerts,
})

function AdminAlerts() {
  const [drugName, setDrugName] = useState('')
  const [reason, setReason] = useState('')
  const [targetPlan, setTargetPlan] = useState('all')
  const [isSending, setIsSending] = useState(false)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    
    try {
      const response = await fetch('/api/admin/broadcast-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer \${localStorage.getItem('admin_token')}` // Placeholder for real auth
        },
        body: JSON.stringify({ drugName, reason, targetPlan }),
      })

      if (response.ok) {
        toast.success('Alert broadcast initiated successfully')
        setDrugName('')
        setReason('')
      } else {
        toast.error('Failed to initiate broadcast')
      }
    } catch (error) {
      toast.error('An error occurred during broadcast')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Safety Alerts & Broadcasts</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Safety Broadcast</CardTitle>
          <CardDescription>
            This will send an email and push notification to all targeted users immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Drug Name</label>
              <Input 
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="e.g. Paracetamol Batch #123" 
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Reason for Alert</label>
              <Textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the safety concern..." 
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select value={targetPlan} onValueChange={setTargetPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="free">Free Users Only</SelectItem>
                  <SelectItem value="pro">Pro Users Only</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? 'Sending...' : 'Broadcast Alert'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
