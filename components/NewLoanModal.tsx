'use client'

import { useState } from 'react'
import { createLoan } from '@/server/actions/loan/createLoan'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, MinusCircle } from 'lucide-react'

interface NewLoanModalProps {
  onLoanCreated: () => void
}

export function NewLoanModal({ onLoanCreated }: NewLoanModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    dealName: '',
    currentBalance: '',
    baseRate: 'SOFR',
    spread: '',
    agentBank: 'NxtBank',
    startDate: '',
    maturityDate: '',
    lenderShares: [] as { lenderName: string; share: string }[]
  })

  const handleAddLender = () => {
    setFormData(prev => ({
      ...prev,
      lenderShares: [...prev.lenderShares, { lenderName: '', share: '' }]
    }))
  }

  const handleRemoveLender = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lenderShares: prev.lenderShares.filter((_, i) => i !== index)
    }))
  }

  const handleLenderChange = (index: number, field: keyof { lenderName: string; share: string }, value: string) => {
    setFormData(prev => ({
      ...prev,
      lenderShares: prev.lenderShares.map((lender, i) => 
        i === index ? { ...lender, [field]: value } : lender
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.dealName || !formData.currentBalance || !formData.spread || !formData.agentBank ||
        !formData.startDate || !formData.maturityDate) {
      console.error('Missing required fields')
      return
    }

    // If no lenders are added, use Agent Bank as 100% lender
    let lenderShares = formData.lenderShares
    if (lenderShares.length === 0) {
      lenderShares = [{
        lenderName: formData.agentBank,
        share: '100'
      }]
    } else {
      // Only validate total shares if custom lenders are added
      const totalShares = lenderShares.reduce((sum, share) => sum + Number(share.share), 0)
      if (Math.abs(totalShares - 100) > 0.01) {
        console.error('Lender shares must total 100%')
        return
      }
    }

    try {
      const payload = {
        dealName: formData.dealName,
        currentBalance: Number(formData.currentBalance),
        baseRate: formData.baseRate,
        spread: Number(formData.spread),
        agentBank: formData.agentBank,
        currentPeriodTerms: `${formData.baseRate} + ${formData.spread}%`,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate,
        lenderShares: lenderShares.map(share => ({
          lenderName: share.lenderName,
          share: Number(share.share)
        }))
      }

      const result = await createLoan(payload)
      
      if (result.success) {
        setOpen(false)
        setFormData({
          dealName: '',
          currentBalance: '',
          baseRate: 'SOFR',
          spread: '',
          agentBank: 'NxtBank',
          startDate: '',
          maturityDate: '',
          lenderShares: []
        })
        
        onLoanCreated()
      }
    } catch (error) {
      console.error('Error creating loan:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>
            Enter the details for the new loan facility.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealName">Deal Name</Label>
                <Input
                  id="dealName"
                  value={formData.dealName}
                  onChange={(e) => setFormData(prev => ({ ...prev, dealName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Facility Amount</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseRate">Base Rate</Label>
                <Select
                  value={formData.baseRate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, baseRate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOFR">SOFR</SelectItem>
                    <SelectItem value="LIBOR">LIBOR</SelectItem>
                    <SelectItem value="Prime">Prime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spread">Spread (%)</Label>
                <Input
                  id="spread"
                  type="number"
                  step="0.01"
                  value={formData.spread}
                  onChange={(e) => setFormData(prev => ({ ...prev, spread: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturityDate">Maturity Date</Label>
                <Input
                  id="maturityDate"
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, maturityDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label>Lender Shares</Label>
                  {formData.lenderShares.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.agentBank} will be assigned 100% if no other lenders are added
                    </p>
                  )}
                </div>
                <Button type="button" onClick={handleAddLender} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Lender
                </Button>
              </div>
              {formData.lenderShares.map((lender, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Lender Name</Label>
                    <Input
                      value={lender.lenderName}
                      onChange={(e) => handleLenderChange(index, 'lenderName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Share (%)</Label>
                    <Input
                      type="number"
                      value={lender.share}
                      onChange={(e) => handleLenderChange(index, 'share', e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveLender(index)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Loan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 