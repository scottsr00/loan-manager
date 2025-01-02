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
    'TRADE'
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
    name text NOT NULL,
    "taxId" text,
    "countryOfIncorporation" text,
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
    "typeId" text NOT NULL,
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
-- Name: CounterpartyType; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."CounterpartyType" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CounterpartyType" OWNER TO stephenscott;

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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Facility" OWNER TO stephenscott;

--
-- Name: FacilityPosition; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."FacilityPosition" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "lenderId" text NOT NULL,
    amount double precision NOT NULL,
    share double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FacilityPosition" OWNER TO stephenscott;

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
    "previousOutstandingAmount" double precision NOT NULL,
    "newOutstandingAmount" double precision NOT NULL,
    "previousAccruedInterest" double precision NOT NULL,
    "newAccruedInterest" double precision NOT NULL,
    "changeAmount" double precision NOT NULL,
    "userId" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "servicingActivityId" text,
    "tradeId" text
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
    "activityType" text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    description text,
    amount double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "completedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
cm5ep9x0m0006kj5dqbrk7zw5	LEI000000	\N	LEGAL	576 Main St	\N	Sydney	\N	43344	Australia	t	2025-01-02 02:21:41.351	2025-01-02 02:21:41.351
cm5ep9x1c0009kj5dc95x5ht8	LEI000001	\N	PHYSICAL	322 Main St	\N	London	CA	43519	UK	t	2025-01-02 02:21:41.376	2025-01-02 02:21:41.376
cm5ep9x1c000akj5d83dsyjm2	LEI000001	\N	MAILING	561 Main St	Suite 98	Singapore	FL	23501	Singapore	f	2025-01-02 02:21:41.376	2025-01-02 02:21:41.376
cm5ep9x1k000dkj5d5yy5oglj	LEI000002	\N	LEGAL	443 Main St	\N	Tokyo	TX	56021	Japan	t	2025-01-02 02:21:41.384	2025-01-02 02:21:41.384
cm5ep9x1p000hkj5drv4i5tej	LEI000003	\N	MAILING	944 Main St	\N	New York	NY	26072	USA	t	2025-01-02 02:21:41.39	2025-01-02 02:21:41.39
cm5ep9x1v000lkj5dn0bbvevk	LEI000004	\N	PHYSICAL	316 Main St	\N	Hong Kong	IL	79186	China	t	2025-01-02 02:21:41.396	2025-01-02 02:21:41.396
cm5ep9x21000pkj5dr7t7kyae	LEI000005	\N	MAILING	509 Main St	\N	London	CA	50206	UK	t	2025-01-02 02:21:41.401	2025-01-02 02:21:41.401
cm5ep9x26000skj5dqkz0pbpb	LEI000006	\N	LEGAL	603 Main St	Suite 45	Hong Kong	IL	24216	China	t	2025-01-02 02:21:41.406	2025-01-02 02:21:41.406
cm5ep9x26000tkj5dyo3std75	LEI000006	\N	MAILING	105 Main St	Suite 17	Tokyo	TX	70932	Japan	f	2025-01-02 02:21:41.406	2025-01-02 02:21:41.406
cm5ep9x2b000wkj5d0u4a1vdy	LEI000007	\N	MAILING	488 Main St	\N	New York	NY	81943	USA	t	2025-01-02 02:21:41.411	2025-01-02 02:21:41.411
cm5ep9x2b000xkj5dtq14h4in	LEI000007	\N	MAILING	498 Main St	\N	Hong Kong	IL	88775	China	f	2025-01-02 02:21:41.411	2025-01-02 02:21:41.411
cm5ep9x2h0011kj5dtosgpt12	LEI000008	\N	LEGAL	217 Main St	\N	Hong Kong	IL	79777	China	t	2025-01-02 02:21:41.418	2025-01-02 02:21:41.418
cm5ep9x2h0012kj5d63l2828m	LEI000008	\N	LEGAL	358 Main St	\N	Hong Kong	IL	44207	China	f	2025-01-02 02:21:41.418	2025-01-02 02:21:41.418
cm5ep9x2m0016kj5d3n1p8fpy	LEI000009	\N	LEGAL	674 Main St	\N	Sydney	\N	34170	Australia	t	2025-01-02 02:21:41.423	2025-01-02 02:21:41.423
cm5ep9x2s001akj5do7ntfy9e	LEI000010	\N	LEGAL	531 Main St	\N	New York	NY	19970	USA	t	2025-01-02 02:21:41.428	2025-01-02 02:21:41.428
cm5ep9x2s001bkj5daz472fxg	LEI000010	\N	PHYSICAL	721 Main St	\N	New York	NY	11420	USA	f	2025-01-02 02:21:41.428	2025-01-02 02:21:41.428
cm5ep9x2y001fkj5d2uqvigpb	LEI000011	\N	LEGAL	154 Main St	Suite 97	Dubai	\N	79094	UAE	t	2025-01-02 02:21:41.434	2025-01-02 02:21:41.434
cm5ep9x2y001gkj5d6d7uxrhk	LEI000011	\N	MAILING	430 Main St	Suite 35	London	CA	82732	UK	f	2025-01-02 02:21:41.434	2025-01-02 02:21:41.434
cm5ep9x34001kkj5dbpp57xhc	LEI000012	\N	LEGAL	325 Main St	\N	London	CA	23438	UK	t	2025-01-02 02:21:41.44	2025-01-02 02:21:41.44
cm5ep9x34001lkj5dxdhx7em4	LEI000012	\N	MAILING	646 Main St	\N	Singapore	FL	41985	Singapore	f	2025-01-02 02:21:41.44	2025-01-02 02:21:41.44
cm5ep9x39001okj5dh014faqg	LEI000013	\N	MAILING	753 Main St	\N	Sydney	\N	84946	Australia	t	2025-01-02 02:21:41.446	2025-01-02 02:21:41.446
cm5ep9x3f001skj5dip8n5unp	LEI000014	\N	MAILING	15 Main St	\N	Toronto	\N	40909	Canada	t	2025-01-02 02:21:41.451	2025-01-02 02:21:41.451
cm5ep9x3k001wkj5doticpn00	LEI000015	\N	LEGAL	974 Main St	\N	London	CA	61788	UK	t	2025-01-02 02:21:41.456	2025-01-02 02:21:41.456
cm5ep9x3k001xkj5d1eep6rat	LEI000015	\N	MAILING	560 Main St	Suite 47	London	CA	94620	UK	f	2025-01-02 02:21:41.456	2025-01-02 02:21:41.456
cm5ep9x3p0020kj5d8av8kfz3	LEI000016	\N	LEGAL	548 Main St	Suite 3	London	CA	11440	UK	t	2025-01-02 02:21:41.462	2025-01-02 02:21:41.462
cm5ep9x3p0021kj5d3hs4h68a	LEI000016	\N	LEGAL	289 Main St	\N	Singapore	FL	92194	Singapore	f	2025-01-02 02:21:41.462	2025-01-02 02:21:41.462
cm5ep9x3v0025kj5dtzdr2brf	LEI000017	\N	LEGAL	725 Main St	\N	Sydney	\N	59232	Australia	t	2025-01-02 02:21:41.468	2025-01-02 02:21:41.468
cm5ep9x400028kj5dkyh6yfra	LEI000018	\N	LEGAL	630 Main St	Suite 49	Toronto	\N	31563	Canada	t	2025-01-02 02:21:41.472	2025-01-02 02:21:41.472
cm5ep9x400029kj5dwaf7yso1	LEI000018	\N	LEGAL	621 Main St	\N	Sydney	\N	74959	Australia	f	2025-01-02 02:21:41.472	2025-01-02 02:21:41.472
cm5ep9x45002dkj5dl26tszbd	LEI000019	\N	LEGAL	473 Main St	Suite 35	Toronto	\N	35720	Canada	t	2025-01-02 02:21:41.478	2025-01-02 02:21:41.478
cm5ep9x45002ekj5dz61un9u0	LEI000019	\N	PHYSICAL	890 Main St	\N	Dubai	\N	64925	UAE	f	2025-01-02 02:21:41.478	2025-01-02 02:21:41.478
cm5ep9x4c002ikj5dfmo3xmel	LEI000020	\N	PHYSICAL	57 Main St	\N	New York	NY	18510	USA	t	2025-01-02 02:21:41.484	2025-01-02 02:21:41.484
cm5ep9x4h002lkj5dddhat9mq	LEI000021	\N	PHYSICAL	749 Main St	\N	Sydney	\N	29766	Australia	t	2025-01-02 02:21:41.489	2025-01-02 02:21:41.489
cm5ep9x4l002pkj5d1q4sqbqw	LEI000022	\N	PHYSICAL	119 Main St	\N	Toronto	\N	67872	Canada	t	2025-01-02 02:21:41.493	2025-01-02 02:21:41.493
cm5ep9x4q002tkj5dc9hldk3u	LEI000023	\N	PHYSICAL	920 Main St	\N	Dubai	\N	51516	UAE	t	2025-01-02 02:21:41.498	2025-01-02 02:21:41.498
cm5ep9x4u002xkj5dqsu3x55f	LEI000024	\N	MAILING	305 Main St	Suite 26	Dubai	\N	10089	UAE	t	2025-01-02 02:21:41.502	2025-01-02 02:21:41.502
cm5ep9x4y0030kj5dlbgs1muh	LEI000025	\N	MAILING	417 Main St	\N	Tokyo	TX	74242	Japan	t	2025-01-02 02:21:41.506	2025-01-02 02:21:41.506
cm5ep9x4y0031kj5d3bfnhqzw	LEI000025	\N	PHYSICAL	717 Main St	\N	London	CA	71410	UK	f	2025-01-02 02:21:41.506	2025-01-02 02:21:41.506
cm5ep9x530035kj5d57ote3bb	LEI000026	\N	LEGAL	940 Main St	Suite 14	London	CA	88739	UK	t	2025-01-02 02:21:41.512	2025-01-02 02:21:41.512
cm5ep9x530036kj5d1fm4u00d	LEI000026	\N	PHYSICAL	804 Main St	\N	Singapore	FL	88252	Singapore	f	2025-01-02 02:21:41.512	2025-01-02 02:21:41.512
cm5ep9x580039kj5d0z2h2g72	LEI000027	\N	LEGAL	56 Main St	Suite 99	Singapore	FL	45327	Singapore	t	2025-01-02 02:21:41.516	2025-01-02 02:21:41.516
cm5ep9x5c003dkj5dp6hoichu	LEI000028	\N	LEGAL	182 Main St	\N	New York	NY	53385	USA	t	2025-01-02 02:21:41.52	2025-01-02 02:21:41.52
cm5ep9x5c003ekj5dc1clesxq	LEI000028	\N	MAILING	309 Main St	\N	London	CA	70339	UK	f	2025-01-02 02:21:41.52	2025-01-02 02:21:41.52
cm5ep9x5h003hkj5dvd8ysgwu	LEI000029	\N	MAILING	157 Main St	Suite 2	London	CA	69830	UK	t	2025-01-02 02:21:41.525	2025-01-02 02:21:41.525
cm5ep9x5h003ikj5dadgo0n5w	LEI000029	\N	LEGAL	585 Main St	\N	Dubai	\N	26945	UAE	f	2025-01-02 02:21:41.525	2025-01-02 02:21:41.525
cm5ep9x5l003lkj5djsuyil7o	LEI000030	\N	LEGAL	436 Main St	Suite 97	Singapore	FL	86876	Singapore	t	2025-01-02 02:21:41.53	2025-01-02 02:21:41.53
cm5ep9x5q003pkj5d7u6r7fic	LEI000031	\N	LEGAL	293 Main St	Suite 28	Singapore	FL	51017	Singapore	t	2025-01-02 02:21:41.534	2025-01-02 02:21:41.534
cm5ep9x5u003tkj5dbtqyodjk	LEI000032	\N	MAILING	371 Main St	Suite 61	Dubai	\N	24402	UAE	t	2025-01-02 02:21:41.538	2025-01-02 02:21:41.538
cm5ep9x5u003ukj5detd50hwu	LEI000032	\N	LEGAL	359 Main St	\N	New York	NY	70104	USA	f	2025-01-02 02:21:41.538	2025-01-02 02:21:41.538
cm5ep9x5y003xkj5d2t1df5yg	LEI000033	\N	MAILING	197 Main St	Suite 77	Singapore	FL	18500	Singapore	t	2025-01-02 02:21:41.542	2025-01-02 02:21:41.542
cm5ep9x5y003ykj5dp2710866	LEI000033	\N	LEGAL	540 Main St	Suite 48	London	CA	17638	UK	f	2025-01-02 02:21:41.542	2025-01-02 02:21:41.542
cm5ep9x630041kj5dg3heutdy	LEI000034	\N	LEGAL	799 Main St	\N	Dubai	\N	72013	UAE	t	2025-01-02 02:21:41.547	2025-01-02 02:21:41.547
cm5ep9x680045kj5d3hhtm3j3	LEI000035	\N	LEGAL	974 Main St	\N	Dubai	\N	59748	UAE	t	2025-01-02 02:21:41.552	2025-01-02 02:21:41.552
cm5ep9x680046kj5dil6uv3at	LEI000035	\N	PHYSICAL	806 Main St	Suite 13	Toronto	\N	50697	Canada	f	2025-01-02 02:21:41.552	2025-01-02 02:21:41.552
cm5ep9x6c0049kj5dzviswkq1	LEI000036	\N	MAILING	535 Main St	\N	Hong Kong	IL	51041	China	t	2025-01-02 02:21:41.556	2025-01-02 02:21:41.556
cm5ep9x6i004ckj5dalesu1to	LEI000037	\N	MAILING	489 Main St	\N	Dubai	\N	74310	UAE	t	2025-01-02 02:21:41.563	2025-01-02 02:21:41.563
cm5ep9x6n004gkj5di6hhq1av	LEI000038	\N	MAILING	550 Main St	\N	Toronto	\N	22323	Canada	t	2025-01-02 02:21:41.568	2025-01-02 02:21:41.568
cm5ep9x6n004hkj5dqkfbe4yx	LEI000038	\N	MAILING	67 Main St	\N	Tokyo	TX	94854	Japan	f	2025-01-02 02:21:41.568	2025-01-02 02:21:41.568
cm5ep9x6s004lkj5dp05jspk0	LEI000039	\N	PHYSICAL	911 Main St	\N	Dubai	\N	80728	UAE	t	2025-01-02 02:21:41.572	2025-01-02 02:21:41.572
cm5ep9x6s004mkj5d18t4sn4m	LEI000039	\N	PHYSICAL	379 Main St	\N	Tokyo	TX	24560	Japan	f	2025-01-02 02:21:41.572	2025-01-02 02:21:41.572
cm5ep9x6v004qkj5dlmmumqhf	LEI000040	\N	LEGAL	213 Main St	\N	London	CA	98513	UK	t	2025-01-02 02:21:41.576	2025-01-02 02:21:41.576
cm5ep9x6v004rkj5dqixdh9mt	LEI000040	\N	LEGAL	117 Main St	\N	Toronto	\N	31399	Canada	f	2025-01-02 02:21:41.576	2025-01-02 02:21:41.576
cm5ep9x6z004ukj5dse3adht9	LEI000041	\N	PHYSICAL	831 Main St	\N	Sydney	\N	66519	Australia	t	2025-01-02 02:21:41.58	2025-01-02 02:21:41.58
cm5ep9x6z004vkj5d7gn6gtzh	LEI000041	\N	LEGAL	59 Main St	\N	New York	NY	46425	USA	f	2025-01-02 02:21:41.58	2025-01-02 02:21:41.58
cm5ep9x75004zkj5damd6lx65	LEI000042	\N	MAILING	699 Main St	Suite 63	Singapore	FL	26041	Singapore	t	2025-01-02 02:21:41.586	2025-01-02 02:21:41.586
cm5ep9x7a0053kj5dtx9nagn2	LEI000043	\N	LEGAL	649 Main St	\N	London	CA	51172	UK	t	2025-01-02 02:21:41.59	2025-01-02 02:21:41.59
cm5ep9x7f0056kj5dgfrth6ks	LEI000044	\N	LEGAL	189 Main St	Suite 51	Hong Kong	IL	88413	China	t	2025-01-02 02:21:41.596	2025-01-02 02:21:41.596
cm5ep9x7l005akj5deeu0jqn6	LEI000045	\N	MAILING	675 Main St	\N	Sydney	\N	41434	Australia	t	2025-01-02 02:21:41.601	2025-01-02 02:21:41.601
cm5ep9x7l005bkj5dgw4nses2	LEI000045	\N	MAILING	82 Main St	\N	London	CA	24525	UK	f	2025-01-02 02:21:41.601	2025-01-02 02:21:41.601
cm5ep9x7p005fkj5dru24j1d1	LEI000046	\N	LEGAL	722 Main St	\N	Toronto	\N	21607	Canada	t	2025-01-02 02:21:41.606	2025-01-02 02:21:41.606
cm5ep9x7t005jkj5djbvkom44	LEI000047	\N	LEGAL	727 Main St	\N	Toronto	\N	47079	Canada	t	2025-01-02 02:21:41.609	2025-01-02 02:21:41.609
cm5ep9x7t005kkj5d7pl4jhm3	LEI000047	\N	MAILING	15 Main St	\N	Tokyo	TX	11511	Japan	f	2025-01-02 02:21:41.609	2025-01-02 02:21:41.609
cm5ep9x7w005okj5dihz7qdeb	LEI000048	\N	MAILING	421 Main St	\N	Hong Kong	IL	74221	China	t	2025-01-02 02:21:41.613	2025-01-02 02:21:41.613
cm5ep9x7z005skj5drsd3dp7k	LEI000049	\N	MAILING	84 Main St	Suite 100	Dubai	\N	32498	UAE	t	2025-01-02 02:21:41.616	2025-01-02 02:21:41.616
cm5ep9x82005vkj5d9namu8ll	LEI000050	\N	PHYSICAL	62 Main St	\N	Singapore	FL	96987	Singapore	t	2025-01-02 02:21:41.618	2025-01-02 02:21:41.618
cm5ep9x85005zkj5drvygyo99	LEI000051	\N	MAILING	70 Main St	\N	Toronto	\N	37837	Canada	t	2025-01-02 02:21:41.622	2025-01-02 02:21:41.622
cm5ep9x880063kj5d474fucji	LEI000052	\N	LEGAL	492 Main St	\N	London	CA	26670	UK	t	2025-01-02 02:21:41.624	2025-01-02 02:21:41.624
cm5ep9x8a0066kj5dwgmq3exy	LEI000053	\N	LEGAL	894 Main St	Suite 29	Sydney	\N	58471	Australia	t	2025-01-02 02:21:41.627	2025-01-02 02:21:41.627
cm5ep9x8a0067kj5duekg9kz4	LEI000053	\N	LEGAL	257 Main St	Suite 92	Hong Kong	IL	45757	China	f	2025-01-02 02:21:41.627	2025-01-02 02:21:41.627
cm5ep9x8d006akj5dzl8qhzn0	LEI000054	\N	LEGAL	950 Main St	\N	Tokyo	TX	49087	Japan	t	2025-01-02 02:21:41.629	2025-01-02 02:21:41.629
cm5ep9x8d006bkj5dgm4z3wh8	LEI000054	\N	PHYSICAL	308 Main St	\N	Singapore	FL	29561	Singapore	f	2025-01-02 02:21:41.629	2025-01-02 02:21:41.629
cm5ep9x8f006ekj5de8ca20nf	LEI000055	\N	PHYSICAL	402 Main St	\N	London	CA	45251	UK	t	2025-01-02 02:21:41.631	2025-01-02 02:21:41.631
cm5ep9x8h006hkj5dlt3bthjj	LEI000056	\N	PHYSICAL	455 Main St	Suite 50	Toronto	\N	96447	Canada	t	2025-01-02 02:21:41.633	2025-01-02 02:21:41.633
cm5ep9x8h006ikj5dkfcpp99w	LEI000056	\N	MAILING	496 Main St	\N	Singapore	FL	19870	Singapore	f	2025-01-02 02:21:41.633	2025-01-02 02:21:41.633
cm5ep9x8k006lkj5dv6fs5rmg	LEI000057	\N	MAILING	278 Main St	Suite 61	Tokyo	TX	98516	Japan	t	2025-01-02 02:21:41.636	2025-01-02 02:21:41.636
cm5ep9x8k006mkj5dnh3xjcfu	LEI000057	\N	MAILING	334 Main St	Suite 78	Tokyo	TX	77043	Japan	f	2025-01-02 02:21:41.636	2025-01-02 02:21:41.636
cm5ep9x8m006pkj5d1oc3s7q4	LEI000058	\N	LEGAL	844 Main St	\N	Dubai	\N	69982	UAE	t	2025-01-02 02:21:41.638	2025-01-02 02:21:41.638
cm5ep9x8o006skj5d5n586lxj	LEI000059	\N	MAILING	111 Main St	\N	Tokyo	TX	95748	Japan	t	2025-01-02 02:21:41.64	2025-01-02 02:21:41.64
cm5ep9x8o006tkj5dr3kwvpld	LEI000059	\N	PHYSICAL	298 Main St	Suite 46	Toronto	\N	88407	Canada	f	2025-01-02 02:21:41.64	2025-01-02 02:21:41.64
cm5ep9x8q006wkj5dnqpmaxxc	LEI000060	\N	PHYSICAL	13 Main St	\N	Sydney	\N	89087	Australia	t	2025-01-02 02:21:41.642	2025-01-02 02:21:41.642
cm5ep9x8q006xkj5dlgmr4umn	LEI000060	\N	LEGAL	526 Main St	Suite 7	New York	NY	61858	USA	f	2025-01-02 02:21:41.642	2025-01-02 02:21:41.642
cm5ep9x8s0070kj5d1uqpwk7w	LEI000061	\N	LEGAL	389 Main St	Suite 38	Tokyo	TX	83490	Japan	t	2025-01-02 02:21:41.644	2025-01-02 02:21:41.644
cm5ep9x8s0071kj5dg7tyodxh	LEI000061	\N	LEGAL	721 Main St	\N	Dubai	\N	99780	UAE	f	2025-01-02 02:21:41.644	2025-01-02 02:21:41.644
cm5ep9x8u0075kj5dp9oo2445	LEI000062	\N	LEGAL	843 Main St	Suite 11	Sydney	\N	42226	Australia	t	2025-01-02 02:21:41.647	2025-01-02 02:21:41.647
cm5ep9x8w0079kj5dlvgvbki3	LEI000063	\N	PHYSICAL	61 Main St	Suite 65	Toronto	\N	99852	Canada	t	2025-01-02 02:21:41.649	2025-01-02 02:21:41.649
cm5ep9x8y007ckj5ddn5ft0mf	LEI000064	\N	PHYSICAL	497 Main St	\N	Hong Kong	IL	78159	China	t	2025-01-02 02:21:41.651	2025-01-02 02:21:41.651
cm5ep9x8y007dkj5dagg878d4	LEI000064	\N	PHYSICAL	201 Main St	\N	London	CA	77061	UK	f	2025-01-02 02:21:41.651	2025-01-02 02:21:41.651
cm5ep9x90007hkj5dm28hw73e	LEI000065	\N	LEGAL	659 Main St	\N	Dubai	\N	68446	UAE	t	2025-01-02 02:21:41.653	2025-01-02 02:21:41.653
cm5ep9x90007ikj5d18stk6a8	LEI000065	\N	MAILING	560 Main St	\N	Dubai	\N	87238	UAE	f	2025-01-02 02:21:41.653	2025-01-02 02:21:41.653
cm5ep9x93007lkj5dmzjl74m3	LEI000066	\N	LEGAL	971 Main St	\N	Sydney	\N	79651	Australia	t	2025-01-02 02:21:41.655	2025-01-02 02:21:41.655
cm5ep9x93007mkj5dcrqymko1	LEI000066	\N	PHYSICAL	352 Main St	Suite 79	New York	NY	61602	USA	f	2025-01-02 02:21:41.655	2025-01-02 02:21:41.655
cm5ep9x94007pkj5dc6eeb6cc	LEI000067	\N	MAILING	438 Main St	\N	Tokyo	TX	43435	Japan	t	2025-01-02 02:21:41.657	2025-01-02 02:21:41.657
cm5ep9x96007skj5dehwyykml	LEI000068	\N	MAILING	51 Main St	\N	New York	NY	56284	USA	t	2025-01-02 02:21:41.659	2025-01-02 02:21:41.659
cm5ep9x98007vkj5dswksbjvi	LEI000069	\N	MAILING	229 Main St	\N	Sydney	\N	51357	Australia	t	2025-01-02 02:21:41.661	2025-01-02 02:21:41.661
cm5ep9x98007wkj5d5o14mf8i	LEI000069	\N	LEGAL	749 Main St	\N	Singapore	FL	50049	Singapore	f	2025-01-02 02:21:41.661	2025-01-02 02:21:41.661
cm5ep9x9b0080kj5dwt92uhw2	LEI000070	\N	MAILING	146 Main St	Suite 10	New York	NY	74006	USA	t	2025-01-02 02:21:41.663	2025-01-02 02:21:41.663
cm5ep9x9b0081kj5d8vmli203	LEI000070	\N	MAILING	951 Main St	Suite 42	Singapore	FL	82858	Singapore	f	2025-01-02 02:21:41.663	2025-01-02 02:21:41.663
cm5ep9x9d0085kj5dbbr5cjkl	LEI000071	\N	MAILING	920 Main St	Suite 70	Toronto	\N	24806	Canada	t	2025-01-02 02:21:41.666	2025-01-02 02:21:41.666
cm5ep9x9d0086kj5da9jgxs6b	LEI000071	\N	PHYSICAL	886 Main St	\N	Hong Kong	IL	29307	China	f	2025-01-02 02:21:41.666	2025-01-02 02:21:41.666
cm5ep9x9f0089kj5d6acsa3x4	LEI000072	\N	PHYSICAL	970 Main St	Suite 26	Singapore	FL	70632	Singapore	t	2025-01-02 02:21:41.668	2025-01-02 02:21:41.668
cm5ep9x9f008akj5djily141s	LEI000072	\N	LEGAL	211 Main St	\N	Sydney	\N	95682	Australia	f	2025-01-02 02:21:41.668	2025-01-02 02:21:41.668
cm5ep9x9i008dkj5do9efkyji	LEI000073	\N	PHYSICAL	500 Main St	\N	Singapore	FL	85804	Singapore	t	2025-01-02 02:21:41.67	2025-01-02 02:21:41.67
cm5ep9x9i008ekj5ddyx4e53i	LEI000073	\N	MAILING	857 Main St	\N	Tokyo	TX	29844	Japan	f	2025-01-02 02:21:41.67	2025-01-02 02:21:41.67
cm5ep9x9k008ikj5drq755qpc	LEI000074	\N	LEGAL	656 Main St	\N	Sydney	\N	57148	Australia	t	2025-01-02 02:21:41.672	2025-01-02 02:21:41.672
cm5ep9x9m008mkj5dbifeznu8	LEI000075	\N	LEGAL	657 Main St	\N	London	CA	50451	UK	t	2025-01-02 02:21:41.675	2025-01-02 02:21:41.675
cm5ep9x9m008nkj5ds718qewe	LEI000075	\N	MAILING	40 Main St	\N	Toronto	\N	93412	Canada	f	2025-01-02 02:21:41.675	2025-01-02 02:21:41.675
cm5ep9x9p008rkj5dbr9ddb5h	LEI000076	\N	PHYSICAL	634 Main St	\N	Toronto	\N	74002	Canada	t	2025-01-02 02:21:41.678	2025-01-02 02:21:41.678
cm5ep9x9s008vkj5do4jfkspx	LEI000077	\N	LEGAL	117 Main St	\N	Singapore	FL	57814	Singapore	t	2025-01-02 02:21:41.68	2025-01-02 02:21:41.68
cm5ep9x9u008zkj5d8ltmn9kk	LEI000078	\N	MAILING	294 Main St	Suite 33	New York	NY	50858	USA	t	2025-01-02 02:21:41.683	2025-01-02 02:21:41.683
cm5ep9x9x0093kj5d7nj9v9n2	LEI000079	\N	MAILING	500 Main St	\N	London	CA	95804	UK	t	2025-01-02 02:21:41.685	2025-01-02 02:21:41.685
cm5ep9x9x0094kj5dcawneaij	LEI000079	\N	MAILING	195 Main St	\N	Sydney	\N	50361	Australia	f	2025-01-02 02:21:41.685	2025-01-02 02:21:41.685
cm5ep9x9z0098kj5dj35mysfm	LEI000080	\N	PHYSICAL	229 Main St	Suite 73	Toronto	\N	40786	Canada	t	2025-01-02 02:21:41.688	2025-01-02 02:21:41.688
cm5ep9xa2009bkj5d6brzb0nk	LEI000081	\N	LEGAL	341 Main St	\N	London	CA	50485	UK	t	2025-01-02 02:21:41.69	2025-01-02 02:21:41.69
cm5ep9xa4009ekj5dultv1290	LEI000082	\N	MAILING	454 Main St	Suite 88	Tokyo	TX	21352	Japan	t	2025-01-02 02:21:41.692	2025-01-02 02:21:41.692
cm5ep9xa6009ikj5d25dmh1gn	LEI000083	\N	MAILING	405 Main St	\N	New York	NY	75028	USA	t	2025-01-02 02:21:41.695	2025-01-02 02:21:41.695
cm5ep9xa6009jkj5dz63kisxg	LEI000083	\N	PHYSICAL	104 Main St	\N	Hong Kong	IL	95840	China	f	2025-01-02 02:21:41.695	2025-01-02 02:21:41.695
cm5ep9xa9009nkj5dxmyu6e8b	LEI000084	\N	MAILING	926 Main St	\N	Hong Kong	IL	40195	China	t	2025-01-02 02:21:41.697	2025-01-02 02:21:41.697
cm5ep9xa9009okj5dqv2xqz4d	LEI000084	\N	PHYSICAL	922 Main St	\N	New York	NY	50008	USA	f	2025-01-02 02:21:41.697	2025-01-02 02:21:41.697
cm5ep9xab009skj5dlezxra3z	LEI000085	\N	LEGAL	378 Main St	Suite 41	London	CA	23615	UK	t	2025-01-02 02:21:41.7	2025-01-02 02:21:41.7
cm5ep9xab009tkj5duzjpfz1o	LEI000085	\N	PHYSICAL	632 Main St	\N	London	CA	58111	UK	f	2025-01-02 02:21:41.7	2025-01-02 02:21:41.7
cm5ep9xae009wkj5drd008j3k	LEI000086	\N	PHYSICAL	457 Main St	\N	Singapore	FL	30053	Singapore	t	2025-01-02 02:21:41.702	2025-01-02 02:21:41.702
cm5ep9xah00a0kj5dk41ke586	LEI000087	\N	LEGAL	527 Main St	\N	Hong Kong	IL	63689	China	t	2025-01-02 02:21:41.705	2025-01-02 02:21:41.705
cm5ep9xah00a1kj5d0wzysin5	LEI000087	\N	MAILING	392 Main St	\N	Sydney	\N	94451	Australia	f	2025-01-02 02:21:41.705	2025-01-02 02:21:41.705
cm5ep9xaj00a5kj5dhhvs89q5	LEI000088	\N	PHYSICAL	311 Main St	Suite 67	New York	NY	86201	USA	t	2025-01-02 02:21:41.708	2025-01-02 02:21:41.708
cm5ep9xaj00a6kj5dbypwa44o	LEI000088	\N	LEGAL	674 Main St	Suite 16	London	CA	16293	UK	f	2025-01-02 02:21:41.708	2025-01-02 02:21:41.708
cm5ep9xam00a9kj5dg45my8ku	LEI000089	\N	PHYSICAL	892 Main St	\N	London	CA	30631	UK	t	2025-01-02 02:21:41.71	2025-01-02 02:21:41.71
cm5ep9xao00adkj5dw1d4o87m	LEI000090	\N	LEGAL	621 Main St	Suite 96	Sydney	\N	43031	Australia	t	2025-01-02 02:21:41.712	2025-01-02 02:21:41.712
cm5ep9xao00aekj5dxv3aflz9	LEI000090	\N	PHYSICAL	392 Main St	\N	London	CA	73105	UK	f	2025-01-02 02:21:41.712	2025-01-02 02:21:41.712
cm5ep9xaq00ahkj5deviqzb2n	LEI000091	\N	PHYSICAL	419 Main St	\N	Singapore	FL	41258	Singapore	t	2025-01-02 02:21:41.715	2025-01-02 02:21:41.715
cm5ep9xas00akkj5dkl1wwpes	LEI000092	\N	LEGAL	302 Main St	\N	Singapore	FL	14600	Singapore	t	2025-01-02 02:21:41.717	2025-01-02 02:21:41.717
cm5ep9xav00ankj5dynvxfrbx	LEI000093	\N	MAILING	835 Main St	Suite 11	New York	NY	69429	USA	t	2025-01-02 02:21:41.719	2025-01-02 02:21:41.719
cm5ep9xav00aokj5dv3nj3929	LEI000093	\N	PHYSICAL	438 Main St	\N	New York	NY	81219	USA	f	2025-01-02 02:21:41.719	2025-01-02 02:21:41.719
cm5ep9xay00askj5dshck7e75	LEI000094	\N	LEGAL	330 Main St	\N	Sydney	\N	85220	Australia	t	2025-01-02 02:21:41.722	2025-01-02 02:21:41.722
cm5ep9xb000avkj5dgtziewid	LEI000095	\N	LEGAL	602 Main St	\N	New York	NY	54027	USA	t	2025-01-02 02:21:41.724	2025-01-02 02:21:41.724
cm5ep9xb200azkj5daaajt5np	LEI000096	\N	MAILING	112 Main St	\N	Tokyo	TX	51760	Japan	t	2025-01-02 02:21:41.726	2025-01-02 02:21:41.726
cm5ep9xb200b0kj5dkzd9p192	LEI000096	\N	LEGAL	14 Main St	\N	London	CA	92286	UK	f	2025-01-02 02:21:41.726	2025-01-02 02:21:41.726
cm5ep9xb400b3kj5djf6lhjgu	LEI000097	\N	LEGAL	928 Main St	\N	London	CA	80900	UK	t	2025-01-02 02:21:41.729	2025-01-02 02:21:41.729
cm5ep9xb700b7kj5dlwj54a21	LEI000098	\N	LEGAL	82 Main St	\N	Tokyo	TX	44341	Japan	t	2025-01-02 02:21:41.731	2025-01-02 02:21:41.731
cm5ep9xb900bbkj5djssewom2	LEI000099	\N	LEGAL	94 Main St	\N	Hong Kong	IL	96289	China	t	2025-01-02 02:21:41.733	2025-01-02 02:21:41.733
cm5ep9xb900bckj5d4370xi8y	LEI000099	\N	LEGAL	892 Main St	Suite 33	Tokyo	TX	55930	Japan	f	2025-01-02 02:21:41.733	2025-01-02 02:21:41.733
cm5ep9xbf00bjkj5dw86k5243	LEI999999	\N	MAILING	239 Main St	Suite 6	Tokyo	TX	30666	Japan	t	2025-01-02 02:21:41.739	2025-01-02 02:21:41.739
cm5ep9xbj00bmkj5dlqhmhtfu	LEI888888	\N	MAILING	856 Main St	\N	Singapore	FL	47215	Singapore	t	2025-01-02 02:21:41.743	2025-01-02 02:21:41.743
\.


