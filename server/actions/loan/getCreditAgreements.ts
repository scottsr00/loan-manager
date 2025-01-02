'use server'

import { prisma } from '@/lib/prisma'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

export async function getCreditAgreements(): Promise<CreditAgreementWithRelations[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                },
                buyerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return creditAgreements
  } catch (error) {
    console.error('Error fetching credit agreements:', error)
    throw error
  }
}

export async function getAvailableLoans(): Promise<CreditAgreementWithRelations[]> {
  try {
    const availableLoans = await prisma.creditAgreement.findMany({
      where: {
        status: 'ACTIVE',
        facilities: {
          some: {
            trades: {
              none: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                },
                buyerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!availableLoans) {
      throw new Error('No available loans found')
    }

    return availableLoans
  } catch (error) {
    console.error('Error fetching available loans:', error)
    throw error
  }
}

export async function getCreditAgreement(id: string): Promise<CreditAgreementWithRelations | null> {
  try {
    const creditAgreement = await prisma.creditAgreement.findUnique({
      where: { id },
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                },
                buyerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        transactions: true
      }
    })

    if (!creditAgreement) {
      return null
    }

    return creditAgreement
  } catch (error) {
    console.error('Error fetching credit agreement:', error)
    throw error
  }
} 