'use client'

import { Fragment, useState, useMemo, useEffect } from 'react'
import { usePositions } from '@/hooks/usePositions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { NewLoanModal } from '@/components/loans/NewLoanModal'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ValueFormatterParams } from 'ag-grid-community'
import '@/lib/ag-grid-init'
import { getTransactions } from '@/server/actions/transaction/getTransactions'
import { Button } from "@/components/ui/button"
import { CreditAgreementDetailsModal } from '@/components/credit-agreements/CreditAgreementDetailsModal'
import { FacilityDetailsModal } from '@/components/facilities/FacilityDetailsModal'
import { Decimal } from 'decimal.js'

interface FacilityPosition {
  lender: string;
  commitment: number;
  status: string;
}

interface LoanPosition {
  lender: string;
  amount: number;
  status: string;
}

interface Trade {
  id: string;
  counterparty: string;
  amount: number;
  price: number;
  status: string;
  tradeDate: Date;
  settlementDate: Date;
}

interface Loan {
  id: string;
  amount: number;
  outstandingAmount: number;
  currency: string;
  status: string;
  interestPeriod: string;
  drawDate: Date;
  baseRate: string;
  effectiveRate: string;
  positions: LoanPosition[];
}

interface Facility {
  id: string;
  facilityName: string;
  facilityType: string;
  commitmentAmount: number;
  currency: string;
  status: string;
  interestType: string;
  baseRate: string;
  margin: string;
  positions: FacilityPosition[];
  trades: Trade[];
  loans: Loan[];
}

interface PositionResponse {
  id: string;
  agreementNumber: string;
  borrower: {
    name: string;
    type: string;
    status: string;
  };
  agent: {
    name: string;
    type: string;
  };
  amount: number;
  currency: string;
  status: string;
  startDate: Date;
  maturityDate: Date;
  interestRate: string;
  facilities: Facility[];
}

interface ExpandedState {
  [key: string]: {
    isExpanded: boolean;
    facilities: {
      [key: string]: {
        isExpanded: boolean;
        loans: {
          [key: string]: boolean;
        };
      };
    };
  };
}

interface ServicingTableProps {
  facilityId: string
}

function TableExpander({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="flex justify-end mb-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-xs"
      >
        {isExpanded ? (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            Collapse
          </>
        ) : (
          <>
            <ChevronRight className="h-4 w-4 mr-1" />
            Expand
          </>
        )}
      </Button>
    </div>
  )
}

function ServicingTable({ facilityId }: ServicingTableProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const servicingColumnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'effectiveDate',
      headerName: 'Date',
      valueFormatter: (params: ValueFormatterParams) => 
        params.value ? new Date(params.value).toLocaleDateString() : '',
      flex: 1
    },
    {
      field: 'activityType',
      headerName: 'Type',
      valueFormatter: (params: ValueFormatterParams) => {
        const types: Record<string, string> = {
          'PRINCIPAL_PAYMENT': 'Principal Payment',
          'INTEREST_PAYMENT': 'Interest Payment',
          'UNSCHEDULED_PAYMENT': 'Unscheduled Payment',
          'RATE_RESET': 'Rate Reset',
          'PAYDOWN': 'Paydown',
          'DRAWDOWN': 'Drawdown'
        };
        return types[params.value] || params.value;
      },
      flex: 1
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2
    },
    {
      field: 'amount',
      headerName: 'Amount',
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      flex: 1
    },
    {
      field: 'loan.outstandingAmount',
      headerName: 'Balance',
      valueFormatter: (params: ValueFormatterParams) => 
        params.value ? formatCurrency(params.value) : '-',
      flex: 1
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (params: ValueFormatterParams) => {
        const status = params.value?.toUpperCase();
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        
        switch (status) {
          case 'COMPLETED':
            variant = "default";
            break;
          case 'PENDING':
            variant = "secondary";
            break;
          case 'FAILED':
            variant = "destructive";
            break;
        }
        
        return <Badge variant={variant}>{params.value || 'Unknown'}</Badge>;
      },
      flex: 1
    },
    {
      field: 'processedBy',
      headerName: 'Processed By',
      flex: 1
    }
  ], [])

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        console.log('Loading transactions for facility:', facilityId)
        const data = await getTransactions({ facilityId })
        console.log('Loaded transactions:', data)
        setTransactions(data)
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTransactions()
  }, [facilityId])

  if (isLoading) {
    return <div className="p-4">Loading servicing history...</div>
  }

  return (
    <div>
      <TableExpander isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      <DataGrid
        rowData={transactions}
        columnDefs={servicingColumnDefs}
        className={`w-full transition-all duration-200 ${isExpanded ? 'h-[300px]' : 'h-[150px]'}`}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true
        }}
      />
    </div>
  )
}

