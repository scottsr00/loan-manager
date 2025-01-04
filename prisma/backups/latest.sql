--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: stephenscott
--

CREATE TYPE public."ActivityType" AS ENUM (
    'SERVICING',
    'TRADE'
);


ALTER TYPE public."ActivityType" OWNER TO stephenscott;

--
-- Name: PositionChangeType; Type: TYPE; Schema: public; Owner: stephenscott
--

CREATE TYPE public."PositionChangeType" AS ENUM (
    'PAYDOWN',
    'ACCRUAL',
    'TRADE',
    'DRAWDOWN'
);


ALTER TYPE public."PositionChangeType" OWNER TO stephenscott;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "entityId" text,
    "counterpartyId" text,
    type text NOT NULL,
    street1 text NOT NULL,
    street2 text,
    city text NOT NULL,
    state text,
    "postalCode" text,
    country text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO stephenscott;

--
-- Name: BeneficialOwner; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."BeneficialOwner" (
    id text NOT NULL,
    "entityId" text NOT NULL,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    nationality text,
    "ownershipPercentage" double precision NOT NULL,
    "controlType" text NOT NULL,
    "verificationStatus" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BeneficialOwner" OWNER TO stephenscott;

--
-- Name: Borrower; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Borrower" (
    id text NOT NULL,
    "entityId" text NOT NULL,
    "industrySegment" text,
    "businessType" text,
    "creditRating" text,
    "ratingAgency" text,
    "riskRating" text,
    "onboardingStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "kycStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Borrower" OWNER TO stephenscott;

--
-- Name: Contact; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Contact" (
    id text NOT NULL,
    "entityId" text,
    type text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    title text,
    email text,
    phone text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "counterpartyId" text
);


ALTER TABLE public."Contact" OWNER TO stephenscott;

--
-- Name: Counterparty; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Counterparty" (
    id text NOT NULL,
    "entityId" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Counterparty" OWNER TO stephenscott;

--
-- Name: CounterpartyContact; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."CounterpartyContact" (
    id text NOT NULL,
    "counterpartyId" text NOT NULL,
    type text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    title text,
    email text,
    phone text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CounterpartyContact" OWNER TO stephenscott;

--
-- Name: CreditAgreement; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."CreditAgreement" (
    id text NOT NULL,
    "agreementNumber" text NOT NULL,
    "borrowerId" text NOT NULL,
    "lenderId" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "maturityDate" timestamp(3) without time zone NOT NULL,
    "interestRate" double precision NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CreditAgreement" OWNER TO stephenscott;

--
-- Name: Entity; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Entity" (
    id text NOT NULL,
    "legalName" text NOT NULL,
    dba text,
    "taxId" text,
    "countryOfIncorporation" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "isAgent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Entity" OWNER TO stephenscott;

--
-- Name: Facility; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Facility" (
    id text NOT NULL,
    "facilityName" text NOT NULL,
    "facilityType" text NOT NULL,
    "creditAgreementId" text NOT NULL,
    "commitmentAmount" double precision NOT NULL,
    "availableAmount" double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "maturityDate" timestamp(3) without time zone NOT NULL,
    "interestType" text NOT NULL,
    "baseRate" text NOT NULL,
    margin double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "outstandingAmount" double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."Facility" OWNER TO stephenscott;

--
-- Name: FacilityPosition; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."FacilityPosition" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "lenderId" text NOT NULL,
    share double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "commitmentAmount" double precision NOT NULL,
    "drawnAmount" double precision DEFAULT 0 NOT NULL,
    "undrawnAmount" double precision NOT NULL
);


ALTER TABLE public."FacilityPosition" OWNER TO stephenscott;

--
-- Name: FacilityPositionHistory; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."FacilityPositionHistory" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "lenderId" text NOT NULL,
    "changeDateTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changeType" public."PositionChangeType" NOT NULL,
    "previousCommitmentAmount" double precision NOT NULL,
    "newCommitmentAmount" double precision NOT NULL,
    "previousUndrawnAmount" double precision NOT NULL,
    "newUndrawnAmount" double precision NOT NULL,
    "previousDrawnAmount" double precision NOT NULL,
    "newDrawnAmount" double precision NOT NULL,
    "previousShare" double precision NOT NULL,
    "newShare" double precision NOT NULL,
    "previousStatus" text NOT NULL,
    "newStatus" text NOT NULL,
    "changeAmount" double precision NOT NULL,
    "userId" text NOT NULL,
    notes text,
    "servicingActivityId" text,
    "tradeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FacilityPositionHistory" OWNER TO stephenscott;

--
-- Name: FacilitySublimit; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."FacilitySublimit" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FacilitySublimit" OWNER TO stephenscott;

--
-- Name: KYC; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."KYC" (
    id text NOT NULL,
    "entityId" text NOT NULL,
    "verificationStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "lenderVerified" boolean DEFAULT false NOT NULL,
    "counterpartyVerified" boolean DEFAULT false NOT NULL,
    "lastVerificationDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KYC" OWNER TO stephenscott;

--
-- Name: Lender; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Lender" (
    id text NOT NULL,
    "entityId" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "onboardingDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lender" OWNER TO stephenscott;

--
-- Name: LenderPositionHistory; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."LenderPositionHistory" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "lenderId" text NOT NULL,
    "changeDateTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changeType" public."PositionChangeType" NOT NULL,
    "previousAccruedInterest" double precision NOT NULL,
    "newAccruedInterest" double precision NOT NULL,
    "changeAmount" double precision NOT NULL,
    "userId" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "servicingActivityId" text,
    "tradeId" text,
    "newCommitmentAmount" double precision NOT NULL,
    "newDrawnAmount" double precision NOT NULL,
    "newUndrawnAmount" double precision NOT NULL,
    "previousCommitmentAmount" double precision NOT NULL,
    "previousDrawnAmount" double precision NOT NULL,
    "previousUndrawnAmount" double precision NOT NULL
);


ALTER TABLE public."LenderPositionHistory" OWNER TO stephenscott;

--
-- Name: Loan; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Loan" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    amount double precision NOT NULL,
    "outstandingAmount" double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "interestPeriod" text DEFAULT '1M'::text NOT NULL,
    "drawDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "baseRate" numeric(7,5) NOT NULL,
    "effectiveRate" numeric(7,5) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Loan" OWNER TO stephenscott;

--
-- Name: ServicingActivity; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."ServicingActivity" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    description text,
    amount double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "completedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "activityType" text NOT NULL
);


