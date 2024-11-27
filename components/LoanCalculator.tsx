'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MinusCircle, Calculator, InfoIcon } from 'lucide-react'
import { calculateLoanCashFlows } from '@/app/actions/calculateLoanCashFlows'
import { getSofrRate } from '@/app/actions/getSofrRate'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BaseRate {
  name: string
  value: number
  effectiveDate: string
}

interface LoanTerms {
  baseRate: string
  baseRateValue: number
  spread: number
  principalAmount: number
  loanTerm: number
  paymentFrequency: number
  syndicatedShares: { [lender: string]: number }
  prepayments: { period: number; amount: number }[]
}

interface CashFlow {
  period: number
  balance: number
  payment: number
  principal: number
  interest: number
  prepayment: number
  syndicatedPayments: { [lender: string]: number }
}

export const LoanCalculatorComponent: React.FC = () => {
  const [loanTerms, setLoanTerms] = useState<LoanTerms>({
    baseRate: 'SOFR',
    baseRateValue: 0,
    spread: 2.5, // Default spread
    principalAmount: 1000000,
    loanTerm: 5,
    paymentFrequency: 12,
    syndicatedShares: { 'Lender A': 60, 'Lender B': 40 },
    prepayments: []
  })
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([])
  const [prepaymentPeriod, setPrepaymentPeriod] = useState(1)
  const [prepaymentAmount, setPrepaymentAmount] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null) // Add this line
  const [activeTab, setActiveTab] = useState<string>("input")

  const [rates, setRates] = useState<Record<string, BaseRate>>({
    'SOFR': { name: 'SOFR', value: 0, effectiveDate: '' },
    'LIBOR': { name: 'LIBOR', value: 5.25, effectiveDate: new Date().toISOString() },
    'Prime': { name: 'Prime', value: 8.50, effectiveDate: new Date().toISOString() }
  })

  useEffect(() => {
    async function fetchRates() {
      try {
        const sofrData = await getSofrRate()
        setRates(prev => ({
          ...prev,
          'SOFR': {
            name: 'SOFR',
            value: sofrData.rate,
            effectiveDate: sofrData.effectiveDate
          }
        }))
        // Update loan terms if SOFR is selected
        if (loanTerms.baseRate === 'SOFR') {
          setLoanTerms(prev => ({
            ...prev,
            baseRateValue: sofrData.rate
          }))
        }
      } catch (error) {
        console.error('Error fetching SOFR rate:', error)
      }
    }

    fetchRates()
  }, [])

  const handleBaseRateChange = (rateName: string) => {
    const selectedRate = rates[rateName]
    setLoanTerms(prev => ({
      ...prev,
      baseRate: rateName,
      baseRateValue: selectedRate.value
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoanTerms(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleSyndicateChange = (lender: string, share: number) => {
    setLoanTerms(prev => ({
      ...prev,
      syndicatedShares: { ...prev.syndicatedShares, [lender]: share }
    }))
  }

  const handleAddPrepayment = () => {
    if (prepaymentPeriod && prepaymentAmount) {
      setLoanTerms(prev => ({
        ...prev,
        prepayments: [...prev.prepayments, { period: prepaymentPeriod, amount: prepaymentAmount }]
      }))
      setPrepaymentPeriod(1)
      setPrepaymentAmount(0)
    }
  }

  const handleRemovePrepayment = (index: number) => {
    setLoanTerms(prev => ({
      ...prev,
      prepayments: prev.prepayments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await calculateLoanCashFlows(loanTerms)
    setCashFlows(result)
    setActiveTab("results")
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Adjust the delay as necessary

    console.log('Results:', result);
    console.log('Results Ref:', resultsRef.current);
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
  }

  const getBaseRateInfo = (rateName: string) => {
    const rate = rates[rateName]
    if (rateName === 'SOFR') {
      return `SOFR rate (${rate.value.toFixed(2)}%) sourced from NY Federal Reserve Bank API as of ${new Date(rate.effectiveDate).toLocaleString()}`
    }
    if (rateName === 'LIBOR') {
      return `LIBOR rate (${rate.value.toFixed(2)}%) sourced from ICE Benchmark Administration as of ${new Date(rate.effectiveDate).toLocaleString()}`
    }
    return `${rateName} rate (${rate.value.toFixed(2)}%) as of ${new Date(rate.effectiveDate).toLocaleString()}`
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-xl">Corporate Loan Calculator</CardTitle>
        <CardDescription>Calculate loan amortization and cash flows</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="input">Loan Terms</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="baseRate" className="text-sm">Base Rate</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">
                            {getBaseRateInfo(loanTerms.baseRate)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select
                    value={loanTerms.baseRate}
                    onValueChange={handleBaseRateChange}
                  >
                    <SelectTrigger id="baseRate" className="h-8">
                      <SelectValue placeholder="Select base rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(rates).map((rate) => (
                        <SelectItem key={rate.name} value={rate.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{rate.name}</span>
                            <span className="font-mono">{rate.value.toFixed(2)}%</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="spread" className="text-sm">Spread (%)</Label>
                  <Input
                    id="spread"
                    name="spread"
                    type="number"
                    step="0.01"
                    value={loanTerms.spread}
                    onChange={(e) => setLoanTerms(prev => ({ ...prev, spread: parseFloat(e.target.value) || 0 }))}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="principalAmount" className="text-sm">Principal Amount ($)</Label>
                  <Input
                    id="principalAmount"
                    name="principalAmount"
                    type="number"
                    value={loanTerms.principalAmount}
                    onChange={handleInputChange}
                    required
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="loanTerm" className="text-sm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    name="loanTerm"
                    type="number"
                    value={loanTerms.loanTerm}
                    onChange={handleInputChange}
                    required
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="paymentFrequency" className="text-sm">Payments per Year</Label>
                  <Input
                    id="paymentFrequency"
                    name="paymentFrequency"
                    type="number"
                    value={loanTerms.paymentFrequency}
                    onChange={handleInputChange}
                    required
                    className="h-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Syndicated Shares (%)</Label>
                {Object.entries(loanTerms.syndicatedShares).map(([lender, share]) => (
                  <div key={lender} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={lender}
                      onChange={(e) => {
                        const newShares = { ...loanTerms.syndicatedShares }
                        delete newShares[lender]
                        newShares[e.target.value] = share
                        setLoanTerms(prev => ({ ...prev, syndicatedShares: newShares }))
                      }}
                      className="h-8"
                    />
                    <Input
                      type="number"
                      value={share}
                      onChange={(e) => handleSyndicateChange(lender, parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Prepayments</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Period"
                    value={prepaymentPeriod}
                    onChange={(e) => setPrepaymentPeriod(parseInt(e.target.value) || 1)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={prepaymentAmount}
                    onChange={(e) => setPrepaymentAmount(parseFloat(e.target.value) || 0)}
                    className="h-8"
                    value={formatNumber(prepaymentAmount)}
                  />
                  <Button type="button" onClick={handleAddPrepayment} size="sm" className="h-8">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                {loanTerms.prepayments.map((prepayment, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md text-sm">
                    <span>Period: {prepayment.period}, Amount: ${prepayment.amount}</span>
                    <Button type="button" onClick={() => handleRemovePrepayment(index)} variant="ghost" size="sm" className="h-6">
                      <MinusCircle className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full h-8">
                <Calculator className="mr-2 h-4 w-4" /> Calculate Cash Flows
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="results" ref={resultsRef}> {/* Add ref here */}

            {cashFlows.length > 0 ? (
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="m-0 border-t p-0 even:bg-muted">
                      <th className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Period</th>
                      <th className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Balance</th>
                      <th className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Payment</th>
                      <th className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Principal</th>
                      <th className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Interest</th>
                      <th className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">Prepayment</th>
                      {Object.keys(loanTerms.syndicatedShares).map(lender => (
                        <th key={lender} className="border px-2 py-1 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">{lender}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlows.map((cf) => (
                      <tr key={cf.period} className="m-0 border-t p-0 even:bg-muted">
                        <td className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{cf.period}</td>
                        <td className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{formatNumber(cf.balance)}</td>
                        <td className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{formatNumber(cf.payment)}</td>
                        <td className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{formatNumber(cf.principal)}</td>
                        <td className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{formatNumber(cf.interest)}</td>
                        <td className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{formatNumber(cf.prepayment)}</td>
                        {Object.entries(cf.syndicatedPayments).map(([lender, payment]) => (
                          <td key={lender} className="border px-2 py-1 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{formatNumber(payment)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            ) : (
              <p className="text-center py-4 text-sm">No results to display. Please calculate cash flows first.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground p-4">
        This calculator provides estimates and should not be considered financial advice.
      </CardFooter>
    </Card>
  )
}