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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "entityId" text NOT NULL,
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
    "entityId" text NOT NULL,
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


ALTER TABLE public."Contact" OWNER TO stephenscott;

--
-- Name: Counterparty; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."Counterparty" (
    id text NOT NULL,
    name text NOT NULL,
    "typeId" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Counterparty" OWNER TO stephenscott;

--
-- Name: CounterpartyAddress; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."CounterpartyAddress" (
    id text NOT NULL,
    "counterpartyId" text NOT NULL,
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


ALTER TABLE public."CounterpartyAddress" OWNER TO stephenscott;

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
    "registrationNumber" text,
    "taxId" text,
    "dateOfBirth" timestamp(3) without time zone,
    "dateOfIncorporation" timestamp(3) without time zone,
    "countryOfIncorporation" text,
    "governmentId" text,
    "governmentIdType" text,
    "governmentIdExpiry" timestamp(3) without time zone,
    "primaryContactName" text,
    "primaryContactEmail" text,
    "primaryContactPhone" text,
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
    "baseRate" double precision DEFAULT 0.0 NOT NULL,
    "effectiveRate" double precision DEFAULT 0.0 NOT NULL,
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
    "teamMemberId" text NOT NULL,
    "facilityId" text NOT NULL,
    "assignmentType" text DEFAULT 'PRIMARY_AGENT'::text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    notes text,
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
    description text NOT NULL,
    permissions text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServicingRole" OWNER TO stephenscott;

--
-- Name: ServicingTeamMember; Type: TABLE; Schema: public; Owner: stephenscott
--

CREATE TABLE public."ServicingTeamMember" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "roleId" text NOT NULL,
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
    "counterpartyId" text NOT NULL,
    "tradeDate" timestamp(3) without time zone NOT NULL,
    "settlementDate" timestamp(3) without time zone NOT NULL,
    amount double precision NOT NULL,
    price double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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

COPY public."Address" (id, "entityId", type, street1, street2, city, state, "postalCode", country, "isPrimary", "createdAt", "updatedAt") FROM stdin;
cm5a1cops00e88e3xwssc5iyv	cm5a1cops00e78e3xkbj1n4gi	LEGAL	376 Main St	Suite 76	London	CA	95993	UK	t	2024-12-29 20:00:55.073	2024-12-29 20:00:55.073
cm5a1copz00ed8e3x0e2eb4bc	cm5a1copz00ec8e3xylnnymk0	MAILING	490 Main St	Suite 43	Dubai	\N	80928	UAE	t	2024-12-29 20:00:55.079	2024-12-29 20:00:55.079
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
cm5a1copx00eb8e3x2a9lpqzc	cm5a1cops00e78e3xkbj1n4gi	Technology	Corporation	BBB	S&P	Medium	COMPLETED	COMPLETED	2024-12-29 20:00:55.078	2024-12-29 20:00:55.078
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Contact" (id, "entityId", type, "firstName", "lastName", title, email, phone, "isPrimary", "createdAt", "updatedAt") FROM stdin;
cm5a1cops00e98e3x725wg3sb	cm5a1cops00e78e3xkbj1n4gi	PRIMARY	John	Davis	Director	contact83@example.com	+1-555-9844	t	2024-12-29 20:00:55.073	2024-12-29 20:00:55.073
cm5a1copz00ee8e3x95ozz9sy	cm5a1copz00ec8e3xylnnymk0	BILLING	James	Miller	CTO	contact52@example.com	+1-555-7175	t	2024-12-29 20:00:55.079	2024-12-29 20:00:55.079
\.


--
-- Data for Name: Counterparty; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Counterparty" (id, name, "typeId", status, "createdAt", "updatedAt") FROM stdin;
cm5a1coi600078e3xih8e3xpm	Global Bank Solutions	cm5a1cohs00008e3x2ippl4yg	INACTIVE	2024-12-29 20:00:54.798	2024-12-29 20:00:54.798
cm5a1coii000b8e3x95nllfh1	Advanced Insurance Solutions	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.811	2024-12-29 20:00:54.811
cm5a1coim000g8e3xi50px7kn	Premier Investment Solutions	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.815	2024-12-29 20:00:54.815
cm5a1coip000k8e3xkby178zm	Elite Corporate Solutions	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.817	2024-12-29 20:00:54.817
cm5a1cois000q8e3x368i68ln	Strategic Government Solutions	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.82	2024-12-29 20:00:54.82
cm5a1coj8000v8e3xjwbalggl	Dynamic Non-Profit Solutions	cm5a1coi200058e3xyaelj6va	INACTIVE	2024-12-29 20:00:54.837	2024-12-29 20:00:54.837
cm5a1cojw00118e3x3ffe38ai	Innovative Bank Solutions	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.86	2024-12-29 20:00:54.86
cm5a1cojz00168e3x1e429jd8	Pacific Insurance Solutions	cm5a1cohz00018e3xaeoasaqb	PENDING	2024-12-29 20:00:54.863	2024-12-29 20:00:54.863
cm5a1cok1001c8e3xbs3enakc	Atlantic Investment Solutions	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.865	2024-12-29 20:00:54.865
cm5a1cok4001i8e3xw03kajzm	United Corporate Solutions	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.868	2024-12-29 20:00:54.868
cm5a1cok6001o8e3x76q1xpwh	Global Government Partners	cm5a1coi200048e3x5mggx6ox	INACTIVE	2024-12-29 20:00:54.871	2024-12-29 20:00:54.871
cm5a1cok9001t8e3x1y572i7p	Advanced Non-Profit Partners	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.873	2024-12-29 20:00:54.873
cm5a1cokb001x8e3xcxlk1ji9	Premier Bank Partners	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.875	2024-12-29 20:00:54.875
cm5a1cokd00228e3xofxkm25t	Elite Insurance Partners	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.877	2024-12-29 20:00:54.877
cm5a1cokf00268e3xke55ff4w	Strategic Investment Partners	cm5a1coi000028e3x73jztc5m	PENDING	2024-12-29 20:00:54.879	2024-12-29 20:00:54.879
cm5a1cokh002c8e3xss2t35fl	Dynamic Corporate Partners	cm5a1coi100038e3xsurlvuts	INACTIVE	2024-12-29 20:00:54.881	2024-12-29 20:00:54.881
cm5a1coks002h8e3xm8r4fznf	Innovative Government Partners	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.893	2024-12-29 20:00:54.893
cm5a1cokv002n8e3x7uappy2g	Pacific Non-Profit Partners	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.895	2024-12-29 20:00:54.895
cm5a1cokx002s8e3x3xt2hbo3	Atlantic Bank Partners	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.898	2024-12-29 20:00:54.898
cm5a1cokz002x8e3xrjqfq19s	United Insurance Partners	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.899	2024-12-29 20:00:54.899
cm5a1col000328e3xlyh6slyp	Global Investment Group	cm5a1coi000028e3x73jztc5m	INACTIVE	2024-12-29 20:00:54.901	2024-12-29 20:00:54.901
cm5a1col200378e3x10ixojr9	Advanced Corporate Group	cm5a1coi100038e3xsurlvuts	PENDING	2024-12-29 20:00:54.903	2024-12-29 20:00:54.903
cm5a1col5003d8e3xex1z199l	Premier Government Group	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.905	2024-12-29 20:00:54.905
cm5a1col7003h8e3xh7681e5a	Elite Non-Profit Group	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.907	2024-12-29 20:00:54.907
cm5a1col9003m8e3xjrh7l1p1	Strategic Bank Group	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.909	2024-12-29 20:00:54.909
cm5a1colb003q8e3xh8wy8lv8	Dynamic Insurance Group	cm5a1cohz00018e3xaeoasaqb	INACTIVE	2024-12-29 20:00:54.911	2024-12-29 20:00:54.911
cm5a1colc003u8e3xbowlp0my	Innovative Investment Group	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.913	2024-12-29 20:00:54.913
cm5a1cole003y8e3xbx41s1pd	Pacific Corporate Group	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.915	2024-12-29 20:00:54.915
cm5a1colg00438e3xjn2f0bls	Atlantic Government Group	cm5a1coi200048e3x5mggx6ox	PENDING	2024-12-29 20:00:54.917	2024-12-29 20:00:54.917
cm5a1coli00488e3xc9d7u7k4	United Non-Profit Group	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.919	2024-12-29 20:00:54.919
cm5a1colk004d8e3xmilxbj7i	Global Bank Corporation	cm5a1cohs00008e3x2ippl4yg	INACTIVE	2024-12-29 20:00:54.921	2024-12-29 20:00:54.921
cm5a1coln004j8e3xpvzfzms5	Advanced Insurance Corporation	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.924	2024-12-29 20:00:54.924
cm5a1colq004p8e3xrrb677b1	Premier Investment Corporation	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.926	2024-12-29 20:00:54.926
cm5a1cols004v8e3x6prp0dfg	Elite Corporate Corporation	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.929	2024-12-29 20:00:54.929
cm5a1colv00518e3x0n88ik1x	Strategic Government Corporation	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.931	2024-12-29 20:00:54.931
cm5a1colw00558e3xmiwf04ch	Dynamic Non-Profit Corporation	cm5a1coi200058e3xyaelj6va	INACTIVE	2024-12-29 20:00:54.933	2024-12-29 20:00:54.933
cm5a1colz005b8e3x12zxdk2h	Innovative Bank Corporation	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.936	2024-12-29 20:00:54.936
cm5a1com3005g8e3xpnf2mai9	Pacific Insurance Corporation	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.94	2024-12-29 20:00:54.94
cm5a1com6005m8e3xg05nbnew	Atlantic Investment Corporation	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.943	2024-12-29 20:00:54.943
cm5a1com8005q8e3xco3tgqoc	United Corporate Corporation	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.944	2024-12-29 20:00:54.944
cm5a1comb005w8e3xobez1to6	Global Government Associates	cm5a1coi200048e3x5mggx6ox	INACTIVE	2024-12-29 20:00:54.948	2024-12-29 20:00:54.948
cm5a1comd00618e3xh65p3wos	Advanced Non-Profit Associates	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.949	2024-12-29 20:00:54.949
cm5a1comf00668e3xrly07g10	Premier Bank Associates	cm5a1cohs00008e3x2ippl4yg	PENDING	2024-12-29 20:00:54.952	2024-12-29 20:00:54.952
cm5a1comh006b8e3xqr8zzxte	Elite Insurance Associates	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.953	2024-12-29 20:00:54.953
cm5a1comi006g8e3xrgtlygwi	Strategic Investment Associates	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.955	2024-12-29 20:00:54.955
cm5a1comk006m8e3xnq4mylgg	Dynamic Corporate Associates	cm5a1coi100038e3xsurlvuts	INACTIVE	2024-12-29 20:00:54.957	2024-12-29 20:00:54.957
cm5a1comn006r8e3xl2fyt24a	Innovative Government Associates	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.959	2024-12-29 20:00:54.959
cm5a1como006v8e3x5yaxi1in	Pacific Non-Profit Associates	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.96	2024-12-29 20:00:54.96
cm5a1comp00708e3xaxq8lvim	Atlantic Bank Associates	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.961	2024-12-29 20:00:54.961
cm5a1comq00748e3xronlszs4	United Insurance Associates	cm5a1cohz00018e3xaeoasaqb	PENDING	2024-12-29 20:00:54.962	2024-12-29 20:00:54.962
cm5a1coms007a8e3x9njfkm9a	Global Investment International	cm5a1coi000028e3x73jztc5m	INACTIVE	2024-12-29 20:00:54.964	2024-12-29 20:00:54.964
cm5a1comt007f8e3xt1vlja3e	Advanced Corporate International	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.966	2024-12-29 20:00:54.966
cm5a1comu007k8e3xbknrkvob	Premier Government International	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.967	2024-12-29 20:00:54.967
cm5a1comv007o8e3xkkuki9eh	Elite Non-Profit International	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.968	2024-12-29 20:00:54.968
cm5a1comw007t8e3x3qcrvmk1	Strategic Bank International	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.969	2024-12-29 20:00:54.969
cm5a1comy007x8e3xzmcgr4wo	Dynamic Insurance International	cm5a1cohz00018e3xaeoasaqb	INACTIVE	2024-12-29 20:00:54.97	2024-12-29 20:00:54.97
cm5a1comz00818e3xj02fddjo	Innovative Investment International	cm5a1coi000028e3x73jztc5m	PENDING	2024-12-29 20:00:54.971	2024-12-29 20:00:54.971
cm5a1cond00868e3xik8z7viu	Pacific Corporate International	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:54.985	2024-12-29 20:00:54.985
cm5a1conf008b8e3x9opjnda7	Atlantic Government International	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.987	2024-12-29 20:00:54.987
cm5a1conh008g8e3xmsbxxgxi	United Non-Profit International	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:54.989	2024-12-29 20:00:54.989
cm5a1coni008l8e3xc1afx7uc	Global Bank Ventures	cm5a1cohs00008e3x2ippl4yg	INACTIVE	2024-12-29 20:00:54.991	2024-12-29 20:00:54.991
cm5a1conk008q8e3xt2r5a0f0	Advanced Insurance Ventures	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:54.993	2024-12-29 20:00:54.993
cm5a1conm008v8e3xv44w454h	Premier Investment Ventures	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:54.994	2024-12-29 20:00:54.994
cm5a1conn00908e3xs3nj9p0l	Elite Corporate Ventures	cm5a1coi100038e3xsurlvuts	PENDING	2024-12-29 20:00:54.995	2024-12-29 20:00:54.995
cm5a1cono00948e3x0dzo260c	Strategic Government Ventures	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:54.996	2024-12-29 20:00:54.996
cm5a1conp00998e3xw6uhu8ym	Dynamic Non-Profit Ventures	cm5a1coi200058e3xyaelj6va	INACTIVE	2024-12-29 20:00:54.998	2024-12-29 20:00:54.998
cm5a1conr009f8e3xok8ckdi0	Innovative Bank Ventures	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:54.999	2024-12-29 20:00:54.999
cm5a1cons009k8e3x4yl5sjs8	Pacific Insurance Ventures	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:55.001	2024-12-29 20:00:55.001
cm5a1conv009p8e3x3n71g5wu	Atlantic Investment Ventures	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:55.003	2024-12-29 20:00:55.003
cm5a1conx009t8e3xv0rkfj8m	United Corporate Ventures	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:55.005	2024-12-29 20:00:55.005
cm5a1conz009z8e3x035q53ka	Global Government Holdings	cm5a1coi200048e3x5mggx6ox	INACTIVE	2024-12-29 20:00:55.007	2024-12-29 20:00:55.007
cm5a1coo200a48e3xlwa2pa9h	Advanced Non-Profit Holdings	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:55.01	2024-12-29 20:00:55.01
cm5a1coo400a98e3xknro5ew3	Premier Bank Holdings	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:55.013	2024-12-29 20:00:55.013
cm5a1coo600ae8e3xio6eenhn	Elite Insurance Holdings	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:55.014	2024-12-29 20:00:55.014
cm5a1coo800ak8e3xd2fx9g2b	Strategic Investment Holdings	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:55.016	2024-12-29 20:00:55.016
cm5a1cooa00ao8e3x4nh7d3o1	Dynamic Corporate Holdings	cm5a1coi100038e3xsurlvuts	INACTIVE	2024-12-29 20:00:55.018	2024-12-29 20:00:55.018
cm5a1coob00as8e3xk7ddj46k	Innovative Government Holdings	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:55.02	2024-12-29 20:00:55.02
cm5a1cood00ax8e3xvhuks3ne	Pacific Non-Profit Holdings	cm5a1coi200058e3xyaelj6va	PENDING	2024-12-29 20:00:55.022	2024-12-29 20:00:55.022
cm5a1cooe00b18e3x9qqda8h9	Atlantic Bank Holdings	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:55.023	2024-12-29 20:00:55.023
cm5a1cooh00b68e3xmwksyh7j	United Insurance Holdings	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:55.026	2024-12-29 20:00:55.026
cm5a1cooj00bb8e3xjot2ktlo	Global Investment Capital	cm5a1coi000028e3x73jztc5m	INACTIVE	2024-12-29 20:00:55.028	2024-12-29 20:00:55.028
cm5a1cool00bg8e3xptx3x4cm	Advanced Corporate Capital	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:55.03	2024-12-29 20:00:55.03
cm5a1coom00bk8e3xv1ufqv7z	Premier Government Capital	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:55.031	2024-12-29 20:00:55.031
cm5a1coop00bq8e3xw0tzyquc	Elite Non-Profit Capital	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:55.033	2024-12-29 20:00:55.033
cm5a1coor00bu8e3xhzkethuw	Strategic Bank Capital	cm5a1cohs00008e3x2ippl4yg	PENDING	2024-12-29 20:00:55.035	2024-12-29 20:00:55.035
cm5a1coot00bz8e3xkhb7y4ur	Dynamic Insurance Capital	cm5a1cohz00018e3xaeoasaqb	INACTIVE	2024-12-29 20:00:55.037	2024-12-29 20:00:55.037
cm5a1coov00c58e3x7zmex4bh	Innovative Investment Capital	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:55.04	2024-12-29 20:00:55.04
cm5a1coox00ca8e3x236axixg	Pacific Corporate Capital	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:55.041	2024-12-29 20:00:55.041
cm5a1cooz00cf8e3x4t2db5q4	Atlantic Government Capital	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:55.043	2024-12-29 20:00:55.043
cm5a1cop000cj8e3xi2e3tvft	United Non-Profit Capital	cm5a1coi200058e3xyaelj6va	ACTIVE	2024-12-29 20:00:55.045	2024-12-29 20:00:55.045
cm5a1cop300cp8e3xzf20d58o	Global Bank Enterprises	cm5a1cohs00008e3x2ippl4yg	INACTIVE	2024-12-29 20:00:55.048	2024-12-29 20:00:55.048
cm5a1cop500cv8e3xr1crhhgz	Advanced Insurance Enterprises	cm5a1cohz00018e3xaeoasaqb	PENDING	2024-12-29 20:00:55.049	2024-12-29 20:00:55.049
cm5a1cop600cz8e3xd10mxw8o	Premier Investment Enterprises	cm5a1coi000028e3x73jztc5m	ACTIVE	2024-12-29 20:00:55.05	2024-12-29 20:00:55.05
cm5a1cop800d58e3x1083wsdw	Elite Corporate Enterprises	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:55.053	2024-12-29 20:00:55.053
cm5a1copb00db8e3xp6j29wgq	Strategic Government Enterprises	cm5a1coi200048e3x5mggx6ox	ACTIVE	2024-12-29 20:00:55.055	2024-12-29 20:00:55.055
cm5a1copd00df8e3x2vkzfr5b	Dynamic Non-Profit Enterprises	cm5a1coi200058e3xyaelj6va	INACTIVE	2024-12-29 20:00:55.057	2024-12-29 20:00:55.057
cm5a1copf00dl8e3xnqqapzt9	Innovative Bank Enterprises	cm5a1cohs00008e3x2ippl4yg	ACTIVE	2024-12-29 20:00:55.06	2024-12-29 20:00:55.06
cm5a1coph00dq8e3xwbclvzyn	Pacific Insurance Enterprises	cm5a1cohz00018e3xaeoasaqb	ACTIVE	2024-12-29 20:00:55.062	2024-12-29 20:00:55.062
cm5a1copk00dv8e3x3belyc8f	Atlantic Investment Enterprises	cm5a1coi000028e3x73jztc5m	PENDING	2024-12-29 20:00:55.064	2024-12-29 20:00:55.064
cm5a1copl00e08e3xes8lfibp	United Corporate Enterprises	cm5a1coi100038e3xsurlvuts	ACTIVE	2024-12-29 20:00:55.066	2024-12-29 20:00:55.066
\.


--
-- Data for Name: CounterpartyAddress; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CounterpartyAddress" (id, "counterpartyId", type, street1, street2, city, state, "postalCode", country, "isPrimary", "createdAt", "updatedAt") FROM stdin;
cm5a1coi600088e3xksdt65d5	cm5a1coi600078e3xih8e3xpm	PHYSICAL	160 Main St	\N	Toronto	\N	21793	Canada	t	2024-12-29 20:00:54.798	2024-12-29 20:00:54.798
cm5a1coii000c8e3xmtmueub7	cm5a1coii000b8e3x95nllfh1	MAILING	483 Main St	\N	Tokyo	TX	39769	Japan	t	2024-12-29 20:00:54.811	2024-12-29 20:00:54.811
cm5a1coij000d8e3x5hn39rgi	cm5a1coii000b8e3x95nllfh1	PHYSICAL	237 Main St	\N	New York	NY	64944	USA	f	2024-12-29 20:00:54.811	2024-12-29 20:00:54.811
cm5a1coim000h8e3xzc6jbf7y	cm5a1coim000g8e3xi50px7kn	LEGAL	150 Main St	\N	Tokyo	TX	41429	Japan	t	2024-12-29 20:00:54.815	2024-12-29 20:00:54.815
cm5a1coip000l8e3x8dg27xcp	cm5a1coip000k8e3xkby178zm	PHYSICAL	38 Main St	\N	Sydney	\N	20568	Australia	t	2024-12-29 20:00:54.817	2024-12-29 20:00:54.817
cm5a1coip000m8e3x9xcznqah	cm5a1coip000k8e3xkby178zm	MAILING	156 Main St	Suite 84	Singapore	FL	13522	Singapore	f	2024-12-29 20:00:54.817	2024-12-29 20:00:54.817
cm5a1cois000r8e3xv4jhj8kf	cm5a1cois000q8e3x368i68ln	MAILING	882 Main St	\N	New York	NY	54700	USA	t	2024-12-29 20:00:54.82	2024-12-29 20:00:54.82
cm5a1coj8000w8e3xbbb5epg4	cm5a1coj8000v8e3xjwbalggl	MAILING	765 Main St	\N	Toronto	\N	36871	Canada	t	2024-12-29 20:00:54.837	2024-12-29 20:00:54.837
cm5a1coj8000x8e3xs59m7qvu	cm5a1coj8000v8e3xjwbalggl	LEGAL	43 Main St	Suite 43	Dubai	\N	30847	UAE	f	2024-12-29 20:00:54.837	2024-12-29 20:00:54.837
cm5a1cojw00128e3xn6zb0df1	cm5a1cojw00118e3x3ffe38ai	LEGAL	770 Main St	\N	Sydney	\N	15759	Australia	t	2024-12-29 20:00:54.86	2024-12-29 20:00:54.86
cm5a1cojw00138e3xf8do5315	cm5a1cojw00118e3x3ffe38ai	PHYSICAL	664 Main St	Suite 95	Singapore	FL	79815	Singapore	f	2024-12-29 20:00:54.86	2024-12-29 20:00:54.86
cm5a1cojz00178e3xwh9d2c9u	cm5a1cojz00168e3x1e429jd8	LEGAL	65 Main St	Suite 8	Singapore	FL	63067	Singapore	t	2024-12-29 20:00:54.863	2024-12-29 20:00:54.863
cm5a1cojz00188e3x54nn9l9s	cm5a1cojz00168e3x1e429jd8	MAILING	753 Main St	\N	Sydney	\N	84885	Australia	f	2024-12-29 20:00:54.863	2024-12-29 20:00:54.863
cm5a1cok1001d8e3x3atxjjgp	cm5a1cok1001c8e3xbs3enakc	LEGAL	131 Main St	\N	Hong Kong	IL	70699	China	t	2024-12-29 20:00:54.865	2024-12-29 20:00:54.865
cm5a1cok1001e8e3xknx4x92i	cm5a1cok1001c8e3xbs3enakc	MAILING	214 Main St	\N	Hong Kong	IL	87116	China	f	2024-12-29 20:00:54.865	2024-12-29 20:00:54.865
cm5a1cok4001j8e3x1vf2ttt2	cm5a1cok4001i8e3xw03kajzm	LEGAL	293 Main St	\N	Tokyo	TX	24272	Japan	t	2024-12-29 20:00:54.868	2024-12-29 20:00:54.868
cm5a1cok4001k8e3xjetq204o	cm5a1cok4001i8e3xw03kajzm	MAILING	515 Main St	\N	Toronto	\N	97189	Canada	f	2024-12-29 20:00:54.868	2024-12-29 20:00:54.868
cm5a1cok6001p8e3xorgqkqug	cm5a1cok6001o8e3x76q1xpwh	PHYSICAL	681 Main St	\N	Toronto	\N	35115	Canada	t	2024-12-29 20:00:54.871	2024-12-29 20:00:54.871
cm5a1cok9001u8e3x1sbnqrz1	cm5a1cok9001t8e3x1y572i7p	PHYSICAL	837 Main St	\N	New York	NY	53515	USA	t	2024-12-29 20:00:54.873	2024-12-29 20:00:54.873
cm5a1cokb001y8e3xqdioktt4	cm5a1cokb001x8e3xcxlk1ji9	LEGAL	993 Main St	Suite 14	London	CA	13417	UK	t	2024-12-29 20:00:54.875	2024-12-29 20:00:54.875
cm5a1cokb001z8e3x8ve4rv5p	cm5a1cokb001x8e3xcxlk1ji9	MAILING	418 Main St	\N	New York	NY	96857	USA	f	2024-12-29 20:00:54.875	2024-12-29 20:00:54.875
cm5a1cokd00238e3x9nuwiv32	cm5a1cokd00228e3xofxkm25t	LEGAL	995 Main St	\N	Dubai	\N	34289	UAE	t	2024-12-29 20:00:54.877	2024-12-29 20:00:54.877
cm5a1cokf00278e3xodetw6m0	cm5a1cokf00268e3xke55ff4w	LEGAL	309 Main St	\N	Toronto	\N	82266	Canada	t	2024-12-29 20:00:54.879	2024-12-29 20:00:54.879
cm5a1cokf00288e3xkuy5qyma	cm5a1cokf00268e3xke55ff4w	LEGAL	182 Main St	Suite 5	Singapore	FL	83784	Singapore	f	2024-12-29 20:00:54.879	2024-12-29 20:00:54.879
cm5a1cokh002d8e3xclcdfm5n	cm5a1cokh002c8e3xss2t35fl	LEGAL	290 Main St	Suite 42	New York	NY	33290	USA	t	2024-12-29 20:00:54.881	2024-12-29 20:00:54.881
cm5a1cokh002e8e3xx3z861d0	cm5a1cokh002c8e3xss2t35fl	MAILING	404 Main St	\N	Hong Kong	IL	43856	China	f	2024-12-29 20:00:54.881	2024-12-29 20:00:54.881
cm5a1coks002i8e3xdqtxazg5	cm5a1coks002h8e3xm8r4fznf	MAILING	880 Main St	Suite 10	Tokyo	TX	33783	Japan	t	2024-12-29 20:00:54.893	2024-12-29 20:00:54.893
cm5a1coks002j8e3xp9nqo6g7	cm5a1coks002h8e3xm8r4fznf	LEGAL	35 Main St	\N	Singapore	FL	60838	Singapore	f	2024-12-29 20:00:54.893	2024-12-29 20:00:54.893
cm5a1cokv002o8e3xqc7zt81f	cm5a1cokv002n8e3x7uappy2g	PHYSICAL	630 Main St	\N	Singapore	FL	38208	Singapore	t	2024-12-29 20:00:54.895	2024-12-29 20:00:54.895
cm5a1cokx002t8e3x1py5b84z	cm5a1cokx002s8e3x3xt2hbo3	LEGAL	507 Main St	\N	London	CA	90773	UK	t	2024-12-29 20:00:54.898	2024-12-29 20:00:54.898
cm5a1cokx002u8e3xpq4qe8io	cm5a1cokx002s8e3x3xt2hbo3	MAILING	963 Main St	\N	Sydney	\N	65811	Australia	f	2024-12-29 20:00:54.898	2024-12-29 20:00:54.898
cm5a1cokz002y8e3xriib0a0x	cm5a1cokz002x8e3xrjqfq19s	LEGAL	337 Main St	\N	New York	NY	13606	USA	t	2024-12-29 20:00:54.899	2024-12-29 20:00:54.899
cm5a1cokz002z8e3xr1la5nqx	cm5a1cokz002x8e3xrjqfq19s	MAILING	326 Main St	\N	Toronto	\N	55819	Canada	f	2024-12-29 20:00:54.899	2024-12-29 20:00:54.899
cm5a1col000338e3xfiy55ng1	cm5a1col000328e3xlyh6slyp	MAILING	312 Main St	\N	Singapore	FL	48848	Singapore	t	2024-12-29 20:00:54.901	2024-12-29 20:00:54.901
cm5a1col200388e3xwscmwr18	cm5a1col200378e3x10ixojr9	MAILING	90 Main St	Suite 12	Toronto	\N	13349	Canada	t	2024-12-29 20:00:54.903	2024-12-29 20:00:54.903
cm5a1col200398e3xa4g7qqye	cm5a1col200378e3x10ixojr9	PHYSICAL	834 Main St	\N	London	CA	25853	UK	f	2024-12-29 20:00:54.903	2024-12-29 20:00:54.903
cm5a1col5003e8e3x5zxa9mdv	cm5a1col5003d8e3xex1z199l	LEGAL	403 Main St	\N	Dubai	\N	16671	UAE	t	2024-12-29 20:00:54.905	2024-12-29 20:00:54.905
cm5a1col7003i8e3xk1pidupf	cm5a1col7003h8e3xh7681e5a	PHYSICAL	353 Main St	Suite 50	London	CA	77687	UK	t	2024-12-29 20:00:54.907	2024-12-29 20:00:54.907
cm5a1col7003j8e3xm9l2tzhl	cm5a1col7003h8e3xh7681e5a	PHYSICAL	845 Main St	\N	Dubai	\N	60408	UAE	f	2024-12-29 20:00:54.907	2024-12-29 20:00:54.907
cm5a1col9003n8e3xoappzmaf	cm5a1col9003m8e3xjrh7l1p1	MAILING	674 Main St	\N	Singapore	FL	14577	Singapore	t	2024-12-29 20:00:54.909	2024-12-29 20:00:54.909
cm5a1colb003r8e3xlfyqwq28	cm5a1colb003q8e3xh8wy8lv8	LEGAL	985 Main St	Suite 23	Hong Kong	IL	60493	China	t	2024-12-29 20:00:54.911	2024-12-29 20:00:54.911
cm5a1colc003v8e3xhvxz9mfm	cm5a1colc003u8e3xbowlp0my	LEGAL	113 Main St	\N	Toronto	\N	68142	Canada	t	2024-12-29 20:00:54.913	2024-12-29 20:00:54.913
cm5a1cole003z8e3xp8sr0u8i	cm5a1cole003y8e3xbx41s1pd	LEGAL	386 Main St	\N	Toronto	\N	26607	Canada	t	2024-12-29 20:00:54.915	2024-12-29 20:00:54.915
cm5a1cole00408e3xfkbcp0mo	cm5a1cole003y8e3xbx41s1pd	PHYSICAL	985 Main St	\N	London	CA	83945	UK	f	2024-12-29 20:00:54.915	2024-12-29 20:00:54.915
cm5a1colg00448e3xwqkn8gpk	cm5a1colg00438e3xjn2f0bls	LEGAL	196 Main St	Suite 10	Dubai	\N	10714	UAE	t	2024-12-29 20:00:54.917	2024-12-29 20:00:54.917
cm5a1coli00498e3xly4gmu6i	cm5a1coli00488e3xc9d7u7k4	MAILING	903 Main St	\N	Dubai	\N	98438	UAE	t	2024-12-29 20:00:54.919	2024-12-29 20:00:54.919
cm5a1coli004a8e3xr3dd134t	cm5a1coli00488e3xc9d7u7k4	LEGAL	903 Main St	Suite 90	Tokyo	TX	58763	Japan	f	2024-12-29 20:00:54.919	2024-12-29 20:00:54.919
cm5a1colk004e8e3xgbug5yud	cm5a1colk004d8e3xmilxbj7i	MAILING	979 Main St	\N	New York	NY	37563	USA	t	2024-12-29 20:00:54.921	2024-12-29 20:00:54.921
cm5a1colk004f8e3xgmmdfvlb	cm5a1colk004d8e3xmilxbj7i	PHYSICAL	17 Main St	\N	London	CA	63192	UK	f	2024-12-29 20:00:54.921	2024-12-29 20:00:54.921
cm5a1coln004k8e3xy2jkwgjy	cm5a1coln004j8e3xpvzfzms5	PHYSICAL	994 Main St	\N	London	CA	84518	UK	t	2024-12-29 20:00:54.924	2024-12-29 20:00:54.924
cm5a1coln004l8e3x9vj21hxx	cm5a1coln004j8e3xpvzfzms5	LEGAL	65 Main St	\N	New York	NY	70677	USA	f	2024-12-29 20:00:54.924	2024-12-29 20:00:54.924
cm5a1colq004q8e3xf4w6amij	cm5a1colq004p8e3xrrb677b1	LEGAL	492 Main St	\N	Tokyo	TX	79466	Japan	t	2024-12-29 20:00:54.926	2024-12-29 20:00:54.926
cm5a1colq004r8e3x6uc8u6f5	cm5a1colq004p8e3xrrb677b1	LEGAL	620 Main St	\N	Sydney	\N	24505	Australia	f	2024-12-29 20:00:54.926	2024-12-29 20:00:54.926
cm5a1cols004w8e3x6dbyr0cu	cm5a1cols004v8e3x6prp0dfg	MAILING	16 Main St	Suite 52	Sydney	\N	43192	Australia	t	2024-12-29 20:00:54.929	2024-12-29 20:00:54.929
cm5a1cols004x8e3xlbwr6kon	cm5a1cols004v8e3x6prp0dfg	PHYSICAL	60 Main St	Suite 55	Singapore	FL	75129	Singapore	f	2024-12-29 20:00:54.929	2024-12-29 20:00:54.929
cm5a1colv00528e3xqftimcyd	cm5a1colv00518e3x0n88ik1x	LEGAL	604 Main St	\N	Singapore	FL	37336	Singapore	t	2024-12-29 20:00:54.931	2024-12-29 20:00:54.931
cm5a1colw00568e3x02mnc6jn	cm5a1colw00558e3xmiwf04ch	PHYSICAL	360 Main St	\N	Sydney	\N	83266	Australia	t	2024-12-29 20:00:54.933	2024-12-29 20:00:54.933
cm5a1colw00578e3xihlnys8k	cm5a1colw00558e3xmiwf04ch	PHYSICAL	899 Main St	Suite 71	New York	NY	23011	USA	f	2024-12-29 20:00:54.933	2024-12-29 20:00:54.933
cm5a1colz005c8e3xx9xzmmki	cm5a1colz005b8e3x12zxdk2h	LEGAL	351 Main St	\N	London	CA	28877	UK	t	2024-12-29 20:00:54.936	2024-12-29 20:00:54.936
cm5a1com3005h8e3x00qr5yrn	cm5a1com3005g8e3xpnf2mai9	LEGAL	57 Main St	\N	Toronto	\N	50908	Canada	t	2024-12-29 20:00:54.94	2024-12-29 20:00:54.94
cm5a1com3005i8e3xxz8utam5	cm5a1com3005g8e3xpnf2mai9	MAILING	948 Main St	Suite 48	Singapore	FL	79339	Singapore	f	2024-12-29 20:00:54.94	2024-12-29 20:00:54.94
cm5a1com6005n8e3xstx2pvgl	cm5a1com6005m8e3xg05nbnew	LEGAL	368 Main St	Suite 70	Dubai	\N	67733	UAE	t	2024-12-29 20:00:54.943	2024-12-29 20:00:54.943
cm5a1com8005r8e3xpgex75o7	cm5a1com8005q8e3xco3tgqoc	LEGAL	932 Main St	Suite 59	Tokyo	TX	54706	Japan	t	2024-12-29 20:00:54.944	2024-12-29 20:00:54.944
cm5a1com8005s8e3xa8zgatdw	cm5a1com8005q8e3xco3tgqoc	MAILING	855 Main St	\N	Toronto	\N	28712	Canada	f	2024-12-29 20:00:54.944	2024-12-29 20:00:54.944
cm5a1comb005x8e3xo2ofd6y9	cm5a1comb005w8e3xobez1to6	PHYSICAL	369 Main St	Suite 1	London	CA	63788	UK	t	2024-12-29 20:00:54.948	2024-12-29 20:00:54.948
cm5a1comd00628e3x3g0y9u9p	cm5a1comd00618e3xh65p3wos	LEGAL	520 Main St	\N	Sydney	\N	19372	Australia	t	2024-12-29 20:00:54.949	2024-12-29 20:00:54.949
cm5a1comd00638e3xtykn51gx	cm5a1comd00618e3xh65p3wos	MAILING	612 Main St	\N	Toronto	\N	62349	Canada	f	2024-12-29 20:00:54.949	2024-12-29 20:00:54.949
cm5a1comf00678e3x04v9kq3c	cm5a1comf00668e3xrly07g10	LEGAL	332 Main St	\N	Dubai	\N	90900	UAE	t	2024-12-29 20:00:54.952	2024-12-29 20:00:54.952
cm5a1comf00688e3xe1euhfk7	cm5a1comf00668e3xrly07g10	MAILING	340 Main St	\N	Hong Kong	IL	41249	China	f	2024-12-29 20:00:54.952	2024-12-29 20:00:54.952
cm5a1comh006c8e3xyz20vsuh	cm5a1comh006b8e3xqr8zzxte	MAILING	49 Main St	\N	Singapore	FL	47908	Singapore	t	2024-12-29 20:00:54.953	2024-12-29 20:00:54.953
cm5a1comh006d8e3xevaurayt	cm5a1comh006b8e3xqr8zzxte	PHYSICAL	525 Main St	Suite 80	London	CA	89013	UK	f	2024-12-29 20:00:54.953	2024-12-29 20:00:54.953
cm5a1comi006h8e3xan5lefr2	cm5a1comi006g8e3xrgtlygwi	LEGAL	327 Main St	\N	Hong Kong	IL	89171	China	t	2024-12-29 20:00:54.955	2024-12-29 20:00:54.955
cm5a1comi006i8e3xyy7srllq	cm5a1comi006g8e3xrgtlygwi	LEGAL	139 Main St	\N	Sydney	\N	71903	Australia	f	2024-12-29 20:00:54.955	2024-12-29 20:00:54.955
cm5a1comk006n8e3xl4r7tt6x	cm5a1comk006m8e3xnq4mylgg	PHYSICAL	470 Main St	\N	Singapore	FL	95054	Singapore	t	2024-12-29 20:00:54.957	2024-12-29 20:00:54.957
cm5a1comk006o8e3xggjf60hg	cm5a1comk006m8e3xnq4mylgg	LEGAL	260 Main St	\N	London	CA	46149	UK	f	2024-12-29 20:00:54.957	2024-12-29 20:00:54.957
cm5a1comn006s8e3x2dptt4s4	cm5a1comn006r8e3xl2fyt24a	MAILING	607 Main St	\N	Toronto	\N	33219	Canada	t	2024-12-29 20:00:54.959	2024-12-29 20:00:54.959
cm5a1como006w8e3xup2m8uxa	cm5a1como006v8e3x5yaxi1in	LEGAL	162 Main St	\N	Singapore	FL	27228	Singapore	t	2024-12-29 20:00:54.96	2024-12-29 20:00:54.96
cm5a1comp00718e3x28wfxvlb	cm5a1comp00708e3xaxq8lvim	PHYSICAL	974 Main St	\N	Hong Kong	IL	97599	China	t	2024-12-29 20:00:54.961	2024-12-29 20:00:54.961
cm5a1comq00758e3xr66a9hyf	cm5a1comq00748e3xronlszs4	PHYSICAL	11 Main St	\N	Toronto	\N	99195	Canada	t	2024-12-29 20:00:54.962	2024-12-29 20:00:54.962
cm5a1comq00768e3xe62ai83q	cm5a1comq00748e3xronlszs4	PHYSICAL	86 Main St	Suite 47	Singapore	FL	57990	Singapore	f	2024-12-29 20:00:54.962	2024-12-29 20:00:54.962
cm5a1coms007b8e3xxrt4i1kx	cm5a1coms007a8e3x9njfkm9a	PHYSICAL	331 Main St	\N	New York	NY	31419	USA	t	2024-12-29 20:00:54.964	2024-12-29 20:00:54.964
cm5a1comt007g8e3x4mzl4ar6	cm5a1comt007f8e3xt1vlja3e	LEGAL	16 Main St	\N	Hong Kong	IL	47498	China	t	2024-12-29 20:00:54.966	2024-12-29 20:00:54.966
cm5a1comt007h8e3xd757pdoh	cm5a1comt007f8e3xt1vlja3e	LEGAL	692 Main St	Suite 87	New York	NY	94822	USA	f	2024-12-29 20:00:54.966	2024-12-29 20:00:54.966
cm5a1comu007l8e3xx6twqtm9	cm5a1comu007k8e3xbknrkvob	LEGAL	466 Main St	\N	New York	NY	11803	USA	t	2024-12-29 20:00:54.967	2024-12-29 20:00:54.967
cm5a1comv007p8e3x69tmzi3n	cm5a1comv007o8e3xkkuki9eh	PHYSICAL	401 Main St	Suite 76	Singapore	FL	90200	Singapore	t	2024-12-29 20:00:54.968	2024-12-29 20:00:54.968
cm5a1comv007q8e3xfksk3bcw	cm5a1comv007o8e3xkkuki9eh	MAILING	680 Main St	Suite 27	New York	NY	30807	USA	f	2024-12-29 20:00:54.968	2024-12-29 20:00:54.968
cm5a1comw007u8e3xkgmg3rva	cm5a1comw007t8e3x3qcrvmk1	LEGAL	975 Main St	Suite 80	Singapore	FL	27816	Singapore	t	2024-12-29 20:00:54.969	2024-12-29 20:00:54.969
cm5a1comy007y8e3x114yit1a	cm5a1comy007x8e3xzmcgr4wo	PHYSICAL	27 Main St	Suite 18	Singapore	FL	83711	Singapore	t	2024-12-29 20:00:54.97	2024-12-29 20:00:54.97
cm5a1comz00828e3xzp5bswd9	cm5a1comz00818e3xj02fddjo	LEGAL	878 Main St	\N	Dubai	\N	47739	UAE	t	2024-12-29 20:00:54.971	2024-12-29 20:00:54.971
cm5a1cond00878e3x8hk2k5x0	cm5a1cond00868e3xik8z7viu	PHYSICAL	348 Main St	Suite 94	Singapore	FL	28116	Singapore	t	2024-12-29 20:00:54.985	2024-12-29 20:00:54.985
cm5a1cond00888e3xw1oahi23	cm5a1cond00868e3xik8z7viu	MAILING	938 Main St	Suite 44	Hong Kong	IL	44707	China	f	2024-12-29 20:00:54.985	2024-12-29 20:00:54.985
cm5a1conf008c8e3xbzr8bmfd	cm5a1conf008b8e3x9opjnda7	PHYSICAL	516 Main St	Suite 89	Singapore	FL	87799	Singapore	t	2024-12-29 20:00:54.987	2024-12-29 20:00:54.987
cm5a1conh008h8e3x6frlzjbx	cm5a1conh008g8e3xmsbxxgxi	PHYSICAL	364 Main St	\N	Dubai	\N	85077	UAE	t	2024-12-29 20:00:54.989	2024-12-29 20:00:54.989
cm5a1coni008m8e3xyoquhtnz	cm5a1coni008l8e3xc1afx7uc	MAILING	90 Main St	Suite 73	Sydney	\N	14649	Australia	t	2024-12-29 20:00:54.991	2024-12-29 20:00:54.991
cm5a1coni008n8e3x0lnf4hb1	cm5a1coni008l8e3xc1afx7uc	LEGAL	828 Main St	\N	Hong Kong	IL	70251	China	f	2024-12-29 20:00:54.991	2024-12-29 20:00:54.991
cm5a1conk008r8e3x34aksa38	cm5a1conk008q8e3xt2r5a0f0	MAILING	92 Main St	Suite 20	Toronto	\N	26024	Canada	t	2024-12-29 20:00:54.993	2024-12-29 20:00:54.993
cm5a1conk008s8e3xc6ru0kq2	cm5a1conk008q8e3xt2r5a0f0	PHYSICAL	864 Main St	\N	Singapore	FL	18408	Singapore	f	2024-12-29 20:00:54.993	2024-12-29 20:00:54.993
cm5a1conm008w8e3xjwte1yzm	cm5a1conm008v8e3xv44w454h	PHYSICAL	376 Main St	\N	London	CA	32073	UK	t	2024-12-29 20:00:54.994	2024-12-29 20:00:54.994
cm5a1conm008x8e3xhxv8fx7t	cm5a1conm008v8e3xv44w454h	PHYSICAL	326 Main St	\N	Dubai	\N	12192	UAE	f	2024-12-29 20:00:54.994	2024-12-29 20:00:54.994
cm5a1conn00918e3xxu699mp6	cm5a1conn00908e3xs3nj9p0l	MAILING	158 Main St	\N	London	CA	72547	UK	t	2024-12-29 20:00:54.995	2024-12-29 20:00:54.995
cm5a1cono00958e3xwcrwpfg8	cm5a1cono00948e3x0dzo260c	PHYSICAL	235 Main St	\N	Singapore	FL	80279	Singapore	t	2024-12-29 20:00:54.996	2024-12-29 20:00:54.996
cm5a1conp009a8e3xts088d7l	cm5a1conp00998e3xw6uhu8ym	PHYSICAL	613 Main St	\N	Sydney	\N	40377	Australia	t	2024-12-29 20:00:54.998	2024-12-29 20:00:54.998
cm5a1conp009b8e3xjxwgcztc	cm5a1conp00998e3xw6uhu8ym	MAILING	600 Main St	\N	Singapore	FL	10693	Singapore	f	2024-12-29 20:00:54.998	2024-12-29 20:00:54.998
cm5a1conr009g8e3x98fktriw	cm5a1conr009f8e3xok8ckdi0	PHYSICAL	867 Main St	\N	Tokyo	TX	62941	Japan	t	2024-12-29 20:00:54.999	2024-12-29 20:00:54.999
cm5a1conr009h8e3xozzscq4u	cm5a1conr009f8e3xok8ckdi0	MAILING	634 Main St	Suite 39	Singapore	FL	36763	Singapore	f	2024-12-29 20:00:54.999	2024-12-29 20:00:54.999
cm5a1cons009l8e3xxqywocn8	cm5a1cons009k8e3x4yl5sjs8	LEGAL	208 Main St	\N	Singapore	FL	67459	Singapore	t	2024-12-29 20:00:55.001	2024-12-29 20:00:55.001
cm5a1cons009m8e3x0as6b851	cm5a1cons009k8e3x4yl5sjs8	MAILING	158 Main St	\N	Sydney	\N	40953	Australia	f	2024-12-29 20:00:55.001	2024-12-29 20:00:55.001
cm5a1conv009q8e3xaz64lhds	cm5a1conv009p8e3x3n71g5wu	MAILING	354 Main St	\N	Singapore	FL	82039	Singapore	t	2024-12-29 20:00:55.003	2024-12-29 20:00:55.003
cm5a1conx009u8e3xtwcwwvbr	cm5a1conx009t8e3xv0rkfj8m	LEGAL	381 Main St	\N	Singapore	FL	56540	Singapore	t	2024-12-29 20:00:55.005	2024-12-29 20:00:55.005
cm5a1conx009v8e3x5dldhsio	cm5a1conx009t8e3xv0rkfj8m	PHYSICAL	932 Main St	\N	Dubai	\N	34289	UAE	f	2024-12-29 20:00:55.005	2024-12-29 20:00:55.005
cm5a1conz00a08e3xdb4r5xcm	cm5a1conz009z8e3x035q53ka	PHYSICAL	315 Main St	\N	Tokyo	TX	62603	Japan	t	2024-12-29 20:00:55.007	2024-12-29 20:00:55.007
cm5a1conz00a18e3xoi30j3rm	cm5a1conz009z8e3x035q53ka	PHYSICAL	160 Main St	\N	Sydney	\N	36680	Australia	f	2024-12-29 20:00:55.007	2024-12-29 20:00:55.007
cm5a1coo200a58e3x68uympq9	cm5a1coo200a48e3xlwa2pa9h	LEGAL	917 Main St	Suite 72	Sydney	\N	63827	Australia	t	2024-12-29 20:00:55.01	2024-12-29 20:00:55.01
cm5a1coo400aa8e3xgvlvo1u5	cm5a1coo400a98e3xknro5ew3	LEGAL	226 Main St	\N	New York	NY	69271	USA	t	2024-12-29 20:00:55.013	2024-12-29 20:00:55.013
cm5a1coo600af8e3xh8ofseab	cm5a1coo600ae8e3xio6eenhn	MAILING	596 Main St	\N	Singapore	FL	32078	Singapore	t	2024-12-29 20:00:55.014	2024-12-29 20:00:55.014
cm5a1coo600ag8e3xplj9r9nl	cm5a1coo600ae8e3xio6eenhn	PHYSICAL	15 Main St	\N	London	CA	41524	UK	f	2024-12-29 20:00:55.014	2024-12-29 20:00:55.014
cm5a1coo800al8e3xvbb246lq	cm5a1coo800ak8e3xd2fx9g2b	MAILING	166 Main St	\N	Singapore	FL	94004	Singapore	t	2024-12-29 20:00:55.016	2024-12-29 20:00:55.016
cm5a1cooa00ap8e3xg123z920	cm5a1cooa00ao8e3x4nh7d3o1	MAILING	778 Main St	\N	Tokyo	TX	93302	Japan	t	2024-12-29 20:00:55.018	2024-12-29 20:00:55.018
cm5a1coob00at8e3xd1lm1vqw	cm5a1coob00as8e3xk7ddj46k	PHYSICAL	535 Main St	\N	Hong Kong	IL	46370	China	t	2024-12-29 20:00:55.02	2024-12-29 20:00:55.02
cm5a1cood00ay8e3x9ppszikt	cm5a1cood00ax8e3xvhuks3ne	MAILING	359 Main St	\N	Tokyo	TX	32132	Japan	t	2024-12-29 20:00:55.022	2024-12-29 20:00:55.022
cm5a1cooe00b28e3xgn9jnmt1	cm5a1cooe00b18e3x9qqda8h9	PHYSICAL	253 Main St	\N	New York	NY	33172	USA	t	2024-12-29 20:00:55.023	2024-12-29 20:00:55.023
cm5a1cooe00b38e3xp2kqgbu9	cm5a1cooe00b18e3x9qqda8h9	PHYSICAL	371 Main St	\N	Hong Kong	IL	95672	China	f	2024-12-29 20:00:55.023	2024-12-29 20:00:55.023
cm5a1cooh00b78e3xrv5iykn1	cm5a1cooh00b68e3xmwksyh7j	LEGAL	694 Main St	Suite 92	Sydney	\N	21292	Australia	t	2024-12-29 20:00:55.026	2024-12-29 20:00:55.026
cm5a1cooh00b88e3x6jalhs5v	cm5a1cooh00b68e3xmwksyh7j	MAILING	811 Main St	Suite 91	Toronto	\N	57885	Canada	f	2024-12-29 20:00:55.026	2024-12-29 20:00:55.026
cm5a1cooj00bc8e3xb2qxz1y5	cm5a1cooj00bb8e3xjot2ktlo	LEGAL	611 Main St	\N	Dubai	\N	60719	UAE	t	2024-12-29 20:00:55.028	2024-12-29 20:00:55.028
cm5a1cooj00bd8e3xpo6o38eb	cm5a1cooj00bb8e3xjot2ktlo	MAILING	679 Main St	Suite 75	London	CA	19945	UK	f	2024-12-29 20:00:55.028	2024-12-29 20:00:55.028
cm5a1cool00bh8e3xvyp97uei	cm5a1cool00bg8e3xptx3x4cm	PHYSICAL	750 Main St	\N	Toronto	\N	74876	Canada	t	2024-12-29 20:00:55.03	2024-12-29 20:00:55.03
cm5a1coom00bl8e3xtifeqxno	cm5a1coom00bk8e3xv1ufqv7z	PHYSICAL	307 Main St	\N	Dubai	\N	68469	UAE	t	2024-12-29 20:00:55.031	2024-12-29 20:00:55.031
cm5a1coom00bm8e3xn2ghfsjz	cm5a1coom00bk8e3xv1ufqv7z	PHYSICAL	118 Main St	\N	Sydney	\N	89006	Australia	f	2024-12-29 20:00:55.031	2024-12-29 20:00:55.031
cm5a1coop00br8e3x5xb2ybzx	cm5a1coop00bq8e3xw0tzyquc	MAILING	518 Main St	\N	London	CA	10068	UK	t	2024-12-29 20:00:55.033	2024-12-29 20:00:55.033
cm5a1coor00bv8e3xupu5vyl5	cm5a1coor00bu8e3xhzkethuw	MAILING	838 Main St	\N	London	CA	16767	UK	t	2024-12-29 20:00:55.035	2024-12-29 20:00:55.035
cm5a1coot00c08e3x0krqzlqe	cm5a1coot00bz8e3xkhb7y4ur	PHYSICAL	957 Main St	Suite 4	Hong Kong	IL	78572	China	t	2024-12-29 20:00:55.037	2024-12-29 20:00:55.037
cm5a1coot00c18e3xmqkwm1yk	cm5a1coot00bz8e3xkhb7y4ur	MAILING	532 Main St	\N	Tokyo	TX	74867	Japan	f	2024-12-29 20:00:55.037	2024-12-29 20:00:55.037
cm5a1coov00c68e3x9drwkepf	cm5a1coov00c58e3x7zmex4bh	MAILING	867 Main St	\N	Tokyo	TX	85823	Japan	t	2024-12-29 20:00:55.04	2024-12-29 20:00:55.04
cm5a1coov00c78e3xhh6yzums	cm5a1coov00c58e3x7zmex4bh	MAILING	117 Main St	\N	Dubai	\N	81464	UAE	f	2024-12-29 20:00:55.04	2024-12-29 20:00:55.04
cm5a1coox00cb8e3x5m7sejuz	cm5a1coox00ca8e3x236axixg	MAILING	247 Main St	\N	Toronto	\N	73942	Canada	t	2024-12-29 20:00:55.041	2024-12-29 20:00:55.041
cm5a1cooz00cg8e3xo2jh3v1x	cm5a1cooz00cf8e3x4t2db5q4	LEGAL	578 Main St	\N	Tokyo	TX	55968	Japan	t	2024-12-29 20:00:55.043	2024-12-29 20:00:55.043
cm5a1cop000ck8e3xu8oanwgx	cm5a1cop000cj8e3xi2e3tvft	MAILING	994 Main St	Suite 82	Singapore	FL	21359	Singapore	t	2024-12-29 20:00:55.045	2024-12-29 20:00:55.045
cm5a1cop000cl8e3xnuw9erit	cm5a1cop000cj8e3xi2e3tvft	PHYSICAL	744 Main St	\N	Hong Kong	IL	48415	China	f	2024-12-29 20:00:55.045	2024-12-29 20:00:55.045
cm5a1cop300cq8e3xzqyjch9o	cm5a1cop300cp8e3xzf20d58o	MAILING	497 Main St	\N	Tokyo	TX	93645	Japan	t	2024-12-29 20:00:55.048	2024-12-29 20:00:55.048
cm5a1cop300cr8e3xckbsja4w	cm5a1cop300cp8e3xzf20d58o	LEGAL	167 Main St	Suite 88	Hong Kong	IL	77961	China	f	2024-12-29 20:00:55.048	2024-12-29 20:00:55.048
cm5a1cop500cw8e3xu5oc9aey	cm5a1cop500cv8e3xr1crhhgz	PHYSICAL	664 Main St	\N	New York	NY	30789	USA	t	2024-12-29 20:00:55.049	2024-12-29 20:00:55.049
cm5a1cop600d08e3xwg4qo47x	cm5a1cop600cz8e3xd10mxw8o	PHYSICAL	106 Main St	\N	Tokyo	TX	97021	Japan	t	2024-12-29 20:00:55.05	2024-12-29 20:00:55.05
cm5a1cop600d18e3x0bysi8b6	cm5a1cop600cz8e3xd10mxw8o	PHYSICAL	849 Main St	\N	Tokyo	TX	11852	Japan	f	2024-12-29 20:00:55.05	2024-12-29 20:00:55.05
cm5a1cop800d68e3x2ksomkk2	cm5a1cop800d58e3x1083wsdw	MAILING	883 Main St	\N	Singapore	FL	78103	Singapore	t	2024-12-29 20:00:55.053	2024-12-29 20:00:55.053
cm5a1cop800d78e3xpacci92g	cm5a1cop800d58e3x1083wsdw	PHYSICAL	206 Main St	Suite 10	Dubai	\N	98806	UAE	f	2024-12-29 20:00:55.053	2024-12-29 20:00:55.053
cm5a1copb00dc8e3xh43v2rp4	cm5a1copb00db8e3xp6j29wgq	LEGAL	591 Main St	\N	New York	NY	99623	USA	t	2024-12-29 20:00:55.055	2024-12-29 20:00:55.055
cm5a1copd00dg8e3xz4tpzgvt	cm5a1copd00df8e3x2vkzfr5b	PHYSICAL	698 Main St	Suite 56	Toronto	\N	93066	Canada	t	2024-12-29 20:00:55.057	2024-12-29 20:00:55.057
cm5a1copd00dh8e3x4lmg20wv	cm5a1copd00df8e3x2vkzfr5b	MAILING	835 Main St	\N	Hong Kong	IL	59250	China	f	2024-12-29 20:00:55.057	2024-12-29 20:00:55.057
cm5a1copf00dm8e3x0bdzyeq5	cm5a1copf00dl8e3xnqqapzt9	PHYSICAL	673 Main St	\N	London	CA	24117	UK	t	2024-12-29 20:00:55.06	2024-12-29 20:00:55.06
cm5a1copf00dn8e3xxk2q5i8p	cm5a1copf00dl8e3xnqqapzt9	PHYSICAL	574 Main St	\N	New York	NY	19629	USA	f	2024-12-29 20:00:55.06	2024-12-29 20:00:55.06
cm5a1coph00dr8e3x01lmjdhd	cm5a1coph00dq8e3xwbclvzyn	LEGAL	711 Main St	\N	Singapore	FL	11226	Singapore	t	2024-12-29 20:00:55.062	2024-12-29 20:00:55.062
cm5a1copi00ds8e3xoigmylmr	cm5a1coph00dq8e3xwbclvzyn	LEGAL	185 Main St	Suite 71	Dubai	\N	37279	UAE	f	2024-12-29 20:00:55.062	2024-12-29 20:00:55.062
cm5a1copk00dw8e3xmi14mpp0	cm5a1copk00dv8e3x3belyc8f	LEGAL	933 Main St	\N	New York	NY	79247	USA	t	2024-12-29 20:00:55.064	2024-12-29 20:00:55.064
cm5a1copk00dx8e3x5acof2x3	cm5a1copk00dv8e3x3belyc8f	PHYSICAL	286 Main St	\N	London	CA	44467	UK	f	2024-12-29 20:00:55.064	2024-12-29 20:00:55.064
cm5a1copl00e18e3xkta2f9lz	cm5a1copl00e08e3xes8lfibp	LEGAL	96 Main St	\N	Sydney	\N	13968	Australia	t	2024-12-29 20:00:55.066	2024-12-29 20:00:55.066
\.


--
-- Data for Name: CounterpartyContact; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CounterpartyContact" (id, "counterpartyId", type, "firstName", "lastName", title, email, phone, "isPrimary", "createdAt", "updatedAt") FROM stdin;
cm5a1coi600098e3xhcevdpb8	cm5a1coi600078e3xih8e3xpm	LEGAL	Emily	Smith	Manager	contact98@example.com	+1-555-0195	t	2024-12-29 20:00:54.798	2024-12-29 20:00:54.798
cm5a1coij000e8e3xid8ffm5q	cm5a1coii000b8e3x95nllfh1	LEGAL	Jane	Williams	\N	\N	+1-555-7910	t	2024-12-29 20:00:54.811	2024-12-29 20:00:54.811
cm5a1coin000i8e3xc1t030g7	cm5a1coim000g8e3xi50px7kn	TECHNICAL	Jane	Brown	Director	contact50@example.com	+1-555-2914	t	2024-12-29 20:00:54.815	2024-12-29 20:00:54.815
cm5a1coip000n8e3x8v1azjkx	cm5a1coip000k8e3xkby178zm	PRIMARY	James	Smith	\N	contact54@example.com	\N	t	2024-12-29 20:00:54.817	2024-12-29 20:00:54.817
cm5a1coip000o8e3xkp42fgrs	cm5a1coip000k8e3xkby178zm	BILLING	James	Johnson	Director	\N	\N	f	2024-12-29 20:00:54.817	2024-12-29 20:00:54.817
cm5a1cois000s8e3xtlxvoxx7	cm5a1cois000q8e3x368i68ln	BILLING	Emma	Smith	\N	contact8@example.com	+1-555-6498	t	2024-12-29 20:00:54.82	2024-12-29 20:00:54.82
cm5a1cois000t8e3xkg9padmj	cm5a1cois000q8e3x368i68ln	BILLING	Michael	Garcia	\N	contact37@example.com	+1-555-2617	f	2024-12-29 20:00:54.82	2024-12-29 20:00:54.82
cm5a1coj8000y8e3xyz84vkd8	cm5a1coj8000v8e3xjwbalggl	TECHNICAL	James	Brown	Director	contact60@example.com	+1-555-9952	t	2024-12-29 20:00:54.837	2024-12-29 20:00:54.837
cm5a1coj8000z8e3xbcnro4z9	cm5a1coj8000v8e3xjwbalggl	PRIMARY	David	Davis	Manager	contact12@example.com	+1-555-7140	f	2024-12-29 20:00:54.837	2024-12-29 20:00:54.837
cm5a1cojw00148e3xhjg1f0gc	cm5a1cojw00118e3x3ffe38ai	TECHNICAL	Michael	Brown	CTO	contact38@example.com	+1-555-2124	t	2024-12-29 20:00:54.86	2024-12-29 20:00:54.86
cm5a1cojz00198e3xftwrwfnz	cm5a1cojz00168e3x1e429jd8	BILLING	Jane	Miller	Manager	contact81@example.com	+1-555-7607	t	2024-12-29 20:00:54.863	2024-12-29 20:00:54.863
cm5a1cojz001a8e3xgdpffoqo	cm5a1cojz00168e3x1e429jd8	TECHNICAL	Michael	Garcia	CEO	contact6@example.com	\N	f	2024-12-29 20:00:54.863	2024-12-29 20:00:54.863
cm5a1cok1001f8e3xuxcl51kl	cm5a1cok1001c8e3xbs3enakc	TECHNICAL	David	Brown	CFO	contact11@example.com	\N	t	2024-12-29 20:00:54.865	2024-12-29 20:00:54.865
cm5a1cok1001g8e3xa3t1icvg	cm5a1cok1001c8e3xbs3enakc	TECHNICAL	David	Brown	\N	contact15@example.com	+1-555-2327	f	2024-12-29 20:00:54.865	2024-12-29 20:00:54.865
cm5a1cok4001l8e3xfy5ag76v	cm5a1cok4001i8e3xw03kajzm	LEGAL	Michael	Smith	Director	\N	\N	t	2024-12-29 20:00:54.868	2024-12-29 20:00:54.868
cm5a1cok4001m8e3xoql6puiq	cm5a1cok4001i8e3xw03kajzm	PRIMARY	Emma	Miller	CFO	contact38@example.com	+1-555-1910	f	2024-12-29 20:00:54.868	2024-12-29 20:00:54.868
cm5a1cok6001q8e3xz1f98aad	cm5a1cok6001o8e3x76q1xpwh	BILLING	Michael	Davis	CFO	contact48@example.com	+1-555-1442	t	2024-12-29 20:00:54.871	2024-12-29 20:00:54.871
cm5a1cok6001r8e3xn9qyxmw6	cm5a1cok6001o8e3x76q1xpwh	BILLING	Sarah	Williams	CFO	contact28@example.com	+1-555-7044	f	2024-12-29 20:00:54.871	2024-12-29 20:00:54.871
cm5a1cok9001v8e3x35jedfzg	cm5a1cok9001t8e3x1y572i7p	BILLING	Sarah	Johnson	\N	\N	+1-555-9133	t	2024-12-29 20:00:54.873	2024-12-29 20:00:54.873
cm5a1cokb00208e3xgbxa8u0t	cm5a1cokb001x8e3xcxlk1ji9	BILLING	Emma	Miller	CTO	contact63@example.com	+1-555-8029	t	2024-12-29 20:00:54.875	2024-12-29 20:00:54.875
cm5a1cokd00248e3x35vttwqd	cm5a1cokd00228e3xofxkm25t	PRIMARY	Jane	Miller	CTO	\N	\N	t	2024-12-29 20:00:54.877	2024-12-29 20:00:54.877
cm5a1cokf00298e3xcqmlcscv	cm5a1cokf00268e3xke55ff4w	LEGAL	John	Garcia	CEO	contact89@example.com	+1-555-2984	t	2024-12-29 20:00:54.879	2024-12-29 20:00:54.879
cm5a1cokf002a8e3xro64kcla	cm5a1cokf00268e3xke55ff4w	BILLING	Emily	Williams	\N	contact69@example.com	+1-555-5173	f	2024-12-29 20:00:54.879	2024-12-29 20:00:54.879
cm5a1cokh002f8e3xp3tch21x	cm5a1cokh002c8e3xss2t35fl	BILLING	Sarah	Davis	CEO	\N	+1-555-3225	t	2024-12-29 20:00:54.881	2024-12-29 20:00:54.881
cm5a1coks002k8e3xps2jj5ks	cm5a1coks002h8e3xm8r4fznf	LEGAL	Emily	Davis	CEO	contact70@example.com	+1-555-2868	t	2024-12-29 20:00:54.893	2024-12-29 20:00:54.893
cm5a1coks002l8e3x5lbcxaoc	cm5a1coks002h8e3xm8r4fznf	PRIMARY	James	Johnson	Director	\N	+1-555-1472	f	2024-12-29 20:00:54.893	2024-12-29 20:00:54.893
cm5a1cokv002p8e3xjcn6wrn0	cm5a1cokv002n8e3x7uappy2g	BILLING	Emma	Garcia	\N	\N	+1-555-8016	t	2024-12-29 20:00:54.895	2024-12-29 20:00:54.895
cm5a1cokv002q8e3xwvzgnw4h	cm5a1cokv002n8e3x7uappy2g	BILLING	Emma	Miller	\N	\N	\N	f	2024-12-29 20:00:54.895	2024-12-29 20:00:54.895
cm5a1cokx002v8e3x0brwk5h5	cm5a1cokx002s8e3x3xt2hbo3	LEGAL	Michael	Johnson	CTO	\N	+1-555-0603	t	2024-12-29 20:00:54.898	2024-12-29 20:00:54.898
cm5a1cokz00308e3xq1lgpj5i	cm5a1cokz002x8e3xrjqfq19s	PRIMARY	Jane	Williams	CFO	contact87@example.com	+1-555-3768	t	2024-12-29 20:00:54.899	2024-12-29 20:00:54.899
cm5a1col000348e3xbyrnj013	cm5a1col000328e3xlyh6slyp	BILLING	David	Johnson	Manager	contact71@example.com	+1-555-0020	t	2024-12-29 20:00:54.901	2024-12-29 20:00:54.901
cm5a1col000358e3x0z442ic4	cm5a1col000328e3xlyh6slyp	PRIMARY	John	Smith	CEO	contact29@example.com	\N	f	2024-12-29 20:00:54.901	2024-12-29 20:00:54.901
cm5a1col2003a8e3x8n1masiq	cm5a1col200378e3x10ixojr9	BILLING	David	Davis	\N	contact18@example.com	+1-555-5218	t	2024-12-29 20:00:54.903	2024-12-29 20:00:54.903
cm5a1col2003b8e3x41uo2jrh	cm5a1col200378e3x10ixojr9	TECHNICAL	Michael	Jones	CTO	contact77@example.com	+1-555-2726	f	2024-12-29 20:00:54.903	2024-12-29 20:00:54.903
cm5a1col5003f8e3x4sd7pscd	cm5a1col5003d8e3xex1z199l	BILLING	Sarah	Davis	CTO	contact21@example.com	\N	t	2024-12-29 20:00:54.905	2024-12-29 20:00:54.905
cm5a1col7003k8e3x1kqrmls2	cm5a1col7003h8e3xh7681e5a	BILLING	Sarah	Brown	Director	\N	+1-555-5961	t	2024-12-29 20:00:54.907	2024-12-29 20:00:54.907
cm5a1col9003o8e3xrr2ao67x	cm5a1col9003m8e3xjrh7l1p1	LEGAL	John	Johnson	CEO	\N	+1-555-0968	t	2024-12-29 20:00:54.909	2024-12-29 20:00:54.909
cm5a1colb003s8e3xhpory56o	cm5a1colb003q8e3xh8wy8lv8	PRIMARY	Jane	Garcia	CTO	contact77@example.com	+1-555-1065	t	2024-12-29 20:00:54.911	2024-12-29 20:00:54.911
cm5a1colc003w8e3x9ryzm9rk	cm5a1colc003u8e3xbowlp0my	BILLING	James	Miller	CEO	contact18@example.com	+1-555-9685	t	2024-12-29 20:00:54.913	2024-12-29 20:00:54.913
cm5a1cole00418e3xtfspt1nx	cm5a1cole003y8e3xbx41s1pd	TECHNICAL	Emily	Williams	CFO	\N	+1-555-1685	t	2024-12-29 20:00:54.915	2024-12-29 20:00:54.915
cm5a1colg00458e3xarx0nvyo	cm5a1colg00438e3xjn2f0bls	BILLING	Emma	Smith	\N	contact2@example.com	+1-555-7121	t	2024-12-29 20:00:54.917	2024-12-29 20:00:54.917
cm5a1colg00468e3xteovuz2u	cm5a1colg00438e3xjn2f0bls	BILLING	Emily	Johnson	CEO	contact26@example.com	+1-555-1331	f	2024-12-29 20:00:54.917	2024-12-29 20:00:54.917
cm5a1coli004b8e3x0m4xgdpo	cm5a1coli00488e3xc9d7u7k4	TECHNICAL	Sarah	Williams	\N	\N	+1-555-8350	t	2024-12-29 20:00:54.919	2024-12-29 20:00:54.919
cm5a1colk004g8e3x24u1ynix	cm5a1colk004d8e3xmilxbj7i	PRIMARY	John	Johnson	Manager	contact79@example.com	+1-555-4161	t	2024-12-29 20:00:54.921	2024-12-29 20:00:54.921
cm5a1coll004h8e3xie8gci98	cm5a1colk004d8e3xmilxbj7i	PRIMARY	Michael	Johnson	CEO	contact61@example.com	+1-555-1226	f	2024-12-29 20:00:54.921	2024-12-29 20:00:54.921
cm5a1coln004m8e3x3lmiybkq	cm5a1coln004j8e3xpvzfzms5	LEGAL	Emily	Jones	CTO	contact62@example.com	+1-555-6971	t	2024-12-29 20:00:54.924	2024-12-29 20:00:54.924
cm5a1coln004n8e3xs0r9e0l2	cm5a1coln004j8e3xpvzfzms5	LEGAL	Sarah	Miller	CEO	contact29@example.com	+1-555-2103	f	2024-12-29 20:00:54.924	2024-12-29 20:00:54.924
cm5a1colq004s8e3xsxrwb14j	cm5a1colq004p8e3xrrb677b1	BILLING	Sarah	Johnson	CFO	contact4@example.com	+1-555-5126	t	2024-12-29 20:00:54.926	2024-12-29 20:00:54.926
cm5a1colq004t8e3x5eou8t5y	cm5a1colq004p8e3xrrb677b1	TECHNICAL	Emma	Brown	CEO	contact40@example.com	\N	f	2024-12-29 20:00:54.926	2024-12-29 20:00:54.926
cm5a1cols004y8e3x9474qa7c	cm5a1cols004v8e3x6prp0dfg	PRIMARY	Emily	Garcia	CTO	contact14@example.com	+1-555-7385	t	2024-12-29 20:00:54.929	2024-12-29 20:00:54.929
cm5a1cols004z8e3xkd8ojudq	cm5a1cols004v8e3x6prp0dfg	PRIMARY	David	Smith	\N	contact30@example.com	\N	f	2024-12-29 20:00:54.929	2024-12-29 20:00:54.929
cm5a1colv00538e3xteb01xd9	cm5a1colv00518e3x0n88ik1x	TECHNICAL	James	Brown	CTO	\N	+1-555-8247	t	2024-12-29 20:00:54.931	2024-12-29 20:00:54.931
cm5a1colx00588e3x41ui985g	cm5a1colw00558e3xmiwf04ch	BILLING	Sarah	Davis	\N	contact5@example.com	+1-555-4015	t	2024-12-29 20:00:54.933	2024-12-29 20:00:54.933
cm5a1colx00598e3xx8r25uzn	cm5a1colw00558e3xmiwf04ch	LEGAL	John	Johnson	CTO	\N	+1-555-3996	f	2024-12-29 20:00:54.933	2024-12-29 20:00:54.933
cm5a1colz005d8e3xdzl4r0lq	cm5a1colz005b8e3x12zxdk2h	PRIMARY	Emma	Davis	Director	contact6@example.com	+1-555-6435	t	2024-12-29 20:00:54.936	2024-12-29 20:00:54.936
cm5a1com0005e8e3xmld2cpx3	cm5a1colz005b8e3x12zxdk2h	PRIMARY	Emily	Smith	Director	contact2@example.com	+1-555-2916	f	2024-12-29 20:00:54.936	2024-12-29 20:00:54.936
cm5a1com3005j8e3xl9tgvr32	cm5a1com3005g8e3xpnf2mai9	LEGAL	David	Davis	CEO	contact17@example.com	+1-555-0990	t	2024-12-29 20:00:54.94	2024-12-29 20:00:54.94
cm5a1com3005k8e3xoejn84iw	cm5a1com3005g8e3xpnf2mai9	TECHNICAL	Michael	Johnson	Director	contact22@example.com	+1-555-4201	f	2024-12-29 20:00:54.94	2024-12-29 20:00:54.94
cm5a1com6005o8e3x9ppho2er	cm5a1com6005m8e3xg05nbnew	PRIMARY	Emily	Jones	Manager	contact12@example.com	+1-555-9246	t	2024-12-29 20:00:54.943	2024-12-29 20:00:54.943
cm5a1com8005t8e3xw44rankv	cm5a1com8005q8e3xco3tgqoc	PRIMARY	James	Williams	CEO	\N	\N	t	2024-12-29 20:00:54.944	2024-12-29 20:00:54.944
cm5a1com8005u8e3x1iw44bya	cm5a1com8005q8e3xco3tgqoc	BILLING	James	Johnson	CEO	contact65@example.com	+1-555-2126	f	2024-12-29 20:00:54.944	2024-12-29 20:00:54.944
cm5a1comb005y8e3x2ihlr3l7	cm5a1comb005w8e3xobez1to6	LEGAL	Sarah	Johnson	Manager	contact93@example.com	+1-555-8204	t	2024-12-29 20:00:54.948	2024-12-29 20:00:54.948
cm5a1comb005z8e3xosxqrevq	cm5a1comb005w8e3xobez1to6	BILLING	David	Smith	\N	contact73@example.com	\N	f	2024-12-29 20:00:54.948	2024-12-29 20:00:54.948
cm5a1comd00648e3xrdzneo8k	cm5a1comd00618e3xh65p3wos	TECHNICAL	James	Smith	CTO	contact73@example.com	+1-555-5478	t	2024-12-29 20:00:54.949	2024-12-29 20:00:54.949
cm5a1comf00698e3xij15qcb5	cm5a1comf00668e3xrly07g10	TECHNICAL	Michael	Johnson	Manager	contact58@example.com	+1-555-0643	t	2024-12-29 20:00:54.952	2024-12-29 20:00:54.952
cm5a1comh006e8e3xp0nax3gb	cm5a1comh006b8e3xqr8zzxte	LEGAL	Sarah	Williams	CEO	contact96@example.com	+1-555-1305	t	2024-12-29 20:00:54.953	2024-12-29 20:00:54.953
cm5a1comi006j8e3x5y44ftgc	cm5a1comi006g8e3xrgtlygwi	PRIMARY	Emily	Garcia	\N	contact94@example.com	+1-555-7164	t	2024-12-29 20:00:54.955	2024-12-29 20:00:54.955
cm5a1comi006k8e3xvhspparv	cm5a1comi006g8e3xrgtlygwi	BILLING	James	Williams	CTO	contact2@example.com	+1-555-4976	f	2024-12-29 20:00:54.955	2024-12-29 20:00:54.955
cm5a1comk006p8e3xbtuhef6z	cm5a1comk006m8e3xnq4mylgg	PRIMARY	Sarah	Garcia	Director	contact72@example.com	+1-555-5602	t	2024-12-29 20:00:54.957	2024-12-29 20:00:54.957
cm5a1comn006t8e3xent6iwck	cm5a1comn006r8e3xl2fyt24a	LEGAL	David	Davis	CTO	contact65@example.com	+1-555-3488	t	2024-12-29 20:00:54.959	2024-12-29 20:00:54.959
cm5a1como006x8e3xayhakq9u	cm5a1como006v8e3x5yaxi1in	BILLING	Jane	Smith	CTO	contact41@example.com	+1-555-8468	t	2024-12-29 20:00:54.96	2024-12-29 20:00:54.96
cm5a1como006y8e3x2rivsgv4	cm5a1como006v8e3x5yaxi1in	LEGAL	Emily	Miller	Director	contact15@example.com	+1-555-3560	f	2024-12-29 20:00:54.96	2024-12-29 20:00:54.96
cm5a1comp00728e3xly7sgpvo	cm5a1comp00708e3xaxq8lvim	LEGAL	John	Brown	\N	\N	+1-555-9051	t	2024-12-29 20:00:54.961	2024-12-29 20:00:54.961
cm5a1comq00778e3xtl7ud1bu	cm5a1comq00748e3xronlszs4	TECHNICAL	Emily	Smith	CFO	contact34@example.com	\N	t	2024-12-29 20:00:54.962	2024-12-29 20:00:54.962
cm5a1comq00788e3xgk0rm718	cm5a1comq00748e3xronlszs4	BILLING	David	Miller	\N	contact84@example.com	+1-555-4084	f	2024-12-29 20:00:54.962	2024-12-29 20:00:54.962
cm5a1coms007c8e3xp2z65q7q	cm5a1coms007a8e3x9njfkm9a	PRIMARY	Emma	Davis	Director	\N	+1-555-6883	t	2024-12-29 20:00:54.964	2024-12-29 20:00:54.964
cm5a1coms007d8e3xwctjbfla	cm5a1coms007a8e3x9njfkm9a	PRIMARY	Michael	Brown	CTO	\N	+1-555-3381	f	2024-12-29 20:00:54.964	2024-12-29 20:00:54.964
cm5a1comt007i8e3x23wrbp0y	cm5a1comt007f8e3xt1vlja3e	PRIMARY	David	Jones	CFO	contact69@example.com	+1-555-1070	t	2024-12-29 20:00:54.966	2024-12-29 20:00:54.966
cm5a1comu007m8e3x0uuny4rp	cm5a1comu007k8e3xbknrkvob	BILLING	Emily	Williams	Manager	contact44@example.com	+1-555-5533	t	2024-12-29 20:00:54.967	2024-12-29 20:00:54.967
cm5a1comv007r8e3x3w3lfaxd	cm5a1comv007o8e3xkkuki9eh	BILLING	Emma	Smith	CFO	contact86@example.com	+1-555-7342	t	2024-12-29 20:00:54.968	2024-12-29 20:00:54.968
cm5a1comw007v8e3xcv5qvgl6	cm5a1comw007t8e3x3qcrvmk1	LEGAL	David	Smith	Director	contact14@example.com	+1-555-9383	t	2024-12-29 20:00:54.969	2024-12-29 20:00:54.969
cm5a1comy007z8e3xsnsbgt3o	cm5a1comy007x8e3xzmcgr4wo	PRIMARY	Jane	Johnson	Director	contact28@example.com	+1-555-3051	t	2024-12-29 20:00:54.97	2024-12-29 20:00:54.97
cm5a1comz00838e3xav8gb4e2	cm5a1comz00818e3xj02fddjo	LEGAL	Michael	Davis	CTO	\N	+1-555-8110	t	2024-12-29 20:00:54.971	2024-12-29 20:00:54.971
cm5a1comz00848e3x858sgqze	cm5a1comz00818e3xj02fddjo	PRIMARY	Emma	Johnson	CEO	contact64@example.com	\N	f	2024-12-29 20:00:54.971	2024-12-29 20:00:54.971
cm5a1cond00898e3xlesavzqt	cm5a1cond00868e3xik8z7viu	TECHNICAL	Jane	Brown	CEO	\N	\N	t	2024-12-29 20:00:54.985	2024-12-29 20:00:54.985
cm5a1conf008d8e3xi35rw6as	cm5a1conf008b8e3x9opjnda7	BILLING	John	Miller	CEO	contact63@example.com	+1-555-2220	t	2024-12-29 20:00:54.987	2024-12-29 20:00:54.987
cm5a1conf008e8e3xwyoz4fa6	cm5a1conf008b8e3x9opjnda7	TECHNICAL	John	Davis	CTO	\N	+1-555-2023	f	2024-12-29 20:00:54.987	2024-12-29 20:00:54.987
cm5a1conh008i8e3xmrimjnp8	cm5a1conh008g8e3xmsbxxgxi	PRIMARY	Emma	Jones	CEO	contact52@example.com	+1-555-1513	t	2024-12-29 20:00:54.989	2024-12-29 20:00:54.989
cm5a1conh008j8e3xy0wu4q66	cm5a1conh008g8e3xmsbxxgxi	BILLING	Emma	Williams	Manager	contact56@example.com	+1-555-5496	f	2024-12-29 20:00:54.989	2024-12-29 20:00:54.989
cm5a1coni008o8e3x5x2nan0g	cm5a1coni008l8e3xc1afx7uc	TECHNICAL	David	Garcia	\N	\N	+1-555-8428	t	2024-12-29 20:00:54.991	2024-12-29 20:00:54.991
cm5a1conk008t8e3xbaleg4zh	cm5a1conk008q8e3xt2r5a0f0	PRIMARY	Michael	Davis	\N	contact34@example.com	+1-555-2328	t	2024-12-29 20:00:54.993	2024-12-29 20:00:54.993
cm5a1conm008y8e3x3lpw2ou2	cm5a1conm008v8e3xv44w454h	TECHNICAL	Jane	Smith	CFO	contact80@example.com	+1-555-9455	t	2024-12-29 20:00:54.994	2024-12-29 20:00:54.994
cm5a1conn00928e3xjrcpqgzh	cm5a1conn00908e3xs3nj9p0l	PRIMARY	Emma	Jones	CFO	contact19@example.com	\N	t	2024-12-29 20:00:54.995	2024-12-29 20:00:54.995
cm5a1cono00968e3xnkij513g	cm5a1cono00948e3x0dzo260c	LEGAL	Sarah	Brown	Director	contact97@example.com	+1-555-5960	t	2024-12-29 20:00:54.996	2024-12-29 20:00:54.996
cm5a1cono00978e3x9kbn7e6s	cm5a1cono00948e3x0dzo260c	BILLING	Emma	Davis	CFO	contact75@example.com	+1-555-1865	f	2024-12-29 20:00:54.996	2024-12-29 20:00:54.996
cm5a1conp009c8e3xsdt5soha	cm5a1conp00998e3xw6uhu8ym	LEGAL	James	Brown	Manager	contact69@example.com	\N	t	2024-12-29 20:00:54.998	2024-12-29 20:00:54.998
cm5a1conp009d8e3xrsni2dl1	cm5a1conp00998e3xw6uhu8ym	BILLING	Emily	Williams	\N	contact63@example.com	+1-555-5753	f	2024-12-29 20:00:54.998	2024-12-29 20:00:54.998
cm5a1conr009i8e3xqss0j87k	cm5a1conr009f8e3xok8ckdi0	BILLING	Emily	Garcia	CFO	contact60@example.com	+1-555-3201	t	2024-12-29 20:00:54.999	2024-12-29 20:00:54.999
cm5a1cons009n8e3xg4u22tiv	cm5a1cons009k8e3x4yl5sjs8	TECHNICAL	Emily	Brown	CEO	contact71@example.com	+1-555-7910	t	2024-12-29 20:00:55.001	2024-12-29 20:00:55.001
cm5a1conv009r8e3x2o2mt3w0	cm5a1conv009p8e3x3n71g5wu	PRIMARY	Emily	Smith	CFO	contact59@example.com	+1-555-3415	t	2024-12-29 20:00:55.003	2024-12-29 20:00:55.003
cm5a1conx009w8e3xl960u8t4	cm5a1conx009t8e3xv0rkfj8m	TECHNICAL	John	Brown	CEO	contact5@example.com	+1-555-9609	t	2024-12-29 20:00:55.005	2024-12-29 20:00:55.005
cm5a1conx009x8e3xvddvjy0w	cm5a1conx009t8e3xv0rkfj8m	BILLING	Emily	Miller	Director	contact33@example.com	+1-555-0451	f	2024-12-29 20:00:55.005	2024-12-29 20:00:55.005
cm5a1conz00a28e3xom1axn7l	cm5a1conz009z8e3x035q53ka	TECHNICAL	Jane	Davis	Manager	contact92@example.com	+1-555-7470	t	2024-12-29 20:00:55.007	2024-12-29 20:00:55.007
cm5a1coo200a68e3xapdg0ypy	cm5a1coo200a48e3xlwa2pa9h	BILLING	James	Williams	CTO	contact12@example.com	+1-555-0280	t	2024-12-29 20:00:55.01	2024-12-29 20:00:55.01
cm5a1coo200a78e3xfrd9jbs3	cm5a1coo200a48e3xlwa2pa9h	PRIMARY	Sarah	Smith	Manager	\N	+1-555-0677	f	2024-12-29 20:00:55.01	2024-12-29 20:00:55.01
cm5a1coo400ab8e3xzo8ulnzi	cm5a1coo400a98e3xknro5ew3	BILLING	Michael	Brown	CFO	contact38@example.com	+1-555-5725	t	2024-12-29 20:00:55.013	2024-12-29 20:00:55.013
cm5a1coo400ac8e3xmfi10dje	cm5a1coo400a98e3xknro5ew3	BILLING	Jane	Johnson	CTO	contact11@example.com	+1-555-1920	f	2024-12-29 20:00:55.013	2024-12-29 20:00:55.013
cm5a1coo600ah8e3xkhrjwcb4	cm5a1coo600ae8e3xio6eenhn	BILLING	Michael	Miller	Director	contact56@example.com	+1-555-3476	t	2024-12-29 20:00:55.014	2024-12-29 20:00:55.014
cm5a1coo600ai8e3xsoxfqq3t	cm5a1coo600ae8e3xio6eenhn	PRIMARY	Michael	Brown	Director	contact98@example.com	+1-555-8807	f	2024-12-29 20:00:55.014	2024-12-29 20:00:55.014
cm5a1coo800am8e3xtl0ai6mv	cm5a1coo800ak8e3xd2fx9g2b	TECHNICAL	Sarah	Smith	CFO	contact81@example.com	+1-555-2586	t	2024-12-29 20:00:55.016	2024-12-29 20:00:55.016
cm5a1cooa00aq8e3xz5mocbri	cm5a1cooa00ao8e3x4nh7d3o1	LEGAL	Jane	Miller	CFO	contact73@example.com	+1-555-4164	t	2024-12-29 20:00:55.018	2024-12-29 20:00:55.018
cm5a1coob00au8e3xi25noj8t	cm5a1coob00as8e3xk7ddj46k	PRIMARY	John	Garcia	Manager	\N	\N	t	2024-12-29 20:00:55.02	2024-12-29 20:00:55.02
cm5a1coob00av8e3x4dg0dy41	cm5a1coob00as8e3xk7ddj46k	BILLING	Jane	Brown	\N	contact10@example.com	+1-555-7515	f	2024-12-29 20:00:55.02	2024-12-29 20:00:55.02
cm5a1cood00az8e3xk66hr9l7	cm5a1cood00ax8e3xvhuks3ne	PRIMARY	John	Davis	CFO	contact53@example.com	+1-555-7949	t	2024-12-29 20:00:55.022	2024-12-29 20:00:55.022
cm5a1coof00b48e3xxy9d9d6j	cm5a1cooe00b18e3x9qqda8h9	TECHNICAL	James	Jones	CTO	\N	+1-555-1573	t	2024-12-29 20:00:55.023	2024-12-29 20:00:55.023
cm5a1cooh00b98e3xev77txag	cm5a1cooh00b68e3xmwksyh7j	TECHNICAL	James	Davis	CTO	contact16@example.com	+1-555-6774	t	2024-12-29 20:00:55.026	2024-12-29 20:00:55.026
cm5a1cooj00be8e3xtbkeiaw6	cm5a1cooj00bb8e3xjot2ktlo	TECHNICAL	James	Miller	CTO	contact73@example.com	+1-555-6797	t	2024-12-29 20:00:55.028	2024-12-29 20:00:55.028
cm5a1cool00bi8e3xrl6ospxw	cm5a1cool00bg8e3xptx3x4cm	BILLING	Emily	Brown	\N	contact83@example.com	+1-555-4952	t	2024-12-29 20:00:55.03	2024-12-29 20:00:55.03
cm5a1coom00bn8e3xt04rujpr	cm5a1coom00bk8e3xv1ufqv7z	BILLING	James	Garcia	CTO	contact25@example.com	+1-555-6784	t	2024-12-29 20:00:55.031	2024-12-29 20:00:55.031
cm5a1coom00bo8e3x36y7w3n7	cm5a1coom00bk8e3xv1ufqv7z	TECHNICAL	Emily	Garcia	Director	\N	+1-555-9762	f	2024-12-29 20:00:55.031	2024-12-29 20:00:55.031
cm5a1coop00bs8e3x8fmqzuri	cm5a1coop00bq8e3xw0tzyquc	BILLING	James	Williams	CEO	\N	+1-555-8862	t	2024-12-29 20:00:55.033	2024-12-29 20:00:55.033
cm5a1coor00bw8e3xs59mjwpc	cm5a1coor00bu8e3xhzkethuw	LEGAL	David	Brown	Manager	contact1@example.com	+1-555-4175	t	2024-12-29 20:00:55.035	2024-12-29 20:00:55.035
cm5a1coor00bx8e3x1mpxfq53	cm5a1coor00bu8e3xhzkethuw	PRIMARY	James	Brown	Director	contact93@example.com	+1-555-8866	f	2024-12-29 20:00:55.035	2024-12-29 20:00:55.035
cm5a1coot00c28e3x870yecph	cm5a1coot00bz8e3xkhb7y4ur	LEGAL	David	Davis	CTO	contact36@example.com	+1-555-1133	t	2024-12-29 20:00:55.037	2024-12-29 20:00:55.037
cm5a1coot00c38e3xotfc2yjl	cm5a1coot00bz8e3xkhb7y4ur	LEGAL	James	Jones	CEO	contact52@example.com	\N	f	2024-12-29 20:00:55.037	2024-12-29 20:00:55.037
cm5a1coov00c88e3xdenzravp	cm5a1coov00c58e3x7zmex4bh	LEGAL	James	Davis	Director	contact56@example.com	\N	t	2024-12-29 20:00:55.04	2024-12-29 20:00:55.04
cm5a1coox00cc8e3x0x3o99b7	cm5a1coox00ca8e3x236axixg	PRIMARY	Michael	Brown	CTO	\N	+1-555-2579	t	2024-12-29 20:00:55.041	2024-12-29 20:00:55.041
cm5a1coox00cd8e3xhzm6wzwc	cm5a1coox00ca8e3x236axixg	TECHNICAL	Emily	Williams	CTO	contact50@example.com	+1-555-6593	f	2024-12-29 20:00:55.041	2024-12-29 20:00:55.041
cm5a1cooz00ch8e3xyp1o0jrq	cm5a1cooz00cf8e3x4t2db5q4	LEGAL	Jane	Williams	\N	contact66@example.com	+1-555-2264	t	2024-12-29 20:00:55.043	2024-12-29 20:00:55.043
cm5a1cop000cm8e3xonxb0qzb	cm5a1cop000cj8e3xi2e3tvft	BILLING	Sarah	Garcia	\N	contact97@example.com	+1-555-4562	t	2024-12-29 20:00:55.045	2024-12-29 20:00:55.045
cm5a1cop100cn8e3x27cwdmh1	cm5a1cop000cj8e3xi2e3tvft	BILLING	Emily	Williams	Director	contact81@example.com	+1-555-4585	f	2024-12-29 20:00:55.045	2024-12-29 20:00:55.045
cm5a1cop300cs8e3xqu65r5ig	cm5a1cop300cp8e3xzf20d58o	PRIMARY	David	Smith	\N	\N	+1-555-7696	t	2024-12-29 20:00:55.048	2024-12-29 20:00:55.048
cm5a1cop300ct8e3xv5jkvmpf	cm5a1cop300cp8e3xzf20d58o	TECHNICAL	Emma	Davis	Manager	contact79@example.com	+1-555-4650	f	2024-12-29 20:00:55.048	2024-12-29 20:00:55.048
cm5a1cop500cx8e3xday6py9y	cm5a1cop500cv8e3xr1crhhgz	TECHNICAL	James	Jones	CTO	\N	+1-555-2523	t	2024-12-29 20:00:55.049	2024-12-29 20:00:55.049
cm5a1cop600d28e3xlg8b7k1b	cm5a1cop600cz8e3xd10mxw8o	TECHNICAL	James	Williams	\N	\N	+1-555-8362	t	2024-12-29 20:00:55.05	2024-12-29 20:00:55.05
cm5a1cop600d38e3xeycaq8df	cm5a1cop600cz8e3xd10mxw8o	LEGAL	Michael	Garcia	CEO	\N	+1-555-4401	f	2024-12-29 20:00:55.05	2024-12-29 20:00:55.05
cm5a1cop800d88e3x9qgb4xv7	cm5a1cop800d58e3x1083wsdw	LEGAL	Michael	Miller	CEO	contact77@example.com	+1-555-3330	t	2024-12-29 20:00:55.053	2024-12-29 20:00:55.053
cm5a1cop800d98e3xsvgbwpgu	cm5a1cop800d58e3x1083wsdw	LEGAL	John	Garcia	CFO	contact19@example.com	+1-555-2251	f	2024-12-29 20:00:55.053	2024-12-29 20:00:55.053
cm5a1copb00dd8e3xk1wctsw1	cm5a1copb00db8e3xp6j29wgq	PRIMARY	David	Williams	Director	contact25@example.com	\N	t	2024-12-29 20:00:55.055	2024-12-29 20:00:55.055
cm5a1copd00di8e3x8b5uy9mg	cm5a1copd00df8e3x2vkzfr5b	BILLING	John	Brown	Manager	contact48@example.com	+1-555-1122	t	2024-12-29 20:00:55.057	2024-12-29 20:00:55.057
cm5a1copd00dj8e3xvuslb64k	cm5a1copd00df8e3x2vkzfr5b	PRIMARY	Emma	Davis	Manager	contact45@example.com	+1-555-0159	f	2024-12-29 20:00:55.057	2024-12-29 20:00:55.057
cm5a1copf00do8e3xiv1msrsp	cm5a1copf00dl8e3xnqqapzt9	BILLING	Sarah	Davis	CEO	\N	+1-555-5455	t	2024-12-29 20:00:55.06	2024-12-29 20:00:55.06
cm5a1copi00dt8e3xwlhdzv62	cm5a1coph00dq8e3xwbclvzyn	LEGAL	Emily	Garcia	Manager	contact19@example.com	+1-555-0867	t	2024-12-29 20:00:55.062	2024-12-29 20:00:55.062
cm5a1copk00dy8e3x58vk49lq	cm5a1copk00dv8e3x3belyc8f	BILLING	David	Smith	\N	contact52@example.com	+1-555-4120	t	2024-12-29 20:00:55.064	2024-12-29 20:00:55.064
cm5a1copl00e28e3xnjysykw7	cm5a1copl00e08e3xes8lfibp	TECHNICAL	Jane	Smith	Director	contact77@example.com	+1-555-7160	t	2024-12-29 20:00:55.066	2024-12-29 20:00:55.066
cm5a1copl00e38e3xpakfmsly	cm5a1copl00e08e3xes8lfibp	TECHNICAL	Michael	Garcia	CTO	contact25@example.com	+1-555-8558	f	2024-12-29 20:00:55.066	2024-12-29 20:00:55.066
\.


--
-- Data for Name: CounterpartyType; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CounterpartyType" (id, name, description, "createdAt", "updatedAt") FROM stdin;
cm5a1cohs00008e3x2ippl4yg	Bank	Financial institution	2024-12-29 20:00:54.784	2024-12-29 20:00:54.784
cm5a1cohz00018e3xaeoasaqb	Insurance	Insurance provider	2024-12-29 20:00:54.791	2024-12-29 20:00:54.791
cm5a1coi000028e3x73jztc5m	Investment	Investment management company	2024-12-29 20:00:54.792	2024-12-29 20:00:54.792
cm5a1coi100038e3xsurlvuts	Corporate	Non-financial corporation	2024-12-29 20:00:54.793	2024-12-29 20:00:54.793
cm5a1coi200048e3x5mggx6ox	Government	Government entity	2024-12-29 20:00:54.794	2024-12-29 20:00:54.794
cm5a1coi200058e3xyaelj6va	Non-Profit	Non-profit organization	2024-12-29 20:00:54.795	2024-12-29 20:00:54.795
\.


--
-- Data for Name: CreditAgreement; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."CreditAgreement" (id, "agreementNumber", "borrowerId", "lenderId", status, amount, currency, "startDate", "maturityDate", "interestRate", description, "createdAt", "updatedAt") FROM stdin;
cm5a1coq300ei8e3x0n39l2se	CA-2024-001	cm5a1cops00e78e3xkbj1n4gi	cm5a1copz00ec8e3xylnnymk0	ACTIVE	10000000	USD	2024-12-29 20:00:55.082	2025-12-29 20:00:55.082	5.5	\N	2024-12-29 20:00:55.083	2024-12-29 20:00:55.083
\.


--
-- Data for Name: Entity; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Entity" (id, "legalName", dba, "registrationNumber", "taxId", "dateOfBirth", "dateOfIncorporation", "countryOfIncorporation", "governmentId", "governmentIdType", "governmentIdExpiry", "primaryContactName", "primaryContactEmail", "primaryContactPhone", status, "isAgent", "createdAt", "updatedAt") FROM stdin;
cm5a1cops00e78e3xkbj1n4gi	Test Company Inc.	Test Co	REG123	TAX123	\N	\N	US	\N	\N	\N	\N	\N	\N	ACTIVE	f	2024-12-29 20:00:55.073	2024-12-29 20:00:55.073
cm5a1copz00ec8e3xylnnymk0	Bank of Test	Test Bank	BANK123	BANK456	\N	\N	US	\N	\N	\N	\N	\N	\N	ACTIVE	t	2024-12-29 20:00:55.079	2024-12-29 20:00:55.079
\.


--
-- Data for Name: Facility; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Facility" (id, "facilityName", "facilityType", "creditAgreementId", "commitmentAmount", "availableAmount", currency, "startDate", "maturityDate", "interestType", "baseRate", margin, description, "createdAt", "updatedAt") FROM stdin;
cm5a1coq300ej8e3xa6yuei9h	Term Loan A	TERM_LOAN	cm5a1coq300ei8e3x0n39l2se	6000000	6000000	USD	2024-12-29 20:00:55.082	2025-12-29 20:00:55.082	FLOATING	SOFR	2.5	\N	2024-12-29 20:00:55.083	2024-12-29 20:00:55.083
cm5a1coq300em8e3x2s3fgimo	Revolving Credit Facility	REVOLVING	cm5a1coq300ei8e3x0n39l2se	4000000	4000000	USD	2024-12-29 20:00:55.082	2025-12-29 20:00:55.082	FLOATING	SOFR	3	\N	2024-12-29 20:00:55.083	2024-12-29 20:00:55.083
\.


--
-- Data for Name: FacilityPosition; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."FacilityPosition" (id, "facilityId", "lenderId", amount, share, status, "createdAt", "updatedAt") FROM stdin;
cm5a1coq300el8e3xnu80vjb6	cm5a1coq300ej8e3xa6yuei9h	cm5a1coq100eg8e3xngp2swgb	6000000	100	ACTIVE	2024-12-29 20:00:55.083	2024-12-29 20:00:55.083
cm5a1coq300eo8e3xkus25xuy	cm5a1coq300em8e3x2s3fgimo	cm5a1coq100eg8e3xngp2swgb	4000000	100	ACTIVE	2024-12-29 20:00:55.083	2024-12-29 20:00:55.083
\.


--
-- Data for Name: FacilitySublimit; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."FacilitySublimit" (id, "facilityId", type, amount, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Lender; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Lender" (id, "entityId", status, "onboardingDate", "createdAt", "updatedAt") FROM stdin;
cm5a1coq100eg8e3xngp2swgb	cm5a1copz00ec8e3xylnnymk0	ACTIVE	2024-12-29 20:00:55.081	2024-12-29 20:00:55.081	2024-12-29 20:00:55.081
\.


--
-- Data for Name: Loan; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Loan" (id, "facilityId", amount, "outstandingAmount", currency, status, "interestPeriod", "drawDate", "baseRate", "effectiveRate", "createdAt", "updatedAt") FROM stdin;
cm5a1coqa00eq8e3xpbp6dcod	cm5a1coq300ej8e3xa6yuei9h	3000000	3000000	USD	ACTIVE	1M	2024-12-29 20:00:55.09	4.5	7	2024-12-29 20:00:55.09	2024-12-29 20:00:55.09
cm5a1coqg00eu8e3xh8fvdiqa	cm5a1coq300em8e3x2s3fgimo	2000000	2000000	USD	ACTIVE	1M	2024-12-29 20:00:55.096	4.5	7	2024-12-29 20:00:55.097	2024-12-29 20:00:55.097
\.


--
-- Data for Name: ServicingActivity; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingActivity" (id, "facilityId", "activityType", "dueDate", description, amount, status, "completedAt", "completedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServicingAssignment; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingAssignment" (id, "teamMemberId", "facilityId", "assignmentType", "startDate", "endDate", status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServicingRole; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingRole" (id, name, description, permissions, "createdAt", "updatedAt") FROM stdin;
cm5a1copn00e48e3xjhomtlbp	Admin	Full system access	["MANAGE_TEAM","MANAGE_ROLES","MANAGE_ASSIGNMENTS","VIEW_ALL"]	2024-12-29 20:00:55.068	2024-12-29 20:00:55.068
cm5a1copr00e58e3xdpwfrqxw	Manager	Team and assignment management	["MANAGE_ASSIGNMENTS","VIEW_ALL"]	2024-12-29 20:00:55.071	2024-12-29 20:00:55.071
cm5a1copr00e68e3xxua4rwk3	Agent	Regular team member	["VIEW_ASSIGNMENTS"]	2024-12-29 20:00:55.072	2024-12-29 20:00:55.072
\.


--
-- Data for Name: ServicingTeamMember; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."ServicingTeamMember" (id, name, email, "roleId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Trade; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."Trade" (id, "facilityId", "counterpartyId", "tradeDate", "settlementDate", amount, price, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TransactionHistory; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public."TransactionHistory" (id, "creditAgreementId", "loanId", "tradeId", "servicingActivityId", "activityType", amount, currency, status, description, "effectiveDate", "processedBy", "createdAt", "updatedAt") FROM stdin;
cm5a1coqd00es8e3x8az45qio	cm5a1coq300ei8e3x0n39l2se	cm5a1coqa00eq8e3xpbp6dcod	\N	\N	DRAWDOWN	3000000	USD	COMPLETED	Initial drawdown for Term Loan A	2024-12-29 20:00:55.093	SYSTEM	2024-12-29 20:00:55.093	2024-12-29 20:00:55.093
cm5a1coqh00ew8e3x6se2nzsw	cm5a1coq300ei8e3x0n39l2se	cm5a1coqg00eu8e3xh8fvdiqa	\N	\N	DRAWDOWN	2000000	USD	COMPLETED	Initial drawdown for Revolving Credit Facility	2024-12-29 20:00:55.097	SYSTEM	2024-12-29 20:00:55.098	2024-12-29 20:00:55.098
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: stephenscott
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c2f842c0-3133-4dcd-a3ff-872020b92450	d636333284b4df311c98692fb995d722312d914437eed9cdf64c444baaee016a	2024-12-29 15:00:53.294616-05	20241229200053_init	\N	\N	2024-12-29 15:00:53.215469-05	1
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
-- Name: CounterpartyAddress CounterpartyAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CounterpartyAddress"
    ADD CONSTRAINT "CounterpartyAddress_pkey" PRIMARY KEY (id);


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
-- Name: Contact_entityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Contact_entityId_idx" ON public."Contact" USING btree ("entityId");


--
-- Name: CounterpartyAddress_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "CounterpartyAddress_counterpartyId_idx" ON public."CounterpartyAddress" USING btree ("counterpartyId");


--
-- Name: CounterpartyContact_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "CounterpartyContact_counterpartyId_idx" ON public."CounterpartyContact" USING btree ("counterpartyId");


--
-- Name: CounterpartyType_name_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "CounterpartyType_name_key" ON public."CounterpartyType" USING btree (name);


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
-- Name: ServicingAssignment_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingAssignment_facilityId_idx" ON public."ServicingAssignment" USING btree ("facilityId");


--
-- Name: ServicingAssignment_teamMemberId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingAssignment_teamMemberId_idx" ON public."ServicingAssignment" USING btree ("teamMemberId");


--
-- Name: ServicingRole_name_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "ServicingRole_name_key" ON public."ServicingRole" USING btree (name);


--
-- Name: ServicingTeamMember_email_key; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE UNIQUE INDEX "ServicingTeamMember_email_key" ON public."ServicingTeamMember" USING btree (email);


--
-- Name: ServicingTeamMember_roleId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "ServicingTeamMember_roleId_idx" ON public."ServicingTeamMember" USING btree ("roleId");


--
-- Name: Trade_counterpartyId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Trade_counterpartyId_idx" ON public."Trade" USING btree ("counterpartyId");


--
-- Name: Trade_facilityId_idx; Type: INDEX; Schema: public; Owner: stephenscott
--

CREATE INDEX "Trade_facilityId_idx" ON public."Trade" USING btree ("facilityId");


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
-- Name: Address Address_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: Contact Contact_entityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES public."Entity"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CounterpartyAddress CounterpartyAddress_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CounterpartyAddress"
    ADD CONSTRAINT "CounterpartyAddress_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CounterpartyContact CounterpartyContact_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."CounterpartyContact"
    ADD CONSTRAINT "CounterpartyContact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Counterparty Counterparty_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Counterparty"
    ADD CONSTRAINT "Counterparty_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."CounterpartyType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: ServicingAssignment ServicingAssignment_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingAssignment"
    ADD CONSTRAINT "ServicingAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServicingAssignment ServicingAssignment_teamMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingAssignment"
    ADD CONSTRAINT "ServicingAssignment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES public."ServicingTeamMember"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServicingTeamMember ServicingTeamMember_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."ServicingTeamMember"
    ADD CONSTRAINT "ServicingTeamMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."ServicingRole"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Trade Trade_counterpartyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES public."Counterparty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Trade Trade_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stephenscott
--

ALTER TABLE ONLY public."Trade"
    ADD CONSTRAINT "Trade_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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