--
-- Data for Name: BeneficialOwner; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."BeneficialOwner" (id, "entityId", name, "dateOfBirth", nationality, "ownershipPercentage", "controlType", "verificationStatus", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Borrower; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Borrower" (id, "entityId", name, "taxId", "countryOfIncorporation", "industrySegment", "businessType", "creditRating", "ratingAgency", "riskRating", "onboardingStatus", "kycStatus", "createdAt", "updatedAt") FROM stdin;
cm5ep9xbg00blkj5dgg9d962w	LEI999999	Test Company Inc.	TAX123	US	Technology	Corporation	BBB	S&P	Medium	COMPLETED	COMPLETED	2025-01-02 02:21:41.741	2025-01-02 02:21:41.741
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Contact" (id, "entityId", type, "firstName", "lastName", title, email, phone, "isPrimary", "createdAt", "updatedAt", "counterpartyId") FROM stdin;
cm5ep9x0m0007kj5d7w16qny4	LEI000000	LEGAL	John	Brown	Manager	contact10@example.com	\N	t	2025-01-02 02:21:41.351	2025-01-02 02:21:41.351	\N
cm5ep9x1c000bkj5drg41icts	LEI000001	TECHNICAL	Sarah	Smith	\N	\N	+1-555-4985	t	2025-01-02 02:21:41.376	2025-01-02 02:21:41.376	\N
cm5ep9x1k000ekj5dce1dchen	LEI000002	BILLING	David	Johnson	CEO	contact62@example.com	\N	t	2025-01-02 02:21:41.384	2025-01-02 02:21:41.384	\N
cm5ep9x1k000fkj5dde5je9ng	LEI000002	BILLING	James	Johnson	CTO	contact22@example.com	+1-555-7604	f	2025-01-02 02:21:41.384	2025-01-02 02:21:41.384	\N
cm5ep9x1q000ikj5dam4zwmga	LEI000003	LEGAL	Emily	Miller	Director	contact9@example.com	+1-555-0044	t	2025-01-02 02:21:41.39	2025-01-02 02:21:41.39	\N
cm5ep9x1q000jkj5drko3md70	LEI000003	PRIMARY	James	Johnson	CTO	contact69@example.com	\N	f	2025-01-02 02:21:41.39	2025-01-02 02:21:41.39	\N
cm5ep9x1v000mkj5daiarusyd	LEI000004	LEGAL	Michael	Garcia	Director	contact40@example.com	+1-555-5452	t	2025-01-02 02:21:41.396	2025-01-02 02:21:41.396	\N
cm5ep9x1v000nkj5d05153m5m	LEI000004	BILLING	Jane	Jones	CTO	contact7@example.com	+1-555-8483	f	2025-01-02 02:21:41.396	2025-01-02 02:21:41.396	\N
cm5ep9x21000qkj5dw0nl3z3m	LEI000005	BILLING	Emily	Garcia	Director	contact23@example.com	+1-555-3366	t	2025-01-02 02:21:41.401	2025-01-02 02:21:41.401	\N
cm5ep9x26000ukj5djunz6rfe	LEI000006	PRIMARY	David	Williams	CFO	contact9@example.com	\N	t	2025-01-02 02:21:41.406	2025-01-02 02:21:41.406	\N
cm5ep9x2b000ykj5d8hgk1gve	LEI000007	PRIMARY	Emma	Davis	CEO	\N	+1-555-8668	t	2025-01-02 02:21:41.411	2025-01-02 02:21:41.411	\N
cm5ep9x2b000zkj5dol5kb04o	LEI000007	PRIMARY	David	Smith	CTO	\N	+1-555-0966	f	2025-01-02 02:21:41.411	2025-01-02 02:21:41.411	\N
cm5ep9x2h0013kj5d18jrwfcp	LEI000008	PRIMARY	Jane	Garcia	Director	contact84@example.com	+1-555-4307	t	2025-01-02 02:21:41.418	2025-01-02 02:21:41.418	\N
cm5ep9x2h0014kj5dmzh7du5e	LEI000008	BILLING	David	Garcia	CEO	contact93@example.com	+1-555-9197	f	2025-01-02 02:21:41.418	2025-01-02 02:21:41.418	\N
cm5ep9x2m0017kj5d4djhtuxg	LEI000009	LEGAL	Sarah	Brown	Manager	\N	\N	t	2025-01-02 02:21:41.423	2025-01-02 02:21:41.423	\N
cm5ep9x2m0018kj5dtrica8yj	LEI000009	PRIMARY	Michael	Davis	CEO	contact27@example.com	\N	f	2025-01-02 02:21:41.423	2025-01-02 02:21:41.423	\N
cm5ep9x2s001ckj5dmjsuutb0	LEI000010	BILLING	Emily	Smith	CEO	contact73@example.com	+1-555-7139	t	2025-01-02 02:21:41.428	2025-01-02 02:21:41.428	\N
cm5ep9x2s001dkj5demcev7p4	LEI000010	BILLING	John	Davis	Manager	contact25@example.com	+1-555-9951	f	2025-01-02 02:21:41.428	2025-01-02 02:21:41.428	\N
cm5ep9x2y001hkj5dsv0tn9om	LEI000011	LEGAL	Jane	Jones	Director	contact94@example.com	+1-555-1746	t	2025-01-02 02:21:41.434	2025-01-02 02:21:41.434	\N
cm5ep9x2y001ikj5d9dwl3dh6	LEI000011	TECHNICAL	Sarah	Johnson	Manager	\N	+1-555-7138	f	2025-01-02 02:21:41.434	2025-01-02 02:21:41.434	\N
cm5ep9x34001mkj5deijbugy8	LEI000012	BILLING	Emma	Johnson	CFO	contact35@example.com	+1-555-6613	t	2025-01-02 02:21:41.44	2025-01-02 02:21:41.44	\N
cm5ep9x39001pkj5d5bgql6py	LEI000013	TECHNICAL	Jane	Garcia	CTO	contact5@example.com	\N	t	2025-01-02 02:21:41.446	2025-01-02 02:21:41.446	\N
cm5ep9x39001qkj5dz2ie608f	LEI000013	BILLING	Jane	Johnson	Director	contact66@example.com	\N	f	2025-01-02 02:21:41.446	2025-01-02 02:21:41.446	\N
cm5ep9x3f001tkj5dbdw2vilb	LEI000014	PRIMARY	Michael	Miller	CTO	contact1@example.com	+1-555-4153	t	2025-01-02 02:21:41.451	2025-01-02 02:21:41.451	\N
cm5ep9x3f001ukj5d42hpurmx	LEI000014	BILLING	John	Davis	Director	contact43@example.com	\N	f	2025-01-02 02:21:41.451	2025-01-02 02:21:41.451	\N
cm5ep9x3k001ykj5dwb4ik5v6	LEI000015	BILLING	John	Davis	Manager	contact57@example.com	+1-555-0072	t	2025-01-02 02:21:41.456	2025-01-02 02:21:41.456	\N
cm5ep9x3q0022kj5dhvywajrc	LEI000016	TECHNICAL	David	Miller	\N	contact40@example.com	\N	t	2025-01-02 02:21:41.462	2025-01-02 02:21:41.462	\N
cm5ep9x3q0023kj5duguoro3s	LEI000016	BILLING	Michael	Williams	Director	contact35@example.com	+1-555-5443	f	2025-01-02 02:21:41.462	2025-01-02 02:21:41.462	\N
cm5ep9x3w0026kj5d2wmlxriq	LEI000017	TECHNICAL	Emma	Davis	Manager	\N	+1-555-1834	t	2025-01-02 02:21:41.468	2025-01-02 02:21:41.468	\N
cm5ep9x40002akj5d12jdjexv	LEI000018	LEGAL	Jane	Brown	CEO	contact61@example.com	+1-555-3910	t	2025-01-02 02:21:41.472	2025-01-02 02:21:41.472	\N
cm5ep9x40002bkj5du0hvx1ca	LEI000018	LEGAL	Emily	Williams	CFO	contact21@example.com	+1-555-7134	f	2025-01-02 02:21:41.472	2025-01-02 02:21:41.472	\N
cm5ep9x46002fkj5duyynu9p6	LEI000019	BILLING	Emma	Jones	\N	contact96@example.com	\N	t	2025-01-02 02:21:41.478	2025-01-02 02:21:41.478	\N
cm5ep9x46002gkj5dai2y1d0g	LEI000019	PRIMARY	David	Williams	Director	contact24@example.com	+1-555-3731	f	2025-01-02 02:21:41.478	2025-01-02 02:21:41.478	\N
cm5ep9x4c002jkj5dmbitmnoi	LEI000020	PRIMARY	James	Brown	Manager	contact67@example.com	+1-555-2782	t	2025-01-02 02:21:41.484	2025-01-02 02:21:41.484	\N
cm5ep9x4h002mkj5dipk3f4v5	LEI000021	TECHNICAL	Michael	Jones	CTO	contact28@example.com	+1-555-2022	t	2025-01-02 02:21:41.489	2025-01-02 02:21:41.489	\N
cm5ep9x4h002nkj5dg39bj2dy	LEI000021	BILLING	James	Garcia	Manager	contact25@example.com	+1-555-5860	f	2025-01-02 02:21:41.489	2025-01-02 02:21:41.489	\N
cm5ep9x4l002qkj5dwq1qr71l	LEI000022	PRIMARY	David	Miller	CFO	contact65@example.com	+1-555-7203	t	2025-01-02 02:21:41.493	2025-01-02 02:21:41.493	\N
cm5ep9x4l002rkj5d39wj18k4	LEI000022	PRIMARY	James	Davis	CEO	contact34@example.com	+1-555-2346	f	2025-01-02 02:21:41.493	2025-01-02 02:21:41.493	\N
cm5ep9x4q002ukj5dx9dkvkco	LEI000023	PRIMARY	James	Smith	CEO	contact26@example.com	\N	t	2025-01-02 02:21:41.498	2025-01-02 02:21:41.498	\N
cm5ep9x4q002vkj5dmmb2k7sy	LEI000023	PRIMARY	Jane	Johnson	CFO	\N	+1-555-5591	f	2025-01-02 02:21:41.498	2025-01-02 02:21:41.498	\N
cm5ep9x4u002ykj5dks70cmi6	LEI000024	BILLING	Emily	Williams	CEO	contact67@example.com	+1-555-2488	t	2025-01-02 02:21:41.502	2025-01-02 02:21:41.502	\N
cm5ep9x4y0032kj5df89kkr7b	LEI000025	PRIMARY	Jane	Williams	CTO	contact36@example.com	+1-555-6100	t	2025-01-02 02:21:41.506	2025-01-02 02:21:41.506	\N
cm5ep9x4y0033kj5d20hk6urs	LEI000025	BILLING	John	Davis	Director	contact50@example.com	\N	f	2025-01-02 02:21:41.506	2025-01-02 02:21:41.506	\N
cm5ep9x530037kj5dq6u9oqv3	LEI000026	TECHNICAL	James	Smith	CTO	contact95@example.com	\N	t	2025-01-02 02:21:41.512	2025-01-02 02:21:41.512	\N
cm5ep9x58003akj5dhro7zz61	LEI000027	TECHNICAL	Emma	Brown	\N	contact46@example.com	+1-555-5819	t	2025-01-02 02:21:41.516	2025-01-02 02:21:41.516	\N
cm5ep9x58003bkj5dxxko8shr	LEI000027	LEGAL	Michael	Davis	\N	contact27@example.com	+1-555-9059	f	2025-01-02 02:21:41.516	2025-01-02 02:21:41.516	\N
cm5ep9x5c003fkj5dpg6ff4kq	LEI000028	BILLING	James	Johnson	CTO	contact70@example.com	+1-555-1515	t	2025-01-02 02:21:41.52	2025-01-02 02:21:41.52	\N
cm5ep9x5h003jkj5dsf08pj9q	LEI000029	LEGAL	Michael	Brown	\N	\N	\N	t	2025-01-02 02:21:41.525	2025-01-02 02:21:41.525	\N
cm5ep9x5l003mkj5dty5p60oj	LEI000030	LEGAL	Michael	Miller	Director	contact39@example.com	+1-555-3076	t	2025-01-02 02:21:41.53	2025-01-02 02:21:41.53	\N
cm5ep9x5l003nkj5dfmovhal0	LEI000030	BILLING	Emily	Jones	CEO	contact41@example.com	+1-555-0825	f	2025-01-02 02:21:41.53	2025-01-02 02:21:41.53	\N
cm5ep9x5q003qkj5dt7mx95ya	LEI000031	LEGAL	Sarah	Brown	Manager	\N	+1-555-9584	t	2025-01-02 02:21:41.534	2025-01-02 02:21:41.534	\N
cm5ep9x5q003rkj5dh2aqiggc	LEI000031	TECHNICAL	James	Miller	Director	contact68@example.com	+1-555-4989	f	2025-01-02 02:21:41.534	2025-01-02 02:21:41.534	\N
cm5ep9x5u003vkj5dftv9upwa	LEI000032	LEGAL	David	Garcia	\N	contact29@example.com	+1-555-4426	t	2025-01-02 02:21:41.538	2025-01-02 02:21:41.538	\N
cm5ep9x5y003zkj5d06a8uydu	LEI000033	PRIMARY	Sarah	Miller	\N	contact57@example.com	+1-555-2955	t	2025-01-02 02:21:41.542	2025-01-02 02:21:41.542	\N
cm5ep9x630042kj5d2x1theb4	LEI000034	LEGAL	Emma	Garcia	CTO	contact82@example.com	+1-555-7588	t	2025-01-02 02:21:41.547	2025-01-02 02:21:41.547	\N
cm5ep9x630043kj5dknlx2qpx	LEI000034	PRIMARY	James	Miller	CFO	contact72@example.com	+1-555-5439	f	2025-01-02 02:21:41.547	2025-01-02 02:21:41.547	\N
cm5ep9x680047kj5d0185ez1o	LEI000035	TECHNICAL	John	Brown	Director	\N	+1-555-9653	t	2025-01-02 02:21:41.552	2025-01-02 02:21:41.552	\N
cm5ep9x6c004akj5df68hj7vk	LEI000036	LEGAL	Emma	Williams	CFO	contact8@example.com	+1-555-7302	t	2025-01-02 02:21:41.556	2025-01-02 02:21:41.556	\N
cm5ep9x6i004dkj5dzr8w69rw	LEI000037	TECHNICAL	Jane	Johnson	CFO	contact14@example.com	+1-555-5505	t	2025-01-02 02:21:41.563	2025-01-02 02:21:41.563	\N
cm5ep9x6i004ekj5drmjqgjxw	LEI000037	PRIMARY	John	Jones	Manager	contact88@example.com	+1-555-6325	f	2025-01-02 02:21:41.563	2025-01-02 02:21:41.563	\N
cm5ep9x6n004ikj5dlrlukc2d	LEI000038	TECHNICAL	Michael	Davis	CTO	contact3@example.com	+1-555-5296	t	2025-01-02 02:21:41.568	2025-01-02 02:21:41.568	\N
cm5ep9x6n004jkj5dbbket925	LEI000038	BILLING	Jane	Johnson	\N	\N	+1-555-7888	f	2025-01-02 02:21:41.568	2025-01-02 02:21:41.568	\N
cm5ep9x6s004nkj5d5a5aptc4	LEI000039	LEGAL	Michael	Davis	CEO	contact96@example.com	+1-555-4147	t	2025-01-02 02:21:41.572	2025-01-02 02:21:41.572	\N
cm5ep9x6s004okj5dkdcehpu3	LEI000039	PRIMARY	John	Garcia	\N	contact0@example.com	+1-555-3457	f	2025-01-02 02:21:41.572	2025-01-02 02:21:41.572	\N
cm5ep9x6v004skj5d3zz2rj9d	LEI000040	PRIMARY	James	Jones	Director	\N	+1-555-0534	t	2025-01-02 02:21:41.576	2025-01-02 02:21:41.576	\N
cm5ep9x6z004wkj5d59tltyjg	LEI000041	BILLING	John	Johnson	Director	contact57@example.com	+1-555-2493	t	2025-01-02 02:21:41.58	2025-01-02 02:21:41.58	\N
cm5ep9x6z004xkj5dyacek08e	LEI000041	TECHNICAL	James	Brown	\N	contact85@example.com	\N	f	2025-01-02 02:21:41.58	2025-01-02 02:21:41.58	\N
cm5ep9x750050kj5dusw1hbs7	LEI000042	PRIMARY	Jane	Brown	CTO	contact79@example.com	+1-555-7298	t	2025-01-02 02:21:41.586	2025-01-02 02:21:41.586	\N
cm5ep9x750051kj5daw4o2x5b	LEI000042	BILLING	Emma	Jones	CEO	contact27@example.com	+1-555-1693	f	2025-01-02 02:21:41.586	2025-01-02 02:21:41.586	\N
cm5ep9x7a0054kj5ddumesgmj	LEI000043	TECHNICAL	Michael	Smith	CFO	contact81@example.com	+1-555-2086	t	2025-01-02 02:21:41.59	2025-01-02 02:21:41.59	\N
cm5ep9x7g0057kj5d2i63wiyf	LEI000044	TECHNICAL	Sarah	Smith	Manager	\N	+1-555-5513	t	2025-01-02 02:21:41.596	2025-01-02 02:21:41.596	\N
cm5ep9x7g0058kj5dn9991bs4	LEI000044	LEGAL	Jane	Johnson	CFO	contact25@example.com	\N	f	2025-01-02 02:21:41.596	2025-01-02 02:21:41.596	\N
cm5ep9x7l005ckj5du4fa7w4c	LEI000045	LEGAL	Sarah	Williams	CTO	\N	+1-555-6254	t	2025-01-02 02:21:41.601	2025-01-02 02:21:41.601	\N
cm5ep9x7l005dkj5drr0pma6p	LEI000045	PRIMARY	James	Jones	Manager	\N	+1-555-5136	f	2025-01-02 02:21:41.601	2025-01-02 02:21:41.601	\N
cm5ep9x7p005gkj5dro0b1665	LEI000046	LEGAL	Sarah	Miller	CFO	contact97@example.com	+1-555-8460	t	2025-01-02 02:21:41.606	2025-01-02 02:21:41.606	\N
cm5ep9x7p005hkj5din0zdehk	LEI000046	TECHNICAL	Emily	Garcia	CEO	contact68@example.com	+1-555-2279	f	2025-01-02 02:21:41.606	2025-01-02 02:21:41.606	\N
cm5ep9x7t005lkj5dtf4r6r4d	LEI000047	BILLING	James	Miller	CEO	contact45@example.com	+1-555-7163	t	2025-01-02 02:21:41.609	2025-01-02 02:21:41.609	\N
cm5ep9x7t005mkj5djxkgwwjp	LEI000047	PRIMARY	Emily	Miller	Director	contact71@example.com	+1-555-0129	f	2025-01-02 02:21:41.609	2025-01-02 02:21:41.609	\N
cm5ep9x7w005pkj5d4ltktoi1	LEI000048	PRIMARY	Sarah	Smith	CTO	contact85@example.com	\N	t	2025-01-02 02:21:41.613	2025-01-02 02:21:41.613	\N
cm5ep9x7w005qkj5dizyzsg6o	LEI000048	BILLING	Sarah	Smith	\N	contact48@example.com	+1-555-9173	f	2025-01-02 02:21:41.613	2025-01-02 02:21:41.613	\N
cm5ep9x7z005tkj5dq8fjqf25	LEI000049	TECHNICAL	Emily	Williams	CFO	contact59@example.com	\N	t	2025-01-02 02:21:41.616	2025-01-02 02:21:41.616	\N
cm5ep9x82005wkj5d64efzjvq	LEI000050	TECHNICAL	Emily	Smith	CEO	\N	+1-555-9041	t	2025-01-02 02:21:41.618	2025-01-02 02:21:41.618	\N
cm5ep9x82005xkj5dv3akn428	LEI000050	BILLING	James	Miller	\N	contact82@example.com	+1-555-4928	f	2025-01-02 02:21:41.618	2025-01-02 02:21:41.618	\N
cm5ep9x850060kj5dpz7xl179	LEI000051	BILLING	David	Brown	\N	contact48@example.com	+1-555-0761	t	2025-01-02 02:21:41.622	2025-01-02 02:21:41.622	\N
cm5ep9x850061kj5dx49glm95	LEI000051	LEGAL	Sarah	Smith	CEO	\N	\N	f	2025-01-02 02:21:41.622	2025-01-02 02:21:41.622	\N
cm5ep9x880064kj5dp6i3wcur	LEI000052	BILLING	James	Miller	CTO	contact22@example.com	+1-555-0498	t	2025-01-02 02:21:41.624	2025-01-02 02:21:41.624	\N
cm5ep9x8a0068kj5dw2si3f2t	LEI000053	BILLING	John	Davis	CTO	contact24@example.com	+1-555-2183	t	2025-01-02 02:21:41.627	2025-01-02 02:21:41.627	\N
cm5ep9x8d006ckj5dvz4jh66t	LEI000054	TECHNICAL	David	Brown	CTO	\N	\N	t	2025-01-02 02:21:41.629	2025-01-02 02:21:41.629	\N
cm5ep9x8f006fkj5diijqmo2t	LEI000055	PRIMARY	Emma	Miller	Director	contact14@example.com	\N	t	2025-01-02 02:21:41.631	2025-01-02 02:21:41.631	\N
cm5ep9x8h006jkj5dseg80aen	LEI000056	BILLING	Michael	Jones	Manager	contact89@example.com	+1-555-1501	t	2025-01-02 02:21:41.633	2025-01-02 02:21:41.633	\N
cm5ep9x8k006nkj5dxjs3hy0b	LEI000057	PRIMARY	Jane	Williams	CFO	contact63@example.com	\N	t	2025-01-02 02:21:41.636	2025-01-02 02:21:41.636	\N
cm5ep9x8m006qkj5dsaws82v1	LEI000058	PRIMARY	David	Jones	CEO	contact92@example.com	+1-555-6393	t	2025-01-02 02:21:41.638	2025-01-02 02:21:41.638	\N
cm5ep9x8o006ukj5d22o30w2n	LEI000059	LEGAL	Michael	Williams	Manager	contact35@example.com	+1-555-6708	t	2025-01-02 02:21:41.64	2025-01-02 02:21:41.64	\N
cm5ep9x8q006ykj5dfxwgc62l	LEI000060	LEGAL	Sarah	Miller	CTO	contact82@example.com	+1-555-6806	t	2025-01-02 02:21:41.642	2025-01-02 02:21:41.642	\N
cm5ep9x8s0072kj5d9zeta5oz	LEI000061	BILLING	James	Smith	CTO	contact60@example.com	+1-555-3494	t	2025-01-02 02:21:41.644	2025-01-02 02:21:41.644	\N
cm5ep9x8s0073kj5dv08cqszw	LEI000061	TECHNICAL	David	Brown	CEO	contact11@example.com	+1-555-2597	f	2025-01-02 02:21:41.644	2025-01-02 02:21:41.644	\N
cm5ep9x8u0076kj5dwufxxnv9	LEI000062	LEGAL	Sarah	Jones	Manager	\N	+1-555-7762	t	2025-01-02 02:21:41.647	2025-01-02 02:21:41.647	\N
cm5ep9x8u0077kj5dd4eoujg4	LEI000062	PRIMARY	Michael	Davis	Director	contact34@example.com	+1-555-9060	f	2025-01-02 02:21:41.647	2025-01-02 02:21:41.647	\N
cm5ep9x8w007akj5d2gl7no0u	LEI000063	BILLING	Emma	Brown	\N	contact98@example.com	\N	t	2025-01-02 02:21:41.649	2025-01-02 02:21:41.649	\N
cm5ep9x8y007ekj5dbzc1gqj7	LEI000064	BILLING	James	Garcia	CEO	contact56@example.com	+1-555-4483	t	2025-01-02 02:21:41.651	2025-01-02 02:21:41.651	\N
cm5ep9x8y007fkj5d144drf6a	LEI000064	LEGAL	Emma	Jones	Manager	contact93@example.com	+1-555-2331	f	2025-01-02 02:21:41.651	2025-01-02 02:21:41.651	\N
cm5ep9x90007jkj5dp38isyza	LEI000065	BILLING	Emily	Garcia	Director	contact70@example.com	+1-555-6851	t	2025-01-02 02:21:41.653	2025-01-02 02:21:41.653	\N
cm5ep9x93007nkj5ds7xn84rw	LEI000066	BILLING	Sarah	Jones	\N	contact86@example.com	+1-555-4867	t	2025-01-02 02:21:41.655	2025-01-02 02:21:41.655	\N
cm5ep9x95007qkj5d6nww642z	LEI000067	TECHNICAL	Sarah	Williams	Manager	\N	+1-555-9906	t	2025-01-02 02:21:41.657	2025-01-02 02:21:41.657	\N
cm5ep9x96007tkj5duvpkdadj	LEI000068	LEGAL	Michael	Jones	\N	contact31@example.com	\N	t	2025-01-02 02:21:41.659	2025-01-02 02:21:41.659	\N
cm5ep9x98007xkj5dy8iiyxk3	LEI000069	LEGAL	Michael	Williams	\N	\N	\N	t	2025-01-02 02:21:41.661	2025-01-02 02:21:41.661	\N
cm5ep9x98007ykj5d6aqlhv5t	LEI000069	PRIMARY	Sarah	Brown	CFO	\N	+1-555-9443	f	2025-01-02 02:21:41.661	2025-01-02 02:21:41.661	\N
cm5ep9x9b0082kj5da08ip24s	LEI000070	PRIMARY	Jane	Garcia	Manager	\N	+1-555-2566	t	2025-01-02 02:21:41.663	2025-01-02 02:21:41.663	\N
cm5ep9x9b0083kj5dsfv2zud4	LEI000070	TECHNICAL	Emily	Smith	Manager	contact79@example.com	+1-555-4020	f	2025-01-02 02:21:41.663	2025-01-02 02:21:41.663	\N
cm5ep9x9d0087kj5d4zqxq6nv	LEI000071	PRIMARY	David	Johnson	CEO	contact50@example.com	+1-555-1057	t	2025-01-02 02:21:41.666	2025-01-02 02:21:41.666	\N
cm5ep9x9f008bkj5d07q2kjfw	LEI000072	TECHNICAL	Sarah	Garcia	CEO	contact70@example.com	+1-555-8637	t	2025-01-02 02:21:41.668	2025-01-02 02:21:41.668	\N
cm5ep9x9i008fkj5denwxe6lo	LEI000073	TECHNICAL	Michael	Miller	Manager	contact37@example.com	\N	t	2025-01-02 02:21:41.67	2025-01-02 02:21:41.67	\N
cm5ep9x9i008gkj5dhcghzk8w	LEI000073	PRIMARY	James	Garcia	Director	contact34@example.com	+1-555-3992	f	2025-01-02 02:21:41.67	2025-01-02 02:21:41.67	\N
cm5ep9x9k008jkj5dcjrby904	LEI000074	TECHNICAL	Emma	Brown	CFO	contact71@example.com	\N	t	2025-01-02 02:21:41.672	2025-01-02 02:21:41.672	\N
cm5ep9x9k008kkj5du5d7512v	LEI000074	LEGAL	John	Brown	Manager	contact6@example.com	+1-555-6084	f	2025-01-02 02:21:41.672	2025-01-02 02:21:41.672	\N
cm5ep9x9m008okj5dyob82rtc	LEI000075	PRIMARY	Sarah	Johnson	Director	contact99@example.com	+1-555-9432	t	2025-01-02 02:21:41.675	2025-01-02 02:21:41.675	\N
cm5ep9x9m008pkj5ds7yam0ce	LEI000075	TECHNICAL	Emma	Williams	Director	contact61@example.com	+1-555-6302	f	2025-01-02 02:21:41.675	2025-01-02 02:21:41.675	\N
cm5ep9x9p008skj5domxf5378	LEI000076	BILLING	Emma	Brown	\N	contact66@example.com	+1-555-6974	t	2025-01-02 02:21:41.678	2025-01-02 02:21:41.678	\N
cm5ep9x9p008tkj5d3ym5o4um	LEI000076	PRIMARY	John	Smith	Manager	contact17@example.com	+1-555-1826	f	2025-01-02 02:21:41.678	2025-01-02 02:21:41.678	\N
cm5ep9x9s008wkj5d5bhq2rsn	LEI000077	LEGAL	David	Williams	\N	contact48@example.com	\N	t	2025-01-02 02:21:41.68	2025-01-02 02:21:41.68	\N
cm5ep9x9s008xkj5d6ewo2233	LEI000077	BILLING	Emma	Jones	CTO	contact61@example.com	+1-555-0656	f	2025-01-02 02:21:41.68	2025-01-02 02:21:41.68	\N
cm5ep9x9u0090kj5dv078eioj	LEI000078	PRIMARY	Emma	Smith	CFO	contact97@example.com	+1-555-3392	t	2025-01-02 02:21:41.683	2025-01-02 02:21:41.683	\N
cm5ep9x9u0091kj5dp8xvukla	LEI000078	BILLING	Sarah	Davis	Director	contact78@example.com	\N	f	2025-01-02 02:21:41.683	2025-01-02 02:21:41.683	\N
cm5ep9x9x0095kj5dg6ed7f51	LEI000079	LEGAL	Jane	Garcia	\N	contact2@example.com	+1-555-9918	t	2025-01-02 02:21:41.685	2025-01-02 02:21:41.685	\N
cm5ep9x9x0096kj5dyqxq86e4	LEI000079	TECHNICAL	David	Johnson	CTO	contact99@example.com	\N	f	2025-01-02 02:21:41.685	2025-01-02 02:21:41.685	\N
cm5ep9x9z0099kj5dhsvb2lq5	LEI000080	BILLING	John	Garcia	\N	contact89@example.com	\N	t	2025-01-02 02:21:41.688	2025-01-02 02:21:41.688	\N
cm5ep9xa2009ckj5d37n9lny5	LEI000081	BILLING	David	Jones	CFO	contact91@example.com	+1-555-6118	t	2025-01-02 02:21:41.69	2025-01-02 02:21:41.69	\N
cm5ep9xa4009fkj5dug43bfa0	LEI000082	PRIMARY	Sarah	Garcia	Director	contact27@example.com	+1-555-3970	t	2025-01-02 02:21:41.692	2025-01-02 02:21:41.692	\N
cm5ep9xa4009gkj5d5ncucfk5	LEI000082	LEGAL	Jane	Johnson	\N	contact28@example.com	+1-555-3186	f	2025-01-02 02:21:41.692	2025-01-02 02:21:41.692	\N
cm5ep9xa6009kkj5da6od950h	LEI000083	TECHNICAL	Emily	Williams	Manager	\N	+1-555-8161	t	2025-01-02 02:21:41.695	2025-01-02 02:21:41.695	\N
cm5ep9xa6009lkj5dpe911d1d	LEI000083	TECHNICAL	Sarah	Garcia	Manager	contact66@example.com	+1-555-8422	f	2025-01-02 02:21:41.695	2025-01-02 02:21:41.695	\N
cm5ep9xa9009pkj5dmuxke1r3	LEI000084	LEGAL	Emma	Brown	Manager	contact78@example.com	+1-555-2585	t	2025-01-02 02:21:41.697	2025-01-02 02:21:41.697	\N
cm5ep9xa9009qkj5dfk93vpgx	LEI000084	TECHNICAL	James	Johnson	\N	contact95@example.com	\N	f	2025-01-02 02:21:41.697	2025-01-02 02:21:41.697	\N
cm5ep9xab009ukj5de1l2ivu7	LEI000085	LEGAL	James	Miller	Director	contact83@example.com	+1-555-2207	t	2025-01-02 02:21:41.7	2025-01-02 02:21:41.7	\N
cm5ep9xae009xkj5d7ruhf58q	LEI000086	LEGAL	Emily	Miller	\N	contact54@example.com	+1-555-2074	t	2025-01-02 02:21:41.702	2025-01-02 02:21:41.702	\N
cm5ep9xae009ykj5dbcdp7m8o	LEI000086	LEGAL	Emma	Williams	CTO	contact86@example.com	+1-555-2000	f	2025-01-02 02:21:41.702	2025-01-02 02:21:41.702	\N
cm5ep9xah00a2kj5dkg3fddgn	LEI000087	TECHNICAL	Emily	Johnson	Director	contact10@example.com	+1-555-7452	t	2025-01-02 02:21:41.705	2025-01-02 02:21:41.705	\N
cm5ep9xah00a3kj5deuwggpv9	LEI000087	LEGAL	David	Jones	\N	\N	\N	f	2025-01-02 02:21:41.705	2025-01-02 02:21:41.705	\N
cm5ep9xaj00a7kj5dvuze6y1a	LEI000088	PRIMARY	Michael	Johnson	CEO	contact92@example.com	+1-555-6207	t	2025-01-02 02:21:41.708	2025-01-02 02:21:41.708	\N
cm5ep9xam00aakj5dq736647u	LEI000089	TECHNICAL	Emily	Smith	CEO	contact57@example.com	\N	t	2025-01-02 02:21:41.71	2025-01-02 02:21:41.71	\N
cm5ep9xam00abkj5dwy2umr0t	LEI000089	LEGAL	Sarah	Williams	CFO	contact82@example.com	+1-555-9254	f	2025-01-02 02:21:41.71	2025-01-02 02:21:41.71	\N
cm5ep9xao00afkj5d60ywurm3	LEI000090	PRIMARY	Sarah	Johnson	CTO	contact15@example.com	+1-555-0012	t	2025-01-02 02:21:41.712	2025-01-02 02:21:41.712	\N
cm5ep9xaq00aikj5d6advbw9q	LEI000091	BILLING	Sarah	Jones	CEO	\N	+1-555-7055	t	2025-01-02 02:21:41.715	2025-01-02 02:21:41.715	\N
cm5ep9xas00alkj5djeo5aoc2	LEI000092	PRIMARY	Emma	Miller	Manager	\N	+1-555-6005	t	2025-01-02 02:21:41.717	2025-01-02 02:21:41.717	\N
cm5ep9xav00apkj5dntc3t25d	LEI000093	TECHNICAL	Sarah	Brown	Director	contact13@example.com	+1-555-2790	t	2025-01-02 02:21:41.719	2025-01-02 02:21:41.719	\N
cm5ep9xav00aqkj5di1bfe70t	LEI000093	TECHNICAL	James	Jones	Manager	contact62@example.com	+1-555-5097	f	2025-01-02 02:21:41.719	2025-01-02 02:21:41.719	\N
cm5ep9xay00atkj5dnwyb8s74	LEI000094	PRIMARY	David	Williams	Manager	contact30@example.com	+1-555-8231	t	2025-01-02 02:21:41.722	2025-01-02 02:21:41.722	\N
cm5ep9xb000awkj5deznjs3xo	LEI000095	LEGAL	Michael	Garcia	CTO	contact46@example.com	+1-555-7398	t	2025-01-02 02:21:41.724	2025-01-02 02:21:41.724	\N
cm5ep9xb000axkj5dib9x4aw0	LEI000095	PRIMARY	Emma	Jones	CEO	contact74@example.com	+1-555-7499	f	2025-01-02 02:21:41.724	2025-01-02 02:21:41.724	\N
cm5ep9xb200b1kj5d8qbswtsl	LEI000096	TECHNICAL	James	Johnson	CTO	contact46@example.com	+1-555-5899	t	2025-01-02 02:21:41.726	2025-01-02 02:21:41.726	\N
cm5ep9xb400b4kj5dg07r8g36	LEI000097	TECHNICAL	Michael	Smith	Director	contact14@example.com	\N	t	2025-01-02 02:21:41.729	2025-01-02 02:21:41.729	\N
cm5ep9xb400b5kj5dr3qs4fe9	LEI000097	TECHNICAL	Emma	Smith	CTO	contact78@example.com	+1-555-5625	f	2025-01-02 02:21:41.729	2025-01-02 02:21:41.729	\N
cm5ep9xb700b8kj5dp1q2u7tj	LEI000098	LEGAL	Emily	Miller	CEO	contact63@example.com	\N	t	2025-01-02 02:21:41.731	2025-01-02 02:21:41.731	\N
cm5ep9xb700b9kj5d6gdqsadr	LEI000098	BILLING	Jane	Jones	Manager	contact45@example.com	+1-555-7943	f	2025-01-02 02:21:41.731	2025-01-02 02:21:41.731	\N
cm5ep9xb900bdkj5d3y2krym0	LEI000099	LEGAL	James	Williams	CTO	contact17@example.com	+1-555-2198	t	2025-01-02 02:21:41.733	2025-01-02 02:21:41.733	\N
cm5ep9xb900bekj5da054yd0u	LEI000099	PRIMARY	David	Brown	Director	contact2@example.com	\N	f	2025-01-02 02:21:41.733	2025-01-02 02:21:41.733	\N
cm5ep9xbf00bkkj5d7pjob888	LEI999999	BILLING	Michael	Johnson	CTO	\N	+1-555-3873	t	2025-01-02 02:21:41.739	2025-01-02 02:21:41.739	\N
cm5ep9xbj00bnkj5dpswtri0b	LEI888888	PRIMARY	Michael	Garcia	CEO	contact43@example.com	+1-555-8447	t	2025-01-02 02:21:41.743	2025-01-02 02:21:41.743	\N
\.


--
-- Data for Name: Counterparty; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Counterparty" (id, "entityId", "typeId", status, "createdAt", "updatedAt") FROM stdin;
cm5ep9x150008kj5d9mj7v7db	LEI000000	cm5ep9x060000kj5dao3zpodk	INACTIVE	2025-01-02 02:21:41.37	2025-01-02 02:21:41.37
cm5ep9x1g000ckj5di6mirqht	LEI000001	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.381	2025-01-02 02:21:41.381
cm5ep9x1m000gkj5d259rq3b4	LEI000002	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.387	2025-01-02 02:21:41.387
cm5ep9x1s000kkj5d8d8q4pc2	LEI000003	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.393	2025-01-02 02:21:41.393
cm5ep9x1y000okj5doeso24wc	LEI000004	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.398	2025-01-02 02:21:41.398
cm5ep9x23000rkj5dv2wudpxn	LEI000005	cm5ep9x0k0005kj5dusi02uua	INACTIVE	2025-01-02 02:21:41.403	2025-01-02 02:21:41.403
cm5ep9x29000vkj5d31p2hr89	LEI000006	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.409	2025-01-02 02:21:41.409
cm5ep9x2f0010kj5dpq5a49de	LEI000007	cm5ep9x0h0001kj5d5usts2vv	PENDING	2025-01-02 02:21:41.415	2025-01-02 02:21:41.415
cm5ep9x2k0015kj5ds9eb9745	LEI000008	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.42	2025-01-02 02:21:41.42
cm5ep9x2p0019kj5d4724a4ss	LEI000009	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.425	2025-01-02 02:21:41.425
cm5ep9x2v001ekj5dum0jeh18	LEI000010	cm5ep9x0j0004kj5dzfxo6h6x	INACTIVE	2025-01-02 02:21:41.432	2025-01-02 02:21:41.432
cm5ep9x31001jkj5dmxgopw6a	LEI000011	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.437	2025-01-02 02:21:41.437
cm5ep9x37001nkj5dtewix972	LEI000012	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.443	2025-01-02 02:21:41.443
cm5ep9x3c001rkj5drc442sjq	LEI000013	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.449	2025-01-02 02:21:41.449
cm5ep9x3h001vkj5dstfq6ujh	LEI000014	cm5ep9x0i0002kj5ddvyifkpm	PENDING	2025-01-02 02:21:41.454	2025-01-02 02:21:41.454
cm5ep9x3n001zkj5d9ynp71hm	LEI000015	cm5ep9x0i0003kj5d6up661uu	INACTIVE	2025-01-02 02:21:41.459	2025-01-02 02:21:41.459
cm5ep9x3t0024kj5dhi0v08wj	LEI000016	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.465	2025-01-02 02:21:41.465
cm5ep9x3x0027kj5dutefph3r	LEI000017	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.47	2025-01-02 02:21:41.47
cm5ep9x43002ckj5dgaismede	LEI000018	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.475	2025-01-02 02:21:41.475
cm5ep9x49002hkj5dgzw6s8tm	LEI000019	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.482	2025-01-02 02:21:41.482
cm5ep9x4e002kkj5d5iukcskc	LEI000020	cm5ep9x0i0002kj5ddvyifkpm	INACTIVE	2025-01-02 02:21:41.486	2025-01-02 02:21:41.486
cm5ep9x4j002okj5dft1fhh0f	LEI000021	cm5ep9x0i0003kj5d6up661uu	PENDING	2025-01-02 02:21:41.492	2025-01-02 02:21:41.492
cm5ep9x4o002skj5drp6jasvp	LEI000022	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.496	2025-01-02 02:21:41.496
cm5ep9x4s002wkj5dh2wjf897	LEI000023	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.501	2025-01-02 02:21:41.501
cm5ep9x4w002zkj5dq2je8hqf	LEI000024	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.504	2025-01-02 02:21:41.504
cm5ep9x510034kj5dguy5p382	LEI000025	cm5ep9x0h0001kj5d5usts2vv	INACTIVE	2025-01-02 02:21:41.509	2025-01-02 02:21:41.509
cm5ep9x560038kj5dbsbrztxw	LEI000026	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.514	2025-01-02 02:21:41.514
cm5ep9x5a003ckj5db8f8tqai	LEI000027	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.519	2025-01-02 02:21:41.519
cm5ep9x5f003gkj5du12sul5n	LEI000028	cm5ep9x0j0004kj5dzfxo6h6x	PENDING	2025-01-02 02:21:41.523	2025-01-02 02:21:41.523
cm5ep9x5j003kkj5d7a7yvkal	LEI000029	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.527	2025-01-02 02:21:41.527
cm5ep9x5o003okj5dtxi7s1z5	LEI000030	cm5ep9x060000kj5dao3zpodk	INACTIVE	2025-01-02 02:21:41.532	2025-01-02 02:21:41.532
cm5ep9x5s003skj5dn230l2wa	LEI000031	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.536	2025-01-02 02:21:41.536
cm5ep9x5w003wkj5dykq7plgp	LEI000032	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.54	2025-01-02 02:21:41.54
cm5ep9x610040kj5dv03fuf9u	LEI000033	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.545	2025-01-02 02:21:41.545
cm5ep9x650044kj5dp57su3e4	LEI000034	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.55	2025-01-02 02:21:41.55
cm5ep9x6a0048kj5dwnlvmjle	LEI000035	cm5ep9x0k0005kj5dusi02uua	INACTIVE	2025-01-02 02:21:41.554	2025-01-02 02:21:41.554
cm5ep9x6g004bkj5decv0how8	LEI000036	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.56	2025-01-02 02:21:41.56
cm5ep9x6l004fkj5ddxf673b8	LEI000037	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.565	2025-01-02 02:21:41.565
cm5ep9x6q004kkj5dnjvhkqj4	LEI000038	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.571	2025-01-02 02:21:41.571
cm5ep9x6u004pkj5dcw759lts	LEI000039	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.574	2025-01-02 02:21:41.574
cm5ep9x6y004tkj5ddb9rc7e9	LEI000040	cm5ep9x0j0004kj5dzfxo6h6x	INACTIVE	2025-01-02 02:21:41.578	2025-01-02 02:21:41.578
cm5ep9x73004ykj5dpsro6lel	LEI000041	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.583	2025-01-02 02:21:41.583
cm5ep9x780052kj5dpm5lb5uh	LEI000042	cm5ep9x060000kj5dao3zpodk	PENDING	2025-01-02 02:21:41.588	2025-01-02 02:21:41.588
cm5ep9x7d0055kj5d2o50lu6l	LEI000043	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.594	2025-01-02 02:21:41.594
cm5ep9x7j0059kj5dx7dax77l	LEI000044	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.599	2025-01-02 02:21:41.599
cm5ep9x7o005ekj5d9ou9v882	LEI000045	cm5ep9x0i0003kj5d6up661uu	INACTIVE	2025-01-02 02:21:41.604	2025-01-02 02:21:41.604
cm5ep9x7r005ikj5div660qjz	LEI000046	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.608	2025-01-02 02:21:41.608
cm5ep9x7v005nkj5d3ezc3sfm	LEI000047	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.611	2025-01-02 02:21:41.611
cm5ep9x7y005rkj5d4g35qh31	LEI000048	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.615	2025-01-02 02:21:41.615
cm5ep9x80005ukj5d81a3d5b1	LEI000049	cm5ep9x0h0001kj5d5usts2vv	PENDING	2025-01-02 02:21:41.617	2025-01-02 02:21:41.617
cm5ep9x84005ykj5d4g9iv9vy	LEI000050	cm5ep9x0i0002kj5ddvyifkpm	INACTIVE	2025-01-02 02:21:41.62	2025-01-02 02:21:41.62
cm5ep9x870062kj5dwm89kj78	LEI000051	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.623	2025-01-02 02:21:41.623
cm5ep9x890065kj5dg0qviahe	LEI000052	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.626	2025-01-02 02:21:41.626
cm5ep9x8c0069kj5dpzce9sv0	LEI000053	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.628	2025-01-02 02:21:41.628
cm5ep9x8e006dkj5d8qx5zz12	LEI000054	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.63	2025-01-02 02:21:41.63
cm5ep9x8g006gkj5dy8i0m1zf	LEI000055	cm5ep9x0h0001kj5d5usts2vv	INACTIVE	2025-01-02 02:21:41.632	2025-01-02 02:21:41.632
cm5ep9x8i006kkj5dgzghqzca	LEI000056	cm5ep9x0i0002kj5ddvyifkpm	PENDING	2025-01-02 02:21:41.634	2025-01-02 02:21:41.634
cm5ep9x8l006okj5d4q3w7uao	LEI000057	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.637	2025-01-02 02:21:41.637
cm5ep9x8n006rkj5dx0eaob5t	LEI000058	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.639	2025-01-02 02:21:41.639
cm5ep9x8p006vkj5dmqw5dwzw	LEI000059	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.641	2025-01-02 02:21:41.641
cm5ep9x8r006zkj5dkbmnhlhv	LEI000060	cm5ep9x060000kj5dao3zpodk	INACTIVE	2025-01-02 02:21:41.643	2025-01-02 02:21:41.643
cm5ep9x8t0074kj5dt03k9w35	LEI000061	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.646	2025-01-02 02:21:41.646
cm5ep9x8v0078kj5dlvl94wki	LEI000062	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.648	2025-01-02 02:21:41.648
cm5ep9x8x007bkj5dhvx3akxg	LEI000063	cm5ep9x0i0003kj5d6up661uu	PENDING	2025-01-02 02:21:41.65	2025-01-02 02:21:41.65
cm5ep9x8z007gkj5dm8eqyn8b	LEI000064	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.652	2025-01-02 02:21:41.652
cm5ep9x92007kkj5dk4995xsc	LEI000065	cm5ep9x0k0005kj5dusi02uua	INACTIVE	2025-01-02 02:21:41.654	2025-01-02 02:21:41.654
cm5ep9x94007okj5d32glrqy9	LEI000066	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.656	2025-01-02 02:21:41.656
cm5ep9x95007rkj5dniycqy0g	LEI000067	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.658	2025-01-02 02:21:41.658
cm5ep9x97007ukj5d4k7zutgt	LEI000068	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.66	2025-01-02 02:21:41.66
cm5ep9x9a007zkj5d6vwaa04x	LEI000069	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.662	2025-01-02 02:21:41.662
cm5ep9x9c0084kj5dbouuwpz2	LEI000070	cm5ep9x0j0004kj5dzfxo6h6x	INACTIVE	2025-01-02 02:21:41.664	2025-01-02 02:21:41.664
cm5ep9x9e0088kj5dtwjvndd2	LEI000071	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.667	2025-01-02 02:21:41.667
cm5ep9x9g008ckj5datd7vmpe	LEI000072	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.669	2025-01-02 02:21:41.669
cm5ep9x9j008hkj5da4yyqv5g	LEI000073	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.671	2025-01-02 02:21:41.671
cm5ep9x9l008lkj5d7ezcm8pi	LEI000074	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.674	2025-01-02 02:21:41.674
cm5ep9x9o008qkj5d1w59rsym	LEI000075	cm5ep9x0i0003kj5d6up661uu	INACTIVE	2025-01-02 02:21:41.677	2025-01-02 02:21:41.677
cm5ep9x9r008ukj5d2bi8gm1t	LEI000076	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.679	2025-01-02 02:21:41.679
cm5ep9x9t008ykj5drzreetmy	LEI000077	cm5ep9x0k0005kj5dusi02uua	PENDING	2025-01-02 02:21:41.682	2025-01-02 02:21:41.682
cm5ep9x9v0092kj5dfbrogdmo	LEI000078	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.684	2025-01-02 02:21:41.684
cm5ep9x9y0097kj5dwnnwyliy	LEI000079	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.687	2025-01-02 02:21:41.687
cm5ep9xa0009akj5dwx3o4exn	LEI000080	cm5ep9x0i0002kj5ddvyifkpm	INACTIVE	2025-01-02 02:21:41.689	2025-01-02 02:21:41.689
cm5ep9xa2009dkj5dnqizgb10	LEI000081	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.691	2025-01-02 02:21:41.691
cm5ep9xa5009hkj5dohooyae0	LEI000082	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.693	2025-01-02 02:21:41.693
cm5ep9xa8009mkj5dw22b5996	LEI000083	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.696	2025-01-02 02:21:41.696
cm5ep9xaa009rkj5dukltul07	LEI000084	cm5ep9x060000kj5dao3zpodk	PENDING	2025-01-02 02:21:41.699	2025-01-02 02:21:41.699
cm5ep9xad009vkj5dk0znzivq	LEI000085	cm5ep9x0h0001kj5d5usts2vv	INACTIVE	2025-01-02 02:21:41.701	2025-01-02 02:21:41.701
cm5ep9xaf009zkj5dpjcg3ego	LEI000086	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.704	2025-01-02 02:21:41.704
cm5ep9xai00a4kj5dhg0g9gnk	LEI000087	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.706	2025-01-02 02:21:41.706
cm5ep9xal00a8kj5dumazwwpo	LEI000088	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.709	2025-01-02 02:21:41.709
cm5ep9xan00ackj5d9mvrn4ah	LEI000089	cm5ep9x0k0005kj5dusi02uua	ACTIVE	2025-01-02 02:21:41.711	2025-01-02 02:21:41.711
cm5ep9xap00agkj5d9ov59ash	LEI000090	cm5ep9x060000kj5dao3zpodk	INACTIVE	2025-01-02 02:21:41.714	2025-01-02 02:21:41.714
cm5ep9xar00ajkj5d4tdoaab4	LEI000091	cm5ep9x0h0001kj5d5usts2vv	PENDING	2025-01-02 02:21:41.716	2025-01-02 02:21:41.716
cm5ep9xat00amkj5dy4uu335d	LEI000092	cm5ep9x0i0002kj5ddvyifkpm	ACTIVE	2025-01-02 02:21:41.718	2025-01-02 02:21:41.718
cm5ep9xax00arkj5dxf4dzqwi	LEI000093	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.721	2025-01-02 02:21:41.721
cm5ep9xaz00aukj5d7h63fkyq	LEI000094	cm5ep9x0j0004kj5dzfxo6h6x	ACTIVE	2025-01-02 02:21:41.723	2025-01-02 02:21:41.723
cm5ep9xb100aykj5dlduesafy	LEI000095	cm5ep9x0k0005kj5dusi02uua	INACTIVE	2025-01-02 02:21:41.725	2025-01-02 02:21:41.725
cm5ep9xb300b2kj5dopmp9afl	LEI000096	cm5ep9x060000kj5dao3zpodk	ACTIVE	2025-01-02 02:21:41.728	2025-01-02 02:21:41.728
cm5ep9xb600b6kj5di4ow2nqz	LEI000097	cm5ep9x0h0001kj5d5usts2vv	ACTIVE	2025-01-02 02:21:41.73	2025-01-02 02:21:41.73
cm5ep9xb800bakj5dgxm04dsk	LEI000098	cm5ep9x0i0002kj5ddvyifkpm	PENDING	2025-01-02 02:21:41.732	2025-01-02 02:21:41.732
cm5ep9xba00bfkj5d8p6sh22f	LEI000099	cm5ep9x0i0003kj5d6up661uu	ACTIVE	2025-01-02 02:21:41.735	2025-01-02 02:21:41.735
\.


--
-- Data for Name: CounterpartyContact; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CounterpartyContact" (id, "counterpartyId", type, "firstName", "lastName", title, email, phone, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CounterpartyType; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CounterpartyType" (id, name, description, "createdAt", "updatedAt") FROM stdin;
cm5ep9x060000kj5dao3zpodk	Bank	Financial institution	2025-01-02 02:21:41.335	2025-01-02 02:21:41.335
cm5ep9x0h0001kj5d5usts2vv	Insurance	Insurance provider	2025-01-02 02:21:41.345	2025-01-02 02:21:41.345
cm5ep9x0i0002kj5ddvyifkpm	Investment	Investment management company	2025-01-02 02:21:41.346	2025-01-02 02:21:41.346
cm5ep9x0i0003kj5d6up661uu	Corporate	Non-financial corporation	2025-01-02 02:21:41.347	2025-01-02 02:21:41.347
cm5ep9x0j0004kj5dzfxo6h6x	Government	Government entity	2025-01-02 02:21:41.348	2025-01-02 02:21:41.348
cm5ep9x0k0005kj5dusi02uua	Non-Profit	Non-profit organization	2025-01-02 02:21:41.348	2025-01-02 02:21:41.348
\.


--
-- Data for Name: CreditAgreement; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CreditAgreement" (id, "agreementNumber", "borrowerId", "lenderId", status, amount, currency, "startDate", "maturityDate", "interestRate", description, "createdAt", "updatedAt") FROM stdin;
cm5ep9xbo00bqkj5d9jws0u3v	CA-2024-001	cm5ep9xbg00blkj5dgg9d962w	LEI888888	ACTIVE	10000000	USD	2025-01-02 02:21:41.746	2026-01-02 02:21:41.746	5.5	\N	2025-01-02 02:21:41.749	2025-01-02 02:35:08.055
\.


--
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Entity" (id, "legalName", dba, "taxId", "countryOfIncorporation", status, "isAgent", "createdAt", "updatedAt") FROM stdin;
LEI000000	Global Bank Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.351	2025-01-02 02:21:41.351
LEI000001	Advanced Insurance Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.376	2025-01-02 02:21:41.376
LEI000002	Premier Investment Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.384	2025-01-02 02:21:41.384
LEI000003	Elite Corporate Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.39	2025-01-02 02:21:41.39
LEI000004	Strategic Government Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.396	2025-01-02 02:21:41.396
LEI000005	Dynamic Non-Profit Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.401	2025-01-02 02:21:41.401
LEI000006	Innovative Bank Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.406	2025-01-02 02:21:41.406
LEI000007	Pacific Insurance Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.411	2025-01-02 02:21:41.411
LEI000008	Atlantic Investment Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.418	2025-01-02 02:21:41.418
LEI000009	United Corporate Solutions	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.423	2025-01-02 02:21:41.423
LEI000010	Global Government Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.428	2025-01-02 02:21:41.428
LEI000011	Advanced Non-Profit Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.434	2025-01-02 02:21:41.434
LEI000012	Premier Bank Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.44	2025-01-02 02:21:41.44
LEI000013	Elite Insurance Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.446	2025-01-02 02:21:41.446
LEI000014	Strategic Investment Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.451	2025-01-02 02:21:41.451
LEI000015	Dynamic Corporate Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.456	2025-01-02 02:21:41.456
LEI000016	Innovative Government Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.462	2025-01-02 02:21:41.462
LEI000017	Pacific Non-Profit Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.468	2025-01-02 02:21:41.468
LEI000018	Atlantic Bank Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.472	2025-01-02 02:21:41.472
LEI000019	United Insurance Partners	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.478	2025-01-02 02:21:41.478
LEI000020	Global Investment Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.484	2025-01-02 02:21:41.484
LEI000021	Advanced Corporate Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.489	2025-01-02 02:21:41.489
LEI000022	Premier Government Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.493	2025-01-02 02:21:41.493
LEI000023	Elite Non-Profit Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.498	2025-01-02 02:21:41.498
LEI000024	Strategic Bank Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.502	2025-01-02 02:21:41.502
LEI000025	Dynamic Insurance Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.506	2025-01-02 02:21:41.506
LEI000026	Innovative Investment Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.512	2025-01-02 02:21:41.512
LEI000027	Pacific Corporate Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.516	2025-01-02 02:21:41.516
LEI000028	Atlantic Government Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.52	2025-01-02 02:21:41.52
LEI000029	United Non-Profit Group	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.525	2025-01-02 02:21:41.525
LEI000030	Global Bank Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.53	2025-01-02 02:21:41.53
LEI000031	Advanced Insurance Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.534	2025-01-02 02:21:41.534
LEI000032	Premier Investment Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.538	2025-01-02 02:21:41.538
LEI000033	Elite Corporate Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.542	2025-01-02 02:21:41.542
LEI000034	Strategic Government Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.547	2025-01-02 02:21:41.547
LEI000035	Dynamic Non-Profit Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.552	2025-01-02 02:21:41.552
LEI000036	Innovative Bank Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.556	2025-01-02 02:21:41.556
LEI000037	Pacific Insurance Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.563	2025-01-02 02:21:41.563
LEI000038	Atlantic Investment Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.568	2025-01-02 02:21:41.568
LEI000039	United Corporate Corporation	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.572	2025-01-02 02:21:41.572
LEI000040	Global Government Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.576	2025-01-02 02:21:41.576
LEI000041	Advanced Non-Profit Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.58	2025-01-02 02:21:41.58
LEI000042	Premier Bank Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.586	2025-01-02 02:21:41.586
LEI000043	Elite Insurance Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.59	2025-01-02 02:21:41.59
LEI000044	Strategic Investment Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.596	2025-01-02 02:21:41.596
LEI000045	Dynamic Corporate Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.601	2025-01-02 02:21:41.601
LEI000046	Innovative Government Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.606	2025-01-02 02:21:41.606
LEI000047	Pacific Non-Profit Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.609	2025-01-02 02:21:41.609
LEI000048	Atlantic Bank Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.613	2025-01-02 02:21:41.613
LEI000049	United Insurance Associates	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.616	2025-01-02 02:21:41.616
LEI000050	Global Investment International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.618	2025-01-02 02:21:41.618
LEI000051	Advanced Corporate International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.622	2025-01-02 02:21:41.622
LEI000052	Premier Government International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.624	2025-01-02 02:21:41.624
LEI000053	Elite Non-Profit International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.627	2025-01-02 02:21:41.627
LEI000054	Strategic Bank International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.629	2025-01-02 02:21:41.629
LEI000055	Dynamic Insurance International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.631	2025-01-02 02:21:41.631
LEI000056	Innovative Investment International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.633	2025-01-02 02:21:41.633
LEI000057	Pacific Corporate International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.636	2025-01-02 02:21:41.636
LEI000058	Atlantic Government International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.638	2025-01-02 02:21:41.638
LEI000059	United Non-Profit International	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.64	2025-01-02 02:21:41.64
LEI000060	Global Bank Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.642	2025-01-02 02:21:41.642
LEI000061	Advanced Insurance Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.644	2025-01-02 02:21:41.644
LEI000062	Premier Investment Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.647	2025-01-02 02:21:41.647
LEI000063	Elite Corporate Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.649	2025-01-02 02:21:41.649
LEI000064	Strategic Government Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.651	2025-01-02 02:21:41.651
LEI000065	Dynamic Non-Profit Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.653	2025-01-02 02:21:41.653
LEI000066	Innovative Bank Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.655	2025-01-02 02:21:41.655
LEI000067	Pacific Insurance Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.657	2025-01-02 02:21:41.657
LEI000068	Atlantic Investment Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.659	2025-01-02 02:21:41.659
LEI000069	United Corporate Ventures	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.661	2025-01-02 02:21:41.661
LEI000070	Global Government Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.663	2025-01-02 02:21:41.663
LEI000071	Advanced Non-Profit Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.666	2025-01-02 02:21:41.666
LEI000072	Premier Bank Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.668	2025-01-02 02:21:41.668
LEI000073	Elite Insurance Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.67	2025-01-02 02:21:41.67
LEI000074	Strategic Investment Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.672	2025-01-02 02:21:41.672
LEI000075	Dynamic Corporate Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.675	2025-01-02 02:21:41.675
LEI000076	Innovative Government Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.678	2025-01-02 02:21:41.678
LEI000077	Pacific Non-Profit Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.68	2025-01-02 02:21:41.68
LEI000078	Atlantic Bank Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.683	2025-01-02 02:21:41.683
LEI000079	United Insurance Holdings	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.685	2025-01-02 02:21:41.685
LEI000080	Global Investment Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.688	2025-01-02 02:21:41.688
LEI000081	Advanced Corporate Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.69	2025-01-02 02:21:41.69
LEI000082	Premier Government Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.692	2025-01-02 02:21:41.692
LEI000083	Elite Non-Profit Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.695	2025-01-02 02:21:41.695
LEI000084	Strategic Bank Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.697	2025-01-02 02:21:41.697
LEI000085	Dynamic Insurance Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.7	2025-01-02 02:21:41.7
LEI000086	Innovative Investment Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.702	2025-01-02 02:21:41.702
LEI000087	Pacific Corporate Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.705	2025-01-02 02:21:41.705
LEI000088	Atlantic Government Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.708	2025-01-02 02:21:41.708
LEI000089	United Non-Profit Capital	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.71	2025-01-02 02:21:41.71
LEI000090	Global Bank Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.712	2025-01-02 02:21:41.712
LEI000091	Advanced Insurance Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.715	2025-01-02 02:21:41.715
LEI000092	Premier Investment Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.717	2025-01-02 02:21:41.717
LEI000093	Elite Corporate Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.719	2025-01-02 02:21:41.719
LEI000094	Strategic Government Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.722	2025-01-02 02:21:41.722
LEI000095	Dynamic Non-Profit Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.724	2025-01-02 02:21:41.724
LEI000096	Innovative Bank Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.726	2025-01-02 02:21:41.726
LEI000097	Pacific Insurance Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.729	2025-01-02 02:21:41.729
LEI000098	Atlantic Investment Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.731	2025-01-02 02:21:41.731
LEI000099	United Corporate Enterprises	\N	\N	\N	ACTIVE	f	2025-01-02 02:21:41.733	2025-01-02 02:21:41.733
LEI999999	Test Company Inc.	\N	TAX123	US	ACTIVE	f	2025-01-02 02:21:41.739	2025-01-02 02:21:41.739
LEI888888	Bank of Test	Test Bank	BANK456	US	ACTIVE	t	2025-01-02 02:21:41.743	2025-01-02 02:21:41.743
\.


--
-- Data for Name: Facility; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Facility" (id, "facilityName", "facilityType", "creditAgreementId", "commitmentAmount", "availableAmount", currency, "startDate", "maturityDate", "interestType", "baseRate", margin, status, description, "createdAt", "updatedAt") FROM stdin;
cm5ep9xbo00brkj5do5rwlzsd	Term Loan A	TERM_LOAN	cm5ep9xbo00bqkj5d9jws0u3v	6000000	6000000	USD	2025-01-02 02:21:41.746	2026-01-02 02:21:41.746	FLOATING	SOFR	2.5	ACTIVE	\N	2025-01-02 02:21:41.749	2025-01-02 02:21:41.749
\.


--
-- Data for Name: FacilityPosition; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."FacilityPosition" (id, "facilityId", "lenderId", amount, share, status, "createdAt", "updatedAt") FROM stdin;
cm5ep9xbo00btkj5d5bi0h4v0	cm5ep9xbo00brkj5do5rwlzsd	cm5ep9xbk00bokj5domsprisi	6549999.999999999	100	ACTIVE	2025-01-02 02:21:41.749	2025-01-02 04:18:30.808
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
\.


--
-- Data for Name: Lender; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Lender" (id, "entityId", status, "onboardingDate", "createdAt", "updatedAt") FROM stdin;
cm5ep9xbk00bokj5domsprisi	LEI888888	ACTIVE	2025-01-02 02:21:41.745	2025-01-02 02:21:41.745	2025-01-02 02:21:41.745
\.


--
-- Data for Name: LenderPositionHistory; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."LenderPositionHistory" (id, "facilityId", "lenderId", "changeDateTime", "changeType", "previousOutstandingAmount", "newOutstandingAmount", "previousAccruedInterest", "newAccruedInterest", "changeAmount", "userId", notes, "createdAt", "updatedAt", "servicingActivityId", "tradeId") FROM stdin;
cm5es622b000c117n96rkediw	cm5ep9xbo00brkj5do5rwlzsd	LEI888888	2025-01-02 03:42:40.116	PAYDOWN	6999999.999999999	6952631.578947367	0	0	47368.42105263157	SYSTEM	Principal payment of $47,368.42 (100.00% of $47,368.42)	2025-01-02 03:42:40.116	2025-01-02 03:42:40.116	\N	\N
cm5es624d000h117nsk0qx4p7	cm5ep9xbo00brkj5do5rwlzsd	LEI888888	2025-01-02 03:42:40.189	PAYDOWN	6952631.578947367	6899999.999999999	0	0	52631.57894736843	SYSTEM	Principal payment of $52,631.58 (100.00% of $52,631.58)	2025-01-02 03:42:40.189	2025-01-02 03:42:40.189	\N	\N
cm5esbowe0010117njvn8vrxi	cm5ep9xbo00brkj5do5rwlzsd	LEI888888	2025-01-02 03:47:02.991	PAYDOWN	6899999.999999999	6878835.386338185	0	0	21164.61366181411	SYSTEM	Principal payment of $21,164.61 (100.00% of $21,164.61)	2025-01-02 03:47:02.991	2025-01-02 03:47:02.991	\N	\N
cm5esboyi0015117n2s86o0pv	cm5ep9xbo00brkj5do5rwlzsd	LEI888888	2025-01-02 03:47:03.067	PAYDOWN	6878835.386338185	6855319.148936169	0	0	23516.23740201568	SYSTEM	Principal payment of $23,516.24 (100.00% of $23,516.24)	2025-01-02 03:47:03.067	2025-01-02 03:47:03.067	\N	\N
cm5esboyx001a117nc9poavnq	cm5ep9xbo00brkj5do5rwlzsd	LEI888888	2025-01-02 03:47:03.081	PAYDOWN	6855319.148936169	6599999.999999999	0	0	255319.1489361702	SYSTEM	Principal payment of $255,319.15 (100.00% of $255,319.15)	2025-01-02 03:47:03.081	2025-01-02 03:47:03.081	\N	\N
cm5etg5jt000aev0dsvdjkuex	cm5ep9xbo00brkj5do5rwlzsd	LEI888888	2025-01-02 04:18:30.81	PAYDOWN	6559999.999999999	6549999.999999999	0	0	10000	SYSTEM	Principal payment of $10,000.00 (100.00% of $10,000.00)	2025-01-02 04:18:30.81	2025-01-02 04:18:30.81	cm5et539t001e117n83up8u9i	\N
\.


--
-- Data for Name: Loan; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Loan" (id, "facilityId", amount, "outstandingAmount", currency, status, "interestPeriod", "drawDate", "baseRate", "effectiveRate", "createdAt", "updatedAt") FROM stdin;
cm5epvynu0004t6nh56ktvmfz	cm5ep9xbo00brkj5do5rwlzsd	1000000	306886.8980963044	USD	ACTIVE	1M	2025-01-02 02:38:49.857	5.00000	7.50000	2025-01-02 02:38:49.914	2025-01-02 04:18:30.687
cm5eq5tc7000it6nhcbh1otzv	cm5ep9xbo00brkj5do5rwlzsd	1000000	340985.4423292274	USD	ACTIVE	1M	2025-01-02 02:46:29.522	4.00000	6.50000	2025-01-02 02:46:29.576	2025-01-02 04:18:30.773
cm5esao8f000q117nowxyg5xs	cm5ep9xbo00brkj5do5rwlzsd	4000000	3702127.65957447	USD	ACTIVE	1M	2025-01-02 03:46:15.417	1.00000	3.50000	2025-01-02 03:46:15.471	2025-01-02 04:18:30.787
\.


--
-- Data for Name: ServicingActivity; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingActivity" (id, "facilityId", "activityType", "dueDate", description, amount, status, "completedAt", "completedBy", "createdAt", "updatedAt") FROM stdin;
cm5epuv390001t6nhz0kpocmb	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 02:36:03.965		100000	COMPLETED	2025-01-02 02:39:19.331	Current User	2025-01-02 02:37:58.627	2025-01-02 02:39:19.331
cm5eq494m000bt6nhd4uumyia	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 02:44:58.498		10000000	PENDING	\N	\N	2025-01-02 02:45:16.726	2025-01-02 02:45:16.726
cm5eq50k7000et6nhn98jlwgh	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 02:45:16.777		1000000	COMPLETED	2025-01-02 02:46:39.47	Current User	2025-01-02 02:45:52.279	2025-01-02 02:46:39.471
cm5es1esg0001117n4pqba7i0	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 03:38:52.713		100000	COMPLETED	2025-01-02 03:39:09.61	Current User	2025-01-02 03:39:03.328	2025-01-02 03:39:09.61
cm5es5z6b0009117n40mgmina	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 03:42:28.986		100000	COMPLETED	2025-01-02 03:42:40.202	Current User	2025-01-02 03:42:36.371	2025-01-02 03:42:40.203
cm5es9k2e000l117nvm0vkjsu	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 03:45:13.33		5000000	PENDING	\N	\N	2025-01-02 03:45:23.413	2025-01-02 03:45:23.413
cm5esbl9f000x117n0102crsx	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 03:46:19.148		300000	COMPLETED	2025-01-02 03:47:03.097	Current User	2025-01-02 03:46:58.275	2025-01-02 03:47:03.098
cm5et539t001e117n83up8u9i	cm5ep9xbo00brkj5do5rwlzsd	PRINCIPAL_PAYMENT	2025-01-02 04:09:47.486		10000	COMPLETED	2025-01-02 04:18:30.821	Current User	2025-01-02 04:09:54.64	2025-01-02 04:18:30.821
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
cm5ep9xbc00bgkj5d916k8tey	Admin	Full system access	2025-01-02 02:21:41.736	2025-01-02 02:21:41.736
cm5ep9xbe00bhkj5d47fkkcd6	Manager	Team and assignment management	2025-01-02 02:21:41.739	2025-01-02 02:21:41.739
cm5ep9xbf00bikj5dgu3lewqw	Agent	Regular team member	2025-01-02 02:21:41.739	2025-01-02 02:21:41.739
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
\.


--
-- Data for Name: TransactionHistory; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."TransactionHistory" (id, "creditAgreementId", "loanId", "tradeId", "servicingActivityId", "activityType", amount, currency, status, description, "effectiveDate", "processedBy", "createdAt", "updatedAt") FROM stdin;
cm5epvyo80006t6nh58cp10hh	\N	cm5epvynu0004t6nh56ktvmfz	\N	\N	LOAN_DRAWDOWN	1000000	USD	COMPLETED	Loan drawdown from Term Loan A	2025-01-02 02:38:49.857	SYSTEM	2025-01-02 02:38:49.929	2025-01-02 02:38:49.927
cm5epwlc70009t6nhw75j7r51	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5epuv390001t6nhz0kpocmb	PRINCIPAL_PAYMENT	100000	USD	COMPLETED	Principal payment of 100000	2025-01-02 02:39:19.109	SYSTEM	2025-01-02 02:39:19.303	2025-01-02 02:39:19.303
cm5eq5tce000kt6nhloud5oke	\N	cm5eq5tc7000it6nhcbh1otzv	\N	\N	LOAN_DRAWDOWN	1000000	USD	COMPLETED	Loan drawdown from Term Loan A	2025-01-02 02:46:29.522	SYSTEM	2025-01-02 02:46:29.583	2025-01-02 02:46:29.582
cm5eq60xp000nt6nh9yy6v9i0	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5eq50k7000et6nhn98jlwgh	PRINCIPAL_PAYMENT	473684.2105263158	USD	COMPLETED	Principal payment of 473684.2105263158	2025-01-02 02:46:39.353	SYSTEM	2025-01-02 02:46:39.422	2025-01-02 02:46:39.422
cm5eq60yk000qt6nhueg85c53	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5eq50k7000et6nhn98jlwgh	PRINCIPAL_PAYMENT	526315.7894736842	USD	COMPLETED	Principal payment of 526315.7894736842	2025-01-02 02:46:39.354	SYSTEM	2025-01-02 02:46:39.453	2025-01-02 02:46:39.453
cm5es1jlr0004117n2ewusx34	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5es1esg0001117n4pqba7i0	PRINCIPAL_PAYMENT	47368.42105263158	USD	COMPLETED	Principal payment of 47368.42105263158	2025-01-02 03:39:09.497	SYSTEM	2025-01-02 03:39:09.567	2025-01-02 03:39:09.567
cm5es1jml0007117nfb2gfgev	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5es1esg0001117n4pqba7i0	PRINCIPAL_PAYMENT	52631.57894736842	USD	COMPLETED	Principal payment of 52631.57894736842	2025-01-02 03:39:09.498	SYSTEM	2025-01-02 03:39:09.598	2025-01-02 03:39:09.598
cm5es622v000e117niwpq0hwo	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5es5z6b0009117n40mgmina	PRINCIPAL_PAYMENT	47368.42105263157	USD	COMPLETED	Principal payment of $47,368.42	2025-01-02 03:42:39.967	SYSTEM	2025-01-02 03:42:40.135	2025-01-02 03:42:40.135
cm5es624f000j117n9s8y1bud	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5es5z6b0009117n40mgmina	PRINCIPAL_PAYMENT	52631.57894736843	USD	COMPLETED	Principal payment of $52,631.58	2025-01-02 03:42:39.967	SYSTEM	2025-01-02 03:42:40.192	2025-01-02 03:42:40.192
cm5esao8k000s117n48x2h6ir	\N	cm5esao8f000q117nowxyg5xs	\N	\N	LOAN_DRAWDOWN	4000000	USD	COMPLETED	Loan drawdown from Term Loan A	2025-01-02 03:46:15.417	SYSTEM	2025-01-02 03:46:15.476	2025-01-02 03:46:15.476
cm5esboxa0012117npeeb8ojd	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5esbl9f000x117n0102crsx	PRINCIPAL_PAYMENT	21164.61366181411	USD	COMPLETED	Principal payment of $21,164.61	2025-01-02 03:47:02.898	SYSTEM	2025-01-02 03:47:03.023	2025-01-02 03:47:03.023
cm5esboyk0017117ne5k1rjhb	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5esbl9f000x117n0102crsx	PRINCIPAL_PAYMENT	23516.23740201568	USD	COMPLETED	Principal payment of $23,516.24	2025-01-02 03:47:02.899	SYSTEM	2025-01-02 03:47:03.068	2025-01-02 03:47:03.068
cm5esboyy001c117nkdcdzz7i	cm5ep9xbo00bqkj5d9jws0u3v	cm5esao8f000q117nowxyg5xs	\N	cm5esbl9f000x117n0102crsx	PRINCIPAL_PAYMENT	255319.1489361702	USD	COMPLETED	Principal payment of $255,319.15	2025-01-02 03:47:02.899	SYSTEM	2025-01-02 03:47:03.083	2025-01-02 03:47:03.083
cm5et565g001h117n27d7v7ci	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	705.4871220604701	USD	PENDING	Principal payment of $705.49	2025-01-02 04:09:58.278	SYSTEM	2025-01-02 04:09:58.373	2025-01-02 04:09:58.373
cm5et566h001k117n80ey7d7u	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	783.8745800671892	USD	PENDING	Principal payment of $783.87	2025-01-02 04:09:58.278	SYSTEM	2025-01-02 04:09:58.41	2025-01-02 04:09:58.41
cm5et566w001n117ng2k3eaqg	cm5ep9xbo00bqkj5d9jws0u3v	cm5esao8f000q117nowxyg5xs	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	8510.638297872341	USD	PENDING	Principal payment of $8,510.64	2025-01-02 04:09:58.278	SYSTEM	2025-01-02 04:09:58.424	2025-01-02 04:09:58.424
cm5et710r001s117notjyr593	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	705.48712206047	USD	PENDING	Principal payment of $705.49	2025-01-02 04:11:24.015	SYSTEM	2025-01-02 04:11:25.035	2025-01-02 04:11:25.035
cm5et714y001v117npwccakzo	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	783.8745800671891	USD	PENDING	Principal payment of $783.87	2025-01-02 04:11:24.018	SYSTEM	2025-01-02 04:11:25.186	2025-01-02 04:11:25.186
cm5et71ec001y117nmd7ola3h	cm5ep9xbo00bqkj5d9jws0u3v	cm5esao8f000q117nowxyg5xs	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	8510.638297872341	USD	PENDING	Principal payment of $8,510.64	2025-01-02 04:11:24.018	SYSTEM	2025-01-02 04:11:25.524	2025-01-02 04:11:25.524
cm5et7ne90002913mu4z30sjv	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	705.4871220604698	USD	PENDING	Principal payment of $705.49	2025-01-02 04:11:53.904	SYSTEM	2025-01-02 04:11:54.034	2025-01-02 04:11:54.034
cm5et7ngj0005913m6mzcv26u	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	783.8745800671891	USD	PENDING	Principal payment of $783.87	2025-01-02 04:11:53.905	SYSTEM	2025-01-02 04:11:54.116	2025-01-02 04:11:54.116
cm5et7ngz0008913mr6tup4oa	cm5ep9xbo00bqkj5d9jws0u3v	cm5esao8f000q117nowxyg5xs	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	8510.638297872341	USD	PENDING	Principal payment of $8,510.64	2025-01-02 04:11:53.905	SYSTEM	2025-01-02 04:11:54.132	2025-01-02 04:11:54.132
cm5et9dy8000d913mdth74hzt	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	705.4871220604698	USD	PENDING	Principal payment of $705.49	2025-01-02 04:13:14.756	SYSTEM	2025-01-02 04:13:15.104	2025-01-02 04:13:15.104
cm5et9dzn000g913m9s0l7y7y	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	783.8745800671891	USD	PENDING	Principal payment of $783.87	2025-01-02 04:13:14.76	SYSTEM	2025-01-02 04:13:15.155	2025-01-02 04:13:15.155
cm5et9e03000j913m4d7g7jf9	cm5ep9xbo00bqkj5d9jws0u3v	cm5esao8f000q117nowxyg5xs	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	8510.638297872341	USD	PENDING	Principal payment of $8,510.64	2025-01-02 04:13:14.76	SYSTEM	2025-01-02 04:13:15.172	2025-01-02 04:13:15.172
cm5etg5hh0002ev0d0oumoctd	cm5ep9xbo00bqkj5d9jws0u3v	cm5epvynu0004t6nh56ktvmfz	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	705.4871220604696	USD	PENDING	Principal payment of $705.49	2025-01-02 04:18:30.606	SYSTEM	2025-01-02 04:18:30.725	2025-01-02 04:18:30.725
cm5etg5iu0005ev0dkmsn2g9b	cm5ep9xbo00bqkj5d9jws0u3v	cm5eq5tc7000it6nhcbh1otzv	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	783.8745800671891	USD	PENDING	Principal payment of $783.87	2025-01-02 04:18:30.607	SYSTEM	2025-01-02 04:18:30.774	2025-01-02 04:18:30.774
cm5etg5j80008ev0dcyiggb1h	cm5ep9xbo00bqkj5d9jws0u3v	cm5esao8f000q117nowxyg5xs	\N	cm5et539t001e117n83up8u9i	PRINCIPAL_PAYMENT	8510.638297872341	USD	PENDING	Principal payment of $8,510.64	2025-01-02 04:18:30.607	SYSTEM	2025-01-02 04:18:30.788	2025-01-02 04:18:30.788
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6606862a-6514-4e04-add3-de250f0c6284	4e30124d60cbf33e7a7366dd43542ddd9657ddd1b31988b4bfbc56e0fd2cb612	2025-01-01 21:05:32.096699-05	20250102020531_init	\N	\N	2025-01-01 21:05:31.979119-05	1
351e1b70-392d-4f18-af97-06c54ef708a9	70b09fad9d39a6fc4668f97bfef66494ce8973d4bc488fad284639bc9690d43b	2025-01-01 21:56:54.515506-05	20250102025654_add_lender_position_history	\N	\N	2025-01-01 21:56:54.485428-05	1
fa8b5ba8-c571-4186-9c22-9326cbbe767a	4ec6e05cdffda9f85e3581c8ede17dc2c3d2c4d37bcbd681ecaf9b04bcf20760	2025-01-01 23:17:44.815552-05	20250102041744_update_lender_position_history	\N	\N	2025-01-01 23:17:44.793285-05	1
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
-- Name: CounterpartyType CounterpartyType_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CounterpartyType"
    ADD CONSTRAINT "CounterpartyType_pkey" PRIMARY KEY (id);


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
-- Name: Counterparty_typeId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Counterparty_typeId_idx" ON public."Counterparty" USING btree ("typeId");


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
-- Name: Counterparty Counterparty_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Counterparty"
    ADD CONSTRAINT "Counterparty_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."CounterpartyType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditAgreement CreditAgreement_borrowerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CreditAgreement"
    ADD CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES public."Borrower"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditAgreement CreditAgreement_lenderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CreditAgreement"
    ADD CONSTRAINT "CreditAgreement_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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

