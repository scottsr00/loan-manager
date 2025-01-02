'use server'

import { prisma } from '@/lib/prisma'
import { type FacilityWithRelations } from '@/server/types/facility'

export async function getFacility(id: string): Promise<FacilityWithRelations | null> {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        creditAgreement: {
          include: {
            borrower: {
              select: {
                id: true,
                legalName: true,
                dba: true
              }
            },
            lender: {
              select: {
                id: true,
                legalName: true,
                dba: true,
                lender: {
                  select: {
                    id: true,
                    status: true
                  }
                }
              }
            }
          }
        },
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
        },
        positions: {
          include: {
            lender: {
              include: {
                entity: {
                  select: {
                    id: true,
                    legalName: true,
                    dba: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!facility) {
      return null
    }

    return facility
  } catch (error) {
    console.error('Error fetching facility:', error)
    throw error
  }
}

export async function getFacilities(): Promise<FacilityWithRelations[]> {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        creditAgreement: {
          include: {
            borrower: {
              select: {
                id: true,
                legalName: true,
                dba: true
              }
            },
            lender: {
              select: {
                id: true,
                legalName: true,
                dba: true,
                lender: {
                  select: {
                    id: true,
                    status: true
                  }
                }
              }
            }
          }
        },
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
        },
        positions: {
          include: {
            lender: {
              include: {
                entity: {
                  select: {
                    id: true,
                    legalName: true,
                    dba: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return facilities
  } catch (error) {
    console.error('Error fetching facilities:', error)
    throw error
  }
} 