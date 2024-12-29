-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legalName" TEXT NOT NULL,
    "dba" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "dateOfBirth" DATETIME,
    "dateOfIncorporation" DATETIME,
    "countryOfIncorporation" TEXT,
    "governmentId" TEXT,
    "governmentIdType" TEXT,
    "governmentIdExpiry" DATETIME,
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "street1" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BeneficialOwner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "nationality" TEXT,
    "ownershipPercentage" REAL NOT NULL,
    "controlType" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BeneficialOwner_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Borrower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "industrySegment" TEXT,
    "businessType" TEXT,
    "creditRating" TEXT,
    "ratingAgency" TEXT,
    "riskRating" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Borrower_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "onboardingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lender_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agreementNumber" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "maturityDate" DATETIME NOT NULL,
    "interestRate" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditAgreement_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityName" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "creditAgreementId" TEXT NOT NULL,
    "commitmentAmount" REAL NOT NULL,
    "availableAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "maturityDate" DATETIME NOT NULL,
    "interestType" TEXT NOT NULL,
    "baseRate" TEXT NOT NULL,
    "margin" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facility_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES "CreditAgreement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacilityPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "share" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacilityPosition_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FacilityPosition_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacilitySublimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacilitySublimit_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "outstandingAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "tradeDate" DATETIME NOT NULL,
    "settlementDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trade_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransactionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditAgreementId" TEXT,
    "loanId" TEXT,
    "tradeId" TEXT,
    "servicingActivityId" TEXT,
    "activityType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "effectiveDate" DATETIME NOT NULL,
    "processedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionHistory_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES "CreditAgreement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServicingActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingActivity_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Counterparty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Counterparty_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CounterpartyType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CounterpartyType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CounterpartyAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "counterpartyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "street1" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CounterpartyAddress_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CounterpartyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "counterpartyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CounterpartyContact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServicingRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServicingTeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingTeamMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ServicingRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServicingAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamMemberId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL DEFAULT 'PRIMARY_AGENT',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingAssignment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "ServicingTeamMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServicingAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Address_entityId_idx" ON "Address"("entityId");

-- CreateIndex
CREATE INDEX "Contact_entityId_idx" ON "Contact"("entityId");

-- CreateIndex
CREATE INDEX "BeneficialOwner_entityId_idx" ON "BeneficialOwner"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_entityId_key" ON "Borrower"("entityId");

-- CreateIndex
CREATE INDEX "Borrower_entityId_idx" ON "Borrower"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Lender_entityId_key" ON "Lender"("entityId");

-- CreateIndex
CREATE INDEX "Lender_entityId_idx" ON "Lender"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON "CreditAgreement"("agreementNumber");

-- CreateIndex
CREATE INDEX "CreditAgreement_borrowerId_idx" ON "CreditAgreement"("borrowerId");

-- CreateIndex
CREATE INDEX "CreditAgreement_lenderId_idx" ON "CreditAgreement"("lenderId");

-- CreateIndex
CREATE INDEX "Facility_creditAgreementId_idx" ON "Facility"("creditAgreementId");

-- CreateIndex
CREATE INDEX "FacilityPosition_facilityId_idx" ON "FacilityPosition"("facilityId");

-- CreateIndex
CREATE INDEX "FacilityPosition_lenderId_idx" ON "FacilityPosition"("lenderId");

-- CreateIndex
CREATE INDEX "FacilitySublimit_facilityId_idx" ON "FacilitySublimit"("facilityId");

-- CreateIndex
CREATE INDEX "Loan_facilityId_idx" ON "Loan"("facilityId");

-- CreateIndex
CREATE INDEX "Trade_facilityId_idx" ON "Trade"("facilityId");

-- CreateIndex
CREATE INDEX "Trade_counterpartyId_idx" ON "Trade"("counterpartyId");

-- CreateIndex
CREATE INDEX "TransactionHistory_creditAgreementId_idx" ON "TransactionHistory"("creditAgreementId");

-- CreateIndex
CREATE INDEX "TransactionHistory_loanId_idx" ON "TransactionHistory"("loanId");

-- CreateIndex
CREATE INDEX "TransactionHistory_tradeId_idx" ON "TransactionHistory"("tradeId");

-- CreateIndex
CREATE INDEX "TransactionHistory_servicingActivityId_idx" ON "TransactionHistory"("servicingActivityId");

-- CreateIndex
CREATE INDEX "ServicingActivity_facilityId_idx" ON "ServicingActivity"("facilityId");

-- CreateIndex
CREATE INDEX "Counterparty_typeId_idx" ON "Counterparty"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "CounterpartyType_name_key" ON "CounterpartyType"("name");

-- CreateIndex
CREATE INDEX "CounterpartyAddress_counterpartyId_idx" ON "CounterpartyAddress"("counterpartyId");

-- CreateIndex
CREATE INDEX "CounterpartyContact_counterpartyId_idx" ON "CounterpartyContact"("counterpartyId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicingRole_name_key" ON "ServicingRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServicingTeamMember_email_key" ON "ServicingTeamMember"("email");

-- CreateIndex
CREATE INDEX "ServicingTeamMember_roleId_idx" ON "ServicingTeamMember"("roleId");

-- CreateIndex
CREATE INDEX "ServicingAssignment_teamMemberId_idx" ON "ServicingAssignment"("teamMemberId");

-- CreateIndex
CREATE INDEX "ServicingAssignment_facilityId_idx" ON "ServicingAssignment"("facilityId");
