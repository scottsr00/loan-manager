import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Try to clear existing data, but don't error if tables don't exist
    try {
      await prisma.$transaction([
        prisma.historicalBalance.deleteMany(),
        prisma.trade.deleteMany(),
        prisma.lenderPosition.deleteMany(),
        prisma.loan.deleteMany(),
        prisma.lender.deleteMany(),
      ]);
    } catch (_) {
      console.log('No existing data to clear');
    }

    // Create loans
    const loan1 = await prisma.loan.create({
      data: {
        dealName: 'Project Alpha',
        currentBalance: 1000000,
        currentPeriodTerms: '3M LIBOR + 2.5%',
        priorPeriodPaymentStatus: 'Paid',
        agentBank: 'NxtBank',
      },
    });

    const loan2 = await prisma.loan.create({
      data: {
        dealName: 'Project Beta',
        currentBalance: 2000000,
        currentPeriodTerms: '1M LIBOR + 3%',
        priorPeriodPaymentStatus: 'Pending',
        agentBank: 'Bank A',
      },
    });

    // Create lenders
    const lenderA = await prisma.lender.create({
      data: {
        name: 'Bank A',
      },
    });

    const lenderB = await prisma.lender.create({
      data: {
        name: 'Bank B',
      },
    });

    // Create lender positions
    await prisma.lenderPosition.create({
      data: {
        loanId: loan1.id,
        lenderId: lenderA.id,
        balance: 600000,
      },
    });

    await prisma.lenderPosition.create({
      data: {
        loanId: loan1.id,
        lenderId: lenderB.id,
        balance: 400000,
      },
    });

    // Create trades for loan1
    const trade1 = await prisma.trade.create({
      data: {
        loanId: loan1.id,
        quantity: 500000,
        price: 98.5,
        counterparty: "Bank A",
        tradeDate: new Date('2024-01-15'),
        expectedSettlementDate: new Date('2024-01-17'),
        accruedInterest: 12500,
        status: "Completed",
        tradeType: "Buy",
      },
    });

    const trade2 = await prisma.trade.create({
      data: {
        loanId: loan1.id,
        quantity: 300000,
        price: 99.0,
        counterparty: "Bank B",
        tradeDate: new Date('2024-02-01'),
        expectedSettlementDate: new Date('2024-02-03'),
        accruedInterest: 8750,
        status: "Open",
        tradeType: "Sell",
      },
    });

    // Create trades for loan2
    const trade3 = await prisma.trade.create({
      data: {
        loanId: loan2.id,
        quantity: 1000000,
        price: 97.5,
        counterparty: "Bank A",
        tradeDate: new Date('2024-02-15'),
        expectedSettlementDate: new Date('2024-02-17'),
        accruedInterest: 15000,
        status: "Completed",
        tradeType: "Buy",
      },
    });

    // Create historical balances for trades
    await prisma.historicalBalance.create({
      data: {
        tradeId: trade1.id,
        date: "2024-01-15",
        balance: 500000,
      },
    });

    await prisma.historicalBalance.create({
      data: {
        tradeId: trade1.id,
        date: "2024-01-31",
        balance: 495000,
      },
    });

    await prisma.historicalBalance.create({
      data: {
        tradeId: trade2.id,
        date: "2024-02-01",
        balance: 300000,
      },
    });

    await prisma.historicalBalance.create({
      data: {
        tradeId: trade3.id,
        date: "2024-02-15",
        balance: 1000000,
      },
    });

    // Add sample comments for trade1
    await prisma.$executeRaw`
      INSERT INTO TradeComment (tradeId, author, content, createdAt)
      VALUES 
        (${trade1.id}, 'Agent', 'Trade booked successfully. Awaiting settlement confirmation.', datetime('now', '-2 days')),
        (${trade1.id}, 'Seller', 'Settlement instructions sent to custodian.', datetime('now', '-1 days')),
        (${trade1.id}, 'Buyer', 'Confirmed receipt of settlement instructions.', datetime('now', '-12 hours'))
    `

    // Add sample comments for trade2
    await prisma.$executeRaw`
      INSERT INTO TradeComment (tradeId, author, content, createdAt)
      VALUES 
        (${trade2.id}, 'Agent', 'Trade pending final approval.', datetime('now', '-1 days')),
        (${trade2.id}, 'Buyer', 'Please confirm settlement account details.', datetime('now', '-6 hours'))
    `

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
