'use client'

import { useState, useEffect } from 'react'
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
import { bookTrade } from '@/app/actions/bookTrade'
import { getAvailableLoans, type AvailableLoan } from '@/app/actions/getAvailableLoans'

interface BookTradeModalProps {
  onTradeBooked: () => void
}

export function BookTradeModal({ onTradeBooked }: BookTradeModalProps) {
  const [open, setOpen] = useState(false)
  const [loans, setLoans] = useState<AvailableLoan[]>([])
  const [formData, setFormData] = useState({
    loanId: '',
    quantity: '',
    price: '',
    counterparty: '',
    tradeType: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLoans() {
      const availableLoans = await getAvailableLoans()
      setLoans(availableLoans)
    }
    loadLoans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields are filled
    if (!formData.loanId || !formData.quantity || !formData.price || !formData.counterparty || !formData.tradeType) {
      setError('All fields are required')
      return
    }

    try {
      const result = await bookTrade({
        loanId: formData.loanId,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        counterparty: formData.counterparty,
        tradeType: formData.tradeType as 'Buy' | 'Sell',
      })

      if (result.success) {
        // Reset form and close modal
        setFormData({
          loanId: '',
          quantity: '',
          price: '',
          counterparty: '',
          tradeType: '',
        })
        setOpen(false)
        
        // Refresh trade history
        onTradeBooked()
      }
    } catch (error) {
      console.error('Error booking trade:', error)
      setError(error instanceof Error ? error.message : 'Failed to book trade')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Book Trade</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book New Trade</DialogTitle>
          <DialogDescription>
            Enter the details for the new trade. Click book when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm mb-4">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loan" className="text-right">
                Loan
              </Label>
              <Select
                onValueChange={(value: string) => setFormData({ ...formData, loanId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a loan" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.dealName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tradeType" className="text-right">
                Type
              </Label>
              <Select
                onValueChange={(value: string) => setFormData({ ...formData, tradeType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select trade type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                className="col-span-3"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                className="col-span-3"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="counterparty" className="text-right">
                Counterparty
              </Label>
              <Input
                id="counterparty"
                className="col-span-3"
                value={formData.counterparty}
                onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Book Trade</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 