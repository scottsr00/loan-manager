-- CreateTable
CREATE TABLE "TransactionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "creditAgreementId" TEXT,
    "loanId" TEXT,
    "tradeId" TEXT,
    "servicingActivityId" TEXT,
    "balanceChange" REAL,
    "lenderShare" REAL,
    "description" TEXT NOT NULL,
    "effectiveDate" DATETIME NOT NULL,
    "processedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionHistory_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES "CreditAgreement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TransactionHistory_facilityId_idx" ON "TransactionHistory"("facilityId");

-- CreateIndex
CREATE INDEX "TransactionHistory_creditAgreementId_idx" ON "TransactionHistory"("creditAgreementId");

-- CreateIndex
CREATE INDEX "TransactionHistory_loanId_idx" ON "TransactionHistory"("loanId");

-- CreateIndex
CREATE INDEX "TransactionHistory_tradeId_idx" ON "TransactionHistory"("tradeId");

-- CreateIndex
CREATE INDEX "TransactionHistory_servicingActivityId_idx" ON "TransactionHistory"("servicingActivityId");

-- CreateIndex
CREATE INDEX "TransactionHistory_eventType_idx" ON "TransactionHistory"("eventType");

-- CreateIndex
CREATE INDEX "TransactionHistory_effectiveDate_idx" ON "TransactionHistory"("effectiveDate"); 