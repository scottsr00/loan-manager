-- CreateTable
CREATE TABLE "TradeStatusChange" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradeStatusChange_tradeId_idx" ON "TradeStatusChange"("tradeId");

-- AddForeignKey
ALTER TABLE "TradeStatusChange" ADD CONSTRAINT "TradeStatusChange_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
