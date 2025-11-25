--
-- PostgreSQL database dump
--

\restrict OF9tTYqE1u3feS1XSAe2CwpMdRRQwwhnc2FVXTRJ1BKYPRweGSYxGYUq0hMUKaH

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: resona_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO resona_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: resona_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BlogPostStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."BlogPostStatus" AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."BlogPostStatus" OWNER TO resona_user;

--
-- Name: CouponScope; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."CouponScope" AS ENUM (
    'ALL_PRODUCTS',
    'CATEGORY',
    'PRODUCT',
    'USER'
);


ALTER TYPE public."CouponScope" OWNER TO resona_user;

--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'SCHEDULED',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
    'RETURNED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO resona_user;

--
-- Name: DeliveryType; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."DeliveryType" AS ENUM (
    'PICKUP',
    'DELIVERY',
    'SHIPPING'
);


ALTER TYPE public."DeliveryType" OWNER TO resona_user;

--
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'CAPTURED',
    'RELEASED',
    'PARTIALLY_RETAINED'
);


ALTER TYPE public."DepositStatus" OWNER TO resona_user;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SHIPPING'
);


ALTER TYPE public."DiscountType" OWNER TO resona_user;

--
-- Name: DistanceZone; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."DistanceZone" AS ENUM (
    'LOCAL',
    'REGIONAL',
    'EXTENDED',
    'CUSTOM'
);


ALTER TYPE public."DistanceZone" OWNER TO resona_user;

--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'PENDING',
    'QUEUED',
    'SENDING',
    'SENT',
    'DELIVERED',
    'OPENED',
    'CLICKED',
    'FAILED',
    'BOUNCED'
);


ALTER TYPE public."EmailStatus" OWNER TO resona_user;

--
-- Name: InteractionType; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."InteractionType" AS ENUM (
    'VIEW',
    'ADD_TO_CART',
    'REMOVE_FROM_CART',
    'QUOTE_REQUEST',
    'AVAILABILITY_CHECK',
    'ORDER_PLACED',
    'WISHLIST_ADD',
    'PURCHASE'
);


ALTER TYPE public."InteractionType" OWNER TO resona_user;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'PENDING'
);


ALTER TYPE public."InvoiceStatus" OWNER TO resona_user;

--
-- Name: ModificationType; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."ModificationType" AS ENUM (
    'ADD_ITEMS',
    'REMOVE_ITEMS',
    'MODIFY_ITEMS',
    'CHANGE_DATES',
    'CANCEL'
);


ALTER TYPE public."ModificationType" OWNER TO resona_user;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_CONFIRMATION',
    'ORDER_PAYMENT_RECEIVED',
    'ORDER_PAYMENT_PENDING',
    'ORDER_PAYMENT_FAILED',
    'ORDER_STATUS_UPDATE',
    'ORDER_CANCELLED',
    'REMINDER_PAYMENT_DUE',
    'REMINDER_3_DAYS_BEFORE',
    'REMINDER_1_DAY_BEFORE',
    'REMINDER_DAY_OF_EVENT',
    'REMINDER_RETURN_DUE',
    'RETURN_CONFIRMATION',
    'REVIEW_REQUEST',
    'DEPOSIT_RELEASED',
    'DEPOSIT_RETAINED',
    'WELCOME_EMAIL',
    'ABANDONED_CART',
    'SPECIAL_OFFER',
    'NEW_ORDER_ADMIN',
    'HIGH_DEMAND_ALERT',
    'LOW_STOCK_ALERT'
);


ALTER TYPE public."NotificationType" OWNER TO resona_user;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'IN_TRANSIT',
    'DELIVERED',
    'RETURNED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO resona_user;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'STRIPE',
    'BANK_TRANSFER',
    'CASH',
    'FINANCING',
    'OTHER',
    'CARD'
);


ALTER TYPE public."PaymentMethod" OWNER TO resona_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCEEDED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'CANCELLED',
    'COMPLETED'
);


ALTER TYPE public."PaymentStatus" OWNER TO resona_user;

--
-- Name: PaymentTerm; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."PaymentTerm" AS ENUM (
    'FULL_UPFRONT',
    'PARTIAL_UPFRONT',
    'ON_PICKUP'
);


ALTER TYPE public."PaymentTerm" OWNER TO resona_user;

--
-- Name: PriceType; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."PriceType" AS ENUM (
    'FIXED',
    'PER_HOUR',
    'PER_ITEM',
    'PERCENTAGE'
);


ALTER TYPE public."PriceType" OWNER TO resona_user;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'AVAILABLE',
    'OUT_OF_STOCK',
    'DISCONTINUED',
    'COMING_SOON'
);


ALTER TYPE public."ProductStatus" OWNER TO resona_user;

--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'NONE',
    'PARTIAL',
    'FULL',
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."RefundStatus" OWNER TO resona_user;

--
-- Name: StockStatus; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."StockStatus" AS ENUM (
    'IN_STOCK',
    'ON_DEMAND',
    'DISCONTINUED',
    'SEASONAL'
);


ALTER TYPE public."StockStatus" OWNER TO resona_user;

--
-- Name: UserLevel; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."UserLevel" AS ENUM (
    'STANDARD',
    'VIP',
    'VIP_PLUS'
);


ALTER TYPE public."UserLevel" OWNER TO resona_user;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: resona_user
--

CREATE TYPE public."UserRole" AS ENUM (
    'CLIENT',
    'ADMIN',
    'SUPERADMIN'
);


ALTER TYPE public."UserRole" OWNER TO resona_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ApiKey; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    key text NOT NULL,
    secret text NOT NULL,
    "userId" text,
    permissions text[],
    "rateLimit" integer DEFAULT 100 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ApiKey" OWNER TO resona_user;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    changes jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO resona_user;

--
-- Name: BillingData; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."BillingData" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyName" text,
    "taxId" text NOT NULL,
    "taxIdType" text DEFAULT 'NIF'::text NOT NULL,
    address text NOT NULL,
    "addressLine2" text,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'España'::text NOT NULL,
    phone text,
    email text,
    "isDefault" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BillingData" OWNER TO resona_user;

--
-- Name: BlogCategory; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."BlogCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BlogCategory" OWNER TO resona_user;

--
-- Name: BlogPost; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."BlogPost" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "metaKeywords" text,
    "featuredImage" text,
    images text[],
    "categoryId" text,
    status public."BlogPostStatus" DEFAULT 'DRAFT'::public."BlogPostStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "scheduledFor" timestamp(3) without time zone,
    "authorId" text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    "aiGenerated" boolean DEFAULT false NOT NULL,
    "aiPrompt" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BlogPost" OWNER TO resona_user;

--
-- Name: BlogTag; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."BlogTag" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BlogTag" OWNER TO resona_user;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO resona_user;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    scope public."CouponScope" DEFAULT 'ALL_PRODUCTS'::public."CouponScope" NOT NULL,
    "categoryId" text,
    "productId" text,
    "userId" text,
    "minimumAmount" numeric(10,2),
    "maxDiscount" numeric(10,2),
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "usageLimitPerUser" integer DEFAULT 1,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validTo" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO resona_user;

