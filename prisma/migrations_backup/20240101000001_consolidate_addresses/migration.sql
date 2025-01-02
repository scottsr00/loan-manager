-- CreateTable
CREATE TABLE "Address" (
  "id" TEXT NOT NULL,
  "entityId" TEXT,
  "counterpartyId" TEXT,
  "type" TEXT NOT NULL,
  "street1" TEXT NOT NULL,
  "street2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_entityId_fkey" 
  FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_counterpartyId_fkey" 
  FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Address_entityId_idx" ON "Address"("entityId");
CREATE INDEX "Address_counterpartyId_idx" ON "Address"("counterpartyId");

-- AddConstraint
ALTER TABLE "Address"
  ADD CONSTRAINT "address_owner_check" 
  CHECK (
    ("entityId" IS NOT NULL AND "counterpartyId" IS NULL) OR 
    ("entityId" IS NULL AND "counterpartyId" IS NOT NULL)
  );

-- MigrateData
INSERT INTO "Address" (
  id,
  counterpartyId,
  type,
  street1,
  street2,
  city,
  state,
  "postalCode",
  country,
  "isPrimary",
  "createdAt",
  "updatedAt"
)
SELECT 
  id,
  "counterpartyId",
  type,
  street1,
  street2,
  city,
  state,
  "postalCode",
  country,
  "isPrimary",
  "createdAt",
  "updatedAt"
FROM "CounterpartyAddress";

-- DropTable
DROP TABLE "CounterpartyAddress"; 