-- CreateTable
CREATE TABLE "Trade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loanId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "price" REAL NOT NULL,
    "counterparty" TEXT NOT NULL,
    "tradeDate" DATETIME NOT NULL,
    "expectedSettlementDate" DATETIME NOT NULL,
    "accruedInterest" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "tradeType" TEXT NOT NULL,
    "costOfCarryAccrued" REAL NOT NULL DEFAULT 0,
    "lastCarryCalculation" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeHistoricalBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tradeId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradeHistoricalBalance_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealName" TEXT NOT NULL,
    "currentBalance" REAL NOT NULL,
    "currentPeriodTerms" TEXT NOT NULL,
    "priorPeriodPaymentStatus" TEXT NOT NULL,
    "agentBank" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LenderPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LenderPosition_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LenderPosition_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Trade_loanId_idx" ON "Trade"("loanId");

-- CreateIndex
CREATE INDEX "TradeHistoricalBalance_tradeId_idx" ON "TradeHistoricalBalance"("tradeId");

-- CreateIndex
CREATE INDEX "LenderPosition_loanId_idx" ON "LenderPosition"("loanId");

-- CreateIndex
CREATE INDEX "LenderPosition_lenderId_idx" ON "LenderPosition"("lenderId");