--
-- Name: CouponUsage; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."CouponUsage" (
    id text NOT NULL,
    "couponId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text NOT NULL,
    "discountApplied" numeric(10,2) NOT NULL,
    "usedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CouponUsage" OWNER TO resona_user;

--
-- Name: CustomInvoice; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."CustomInvoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "clientName" text NOT NULL,
    "clientEmail" text NOT NULL,
    "clientPhone" text,
    "clientNIF" text,
    "clientAddress" jsonb NOT NULL,
    "serviceDate" timestamp(3) without time zone NOT NULL,
    items jsonb[],
    subtotal numeric(10,2) NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 21 NOT NULL,
    "taxAmount" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    notes text,
    "pdfUrl" text,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "paidDate" timestamp(3) without time zone,
    "sentDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomInvoice" OWNER TO resona_user;

--
-- Name: CustomerNote; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."CustomerNote" (
    id text NOT NULL,
    "userId" text NOT NULL,
    note text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomerNote" OWNER TO resona_user;

--
-- Name: Delivery; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Delivery" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "vehicleId" text,
    "driverId" text,
    "plannedDate" timestamp(3) without time zone NOT NULL,
    "actualDate" timestamp(3) without time zone,
    status public."DeliveryStatus" DEFAULT 'SCHEDULED'::public."DeliveryStatus" NOT NULL,
    signature text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Delivery" OWNER TO resona_user;

--
-- Name: EmailNotification; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."EmailNotification" (
    id text NOT NULL,
    "userId" text,
    email text NOT NULL,
    type public."NotificationType" NOT NULL,
    template text NOT NULL,
    "orderId" text,
    subject text NOT NULL,
    body text NOT NULL,
    metadata jsonb,
    status public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "openedAt" timestamp(3) without time zone,
    "clickedAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "errorMessage" text,
    "sendgridId" text,
    attempts integer DEFAULT 0 NOT NULL,
    "maxAttempts" integer DEFAULT 3 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmailNotification" OWNER TO resona_user;

--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO resona_user;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "orderId" text NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "taxAmount" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "pdfUrl" text,
    "sentAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    metadata jsonb,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    "facturaeGenerated" boolean DEFAULT false NOT NULL,
    "facturaeSeries" text DEFAULT 'A'::text,
    "facturaeUrl" text,
    "facturaeXml" text
);


ALTER TABLE public."Invoice" OWNER TO resona_user;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "emailSent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO resona_user;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "eventType" text,
    "eventLocation" jsonb NOT NULL,
    attendees integer,
    "contactPerson" text NOT NULL,
    "contactPhone" text NOT NULL,
    notes text,
    "deliveryType" public."DeliveryType" NOT NULL,
    "deliveryAddress" jsonb,
    "deliveryTime" text,
    "deliveryNotes" text,
    "paymentTerm" public."PaymentTerm" DEFAULT 'PARTIAL_UPFRONT'::public."PaymentTerm" NOT NULL,
    "paymentTermAdjustment" numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentTermPercent" numeric(5,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "totalBeforeAdjustment" numeric(10,2) NOT NULL,
    "paymentTermDiscount" numeric(10,2),
    "paymentTermSurcharge" numeric(10,2),
    "taxAmount" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "upfrontPaymentAmount" numeric(10,2),
    "upfrontPaymentDate" timestamp(3) without time zone,
    "upfrontPaymentStatus" public."PaymentStatus",
    "remainingPaymentAmount" numeric(10,2),
    "remainingPaymentDue" timestamp(3) without time zone,
    "remainingPaymentDate" timestamp(3) without time zone,
    "remainingPaymentStatus" public."PaymentStatus",
    "shippingCost" numeric(10,2) NOT NULL,
    "shippingSuggested" numeric(10,2),
    "shippingManuallySet" boolean DEFAULT false NOT NULL,
    "shippingNotes" text,
    "shippingDistance" numeric(10,2),
    "shippingWeight" numeric(10,2),
    "shippingVolume" numeric(10,2),
    "depositAmount" numeric(10,2) NOT NULL,
    "depositStatus" public."DepositStatus" DEFAULT 'PENDING'::public."DepositStatus" NOT NULL,
    "depositPaidAt" timestamp(3) without time zone,
    "depositReleasedAt" timestamp(3) without time zone,
    "depositRetainedAmount" numeric(10,2),
    "depositNotes" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "reviewRequested" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "confirmedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "deliveryDate" timestamp(3) without time zone,
    "deliveryFee" numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "stripeCustomerId" text,
    "stripePaymentIntentId" text,
    "couponCode" text,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discountPercentage" numeric(5,2),
    "cancelReason" text,
    "isModified" boolean DEFAULT false NOT NULL,
    "lastModifiedAt" timestamp(3) without time zone,
    "modificationCount" integer DEFAULT 0 NOT NULL,
    "originalTotal" numeric(10,2),
    "refundAmount" numeric(10,2),
    "refundProcessedAt" timestamp(3) without time zone,
    "refundStatus" public."RefundStatus" DEFAULT 'NONE'::public."RefundStatus" NOT NULL
);


ALTER TABLE public."Order" OWNER TO resona_user;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "pricePerDay" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "pricePerUnit" numeric(10,2) DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "totalPrice" numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO resona_user;

--
-- Name: OrderNote; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."OrderNote" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    attachments jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderNote" OWNER TO resona_user;

--
-- Name: OrderService; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."OrderService" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "serviceId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    "suggestedPrice" numeric(10,2),
    "manuallySet" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderService" OWNER TO resona_user;

--
-- Name: Pack; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Pack" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "imageUrl" text,
    "pricePerDay" numeric(10,2) NOT NULL,
    discount numeric(5,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Pack" OWNER TO resona_user;

--
-- Name: PackItem; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."PackItem" (
    id text NOT NULL,
    "packId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."PackItem" OWNER TO resona_user;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "invoiceId" text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "stripePaymentIntentId" text,
    "stripeChargeId" text,
    "stripeCustomerId" text,
    "stripePaymentMethodId" text,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "cardBrand" text,
    "cardLast4" text,
    "cardExpMonth" integer,
    "cardExpYear" integer,
    reference text,
    metadata jsonb,
    "errorMessage" text,
    notes text,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "failedAt" timestamp(3) without time zone,
    "orderId" text,
    "refundedAmount" numeric(10,2),
    "refundedAt" timestamp(3) without time zone
);


ALTER TABLE public."Payment" OWNER TO resona_user;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "categoryId" text NOT NULL,
    "pricePerDay" numeric(10,2) NOT NULL,
    "pricePerWeekend" numeric(10,2) NOT NULL,
    "pricePerWeek" numeric(10,2) NOT NULL,
    "weekendMultiplier" numeric(3,2) DEFAULT 1.5 NOT NULL,
    "weekMultiplier" numeric(3,2) DEFAULT 5.0 NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "realStock" integer DEFAULT 0 NOT NULL,
    "stockStatus" public."StockStatus" DEFAULT 'ON_DEMAND'::public."StockStatus" NOT NULL,
    "leadTimeDays" integer DEFAULT 30 NOT NULL,
    "canBuyOnDemand" boolean DEFAULT true NOT NULL,
    weight numeric(8,2),
    length numeric(8,2),
    width numeric(8,2),
    height numeric(8,2),
    volume numeric(10,2),
    "requiresSpecialTransport" boolean DEFAULT false NOT NULL,
    "purchaseValue" numeric(10,2),
    "replacementCost" numeric(10,2),
    "customDeposit" numeric(10,2),
    "mainImageUrl" text,
    images text[],
    specifications jsonb,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "cartAddCount" integer DEFAULT 0 NOT NULL,
    "quoteRequestCount" integer DEFAULT 0 NOT NULL,
    "orderCount" integer DEFAULT 0 NOT NULL,
    "purchasePriority" integer,
    "markedForPurchase" boolean DEFAULT false NOT NULL,
    "purchaseNotes" text,
    supplier text,
    "supplierPrice" numeric(10,2),
    "supplierUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "maintenanceRequired" boolean DEFAULT false NOT NULL,
    tags text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "availableStock" integer DEFAULT 0 NOT NULL,
    status public."ProductStatus" DEFAULT 'AVAILABLE'::public."ProductStatus" NOT NULL,
    dimensions jsonb,
    "installationComplexity" integer DEFAULT 1 NOT NULL,
    "installationCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "installationTimeMinutes" integer DEFAULT 0 NOT NULL,
    "requiresInstallation" boolean DEFAULT false NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "isPack" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO resona_user;

--
-- Name: ProductComponent; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."ProductComponent" (
    id text NOT NULL,
    "packId" text NOT NULL,
    "componentId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductComponent" OWNER TO resona_user;

--
-- Name: ProductDemandAnalytics; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."ProductDemandAnalytics" (
    id text NOT NULL,
    "productId" text NOT NULL,
    views30d integer DEFAULT 0 NOT NULL,
    "cartAdds30d" integer DEFAULT 0 NOT NULL,
    "quoteRequests30d" integer DEFAULT 0 NOT NULL,
    orders30d integer DEFAULT 0 NOT NULL,
    views90d integer DEFAULT 0 NOT NULL,
    "cartAdds90d" integer DEFAULT 0 NOT NULL,
    "quoteRequests90d" integer DEFAULT 0 NOT NULL,
    orders90d integer DEFAULT 0 NOT NULL,
    "viewToCartRate" numeric(5,2) NOT NULL,
    "cartToOrderRate" numeric(5,2) NOT NULL,
    "demandScore" numeric(10,2) NOT NULL,
    "purchaseRecommendation" boolean DEFAULT false NOT NULL,
    "lastCalculated" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductDemandAnalytics" OWNER TO resona_user;

--
-- Name: ProductInteraction; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."ProductInteraction" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text,
    "sessionId" text NOT NULL,
    type public."InteractionType" NOT NULL,
    source text,
    referrer text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductInteraction" OWNER TO resona_user;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO resona_user;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "priceType" public."PriceType" NOT NULL,
    price numeric(10,2) NOT NULL,
    "estimatedHours" numeric(5,2),
    "pricePerItem" numeric(10,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO resona_user;

--
-- Name: ShippingConfig; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."ShippingConfig" (
    id text NOT NULL,
    "localZoneMax" integer DEFAULT 10 NOT NULL,
    "localZoneRate" numeric(10,2) DEFAULT 15 NOT NULL,
    "regionalZoneMax" integer DEFAULT 30 NOT NULL,
    "regionalZoneRate" numeric(10,2) DEFAULT 30 NOT NULL,
    "extendedZoneMax" integer DEFAULT 50 NOT NULL,
    "extendedZoneRate" numeric(10,2) DEFAULT 50 NOT NULL,
    "customZoneRatePerKm" numeric(10,2) DEFAULT 1.5 NOT NULL,
    "minimumShippingCost" numeric(10,2) DEFAULT 20 NOT NULL,
    "minimumWithInstallation" numeric(10,2) DEFAULT 50 NOT NULL,
    "baseAddress" text DEFAULT 'Madrid, España'::text NOT NULL,
    "baseLatitude" numeric(10,7),
    "baseLongitude" numeric(10,7),
    "freeShippingThreshold" numeric(10,2),
    "urgentSurcharge" numeric(10,2) DEFAULT 50 NOT NULL,
    "nightSurcharge" numeric(10,2) DEFAULT 30 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShippingConfig" OWNER TO resona_user;

--
-- Name: ShippingRate; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."ShippingRate" (
    id text NOT NULL,
    name text NOT NULL,
    "basePrice" numeric(10,2) NOT NULL,
    "pricePerKm" numeric(10,2) NOT NULL,
    "pricePerKg" numeric(10,2) NOT NULL,
    "pricePerM3" numeric(10,2) NOT NULL,
    "minPrice" numeric(10,2) NOT NULL,
    "maxPrice" numeric(10,2),
    "freeAbove" numeric(10,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShippingRate" OWNER TO resona_user;

--
-- Name: SystemConfig; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."SystemConfig" (
    id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemConfig" OWNER TO resona_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    role public."UserRole" DEFAULT 'CLIENT'::public."UserRole" NOT NULL,
    address jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "acceptedTermsAt" timestamp(3) without time zone,
    "acceptedPrivacyAt" timestamp(3) without time zone,
    "termsVersion" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    metadata jsonb,
    "stripeCustomerId" text,
    "taxId" text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    "userLevel" public."UserLevel" DEFAULT 'STANDARD'::public."UserLevel" NOT NULL
);


ALTER TABLE public."User" OWNER TO resona_user;

--
-- Name: UserDiscount; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."UserDiscount" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "discountType" public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    reason text,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validTo" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserDiscount" OWNER TO resona_user;

--
-- Name: _BlogPostToBlogTag; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public."_BlogPostToBlogTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_BlogPostToBlogTag" OWNER TO resona_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: resona_user
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


ALTER TABLE public._prisma_migrations OWNER TO resona_user;

--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public.company_settings (
    id text NOT NULL,
    "companyName" text DEFAULT 'ReSona Events S.L.'::text NOT NULL,
    "ownerName" text,
    "taxId" text,
    address text,
    city text,
    "postalCode" text,
    province text,
    country text DEFAULT 'España'::text NOT NULL,
    phone text,
    email text,
    website text,
    "logoUrl" text,
    "primaryColor" text DEFAULT '#5ebbff'::text NOT NULL,
    "registryNumber" text,
    "bankAccount" text,
    "invoiceNotes" text,
    "termsConditions" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company_settings OWNER TO resona_user;

--
-- Name: order_modifications; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public.order_modifications (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "modifiedBy" text NOT NULL,
    type public."ModificationType" NOT NULL,
    reason text,
    "oldTotal" numeric(10,2) NOT NULL,
    "oldItems" jsonb,
    "oldDates" jsonb,
    "newTotal" numeric(10,2) NOT NULL,
    "newItems" jsonb,
    "newDates" jsonb,
    difference numeric(10,2) NOT NULL,
    "stripePaymentId" text,
    "stripeRefundId" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "itemsAdded" jsonb,
    "itemsRemoved" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone
);


ALTER TABLE public.order_modifications OWNER TO resona_user;

--
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: resona_user
--

CREATE TABLE public.product_specifications (
    id text NOT NULL,
    "productId" text NOT NULL,
    specs json,
    power text,
    connectivity text,
    compatibility text,
    materials text,
    warranty text,
    frequency text,
    sensitivity text,
    impedance text,
    "maxSPL" text,
    resolution text,
    brightness text,
    "colorTemp" text,
    "beamAngle" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO resona_user;

--
-- Data for Name: ApiKey; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."ApiKey" (id, name, description, key, secret, "userId", permissions, "rateLimit", "isActive", "lastUsedAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: BillingData; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."BillingData" (id, "userId", "companyName", "taxId", "taxIdType", address, "addressLine2", city, state, "postalCode", country, phone, email, "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BlogCategory; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."BlogCategory" (id, name, slug, description, color, "createdAt", "updatedAt") FROM stdin;
cmiaqrmqb0000apudy7q6xl88	Equipamiento	equipamiento	Artículos sobre equipamiento	#5ebbff	2025-11-22 20:28:33.104	2025-11-22 20:28:33.104
\.


--
-- Data for Name: BlogPost; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."BlogPost" (id, title, slug, excerpt, content, "metaTitle", "metaDescription", "metaKeywords", "featuredImage", images, "categoryId", status, "publishedAt", "scheduledFor", "authorId", views, likes, "aiGenerated", "aiPrompt", "createdAt", "updatedAt") FROM stdin;
cmiaqrmqx0002apudfaqb7c7t	Iluminación LED para eventos: ventajas y aplicaciones	iluminacion-led-para-eventos-ventajas-y-aplicaciones	Descubre las ventajas y aplicaciones de la iluminación LED en eventos, mejorando la atmósfera y la experiencia de los asistentes.	# Iluminación LED para eventos: ventajas y aplicaciones\n\n## Introducción\n\nEn el mundo de la organización de eventos, la iluminación juega un papel crucial. No solo establece el ambiente y la atmósfera del lugar, sino que también puede influir en la experiencia global de los asistentes. En los últimos años, la iluminación LED se ha convertido en la opción preferida para eventos de todos los tamaños. Este artículo explora las ventajas y aplicaciones de la iluminación LED, proporcionando información valiosa para organizadores de eventos que buscan maximizar el impacto visual de sus producciones.\n\n## Conceptos clave\n\nLa iluminación LED (Diodo Emisor de Luz) ha revolucionado la forma en que iluminamos nuestros espacios, tanto en aplicaciones domésticas como comerciales. Su popularidad se debe a varias razones, entre las que destacan su eficiencia energética, durabilidad y versatilidad.\n\n### Ventajas de la iluminación LED\n\n1. **Eficiencia energética**: Los LEDs consumen significativamente menos energía que las bombillas incandescentes o halógenas, lo que se traduce en ahorros considerables en la factura de electricidad. Esto es especialmente importante en eventos, donde la iluminación suele estar encendida durante varias horas.\n\n2. **Larga vida útil**: Los LEDs tienen una vida útil mucho más larga que las bombillas tradicionales. Mientras que una bombilla incandescente dura alrededor de 1,000 horas, un LED puede durar hasta 50,000 horas o más.\n\n3. **Bajo mantenimiento**: Debido a su larga duración y durabilidad, las luces LED requieren menos mantenimiento y reemplazo. Esto es ideal para eventos, donde el tiempo es un recurso valioso.\n\n4. **Variedad de colores y efectos**: Los LEDs están disponibles en una amplia gama de colores y pueden producir una variedad de efectos de iluminación, desde luces estáticas hasta complejas secuencias de colores.\n\n5. **Calor reducido**: A diferencia de otras fuentes de luz, los LEDs emiten muy poco calor, lo que los hace más seguros para usar en entornos donde el control de temperatura es crítico.\n\n## Recomendaciones prácticas\n\nCuando se trata de elegir iluminación LED para su evento, es importante considerar las necesidades específicas del espacio y el tipo de evento que está organizando. A continuación, se ofrecen algunas recomendaciones prácticas para sacar el máximo provecho de la iluminación LED.\n\n1. **Iluminación arquitectónica**: Utilice luces LED para resaltar características arquitectónicas del lugar, como columnas, arcos o paredes. Esto puede transformar un espacio ordinario en uno espectacular y digno de recordar.\n\n2. **Luces de escenario**: Para eventos con actuaciones en vivo, las luces LED son ideales para iluminar escenarios. Ofrecen alta luminosidad y pueden cambiar de color fácilmente para adaptarse a diferentes partes del espectáculo. Equipos como los paneles LED Chauvet DJ SlimPAR son una excelente opción para escenarios de tamaño medio.\n\n3. **Luces ambientales**: Crear un ambiente acogedor y atractivo es fácil con luces LED. Considere el uso de tiras LED para iluminar pasillos o zonas de descanso. Las tiras LED RGB pueden cambiar de color y son perfectas para ajustar la atmósfera según la temática del evento.\n\n4. **Efectos especiales**: Los LEDs son perfectos para generar efectos impresionantes, como proyecciones de patrones o juegos de luces dinámicos. Equipos como las luces LED Moving Head de ADJ pueden añadir un elemento de espectáculo a su evento.\n\n## Factores a considerar\n\nAntes de decidirse por la iluminación LED para su evento, es importante tener en cuenta varios factores que aseguraran que sus necesidades sean satisfechas de la mejor manera.\n\n1. **Tipo de evento**: Considere la naturaleza del evento. Un concierto de rock requerirá una configuración de iluminación diferente a la de una boda o una conferencia corporativa. Adapte la iluminación a la experiencia que desea proporcionar.\n\n2. **Dimensiones del espacio**: El tamaño del lugar influye directamente en la cantidad y el tipo de iluminación necesaria. Un espacio grande puede requerir más luces o luces más potentes para asegurar una cobertura adecuada.\n\n3. **Poder eléctrico disponible**: Aunque los LEDs consumen menos energía, es crucial asegurarse de que haya suficiente capacidad eléctrica en el lugar del evento para soportar todo el equipo necesario.\n\n4. **Control de iluminación**: Determine si necesita un sistema de control de iluminación avanzado para programar cambios de color o sincronizar luces con música u otros elementos del evento.\n\n## Preguntas Frecuentes\n\n**¿Qué tipo de luces LED son las más adecuadas para eventos al aire libre?**\n\nLas luces LED IP65, como los focos LED PAR, son ideales para eventos al aire libre debido a su resistencia al agua y al polvo, garantizando un rendimiento óptimo bajo diversas condiciones climáticas.\n\n**¿Cómo puedo utilizar la iluminación LED para mejorar la fotografía del evento?**\n\nLa iluminación LED proporciona una luz continua que es útil para la fotografía, especialmente en eventos como bodas. El uso de paneles LED de temperatura ajustable puede ayudar a crear una iluminación suave y uniforme, mejorando la calidad de las imágenes.\n\n**¿Se puede combinar la iluminación LED con otras tecnologías audiovisuales?**\n\nSí, la iluminación LED puede integrarse con otros equipos audiovisuales, como micrófonos Shure y altavoces JBL, para crear una experiencia audiovisual cohesiva. Muchos sistemas de control de iluminación permiten la sincronización con el sonido y el video.\n\n**¿Cuánto cuesta alquilar equipo de iluminación LED para un evento mediano?**\n\nEl costo del alquiler de iluminación LED varía según el tipo y la cantidad de equipos necesarios. Un paquete básico puede comenzar alrededor de los 500 euros, pero es recomendable obtener un presupuesto personalizado basado en las necesidades específicas del evento.\n\n## Conclusión\n\nLa iluminación LED ha transformado la manera en que se diseñan y ejecutan eventos, ofreciendo una solución eficiente, versátil y estéticamente agradable. Al comprender las ventajas y aplicaciones de las luces LED, los organizadores de eventos pueden crear experiencias memorables y visualmente impresionantes para sus asistentes. Si está considerando la iluminación LED para su próximo evento, consulte con expertos en soluciones audiovisuales como Resona Events, donde puede utilizar nuestra [calculadora de eventos](/calculadora-evento) para estimar sus necesidades, o explorar nuestra amplia variedad de [productos](/productos) para encontrar el equipo perfecto para su ocasión.\n\n---\n*Última actualización: Octubre 2023*	Iluminación LED para eventos: ventajas y aplicaciones	Descubre las ventajas y aplicaciones de la iluminación LED en eventos, mejorando la atmósfera y la experiencia de los asistentes.	iluminación LED eventos, alquiler material eventos España, ventajas iluminación LED, aplicaciones iluminación LED, equipos de iluminación para eventos, alquiler iluminación LED, eventos sostenibles España, tecnología LED para eventos	/uploads/blog/iluminacion-led-para-eventos-ventajas-y-aplicacion-1763843310959.png	\N	cmiaqrmqb0000apudy7q6xl88	PUBLISHED	2025-11-22 20:28:33.126	\N	c24d8fc9-c21a-4d53-997c-6ef025b4b636	0	0	t	OpenAI GPT-4 manual generation with DALL-E 3 image	2025-11-22 20:28:33.129	2025-11-22 20:28:33.129
\.


--
-- Data for Name: BlogTag; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."BlogTag" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
cmiaqrmqx0003apudsakr8qkh	Equipamiento	equipamiento	2025-11-22 20:28:33.129	2025-11-22 20:28:33.129
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Category" (id, name, slug, description, "imageUrl", "parentId", "isActive", featured, "sortOrder", "createdAt", "updatedAt") FROM stdin;
d89bb9ea-30cb-47ba-98f3-33dea18c07ec	Fotografía y Video	fotografia-video	Equipos profesionales de fotografía y video para eventos	\N	\N	t	f	0	2025-11-22 20:16:57.469	2025-11-22 20:16:57.469
b960c93b-a574-4c77-b681-6ef6856d0347	Comunicaciones	comunicaciones	Walkies, intercoms y sistemas de comunicación para eventos	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
d94e3282-6e39-444a-a5cf-89ec61640775	Cables y Conectores	cables-conectores	Cables de audio, video, DMX, alimentación y conectores	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
ac3dc865-dffc-41dc-a664-b876d37e7555	Efectos Especiales	efectos-especiales	Máquinas de humo, confeti, CO2, fuegos artificiales fríos	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
a11b300d-70dc-4e1d-af2b-f1f3ac5f6a38	Equipamiento DJ	equipamiento-dj	Controladoras, CDJs, platos y todo para DJs profesionales	\N	\N	t	f	0	2025-11-22 20:16:57.473	2025-11-22 20:16:57.473
252463ad-1236-4d32-ae95-9bc4dcb5b0ea	Energía y Distribución	energia-distribucion	Generadores, cuadros eléctricos y distribución de potencia	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
b7a3d039-a520-4918-b4b9-0eda2470349d	Microfonía	microfonia	Micrófonos inalámbricos, de mano, de solapa y diademas	\N	\N	t	f	0	2025-11-22 20:16:57.47	2025-11-22 20:16:57.47
3940cc0a-0c9e-4a5f-a3fe-a829b756806c	Sonido	sonido	Sistemas de sonido profesional: altavoces, amplificadores y más	\N	\N	t	f	0	2025-11-22 20:16:57.47	2025-11-22 20:16:57.47
4b7c5c2e-c33c-4cc5-85e5-940c7a30d28a	Elementos de Escenario	elementos-escenario	Tarimas, estructuras, barras y accesorios para escenarios	\N	\N	t	f	0	2025-11-22 20:16:57.473	2025-11-22 20:16:57.473
3fb618fb-6c32-448e-b781-879c895588f3	Pantallas y Proyección	pantallas-proyeccion	Pantallas LED, proyectores y sistemas de video para eventos	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
3232dbdd-897e-4d40-b856-c46b3f1c4aa3	Backline	backline	Amplificadores, baterías, teclados y backline completo	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
09c54760-f09e-41e7-be22-2886a6057f22	Mesas de Mezcla para Directo	mesas-mezcla-directo	Mesas digitales y analógicas para eventos en vivo	\N	\N	t	f	0	2025-11-22 20:16:57.47	2025-11-22 20:16:57.47
880ec675-32e5-4728-9f54-5c7970e6c18c	Iluminación	iluminacion	Equipos de iluminación profesional para eventos y espectáculos	\N	\N	t	f	0	2025-11-22 20:16:57.47	2025-11-22 20:16:57.47
8a45644e-882b-4ecd-87aa-f4eb6fa2a548	Elementos Decorativos	elementos-decorativos	Decoración para bodas, eventos corporativos y celebraciones	\N	\N	t	f	0	2025-11-22 20:16:57.473	2025-11-22 20:16:57.473
f9a6e928-427c-4989-a199-b2f0d0209bc7	Mobiliario	mobiliario	Mesas, sillas y mobiliario para eventos	\N	\N	t	f	0	2025-11-22 20:16:57.474	2025-11-22 20:16:57.474
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Coupon" (id, code, description, "discountType", "discountValue", scope, "categoryId", "productId", "userId", "minimumAmount", "maxDiscount", "usageLimit", "usageCount", "usageLimitPerUser", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CouponUsage; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."CouponUsage" (id, "couponId", "userId", "orderId", "discountApplied", "usedAt") FROM stdin;
\.


--
-- Data for Name: CustomInvoice; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."CustomInvoice" (id, "invoiceNumber", "clientName", "clientEmail", "clientPhone", "clientNIF", "clientAddress", "serviceDate", items, subtotal, "taxRate", "taxAmount", total, status, notes, "pdfUrl", "issueDate", "dueDate", "paidDate", "sentDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CustomerNote; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."CustomerNote" (id, "userId", note, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Delivery; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Delivery" (id, "orderId", "vehicleId", "driverId", "plannedDate", "actualDate", status, signature, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmailNotification; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."EmailNotification" (id, "userId", email, type, template, "orderId", subject, body, metadata, status, "sentAt", "deliveredAt", "openedAt", "clickedAt", "failedAt", "errorMessage", "sendgridId", attempts, "maxAttempts", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Favorite" (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Invoice" (id, "invoiceNumber", "orderId", "issueDate", "dueDate", subtotal, "taxAmount", total, status, "pdfUrl", "sentAt", "paidAt", "createdAt", "updatedAt", metadata, tax, "facturaeGenerated", "facturaeSeries", "facturaeUrl", "facturaeXml") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Notification" (id, "userId", type, title, message, data, read, "readAt", "emailSent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Order" (id, "orderNumber", "userId", "startDate", "endDate", "eventType", "eventLocation", attendees, "contactPerson", "contactPhone", notes, "deliveryType", "deliveryAddress", "deliveryTime", "deliveryNotes", "paymentTerm", "paymentTermAdjustment", "paymentTermPercent", subtotal, "totalBeforeAdjustment", "paymentTermDiscount", "paymentTermSurcharge", "taxAmount", total, "upfrontPaymentAmount", "upfrontPaymentDate", "upfrontPaymentStatus", "remainingPaymentAmount", "remainingPaymentDue", "remainingPaymentDate", "remainingPaymentStatus", "shippingCost", "shippingSuggested", "shippingManuallySet", "shippingNotes", "shippingDistance", "shippingWeight", "shippingVolume", "depositAmount", "depositStatus", "depositPaidAt", "depositReleasedAt", "depositRetainedAmount", "depositNotes", status, "reviewRequested", "createdAt", "updatedAt", "confirmedAt", "cancelledAt", "completedAt", "deliveredAt", "deliveryDate", "deliveryFee", "paymentStatus", tax, "totalAmount", "paidAt", "stripeCustomerId", "stripePaymentIntentId", "couponCode", "discountAmount", "discountPercentage", "cancelReason", "isModified", "lastModifiedAt", "modificationCount", "originalTotal", "refundAmount", "refundProcessedAt", "refundStatus") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, "pricePerDay", subtotal, notes, "createdAt", "updatedAt", "endDate", "pricePerUnit", "startDate", "totalPrice") FROM stdin;
\.


--
-- Data for Name: OrderNote; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."OrderNote" (id, "orderId", "userId", content, "isInternal", attachments, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderService; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."OrderService" (id, "orderId", "serviceId", quantity, price, "suggestedPrice", "manuallySet", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: Pack; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Pack" (id, name, slug, description, "imageUrl", "pricePerDay", discount, "isActive", featured, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PackItem; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."PackItem" (id, "packId", "productId", quantity) FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Payment" (id, "invoiceId", amount, currency, "stripePaymentIntentId", "stripeChargeId", "stripeCustomerId", "stripePaymentMethodId", method, status, "cardBrand", "cardLast4", "cardExpMonth", "cardExpYear", reference, metadata, "errorMessage", notes, "paidAt", "createdAt", "updatedAt", "failedAt", "orderId", "refundedAmount", "refundedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Product" (id, sku, name, slug, description, "categoryId", "pricePerDay", "pricePerWeekend", "pricePerWeek", "weekendMultiplier", "weekMultiplier", stock, "realStock", "stockStatus", "leadTimeDays", "canBuyOnDemand", weight, length, width, height, volume, "requiresSpecialTransport", "purchaseValue", "replacementCost", "customDeposit", "mainImageUrl", images, specifications, "viewCount", "cartAddCount", "quoteRequestCount", "orderCount", "purchasePriority", "markedForPurchase", "purchaseNotes", supplier, "supplierPrice", "supplierUrl", "isActive", featured, "maintenanceRequired", tags, "createdAt", "updatedAt", "availableStock", status, dimensions, "installationComplexity", "installationCost", "installationTimeMinutes", "requiresInstallation", "shippingCost", "isPack") FROM stdin;
af49d704-8821-448d-95d8-46e8a09ff8bd	CAM-SONY-A7III	Cámara Sony A7 III	camara-sony-a7iii	Cámara mirrorless full-frame perfecta para fotografía de bodas. 24.2MP, sensor BSI CMOS, grabación 4K.	d89bb9ea-30cb-47ba-98f3-33dea18c07ec	85.00	150.00	400.00	1.50	5.00	5	5	ON_DEMAND	30	t	1.20	\N	\N	\N	\N	f	\N	\N	\N	https://via.placeholder.com/400x300?text=Sony+A7+III	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:57.814	2025-11-22 20:16:57.814	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
74169d2d-3056-4e32-9b1b-d24355d47184	LENS-50MM	Objetivo Canon 50mm f/1.2	objetivo-canon-50mm	Objetivo profesional de focal fija 50mm con apertura f/1.2 para retratos espectaculares.	d89bb9ea-30cb-47ba-98f3-33dea18c07ec	45.00	80.00	200.00	1.50	5.00	8	8	ON_DEMAND	30	t	0.60	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:57.846	2025-11-22 20:16:57.846	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
5f2cfb30-5d6d-4d64-b2e5-719d0a486aa7	DRONE-DJI	Drone DJI Mavic 3 Pro	drone-dji-mavic-3-pro	Drone profesional para tomas aéreas espectaculares de bodas y eventos.	d89bb9ea-30cb-47ba-98f3-33dea18c07ec	120.00	200.00	550.00	1.50	5.00	3	3	ON_DEMAND	30	t	0.90	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:57.877	2025-11-22 20:16:57.877	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
c0ccbb14-dd1e-4c15-aca7-c1d8227005e7	LED-PANEL-1000	Panel LED 1000W Profesional	panel-led-1000w	Panel LED de alta potencia para iluminación de eventos y fotografía.	880ec675-32e5-4728-9f54-5c7970e6c18c	35.00	60.00	150.00	1.50	5.00	10	10	ON_DEMAND	30	t	3.50	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:57.893	2025-11-22 20:16:57.893	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
4d60fcda-4b95-4ecf-8c57-272583ac962b	FLASH-GODOX	Flash Godox AD600 Pro	flash-godox-ad600	Flash de estudio portátil de 600W ideal para fotografía de bodas.	880ec675-32e5-4728-9f54-5c7970e6c18c	40.00	70.00	180.00	1.50	5.00	6	6	ON_DEMAND	30	t	2.80	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:57.907	2025-11-22 20:16:57.907	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
e7f208c0-de62-4a25-a4b4-7f370702d201	SPOT-RGB	Foco RGB LED Inteligente	foco-rgb-led	Foco LED RGB con 16 millones de colores para crear ambientes únicos.	880ec675-32e5-4728-9f54-5c7970e6c18c	25.00	45.00	110.00	1.50	5.00	15	15	ON_DEMAND	30	t	2.00	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:57.922	2025-11-22 20:16:57.922	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
f280bd98-f449-487d-b57e-cfe8dc297659	SPEAKER-JBL-PRX	Altavoz JBL PRX815W	altavoz-jbl-prx815w	Altavoz profesional activo de 15" con 1500W de potencia.	3940cc0a-0c9e-4a5f-a3fe-a829b756806c	60.00	100.00	250.00	1.50	5.00	8	8	ON_DEMAND	30	t	23.00	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:57.936	2025-11-22 20:16:57.936	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
060b8cc8-e217-4911-92d4-f41d8af335f8	MIC-SHURE-SM58	Micrófono Shure SM58	microfono-shure-sm58	Micrófono vocal profesional, el estándar de la industria.	3940cc0a-0c9e-4a5f-a3fe-a829b756806c	15.00	25.00	60.00	1.50	5.00	20	20	ON_DEMAND	30	t	0.30	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:57.956	2025-11-22 20:16:57.956	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
6fa4042a-9b8c-4842-bb2a-ad7b66b7e467	MIXER-YAMAHA	Mesa de Mezclas Yamaha MG16XU	mesa-mezclas-yamaha	Mesa de mezclas de 16 canales con efectos integrados.	3940cc0a-0c9e-4a5f-a3fe-a829b756806c	50.00	85.00	210.00	1.50	5.00	4	4	ON_DEMAND	30	t	8.50	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:57.974	2025-11-22 20:16:57.974	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
dc7032e7-948d-4693-9d15-ece499c5af59	ARCO-FLORES	Arco Ceremonial con Flores	arco-ceremonial-flores	Hermoso arco ceremonial de 2.5m de altura, decorado con flores artificiales de alta calidad.	b7a3d039-a520-4918-b4b9-0eda2470349d	80.00	140.00	350.00	1.50	5.00	3	3	ON_DEMAND	30	t	15.00	250.00	200.00	50.00	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:57.996	2025-11-22 20:16:57.996	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
397cf13e-76a5-45f6-9b6a-ef1e16524ada	LETTERS-LOVE	Letras Luminosas LOVE	letras-luminosas-love	Letras gigantes iluminadas LOVE de 1.2m de altura. Perfectas para photocall.	b7a3d039-a520-4918-b4b9-0eda2470349d	70.00	120.00	300.00	1.50	5.00	2	2	ON_DEMAND	30	t	25.00	400.00	120.00	20.00	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	t	f	\N	2025-11-22 20:16:58.036	2025-11-22 20:16:58.036	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
fc117fd6-89f2-455b-a7b7-67c7e589e643	BACKDROP-WHITE	Fondo Photocall Blanco 3x2m	fondo-photocall-blanco	Fondo de tela blanca con estructura para photocall. Sistema completo con estructura de aluminio.	b7a3d039-a520-4918-b4b9-0eda2470349d	45.00	75.00	180.00	1.50	5.00	5	5	ON_DEMAND	30	t	12.00	300.00	200.00	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:58.06	2025-11-22 20:16:58.06	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
3b0f6d7e-f996-4c95-9904-6c23c6cf2367	SILLA-CHIAVARI-GOLD	Silla Chiavari Dorada (Pack 10)	silla-chiavari-dorada	Pack de 10 sillas Chiavari doradas elegantes. Incluye cojines blancos.	09c54760-f09e-41e7-be22-2886a6057f22	40.00	70.00	170.00	1.50	5.00	20	200	ON_DEMAND	30	t	35.00	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:58.085	2025-11-22 20:16:58.085	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
7cfe37ef-1745-4b62-8cf5-e87b07fea981	MESA-IMPERIAL	Mesa Imperial 3m x 1m	mesa-imperial	Mesa imperial rectangular de madera para presidencia. Capacidad para 8 personas.	09c54760-f09e-41e7-be22-2886a6057f22	55.00	95.00	230.00	1.50	5.00	6	6	ON_DEMAND	30	t	45.00	300.00	100.00	75.00	\N	f	\N	\N	\N	\N	\N	\N	0	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:58.108	2025-11-22 20:16:58.108	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
6ad89f84-5018-486c-a1b8-1f29922c605b	MESA-COCKTAIL	Mesa Cocktail Alta (Pack 5)	mesa-cocktail-alta	Pack de 5 mesas altas tipo cocktail con funda blanca. Diámetro 80cm, altura 110cm.	09c54760-f09e-41e7-be22-2886a6057f22	30.00	50.00	120.00	1.50	5.00	10	50	ON_DEMAND	30	t	40.00	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	1	0	0	0	\N	f	\N	\N	\N	\N	t	f	f	\N	2025-11-22 20:16:58.13	2025-11-24 00:10:37.717	0	AVAILABLE	\N	1	0.00	0	f	0.00	f
\.


--
-- Data for Name: ProductComponent; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."ProductComponent" (id, "packId", "componentId", quantity, "createdAt") FROM stdin;
\.


--
-- Data for Name: ProductDemandAnalytics; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."ProductDemandAnalytics" (id, "productId", views30d, "cartAdds30d", "quoteRequests30d", orders30d, views90d, "cartAdds90d", "quoteRequests90d", orders90d, "viewToCartRate", "cartToOrderRate", "demandScore", "purchaseRecommendation", "lastCalculated") FROM stdin;
\.


--
-- Data for Name: ProductInteraction; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."ProductInteraction" (id, "productId", "userId", "sessionId", type, source, referrer, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Review" (id, "userId", "productId", rating, title, comment, "isApproved", "createdAt", "updatedAt") FROM stdin;
cd78c1e4-8d9c-4dd6-bbd3-162a9d3cbead	c0cc90bb-1ec2-45bd-82cc-145e33aa35fe	060b8cc8-e217-4911-92d4-f41d8af335f8	5	\N	¡Excelente producto! Superó nuestras expectativas para nuestra boda.	f	2025-11-22 20:16:58.174	2025-11-22 20:16:58.174
094b402e-1b16-417b-ac54-9921aadb55c8	c0cc90bb-1ec2-45bd-82cc-145e33aa35fe	397cf13e-76a5-45f6-9b6a-ef1e16524ada	5	\N	¡Excelente producto! Superó nuestras expectativas para nuestra boda.	f	2025-11-22 20:16:58.202	2025-11-22 20:16:58.202
6c87dc18-7d7c-4c7c-8c8b-b8b432f1f665	c0cc90bb-1ec2-45bd-82cc-145e33aa35fe	3b0f6d7e-f996-4c95-9904-6c23c6cf2367	5	\N	¡Excelente producto! Superó nuestras expectativas para nuestra boda.	f	2025-11-22 20:16:58.293	2025-11-22 20:16:58.293
b2c68d55-d6b4-43ea-8b2c-90e40bba7144	c0cc90bb-1ec2-45bd-82cc-145e33aa35fe	4d60fcda-4b95-4ecf-8c57-272583ac962b	5	\N	¡Excelente producto! Superó nuestras expectativas para nuestra boda.	f	2025-11-22 20:16:58.326	2025-11-22 20:16:58.326
bb0819f3-e4f3-4605-a806-67d62505fc92	c0cc90bb-1ec2-45bd-82cc-145e33aa35fe	5f2cfb30-5d6d-4d64-b2e5-719d0a486aa7	5	\N	¡Excelente producto! Superó nuestras expectativas para nuestra boda.	f	2025-11-22 20:16:58.354	2025-11-22 20:16:58.354
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."Service" (id, name, description, "priceType", price, "estimatedHours", "pricePerItem", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ShippingConfig; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."ShippingConfig" (id, "localZoneMax", "localZoneRate", "regionalZoneMax", "regionalZoneRate", "extendedZoneMax", "extendedZoneRate", "customZoneRatePerKm", "minimumShippingCost", "minimumWithInstallation", "baseAddress", "baseLatitude", "baseLongitude", "freeShippingThreshold", "urgentSurcharge", "nightSurcharge", "isActive", "createdAt", "updatedAt") FROM stdin;
048bcc46-ec19-4928-9336-d1284eebafdf	10	15.00	30	30.00	50	50.00	1.50	20.00	50.00	Madrid, España	\N	\N	\N	50.00	30.00	t	2025-11-22 20:28:04.313	2025-11-22 20:28:04.313
\.


--
-- Data for Name: ShippingRate; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."ShippingRate" (id, name, "basePrice", "pricePerKm", "pricePerKg", "pricePerM3", "minPrice", "maxPrice", "freeAbove", "isActive", "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."SystemConfig" (id, key, value, "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."User" (id, email, password, "firstName", "lastName", phone, role, address, "isActive", "emailVerified", "acceptedTermsAt", "acceptedPrivacyAt", "termsVersion", "createdAt", "updatedAt", "lastLoginAt", metadata, "stripeCustomerId", "taxId", "resetToken", "resetTokenExpiry", "userLevel") FROM stdin;
c0cc90bb-1ec2-45bd-82cc-145e33aa35fe	cliente@test.com	$2b$12$tn2qu0yFZt.OvaPi.rZaCOHXYv1hF5ayxIy2bkrMJVOvG2Qh2V6jW	Cliente	Prueba	+34 600 111 222	CLIENT	\N	t	t	\N	\N	\N	2025-11-22 20:16:57.451	2025-11-24 00:10:37.203	2025-11-24 00:10:37.2	\N	\N	\N	\N	\N	STANDARD
c24d8fc9-c21a-4d53-997c-6ef025b4b636	admin@resona.com	$2b$12$Gsy3htCSWK1.3etgiLXe3.W5t3FlchFL0XFkQhwkQnBm2JOUqROdK	Admin	Resona	+34 600 000 000	ADMIN	\N	t	t	\N	\N	\N	2025-11-22 20:16:57.051	2025-11-24 00:24:40.067	2025-11-24 00:24:40.065	\N	\N	\N	\N	\N	STANDARD
\.


--
-- Data for Name: UserDiscount; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."UserDiscount" (id, "userId", "discountType", "discountValue", reason, "validFrom", "validTo", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _BlogPostToBlogTag; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public."_BlogPostToBlogTag" ("A", "B") FROM stdin;
cmiaqrmqx0002apudfaqb7c7t	cmiaqrmqx0003apudsakr8qkh
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3bd5bd4a-9b24-4dc6-8682-7e1aa0e37658	fe4ac3722327cfe5936f142828bf7368b812e89d173d6ade56da99c0a873064f	2025-11-21 15:13:33.306726+00	20251112022153_init	\N	\N	2025-11-21 15:13:30.419179+00	1
5bd84d13-43ec-4976-888a-54a2e0c9a373	de06c535fc6d4eaec16dc0d0f9f34c09a49bffdb59e8d017b97fd0ed823a5b2a	2025-11-21 15:13:36.590611+00	20251119033839_add_billing_data	\N	\N	2025-11-21 15:13:36.375942+00	1
e7060980-9acd-4948-9e8b-42d5245fb789	3495c28679060a338a9cf5fca356e3741c2be8c223e9982c6afdf42fa0dc19ea	2025-11-21 15:13:33.377606+00	20251112023436_add_product_status_fields	\N	\N	2025-11-21 15:13:33.322363+00	1
b9acbdd4-97cf-497c-94cd-bacd03fe77e5	4f10811a7a44a6fe10dca7c37d7342559d755155527a710e17699c6e027fa607	2025-11-21 15:13:34.204003+00	20251112181605_add_missing_models_and_fields	\N	\N	2025-11-21 15:13:33.397031+00	1
7d7df8c7-5f6e-4176-82ce-c872201e1481	c6620dcfaa118f8f48944785b11aaeb1455c20039237fc5b39b6bce1728da2f7	2025-11-21 15:13:34.76303+00	20251113014353_add_blog_models	\N	\N	2025-11-21 15:13:34.214092+00	1
7911153f-9371-413f-b5b4-5413edb4cefa	1ab8c0181f61e4235ea8487460fc29a4b0ebde35b2ef7810374670d0834d14b7	2025-11-21 15:13:36.645931+00	20251119035654_add_facturae_fields	\N	\N	2025-11-21 15:13:36.608404+00	1
27ac22f2-ba4d-49ac-93ee-18e167d28706	143768f0a5585d8a6a44e9317c0eaa71d0dad0fae9631013dec173b9792d7b07	2025-11-21 15:13:34.900973+00	20251117165543_add_shipping_and_installation_costs	\N	\N	2025-11-21 15:13:34.792872+00	1
69c713d6-3fbf-489b-a435-6b14c03e6137	734e42c705a2cd236a879803e977019ff98737c33ab64419d748189d23194313	2025-11-21 15:13:35.122669+00	20251117170558_add_shipping_configuration	\N	\N	2025-11-21 15:13:34.926749+00	1
4c1a8567-f3ba-44d7-b9b3-575b03b1989f	2b37eeba00f968d7c85d3b8543bd25729fab688a936df9190208efb3ec34995d	2025-11-21 15:13:35.298066+00	20251118012942_add_company_settings	\N	\N	2025-11-21 15:13:35.151093+00	1
e187d7d6-9b67-47a5-bf28-48c5d57020c8	e3e6987279732db79f32f4a144dfbb7fcb3f9ebb5168733bfafefe06e46d9a55	2025-11-21 15:13:36.845733+00	20251120002509_add_order_modifications	\N	\N	2025-11-21 15:13:36.668958+00	1
7d8011c0-f6a0-442a-b14d-a7f9150bf1a0	d41c5c63d1d905bf2ac2374b1ad2624b92da72176d304db5ce3731601e7b84b7	2025-11-21 15:13:35.389439+00	20251118015839_add_reset_token_fields	\N	\N	2025-11-21 15:13:35.31696+00	1
cab4fbe0-6654-425f-a5d9-776e61bdeebd	fb1b2b28cc52d144d73ff22ef59c414e163b0bd10cfcdc92bf8d519a458e07c2	2025-11-21 15:13:35.509275+00	20251118021256_add_product_specifications	\N	\N	2025-11-21 15:13:35.404457+00	1
cb1de2e4-9d5c-41d7-a52c-d569b6fd70b0	02c7351f4b2dbc254eee847c0e3c865785ace47eda4bc42235d68955e7f979eb	2025-11-21 15:13:35.575579+00	20251118025524_add_stripe_fields	\N	\N	2025-11-21 15:13:35.526957+00	1
2b1a0bbb-d72d-485f-b418-2d6822425475	d67e9ceac2c756a112585bbfe87c57a74267ebad5bfd2af7659b85bef026feee	2025-11-21 15:13:37.032916+00	add_product_components	\N	\N	2025-11-21 15:13:36.866412+00	1
7cd0b0ba-31cd-4a3c-9bee-0fd2fc168e84	8321e0fed282bcd8403c238c171825be5685dd8db0e741f17977a6aa460b2d9a	2025-11-21 15:13:35.754647+00	20251118040202_add_order_notes	\N	\N	2025-11-21 15:13:35.587865+00	1
48bd8405-dc62-4981-ac96-c12093bdc575	56fd897e5f02b7dcb39f34c051a303ffbf8c544f1b34daeca39b610ec3c5ed02	2025-11-21 15:13:36.301915+00	20251118042712_add_coupon_system	\N	\N	2025-11-21 15:13:35.775201+00	1
ff7168fc-74db-4f84-aaf7-55d26779f52c	0c111dfa20891c126431ae6ff270fda14eae78b04fc7f887461f179e7e80600c	2025-11-21 15:13:36.361533+00	20251119004446_add_user_levels	\N	\N	2025-11-21 15:13:36.311622+00	1
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public.company_settings (id, "companyName", "ownerName", "taxId", address, city, "postalCode", province, country, phone, email, website, "logoUrl", "primaryColor", "registryNumber", "bankAccount", "invoiceNotes", "termsConditions", "isActive", "createdAt", "updatedAt") FROM stdin;
5f10b82a-a1d4-4d8e-8a04-ad53882aace4	ReSona Events S.L.	Daniel Navarro Campos	\N	C/valencia n 37, 2	Xirivella	46950	Valencia	España	+34 600 123 456	info@resona.com	\N	\N	#5ebbff	\N	\N	\N	\N	t	2025-11-22 20:28:25.135	2025-11-22 20:28:25.135
\.


--
-- Data for Name: order_modifications; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public.order_modifications (id, "orderId", "modifiedBy", type, reason, "oldTotal", "oldItems", "oldDates", "newTotal", "newItems", "newDates", difference, "stripePaymentId", "stripeRefundId", "paymentStatus", "itemsAdded", "itemsRemoved", "createdAt", "processedAt") FROM stdin;
\.


--
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: resona_user
--

COPY public.product_specifications (id, "productId", specs, power, connectivity, compatibility, materials, warranty, frequency, sensitivity, impedance, "maxSPL", resolution, brightness, "colorTemp", "beamAngle", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ApiKey ApiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BillingData BillingData_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BillingData"
    ADD CONSTRAINT "BillingData_pkey" PRIMARY KEY (id);


--
-- Name: BlogCategory BlogCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BlogCategory"
    ADD CONSTRAINT "BlogCategory_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);


--
-- Name: BlogTag BlogTag_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BlogTag"
    ADD CONSTRAINT "BlogTag_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: CouponUsage CouponUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CustomInvoice CustomInvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CustomInvoice"
    ADD CONSTRAINT "CustomInvoice_pkey" PRIMARY KEY (id);


--
-- Name: CustomerNote CustomerNote_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CustomerNote"
    ADD CONSTRAINT "CustomerNote_pkey" PRIMARY KEY (id);


--
-- Name: Delivery Delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_pkey" PRIMARY KEY (id);


--
-- Name: EmailNotification EmailNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."EmailNotification"
    ADD CONSTRAINT "EmailNotification_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderNote OrderNote_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderNote"
    ADD CONSTRAINT "OrderNote_pkey" PRIMARY KEY (id);


--
-- Name: OrderService OrderService_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderService"
    ADD CONSTRAINT "OrderService_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PackItem PackItem_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."PackItem"
    ADD CONSTRAINT "PackItem_pkey" PRIMARY KEY (id);


--
-- Name: Pack Pack_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Pack"
    ADD CONSTRAINT "Pack_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductComponent ProductComponent_packId_componentId_key; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductComponent"
    ADD CONSTRAINT "ProductComponent_packId_componentId_key" UNIQUE ("packId", "componentId");


--
-- Name: ProductComponent ProductComponent_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductComponent"
    ADD CONSTRAINT "ProductComponent_pkey" PRIMARY KEY (id);


--
-- Name: ProductDemandAnalytics ProductDemandAnalytics_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductDemandAnalytics"
    ADD CONSTRAINT "ProductDemandAnalytics_pkey" PRIMARY KEY (id);


--
-- Name: ProductInteraction ProductInteraction_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductInteraction"
    ADD CONSTRAINT "ProductInteraction_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: ShippingConfig ShippingConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ShippingConfig"
    ADD CONSTRAINT "ShippingConfig_pkey" PRIMARY KEY (id);


--
-- Name: ShippingRate ShippingRate_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ShippingRate"
    ADD CONSTRAINT "ShippingRate_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (id);


--
-- Name: UserDiscount UserDiscount_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."UserDiscount"
    ADD CONSTRAINT "UserDiscount_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: order_modifications order_modifications_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public.order_modifications
    ADD CONSTRAINT order_modifications_pkey PRIMARY KEY (id);


--
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (id);


--
-- Name: ApiKey_isActive_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "ApiKey_isActive_idx" ON public."ApiKey" USING btree ("isActive");


--
-- Name: ApiKey_key_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "ApiKey_key_idx" ON public."ApiKey" USING btree (key);


--
-- Name: ApiKey_key_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "ApiKey_key_key" ON public."ApiKey" USING btree (key);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: BillingData_taxId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BillingData_taxId_idx" ON public."BillingData" USING btree ("taxId");


--
-- Name: BillingData_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BillingData_userId_idx" ON public."BillingData" USING btree ("userId");


--
-- Name: BillingData_userId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "BillingData_userId_key" ON public."BillingData" USING btree ("userId");


--
-- Name: BlogCategory_name_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "BlogCategory_name_key" ON public."BlogCategory" USING btree (name);


--
-- Name: BlogCategory_slug_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogCategory_slug_idx" ON public."BlogCategory" USING btree (slug);


--
-- Name: BlogCategory_slug_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "BlogCategory_slug_key" ON public."BlogCategory" USING btree (slug);


--
-- Name: BlogPost_authorId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogPost_authorId_idx" ON public."BlogPost" USING btree ("authorId");


--
-- Name: BlogPost_categoryId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogPost_categoryId_idx" ON public."BlogPost" USING btree ("categoryId");


--
-- Name: BlogPost_publishedAt_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogPost_publishedAt_idx" ON public."BlogPost" USING btree ("publishedAt");


--
-- Name: BlogPost_slug_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogPost_slug_idx" ON public."BlogPost" USING btree (slug);


--
-- Name: BlogPost_slug_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "BlogPost_slug_key" ON public."BlogPost" USING btree (slug);


--
-- Name: BlogPost_status_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogPost_status_idx" ON public."BlogPost" USING btree (status);


--
-- Name: BlogTag_name_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "BlogTag_name_key" ON public."BlogTag" USING btree (name);


--
-- Name: BlogTag_slug_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "BlogTag_slug_idx" ON public."BlogTag" USING btree (slug);


--
-- Name: BlogTag_slug_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "BlogTag_slug_key" ON public."BlogTag" USING btree (slug);


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: CouponUsage_couponId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "CouponUsage_couponId_idx" ON public."CouponUsage" USING btree ("couponId");


--
-- Name: CouponUsage_couponId_orderId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "CouponUsage_couponId_orderId_key" ON public."CouponUsage" USING btree ("couponId", "orderId");


--
-- Name: CouponUsage_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "CouponUsage_userId_idx" ON public."CouponUsage" USING btree ("userId");


--
-- Name: Coupon_code_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Coupon_code_idx" ON public."Coupon" USING btree (code);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Coupon_isActive_validFrom_validTo_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Coupon_isActive_validFrom_validTo_idx" ON public."Coupon" USING btree ("isActive", "validFrom", "validTo");


--
-- Name: Coupon_scope_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Coupon_scope_idx" ON public."Coupon" USING btree (scope);


--
-- Name: CustomInvoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "CustomInvoice_invoiceNumber_key" ON public."CustomInvoice" USING btree ("invoiceNumber");


--
-- Name: CustomerNote_createdBy_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "CustomerNote_createdBy_idx" ON public."CustomerNote" USING btree ("createdBy");


--
-- Name: CustomerNote_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "CustomerNote_userId_idx" ON public."CustomerNote" USING btree ("userId");


--
-- Name: Delivery_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Delivery_orderId_idx" ON public."Delivery" USING btree ("orderId");


--
-- Name: Delivery_orderId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Delivery_orderId_key" ON public."Delivery" USING btree ("orderId");


--
-- Name: Delivery_plannedDate_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Delivery_plannedDate_idx" ON public."Delivery" USING btree ("plannedDate");


--
-- Name: Delivery_status_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Delivery_status_idx" ON public."Delivery" USING btree (status);


--
-- Name: EmailNotification_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "EmailNotification_orderId_idx" ON public."EmailNotification" USING btree ("orderId");


--
-- Name: EmailNotification_sendgridId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "EmailNotification_sendgridId_key" ON public."EmailNotification" USING btree ("sendgridId");


--
-- Name: EmailNotification_status_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "EmailNotification_status_idx" ON public."EmailNotification" USING btree (status);


--
-- Name: EmailNotification_type_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "EmailNotification_type_idx" ON public."EmailNotification" USING btree (type);


--
-- Name: EmailNotification_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "EmailNotification_userId_idx" ON public."EmailNotification" USING btree ("userId");


--
-- Name: Favorite_userId_productId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON public."Favorite" USING btree ("userId", "productId");


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: Invoice_orderId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Invoice_orderId_key" ON public."Invoice" USING btree ("orderId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_read_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Notification_read_idx" ON public."Notification" USING btree (read);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: OrderItem_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderItem_startDate_endDate_idx" ON public."OrderItem" USING btree ("startDate", "endDate");


--
-- Name: OrderNote_createdAt_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderNote_createdAt_idx" ON public."OrderNote" USING btree ("createdAt");


--
-- Name: OrderNote_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderNote_orderId_idx" ON public."OrderNote" USING btree ("orderId");


--
-- Name: OrderNote_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderNote_userId_idx" ON public."OrderNote" USING btree ("userId");


--
-- Name: OrderService_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "OrderService_orderId_idx" ON public."OrderService" USING btree ("orderId");


--
-- Name: Order_orderNumber_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Order_orderNumber_idx" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Order_paymentStatus_idx" ON public."Order" USING btree ("paymentStatus");


--
-- Name: Order_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Order_startDate_endDate_idx" ON public."Order" USING btree ("startDate", "endDate");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON public."Order" USING btree ("stripePaymentIntentId");


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: PackItem_packId_productId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "PackItem_packId_productId_key" ON public."PackItem" USING btree ("packId", "productId");


--
-- Name: Pack_slug_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Pack_slug_idx" ON public."Pack" USING btree (slug);


--
-- Name: Pack_slug_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Pack_slug_key" ON public."Pack" USING btree (slug);


--
-- Name: Payment_invoiceId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Payment_invoiceId_idx" ON public."Payment" USING btree ("invoiceId");


--
-- Name: Payment_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Payment_orderId_idx" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON public."Payment" USING btree ("stripePaymentIntentId");


--
-- Name: ProductComponent_componentId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "ProductComponent_componentId_idx" ON public."ProductComponent" USING btree ("componentId");


--
-- Name: ProductComponent_packId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "ProductComponent_packId_idx" ON public."ProductComponent" USING btree ("packId");


--
-- Name: ProductDemandAnalytics_productId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "ProductDemandAnalytics_productId_key" ON public."ProductDemandAnalytics" USING btree ("productId");


--
-- Name: ProductInteraction_createdAt_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "ProductInteraction_createdAt_idx" ON public."ProductInteraction" USING btree ("createdAt");


--
-- Name: ProductInteraction_productId_type_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "ProductInteraction_productId_type_idx" ON public."ProductInteraction" USING btree ("productId", type);


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_isActive_featured_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Product_isActive_featured_idx" ON public."Product" USING btree ("isActive", featured);


--
-- Name: Product_isPack_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Product_isPack_idx" ON public."Product" USING btree ("isPack");


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Product_slug_idx" ON public."Product" USING btree (slug);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Product_stockStatus_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Product_stockStatus_idx" ON public."Product" USING btree ("stockStatus");


--
-- Name: Review_productId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");


--
-- Name: Review_userId_productId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "Review_userId_productId_key" ON public."Review" USING btree ("userId", "productId");


--
-- Name: SystemConfig_key_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "SystemConfig_key_key" ON public."SystemConfig" USING btree (key);


--
-- Name: UserDiscount_isActive_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "UserDiscount_isActive_idx" ON public."UserDiscount" USING btree ("isActive");


--
-- Name: UserDiscount_userId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "UserDiscount_userId_idx" ON public."UserDiscount" USING btree ("userId");


--
-- Name: UserDiscount_userId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "UserDiscount_userId_key" ON public."UserDiscount" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_stripeCustomerId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "User_stripeCustomerId_idx" ON public."User" USING btree ("stripeCustomerId");


--
-- Name: _BlogPostToBlogTag_AB_unique; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "_BlogPostToBlogTag_AB_unique" ON public."_BlogPostToBlogTag" USING btree ("A", "B");


--
-- Name: _BlogPostToBlogTag_B_index; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "_BlogPostToBlogTag_B_index" ON public."_BlogPostToBlogTag" USING btree ("B");


--
-- Name: order_modifications_createdAt_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "order_modifications_createdAt_idx" ON public.order_modifications USING btree ("createdAt");


--
-- Name: order_modifications_modifiedBy_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "order_modifications_modifiedBy_idx" ON public.order_modifications USING btree ("modifiedBy");


--
-- Name: order_modifications_orderId_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX "order_modifications_orderId_idx" ON public.order_modifications USING btree ("orderId");


--
-- Name: order_modifications_type_idx; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE INDEX order_modifications_type_idx ON public.order_modifications USING btree (type);


--
-- Name: product_specifications_productId_key; Type: INDEX; Schema: public; Owner: resona_user
--

CREATE UNIQUE INDEX "product_specifications_productId_key" ON public.product_specifications USING btree ("productId");


--
-- Name: ApiKey ApiKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BillingData BillingData_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BillingData"
    ADD CONSTRAINT "BillingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogPost BlogPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BlogPost BlogPost_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."BlogCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CouponUsage CouponUsage_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponUsage CouponUsage_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CouponUsage CouponUsage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Coupon Coupon_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Coupon Coupon_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Coupon Coupon_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CustomerNote CustomerNote_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CustomerNote"
    ADD CONSTRAINT "CustomerNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomerNote CustomerNote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."CustomerNote"
    ADD CONSTRAINT "CustomerNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Delivery Delivery_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Delivery"
    ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailNotification EmailNotification_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."EmailNotification"
    ADD CONSTRAINT "EmailNotification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailNotification EmailNotification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."EmailNotification"
    ADD CONSTRAINT "EmailNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Favorite Favorite_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderNote OrderNote_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderNote"
    ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderNote OrderNote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderNote"
    ADD CONSTRAINT "OrderNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderService OrderService_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderService"
    ADD CONSTRAINT "OrderService_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderService OrderService_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."OrderService"
    ADD CONSTRAINT "OrderService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PackItem PackItem_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."PackItem"
    ADD CONSTRAINT "PackItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES public."Pack"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PackItem PackItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."PackItem"
    ADD CONSTRAINT "PackItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductComponent ProductComponent_componentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductComponent"
    ADD CONSTRAINT "ProductComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductComponent ProductComponent_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductComponent"
    ADD CONSTRAINT "ProductComponent_packId_fkey" FOREIGN KEY ("packId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductDemandAnalytics ProductDemandAnalytics_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductDemandAnalytics"
    ADD CONSTRAINT "ProductDemandAnalytics_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductInteraction ProductInteraction_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."ProductInteraction"
    ADD CONSTRAINT "ProductInteraction_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserDiscount UserDiscount_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."UserDiscount"
    ADD CONSTRAINT "UserDiscount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BlogPostToBlogTag _BlogPostToBlogTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."_BlogPostToBlogTag"
    ADD CONSTRAINT "_BlogPostToBlogTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."BlogPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BlogPostToBlogTag _BlogPostToBlogTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public."_BlogPostToBlogTag"
    ADD CONSTRAINT "_BlogPostToBlogTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."BlogTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_modifications order_modifications_modifiedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public.order_modifications
    ADD CONSTRAINT "order_modifications_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_modifications order_modifications_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public.order_modifications
    ADD CONSTRAINT "order_modifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_specifications product_specifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: resona_user
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: resona_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict OF9tTYqE1u3feS1XSAe2CwpMdRRQwwhnc2FVXTRJ1BKYPRweGSYxGYUq0hMUKaH