ALTER TABLE public."ServicingActivity" OWNER TO stephenscott;

--
-- Name: ServicingAssignment; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."ServicingAssignment" (
    id text NOT NULL,
    "counterpartyId" text NOT NULL,
    "roleId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServicingAssignment" OWNER TO stephenscott;

--
-- Name: ServicingRole; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."ServicingRole" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServicingRole" OWNER TO stephenscott;

--
-- Name: ServicingTeamMember; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."ServicingTeamMember" (
    id text NOT NULL,
    "assignmentId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    title text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServicingTeamMember" OWNER TO stephenscott;

--
-- Name: Trade; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Trade" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "sellerCounterpartyId" text NOT NULL,
    "buyerCounterpartyId" text NOT NULL,
    "tradeDate" timestamp(3) without time zone NOT NULL,
    "settlementDate" timestamp(3) without time zone NOT NULL,
    "parAmount" double precision NOT NULL,
    price double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "settlementAmount" double precision NOT NULL
);


ALTER TABLE public."Trade" OWNER TO stephenscott;

--
-- Name: TradeStatusChange; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."TradeStatusChange" (
    id text NOT NULL,
    "tradeId" text NOT NULL,
    "fromStatus" text NOT NULL,
    "toStatus" text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TradeStatusChange" OWNER TO stephenscott;

--
-- Name: TransactionHistory; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."TransactionHistory" (
    id text NOT NULL,
    "creditAgreementId" text,
    "loanId" text,
    "tradeId" text,
    "servicingActivityId" text,
    "activityType" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    description text,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "processedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "facilityOutstandingAmount" double precision
);


ALTER TABLE public."TransactionHistory" OWNER TO stephenscott;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO stephenscott;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Address" (id, "entityId", "counterpartyId", type, street1, street2, city, state, "postalCode", country, "isPrimary", "createdAt", "updatedAt") FROM stdin;
cm5hg6ark0000e6awtah29z7s	LEI999999	\N	PHYSICAL	298 Main St	\N	Hong Kong	IL	89363	China	t	2025-01-04 00:30:14.528	2025-01-04 00:30:14.528
cm5hg6as60004e6awrupw3uak	LEI888888	\N	PHYSICAL	661 Main St	\N	New York	NY	28445	USA	t	2025-01-04 00:30:14.551	2025-01-04 00:30:14.551
cm5hjvp25000al72cyfq2zooi	\N	cm5hjvp240009l72cgg2lurei	LEGAL	123 Main St		New York	Ny	10010	United States	t	2025-01-04 02:13:58.3	2025-01-04 02:13:58.3
\.


--
-- Data for Name: BeneficialOwner; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."BeneficialOwner" (id, "entityId", name, "dateOfBirth", nationality, "ownershipPercentage", "controlType", "verificationStatus", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Borrower; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Borrower" (id, "entityId", "industrySegment", "businessType", "creditRating", "ratingAgency", "riskRating", "onboardingStatus", "kycStatus", "createdAt", "updatedAt") FROM stdin;
cm5hg6as20003e6awou5rq93p	LEI999999	Technology	Corporation	BBB	S&P	Medium	COMPLETED	COMPLETED	2025-01-04 00:30:14.547	2025-01-04 00:30:14.547
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Contact" (id, "entityId", type, "firstName", "lastName", title, email, phone, "isPrimary", "createdAt", "updatedAt", "counterpartyId") FROM stdin;
cm5hg6ark0001e6awyr5i138l	LEI999999	TECHNICAL	David	Brown	CTO	contact14@example.com	+1-555-7211	t	2025-01-04 00:30:14.528	2025-01-04 00:30:14.528	\N
cm5hg6as70005e6awdbb1hmm0	LEI888888	LEGAL	Michael	Jones	CTO	contact45@example.com	+1-555-3100	t	2025-01-04 00:30:14.551	2025-01-04 00:30:14.551	\N
cm5hjvp25000bl72cmohrav2z	\N	PRIMARY	Fake	Fa		noadresss@noaddress.com	1111111111	t	2025-01-04 02:13:58.3	2025-01-04 02:13:58.3	cm5hjvp240009l72cgg2lurei
\.


--
-- Data for Name: Counterparty; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Counterparty" (id, "entityId", status, "createdAt", "updatedAt") FROM stdin;
cm5hjvp240009l72cgg2lurei	CP-1735956838299	ACTIVE	2025-01-04 02:13:58.3	2025-01-04 02:13:58.3
cm5hk0sd9000fl72cy8rrsgwf	LEI888888	ACTIVE	2025-01-04 02:17:55.869	2025-01-04 02:17:55.869
\.


--
-- Data for Name: CounterpartyContact; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CounterpartyContact" (id, "counterpartyId", type, "firstName", "lastName", title, email, phone, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CreditAgreement; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CreditAgreement" (id, "agreementNumber", "borrowerId", "lenderId", status, amount, currency, "startDate", "maturityDate", "interestRate", description, "createdAt", "updatedAt") FROM stdin;
cm5higle3000yk7kzxt47aqbc	CA-2024-002	LEI999999	LEI888888	ACTIVE	100	USD	2025-01-04 01:33:46.634	2030-01-04 01:33:46.634	1	\N	2025-01-04 01:34:14.092	2025-01-04 01:34:14.092
\.


--
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Entity" (id, "legalName", dba, "taxId", "countryOfIncorporation", status, "isAgent", "createdAt", "updatedAt") FROM stdin;
LEI999999	Test Company Inc.	\N	TAX123	US	ACTIVE	f	2025-01-04 00:30:14.528	2025-01-04 00:30:14.528
LEI888888	Bank of Test	Test Bank	BANK456	US	ACTIVE	t	2025-01-04 00:30:14.551	2025-01-04 00:30:14.551
CP-1735956838299	New Counterparty	\N	\N	\N	ACTIVE	f	2025-01-04 02:13:58.3	2025-01-04 02:13:58.3
\.


--
-- Data for Name: Facility; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Facility" (id, "facilityName", "facilityType", "creditAgreementId", "commitmentAmount", "availableAmount", currency, "startDate", "maturityDate", "interestType", "baseRate", margin, status, description, "createdAt", "updatedAt", "outstandingAmount") FROM stdin;
cm5higle4000zk7kzy7vec5u9	FAC-001	TERM	cm5higle3000yk7kzxt47aqbc	10	10	USD	2025-01-04 01:33:46.634	2030-01-04 01:33:46.634	FLOATING	SOFR	2	ACTIVE	\N	2025-01-04 01:34:14.092	2025-01-04 01:34:14.092	0
\.


--
-- Data for Name: FacilityPosition; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."FacilityPosition" (id, "facilityId", "lenderId", share, status, "createdAt", "updatedAt", "commitmentAmount", "drawnAmount", "undrawnAmount") FROM stdin;
cm5higle40011k7kzhsu16uio	cm5higle4000zk7kzy7vec5u9	cm5hg6as90007e6awg9ul2wng	90	ACTIVE	2025-01-04 01:34:14.092	2025-01-04 03:01:09.855	9	0	0
cm5hlkdwk0011mi1m07hnfwc1	cm5higle4000zk7kzy7vec5u9	cm5hlkdw7000zmi1mwc0f0css	10	ACTIVE	2025-01-04 03:01:09.861	2025-01-04 03:01:09.861	1	1	0
\.


--
-- Data for Name: FacilityPositionHistory; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."FacilityPositionHistory" (id, "facilityId", "lenderId", "changeDateTime", "changeType", "previousCommitmentAmount", "newCommitmentAmount", "previousUndrawnAmount", "newUndrawnAmount", "previousDrawnAmount", "newDrawnAmount", "previousShare", "newShare", "previousStatus", "newStatus", "changeAmount", "userId", notes, "servicingActivityId", "tradeId", "createdAt", "updatedAt") FROM stdin;
cm5hliy2d000qmi1myccdp2ml	cm5higle4000zk7kzy7vec5u9	cm5hg6as90007e6awg9ul2wng	2025-01-04 03:00:02.652	TRADE	10	9	0	0	1	0	100	90	ACTIVE	ACTIVE	-1	SYSTEM	Trade cm5hlimdj000emi1mxxu24lsy completed - Seller position updated	\N	cm5hlimdj000emi1mxxu24lsy	2025-01-04 03:00:02.653	2025-01-04 03:00:02.653
cm5hlkdwm0013mi1mpxunmamj	cm5higle4000zk7kzy7vec5u9	cm5hg6as90007e6awg9ul2wng	2025-01-04 03:01:09.862	TRADE	10	9	0	0	1	0	100	90	ACTIVE	ACTIVE	-1	SYSTEM	Trade cm5hlimdj000emi1mxxu24lsy completed - Seller position updated	\N	cm5hlimdj000emi1mxxu24lsy	2025-01-04 03:01:09.862	2025-01-04 03:01:09.862
cm5hlkdwy0015mi1m6r9fb3s9	cm5higle4000zk7kzy7vec5u9	cm5hlkdw7000zmi1mwc0f0css	2025-01-04 03:01:09.875	TRADE	1	2	0	0	1	2	10	20	ACTIVE	ACTIVE	1	SYSTEM	Trade cm5hlimdj000emi1mxxu24lsy completed - Buyer position updated	\N	cm5hlimdj000emi1mxxu24lsy	2025-01-04 03:01:09.875	2025-01-04 03:01:09.875
\.


--
-- Data for Name: FacilitySublimit; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."FacilitySublimit" (id, "facilityId", type, amount, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: KYC; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."KYC" (id, "entityId", "verificationStatus", "lenderVerified", "counterpartyVerified", "lastVerificationDate", "createdAt", "updatedAt") FROM stdin;
cm5hjvv94000dl72clnj77itv	CP-1735956838299	VERIFIED	f	t	2025-01-04 02:14:06.326	2025-01-04 02:14:06.328	2025-01-04 02:14:06.328
cm5hk6x3t0001pb7b9waidamd	LEI888888	VERIFIED	f	t	2025-01-04 02:22:41.944	2025-01-04 02:22:41.945	2025-01-04 02:22:41.945
\.


--
-- Data for Name: Lender; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Lender" (id, "entityId", status, "onboardingDate", "createdAt", "updatedAt") FROM stdin;
cm5hg6as90007e6awg9ul2wng	LEI888888	ACTIVE	2025-01-04 00:30:14.554	2025-01-04 00:30:14.554	2025-01-04 00:30:14.554
cm5hlkdw7000zmi1mwc0f0css	CP-1735956838299	ACTIVE	2025-01-04 03:01:09.847	2025-01-04 03:01:09.847	2025-01-04 03:01:09.847
\.


--
-- Data for Name: LenderPositionHistory; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."LenderPositionHistory" (id, "facilityId", "lenderId", "changeDateTime", "changeType", "previousAccruedInterest", "newAccruedInterest", "changeAmount", "userId", notes, "createdAt", "updatedAt", "servicingActivityId", "tradeId", "newCommitmentAmount", "newDrawnAmount", "newUndrawnAmount", "previousCommitmentAmount", "previousDrawnAmount", "previousUndrawnAmount") FROM stdin;
cm5hipybb0004l72c1w30psll	cm5higle4000zk7kzy7vec5u9	LEI888888	2025-01-04 01:41:30.744	DRAWDOWN	0	0	1	SYSTEM	Loan drawdown from FAC-001	2025-01-04 01:41:30.744	2025-01-04 01:41:30.744	\N	\N	10	1	9	10	0	10
\.


--
-- Data for Name: Loan; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Loan" (id, "facilityId", amount, "outstandingAmount", currency, status, "interestPeriod", "drawDate", "baseRate", "effectiveRate", "createdAt", "updatedAt") FROM stdin;
cm5hipyal0002l72cdqtm8pbv	cm5higle4000zk7kzy7vec5u9	1	1	USD	ACTIVE	1M	2025-01-04 01:41:30.635	1.00000	3.00000	2025-01-04 01:41:30.717	2025-01-04 01:41:30.716
\.


--
-- Data for Name: ServicingActivity; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingActivity" (id, "facilityId", "dueDate", description, amount, status, "completedAt", "completedBy", "createdAt", "updatedAt", "activityType") FROM stdin;
cm5hipyc10008l72cufoy3mal	cm5higle4000zk7kzy7vec5u9	2025-01-04 01:41:30.635	Loan drawdown from FAC-001	1	COMPLETED	\N	\N	2025-01-04 01:41:30.769	2025-01-04 01:41:30.769	DRAWDOWN
\.


--
-- Data for Name: ServicingAssignment; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingAssignment" (id, "counterpartyId", "roleId", "startDate", "endDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServicingRole; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingRole" (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServicingTeamMember; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingTeamMember" (id, "assignmentId", "firstName", "lastName", email, phone, title, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Trade; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Trade" (id, "facilityId", "sellerCounterpartyId", "buyerCounterpartyId", "tradeDate", "settlementDate", "parAmount", price, status, "createdAt", "updatedAt", "settlementAmount") FROM stdin;
cm5hkxvqs0003mi1mlhveef86	cm5higle4000zk7kzy7vec5u9	cm5hk0sd9000fl72cy8rrsgwf	cm5hjvp240009l72cgg2lurei	2025-01-04 02:43:39.891	2025-01-05 02:41:57.544	1	1	COMPLETED	2025-01-04 02:43:39.892	2025-01-04 02:49:45.092	0.01
cm5hlimdj000emi1mxxu24lsy	cm5higle4000zk7kzy7vec5u9	cm5hk0sd9000fl72cy8rrsgwf	cm5hjvp240009l72cgg2lurei	2025-01-04 02:59:47.526	2025-01-05 02:59:35.563	1	1	COMPLETED	2025-01-04 02:59:47.527	2025-01-04 03:01:09.838	0.01
\.


--
-- Data for Name: TradeStatusChange; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."TradeStatusChange" (id, "tradeId", "fromStatus", "toStatus", description, "createdAt", "updatedAt") FROM stdin;
cm5hl4blf0006mi1mghpeifsa	cm5hkxvqs0003mi1mlhveef86	PENDING	CONFIRMED	\N	2025-01-04 02:48:40.371	2025-01-04 02:48:40.371
cm5hl4f600008mi1m01b4jdow	cm5hkxvqs0003mi1mlhveef86	CONFIRMED	SETTLED	\N	2025-01-04 02:48:45	2025-01-04 02:48:45
cm5hl5pjo000bmi1m1yt4aoi1	cm5hkxvqs0003mi1mlhveef86	SETTLED	CLOSED	\N	2025-01-04 02:49:45.108	2025-01-04 02:49:45.108
cm5hliqim000hmi1m59d448pq	cm5hlimdj000emi1mxxu24lsy	PENDING	CONFIRMED	\N	2025-01-04 02:59:52.894	2025-01-04 02:59:52.894
cm5hlitr6000jmi1mwx2nkq7f	cm5hlimdj000emi1mxxu24lsy	CONFIRMED	SETTLED	\N	2025-01-04 02:59:57.09	2025-01-04 02:59:57.09
cm5hlkdx20017mi1mo99f7fl4	cm5hlimdj000emi1mxxu24lsy	SETTLED	CLOSED	\N	2025-01-04 03:01:09.879	2025-01-04 03:01:09.879
\.


--
-- Data for Name: TransactionHistory; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."TransactionHistory" (id, "creditAgreementId", "loanId", "tradeId", "servicingActivityId", "activityType", amount, currency, status, description, "effectiveDate", "processedBy", "createdAt", "updatedAt", "facilityOutstandingAmount") FROM stdin;
cm5hipybl0006l72cyhlc0k6v	\N	cm5hipyal0002l72cdqtm8pbv	\N	\N	LOAN_DRAWDOWN	1	USD	COMPLETED	Loan drawdown from FAC-001	2025-01-04 01:41:30.635	SYSTEM	2025-01-04 01:41:30.753	2025-01-04 01:41:30.752	\N
cm5hkxvqs0004mi1m6j3c2ofx	\N	\N	cm5hkxvqs0003mi1mlhveef86	\N	TRADE_CREATED	1	USD	PENDING	Trade created	2025-01-04 02:43:39.891	SYSTEM	2025-01-04 02:43:39.892	2025-01-04 02:43:39.892	\N
cm5hlimdj000fmi1mgo0hh2ff	\N	\N	cm5hlimdj000emi1mxxu24lsy	\N	TRADE_CREATED	1	USD	PENDING	Trade created	2025-01-04 02:59:47.526	SYSTEM	2025-01-04 02:59:47.527	2025-01-04 02:59:47.527	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
28a14607-cae3-4cc4-9279-06200824d1bc	b92d1ed21cc553207af59cff0cea09b703801ddcb5c281b38d028abb7187b194	2025-01-03 19:30:13.053995-05	20250102214519_add_drawdown_position_change_type	\N	\N	2025-01-03 19:30:13.053295-05	1
8def0474-3d61-4d04-b1f0-cc39abafebd1	4e30124d60cbf33e7a7366dd43542ddd9657ddd1b31988b4bfbc56e0fd2cb612	2025-01-03 19:30:13.023012-05	20250102020531_init	\N	\N	2025-01-03 19:30:12.959497-05	1
0e14c45f-3ead-4dce-95b6-d1b192831fa9	70b09fad9d39a6fc4668f97bfef66494ce8973d4bc488fad284639bc9690d43b	2025-01-03 19:30:13.028477-05	20250102025654_add_lender_position_history	\N	\N	2025-01-03 19:30:13.023839-05	1
13da7fba-876a-4295-91fd-b6636572906f	4ec6e05cdffda9f85e3581c8ede17dc2c3d2c4d37bcbd681ecaf9b04bcf20760	2025-01-03 19:30:13.034353-05	20250102041744_update_lender_position_history	\N	\N	2025-01-03 19:30:13.028902-05	1
f0698b46-61ec-45a2-a48f-af6ac30a3b8d	f28d13a69eb6978ddd0aea7d919aaac57082fd16ef205a9e65dbabfd8f682fb8	2025-01-03 19:30:13.056674-05	20250103124252_remove_counterparty_types	\N	\N	2025-01-03 19:30:13.054443-05	1
283c0f2e-8be2-41a6-b2a5-edf71fc7b11c	32ab715af55473d59b16d49d18ec30e80635c7f3049f95993fbf9168af289395	2025-01-03 19:30:13.037458-05	20250102143856_add_trade_status_change	\N	\N	2025-01-03 19:30:13.034997-05	1
63f28c51-abce-47d3-9246-208639654262	17ae556eac6d16d4f141f30849110b280eb74edf13a13d57f7421bc5dabe3941	2025-01-03 19:30:13.038754-05	20250102181244_add_facility_outstanding_amount	\N	\N	2025-01-03 19:30:13.037966-05	1
9309e4ac-851d-415f-8a86-6317dc5072ba	47f9ba7d6a53c7b57329a7c8cbf2ca05da621f8b529324a1daa2dcf1261696f4	2025-01-03 19:30:13.040207-05	20250102181405_add_facility_outstanding_amount_to_transaction	\N	\N	2025-01-03 19:30:13.039411-05	1
05641034-7955-44e2-84e8-dd40d15f676b	ab6599ea42d02454d1f5d2b0956f44ce50b7a142bff2928d70604246c089230e	2025-01-03 19:30:13.064126-05	20250103214323_add_facility_position_history	\N	\N	2025-01-03 19:30:13.057116-05	1
ef1cdf46-e847-4edb-a359-b4733a02c28d	b575e5f2bc9a8eb7b1c80fd453c58577c5927e0cfc2ae7964ccb9057063a0787	2025-01-03 19:30:13.042973-05	20250102182953_add_facility_outstanding_amount	\N	\N	2025-01-03 19:30:13.040619-05	1
1bc872e1-5aba-4ed8-b116-12e49384c2d7	de35ccc1f9703580b8f5fc31ce26275bdbeb3af688301722ded6d31cf882a2af	2025-01-03 19:30:13.044387-05	20250102185621_add_commitment_reduced_to_transaction_history	\N	\N	2025-01-03 19:30:13.04363-05	1
c32dfe23-7211-43e5-9a7d-29ca718e737a	0414f05682e4a51ca61e28b0a5d5ec47cf487299ed01b4117d31254f86ef2a77	2025-01-03 19:30:13.046587-05	20250102190610_remove_commitment_reduced_field	\N	\N	2025-01-03 19:30:13.045831-05	1
33cd0f99-d533-4e41-89f4-7ed0dd908544	ed55be26d37a028ca62401dbed33d6eeda642100649386caf27a4c9e47fa8530	2025-01-03 20:20:58.396729-05	20250104012058_rename_servicing_activity_type_field	\N	\N	2025-01-03 20:20:58.388893-05	1
ba2d130b-d360-4b47-a7ee-e995e6d7339c	edcb9f59bde3d4fd7490766f8a32242361d28e75c7e599a3fde9dd84c2182f45	2025-01-03 19:30:13.048752-05	20250102201729_add_kyc_status_to_borrower	\N	\N	2025-01-03 19:30:13.047181-05	1
37c5568d-5fb1-49d3-88c6-30e0061beb3d	478c0312895781c2f9fdbb22ca2a19ebec691288a53b6cf73fd6b1836b67a526	2025-01-03 19:30:13.051166-05	20250102212443_update_facility_position_amounts	\N	\N	2025-01-03 19:30:13.049146-05	1
468686f7-347f-4d61-afbc-6e817d644543	4794e2b4889366a3252104d35af0b84c4977dbdc206a62eb95a3b3b5c6f95287	2025-01-03 19:30:13.05275-05	20250102212643_update_position_history_amounts	\N	\N	2025-01-03 19:30:13.051736-05	1
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: BeneficialOwner BeneficialOwner_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."BeneficialOwner"
    ADD CONSTRAINT "BeneficialOwner_pkey" PRIMARY KEY (id);


--
-- Name: Borrower Borrower_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Borrower"
    ADD CONSTRAINT "Borrower_pkey" PRIMARY KEY (id);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: CounterpartyContact CounterpartyContact_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CounterpartyContact"
    ADD CONSTRAINT "CounterpartyContact_pkey" PRIMARY KEY (id);


--
-- Name: Counterparty Counterparty_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Counterparty"
    ADD CONSTRAINT "Counterparty_pkey" PRIMARY KEY (id);


--
-- Name: CreditAgreement CreditAgreement_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CreditAgreement"
    ADD CONSTRAINT "CreditAgreement_pkey" PRIMARY KEY (id);


--
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- Name: FacilityPositionHistory FacilityPositionHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPositionHistory"
    ADD CONSTRAINT "FacilityPositionHistory_pkey" PRIMARY KEY (id);


--
-- Name: FacilityPosition FacilityPosition_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPosition"
    ADD CONSTRAINT "FacilityPosition_pkey" PRIMARY KEY (id);


--
-- Name: FacilitySublimit FacilitySublimit_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilitySublimit"
    ADD CONSTRAINT "FacilitySublimit_pkey" PRIMARY KEY (id);


--
-- Name: Facility Facility_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Facility"
    ADD CONSTRAINT "Facility_pkey" PRIMARY KEY (id);


--
-- Name: KYC KYC_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_pkey" PRIMARY KEY (id);


--
-- Name: LenderPositionHistory LenderPositionHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."LenderPositionHistory"
    ADD CONSTRAINT "LenderPositionHistory_pkey" PRIMARY KEY (id);


--
-- Name: Lender Lender_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Lender"
    ADD CONSTRAINT "Lender_pkey" PRIMARY KEY (id);


--
-- Name: Loan Loan_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Loan"
    ADD CONSTRAINT "Loan_pkey" PRIMARY KEY (id);


--
-- Name: ServicingActivity ServicingActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingActivity"
    ADD CONSTRAINT "ServicingActivity_pkey" PRIMARY KEY (id);


--
-- Name: ServicingAssignment ServicingAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingAssignment"
    ADD CONSTRAINT "ServicingAssignment_pkey" PRIMARY KEY (id);


--
-- Name: ServicingRole ServicingRole_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingRole"
    ADD CONSTRAINT "ServicingRole_pkey" PRIMARY KEY (id);


--
-- Name: ServicingTeamMember ServicingTeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingTeamMember"
    ADD CONSTRAINT "ServicingTeamMember_pkey" PRIMARY KEY (id);


--
-- Name: TradeStatusChange TradeStatusChange_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TradeStatusChange"
    ADD CONSTRAINT "TradeStatusChange_pkey" PRIMARY KEY (id);


--
-- Name: Trade Trade_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_pkey" PRIMARY KEY (id);


--
-- Name: TransactionHistory TransactionHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TransactionHistory"
    ADD CONSTRAINT "TransactionHistory_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Address_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Address_counterpartyId_idx" ON public."Address" USING btree ("counterpartyId");


--
-- Name: Address_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Address_entityId_idx" ON public."Address" USING btree ("entityId");


--
-- Name: BeneficialOwner_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "BeneficialOwner_entityId_idx" ON public."BeneficialOwner" USING btree ("entityId");


--
-- Name: Borrower_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Borrower_entityId_idx" ON public."Borrower" USING btree ("entityId");


--
-- Name: Borrower_entityId_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "Borrower_entityId_key" ON public."Borrower" USING btree ("entityId");


--
-- Name: Contact_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Contact_counterpartyId_idx" ON public."Contact" USING btree ("counterpartyId");


--
-- Name: Contact_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Contact_entityId_idx" ON public."Contact" USING btree ("entityId");


--
-- Name: CounterpartyContact_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "CounterpartyContact_counterpartyId_idx" ON public."CounterpartyContact" USING btree ("counterpartyId");


--
-- Name: Counterparty_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Counterparty_entityId_idx" ON public."Counterparty" USING btree ("entityId");


--
-- Name: Counterparty_entityId_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "Counterparty_entityId_key" ON public."Counterparty" USING btree ("entityId");


--
-- Name: CreditAgreement_agreementNumber_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON public."CreditAgreement" USING btree ("agreementNumber");


--
-- Name: CreditAgreement_borrowerId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "CreditAgreement_borrowerId_idx" ON public."CreditAgreement" USING btree ("borrowerId");


--
-- Name: CreditAgreement_lenderId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "CreditAgreement_lenderId_idx" ON public."CreditAgreement" USING btree ("lenderId");


--
-- Name: FacilityPositionHistory_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilityPositionHistory_facilityId_idx" ON public."FacilityPositionHistory" USING btree ("facilityId");


--
-- Name: FacilityPositionHistory_lenderId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilityPositionHistory_lenderId_idx" ON public."FacilityPositionHistory" USING btree ("lenderId");


--
-- Name: FacilityPositionHistory_servicingActivityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilityPositionHistory_servicingActivityId_idx" ON public."FacilityPositionHistory" USING btree ("servicingActivityId");


--
-- Name: FacilityPositionHistory_tradeId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilityPositionHistory_tradeId_idx" ON public."FacilityPositionHistory" USING btree ("tradeId");


--
-- Name: FacilityPosition_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilityPosition_facilityId_idx" ON public."FacilityPosition" USING btree ("facilityId");


--
-- Name: FacilityPosition_lenderId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilityPosition_lenderId_idx" ON public."FacilityPosition" USING btree ("lenderId");


--
-- Name: FacilitySublimit_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "FacilitySublimit_facilityId_idx" ON public."FacilitySublimit" USING btree ("facilityId");


--
-- Name: Facility_creditAgreementId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Facility_creditAgreementId_idx" ON public."Facility" USING btree ("creditAgreementId");


--
-- Name: KYC_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "KYC_entityId_idx" ON public."KYC" USING btree ("entityId");


--
-- Name: KYC_entityId_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "KYC_entityId_key" ON public."KYC" USING btree ("entityId");


--
-- Name: LenderPositionHistory_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "LenderPositionHistory_facilityId_idx" ON public."LenderPositionHistory" USING btree ("facilityId");


--
-- Name: LenderPositionHistory_lenderId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "LenderPositionHistory_lenderId_idx" ON public."LenderPositionHistory" USING btree ("lenderId");


--
-- Name: LenderPositionHistory_servicingActivityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "LenderPositionHistory_servicingActivityId_idx" ON public."LenderPositionHistory" USING btree ("servicingActivityId");


--
-- Name: LenderPositionHistory_tradeId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "LenderPositionHistory_tradeId_idx" ON public."LenderPositionHistory" USING btree ("tradeId");


--
-- Name: Lender_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Lender_entityId_idx" ON public."Lender" USING btree ("entityId");


--
-- Name: Lender_entityId_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "Lender_entityId_key" ON public."Lender" USING btree ("entityId");


--
-- Name: Loan_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Loan_facilityId_idx" ON public."Loan" USING btree ("facilityId");


--
-- Name: ServicingActivity_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingActivity_facilityId_idx" ON public."ServicingActivity" USING btree ("facilityId");


--
-- Name: ServicingAssignment_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingAssignment_counterpartyId_idx" ON public."ServicingAssignment" USING btree ("counterpartyId");


--
-- Name: ServicingAssignment_roleId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingAssignment_roleId_idx" ON public."ServicingAssignment" USING btree ("roleId");


--
-- Name: ServicingRole_name_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "ServicingRole_name_key" ON public."ServicingRole" USING btree (name);


--
-- Name: ServicingTeamMember_assignmentId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingTeamMember_assignmentId_idx" ON public."ServicingTeamMember" USING btree ("assignmentId");


--
-- Name: TradeStatusChange_tradeId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "TradeStatusChange_tradeId_idx" ON public."TradeStatusChange" USING btree ("tradeId");


--
-- Name: Trade_buyerCounterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Trade_buyerCounterpartyId_idx" ON public."Trade" USING btree ("buyerCounterpartyId");


--
-- Name: Trade_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Trade_facilityId_idx" ON public."Trade" USING btree ("facilityId");


--
-- Name: Trade_sellerCounterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Trade_sellerCounterpartyId_idx" ON public."Trade" USING btree ("sellerCounterpartyId");


--
-- Name: TransactionHistory_creditAgreementId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "TransactionHistory_creditAgreementId_idx" ON public."TransactionHistory" USING btree ("creditAgreementId");


--
-- Name: TransactionHistory_loanId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "TransactionHistory_loanId_idx" ON public."TransactionHistory" USING btree ("loanId");


--
-- Name: TransactionHistory_servicingActivityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "TransactionHistory_servicingActivityId_idx" ON public."TransactionHistory" USING btree ("servicingActivityId");


--
-- Name: TransactionHistory_tradeId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "TransactionHistory_tradeId_idx" ON public."TransactionHistory" USING btree ("tradeId");


--
-- Name: Address Address_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Address Address_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BeneficialOwner BeneficialOwner_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."BeneficialOwner"
    ADD CONSTRAINT "BeneficialOwner_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Borrower Borrower_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Borrower"
    ADD CONSTRAINT "Borrower_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Contact Contact_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Contact Contact_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CounterpartyContact CounterpartyContact_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CounterpartyContact"
    ADD CONSTRAINT "CounterpartyContact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Counterparty Counterparty_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Counterparty"
    ADD CONSTRAINT "Counterparty_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditAgreement CreditAgreement_borrowerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CreditAgreement"
    ADD CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditAgreement CreditAgreement_lenderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CreditAgreement"
    ADD CONSTRAINT "CreditAgreement_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacilityPositionHistory FacilityPositionHistory_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPositionHistory"
    ADD CONSTRAINT "FacilityPositionHistory_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacilityPositionHistory FacilityPositionHistory_lenderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPositionHistory"
    ADD CONSTRAINT "FacilityPositionHistory_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES public."Lender"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacilityPositionHistory FacilityPositionHistory_servicingActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPositionHistory"
    ADD CONSTRAINT "FacilityPositionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES public."ServicingActivity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FacilityPositionHistory FacilityPositionHistory_tradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPositionHistory"
    ADD CONSTRAINT "FacilityPositionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES public."Trade"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FacilityPosition FacilityPosition_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPosition"
    ADD CONSTRAINT "FacilityPosition_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacilityPosition FacilityPosition_lenderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilityPosition"
    ADD CONSTRAINT "FacilityPosition_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES public."Lender"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacilitySublimit FacilitySublimit_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."FacilitySublimit"
    ADD CONSTRAINT "FacilitySublimit_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Facility Facility_creditAgreementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Facility"
    ADD CONSTRAINT "Facility_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES public."CreditAgreement"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KYC KYC_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LenderPositionHistory LenderPositionHistory_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."LenderPositionHistory"
    ADD CONSTRAINT "LenderPositionHistory_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LenderPositionHistory LenderPositionHistory_lenderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."LenderPositionHistory"
    ADD CONSTRAINT "LenderPositionHistory_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LenderPositionHistory LenderPositionHistory_servicingActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."LenderPositionHistory"
    ADD CONSTRAINT "LenderPositionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES public."ServicingActivity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LenderPositionHistory LenderPositionHistory_tradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."LenderPositionHistory"
    ADD CONSTRAINT "LenderPositionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES public."Trade"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lender Lender_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Lender"
    ADD CONSTRAINT "Lender_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Loan Loan_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Loan"
    ADD CONSTRAINT "Loan_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServicingActivity ServicingActivity_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingActivity"
    ADD CONSTRAINT "ServicingActivity_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServicingAssignment ServicingAssignment_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingAssignment"
    ADD CONSTRAINT "ServicingAssignment_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServicingAssignment ServicingAssignment_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingAssignment"
    ADD CONSTRAINT "ServicingAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."ServicingRole"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServicingTeamMember ServicingTeamMember_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingTeamMember"
    ADD CONSTRAINT "ServicingTeamMember_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."ServicingAssignment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TradeStatusChange TradeStatusChange_tradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TradeStatusChange"
    ADD CONSTRAINT "TradeStatusChange_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES public."Trade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Trade Trade_buyerCounterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_buyerCounterpartyId_fkey" FOREIGN KEY ("buyerCounterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Trade Trade_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Trade Trade_sellerCounterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_sellerCounterpartyId_fkey" FOREIGN KEY ("sellerCounterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransactionHistory TransactionHistory_creditAgreementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TransactionHistory"
    ADD CONSTRAINT "TransactionHistory_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES public."CreditAgreement"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransactionHistory TransactionHistory_loanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TransactionHistory"
    ADD CONSTRAINT "TransactionHistory_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES public."Loan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransactionHistory TransactionHistory_servicingActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TransactionHistory"
    ADD CONSTRAINT "TransactionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES public."ServicingActivity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransactionHistory TransactionHistory_tradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."TransactionHistory"
    ADD CONSTRAINT "TransactionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES public."Trade"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