export function LoanPositionsHierarchy() {
  const { positions, isLoading, error } = usePositions()
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [expandedTables, setExpandedTables] = useState<{
    [facilityId: string]: {
      loans?: boolean;
      positions?: boolean;
      servicing?: boolean;
    };
  }>({})
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null)

  console.log('Positions:', positions)
  console.log('Expanded state:', expanded)

  const toggleAgreement = (agreementId: string) => {
    console.log('Toggling agreement:', agreementId)
    setExpanded(prev => {
      const isCurrentlyExpanded = prev[agreementId]?.isExpanded;
      const newState = {
        ...prev,
        [agreementId]: {
          isExpanded: !isCurrentlyExpanded,
          facilities: prev[agreementId]?.facilities || {}
        }
      };
      console.log('New expanded state after agreement toggle:', newState);
      return newState;
    });
  }

  const toggleFacility = (agreementId: string, facilityId: string) => {
    console.log('Toggling facility:', facilityId, 'in agreement:', agreementId)
    console.log('Current expanded state:', expanded)
    
    setExpanded(prev => {
      // Ensure the agreement exists in the state
      const currentAgreement = prev[agreementId] || { isExpanded: true, facilities: {} };
      // Get current facility state or initialize it
      const currentFacility = currentAgreement.facilities[facilityId] || { isExpanded: false, loans: {} };

      const newState = {
        ...prev,
        [agreementId]: {
          ...currentAgreement,
          facilities: {
            ...currentAgreement.facilities,
            [facilityId]: {
              ...currentFacility,
              isExpanded: !currentFacility.isExpanded,
              loans: currentFacility.loans
            }
          }
        }
      };
      console.log('New expanded state after facility toggle:', newState);
      return newState;
    });
  }

  const toggleLoan = (agreementId: string, facilityId: string, loanId: string) => {
    console.log('Toggling loan:', loanId, 'in facility:', facilityId, 'in agreement:', agreementId)
    setExpanded(prev => {
      // Ensure the agreement exists and is expanded
      const currentAgreement = prev[agreementId] || { isExpanded: true, facilities: {} };
      // Ensure the facility exists and is expanded
      const currentFacility = currentAgreement.facilities[facilityId] || { isExpanded: true, loans: {} };
      // Get current loan state
      const isLoanExpanded = currentFacility.loans[loanId];

      const newState = {
        ...prev,
        [agreementId]: {
          ...currentAgreement,
          isExpanded: true, // Keep agreement expanded
          facilities: {
            ...currentAgreement.facilities,
            [facilityId]: {
              ...currentFacility,
              isExpanded: true, // Keep facility expanded
              loans: {
                ...currentFacility.loans,
                [loanId]: !isLoanExpanded
              }
            }
          }
        }
      };
      console.log('New expanded state after loan toggle:', newState);
      return newState;
    });
  }

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>
    
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'TERMINATED':
        return <Badge variant="destructive">Terminated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const loanColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'id', headerName: 'Loan ID', flex: 1 },
    { 
      field: 'amount', 
      headerName: 'Original Amount',
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      flex: 1 
    },
    { 
      field: 'outstandingAmount', 
      headerName: 'Outstanding',
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      flex: 1 
    },
    {
      field: 'interestPeriod',
      headerName: 'Interest Period',
      flex: 1
    },
    {
      field: 'drawDate',
      headerName: 'Draw Date',
      valueFormatter: (params: ValueFormatterParams) => params.value ? new Date(params.value).toLocaleDateString() : '',
      flex: 1
    },
    {
      field: 'baseRate',
      headerName: 'Base Rate',
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value == null) return '';
        const rate = Number(params.value);
        return isNaN(rate) ? '' : `${rate.toFixed(5)}%`;
      },
      flex: 1
    },
    {
      field: 'effectiveRate',
      headerName: 'Effective Rate',
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value == null) return '';
        const rate = Number(params.value);
        return isNaN(rate) ? '' : `${rate.toFixed(5)}%`;
      },
      flex: 1
    },
    { 
      field: 'status', 
      headerName: 'Status',
      cellRenderer: (params: ValueFormatterParams) => getStatusBadge(params.value),
      flex: 1 
    }
  ], [])

  const positionColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'lender', headerName: 'Lender', flex: 1 },
    { 
      field: 'commitment', 
      headerName: 'Commitment',
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      flex: 1 
    },
    { 
      field: 'share', 
      headerName: 'Share %',
      valueFormatter: (params: ValueFormatterParams) => `${params.value.toFixed(2)}%`,
      flex: 1 
    },
    { 
      field: 'status', 
      headerName: 'Status',
      cellRenderer: (params: ValueFormatterParams) => getStatusBadge(params.value),
      flex: 1 
    }
  ], [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center p-8 text-destructive">{error}</div>
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Loan Positions</CardTitle>
              <CardDescription>Hierarchical view of credit agreements, facilities, and loans</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Agreement Number</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Contract Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <Fragment key={position.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleAgreement(position.id)}
                  >
                    <TableCell>
                      {expanded[position.id]?.isExpanded ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">
                      {position.agreementNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{position.borrower.name}</div>
                        <Badge variant="outline">{position.borrower.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(position.amount)} {position.currency}</TableCell>
                    <TableCell>{Number(position.interestRate).toFixed(5)}%</TableCell>
                    <TableCell>{getStatusBadge(position.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{position.agent.name}</div>
                        <Badge variant="outline">{position.agent.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAgreement(position.id)
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>

                  {expanded[position.id]?.isExpanded && position.facilities.map((facility) => (
                    <Fragment key={facility.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50 bg-muted/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFacility(position.id, facility.id);
                        }}
                      >
                        <TableCell className="pl-8">
                          {expanded[position.id]?.facilities[facility.id]?.isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {facility.facilityName}
                        </TableCell>
                        <TableCell>{facility.facilityType}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{formatCurrency(facility.commitmentAmount)} (Committed)</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(facility.positions.reduce((sum, pos) => sum + pos.commitment, 0))} (Available)
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(facility.loans.reduce((sum, loan) => sum + loan.amount, 0))} (Outstanding)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{facility.interestType}</div>
                            <div className="text-sm text-muted-foreground">
                              {facility.baseRate} + {Number(facility.margin).toFixed(5)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(facility.status)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFacility(facility.id)
                            }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Facility Details when expanded */}
                      {expanded[position.id]?.facilities[facility.id]?.isExpanded && (
                        <TableRow className="bg-muted/10">
                          <TableCell colSpan={8} className="p-2">
                            <div className="space-y-2">
                              {/* Loans Table */}
                              <Card>
                                <CardHeader className="py-2 px-4 pb-0">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Loans</CardTitle>
                                    <NewLoanModal
                                      facilityId={facility.id}
                                      facilityName={facility.facilityName}
                                      availableAmount={facility.commitmentAmount - facility.loans.reduce((sum, loan) => sum + loan.amount, 0)}
                                      currency={facility.currency}
                                      margin={facility.margin}
                                      onSuccess={() => {
                                        window.location.reload()
                                      }}
                                    />
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0 p-2">
                                  <TableExpander 
                                    isExpanded={expandedTables[facility.id]?.loans ?? false}
                                    onToggle={() => setExpandedTables(prev => ({
                                      ...prev,
                                      [facility.id]: {
                                        ...prev[facility.id],
                                        loans: !(prev[facility.id]?.loans ?? false)
                                      }
                                    }))}
                                  />
                                  <DataGrid
                                    rowData={facility.loans}
                                    columnDefs={loanColumnDefs}
                                    className={`w-full transition-all duration-200 ${
                                      expandedTables[facility.id]?.loans ? 'h-[300px]' : 'h-[150px]'
                                    }`}
                                  />
                                </CardContent>
                              </Card>

                              {/* Positions Table */}
                              <Card>
                                <CardHeader className="py-2 px-4 pb-0">
                                  <CardTitle className="text-sm font-medium">Lender Positions</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 p-2">
                                  <TableExpander 
                                    isExpanded={expandedTables[facility.id]?.positions ?? false}
                                    onToggle={() => setExpandedTables(prev => ({
                                      ...prev,
                                      [facility.id]: {
                                        ...prev[facility.id],
                                        positions: !(prev[facility.id]?.positions ?? false)
                                      }
                                    }))}
                                  />
                                  <DataGrid
                                    rowData={facility.positions.map(pos => ({
                                      ...pos,
                                      share: (pos.commitment / facility.commitmentAmount) * 100
                                    }))}
                                    columnDefs={positionColumnDefs}
                                    className={`w-full transition-all duration-200 ${
                                      expandedTables[facility.id]?.positions ? 'h-[300px]' : 'h-[150px]'
                                    }`}
                                  />
                                </CardContent>
                              </Card>

                              {/* Servicing History */}
                              <Card>
                                <CardHeader className="py-2 px-4 pb-0">
                                  <CardTitle className="text-sm font-medium">Servicing History</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 p-2">
                                  <ServicingTable facilityId={facility.id} />
                                </CardContent>
                              </Card>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      <CreditAgreementDetailsModal
        creditAgreementId={selectedAgreement || ''}
        open={!!selectedAgreement}
        onOpenChange={(open) => !open && setSelectedAgreement(null)}
        onUpdate={() => window.location.reload()}
      />

      <FacilityDetailsModal
        facilityId={selectedFacility || ''}
        open={!!selectedFacility}
        onOpenChange={(open) => !open && setSelectedFacility(null)}
      />
    </Card>
  )
} 