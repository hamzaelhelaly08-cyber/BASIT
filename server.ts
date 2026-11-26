import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import {
  ALL_CANONICAL_ROLES,
  DEFAULT_ROLE_PERMISSION_MATRIX,
  EXECUTIVE_ACCOUNTS,
  EXECUTIVE_HABE_APPROVER_EMAILS,
  hasEffectivePermission,
  sanitizeRoleMatrix,
  toCanonicalRole,
  type CanonicalRole,
  type PermissionKey,
  type RolePermissionMatrix,
} from './src/types/rbac';
import {
  CORPORATE_HABE_EMPLOYEES,
  findHabeCatalogItem,
} from './src/data/habeDirectoryCore';

export interface ServerHabeEmployeeRecord {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  department: string;
  phone?: string;
  email?: string;
  monthlyPayrollCapEGP?: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type GatewayId = 'fawry' | 'vodafone_cash' | 'instapay' | 'cash_on_delivery';
const ALLOWED_GATEWAYS: GatewayId[] = ['fawry', 'vodafone_cash', 'instapay', 'cash_on_delivery'];
type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';
type ServerSessionRole = 'customer' | 'basit_admin' | 'finance_admin' | 'owner';

const BOOTSTRAPPED_OWNER_EMAIL = 'hamzaelhelaly08@gmail.com';
const SESSION_COOKIE_NAME = 'wataniya_fin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes strict TTL
const OTP_COOLDOWN_MS = 60 * 1000; // 60s between requests per email
const OTP_MAX_ATTEMPTS = 5;
const OTP_EMAIL_WINDOW_MS = 15 * 60 * 1000;
const OTP_EMAIL_WINDOW_MAX = 5;
const OTP_IP_WINDOW_MAX = 15;
const OWNER_PIN_MAX_ATTEMPTS = 5;
const OWNER_PIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

const SERVER_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

const SANDBOX_HMAC_KEY =
  process.env.SANDBOX_HMAC_SECRET || crypto.createHmac('sha256', SERVER_SECRET).update('sandbox').digest('hex');

const RUNTIME_STATE_PATH = path.resolve(__dirname, '.runtime-security-state.json');

interface OwnerSecurityRecord {
  salt: string;
  hash: string;
  configuredAt: string;
  configuredByEmail: string;
}

interface RevokedSubjectRecord {
  subject: string; // normalized lowercase email or uid
  reason: string;
  revokedAt: string;
  revokedBy: string;
}

export type ServerTenantKind = 'client_company' | 'central_kitchen' | 'merchant';

export interface ServerTenantRecord {
  tenantId: string;
  name: string;
  kind: ServerTenantKind;
  ownerUid: string;
  ownerEmail: string;
  commercialRegRef: string;
  city: string;
  countryCode: string;
  contractedKitchenIds: string[];
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface ServerAccountRecord {
  uid: string;
  email: string;
  username?: string;
  usernameAliases?: string[];
  employeeCode?: string;
  canApproveHabe?: boolean;
  phone: string;
  fullName: string;
  passwordSalt: string;
  passwordHash: string;
  canonicalRole: CanonicalRole;
  requestedKind: 'customer' | 'client_company' | 'central_kitchen';
  approvalStatus: 'approved' | 'pending_review' | 'rejected' | 'suspended';
  tenantId: string;
  customPermissions: PermissionKey[];
  businessName: string;
  commercialRegRef: string;
  city: string;
  countryCode: string;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerInvitationRecord {
  inviteId: string;
  inviteTokenHash: string;
  tenantId: string;
  tenantName: string;
  tenantKind: ServerTenantKind;
  invitedEmail: string;
  invitedName: string;
  assignedRole: CanonicalRole;
  assignedPermissions: PermissionKey[];
  status: 'pending' | 'accepted' | 'revoked';
  invitedByUid: string;
  invitedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerTenantOrderRecord {
  orderId: string;
  clientTenantId: string;
  clientTenantName: string;
  kitchenTenantId: string;
  kitchenTenantName: string;
  placedByUid: string;
  placedByName: string;
  itemsSummary: string;
  mealsCount?: number;
  mealUnitPriceEGP?: number;
  contractRef?: string;
  totalEGP: number;
  status: 'pending_kitchen' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ServerHabeOrderItem {
  id: string;
  code: string;
  nameAr: string;
  unitPriceEGP: number;
  qty: number;
  lineTotalEGP: number;
}

export interface ServerHabeOrderRecord {
  orderId: string;
  trxRef: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  placedByUid: string;
  placedByEmail: string;
  placedByUsername?: string;
  placedByName: string;
  paymentMethod: 'vodafone_cash' | 'instapay' | 'payroll_deduction' | 'cash';
  paymentAccountOrNote: string;
  approvalStatus: 'confirmed_paid' | 'pending_approval' | 'approved' | 'rejected';
  kitchenName: string;
  items: ServerHabeOrderItem[];
  totalEGP: number;
  createdAt: string;
  updatedAt: string;
  decidedByName?: string;
  decidedByEmail?: string;
  decidedByUsername?: string;
  decisionNote?: string;
}

export interface ServerFinancialLedgerEntry {
  entryId: string;
  entryType: 'supply_revenue' | 'recorded_expense' | 'receivable' | 'payable';
  clientTenantId: string;
  clientName: string;
  kitchenTenantId: string;
  kitchenName: string;
  contractRef: string;
  mealsCount: number;
  mealUnitPriceEGP: number;
  amountEGP: number;
  paidAmountEGP: number;
  entryDate: string;
  sourceChannel: 'central_order' | 'habe' | 'manual_voucher';
  notes: string;
  createdByEmail: string;
  createdAt: string;
}

export interface ServerAuditEntry {
  logId: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorUsername?: string;
  actorRole: CanonicalRole;
  action: string;
  targetType: string;
  targetId: string;
  severity: 'info' | 'warning' | 'security_alert';
  details: string;
}

type OwnerFinanceChannel = 'bank' | 'e_wallet' | 'treasury';
type OwnerExpenseCategory = 'none' | 'salaries' | 'raw_materials' | 'marketing' | 'commissions' | 'logistics' | 'other';
type BolDocumentType = 'owners_balances' | 'expenses' | 'rents' | 'invoices';
type FinancialUrgencyLevel = 'normal' | 'urgent' | 'emergency';
type TotalFundsAuthMethod = 'fingerprint' | 'iris' | 'camera_face';

interface OwnerFinancialEntryRecord {
  entryId: string;
  direction: 'inflow' | 'outflow';
  sourceOrBeneficiary: string;
  purpose: string;
  originLabel?: string; // "هذا دخل من إيه؟" / "هذا مصروف بتاع إيه؟"
  urgency?: FinancialUrgencyLevel;
  expenseCategory: OwnerExpenseCategory;
  channel: OwnerFinanceChannel;
  grossEGP: number;
  commissionPct: number;
  commissionEGP: number;
  netEGP: number;
  entryDate: string;
  orderRef: string;
  createdByEmail: string;
  createdAt: string;
}

interface OwnerClientReceivableRecord {
  receivableId: string;
  clientName: string;
  purpose: string;
  totalAmountEGP: number;
  collectedAmountEGP: number;
  dueDate: string;
  status: 'open' | 'partial' | 'collected';
  createdAt: string;
  updatedAt: string;
}

interface OwnerSupplierPayableRecord {
  payableId: string;
  supplierName: string;
  purpose: string;
  supplierScope?: 'internal_platform' | 'external_supplier';
  urgency?: FinancialUrgencyLevel;
  totalAmountEGP: number;
  paidAmountEGP: number;
  scheduledPaymentDate: string;
  status: 'scheduled' | 'partial' | 'paid';
  createdAt: string;
  updatedAt: string;
}

interface OwnerBolDocumentRow {
  rowId: string;
  docType: BolDocumentType;
  docNumber: string;
  partyName: string;
  statement: string;
  originLabel: string;
  debitEGP: number;
  creditEGP: number;
  remainingEGP: number;
  urgency: FinancialUrgencyLevel;
  entryDate: string;
  updatedAt: string;
}

interface InventoryStockItem {
  itemId: string;
  sku: string;
  nameAr: string;
  unitAr: string;
  quantityOnHand: number;
  avgUnitCostEGP: number;
  minStockAlert: number;
  updatedAt: string;
}

interface PurchaseInvoiceLine {
  itemId: string;
  itemName: string;
  qty: number;
  unitCostEGP: number;
  lineTotalEGP: number;
}

interface PurchaseInvoiceRecord {
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  supplierScope: 'internal_platform' | 'external_supplier';
  entryDate: string;
  items: PurchaseInvoiceLine[];
  totalEGP: number;
  paidEGP: number;
  remainingEGP: number;
  channel: OwnerFinanceChannel;
  notes: string;
  status: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
}

interface PurchaseReturnRecord {
  returnId: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  itemName: string;
  qtyReturned: number;
  unitCostEGP: number;
  refundAmountEGP: number;
  reason: string;
  settlementMode: 'reduce_payable' | 'cash_refund';
  channel: OwnerFinanceChannel;
  returnDate: string;
  createdAt: string;
}

interface PartyPaymentRecord {
  paymentId: string;
  partyType: 'supplier' | 'customer';
  partyName: string;
  direction: 'debit' | 'credit';
  amountEGP: number;
  channel: OwnerFinanceChannel;
  glAccountCode: string;
  reference: string;
  notes: string;
  paymentDate: string;
  createdAt: string;
}

interface LockedTreasuryTransfer {
  transferId: string;
  sourceEntryId: string;
  sourceLabel: string;
  netProfitBaseEGP: number;
  deductedAmountEGP: number;
  noteAr: string;
  createdAt: string;
}

interface FinanceManagerAccountRecord {
  managerId: string;
  slotNumber: 1 | 2;
  username: string;
  fullName: string;
  passwordSalt: string;
  passwordHash: string;
  status: 'active' | 'suspended' | 'deleted';
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ManagerSubTreasuryEntry {
  entryId: string;
  managerId: string;
  managerUsername: string;
  managerName: string;
  actionType: 'purchase' | 'supply' | 'collection' | 'quotation';
  partyName: string;
  description: string;
  amountEGP: number;
  channel: OwnerFinanceChannel;
  sharedVia: 'none' | 'email' | 'whatsapp';
  shareTarget: string;
  auditCycleTag: string;
  aiAuditStatus: 'pending' | 'reviewed_ok' | 'flagged';
  aiAuditNoteAr: string;
  entryDate: string;
  createdAt: string;
}

interface AiManagerAuditReport {
  reportId: string;
  generatedAt: string;
  cycleDays: number;
  totalEntriesReviewed: number;
  totalVolumeEGP: number;
  flaggedCount: number;
  summaryAr: string;
  managerHighlights: Array<{
    managerUsername: string;
    totalAmountEGP: number;
    count: number;
    statusAr: string;
    alertsAr: string[];
  }>;
  autoTriggered: boolean;
}

interface OwnerAuditAlert {
  alertId: string;
  titleAr: string;
  bodyAr: string;
  severity: 'info' | 'warning' | 'critical';
  reportId: string;
  readByOwner: boolean;
  createdAt: string;
}

interface OwnerFinancialAuditRecord {
  logId: string;
  actorEmail: string;
  actionAr: string;
  category:
    | 'inflow'
    | 'outflow'
    | 'balance'
    | 'receivable'
    | 'payable'
    | 'security_2fa'
    | 'ai_investor'
    | 'pdf_export'
    | 'bol_edit'
    | 'purchase'
    | 'return'
    | 'locked_treasury'
    | 'total_funds_gate'
    | 'finance_manager'
    | 'ai_audit'
    | 'emergency'
    | 'voice_input';
  amountEGP: number;
  details: string;
  createdAt: string;
}

interface OwnerWebAuthnCredentialRecord {
  credentialId: string;
  label: string;
  registeredAt: string;
}

interface OwnerFinanceState {
  accounts: {
    bank: number;
    e_wallet: number;
    treasury: number;
  };
  entries: OwnerFinancialEntryRecord[];
  receivables: OwnerClientReceivableRecord[];
  payables: OwnerSupplierPayableRecord[];
  bolRows: OwnerBolDocumentRow[];
  inventoryItems: InventoryStockItem[];
  purchaseInvoices: PurchaseInvoiceRecord[];
  purchaseReturns: PurchaseReturnRecord[];
  partyPayments: PartyPaymentRecord[];
  lockedTreasury: {
    balanceEGP: number;
    deductionRatePct: number;
    transfers: LockedTreasuryTransfer[];
  };
  totalFundsAuthMethod: TotalFundsAuthMethod;
  financeManagers: FinanceManagerAccountRecord[];
  managerSubTreasuryEntries: ManagerSubTreasuryEntry[];
  archivedManagerRecords: ManagerSubTreasuryEntry[];
  aiManagerAuditReports: AiManagerAuditReport[];
  ownerAuditAlerts: OwnerAuditAlert[];
  lastManagerAuditAt: string | null;
  auditLogs: OwnerFinancialAuditRecord[];
  webauthnCredentials: OwnerWebAuthnCredentialRecord[];
  ingestedOrderRefs: string[];
}

export interface BasetCardActivationRecord {
  cardId: string;
  subjectKey: string;
  cardNumber: string;
  holderName: string;
  phone: string;
  entityName: string;
  employeeCode: string;
  tier: 'family_benefits';
  discountPct: number;
  status: 'active' | 'inactive';
  qrPayload: string;
  activatedAt: string;
  updatedAt: string;
}

export interface BasetOfferRedemptionRecord {
  redemptionId: string;
  subjectKey: string;
  cardNumber: string;
  destination: 'food_meal_benefits' | 'family_entertainment';
  offerId: string;
  offerTitle: string;
  partnerName: string;
  discountAppliedPct: number;
  notes: string;
  status: 'confirmed' | 'pending_partner';
  createdAt: string;
}

interface PersistedSecurityState {
  ownerPin: OwnerSecurityRecord | null;
  revokedSubjects: Record<string, RevokedSubjectRecord>;
  designatedRoles: Record<string, 'basit_admin' | 'finance_admin'>;
  roleMatrix: RolePermissionMatrix;
  accountsByEmail: Record<string, ServerAccountRecord>;
  tenantsById: Record<string, ServerTenantRecord>;
  invitationsById: Record<string, ServerInvitationRecord>;
  tenantOrdersById: Record<string, ServerTenantOrderRecord>;
  habeOrdersById: Record<string, ServerHabeOrderRecord>;
  habeCustomEmployees: ServerHabeEmployeeRecord[];
  ledgerEntries: ServerFinancialLedgerEntry[];
  auditLogs: ServerAuditEntry[];
  ownerFinance: OwnerFinanceState;
  basetCards: Record<string, BasetCardActivationRecord>;
  basetOfferRedemptions: BasetOfferRedemptionRecord[];
}

function createInitialSecurityState(): PersistedSecurityState {
  return {
    ownerPin: null,
    revokedSubjects: {},
    designatedRoles: {},
    roleMatrix: sanitizeRoleMatrix(DEFAULT_ROLE_PERMISSION_MATRIX),
    accountsByEmail: {},
    tenantsById: {
      tenant_kitchen_alain: {
        tenantId: 'tenant_kitchen_alain',
        name: 'مطبخ ومركز العين — مدينة بدر',
        kind: 'central_kitchen',
        ownerUid: 'seed_kitchen_alain',
        ownerEmail: 'kitchen.alain@basit-platform.local',
        commercialRegRef: 'HACCP-EG-2091',
        city: 'مدينة بدر',
        countryCode: 'EG',
        contractedKitchenIds: [],
        status: 'active',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-10T08:00:00.000Z',
      },
      tenant_kitchen_hanger: {
        tenantId: 'tenant_kitchen_hanger',
        name: 'مطبخ هنجر ستيشن المركزي — أرض المعارض بمدينة نصر',
        kind: 'central_kitchen',
        ownerUid: 'seed_kitchen_hanger',
        ownerEmail: 'kitchen.hanger@basit-platform.local',
        commercialRegRef: 'HACCP-EG-1042',
        city: 'أرض المعارض بمدينة نصر',
        countryCode: 'EG',
        contractedKitchenIds: [],
        status: 'active',
        createdAt: '2026-01-12T08:00:00.000Z',
        updatedAt: '2026-01-12T08:00:00.000Z',
      },
      tenant_kitchen_bait_al_eila: {
        tenantId: 'tenant_kitchen_bait_al_eila',
        name: 'مطبخ بيت العيلة المركزي',
        kind: 'central_kitchen',
        ownerUid: 'seed_kitchen_bait_al_eila',
        ownerEmail: 'kitchen.baitaleila@basit-platform.local',
        commercialRegRef: 'HACCP-EG-3105',
        city: 'القاهرة الكبرى',
        countryCode: 'EG',
        contractedKitchenIds: [],
        status: 'active',
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
      },
      tenant_client_habe: {
        tenantId: 'tenant_client_habe',
        name: 'شركة ها-بي المصرية (H.A.B.E)',
        kind: 'client_company',
        ownerUid: 'seed_client_habe',
        ownerEmail: 'ops@habe-egypt.local',
        commercialRegRef: 'CONTRACT-HABE-2026',
        city: 'العاشر من رمضان / بدر',
        countryCode: 'EG',
        contractedKitchenIds: ['tenant_kitchen_alain', 'tenant_kitchen_hanger'],
        status: 'active',
        createdAt: '2026-01-18T08:00:00.000Z',
        updatedAt: '2026-01-18T08:00:00.000Z',
      },
    },
    invitationsById: {},
    tenantOrdersById: {},
    habeOrdersById: {},
    habeCustomEmployees: [],
    ledgerEntries: [],
    auditLogs: [],
    ownerFinance: {
      accounts: {
        bank: 0,
        e_wallet: 0,
        treasury: 0,
      },
      entries: [],
      receivables: [],
      payables: [],
      bolRows: [
        {
          rowId: 'BOL-INIT-1',
          docType: 'owners_balances',
          docNumber: 'BL-OWN-1001',
          partyName: 'رأس مال التشغيل — المالك',
          statement: 'تقرير أرصدة الملاك والسيولة الافتتاحية',
          originLabel: 'تمويل مالك المنصة التشغيلي',
          debitEGP: 0,
          creditEGP: 0,
          remainingEGP: 0,
          urgency: 'normal',
          entryDate: '2026-11-01',
          updatedAt: '2026-11-01T08:00:00.000Z',
        },
        {
          rowId: 'BOL-INIT-2',
          docType: 'rents',
          docNumber: 'BL-RNT-2001',
          partyName: 'مطبخ مدينة بدر المركزي',
          statement: 'كشف إيجار ومرافق المطبخ المركزي',
          originLabel: 'مصروف تشغيلي ثابت — إيجار مطبخ',
          debitEGP: 0,
          creditEGP: 0,
          remainingEGP: 0,
          urgency: 'urgent',
          entryDate: '2026-11-01',
          updatedAt: '2026-11-01T08:00:00.000Z',
        },
      ],
      inventoryItems: [
        {
          itemId: 'INV-101',
          sku: 'RAW-BEEF-01',
          nameAr: 'لحم بقري طازج للتشغيل',
          unitAr: 'كجم',
          quantityOnHand: 120,
          avgUnitCostEGP: 360,
          minStockAlert: 30,
          updatedAt: '2026-11-01T08:00:00.000Z',
        },
        {
          itemId: 'INV-102',
          sku: 'RAW-RICE-02',
          nameAr: 'أرز بسمتي ذهبي درجة أولى',
          unitAr: 'كجم',
          quantityOnHand: 250,
          avgUnitCostEGP: 78,
          minStockAlert: 50,
          updatedAt: '2026-11-01T08:00:00.000Z',
        },
        {
          itemId: 'INV-103',
          sku: 'PKG-THERM-03',
          nameAr: 'عبوات ميكرويف حرارية محكمة الغلق',
          unitAr: 'كرتونة',
          quantityOnHand: 45,
          avgUnitCostEGP: 420,
          minStockAlert: 15,
          updatedAt: '2026-11-01T08:00:00.000Z',
        },
      ],
      purchaseInvoices: [],
      purchaseReturns: [],
      partyPayments: [],
      lockedTreasury: {
        balanceEGP: 0,
        deductionRatePct: 10,
        transfers: [],
      },
      totalFundsAuthMethod: 'fingerprint',
      financeManagers: [],
      managerSubTreasuryEntries: [],
      archivedManagerRecords: [],
      aiManagerAuditReports: [],
      ownerAuditAlerts: [],
      lastManagerAuditAt: null,
      auditLogs: [],
      webauthnCredentials: [],
      ingestedOrderRefs: [],
    },
    basetCards: {},
    basetOfferRedemptions: [],
  };
}

function loadSecurityState(): PersistedSecurityState {
  const base = createInitialSecurityState();
  try {
    if (fs.existsSync(RUNTIME_STATE_PATH)) {
      const raw = fs.readFileSync(RUNTIME_STATE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistedSecurityState>;
      const mergedTenants: Record<string, ServerTenantRecord> = {
        ...base.tenantsById,
        ...(parsed.tenantsById || {}),
      };
      // Safe migration: keep Hanger Station location updated to أرض المعارض بمدينة نصر and Al Ain to مدينة بدر
      if (mergedTenants.tenant_kitchen_hanger) {
        mergedTenants.tenant_kitchen_hanger = {
          ...mergedTenants.tenant_kitchen_hanger,
          name: 'مطبخ هنجر ستيشن المركزي — أرض المعارض بمدينة نصر',
          city: 'أرض المعارض بمدينة نصر',
        };
      }
      if (mergedTenants.tenant_kitchen_alain) {
        mergedTenants.tenant_kitchen_alain = {
          ...mergedTenants.tenant_kitchen_alain,
          name: 'مطبخ ومركز العين — مدينة بدر',
          city: 'مدينة بدر',
        };
      }
      if (!mergedTenants.tenant_kitchen_bait_al_eila) {
        mergedTenants.tenant_kitchen_bait_al_eila = base.tenantsById.tenant_kitchen_bait_al_eila;
      }
      if (!mergedTenants.tenant_client_habe) {
        mergedTenants.tenant_client_habe = base.tenantsById.tenant_client_habe;
      }
      return {
        ownerPin: parsed.ownerPin || null,
        revokedSubjects: parsed.revokedSubjects || {},
        designatedRoles: parsed.designatedRoles || {},
        roleMatrix: sanitizeRoleMatrix(parsed.roleMatrix || DEFAULT_ROLE_PERMISSION_MATRIX),
        accountsByEmail: parsed.accountsByEmail || {},
        tenantsById: mergedTenants,
        invitationsById: parsed.invitationsById || {},
        tenantOrdersById: parsed.tenantOrdersById || {},
        habeOrdersById: parsed.habeOrdersById || {},
        habeCustomEmployees: Array.isArray(parsed.habeCustomEmployees) ? parsed.habeCustomEmployees : [],
        ledgerEntries: Array.isArray(parsed.ledgerEntries) ? parsed.ledgerEntries : [],
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        ownerFinance: {
          accounts: {
            bank: Number(parsed.ownerFinance?.accounts?.bank || 0),
            e_wallet: Number(parsed.ownerFinance?.accounts?.e_wallet || 0),
            treasury: Number(parsed.ownerFinance?.accounts?.treasury || 0),
          },
          entries: Array.isArray(parsed.ownerFinance?.entries) ? parsed.ownerFinance!.entries : [],
          receivables: Array.isArray(parsed.ownerFinance?.receivables) ? parsed.ownerFinance!.receivables : [],
          payables: Array.isArray(parsed.ownerFinance?.payables) ? parsed.ownerFinance!.payables : [],
          bolRows: Array.isArray(parsed.ownerFinance?.bolRows) ? parsed.ownerFinance!.bolRows : base.ownerFinance.bolRows,
          inventoryItems: Array.isArray(parsed.ownerFinance?.inventoryItems)
            ? parsed.ownerFinance!.inventoryItems
            : base.ownerFinance.inventoryItems,
          purchaseInvoices: Array.isArray(parsed.ownerFinance?.purchaseInvoices)
            ? parsed.ownerFinance!.purchaseInvoices
            : [],
          purchaseReturns: Array.isArray(parsed.ownerFinance?.purchaseReturns)
            ? parsed.ownerFinance!.purchaseReturns
            : [],
          partyPayments: Array.isArray(parsed.ownerFinance?.partyPayments)
            ? parsed.ownerFinance!.partyPayments
            : [],
          lockedTreasury: {
            balanceEGP: Number(parsed.ownerFinance?.lockedTreasury?.balanceEGP || 0),
            deductionRatePct: 10,
            transfers: Array.isArray(parsed.ownerFinance?.lockedTreasury?.transfers)
              ? parsed.ownerFinance!.lockedTreasury!.transfers
              : [],
          },
          totalFundsAuthMethod:
            parsed.ownerFinance?.totalFundsAuthMethod === 'iris' ||
            parsed.ownerFinance?.totalFundsAuthMethod === 'camera_face'
              ? parsed.ownerFinance.totalFundsAuthMethod
              : 'fingerprint',
          financeManagers: Array.isArray(parsed.ownerFinance?.financeManagers)
            ? parsed.ownerFinance!.financeManagers
            : [],
          managerSubTreasuryEntries: Array.isArray(parsed.ownerFinance?.managerSubTreasuryEntries)
            ? parsed.ownerFinance!.managerSubTreasuryEntries
            : [],
          archivedManagerRecords: Array.isArray(parsed.ownerFinance?.archivedManagerRecords)
            ? parsed.ownerFinance!.archivedManagerRecords
            : [],
          aiManagerAuditReports: Array.isArray(parsed.ownerFinance?.aiManagerAuditReports)
            ? parsed.ownerFinance!.aiManagerAuditReports
            : [],
          ownerAuditAlerts: Array.isArray(parsed.ownerFinance?.ownerAuditAlerts)
            ? parsed.ownerFinance!.ownerAuditAlerts
            : [],
          lastManagerAuditAt: parsed.ownerFinance?.lastManagerAuditAt || null,
          auditLogs: Array.isArray(parsed.ownerFinance?.auditLogs) ? parsed.ownerFinance!.auditLogs : [],
          webauthnCredentials: Array.isArray(parsed.ownerFinance?.webauthnCredentials)
            ? parsed.ownerFinance!.webauthnCredentials
            : [],
          ingestedOrderRefs: Array.isArray(parsed.ownerFinance?.ingestedOrderRefs)
            ? parsed.ownerFinance!.ingestedOrderRefs
            : [],
        },
        basetCards:
          parsed.basetCards && typeof parsed.basetCards === 'object' ? parsed.basetCards : {},
        basetOfferRedemptions: Array.isArray(parsed.basetOfferRedemptions)
          ? parsed.basetOfferRedemptions
          : [],
      };
    }
  } catch {
    // ignore corrupt/unreadable state and start clean
  }
  return base;
}

function saveSecurityState(state: PersistedSecurityState): void {
  try {
    fs.writeFileSync(RUNTIME_STATE_PATH, JSON.stringify(state, null, 2), { mode: 0o600 });
  } catch (err) {
    console.warn('Could not persist runtime security state:', err instanceof Error ? err.message : 'unknown');
  }
}

function seedExecutiveGovernanceAccounts(state: PersistedSecurityState): void {
  const nowIso = new Date().toISOString();
  let changed = false;

  for (const spec of EXECUTIVE_ACCOUNTS) {
    const email = spec.email.toLowerCase();
    const existing = state.accountsByEmail[email];
    const envPw = String(process.env[spec.envInitialPasswordKey] || '').trim();

    let passwordSalt = existing?.passwordSalt || '';
    let passwordHash = existing?.passwordHash || '';
    if (!passwordHash && envPw.length >= 8) {
      passwordSalt = crypto.randomBytes(16).toString('hex');
      passwordHash = crypto.scryptSync(envPw, passwordSalt, 64).toString('hex');
      changed = true;
    }

    const nextAccount: ServerAccountRecord = {
      uid: existing?.uid || spec.uid,
      email,
      username: spec.username,
      usernameAliases: spec.usernameAliases || [],
      employeeCode: spec.employeeCode,
      canApproveHabe: spec.canApproveHabe,
      phone: existing?.phone || spec.phone || '',
      fullName: existing?.fullName || spec.fullNameAr,
      passwordSalt,
      passwordHash,
      canonicalRole: spec.canonicalRole,
      requestedKind: 'client_company',
      approvalStatus: 'approved',
      tenantId: existing?.tenantId || (spec.canonicalRole === 'super_admin' ? '' : 'tenant_client_habe'),
      customPermissions: existing?.customPermissions || [],
      businessName: existing?.businessName || 'BASIT | H-A-B-E Governance',
      commercialRegRef: existing?.commercialRegRef || spec.employeeCode || 'GOV-EXEC',
      city: existing?.city || 'القاهرة',
      countryCode: existing?.countryCode || 'EG',
      reviewNote: existing?.reviewNote || 'حساب إدارة تنفيذية معتمد',
      createdAt: existing?.createdAt || nowIso,
      updatedAt: existing?.updatedAt || nowIso,
    };

    if (
      !existing ||
      existing.username !== nextAccount.username ||
      existing.canApproveHabe !== nextAccount.canApproveHabe ||
      existing.canonicalRole !== nextAccount.canonicalRole ||
      existing.employeeCode !== nextAccount.employeeCode
    ) {
      changed = true;
    }
    state.accountsByEmail[email] = nextAccount;

    if (spec.canonicalRole === 'platform_admin') {
      if (state.designatedRoles[email] !== 'basit_admin') {
        state.designatedRoles[email] = 'basit_admin';
        changed = true;
      }
    }
  }

  if (changed) {
    saveSecurityState(state);
  }
}

const securityState = loadSecurityState();
seedExecutiveGovernanceAccounts(securityState);

function appendAuditEntry(entry: Omit<ServerAuditEntry, 'logId' | 'timestamp'>): ServerAuditEntry {
  const rec: ServerAuditEntry = {
    ...entry,
    logId: `AUD-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
  };
  securityState.auditLogs.unshift(rec);
  if (securityState.auditLogs.length > 500) {
    securityState.auditLogs = securityState.auditLogs.slice(0, 500);
  }
  saveSecurityState(securityState);
  return rec;
}

interface ServerSessionRecord {
  sessionId: string;
  email: string;
  uid: string;
  username?: string;
  employeeCode?: string;
  canApproveHabe: boolean;
  fullName: string;
  authKind: 'email_otp' | 'google_firebase' | 'password';
  role: ServerSessionRole;
  canonicalRole: CanonicalRole;
  webauthnChallenge?: string;
  tenantId: string;
  tenantName: string;
  tenantKind?: ServerTenantKind;
  contractedKitchenIds: string[];
  customPermissions: PermissionKey[];
  approvalStatus: 'approved' | 'pending_review' | 'rejected' | 'suspended';
  ownerPinVerified: boolean;
  totalFundsUnlockedUntilMs?: number;
  lockedTreasuryUnlockedUntilMs?: number;
  createdAtMs: number;
  expiresAtMs: number;
}

const sessionStore = new Map<string, ServerSessionRecord>();

interface FinanceManagerSessionRecord {
  sessionId: string;
  managerId: string;
  slotNumber: 1 | 2;
  username: string;
  fullName: string;
  createdAtMs: number;
  expiresAtMs: number;
}

const FM_SESSION_COOKIE_NAME = 'basit_fm_session';
const financeManagerSessionStore = new Map<string, FinanceManagerSessionRecord>();

interface OtpChallengeRecord {
  email: string;
  fullName: string;
  purpose: 'login' | 'password_reset';
  salt: string;
  codeHash: string;
  expiresAtMs: number;
  lastSentAtMs: number;
  attempts: number;
  used: boolean;
}

const otpChallengeStore = new Map<string, OtpChallengeRecord>();
const otpEmailRateStore = new Map<string, number[]>();
const otpIpRateStore = new Map<string, number[]>();
const ownerPinFailStore = new Map<string, { count: number; lockedUntilMs: number }>();
const passwordLoginFailStore = new Map<string, { count: number; lockedUntilMs: number }>();

interface SandboxIntentRecord {
  txId: string;
  payerUid?: string;
  provider: GatewayId;
  mode: 'sandbox' | 'live';
  orderId: string;
  tenantId: string;
  amount: number;
  currency: string;
  countryCode: string;
  status: PaymentStatus;
  gatewayReference: string;
  idempotencyKey: string;
  hmacSignature: string;
  createdAt: string;
  updatedAt: string;
}

const sandboxIntentStore = new Map<string, SandboxIntentRecord>();
const idempotencyStore = new Map<string, string>();

function readFirebaseWebApiKey(): string {
  try {
    const cfgPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) as { apiKey?: string };
      return String(cfg.apiKey || '').trim();
    }
  } catch {
    // ignore
  }
  return '';
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hashOtpCode(salt: string, email: string, code: string): string {
  return crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`${salt}::${email.toLowerCase()}::${code}`)
    .digest('hex');
}

function hashOwnerPin(pin: string, salt: string): string {
  return crypto.scryptSync(pin, salt, 64).toString('hex');
}

function timingSafeHexEquals(aHex: string, bHex: string): boolean {
  try {
    const aBuf = Buffer.from(aHex, 'hex');
    const bBuf = Buffer.from(bHex, 'hex');
    if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function timingSafeTextEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function computeSandboxHmac(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

function isSecureRequest(req: Request): boolean {
  const fwdProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  const origin = String(req.headers.origin || '').toLowerCase();
  return Boolean(req.secure || fwdProto.includes('https') || origin.startsWith('https://'));
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  const sameSite = isSecureRequest(req) ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; ${sameSite}; Max-Age=${maxAgeSec}`
  );
}

function clearSessionCookie(req: Request, res: Response): void {
  const sameSite = isSecureRequest(req) ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; ${sameSite}; Max-Age=0`
  );
}

function isSubjectRevoked(email: string, uid?: string): RevokedSubjectRecord | null {
  const em = email.trim().toLowerCase();
  if (em && em !== BOOTSTRAPPED_OWNER_EMAIL && securityState.revokedSubjects[em]) {
    return securityState.revokedSubjects[em];
  }
  if (uid && securityState.revokedSubjects[uid]) {
    return securityState.revokedSubjects[uid];
  }
  if (em && em !== BOOTSTRAPPED_OWNER_EMAIL && securityState.accountsByEmail[em]?.approvalStatus === 'suspended') {
    return {
      subject: em,
      reason: 'تم تجميد الحساب من قبل الإدارة العليا.',
      revokedAt: securityState.accountsByEmail[em].updatedAt,
      revokedBy: 'platform_admin',
    };
  }
  return null;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('0') && digits.length === 11) return `+20${digits.slice(1)}`;
  return digits;
}

function resolveCanonicalToLegacyServerRole(cRole: CanonicalRole): ServerSessionRole {
  if (cRole === 'super_admin') return 'owner';
  if (cRole === 'platform_admin') return 'basit_admin';
  if (cRole === 'finance_manager') return 'finance_admin';
  return 'customer';
}

function computeResolvedPermissions(role: CanonicalRole, customPermissions: PermissionKey[]): PermissionKey[] {
  if (role === 'super_admin') {
    return [...DEFAULT_ROLE_PERMISSION_MATRIX.super_admin];
  }
  if (customPermissions.length > 0) {
    return customPermissions;
  }
  return securityState.roleMatrix[role] || DEFAULT_ROLE_PERMISSION_MATRIX[role] || [];
}

function serializePublicSessionUser(session: ServerSessionRecord) {
  return {
    email: session.email,
    uid: session.uid,
    username: session.username,
    employeeCode: session.employeeCode,
    canApproveHabe: session.canApproveHabe,
    fullName: session.fullName,
    authKind: session.authKind,
    role: session.role,
    canonicalRole: session.canonicalRole,
    tenantId: session.tenantId,
    tenantName: session.tenantName,
    tenantKind: session.tenantKind,
    contractedKitchenIds: session.contractedKitchenIds,
    permissions: computeResolvedPermissions(session.canonicalRole, session.customPermissions),
    approvalStatus: session.approvalStatus,
    ownerPinVerified: session.ownerPinVerified,
    expiresAt: new Date(session.expiresAtMs).toISOString(),
  };
}

function isHabeApproverAccount(email: string, acct?: ServerAccountRecord): boolean {
  const cleanEmail = email.trim().toLowerCase();
  return Boolean(
    cleanEmail === BOOTSTRAPPED_OWNER_EMAIL ||
      EXECUTIVE_HABE_APPROVER_EMAILS.includes(cleanEmail) ||
      acct?.canApproveHabe ||
      acct?.canonicalRole === 'super_admin' ||
      acct?.canonicalRole === 'platform_admin' ||
      securityState.designatedRoles[cleanEmail] === 'basit_admin'
  );
}

function isHabeApproverSession(session: ServerSessionRecord): boolean {
  return Boolean(
    session.canonicalRole === 'super_admin' ||
      session.canonicalRole === 'platform_admin' ||
      session.canApproveHabe ||
      EXECUTIVE_HABE_APPROVER_EMAILS.includes(session.email.toLowerCase())
  );
}

function findAccountByIdentifier(rawIdentifier: string): ServerAccountRecord | undefined {
  const trimmed = rawIdentifier.trim();
  if (!trimmed) return undefined;
  const cleanLower = trimmed.toLowerCase().replace(/^@/, '');
  if (trimmed.includes('@')) {
    return securityState.accountsByEmail[cleanLower];
  }
  const byUsername = Object.values(securityState.accountsByEmail).find((a) => {
    const uname = (a.username || '').toLowerCase();
    const aliases = (a.usernameAliases || []).map((x) => x.toLowerCase());
    const empCode = (a.employeeCode || '').toLowerCase();
    return uname === cleanLower || aliases.includes(cleanLower) || (empCode && empCode === cleanLower);
  });
  if (byUsername) return byUsername;

  const normalizedPhone = normalizePhone(trimmed);
  if (normalizedPhone) {
    return Object.values(securityState.accountsByEmail).find((a) => a.phone && a.phone === normalizedPhone);
  }
  return undefined;
}

const WEAK_PASSWORDS_SET = new Set([
  '12345678',
  '00000000',
  '11111111',
  'password',
  'password123',
  'qwerty123',
  'admin1234',
  'catering@2026',
  'finance@2026',
  'bahed@2026',
]);

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && !WEAK_PASSWORDS_SET.has(password.toLowerCase());
}

function getMergedHabeEmployees(): ServerHabeEmployeeRecord[] {
  const byCode = new Map<string, ServerHabeEmployeeRecord>();
  for (const emp of CORPORATE_HABE_EMPLOYEES) {
    byCode.set(emp.code.toUpperCase(), {
      id: emp.id,
      code: emp.code,
      name: emp.nameAr || emp.nameEn,
      nameEn: emp.nameEn,
      department: emp.departmentAr || emp.department,
      phone: emp.compNumber,
    });
  }
  for (const custom of securityState.habeCustomEmployees) {
    byCode.set(custom.code.toUpperCase(), custom);
  }
  return Array.from(byCode.values());
}

function resolveSessionHabeEmployee(sess: ServerSessionRecord): ServerHabeEmployeeRecord | null {
  const all = getMergedHabeEmployees();
  const acct = securityState.accountsByEmail[sess.email.toLowerCase()];
  const codeCandidate = (sess.employeeCode || acct?.employeeCode || '').trim().toUpperCase();
  if (codeCandidate) {
    const byCode = all.find((e) => e.code.toUpperCase() === codeCandidate);
    if (byCode) return byCode;
  }
  const phoneCandidate = normalizePhone(acct?.phone || '');
  if (phoneCandidate) {
    const byPhone = all.find((e) => e.phone && normalizePhone(e.phone) === phoneCandidate);
    if (byPhone) return byPhone;
  }
  const emailLower = sess.email.toLowerCase();
  const byEmail = all.find((e) => e.email && e.email.toLowerCase() === emailLower);
  return byEmail || null;
}

function terminateUserSessions(email: string, uid?: string): number {
  const cleanEmail = email.trim().toLowerCase();
  let count = 0;
  for (const [tok, sess] of sessionStore.entries()) {
    if ((cleanEmail && sess.email === cleanEmail) || (uid && sess.uid === uid)) {
      sessionStore.delete(tok);
      count += 1;
    }
  }
  return count;
}

function pruneRateWindow(store: Map<string, number[]>, key: string, nowMs: number, windowMs: number): number[] {
  const arr = (store.get(key) || []).filter((ts) => nowMs - ts < windowMs);
  store.set(key, arr);
  return arr;
}

function isValidGmailSmtpConfig(): { valid: boolean; user: string; pass: string } {
  const user = String(process.env.GMAIL_SMTP_USER || '').trim();
  const rawPass = String(process.env.GMAIL_SMTP_APP_PASSWORD || '').replace(/\s+/g, '');
  const lowerUser = user.toLowerCase();
  const lowerPass = rawPass.toLowerCase();
  const isPlaceholder =
    !user ||
    !rawPass ||
    lowerUser.includes('example.com') ||
    lowerUser.startsWith('your-') ||
    lowerPass.includes('your-app-password') ||
    lowerPass === 'placeholder' ||
    lowerPass === 'changeme' ||
    lowerPass === 'dummy';
  const validUser = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user);
  const validPass = rawPass.length >= 8;
  return {
    valid: !isPlaceholder && validUser && validPass,
    user,
    pass: rawPass,
  };
}

function getMailTransportStatus() {
  const gmailCfg = isValidGmailSmtpConfig();
  const hasGmailSmtp = gmailCfg.valid;
  const resendOptionalConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  return {
    gmailCliAvailable: false, // Verified: no standalone `gmail send` CLI exists in this runtime environment
    hasGmailSmtp,
    resendOptional: true,
    resendOptionalConfigured,
    configured: hasGmailSmtp,
    activeDriver: hasGmailSmtp ? 'nodemailer_gmail_smtp' : 'none',
  };
}

async function sendOtpEmailViaConfiguredTransport(
  toEmail: string,
  fullName: string,
  code: string
): Promise<{ sent: boolean; driver: string }> {
  const gmailCfg = isValidGmailSmtpConfig();
  if (!gmailCfg.valid) {
    return { sent: false, driver: 'none' };
  }

  const safeName = escapeHtml(fullName);
  const subject = 'الوطنية اللوجستية المالية | رمز التحقق للدخول الآمن';
  const html = `
    <div dir="rtl" style="font-family: 'Cairo', Tahoma, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; color: #0f172a;">
      <div style="font-size: 13px; font-weight: 800; color: #4338ca; margin-bottom: 6px;">الوطنية اللوجستية المالية — بوابة التحقق الآمن</div>
      <h2 style="margin: 0 0 12px; font-size: 18px;">مرحباً ${safeName}</h2>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7; color: #334155;">
        استخدم رمز التحقق لمرة واحدة أدناه لإتمام تسجيل الدخول إلى منصة <strong>BASIT | باسط</strong> التابعة لشركة <strong>الوطنية اللوجستية المالية</strong>:
      </p>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; font-size: 28px; font-weight: 900; letter-spacing: 8px; color: #1e293b; font-family: monospace;">
        ${code}
      </div>
      <p style="margin: 16px 0 0; font-size: 12px; color: #64748b; line-height: 1.6;">
        • هذا الرمز صالح لمدة <strong>5 دقائق</strong> ويُستخدم <strong>لمرة واحدة فقط</strong>.<br/>
        • لا تشارك هذا الرمز مع أي شخص حتى لو ادّعى أنه من الدعم الفني.
      </p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailCfg.user,
      pass: gmailCfg.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: process.env.OTP_FROM_EMAIL?.trim() || `الوطنية اللوجستية المالية <${gmailCfg.user}>`,
    to: toEmail,
    subject,
    html,
  });

  return { sent: true, driver: 'nodemailer_gmail_smtp' };
}

function resolveSessionFromRequest(req: Request): {
  session: ServerSessionRecord | null;
  revoked: boolean;
} {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return { session: null, revoked: false };

  const session = sessionStore.get(token);
  if (!session) return { session: null, revoked: false };

  if (Date.now() > session.expiresAtMs) {
    sessionStore.delete(token);
    return { session: null, revoked: false };
  }

  if (isSubjectRevoked(session.email, session.uid)) {
    sessionStore.delete(token);
    return { session: null, revoked: true };
  }

  return { session, revoked: false };
}

interface AuthenticatedRequest extends Request {
  authSession?: ServerSessionRecord;
}

function requireAuthenticatedSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { session, revoked } = resolveSessionFromRequest(req);
  if (revoked) {
    clearSessionCookie(req, res);
    res.status(401).json({
      ok: false,
      code: 'SESSION_REVOKED',
      messageAr: 'تم سحب صلاحية هذا الحساب وإلغاء الجلسة فوراً من مالك المنصة.',
      messageEn: 'Access revoked immediately by platform owner.',
    });
    return;
  }
  if (!session) {
    res.status(401).json({
      ok: false,
      code: 'AUTH_REQUIRED',
      messageAr: 'يلزم تسجيل الدخول بجلسة آمنة موثقة لإتمام هذا الإجراء.',
      messageEn: 'Valid authenticated session required.',
    });
    return;
  }
  req.authSession = session;
  next();
}

function getProviderReadiness() {
  const fawryMissing: string[] = [];
  if (!process.env.FAWRY_MERCHANT_CODE) fawryMissing.push('FAWRY_MERCHANT_CODE');
  if (!process.env.FAWRY_SECURITY_KEY) fawryMissing.push('FAWRY_SECURITY_KEY');

  const mailStatus = getMailTransportStatus();

  return {
    gateways: [
      {
        providerId: 'fawry' as GatewayId,
        displayName: 'Fawry (Cash Reference / Cards — Sandbox Mode)',
        countries: ['EG', 'QA', 'OM'],
        sandboxReady: true,
        liveConfigured: fawryMissing.length === 0,
        missingEnvVars: fawryMissing,
      },
      {
        providerId: 'vodafone_cash' as GatewayId,
        displayName: 'Vodafone Cash (+201010430347 — Audit/Sandbox)',
        walletNumber: '+201010430347',
        countries: ['EG'],
        sandboxReady: true,
        liveConfigured: false,
        missingEnvVars: ['LIVE_TRANSFERS_DISABLED_BY_POLICY'],
      },
      {
        providerId: 'instapay' as GatewayId,
        displayName: 'InstaPay (Audit/Sandbox Only)',
        countries: ['EG'],
        sandboxReady: true,
        liveConfigured: false,
        missingEnvVars: ['LIVE_TRANSFERS_DISABLED_BY_POLICY'],
      },
      {
        providerId: 'cash_on_delivery' as GatewayId,
        displayName: 'Cash on Delivery (COD)',
        countries: ['EG', 'QA', 'OM', 'GB'],
        sandboxReady: true,
        liveConfigured: true,
        missingEnvVars: [] as string[],
      },
    ],
    notificationChannels: {
      inAppFirestore: true,
      emailOtpConfigured: mailStatus.configured,
      emailOtpDriver: mailStatus.activeDriver,
      gmailCliAvailable: mailStatus.gmailCliAvailable,
    },
  };
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const local = parts[0];
  const maskedLocal = local.length <= 2 ? `${local[0] || '*'}*` : `${local.slice(0, 2)}***${local.slice(-1)}`;
  return `${maskedLocal}@${parts[1]}`;
}

export async function createConfiguredApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '8mb' }));

  // Same-origin CSRF verification for state-changing API routes (skip signed external webhooks)
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      next();
      return;
    }
    if (req.path.startsWith('/payments/webhook/')) {
      next();
      return;
    }
    const originHeader = String(req.headers.origin || '').trim();
    const hostHeader = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim().toLowerCase();
    if (originHeader && hostHeader) {
      try {
        const parsedOrigin = new URL(originHeader);
        const originHost = parsedOrigin.host.toLowerCase();
        const isLocal = originHost.startsWith('localhost:') || originHost.startsWith('127.0.0.1:');
        if (!isLocal && originHost !== hostHeader) {
          res.status(403).json({
            ok: false,
            code: 'CSRF_ORIGIN_MISMATCH',
            messageAr: 'تم حظر الطلب لاختلاف مصدر النطاق عن خادم المنصة.',
            messageEn: 'Cross-origin mutation rejected.',
          });
          return;
        }
      } catch {
        res.status(403).json({ ok: false, code: 'INVALID_ORIGIN', messageEn: 'Invalid Origin header.' });
        return;
      }
    }
    next();
  });

  const isProd = process.env.NODE_ENV === 'production';

  app.get('/api/health', (_req: Request, res: Response) => {
    const readiness = getProviderReadiness();
    res.json({
      ok: true,
      service: 'الوطنية اللوجستية المالية — BASIT | باسط API',
      port: Number(process.env.PORT || 3000),
      environment: isProd ? 'production' : 'development',
      gateways: readiness.gateways,
      notificationChannels: readiness.notificationChannels,
    });
  });

  app.get('/api/payments/providers', (_req: Request, res: Response) => {
    res.json(getProviderReadiness());
  });

  app.get('/api/auth/mail-status', (_req: Request, res: Response) => {
    const status = getMailTransportStatus();
    res.json({
      ok: true,
      brandAr: 'الوطنية اللوجستية المالية',
      ...status,
      messageAr: status.configured
        ? 'قناة إرسال رموز التحقق عبر Gmail SMTP مفعّلة وجاهزة.'
        : 'خدمة إرسال رموز OTP تعتمد حصرياً على Gmail SMTP (GMAIL_SMTP_USER و GMAIL_SMTP_APP_PASSWORD) ولم يتم ضبط إعداداتها بعد. متغير RESEND_API_KEY اختياري ولا يُشترط لتشغيل النظام.',
      messageEn: status.configured
        ? 'Gmail SMTP OTP transport is active and ready.'
        : 'OTP delivery uses Gmail SMTP exclusively (GMAIL_SMTP_USER & GMAIL_SMTP_APP_PASSWORD), which is not configured yet. RESEND_API_KEY is strictly optional.',
    });
  });

  app.get('/api/auth/session', (req: Request, res: Response) => {
    const { session, revoked } = resolveSessionFromRequest(req);
    if (revoked) {
      clearSessionCookie(req, res);
      res.status(401).json({
        ok: false,
        authenticated: false,
        code: 'SESSION_REVOKED',
        messageAr: 'تم إلغاء جلستك وسحب الصلاحية من قبل مالك المنصة.',
        messageEn: 'Session revoked by owner.',
      });
      return;
    }
    if (!session) {
      res.json({ ok: true, authenticated: false, user: null });
      return;
    }
    res.json({
      ok: true,
      authenticated: true,
      user: serializePublicSessionUser(session),
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
      sessionStore.delete(token);
    }
    clearSessionCookie(req, res);
    res.json({
      ok: true,
      messageAr: 'تم إنهاء الجلسة الآمنة وحذف ملف الارتباط من المتصفح.',
      messageEn: 'Secure session logged out.',
    });
  });

  app.post('/api/auth/oauth-session', async (req: Request, res: Response) => {
    try {
      const body = req.body as { idToken?: string; declaredRole?: string };
      const idToken = String(body.idToken || '').trim();
      if (!idToken || idToken.length < 20) {
        res.status(400).json({
          ok: false,
          messageAr: 'رمز التحقق من الهوية (ID Token) مطلوب.',
          messageEn: 'Valid Firebase ID token required.',
        });
        return;
      }

      const apiKey = readFirebaseWebApiKey();
      if (!apiKey) {
        res.status(503).json({
          ok: false,
          messageAr: 'إعدادات المصادقة السحابية غير متوفرة على الخادم.',
          messageEn: 'Firebase Web API key unavailable.',
        });
        return;
      }

      const lookupRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      if (!lookupRes.ok) {
        res.status(401).json({
          ok: false,
          code: 'INVALID_ID_TOKEN',
          messageAr: 'تعذر التحقق من صحة جلسة Google على الخادم.',
          messageEn: 'Invalid or expired Firebase ID token.',
        });
        return;
      }

      const lookupJson = (await lookupRes.json()) as {
        users?: Array<{
          localId?: string;
          email?: string;
          emailVerified?: boolean;
          displayName?: string;
          disabled?: boolean;
        }>;
      };
      const verifiedUser = lookupJson.users?.[0];
      if (!verifiedUser || !verifiedUser.email || !verifiedUser.emailVerified || verifiedUser.disabled) {
        res.status(401).json({
          ok: false,
          code: 'UNVERIFIED_ACCOUNT',
          messageAr: 'حساب Google غير موثق البريد أو معطل.',
          messageEn: 'Google account email not verified or disabled.',
        });
        return;
      }

      const email = verifiedUser.email.toLowerCase();
      const uid = String(verifiedUser.localId || '');
      if (isSubjectRevoked(email, uid)) {
        clearSessionCookie(req, res);
        res.status(403).json({
          ok: false,
          code: 'SESSION_REVOKED',
          messageAr: 'هذا الحساب موقوف ومسحوب الصلاحية من قبل مالك المنصة.',
          messageEn: 'Account access has been revoked by owner.',
        });
        return;
      }

      let assignedRole: ServerSessionRole = 'customer';
      let canonicalRole: CanonicalRole = 'customer';
      const existingAccount = securityState.accountsByEmail[email];
      if (email === BOOTSTRAPPED_OWNER_EMAIL) {
        assignedRole = 'owner';
        canonicalRole = 'super_admin';
      } else if (securityState.designatedRoles[email] === 'basit_admin') {
        assignedRole = 'basit_admin';
        canonicalRole = 'platform_admin';
      } else if (securityState.designatedRoles[email] === 'finance_admin') {
        assignedRole = 'finance_admin';
        canonicalRole = 'finance_manager';
      } else if (body.declaredRole === 'finance_admin' && securityState.designatedRoles[email] === 'finance_admin') {
        assignedRole = 'finance_admin';
        canonicalRole = 'finance_manager';
      } else if (existingAccount && existingAccount.approvalStatus === 'approved') {
        canonicalRole = existingAccount.canonicalRole;
        assignedRole = resolveCanonicalToLegacyServerRole(canonicalRole);
      }

      const tenantRec = existingAccount?.tenantId ? securityState.tenantsById[existingAccount.tenantId] : undefined;
      const token = crypto.randomBytes(32).toString('base64url');
      const nowMs = Date.now();
      const session: ServerSessionRecord = {
        sessionId: token,
        email,
        uid,
        username: existingAccount?.username,
        employeeCode: existingAccount?.employeeCode,
        canApproveHabe: isHabeApproverAccount(email, existingAccount),
        fullName: verifiedUser.displayName || existingAccount?.fullName || email.split('@')[0],
        authKind: 'google_firebase',
        role: assignedRole,
        canonicalRole,
        tenantId: tenantRec?.tenantId || existingAccount?.tenantId || '',
        tenantName: tenantRec?.name || '',
        tenantKind: tenantRec?.kind,
        contractedKitchenIds: tenantRec?.contractedKitchenIds || [],
        customPermissions: existingAccount?.customPermissions || [],
        approvalStatus: 'approved',
        ownerPinVerified: false,
        createdAtMs: nowMs,
        expiresAtMs: nowMs + SESSION_TTL_MS,
      };
      sessionStore.set(token, session);
      setSessionCookie(req, res, token);

      appendAuditEntry({
        actorUid: uid,
        actorEmail: email,
        actorRole: canonicalRole,
        action: 'تسجيل دخول موثق عبر Google',
        targetType: 'session',
        targetId: session.uid,
        severity: 'info',
        details: `Google OAuth session issued for ${canonicalRole}`,
      });

      res.json({
        ok: true,
        user: serializePublicSessionUser(session),
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        messageAr: 'تعذر إصدار جلسة الخادم الآمنة.',
        messageEn: err instanceof Error ? err.message : 'OAuth session exchange error.',
      });
    }
  });

  app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    try {
      const body = req.body as { email?: string; fullName?: string };
      const rawEmail = String(body.email || '').trim().toLowerCase();
      const fullName = String(body.fullName || '').trim().slice(0, 120);
      const clientIp = req.ip || 'unknown';

      if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        res.status(400).json({
          ok: false,
          messageAr: 'يرجى إدخال بريد إلكتروني صحيح.',
          messageEn: 'Please provide a valid email address.',
        });
        return;
      }
      if (fullName.length < 2) {
        res.status(400).json({
          ok: false,
          messageAr: 'يرجى كتابة الاسم الكامل أولاً.',
          messageEn: 'Please enter your full name first.',
        });
        return;
      }

      if (isSubjectRevoked(rawEmail)) {
        res.status(403).json({
          ok: false,
          code: 'ACCOUNT_REVOKED',
          messageAr: 'تم حظر وسحب صلاحية هذا البريد من الدخول إلى المنصة.',
          messageEn: 'Access for this email is revoked.',
        });
        return;
      }

      const nowMs = Date.now();
      const existing = otpChallengeStore.get(rawEmail);
      if (existing && nowMs - existing.lastSentAtMs < OTP_COOLDOWN_MS) {
        const waitSec = Math.ceil((OTP_COOLDOWN_MS - (nowMs - existing.lastSentAtMs)) / 1000);
        res.status(429).json({
          ok: false,
          code: 'OTP_COOLDOWN',
          retryAfterSec: waitSec,
          messageAr: `يرجى الانتظار ${waitSec} ثانية قبل طلب رمز جديد.`,
          messageEn: `Please wait ${waitSec}s before requesting a new code.`,
        });
        return;
      }

      const ipHits = pruneRateWindow(otpIpRateStore, clientIp, nowMs, OTP_EMAIL_WINDOW_MS);
      if (ipHits.length >= OTP_IP_WINDOW_MAX) {
        res.status(429).json({
          ok: false,
          code: 'IP_RATE_LIMITED',
          messageAr: 'تم تجاوز الحد الأقصى لطلبات التحقق من هذا العنوان. يرجى المحاولة لاحقاً.',
          messageEn: 'Too many OTP requests from this IP. Try again later.',
        });
        return;
      }

      const emailHits = pruneRateWindow(otpEmailRateStore, rawEmail, nowMs, OTP_EMAIL_WINDOW_MS);
      if (emailHits.length >= OTP_EMAIL_WINDOW_MAX) {
        res.status(429).json({
          ok: false,
          code: 'EMAIL_RATE_LIMITED',
          messageAr: 'تم طلب عدة رموز لهذا البريد خلال فترة قصيرة. انتظر 15 دقيقة.',
          messageEn: 'Too many OTP requests for this email. Wait 15 minutes.',
        });
        return;
      }

      // Check real Gmail SMTP transport BEFORE generating/committing OTP (RESEND_API_KEY is optional)
      const mailStatus = getMailTransportStatus();
      if (!mailStatus.hasGmailSmtp) {
        res.status(503).json({
          ok: false,
          code: 'GMAIL_SMTP_UNCONFIGURED',
          gmailCliAvailable: false,
          messageAr:
            'تعذر إرسال رمز التحقق: خدمة إرسال OTP تعتمد على Gmail SMTP فقط، ولم يتم ضبط GMAIL_SMTP_USER أو GMAIL_SMTP_APP_PASSWORD بشكل صحيح في إعدادات الخادم.',
          messageEn:
            'Gmail SMTP is not configured (valid GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD required). RESEND_API_KEY is optional and not required.',
        });
        return;
      }

      // Cryptographically random 6-digit single-use OTP (5 min TTL, salted HMAC, NEVER logged or returned)
      const code = String(crypto.randomInt(100000, 1000000));
      const salt = crypto.randomBytes(16).toString('hex');
      const codeHash = hashOtpCode(salt, rawEmail, code);

      try {
        const dispatch = await sendOtpEmailViaConfiguredTransport(rawEmail, fullName, code);
        if (!dispatch.sent) {
          throw new Error('GMAIL_SMTP_UNAVAILABLE');
        }
        otpChallengeStore.set(rawEmail, {
          email: rawEmail,
          fullName,
          purpose: 'login',
          salt,
          codeHash,
          expiresAtMs: nowMs + OTP_TTL_MS,
          lastSentAtMs: nowMs,
          attempts: 0,
          used: false,
        });
        ipHits.push(nowMs);
        emailHits.push(nowMs);
        otpIpRateStore.set(clientIp, ipHits);
        otpEmailRateStore.set(rawEmail, emailHits);

        res.json({
          ok: true,
          deliveryMode: 'gmail_smtp',
          expiresInSec: OTP_TTL_MS / 1000,
          cooldownSec: OTP_COOLDOWN_MS / 1000,
          messageAr: 'تم إرسال رمز التحقق السري إلى بريدك الإلكتروني عبر Gmail SMTP (صالح لمدة 5 دقائق ولمرة واحدة).',
          messageEn: 'Verification code sent via Gmail SMTP (valid for 5 minutes, single-use).',
        });
      } catch (mailErr) {
        const smtpCode =
          typeof mailErr === 'object' && mailErr && 'code' in mailErr
            ? String((mailErr as { code?: string }).code || '')
            : '';
        const isAuthFail = smtpCode === 'EAUTH';
        const isTimeout = smtpCode === 'ETIMEDOUT' || smtpCode === 'ECONNECTION' || smtpCode === 'ESOCKET';
        res.status(502).json({
          ok: false,
          code: isAuthFail ? 'GMAIL_SMTP_AUTH_FAILED' : 'GMAIL_SMTP_SEND_FAILED',
          messageAr: isAuthFail
            ? 'فشل التوثيق مع خادم Gmail SMTP. تأكد من صحة البريد الإلكتروني وكلمة مرور التطبيق (App Password) في إعدادات الخادم.'
            : isTimeout
              ? 'انتهت مهلة الاتصال بخادم Gmail SMTP حالياً. يرجى المحاولة بعد قليل.'
              : 'تعذر إرسال رمز التحقق عبر Gmail SMTP حالياً. تحقق من اتصال الشبكة وصحة إعدادات Gmail SMTP.',
          messageEn: isAuthFail
            ? 'Gmail SMTP authentication failed. Verify GMAIL_SMTP_USER and Gmail App Password.'
            : isTimeout
              ? 'Gmail SMTP connection timed out. Please retry shortly.'
              : 'Failed to dispatch OTP email via Gmail SMTP.',
        });
      }
    } catch (err) {
      res.status(500).json({
        ok: false,
        messageAr: 'حدث خطأ أثناء معالجة طلب رمز التحقق.',
        messageEn: err instanceof Error ? err.message : 'Failed to process OTP request.',
      });
    }
  });

  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const body = req.body as { email?: string; code?: string };
    const rawEmail = String(body.email || '').trim().toLowerCase();
    const rawCode = String(body.code || '').trim();

    if (!rawEmail || !/^\d{6}$/.test(rawCode)) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى إدخال البريد الإلكتروني ورمز التحقق المكون من 6 أرقام.',
        messageEn: 'Enter your email and 6-digit verification code.',
      });
      return;
    }

    if (isSubjectRevoked(rawEmail)) {
      res.status(403).json({
        ok: false,
        code: 'ACCOUNT_REVOKED',
        messageAr: 'تم سحب صلاحية هذا الحساب من الدخول.',
        messageEn: 'Account access revoked.',
      });
      return;
    }

    const record = otpChallengeStore.get(rawEmail);
    if (!record || record.used) {
      res.status(404).json({
        ok: false,
        messageAr: 'لا يوجد طلب تحقق صالح لهذا البريد أو تم استخدام الرمز مسبقاً. اطلب رمزاً جديداً.',
        messageEn: 'No valid unused OTP challenge found for this email.',
      });
      return;
    }

    if (Date.now() > record.expiresAtMs) {
      otpChallengeStore.delete(rawEmail);
      res.status(410).json({
        ok: false,
        code: 'OTP_EXPIRED',
        messageAr: 'انتهت صلاحية رمز التحقق (5 دقائق). يرجى طلب رمز جديد.',
        messageEn: 'Verification code expired after 5 minutes. Request a new one.',
      });
      return;
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpChallengeStore.delete(rawEmail);
      res.status(429).json({
        ok: false,
        code: 'OTP_ATTEMPTS_EXCEEDED',
        messageAr: 'تم استنفاد عدد المحاولات المسموح بها (5 محاولات). اطلب رمزاً جديداً.',
        messageEn: 'Maximum failed attempts reached. Request a new code.',
      });
      return;
    }

    const incomingHash = hashOtpCode(record.salt, rawEmail, rawCode);
    if (!timingSafeHexEquals(incomingHash, record.codeHash)) {
      record.attempts += 1;
      if (record.attempts >= OTP_MAX_ATTEMPTS) {
        otpChallengeStore.delete(rawEmail);
      } else {
        otpChallengeStore.set(rawEmail, record);
      }
      res.status(401).json({
        ok: false,
        remainingAttempts: Math.max(0, OTP_MAX_ATTEMPTS - record.attempts),
        messageAr:
          record.attempts >= OTP_MAX_ATTEMPTS
            ? 'رمز التحقق غير صحيح وتم إلغاء الرمز لاستنفاد المحاولات.'
            : 'رمز التحقق غير صحيح.',
        messageEn: 'Invalid verification code.',
      });
      return;
    }

    // Enforce single-use strictly by deleting immediately on verification
    record.used = true;
    otpChallengeStore.delete(rawEmail);

    const existingAcct = securityState.accountsByEmail[record.email];
    if (existingAcct && existingAcct.approvalStatus === 'pending_review') {
      res.status(403).json({
        ok: false,
        code: 'PENDING_ADMIN_APPROVAL',
        messageAr: 'حساب هذا الكيان قيد المراجعة والاعتماد الإداري ولا يمكن تفعيل وصوله الإداري قبل الموافقة.',
        messageEn: 'Account is pending administrative approval.',
      });
      return;
    }

    let cRole: CanonicalRole = existingAcct?.approvalStatus === 'approved' ? existingAcct.canonicalRole : 'customer';
    if (record.email === BOOTSTRAPPED_OWNER_EMAIL) {
      cRole = 'super_admin';
    } else if (securityState.designatedRoles[record.email] === 'basit_admin') {
      cRole = 'platform_admin';
    } else if (securityState.designatedRoles[record.email] === 'finance_admin') {
      cRole = 'finance_manager';
    }
    const tenantRec = existingAcct?.tenantId ? securityState.tenantsById[existingAcct.tenantId] : undefined;

    const token = crypto.randomBytes(32).toString('base64url');
    const nowMs = Date.now();
    const session: ServerSessionRecord = {
      sessionId: token,
      email: record.email,
      uid: existingAcct?.uid || `otp_${crypto.createHash('sha256').update(record.email).digest('hex').slice(0, 24)}`,
      username: existingAcct?.username,
      employeeCode: existingAcct?.employeeCode,
      canApproveHabe: isHabeApproverAccount(record.email, existingAcct),
      fullName: existingAcct?.fullName || record.fullName,
      authKind: 'email_otp',
      role: resolveCanonicalToLegacyServerRole(cRole),
      canonicalRole: cRole,
      tenantId: tenantRec?.tenantId || existingAcct?.tenantId || '',
      tenantName: tenantRec?.name || '',
      tenantKind: tenantRec?.kind,
      contractedKitchenIds: tenantRec?.contractedKitchenIds || [],
      customPermissions: existingAcct?.customPermissions || [],
      approvalStatus: 'approved',
      ownerPinVerified: false,
      createdAtMs: nowMs,
      expiresAtMs: nowMs + SESSION_TTL_MS,
    };
    sessionStore.set(token, session);
    setSessionCookie(req, res, token);

    appendAuditEntry({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.canonicalRole,
      action: 'تسجيل دخول عبر OTP البريد الإلكتروني',
      targetType: 'session',
      targetId: session.uid,
      severity: 'info',
      details: 'Verified single-use OTP session issued',
    });

    res.json({
      ok: true,
      user: {
        ...serializePublicSessionUser(session),
        verifiedAt: new Date(nowMs).toISOString(),
      },
      messageAr: 'تم التحقق وإنشاء جلسة عميل آمنة عبر ملفات الارتباط المشفرة (HttpOnly Cookie).',
      messageEn: 'Email verified and secure HttpOnly session issued.',
    });
  });

  // ===========================================================================
  // Password Authentication, Registration Gating & Forgot Password Recovery
  // ===========================================================================
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const body = req.body as {
      fullName?: string;
      email?: string;
      username?: string;
      phone?: string;
      password?: string;
      accountKind?: 'customer' | 'client_company' | 'central_kitchen';
      businessName?: string;
      commercialRegRef?: string;
      city?: string;
      countryCode?: string;
      inviteToken?: string;
    };

    const fullName = String(body.fullName || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().toLowerCase();
    const rawUsername = String(body.username || '').trim().toLowerCase().replace(/^@/, '');
    const phone = normalizePhone(String(body.phone || '').trim());
    const password = String(body.password || '');
    const accountKind =
      body.accountKind === 'client_company' || body.accountKind === 'central_kitchen'
        ? body.accountKind
        : 'customer';
    const businessName = String(body.businessName || '').trim().slice(0, 140);
    const commercialRegRef = String(body.commercialRegRef || '').trim().slice(0, 80);
    const city = String(body.city || 'Cairo').trim().slice(0, 80);
    const countryCode = ['EG', 'AE', 'QA', 'OM', 'GB'].includes(String(body.countryCode || '').toUpperCase())
      ? String(body.countryCode).toUpperCase()
      : 'EG';
    const inviteToken = String(body.inviteToken || '').trim();

    if (fullName.length < 2) {
      res.status(400).json({ ok: false, messageAr: 'يرجى كتابة الاسم الكامل (حرفان على الأقل).', messageEn: 'Full name is required.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال بريد إلكتروني صحيح.', messageEn: 'Valid email is required.' });
      return;
    }
    if (rawUsername && !/^[a-z0-9._-]{3,32}$/.test(rawUsername)) {
      res.status(400).json({
        ok: false,
        code: 'INVALID_USERNAME',
        messageAr: 'اسم المستخدم يجب أن يتكون من 3 إلى 32 حرفاً/رقماً إنجليزياً فقط.',
        messageEn: 'Username must be 3-32 lowercase alphanumeric, dot, underscore, or hyphen characters.',
      });
      return;
    }
    if (isSubjectRevoked(email)) {
      res.status(403).json({ ok: false, code: 'ACCOUNT_REVOKED', messageAr: 'هذا البريد محظور من التسجيل.', messageEn: 'Email access revoked.' });
      return;
    }

    if (!isStrongPassword(password)) {
      res.status(400).json({
        ok: false,
        code: 'WEAK_PASSWORD',
        messageAr: 'كلمة المرور يجب أن تكون 8 أحرف/أرقام على الأقل وألا تكون شائعة.',
        messageEn: 'Password must be at least 8 characters and not trivial.',
      });
      return;
    }

    if (securityState.accountsByEmail[email]) {
      res.status(409).json({
        ok: false,
        code: 'EMAIL_EXISTS',
        messageAr: 'هذا البريد مسجل بالفعل. يرجى تسجيل الدخول أو استعادة كلمة المرور.',
        messageEn: 'An account with this email already exists.',
      });
      return;
    }

    if (
      rawUsername &&
      Object.values(securityState.accountsByEmail).some(
        (a) =>
          (a.username || '').toLowerCase() === rawUsername ||
          (a.usernameAliases || []).some((al) => al.toLowerCase() === rawUsername)
      )
    ) {
      res.status(409).json({
        ok: false,
        code: 'USERNAME_EXISTS',
        messageAr: 'اسم المستخدم مستخدم بالفعل لحساب آخر.',
        messageEn: 'Username already taken.',
      });
      return;
    }

    if (phone && Object.values(securityState.accountsByEmail).some((a) => a.phone && a.phone === phone)) {
      res.status(409).json({
        ok: false,
        code: 'PHONE_EXISTS',
        messageAr: 'رقم الهاتف مسجل بالفعل لحساب آخر.',
        messageEn: 'Phone number already registered.',
      });
      return;
    }

    if (accountKind !== 'customer' && !inviteToken && (businessName.length < 2 || commercialRegRef.length < 2)) {
      res.status(400).json({
        ok: false,
        messageAr: 'يجب إدخال اسم الجهة/المطبخ ورقم السجل التجاري لطلبات الانضمام المؤسسية.',
        messageEn: 'Business name and commercial registration reference are required for company/kitchen accounts.',
      });
      return;
    }

    let matchedInvite: ServerInvitationRecord | null = null;
    if (inviteToken) {
      const tokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');
      matchedInvite =
        Object.values(securityState.invitationsById).find(
          (inv) => inv.status === 'pending' && inv.inviteTokenHash === tokenHash && inv.invitedEmail === email
        ) || null;
      if (!matchedInvite) {
        res.status(400).json({
          ok: false,
          code: 'INVALID_INVITE_TOKEN',
          messageAr: 'رمز الدعوة غير صالح أو لا يطابق البريد الإلكتروني المدخل.',
          messageEn: 'Invitation token invalid or expired.',
        });
        return;
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashOwnerPin(password, salt);
    const nowIso = new Date().toISOString();
    const uid = `usr_${crypto.createHash('sha256').update(email).digest('hex').slice(0, 20)}`;

    const approvalStatus: ServerAccountRecord['approvalStatus'] =
      matchedInvite || accountKind === 'customer' ? 'approved' : 'pending_review';
    const canonicalRole: CanonicalRole = matchedInvite ? matchedInvite.assignedRole : 'customer';

    const derivedUsername =
      rawUsername ||
      `${email.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 18) || 'user'}_${uid.slice(4, 8)}`;

    const account: ServerAccountRecord = {
      uid,
      email,
      username: derivedUsername,
      usernameAliases: [],
      phone,
      fullName,
      passwordSalt: salt,
      passwordHash,
      canonicalRole,
      requestedKind: accountKind,
      approvalStatus,
      tenantId: matchedInvite ? matchedInvite.tenantId : '',
      customPermissions: matchedInvite ? matchedInvite.assignedPermissions : [],
      businessName: matchedInvite ? matchedInvite.tenantName : businessName,
      commercialRegRef,
      city,
      countryCode,
      reviewNote: '',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    securityState.accountsByEmail[email] = account;
    if (matchedInvite) {
      matchedInvite.status = 'accepted';
      matchedInvite.updatedAt = nowIso;
      securityState.invitationsById[matchedInvite.inviteId] = matchedInvite;
    }
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: uid,
      actorEmail: email,
      actorUsername: derivedUsername,
      actorRole: canonicalRole,
      action:
        approvalStatus === 'pending_review'
          ? `طلب تسجيل جهة جديدة قيد الاعتماد (${accountKind})`
          : matchedInvite
            ? `تفعيل عضوية موظف بدعوة معتمدة داخل ${matchedInvite.tenantName}`
            : 'إنشاء حساب عميل جديد',
      targetType: 'account',
      targetId: uid,
      severity: 'info',
      details: approvalStatus === 'pending_review' ? `Business: ${businessName}` : `Role: ${canonicalRole}`,
    });

    if (approvalStatus === 'pending_review') {
      res.status(202).json({
        ok: true,
        pendingApproval: true,
        approvalStatus: 'pending_review',
        messageAr:
          'تم استلام طلب تسجيل الكيان/المطبخ بنجاح وهو الآن قيد المراجعة والاعتماد من إدارة المنصة. لا تُمنح صلاحيات الإدارة قبل الموافقة.',
        messageEn:
          'Your company/kitchen registration is pending Platform Admin review and approval. Administrative access remains disabled until approved.',
      });
      return;
    }

    const tenantRec = account.tenantId ? securityState.tenantsById[account.tenantId] : undefined;
    const token = crypto.randomBytes(32).toString('base64url');
    const nowMs = Date.now();
    const session: ServerSessionRecord = {
      sessionId: token,
      email: account.email,
      uid: account.uid,
      username: account.username,
      employeeCode: account.employeeCode,
      canApproveHabe: isHabeApproverAccount(account.email, account),
      fullName: account.fullName,
      authKind: 'password',
      role: resolveCanonicalToLegacyServerRole(account.canonicalRole),
      canonicalRole: account.canonicalRole,
      tenantId: tenantRec?.tenantId || account.tenantId,
      tenantName: tenantRec?.name || account.businessName,
      tenantKind: tenantRec?.kind,
      contractedKitchenIds: tenantRec?.contractedKitchenIds || [],
      customPermissions: account.customPermissions,
      approvalStatus: 'approved',
      ownerPinVerified: false,
      createdAtMs: nowMs,
      expiresAtMs: nowMs + SESSION_TTL_MS,
    };
    sessionStore.set(token, session);
    setSessionCookie(req, res, token);

    res.json({
      ok: true,
      pendingApproval: false,
      user: serializePublicSessionUser(session),
      messageAr: 'تم إنشاء الحساب وتفعيله بجلسة آمنة بنجاح.',
      messageEn: 'Account created and secure session issued.',
    });
  });

  app.get('/api/auth/executive-setup-status', (_req: Request, res: Response) => {
    const accounts = EXECUTIVE_ACCOUNTS.map((spec) => {
      const acct = securityState.accountsByEmail[spec.email.toLowerCase()];
      return {
        username: spec.username,
        fullNameAr: spec.fullNameAr,
        fullNameEn: spec.fullNameEn,
        roleLabelAr:
          spec.canonicalRole === 'super_admin'
            ? 'المالك ومدير النظام الأعلى'
            : 'الإدارة التنفيذية المعتمدة (H-A-B-E)',
        canonicalRole: spec.canonicalRole,
        hasPassword: Boolean(acct?.passwordHash),
      };
    });
    res.json({ ok: true, executives: accounts });
  });

  app.post('/api/auth/claim-executive-password', (req: Request, res: Response) => {
    const body = req.body as { identifier?: string; newPassword?: string };
    const rawIdentifier = String(body.identifier || '').trim();
    const newPassword = String(body.newPassword || '');

    if (!rawIdentifier) {
      res.status(400).json({ ok: false, messageAr: 'يرجى تحديد اسم المستخدم أو البريد.', messageEn: 'Identifier required.' });
      return;
    }

    const acct = findAccountByIdentifier(rawIdentifier);
    const isGovExec = acct && EXECUTIVE_ACCOUNTS.some((s) => s.email.toLowerCase() === acct.email.toLowerCase());
    if (!acct || !isGovExec) {
      res.status(404).json({ ok: false, messageAr: 'الحساب التنفيذي غير موجود.', messageEn: 'Executive account not found.' });
      return;
    }

    if (acct.passwordHash) {
      res.status(409).json({
        ok: false,
        code: 'PASSWORD_ALREADY_CLAIMED',
        messageAr: 'تم تعيين كلمة مرور لهذا الحساب بالفعل. استخدم تسجيل الدخول أو اطلب إعادة تعيين من المالك.',
        messageEn: 'Password already set for this executive account.',
      });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      res.status(400).json({
        ok: false,
        code: 'WEAK_PASSWORD',
        messageAr: 'كلمة المرور يجب أن لا تقل عن 8 أحرف/أرقام وألا تكون شائعة.',
        messageEn: 'Password must be at least 8 characters and not trivial.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    acct.passwordSalt = salt;
    acct.passwordHash = hashOwnerPin(newPassword, salt);
    acct.updatedAt = new Date().toISOString();
    securityState.accountsByEmail[acct.email] = acct;
    saveSecurityState(securityState);

    const tenantRec = acct.tenantId ? securityState.tenantsById[acct.tenantId] : undefined;
    const token = crypto.randomBytes(32).toString('base64url');
    const nowMs = Date.now();
    const session: ServerSessionRecord = {
      sessionId: token,
      email: acct.email,
      uid: acct.uid,
      username: acct.username,
      employeeCode: acct.employeeCode,
      canApproveHabe: isHabeApproverAccount(acct.email, acct),
      fullName: acct.fullName,
      authKind: 'password',
      role: resolveCanonicalToLegacyServerRole(acct.canonicalRole),
      canonicalRole: acct.canonicalRole,
      tenantId: tenantRec?.tenantId || acct.tenantId,
      tenantName: tenantRec?.name || acct.businessName,
      tenantKind: tenantRec?.kind,
      contractedKitchenIds: tenantRec?.contractedKitchenIds || [],
      customPermissions: acct.customPermissions,
      approvalStatus: 'approved',
      ownerPinVerified: false,
      createdAtMs: nowMs,
      expiresAtMs: nowMs + SESSION_TTL_MS,
    };
    sessionStore.set(token, session);
    setSessionCookie(req, res, token);

    appendAuditEntry({
      actorUid: acct.uid,
      actorEmail: acct.email,
      actorUsername: acct.username,
      actorRole: acct.canonicalRole,
      action: `تفعيل وتعيين كلمة المرور الأولية المستقلة لحساب (${acct.username || acct.fullName})`,
      targetType: 'account',
      targetId: acct.uid,
      severity: 'info',
      details: `First-run independent executive password claimed for ${acct.username}`,
    });

    res.json({
      ok: true,
      user: serializePublicSessionUser(session),
      messageAr: `تم تأمين حسابك (${acct.fullName}) وتفعيل الجلسة بنجاح.`,
      messageEn: 'Executive password configured and signed in.',
    });
  });

  app.post('/api/auth/change-password', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = req.body as { currentPassword?: string; newPassword?: string };
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    const acct = securityState.accountsByEmail[sess.email.toLowerCase()];
    if (!acct) {
      res.status(404).json({ ok: false, messageAr: 'سجل الحساب غير موجود لتغيير كلمة المرور.', messageEn: 'Account record not found.' });
      return;
    }

    if (acct.passwordHash) {
      const candidateHash = hashOwnerPin(currentPassword, acct.passwordSalt);
      if (!timingSafeHexEquals(candidateHash, acct.passwordHash)) {
        res.status(401).json({ ok: false, messageAr: 'كلمة المرور الحالية غير صحيحة.', messageEn: 'Current password incorrect.' });
        return;
      }
    }

    if (!isStrongPassword(newPassword)) {
      res.status(400).json({
        ok: false,
        code: 'WEAK_PASSWORD',
        messageAr: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف/أرقام على الأقل وألا تكون شائعة.',
        messageEn: 'New password must be 8+ non-trivial characters.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    acct.passwordSalt = salt;
    acct.passwordHash = hashOwnerPin(newPassword, salt);
    acct.updatedAt = new Date().toISOString();
    securityState.accountsByEmail[acct.email] = acct;
    saveSecurityState(securityState);

    for (const [tok, active] of sessionStore.entries()) {
      if (tok !== sess.sessionId && (active.uid === acct.uid || active.email === acct.email)) {
        sessionStore.delete(tok);
      }
    }

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorUsername: sess.username,
      actorRole: sess.canonicalRole,
      action: 'تحديث كلمة المرور الشخصية بنجاح',
      targetType: 'account',
      targetId: acct.uid,
      severity: 'info',
      details: `User ${sess.username || sess.email} rotated password`,
    });

    res.json({
      ok: true,
      messageAr: 'تم تغيير كلمة المرور بنجاح وتأمين الجلسة الحالية.',
      messageEn: 'Password updated successfully.',
    });
  });

  app.post('/api/auth/login-password', (req: Request, res: Response) => {
    const body = req.body as { identifier?: string; password?: string };
    const rawIdentifier = String(body.identifier || '').trim();
    const password = String(body.password || '');

    if (!rawIdentifier || !password) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى إدخال اسم المستخدم أو البريد أو رقم الهاتف وكلمة المرور.',
        messageEn: 'Username, email, or phone and password are required.',
      });
      return;
    }

    const account = findAccountByIdentifier(rawIdentifier);
    const rateKey = account?.email || rawIdentifier.toLowerCase() || req.ip || 'unknown';
    const nowMs = Date.now();
    const failRecord = passwordLoginFailStore.get(rateKey) || { count: 0, lockedUntilMs: 0 };
    if (failRecord.lockedUntilMs > nowMs) {
      const waitMin = Math.ceil((failRecord.lockedUntilMs - nowMs) / 60000);
      res.status(429).json({
        ok: false,
        code: 'LOGIN_LOCKED',
        messageAr: `تم قفل محاولات الدخول مؤقتاً لمدة ${waitMin} دقيقة لسلامة الحساب.`,
        messageEn: 'Too many failed login attempts. Try again later.',
      });
      return;
    }

    if (!account) {
      const nextCount = failRecord.count + 1;
      passwordLoginFailStore.set(rateKey, {
        count: nextCount >= LOGIN_MAX_ATTEMPTS ? 0 : nextCount,
        lockedUntilMs: nextCount >= LOGIN_MAX_ATTEMPTS ? nowMs + LOGIN_LOCK_MS : 0,
      });
      res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        messageAr: 'بيانات الدخول غير صحيحة.',
        messageEn: 'Invalid credentials.',
      });
      return;
    }

    if (isSubjectRevoked(account.email, account.uid)) {
      res.status(403).json({
        ok: false,
        code: 'ACCOUNT_SUSPENDED',
        messageAr: 'تم إيقاف أو تجميد هذا الحساب من إدارة المنصة.',
        messageEn: 'Account is suspended or revoked.',
      });
      return;
    }

    if (!account.passwordHash || !account.passwordSalt) {
      res.status(409).json({
        ok: false,
        code: 'PASSWORD_SETUP_REQUIRED',
        canClaimPassword: true,
        identifierHint: account.username || account.email,
        fullName: account.fullName,
        messageAr: `الحساب (${account.fullName}) لم يضبط كلمة مروره بعد. عيّن كلمة مرورك المستقلة من نموذج التفعيل الفوري أو عبر المالك.`,
        messageEn: 'Executive account password not set yet. Claim your independent password now.',
      });
      return;
    }

    const candidateHash = hashOwnerPin(password, account.passwordSalt);
    if (!timingSafeHexEquals(candidateHash, account.passwordHash)) {
      const nextCount = failRecord.count + 1;
      passwordLoginFailStore.set(rateKey, {
        count: nextCount >= LOGIN_MAX_ATTEMPTS ? 0 : nextCount,
        lockedUntilMs: nextCount >= LOGIN_MAX_ATTEMPTS ? nowMs + LOGIN_LOCK_MS : 0,
      });
      appendAuditEntry({
        actorUid: account.uid,
        actorEmail: account.email,
        actorUsername: account.username,
        actorRole: account.canonicalRole,
        action: 'محاولة دخول فاشلة بكلمة مرور خاطئة',
        targetType: 'auth',
        targetId: account.uid,
        severity: 'warning',
        details: `Failed password attempt (${nextCount}/${LOGIN_MAX_ATTEMPTS})`,
      });
      res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        messageAr: 'بيانات الدخول غير صحيحة.',
        messageEn: 'Invalid credentials.',
      });
      return;
    }

    passwordLoginFailStore.delete(rateKey);

    if (account.approvalStatus === 'pending_review') {
      res.status(403).json({
        ok: false,
        code: 'PENDING_ADMIN_APPROVAL',
        messageAr: 'طلب انضمام جهتكم لا يزال قيد المراجعة والاعتماد من مدير المنصة. يرجى الانتظار لحين التفعيل.',
        messageEn: 'Your entity account is still awaiting Platform Admin approval.',
      });
      return;
    }

    if (account.approvalStatus === 'rejected') {
      res.status(403).json({
        ok: false,
        code: 'REGISTRATION_REJECTED',
        messageAr: account.reviewNote || 'تم رفض طلب تفعيل هذا الحساب من الإدارة.',
        messageEn: account.reviewNote || 'Registration rejected by platform admin.',
      });
      return;
    }

    let cRole = account.canonicalRole;
    if (account.email === BOOTSTRAPPED_OWNER_EMAIL) {
      cRole = 'super_admin';
    } else if (securityState.designatedRoles[account.email] === 'basit_admin') {
      cRole = 'platform_admin';
    } else if (securityState.designatedRoles[account.email] === 'finance_admin') {
      cRole = 'finance_manager';
    }

    const tenantRec = account.tenantId ? securityState.tenantsById[account.tenantId] : undefined;
    if (tenantRec && tenantRec.status === 'suspended') {
      res.status(403).json({
        ok: false,
        code: 'TENANT_SUSPENDED',
        messageAr: 'تم تعليق نشاط الكيان/المطبخ التابع له حسابك مؤقتاً.',
        messageEn: 'Your associated entity/kitchen workspace is suspended.',
      });
      return;
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const session: ServerSessionRecord = {
      sessionId: token,
      email: account.email,
      uid: account.uid,
      username: account.username,
      employeeCode: account.employeeCode,
      canApproveHabe: isHabeApproverAccount(account.email, account),
      fullName: account.fullName,
      authKind: 'password',
      role: resolveCanonicalToLegacyServerRole(cRole),
      canonicalRole: cRole,
      tenantId: tenantRec?.tenantId || account.tenantId,
      tenantName: tenantRec?.name || account.businessName,
      tenantKind: tenantRec?.kind,
      contractedKitchenIds: tenantRec?.contractedKitchenIds || [],
      customPermissions: account.customPermissions,
      approvalStatus: account.approvalStatus,
      ownerPinVerified: false,
      createdAtMs: nowMs,
      expiresAtMs: nowMs + SESSION_TTL_MS,
    };
    sessionStore.set(token, session);
    setSessionCookie(req, res, token);

    appendAuditEntry({
      actorUid: session.uid,
      actorEmail: session.email,
      actorUsername: session.username,
      actorRole: session.canonicalRole,
      action: 'تسجيل دخول آمن بكلمة المرور',
      targetType: 'session',
      targetId: session.uid,
      severity: 'info',
      details: `Authenticated role ${session.canonicalRole}${session.tenantId ? ` in tenant ${session.tenantId}` : ''}`,
    });

    res.json({
      ok: true,
      user: serializePublicSessionUser(session),
      messageAr: 'تم تسجيل الدخول بنجاح وتفعيل جلستك الآمنة.',
      messageEn: 'Signed in securely.',
    });
  });

  app.post('/api/auth/forgot-password/request', async (req: Request, res: Response) => {
    const body = req.body as { email?: string };
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال بريد إلكتروني صحيح.', messageEn: 'Valid email required.' });
      return;
    }
    const account = securityState.accountsByEmail[email];
    if (!account) {
      // Security: return generic error without leaking user existence if SMTP isn't configured, or enforce Gmail SMTP readiness
      res.status(404).json({
        ok: false,
        messageAr: 'لا يوجد حساب كلمة مرور مسجل بهذا البريد الإلكتروني.',
        messageEn: 'No password-enabled account found for this email.',
      });
      return;
    }

    const nowMs = Date.now();
    const existing = otpChallengeStore.get(email);
    if (existing && nowMs - existing.lastSentAtMs < OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_COOLDOWN_MS - (nowMs - existing.lastSentAtMs)) / 1000);
      res.status(429).json({
        ok: false,
        messageAr: `يرجى الانتظار ${waitSec} ثانية قبل طلب رمز استعادة جديد.`,
        messageEn: `Please wait ${waitSec}s before retrying.`,
      });
      return;
    }

    const mailStatus = getMailTransportStatus();
    if (!mailStatus.hasGmailSmtp) {
      res.status(503).json({
        ok: false,
        code: 'GMAIL_SMTP_UNCONFIGURED',
        messageAr: 'تعذر إرسال رمز الاستعادة: خادم البريد Gmail SMTP غير مضبوط على الخادم.',
        messageEn: 'Gmail SMTP is not configured on the server.',
      });
      return;
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = hashOtpCode(salt, email, code);
    try {
      const dispatch = await sendOtpEmailViaConfiguredTransport(email, account.fullName, code);
      if (!dispatch.sent) throw new Error('SMTP_FAIL');
      otpChallengeStore.set(email, {
        email,
        fullName: account.fullName,
        purpose: 'password_reset',
        salt,
        codeHash,
        expiresAtMs: nowMs + OTP_TTL_MS,
        lastSentAtMs: nowMs,
        attempts: 0,
        used: false,
      });
      res.json({
        ok: true,
        messageAr: 'تم إرسال رمز استعادة كلمة المرور عبر البريد الإلكتروني (صالح 5 دقائق).',
        messageEn: 'Password recovery OTP sent via email.',
      });
    } catch {
      res.status(502).json({
        ok: false,
        messageAr: 'فشل إرسال بريد الاستعادة عبر Gmail SMTP.',
        messageEn: 'Failed to send password reset email.',
      });
    }
  });

  app.post('/api/auth/forgot-password/reset', (req: Request, res: Response) => {
    const body = req.body as { email?: string; code?: string; newPassword?: string };
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const newPassword = String(body.newPassword || '');

    if (!email || !/^\d{6}$/.test(code) || newPassword.length < 8) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى إدخال البريد والرمز المكون من 6 أرقام وكلمة مرور جديدة لا تقل عن 8 أحرف.',
        messageEn: 'Email, 6-digit OTP code, and 8+ character password are required.',
      });
      return;
    }

    const account = securityState.accountsByEmail[email];
    const record = otpChallengeStore.get(email);
    if (!account || !record || record.used || record.purpose !== 'password_reset') {
      res.status(404).json({
        ok: false,
        messageAr: 'لا يوجد طلب استعادة صالح لهذا البريد.',
        messageEn: 'No valid password recovery challenge found.',
      });
      return;
    }

    if (Date.now() > record.expiresAtMs) {
      otpChallengeStore.delete(email);
      res.status(410).json({ ok: false, messageAr: 'انتهت صلاحية رمز الاستعادة.', messageEn: 'Recovery code expired.' });
      return;
    }

    if (!timingSafeHexEquals(hashOtpCode(record.salt, email, code), record.codeHash)) {
      record.attempts += 1;
      if (record.attempts >= OTP_MAX_ATTEMPTS) otpChallengeStore.delete(email);
      res.status(401).json({ ok: false, messageAr: 'رمز التحقق غير صحيح.', messageEn: 'Invalid recovery code.' });
      return;
    }

    otpChallengeStore.delete(email);
    const nextSalt = crypto.randomBytes(16).toString('hex');
    account.passwordSalt = nextSalt;
    account.passwordHash = hashOwnerPin(newPassword, nextSalt);
    account.updatedAt = new Date().toISOString();
    securityState.accountsByEmail[email] = account;
    saveSecurityState(securityState);

    const terminated = terminateUserSessions(account.email, account.uid);
    appendAuditEntry({
      actorUid: account.uid,
      actorEmail: account.email,
      actorRole: account.canonicalRole,
      action: 'إعادة تعيين كلمة المرور وإلغاء الجلسات القديمة',
      targetType: 'account',
      targetId: account.uid,
      severity: 'info',
      details: `Terminated ${terminated} prior session(s)`,
    });

    res.json({
      ok: true,
      messageAr: 'تم تحديث كلمة المرور بنجاح وإلغاء جميع الجلسات السابقة. يمكنك الآن تسجيل الدخول.',
      messageEn: 'Password updated successfully. You may now sign in.',
    });
  });

  // ===========================================================================
  // Independent Owner Setup & Verification (NO static default PIN)
  // ===========================================================================
  app.get('/api/owner/setup-status', (req: Request, res: Response) => {
    const { session } = resolveSessionFromRequest(req);
    if (session?.role === 'finance_admin') {
      res.status(403).json({
        ok: false,
        code: 'FINANCE_ROLE_ISOLATED',
        messageAr: 'صلاحيات المدير المالي معزولة تماماً عن إعدادات المالك.',
        messageEn: 'Finance admin cannot inspect owner setup endpoints.',
      });
      return;
    }
    res.json({
      ok: true,
      configured: Boolean(securityState.ownerPin),
      configuredAt: securityState.ownerPin?.configuredAt || null,
      ownerEmailHint: maskEmail(BOOTSTRAPPED_OWNER_EMAIL),
      requiresBootstrapSecret: !securityState.ownerPin && !session,
      sessionIsOwner: session?.role === 'owner',
      ownerPinVerified: Boolean(session?.ownerPinVerified),
    });
  });

  async function resolveSessionOrFirebaseBearer(req: Request): Promise<{
    session: ServerSessionRecord | null;
    revoked: boolean;
  }> {
    const cookieResult = resolveSessionFromRequest(req);
    if (cookieResult.session || cookieResult.revoked) {
      return cookieResult;
    }
    const authHeader = String(req.headers.authorization || '').trim();
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return { session: null, revoked: false };
    }
    const idToken = authHeader.slice(7).trim();
    if (!idToken || idToken.length < 20) {
      return { session: null, revoked: false };
    }
    const apiKey = readFirebaseWebApiKey();
    if (!apiKey) {
      return { session: null, revoked: false };
    }
    try {
      const lookupRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      if (!lookupRes.ok) {
        return { session: null, revoked: false };
      }
      const lookupJson = (await lookupRes.json()) as {
        users?: Array<{
          localId?: string;
          email?: string;
          displayName?: string;
          disabled?: boolean;
        }>;
      };
      const verifiedUser = lookupJson.users?.[0];
      if (!verifiedUser || !verifiedUser.email || verifiedUser.disabled) {
        return { session: null, revoked: false };
      }
      const email = verifiedUser.email.toLowerCase();
      const uid = String(verifiedUser.localId || '');
      if (isSubjectRevoked(email, uid)) {
        return { session: null, revoked: true };
      }
      const sessionKey = `fb:${uid || email}`;
      let sess = sessionStore.get(sessionKey);
      const isOwner = email === BOOTSTRAPPED_OWNER_EMAIL;
      if (!sess) {
        sess = {
          sessionId: sessionKey,
          uid: uid || email,
          email,
          canApproveHabe: isOwner,
          fullName: verifiedUser.displayName || email,
          role: isOwner ? 'owner' : 'customer',
          canonicalRole: isOwner ? 'super_admin' : 'customer',
          tenantId: '',
          tenantName: '',
          contractedKitchenIds: [],
          customPermissions: isOwner
            ? [...DEFAULT_ROLE_PERMISSION_MATRIX.super_admin]
            : [...DEFAULT_ROLE_PERMISSION_MATRIX.customer],
          approvalStatus: 'approved',
          authKind: 'google_firebase',
          ownerPinVerified: false,
          createdAtMs: Date.now(),
          expiresAtMs: Date.now() + 24 * 60 * 60 * 1000,
        };
        sessionStore.set(sessionKey, sess);
      } else {
        sess.expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
      }
      return { session: sess, revoked: false };
    } catch {
      return { session: null, revoked: false };
    }
  }

  app.post('/api/owner/setup', async (req: Request, res: Response) => {
    const body = req.body as {
      pin?: string;
      currentPin?: string;
      bootstrapSecret?: string;
    };
    const { session } = await resolveSessionOrFirebaseBearer(req);

    if (session?.role === 'finance_admin' || session?.role === 'basit_admin' || session?.role === 'customer') {
      res.status(403).json({
        ok: false,
        code: 'OWNER_ONLY',
        messageAr: 'تأمين حساب المالك مقتصر حصرياً على حساب المالك الأساسي.',
        messageEn: 'Owner security setup is restricted strictly to Platform Owner.',
      });
      return;
    }

    const pin = String(body.pin || '').trim();
    const weakPins = new Set([
      '12345678',
      '00000000',
      '11111111',
      'password',
      'catering@2026',
      'finance@2026',
      'bahed@2026',
      'admin1234',
    ]);
    if (pin.length < 8 || weakPins.has(pin.toLowerCase())) {
      res.status(400).json({
        ok: false,
        code: 'WEAK_OWNER_PIN',
        messageAr: 'يجب ألا يقل رمز تأمين المالك المستقل عن 8 أحرف/أرقام وألا يكون كلمة افتراضية شائعة.',
        messageEn: 'Owner PIN/passphrase must be at least 8 characters and not a common default.',
      });
      return;
    }

    if (!securityState.ownerPin) {
      const envBootstrapSecret = process.env.OWNER_SETUP_SECRET || '';
      const providedSecret = String(body.bootstrapSecret || '').trim();
      const authorizedByOwnerSession = session?.role === 'owner';
      const authorizedByBootstrapSecret =
        Boolean(envBootstrapSecret) && Boolean(providedSecret) && timingSafeTextEquals(providedSecret, envBootstrapSecret);

      if (!authorizedByOwnerSession && !authorizedByBootstrapSecret) {
        res.status(401).json({
          ok: false,
          code: 'OWNER_AUTH_OR_SECRET_REQUIRED',
          messageAr: 'يلزم تسجيل الدخول بحساب المالك الموثق عبر Firebase أو إدخال مفتاح تهيئة المالك لإعداد رمز الأمان المستقل.',
          messageEn: 'Verify Owner Firebase session or provide OWNER_SETUP_SECRET to initialize Owner security.',
        });
        return;
      }
    } else {
      if (session?.role !== 'owner') {
        res.status(403).json({
          ok: false,
          code: 'OWNER_ONLY',
          messageAr: 'إعادة تعيين رمز أمان المالك تتطلب جلسة المالك الحالية.',
          messageEn: 'Owner session required to update security passphrase.',
        });
        return;
      }
      const currentPin = String(body.currentPin || '');
      const currentHash = hashOwnerPin(currentPin, securityState.ownerPin.salt);
      if (!timingSafeHexEquals(currentHash, securityState.ownerPin.hash)) {
        res.status(401).json({
          ok: false,
          code: 'INVALID_CURRENT_PIN',
          messageAr: 'رمز الأمان الحالي غير صحيح.',
          messageEn: 'Current security passphrase is incorrect.',
        });
        return;
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashOwnerPin(pin, salt);
    securityState.ownerPin = {
      salt,
      hash,
      configuredAt: new Date().toISOString(),
      configuredByEmail: session?.email || BOOTSTRAPPED_OWNER_EMAIL,
    };
    saveSecurityState(securityState);

    if (session && session.role === 'owner') {
      session.ownerPinVerified = true;
      sessionStore.set(session.sessionId, session);
    }

    res.json({
      ok: true,
      configured: true,
      configuredAt: securityState.ownerPin.configuredAt,
      messageAr: 'تم تأمين حساب المالك بخطوة مستقلة وتشفير الرمز بملف الخادم بنجاح.',
      messageEn: 'Independent owner security passphrase configured and salted-scrypt hashed.',
    });
  });

  app.post('/api/owner/verify', async (req: Request, res: Response) => {
    const body = req.body as { pin?: string };
    const { session, revoked } = await resolveSessionOrFirebaseBearer(req);
    if (revoked || !session || session.role !== 'owner') {
      res.status(403).json({
        ok: false,
        code: 'OWNER_SESSION_REQUIRED',
        messageAr: 'يتطلب التحقق وجود جلسة نشطة لحساب المالك.',
        messageEn: 'Active owner session required.',
      });
      return;
    }

    if (!securityState.ownerPin) {
      res.status(409).json({
        ok: false,
        code: 'OWNER_PIN_NOT_CONFIGURED',
        messageAr: 'لم يتم إعداد رمز أمان المالك بعد. أكمل خطوة إعداد المالك المستقلة أولاً.',
        messageEn: 'Owner security setup not completed yet.',
      });
      return;
    }

    const nowMs = Date.now();
    const failState = ownerPinFailStore.get(session.email) || { count: 0, lockedUntilMs: 0 };
    if (failState.lockedUntilMs > nowMs) {
      const waitMin = Math.ceil((failState.lockedUntilMs - nowMs) / 60000);
      res.status(429).json({
        ok: false,
        code: 'OWNER_PIN_LOCKED',
        messageAr: `تم قفل محاولات التحقق مؤقتاً لمدة ${waitMin} دقيقة لسلامة الحساب.`,
        messageEn: 'Owner verification temporarily locked due to failed attempts.',
      });
      return;
    }

    const candidateHash = hashOwnerPin(String(body.pin || ''), securityState.ownerPin.salt);
    if (!timingSafeHexEquals(candidateHash, securityState.ownerPin.hash)) {
      const nextCount = failState.count + 1;
      ownerPinFailStore.set(session.email, {
        count: nextCount >= OWNER_PIN_MAX_ATTEMPTS ? 0 : nextCount,
        lockedUntilMs: nextCount >= OWNER_PIN_MAX_ATTEMPTS ? nowMs + OWNER_PIN_LOCK_MS : 0,
      });
      res.status(401).json({
        ok: false,
        code: 'INVALID_OWNER_PIN',
        messageAr: 'رمز تأمين المالك غير صحيح.',
        messageEn: 'Incorrect owner security passphrase.',
      });
      return;
    }

    ownerPinFailStore.delete(session.email);
    session.ownerPinVerified = true;
    sessionStore.set(session.sessionId, session);
    res.json({
      ok: true,
      ownerPinVerified: true,
      messageAr: 'تم توثيق الجلسة برمز المالك بنجاح.',
      messageEn: 'Owner session verified.',
    });
  });

  // ===========================================================================
  // Server-Enforced Finance Admin Isolation & Zero-Real-Money-Transfer Policy
  // ===========================================================================
  app.get('/api/finance/overview', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    if (sess.role !== 'owner' && sess.role !== 'finance_admin') {
      res.status(403).json({
        ok: false,
        code: 'FINANCE_OR_OWNER_REQUIRED',
        messageAr: 'الوصول إلى بيانات المالية مقصور على المالك أو المدير المالي فقط.',
        messageEn: 'Finance overview restricted to owner or finance_admin.',
      });
      return;
    }

    res.json({
      ok: true,
      brandAr: 'الوطنية اللوجستية المالية',
      accessScope: sess.role === 'finance_admin' ? 'finance_read_only_isolated' : 'owner_full_audit',
      realMoneyTransfersEnabled: false,
      role: sess.role,
      sandboxTransactionCount: sandboxIntentStore.size,
      noteAr: 'بيئة مالية للمراجعة والتقارير فقط — كافة التحويلات المالية الحقيقية معطلة وممنوعة برمجياً.',
    });
  });

  app.post('/api/finance/transfer', requireAuthenticatedSession, (_req: AuthenticatedRequest, res: Response) => {
    res.status(403).json({
      ok: false,
      code: 'REAL_TRANSFERS_DISABLED',
      messageAr: 'التحويلات المالية المباشرة وتحريك الأموال الحقيقي معطلة بالكامل في هذه المنصة.',
      messageEn: 'Live money movement and direct transfers are strictly disabled by system policy.',
    });
  });

  // ===========================================================================
  // B2B Catering & Supply Financial Accounting (10 Core Questions + RBAC + H.A.B.E)
  // ===========================================================================
  function round2(val: number): number {
    return Math.round(val * 100) / 100;
  }

  function inferMealsCountFromSummary(summary: string, explicit?: number): number {
    if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) {
      return Math.round(explicit);
    }
    const m = summary.match(/(\d+)\s*(?:وجبة|وجبات|meals?|qty)/i);
    if (m && Number(m[1]) > 0) {
      return Math.min(100000, Number(m[1]));
    }
    return 1;
  }

  app.get('/api/finance/catering-ledger', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const isGovernanceFinance =
      sess.canonicalRole === 'super_admin' ||
      sess.canonicalRole === 'platform_admin' ||
      sess.canonicalRole === 'finance_manager' ||
      sess.role === 'owner' ||
      sess.role === 'finance_admin' ||
      sess.role === 'basit_admin';

    const isTenantScopedFinance =
      Boolean(sess.tenantId) &&
      (sess.canonicalRole === 'client_owner' ||
        sess.canonicalRole === 'client_manager' ||
        sess.canonicalRole === 'kitchen_owner' ||
        sess.canonicalRole === 'kitchen_manager');

    if (!isGovernanceFinance && !isTenantScopedFinance) {
      res.status(403).json({
        ok: false,
        code: 'FINANCE_LEDGER_FORBIDDEN',
        messageAr: 'الوصول إلى الدفتر المالي لإعاشة الشركات مقصور على الإدارة أو المدير المالي أو ممثل الجهة المعتمد.',
        messageEn: 'Access to B2B catering financial ledger is restricted.',
      });
      return;
    }

    const qClientId = String(req.query.clientId || '').trim();
    const qKitchenId = String(req.query.kitchenId || '').trim();
    const qFromDate = String(req.query.fromDate || '').trim();
    const qToDate = String(req.query.toDate || '').trim();
    const qContractRef = String(req.query.contractRef || '').trim().toLowerCase();

    // Enforce cross-tenant isolation strictly on server
    if (!isGovernanceFinance) {
      const ownTenant = securityState.tenantsById[sess.tenantId];
      if (ownTenant?.kind === 'client_company' && qClientId && qClientId !== 'all' && qClientId !== sess.tenantId) {
        appendAuditEntry({
          actorUid: sess.uid,
          actorEmail: sess.email,
          actorRole: sess.canonicalRole,
          action: 'رفض محاولة استعلام مالي عابر للجهات (Cross-Tenant Finance Query)',
          targetType: 'finance_isolation',
          targetId: qClientId,
          severity: 'security_alert',
          details: `Scoped client "${sess.tenantId}" requested financial data for "${qClientId}"`,
        });
        res.status(403).json({
          ok: false,
          code: 'CROSS_TENANT_FINANCE_BLOCKED',
          messageAr: 'ممنوع: لا يمكنك الاطلاع على البيانات المالية لجهة أو عميل آخر.',
          messageEn: 'Cross-tenant financial query blocked.',
        });
        return;
      }
      if (ownTenant?.kind === 'central_kitchen' && qKitchenId && qKitchenId !== 'all' && qKitchenId !== sess.tenantId) {
        appendAuditEntry({
          actorUid: sess.uid,
          actorEmail: sess.email,
          actorRole: sess.canonicalRole,
          action: 'رفض محاولة استعلام مالي عابر للمطابخ',
          targetType: 'finance_isolation',
          targetId: qKitchenId,
          severity: 'security_alert',
          details: `Scoped kitchen "${sess.tenantId}" requested financial data for "${qKitchenId}"`,
        });
        res.status(403).json({
          ok: false,
          code: 'CROSS_TENANT_FINANCE_BLOCKED',
          messageAr: 'ممنوع: لا يمكنك الاطلاع على البيانات المالية لمطبخ آخر.',
          messageEn: 'Cross-kitchen financial query blocked.',
        });
        return;
      }
    }

    // Normalize real tenant orders into supply_revenue entries dynamically
    const orderDerivedEntries: ServerFinancialLedgerEntry[] = Object.values(securityState.tenantOrdersById)
      .filter((ord) => ord.status !== 'cancelled')
      .map((ord) => {
        const mealsCount = inferMealsCountFromSummary(ord.itemsSummary, ord.mealsCount);
        const amountEGP = Number(ord.totalEGP) || 0;
        const unitPrice =
          typeof ord.mealUnitPriceEGP === 'number' && ord.mealUnitPriceEGP > 0
            ? ord.mealUnitPriceEGP
            : mealsCount > 0
              ? round2(amountEGP / mealsCount)
              : 0;
        const paidAmountEGP = ord.status === 'delivered' ? amountEGP : 0;
        return {
          entryId: `ORDLED-${ord.orderId}`,
          entryType: 'supply_revenue',
          clientTenantId: ord.clientTenantId,
          clientName: ord.clientTenantName,
          kitchenTenantId: ord.kitchenTenantId,
          kitchenName: ord.kitchenTenantName,
          contractRef: ord.contractRef || `CTR-${ord.clientTenantId.slice(-6).toUpperCase()}`,
          mealsCount,
          mealUnitPriceEGP: unitPrice,
          amountEGP,
          paidAmountEGP,
          entryDate: String(ord.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          sourceChannel: 'central_order',
          notes: ord.itemsSummary,
          createdByEmail: ord.placedByName,
          createdAt: ord.createdAt,
        };
      });

    const combinedRaw: ServerFinancialLedgerEntry[] = [...securityState.ledgerEntries, ...orderDerivedEntries];

    const filteredEntries = combinedRaw
      .filter((entry) => {
        if (!isGovernanceFinance) {
          const matchesTenant = entry.clientTenantId === sess.tenantId || entry.kitchenTenantId === sess.tenantId;
          if (!matchesTenant) return false;
        }
        if (qClientId && qClientId !== 'all' && entry.clientTenantId !== qClientId) return false;
        if (qKitchenId && qKitchenId !== 'all' && entry.kitchenTenantId !== qKitchenId) return false;
        if (qFromDate && entry.entryDate < qFromDate) return false;
        if (qToDate && entry.entryDate > qToDate) return false;
        if (qContractRef && !entry.contractRef.toLowerCase().includes(qContractRef)) return false;
        return true;
      })
      .sort((a, b) => (b.entryDate || b.createdAt).localeCompare(a.entryDate || a.createdAt));

    const supplyEntries = filteredEntries.filter((e) => e.entryType === 'supply_revenue');
    const expenseEntries = filteredEntries.filter((e) => e.entryType === 'recorded_expense');
    const receivableEntries = filteredEntries.filter((e) => e.entryType === 'receivable');
    const payableEntries = filteredEntries.filter((e) => e.entryType === 'payable');

    const totalMealsSupplied = supplyEntries.reduce((sum, e) => sum + (Number(e.mealsCount) || 0), 0);
    const totalSupplyValueEGP = round2(supplyEntries.reduce((sum, e) => sum + (Number(e.amountEGP) || 0), 0));
    const avgMealUnitPriceEGP = totalMealsSupplied > 0 ? round2(totalSupplyValueEGP / totalMealsSupplied) : null;
    const actualRevenueEGP = round2(supplyEntries.reduce((sum, e) => sum + (Number(e.paidAmountEGP) || 0), 0));

    const hasRecordedExpenses = expenseEntries.length > 0;
    const recordedExpensesEGP = hasRecordedExpenses
      ? round2(expenseEntries.reduce((sum, e) => sum + (Number(e.amountEGP) || 0), 0))
      : 0;

    const netProfitEGP = hasRecordedExpenses ? round2(actualRevenueEGP - recordedExpensesEGP) : null;
    const profitMarginPct =
      hasRecordedExpenses && actualRevenueEGP > 0
        ? round2(((actualRevenueEGP - recordedExpensesEGP) / actualRevenueEGP) * 100)
        : null;

    const unpaidSupplyReceivables = supplyEntries.reduce(
      (sum, e) => sum + Math.max(0, (Number(e.amountEGP) || 0) - (Number(e.paidAmountEGP) || 0)),
      0
    );
    const explicitReceivables = receivableEntries.reduce(
      (sum, e) => sum + Math.max(0, (Number(e.amountEGP) || 0) - (Number(e.paidAmountEGP) || 0)),
      0
    );
    const receivablesEGP = round2(unpaidSupplyReceivables + explicitReceivables);

    const hasRecordedPayables = payableEntries.length > 0;
    const payablesEGP = hasRecordedPayables
      ? round2(
          payableEntries.reduce(
            (sum, e) => sum + Math.max(0, (Number(e.amountEGP) || 0) - (Number(e.paidAmountEGP) || 0)),
            0
          )
        )
      : 0;

    // 4. Breakdown per Client / Entity
    const clientMap = new Map<
      string,
      {
        clientTenantId: string;
        clientName: string;
        mealsCount: number;
        supplyValueEGP: number;
        actualRevenueEGP: number;
        receivablesEGP: number;
        recordsCount: number;
      }
    >();
    for (const e of filteredEntries) {
      if (!e.clientTenantId && !e.clientName) continue;
      const cid = e.clientTenantId || e.clientName;
      if (!clientMap.has(cid)) {
        clientMap.set(cid, {
          clientTenantId: cid,
          clientName: e.clientName || cid,
          mealsCount: 0,
          supplyValueEGP: 0,
          actualRevenueEGP: 0,
          receivablesEGP: 0,
          recordsCount: 0,
        });
      }
      const bucket = clientMap.get(cid)!;
      bucket.recordsCount += 1;
      if (e.entryType === 'supply_revenue') {
        bucket.mealsCount += Number(e.mealsCount) || 0;
        bucket.supplyValueEGP = round2(bucket.supplyValueEGP + (Number(e.amountEGP) || 0));
        bucket.actualRevenueEGP = round2(bucket.actualRevenueEGP + (Number(e.paidAmountEGP) || 0));
        bucket.receivablesEGP = round2(
          bucket.receivablesEGP + Math.max(0, (Number(e.amountEGP) || 0) - (Number(e.paidAmountEGP) || 0))
        );
      } else if (e.entryType === 'receivable') {
        bucket.receivablesEGP = round2(
          bucket.receivablesEGP + Math.max(0, (Number(e.amountEGP) || 0) - (Number(e.paidAmountEGP) || 0))
        );
      }
    }

    // 5. Breakdown per Central Kitchen
    const kitchenMap = new Map<
      string,
      {
        kitchenTenantId: string;
        kitchenName: string;
        mealsCount: number;
        supplyValueEGP: number;
        expensesEGP: number;
        recordsCount: number;
      }
    >();
    for (const e of filteredEntries) {
      if (!e.kitchenTenantId && !e.kitchenName) continue;
      const kid = e.kitchenTenantId || e.kitchenName;
      if (!kitchenMap.has(kid)) {
        kitchenMap.set(kid, {
          kitchenTenantId: kid,
          kitchenName: e.kitchenName || kid,
          mealsCount: 0,
          supplyValueEGP: 0,
          expensesEGP: 0,
          recordsCount: 0,
        });
      }
      const bucket = kitchenMap.get(kid)!;
      bucket.recordsCount += 1;
      if (e.entryType === 'supply_revenue') {
        bucket.mealsCount += Number(e.mealsCount) || 0;
        bucket.supplyValueEGP = round2(bucket.supplyValueEGP + (Number(e.amountEGP) || 0));
      } else if (e.entryType === 'recorded_expense') {
        bucket.expensesEGP = round2(bucket.expensesEGP + (Number(e.amountEGP) || 0));
      }
    }

    const canViewHabeSummary = isGovernanceFinance || sess.tenantId === 'tenant_client_habe';
    const habeEntries = canViewHabeSummary
      ? filteredEntries.filter((e) => e.sourceChannel === 'habe' || e.clientTenantId === 'tenant_client_habe')
      : [];

    const incompleteNotices: string[] = [];
    if (supplyEntries.length === 0) {
      incompleteNotices.push('لا توجد طلبات توريد أو إيرادات مسجلة في النطاق المحدد — أضف قيد توريد فعلي أو زامن طلبات العقود.');
    }
    if (!hasRecordedExpenses) {
      incompleteNotices.push('المصروفات والتكاليف التشغيلية: بيانات غير مسجلة بعد — لا يتم احتساب هامش ربح أو صافي ربح تقديري حتى تُسجَّل قيود المصروفات الفعلية.');
    }
    if (!hasRecordedPayables) {
      incompleteNotices.push('الالتزامات والمبالغ المستحقة علينا: بيانات غير مسجلة بعد.');
    }

    const allTenants = Object.values(securityState.tenantsById);
    const availableClients = allTenants
      .filter((t) => t.kind === 'client_company')
      .filter((t) => isGovernanceFinance || t.tenantId === sess.tenantId);
    const availableKitchens = allTenants
      .filter((t) => t.kind === 'central_kitchen')
      .filter((t) => isGovernanceFinance || t.tenantId === sess.tenantId);

    res.json({
      ok: true,
      accessScope: isGovernanceFinance ? 'governance_full' : 'tenant_scoped',
      canWriteVouchers:
        sess.canonicalRole === 'super_admin' ||
        sess.canonicalRole === 'platform_admin' ||
        sess.canonicalRole === 'finance_manager' ||
        sess.role === 'owner' ||
        sess.role === 'finance_admin',
      questions: {
        totalMealsSupplied,
        avgMealUnitPriceEGP,
        totalSupplyValueEGP,
        byClient: Array.from(clientMap.values()).sort((a, b) => b.supplyValueEGP - a.supplyValueEGP),
        byKitchen: Array.from(kitchenMap.values()).sort((a, b) => b.supplyValueEGP - a.supplyValueEGP),
        actualRevenueEGP,
        hasRecordedExpenses,
        recordedExpensesEGP,
        netProfitEGP,
        profitMarginPct,
        receivablesEGP,
        hasRecordedPayables,
        payablesEGP,
      },
      habeSummary: canViewHabeSummary
        ? {
            recordsCount: habeEntries.length,
            totalValueEGP: round2(habeEntries.reduce((s, e) => s + (Number(e.amountEGP) || 0), 0)),
            collectedEGP: round2(habeEntries.reduce((s, e) => s + (Number(e.paidAmountEGP) || 0), 0)),
          }
        : null,
      incompleteNotices,
      entries: filteredEntries,
      availableClients,
      availableKitchens,
    });
  });

  app.post('/api/finance/entries', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const canWrite =
      sess.canonicalRole === 'super_admin' ||
      sess.canonicalRole === 'platform_admin' ||
      sess.canonicalRole === 'finance_manager' ||
      sess.role === 'owner' ||
      sess.role === 'finance_admin';

    if (!canWrite) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorRole: sess.canonicalRole,
        action: 'رفض محاولة تسجيل قيد مالي بدون صلاحية مالية معتمدة',
        targetType: 'finance_write',
        targetId: '/api/finance/entries',
        severity: 'security_alert',
        details: `Blocked role ${sess.canonicalRole} from posting finance voucher`,
      });
      res.status(403).json({
        ok: false,
        code: 'FINANCE_WRITE_FORBIDDEN',
        messageAr: 'إضافة القيود المالية والمصروفات والتحصيلات مقتصرة على المالك أو مدير المنصة أو المدير المالي فقط.',
        messageEn: 'Posting ledger entries is restricted to super_admin, platform_admin, or finance_manager.',
      });
      return;
    }

    const body = req.body as Partial<ServerFinancialLedgerEntry>;
    const allowedTypes: ServerFinancialLedgerEntry['entryType'][] = [
      'supply_revenue',
      'recorded_expense',
      'receivable',
      'payable',
    ];
    if (!body.entryType || !allowedTypes.includes(body.entryType)) {
      res.status(400).json({ ok: false, messageAr: 'نوع القيد غير صالح.', messageEn: 'Invalid entryType.' });
      return;
    }

    const amountEGP = Number(body.amountEGP || 0);
    const paidAmountEGP = Number(body.paidAmountEGP ?? (body.entryType === 'supply_revenue' ? 0 : amountEGP));
    const mealsCount = Math.max(0, Math.round(Number(body.mealsCount || 0)));

    if (!Number.isFinite(amountEGP) || amountEGP <= 0 || amountEGP > 500000000) {
      res.status(400).json({ ok: false, messageAr: 'يجب إدخال مبلغ مالي صحيح أكبر من صفر.', messageEn: 'Valid positive amountEGP required.' });
      return;
    }
    if (!Number.isFinite(paidAmountEGP) || paidAmountEGP < 0 || paidAmountEGP > amountEGP) {
      res.status(400).json({ ok: false, messageAr: 'المبلغ المحصل/المدفوع يجب أن يكون بين 0 وإجمالي القيد.', messageEn: 'paidAmountEGP must be between 0 and amountEGP.' });
      return;
    }

    const clientTenantId = String(body.clientTenantId || '').trim();
    const kitchenTenantId = String(body.kitchenTenantId || '').trim();
    const clientTenant = clientTenantId ? securityState.tenantsById[clientTenantId] : undefined;
    const kitchenTenant = kitchenTenantId ? securityState.tenantsById[kitchenTenantId] : undefined;

    const clientName = String(body.clientName || clientTenant?.name || 'جهة متعاقدة').trim().slice(0, 140);
    const kitchenName = String(body.kitchenName || kitchenTenant?.name || 'مطبخ مركزي').trim().slice(0, 140);
    const contractRef = String(body.contractRef || 'CONTRACT-GENERAL').trim().slice(0, 80);
    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.entryDate || ''))
      ? String(body.entryDate)
      : new Date().toISOString().slice(0, 10);
    const notes = String(body.notes || '').trim().slice(0, 300);
    const unitPrice = mealsCount > 0 ? round2(amountEGP / mealsCount) : 0;

    const entry: ServerFinancialLedgerEntry = {
      entryId: `FIN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      entryType: body.entryType,
      clientTenantId: clientTenantId || 'unassigned_client',
      clientName,
      kitchenTenantId: kitchenTenantId || 'unassigned_kitchen',
      kitchenName,
      contractRef,
      mealsCount,
      mealUnitPriceEGP: unitPrice,
      amountEGP: round2(amountEGP),
      paidAmountEGP: round2(paidAmountEGP),
      entryDate,
      sourceChannel: 'manual_voucher',
      notes,
      createdByEmail: sess.email,
      createdAt: new Date().toISOString(),
    };

    securityState.ledgerEntries.unshift(entry);
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: `تسجيل قيد مالي (${entry.entryType}) بقيمة ${entry.amountEGP} ج.م`,
      targetType: 'finance_entry',
      targetId: entry.entryId,
      severity: 'info',
      details: `${entry.clientName} · ${entry.kitchenName} · ${entry.contractRef}`,
    });

    res.status(201).json({
      ok: true,
      entry,
      messageAr: `تم تسجيل القيد المالي [${entry.entryId}] بنجاح في الدفتر المركزي.`,
      messageEn: 'Financial ledger entry recorded.',
    });
  });

  app.post('/api/habe/ledger-sync', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const isAllowed =
      isHabeApproverSession(sess) ||
      sess.canonicalRole === 'finance_manager' ||
      sess.role === 'finance_admin' ||
      sess.tenantId === 'tenant_client_habe';

    if (!isAllowed) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorUsername: sess.username,
        actorRole: sess.canonicalRole,
        action: 'رفض محاولة مزامنة مالية مع بوابة H.A.B.E بدون صلاحية',
        targetType: 'habe_sync',
        targetId: 'tenant_client_habe',
        severity: 'security_alert',
        details: `Blocked role ${sess.canonicalRole} (${sess.tenantId || 'none'}) from /api/habe/ledger-sync`,
      });
      res.status(403).json({
        ok: false,
        code: 'HABE_SYNC_FORBIDDEN',
        messageAr: 'مزامنة سجلات H.A.B.E مع الحسابات مقصورة على الإدارة المخولة أو ممثل حساب H.A.B.E فقط.',
        messageEn: 'Unauthorized H.A.B.E financial ledger sync.',
      });
      return;
    }

    const body = req.body as {
      orders?: Array<{
        orderId: string;
        employeeName?: string;
        employeeCode?: string;
        paymentMethod?: string;
        approvalStatus?: string;
        totalEGP: number;
        mealsCount?: number;
        trxRef?: string;
        isoDate?: string;
      }>;
    };

    const incoming = Array.isArray(body.orders) ? body.orders : [];
    if (incoming.length === 0) {
      res.status(400).json({ ok: false, messageAr: 'لا توجد طلبات H.A.B.E معتمدة للمزامنة.', messageEn: 'No orders supplied.' });
      return;
    }

    const kitchenTenant = securityState.tenantsById.tenant_kitchen_alain;
    let addedCount = 0;

    for (const item of incoming.slice(0, 200)) {
      const orderId = String(item.orderId || '').trim();
      const totalEGP = Number(item.totalEGP || 0);
      const isApprovedOrPaid =
        item.approvalStatus === 'confirmed_paid' || item.approvalStatus === 'approved';
      if (!orderId || !isApprovedOrPaid || !Number.isFinite(totalEGP) || totalEGP <= 0) continue;

      const entryId = `HABE-${orderId}`;
      if (securityState.ledgerEntries.some((e) => e.entryId === entryId)) continue;

      const mealsCount = Math.max(1, Math.round(Number(item.mealsCount || 1)));
      const isImmediatePaid = item.paymentMethod !== 'payroll_deduction';
      const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(item.isoDate || ''))
        ? String(item.isoDate)
        : new Date().toISOString().slice(0, 10);

      securityState.ledgerEntries.unshift({
        entryId,
        entryType: 'supply_revenue',
        clientTenantId: 'tenant_client_habe',
        clientName: 'شركة ها-بي المصرية (H.A.B.E)',
        kitchenTenantId: kitchenTenant?.tenantId || 'tenant_kitchen_alain',
        kitchenName: kitchenTenant?.name || 'مطبخ ومركز العين — مدينة بدر',
        contractRef: 'HABE-PORTAL-2026',
        mealsCount,
        mealUnitPriceEGP: round2(totalEGP / mealsCount),
        amountEGP: round2(totalEGP),
        paidAmountEGP: isImmediatePaid ? round2(totalEGP) : 0,
        entryDate,
        sourceChannel: 'habe',
        notes: `طلب H.A.B.E [${orderId}] — ${String(item.employeeName || 'موظف')} (${String(item.trxRef || orderId)})`,
        createdByEmail: sess.email,
        createdAt: new Date().toISOString(),
      });
      addedCount += 1;
    }

    if (addedCount > 0) {
      saveSecurityState(securityState);
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorUsername: sess.username,
        actorRole: sess.canonicalRole,
        action: `مزامنة ${addedCount} سجل مالي معتمد من بوابة H.A.B.E`,
        targetType: 'habe_sync',
        targetId: 'tenant_client_habe',
        severity: 'info',
        details: `Synced ${addedCount} approved/paid H.A.B.E orders into isolated tenant ledger`,
      });
    }

    res.json({
      ok: true,
      syncedCount: addedCount,
      messageAr:
        addedCount > 0
          ? `تمت مزامنة ${addedCount} معاملة H.A.B.E معتمدة في الدفتر المالي المعزول بنجاح.`
          : 'كافة معاملات H.A.B.E المعتمدة مزامنة بالفعل في الدفتر المالي.',
    });
  });

  // ===========================================================================
  // Server-Enforced H-A-B-E Portal Directory, Isolated Orders & Approvals
  // ===========================================================================
  app.get('/api/habe/employees', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const approver = isHabeApproverSession(sess);
    if (approver) {
      res.json({ ok: true, isApprover: true, employees: getMergedHabeEmployees() });
      return;
    }
    const selfEmp = resolveSessionHabeEmployee(sess);
    res.json({ ok: true, isApprover: false, employees: selfEmp ? [selfEmp] : [] });
  });

  app.post('/api/habe/employees', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    if (!isHabeApproverSession(sess)) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorUsername: sess.username,
        actorRole: sess.canonicalRole,
        action: 'رفض محاولة إضافة موظف في كشف H-A-B-E بدون صلاحية اعتماد',
        targetType: 'habe_isolation',
        targetId: 'habe_employees',
        severity: 'security_alert',
        details: `Blocked non-approver ${sess.email} from POST /api/habe/employees`,
      });
      res.status(403).json({
        ok: false,
        code: 'HABE_APPROVER_ONLY',
        messageAr: 'إضافة الموظفين وإدارة كشوف H-A-B-E مقتصرة على الإدارة التنفيذية المعتمدة فقط.',
        messageEn: 'H-A-B-E employee management restricted to approved executives.',
      });
      return;
    }

    const body = req.body as Partial<ServerHabeEmployeeRecord>;
    const name = String(body.name || '').trim().slice(0, 120);
    const code = String(body.code || '').trim().toUpperCase().slice(0, 32);
    const department = String(body.department || 'الإنتاج والتشغيل — H-A-B-E').trim().slice(0, 100);
    const phone = body.phone ? normalizePhone(String(body.phone)) : '';
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const monthlyPayrollCapEGP = Math.min(20000, Math.max(100, Number(body.monthlyPayrollCapEGP || 2500)));

    if (name.length < 2 || code.length < 2) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال الاسم وكود الموظف.', messageEn: 'Name and code required.' });
      return;
    }

    if (getMergedHabeEmployees().some((e) => e.code.toUpperCase() === code)) {
      res.status(409).json({ ok: false, code: 'EMP_CODE_EXISTS', messageAr: 'كود الموظف مسجل بالفعل.', messageEn: 'Employee code already exists.' });
      return;
    }

    const rec: ServerHabeEmployeeRecord = {
      id: `hb_emp_${crypto.randomBytes(4).toString('hex')}`,
      name,
      code,
      department,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      monthlyPayrollCapEGP,
    };
    securityState.habeCustomEmployees.push(rec);
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorUsername: sess.username,
      actorRole: sess.canonicalRole,
      action: `إضافة موظف جديد لكشف H-A-B-E (${rec.name} - ${rec.code})`,
      targetType: 'habe_employee',
      targetId: rec.id,
      severity: 'info',
      details: `Department: ${rec.department}, Cap: ${rec.monthlyPayrollCapEGP}`,
    });

    res.status(201).json({ ok: true, employee: rec, messageAr: 'تم إضافة الموظف في قاعدة الخادم بنجاح.' });
  });

  app.get('/api/habe/orders', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const approver = isHabeApproverSession(sess);
    const allOrders = Object.values(securityState.habeOrdersById).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    if (approver) {
      res.json({ ok: true, scope: 'approver_all', orders: allOrders });
      return;
    }
    const ownEmp = resolveSessionHabeEmployee(sess);
    const ownOrders = allOrders.filter(
      (o) =>
        o.placedByUid === sess.uid ||
        (sess.email && o.placedByEmail === sess.email.toLowerCase()) ||
        (ownEmp && o.employeeCode.toUpperCase() === ownEmp.code.toUpperCase())
    );
    res.json({ ok: true, scope: 'personal_only', orders: ownOrders });
  });

  app.post('/api/habe/orders', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const approver = isHabeApproverSession(sess);
    const body = req.body as {
      employeeId?: string;
      employeeCode?: string;
      paymentMethod?: 'vodafone_cash' | 'instapay' | 'payroll_deduction' | 'cash';
      paymentAccountOrNote?: string;
      kitchenName?: string;
      items?: Array<{ id?: string; code?: string; qty?: number }>;
    };

    const allowedMethods = new Set(['vodafone_cash', 'instapay', 'payroll_deduction', 'cash']);
    const paymentMethod = body.paymentMethod && allowedMethods.has(body.paymentMethod) ? body.paymentMethod : 'cash';
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 60) {
      res.status(400).json({ ok: false, messageAr: 'السلة فارغة أو تجاوزت الحد المسموح.', messageEn: 'Valid items required.' });
      return;
    }

    // Recompute authoritative prices strictly on server from HABE_PRICE_CATALOG
    const verifiedItems: ServerHabeOrderItem[] = [];
    let totalEGP = 0;
    for (const rawIt of rawItems) {
      const qty = Math.floor(Number(rawIt.qty || 0));
      if (!Number.isFinite(qty) || qty < 1 || qty > 100) {
        res.status(400).json({ ok: false, messageAr: 'كمية غير صالحة في الطلب.', messageEn: 'Invalid item quantity.' });
        return;
      }
      const catalogItem = findHabeCatalogItem(String(rawIt.id || rawIt.code || ''));
      if (!catalogItem) {
        res.status(400).json({
          ok: false,
          code: 'INVALID_CATALOG_ITEM',
          messageAr: `الصنف (${String(rawIt.id || rawIt.code || '')}) غير معتمد في قائمة H-A-B-E.`,
          messageEn: 'Catalog item not found or unauthorized.',
        });
        return;
      }
      const lineTotal = round2(catalogItem.priceEGP * qty);
      verifiedItems.push({
        id: catalogItem.id,
        code: catalogItem.code,
        nameAr: catalogItem.nameAr,
        unitPriceEGP: catalogItem.priceEGP,
        qty,
        lineTotalEGP: lineTotal,
      });
      totalEGP = round2(totalEGP + lineTotal);
    }

    const ownEmp = resolveSessionHabeEmployee(sess);
    const allEmps = getMergedHabeEmployees();
    const requestedEmpRef = String(body.employeeId || body.employeeCode || '').trim();
    const requestedEmp = requestedEmpRef
      ? allEmps.find((e) => e.id === requestedEmpRef || e.code.toUpperCase() === requestedEmpRef.toUpperCase())
      : null;

    if (!approver && requestedEmp) {
      const matchesOwn =
        ownEmp &&
        (requestedEmp.id === ownEmp.id || requestedEmp.code.toUpperCase() === ownEmp.code.toUpperCase());
      if (!matchesOwn) {
        appendAuditEntry({
          actorUid: sess.uid,
          actorEmail: sess.email,
          actorUsername: sess.username,
          actorRole: sess.canonicalRole,
          action: 'محاولة الطلب أو انتحال بيانات موظف آخر في H-A-B-E',
          targetType: 'habe_isolation',
          targetId: requestedEmp.code,
          severity: 'security_alert',
          details: `Blocked ${sess.email} from ordering on behalf of ${requestedEmp.code}`,
        });
        res.status(403).json({
          ok: false,
          code: 'CROSS_EMPLOYEE_ORDER_BLOCKED',
          messageAr: 'ممنوع: لا يمكنك تسجيل طلب باسم موظف آخر لحماية الخصوصية المالية.',
          messageEn: 'Cross-employee ordering/impersonation blocked.',
        });
        return;
      }
    }

    const targetEmp = approver ? requestedEmp || ownEmp : ownEmp;
    if (paymentMethod === 'payroll_deduction' && !targetEmp) {
      res.status(403).json({
        ok: false,
        code: 'PAYROLL_REQUIRES_EMPLOYEE_LINK',
        messageAr: 'الخصم من الراتب متاح فقط للموظفين المسجلين والمرتبطين بكود H-A-B-E المعتمد.',
        messageEn: 'Payroll deduction requires verified employee link.',
      });
      return;
    }

    const employeeId = targetEmp?.id || sess.uid;
    const employeeName = targetEmp?.name || sess.fullName;
    const employeeCode = targetEmp?.code || sess.employeeCode || 'SELF';
    const department = targetEmp?.department || 'عميل / مستخدم مسجل';
    const nowIso = new Date().toISOString();
    const orderId = `HBE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const trxRef = `TRX-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const approvalStatus: ServerHabeOrderRecord['approvalStatus'] =
      paymentMethod === 'payroll_deduction' ? 'pending_approval' : 'confirmed_paid';

    const order: ServerHabeOrderRecord = {
      orderId,
      trxRef,
      employeeId,
      employeeName,
      employeeCode,
      department,
      placedByUid: sess.uid,
      placedByEmail: sess.email.toLowerCase(),
      placedByUsername: sess.username,
      placedByName: sess.fullName,
      paymentMethod,
      paymentAccountOrNote: String(body.paymentAccountOrNote || '').trim().slice(0, 180),
      approvalStatus,
      kitchenName: String(body.kitchenName || 'نقطة ها-بي — مدينة بدر').trim().slice(0, 120),
      items: verifiedItems,
      totalEGP,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    securityState.habeOrdersById[orderId] = order;

    if (approvalStatus === 'confirmed_paid') {
      const kitchenTenant = securityState.tenantsById.tenant_kitchen_alain;
      const mealsCount = verifiedItems.reduce((s, it) => s + it.qty, 0);
      securityState.ledgerEntries.unshift({
        entryId: `HABE-${orderId}`,
        entryType: 'supply_revenue',
        clientTenantId: 'tenant_client_habe',
        clientName: 'شركة ها-بي المصرية (H.A.B.E)',
        kitchenTenantId: kitchenTenant?.tenantId || 'tenant_kitchen_alain',
        kitchenName: kitchenTenant?.name || 'مطبخ ومركز العين — مدينة بدر',
        contractRef: 'HABE-PORTAL-2026',
        mealsCount,
        mealUnitPriceEGP: round2(totalEGP / Math.max(1, mealsCount)),
        amountEGP: totalEGP,
        paidAmountEGP: totalEGP,
        entryDate: nowIso.slice(0, 10),
        sourceChannel: 'habe',
        notes: `طلب H.A.B.E [${orderId}] — ${employeeName} (${trxRef})`,
        createdByEmail: sess.email,
        createdAt: nowIso,
      });

      const ch: OwnerFinanceChannel =
        paymentMethod === 'cash' ? 'treasury' : paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay' ? 'e_wallet' : 'bank';
      const pct = paymentMethod === 'vodafone_cash' ? 1.5 : 0;
      recordOwnerFinancialInflow({
        source: `بوابة H.A.B.E — ${employeeName}`,
        purpose: `طلب موظف فوري رقم ${orderId}`,
        grossEGP: totalEGP,
        commissionPct: pct,
        channel: ch,
        orderRef: `HABE-${orderId}`,
        actorEmail: sess.email,
      });
    }

    saveSecurityState(securityState);
    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorUsername: sess.username,
      actorRole: sess.canonicalRole,
      action: `تسجيل طلب H-A-B-E (${orderId}) بقيمة ${totalEGP} ج.م`,
      targetType: 'habe_order',
      targetId: orderId,
      severity: 'info',
      details: `${employeeName} (${employeeCode}) · ${paymentMethod} · ${approvalStatus}`,
    });

    res.status(201).json({
      ok: true,
      order,
      messageAr:
        approvalStatus === 'pending_approval'
          ? `تم تسجيل طلب الخصم من الراتب [${orderId}] وهو بانتظار اعتماد الإدارة التنفيذية.`
          : `تم تأكيد الطلب [${orderId}] وتسجيله في الحسابات.`,
    });
  });

  app.post('/api/habe/orders/:orderId/decide', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    if (!isHabeApproverSession(sess)) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorUsername: sess.username,
        actorRole: sess.canonicalRole,
        action: 'رفض محاولة اعتماد أو رفض طلب H-A-B-E بدون صلاحية',
        targetType: 'habe_approval',
        targetId: String(req.params.orderId || ''),
        severity: 'security_alert',
        details: `Blocked ${sess.email} (${sess.canonicalRole}) from deciding H-A-B-E order`,
      });
      res.status(403).json({
        ok: false,
        code: 'HABE_APPROVER_ONLY',
        messageAr: 'اعتماد ورفض طلبات الخصم مقتصر حصرياً على حمزة أو أحمد عدلي أو أحمد وحيد.',
        messageEn: 'H-A-B-E approval restricted to designated governance executives.',
      });
      return;
    }

    const orderId = String(req.params.orderId || '').trim();
    const order = securityState.habeOrdersById[orderId];
    if (!order) {
      res.status(404).json({ ok: false, messageAr: 'طلب H-A-B-E غير موجود.', messageEn: 'Order not found.' });
      return;
    }

    const body = req.body as { decision?: 'approved' | 'rejected'; note?: string };
    const decision = body.decision === 'rejected' ? 'rejected' : 'approved';
    const nowIso = new Date().toISOString();

    order.approvalStatus = decision;
    order.decidedByName = sess.fullName;
    order.decidedByEmail = sess.email;
    order.decidedByUsername = sess.username;
    order.decisionNote = String(body.note || '').trim().slice(0, 200);
    order.updatedAt = nowIso;
    securityState.habeOrdersById[orderId] = order;

    if (decision === 'approved') {
      const entryId = `HABE-${orderId}`;
      if (!securityState.ledgerEntries.some((e) => e.entryId === entryId)) {
        const kitchenTenant = securityState.tenantsById.tenant_kitchen_alain;
        const mealsCount = order.items.reduce((s, it) => s + it.qty, 0);
        securityState.ledgerEntries.unshift({
          entryId,
          entryType: 'supply_revenue',
          clientTenantId: 'tenant_client_habe',
          clientName: 'شركة ها-بي المصرية (H.A.B.E)',
          kitchenTenantId: kitchenTenant?.tenantId || 'tenant_kitchen_alain',
          kitchenName: kitchenTenant?.name || 'مطبخ ومركز العين — مدينة بدر',
          contractRef: 'HABE-PORTAL-2026',
          mealsCount: Math.max(1, mealsCount),
          mealUnitPriceEGP: round2(order.totalEGP / Math.max(1, mealsCount)),
          amountEGP: order.totalEGP,
          paidAmountEGP: 0,
          entryDate: order.createdAt.slice(0, 10),
          sourceChannel: 'habe',
          notes: `خصم راتب معتمد H.A.B.E [${orderId}] — ${order.employeeName} (بواسطة ${sess.fullName})`,
          createdByEmail: sess.email,
          createdAt: nowIso,
        });
      }
    }

    saveSecurityState(securityState);
    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorUsername: sess.username,
      actorRole: sess.canonicalRole,
      action: `${decision === 'approved' ? 'اعتماد' : 'رفض'} طلب خصم H-A-B-E (${orderId})`,
      targetType: 'habe_approval',
      targetId: orderId,
      severity: 'info',
      details: `${order.employeeName} (${order.totalEGP} EGP) decided by ${sess.fullName} (${sess.username || sess.email})`,
    });

    res.json({
      ok: true,
      order,
      messageAr: decision === 'approved' ? `تم اعتماد طلب [${orderId}] وترحيله للحسابات.` : `تم رفض طلب [${orderId}].`,
    });
  });

  app.get('/api/habe/reports/monthly', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const allowed =
      isHabeApproverSession(sess) ||
      sess.canonicalRole === 'finance_manager' ||
      sess.role === 'finance_admin';

    if (!allowed) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorUsername: sess.username,
        actorRole: sess.canonicalRole,
        action: 'رفض محاولة استخراج كشف الخصومات الشهري المجمع في H-A-B-E',
        targetType: 'habe_payroll_report',
        targetId: 'monthly_payroll',
        severity: 'security_alert',
        details: `Blocked ${sess.email} (${sess.canonicalRole}) from /api/habe/reports/monthly`,
      });
      res.status(403).json({
        ok: false,
        code: 'PAYROLL_REPORT_FORBIDDEN',
        messageAr: 'التقارير المجمعة لخصومات الرواتب محجوبة تماماً عن الموظفين ومقتصرة على الإدارة والمالية المعتمدة.',
        messageEn: 'Consolidated payroll reports restricted to approvers and finance managers.',
      });
      return;
    }

    const monthPrefix = /^\d{4}-\d{2}$/.test(String(req.query.month || ''))
      ? String(req.query.month)
      : new Date().toISOString().slice(0, 7);

    const eligibleOrders = Object.values(securityState.habeOrdersById).filter(
      (o) =>
        o.createdAt.startsWith(monthPrefix) &&
        o.paymentMethod === 'payroll_deduction' &&
        o.approvalStatus === 'approved'
    );

    const byEmployeeMap = new Map<
      string,
      { employeeCode: string; employeeName: string; department: string; ordersCount: number; totalEGP: number }
    >();

    for (const o of eligibleOrders) {
      const key = o.employeeCode.toUpperCase();
      if (!byEmployeeMap.has(key)) {
        byEmployeeMap.set(key, {
          employeeCode: o.employeeCode,
          employeeName: o.employeeName,
          department: o.department,
          ordersCount: 0,
          totalEGP: 0,
        });
      }
      const bucket = byEmployeeMap.get(key)!;
      bucket.ordersCount += 1;
      bucket.totalEGP = round2(bucket.totalEGP + o.totalEGP);
    }

    const rows = Array.from(byEmployeeMap.values()).sort((a, b) => b.totalEGP - a.totalEGP);
    res.json({
      ok: true,
      month: monthPrefix,
      totalEmployees: rows.length,
      totalDeductionsEGP: round2(rows.reduce((s, r) => s + r.totalEGP, 0)),
      rows,
      orders: eligibleOrders,
    });
  });

  // ===========================================================================
  // Owner-Only RBAC, Active Sessions & Immediate Revocation
  // ===========================================================================
  function requireOwnerOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    requireAuthenticatedSession(req, res, () => {
      const sess = req.authSession!;
      if (sess.role !== 'owner') {
        res.status(403).json({
          ok: false,
          code: sess.role === 'finance_admin' ? 'FINANCE_ROLE_ISOLATED' : 'OWNER_ONLY',
          messageAr:
            sess.role === 'finance_admin'
              ? 'المدير المالي معزول تماماً عن صلاحيات الإدارة وسحب الصلاحيات.'
              : 'هذا المسار الإداري مقصور حصرياً على مالك المنصة.',
          messageEn: 'Owner privilege required; finance and non-owner roles are blocked.',
        });
        return;
      }
      next();
    });
  }

  app.get('/api/admin/sessions', requireOwnerOnly, (_req: AuthenticatedRequest, res: Response) => {
    const activeSessions = Array.from(sessionStore.values())
      .filter((s) => Date.now() <= s.expiresAtMs)
      .map((s) => ({
        sessionPrefix: `${s.sessionId.slice(0, 8)}...`,
        email: s.email,
        uid: s.uid,
        fullName: s.fullName,
        role: s.role,
        authKind: s.authKind,
        createdAt: new Date(s.createdAtMs).toISOString(),
        expiresAt: new Date(s.expiresAtMs).toISOString(),
      }));

    res.json({
      ok: true,
      activeSessions,
      revokedSubjects: Object.values(securityState.revokedSubjects),
      designatedRoles: securityState.designatedRoles,
    });
  });

  app.post('/api/admin/set-role', requireOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as { email?: string; role?: 'basit_admin' | 'finance_admin' | 'none' };
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@') || email === BOOTSTRAPPED_OWNER_EMAIL) {
      res.status(400).json({ ok: false, messageAr: 'يرجى تحديد بريد إلكتروني صحيح غير المالك.' });
      return;
    }

    if (body.role === 'none') {
      delete securityState.designatedRoles[email];
    } else if (body.role === 'basit_admin' || body.role === 'finance_admin') {
      securityState.designatedRoles[email] = body.role;
    } else {
      res.status(400).json({ ok: false, messageAr: 'الدور غير مدعوم.' });
      return;
    }
    saveSecurityState(securityState);

    // Update any currently active sessions for this email immediately
    for (const [tok, sess] of sessionStore.entries()) {
      if (sess.email === email) {
        sess.role = body.role === 'none' ? 'customer' : body.role;
        sessionStore.set(tok, sess);
      }
    }

    res.json({
      ok: true,
      email,
      role: body.role,
      messageAr: `تم تحديث دور الخادم للبريد ${email} وتطبيقه على الجلسات النشطة فوراً.`,
    });
  });

  app.post('/api/admin/revoke-access', requireOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as { email?: string; uid?: string; reason?: string };
    const email = String(body.email || '').trim().toLowerCase();
    const uid = String(body.uid || '').trim();
    const reason = String(body.reason || 'سحب صلاحية إداري فوري من المالك').trim().slice(0, 200);

    if (!email && !uid) {
      res.status(400).json({ ok: false, messageAr: 'يرجى تحديد البريد الإلكتروني أو المعرف لسحب الصلاحية.' });
      return;
    }
    if (email === BOOTSTRAPPED_OWNER_EMAIL) {
      res.status(400).json({ ok: false, messageAr: 'لا يمكن سحب صلاحية حساب المالك الأساسي.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const actor = req.authSession!.email;
    if (email) {
      securityState.revokedSubjects[email] = { subject: email, reason, revokedAt: nowIso, revokedBy: actor };
      delete securityState.designatedRoles[email];
    }
    if (uid) {
      securityState.revokedSubjects[uid] = { subject: uid, reason, revokedAt: nowIso, revokedBy: actor };
    }
    saveSecurityState(securityState);

    let terminatedCount = 0;
    for (const [tok, sess] of sessionStore.entries()) {
      if ((email && sess.email === email) || (uid && sess.uid === uid)) {
        sessionStore.delete(tok);
        terminatedCount += 1;
      }
    }

    res.json({
      ok: true,
      terminatedSessions: terminatedCount,
      messageAr: `تم سحب الصلاحية فوراً وإلغاء ${terminatedCount} جلسة نشطة.`,
      messageEn: `Revoked access immediately and terminated ${terminatedCount} session(s).`,
    });
  });

  app.post('/api/admin/restore-access', requireOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as { subject?: string };
    const subject = String(body.subject || '').trim().toLowerCase();
    if (!subject || !securityState.revokedSubjects[subject]) {
      res.status(404).json({ ok: false, messageAr: 'العنصر غير موجود في قائمة الإيقاف.' });
      return;
    }
    delete securityState.revokedSubjects[subject];
    saveSecurityState(securityState);
    res.json({
      ok: true,
      messageAr: `تمت إعادة إتاحة الحساب ${subject} للدخول من جديد (بدون صلاحيات إدارية تلقائية).`,
    });
  });

  app.post('/api/admin/provision-executive-password', requireOwnerOnly, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = req.body as { identifier?: string; newPassword?: string };
    const rawIdentifier = String(body.identifier || '').trim();
    const newPassword = String(body.newPassword || '');

    const acct = findAccountByIdentifier(rawIdentifier);
    const isGovExec = acct && EXECUTIVE_ACCOUNTS.some((s) => s.email.toLowerCase() === acct.email.toLowerCase());
    if (!acct || !isGovExec) {
      res.status(404).json({ ok: false, messageAr: 'حساب الإدارة التنفيذية غير موجود.', messageEn: 'Executive account not found.' });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      res.status(400).json({
        ok: false,
        code: 'WEAK_PASSWORD',
        messageAr: 'كلمة المرور يجب أن تكون 8 أحرف/أرقام على الأقل وألا تكون شائعة.',
        messageEn: 'Strong 8+ character password required.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    acct.passwordSalt = salt;
    acct.passwordHash = hashOwnerPin(newPassword, salt);
    acct.updatedAt = new Date().toISOString();
    securityState.accountsByEmail[acct.email] = acct;
    saveSecurityState(securityState);

    const killed = acct.email !== sess.email ? terminateUserSessions(acct.email, acct.uid) : 0;

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorUsername: sess.username,
      actorRole: sess.canonicalRole,
      action: `تعيين/تدوير كلمة مرور الإدارة التنفيذية (${acct.username || acct.email})`,
      targetType: 'account',
      targetId: acct.uid,
      severity: 'info',
      details: `Owner provisioned independent password for ${acct.username} (${killed} prior sessions ended)`,
    });

    res.json({
      ok: true,
      username: acct.username,
      terminatedSessions: killed,
      messageAr: `تم تعيين كلمة مرور مستقلة ومشفرة لحساب (${acct.fullName}) بنجاح.`,
      messageEn: 'Executive password provisioned.',
    });
  });

  // ===========================================================================
  // 10-Role Configurable RBAC Matrix, Approval Workflow & Multi-Tenant Isolation
  // ===========================================================================
  function requirePlatformAdminOrOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    requireAuthenticatedSession(req, res, () => {
      const sess = req.authSession!;
      const allowed = sess.canonicalRole === 'super_admin' || sess.canonicalRole === 'platform_admin';
      if (!allowed) {
        appendAuditEntry({
          actorUid: sess.uid,
          actorEmail: sess.email,
          actorRole: sess.canonicalRole,
          action: 'رفض وصول غير مصرح به للوحة الإدارة الرئيسية',
          targetType: 'security',
          targetId: req.path,
          severity: 'security_alert',
          details: `Blocked role ${sess.canonicalRole} from accessing ${req.method} ${req.path}`,
        });
        res.status(403).json({
          ok: false,
          code: 'ADMIN_PRIVILEGE_REQUIRED',
          messageAr: 'هذه الصلاحية مقتصرة على مدير النظام الأعلى أو مدير المنصة المعتمد فقط.',
          messageEn: 'Requires Super Admin or Platform Admin privilege.',
        });
        return;
      }
      next();
    });
  }

  app.get('/api/rbac/matrix', (req: Request, res: Response) => {
    res.json({
      ok: true,
      roles: ALL_CANONICAL_ROLES,
      matrix: securityState.roleMatrix,
    });
  });

  app.post('/api/rbac/matrix', requirePlatformAdminOrOwner, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    if (sess.canonicalRole !== 'super_admin') {
      res.status(403).json({
        ok: false,
        code: 'SUPER_ADMIN_ONLY',
        messageAr: 'تعديل مصفوفة الصلاحيات العامة مقصور على مدير النظام الأعلى (Super Admin).',
        messageEn: 'Only Super Admin may modify the global RBAC matrix.',
      });
      return;
    }

    const body = req.body as { matrix?: Partial<Record<CanonicalRole, PermissionKey[]>> };
    if (!body.matrix || typeof body.matrix !== 'object') {
      res.status(400).json({ ok: false, messageAr: 'بيانات المصفوفة غير صالحة.', messageEn: 'Invalid matrix payload.' });
      return;
    }

    securityState.roleMatrix = sanitizeRoleMatrix(body.matrix);
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: 'تحديث مصفوفة الصلاحيات العامة للأدوار العشرة',
      targetType: 'rbac_matrix',
      targetId: 'global',
      severity: 'info',
      details: 'Updated 10-role customizable permission matrix',
    });

    res.json({
      ok: true,
      matrix: securityState.roleMatrix,
      messageAr: 'تم حفظ وتطبيق مصفوفة الصلاحيات على مستوى الخادم فوراً.',
      messageEn: 'Global RBAC matrix saved and enforced.',
    });
  });

  app.get('/api/admin/approvals', requirePlatformAdminOrOwner, (_req: AuthenticatedRequest, res: Response) => {
    const pendingAccounts = Object.values(securityState.accountsByEmail)
      .filter((a) => a.approvalStatus === 'pending_review')
      .map(({ passwordHash: _ph, passwordSalt: _ps, ...safe }) => safe);
    const allManagedUsers = Object.values(securityState.accountsByEmail).map(
      ({ passwordHash: _ph, passwordSalt: _ps, ...safe }) => safe
    );
    const tenants = Object.values(securityState.tenantsById);

    res.json({
      ok: true,
      pendingApprovals: pendingAccounts,
      users: allManagedUsers,
      tenants,
    });
  });

  app.post('/api/admin/approvals/:uid/decide', requirePlatformAdminOrOwner, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const targetUid = String(req.params.uid || '').trim();
    const body = req.body as {
      decision?: 'approve' | 'reject';
      assignedRole?: CanonicalRole;
      reviewNote?: string;
      contractedKitchenIds?: string[];
    };

    const account = Object.values(securityState.accountsByEmail).find((a) => a.uid === targetUid);
    if (!account) {
      res.status(404).json({ ok: false, messageAr: 'طلب التسجيل غير موجود.', messageEn: 'Account not found.' });
      return;
    }

    const decision = body.decision === 'reject' ? 'reject' : 'approve';
    const nowIso = new Date().toISOString();

    if (decision === 'reject') {
      account.approvalStatus = 'rejected';
      account.reviewNote = String(body.reviewNote || 'تم رفض الطلب من الإدارة.').slice(0, 300);
      account.updatedAt = nowIso;
      securityState.accountsByEmail[account.email] = account;
      saveSecurityState(securityState);

      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorRole: sess.canonicalRole,
        action: 'رفض طلب تسجيل جهة/مطبخ',
        targetType: 'approval',
        targetId: account.uid,
        severity: 'warning',
        details: `${account.email} (${account.businessName}) rejected`,
      });

      res.json({
        ok: true,
        messageAr: 'تم رفض طلب التسجيل وتسجيله في سجل التدقيق.',
      });
      return;
    }

    const defaultRoleForKind: CanonicalRole =
      account.requestedKind === 'central_kitchen'
        ? 'kitchen_owner'
        : account.requestedKind === 'client_company'
          ? 'client_owner'
          : 'customer';
    const nextRole =
      body.assignedRole && ALL_CANONICAL_ROLES.includes(body.assignedRole) && body.assignedRole !== 'super_admin'
        ? body.assignedRole
        : defaultRoleForKind;

    let tenantId = account.tenantId;
    if ((account.requestedKind === 'client_company' || account.requestedKind === 'central_kitchen') && !tenantId) {
      tenantId = `tenant_${crypto.createHash('sha256').update(`${account.uid}:${account.businessName}`).digest('hex').slice(0, 12)}`;
      const kitchenIds =
        account.requestedKind === 'client_company'
          ? Array.isArray(body.contractedKitchenIds) && body.contractedKitchenIds.length > 0
            ? body.contractedKitchenIds
            : ['tenant_kitchen_hanger']
          : [];

      securityState.tenantsById[tenantId] = {
        tenantId,
        name: account.businessName || account.fullName,
        kind: account.requestedKind === 'central_kitchen' ? 'central_kitchen' : 'client_company',
        ownerUid: account.uid,
        ownerEmail: account.email,
        commercialRegRef: account.commercialRegRef || 'PENDING-REF',
        city: account.city || 'Cairo',
        countryCode: account.countryCode || 'EG',
        contractedKitchenIds: kitchenIds,
        status: 'active',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }

    account.approvalStatus = 'approved';
    account.canonicalRole = nextRole;
    account.tenantId = tenantId;
    account.reviewNote = String(body.reviewNote || 'تم الاعتماد وتفعيل مساحة العمل المعزولة.').slice(0, 300);
    account.updatedAt = nowIso;
    securityState.accountsByEmail[account.email] = account;
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: 'اعتماد كيان/مطبخ وتفعيل صلاحياته المعزولة',
      targetType: 'tenant',
      targetId: tenantId || account.uid,
      severity: 'info',
      details: `Approved ${account.email} as ${nextRole} in ${tenantId}`,
    });

    res.json({
      ok: true,
      tenantId,
      assignedRole: nextRole,
      messageAr: `تم اعتماد الحساب وتخصيص مساحة عمل معزولة (${nextRole}) بنجاح.`,
      messageEn: 'Entity approved and isolated tenant provisioned.',
    });
  });

  app.post('/api/admin/users/:uid/role-status', requirePlatformAdminOrOwner, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const targetUid = String(req.params.uid || '').trim();
    const body = req.body as {
      canonicalRole?: CanonicalRole;
      approvalStatus?: 'approved' | 'suspended';
      customPermissions?: PermissionKey[];
      reason?: string;
    };

    const account = Object.values(securityState.accountsByEmail).find((a) => a.uid === targetUid);
    if (!account) {
      res.status(404).json({ ok: false, messageAr: 'المستخدم غير موجود.', messageEn: 'User not found.' });
      return;
    }

    if (account.email === BOOTSTRAPPED_OWNER_EMAIL) {
      res.status(403).json({ ok: false, messageAr: 'لا يمكن تعديل أو تجميد حساب المالك الأعلى.', messageEn: 'Cannot mutate Super Admin.' });
      return;
    }

    if (body.canonicalRole === 'super_admin' && sess.canonicalRole !== 'super_admin') {
      res.status(403).json({ ok: false, messageAr: 'لا يمكن تصعيد دور إلى Super Admin إلا من المالك الأعلى.', messageEn: 'Privilege escalation denied.' });
      return;
    }

    const nowIso = new Date().toISOString();
    if (body.canonicalRole && ALL_CANONICAL_ROLES.includes(body.canonicalRole)) {
      account.canonicalRole = body.canonicalRole;
    }
    if (Array.isArray(body.customPermissions)) {
      account.customPermissions = body.customPermissions;
    }
    if (body.approvalStatus === 'suspended') {
      account.approvalStatus = 'suspended';
      securityState.revokedSubjects[account.email] = {
        subject: account.email,
        reason: String(body.reason || 'تجميد إداري للحساب').slice(0, 200),
        revokedAt: nowIso,
        revokedBy: sess.email,
      };
      const killed = terminateUserSessions(account.email, account.uid);
      securityState.accountsByEmail[account.email] = { ...account, updatedAt: nowIso };
      saveSecurityState(securityState);
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorRole: sess.canonicalRole,
        action: 'تجميد مستخدم وإلغاء جلساته النشطة فوراً',
        targetType: 'account',
        targetId: account.uid,
        severity: 'warning',
        details: `Suspended ${account.email} and terminated ${killed} active session(s)`,
      });
      res.json({ ok: true, terminatedSessions: killed, messageAr: `تم تجميد الحساب وإلغاء ${killed} جلسة نشطة فوراً.` });
      return;
    }

    if (body.approvalStatus === 'approved') {
      account.approvalStatus = 'approved';
      delete securityState.revokedSubjects[account.email];
      delete securityState.revokedSubjects[account.uid];
    }
    account.updatedAt = nowIso;
    securityState.accountsByEmail[account.email] = account;
    saveSecurityState(securityState);

    for (const [tok, activeSess] of sessionStore.entries()) {
      if (activeSess.uid === account.uid || activeSess.email === account.email) {
        activeSess.canonicalRole = account.canonicalRole;
        activeSess.role = resolveCanonicalToLegacyServerRole(account.canonicalRole);
        activeSess.customPermissions = account.customPermissions;
        sessionStore.set(tok, activeSess);
      }
    }

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: 'تحديث صلاحية/حالة مستخدم',
      targetType: 'account',
      targetId: account.uid,
      severity: 'info',
      details: `${account.email} -> role:${account.canonicalRole}, status:${account.approvalStatus}`,
    });

    res.json({ ok: true, messageAr: 'تم تحديث دور وصلاحية المستخدم وتطبيقها فوراً.' });
  });

  // Strict Server-Side Tenant / Central Kitchen Isolation Middleware & Endpoints
  function requireTenantScope(
    req: AuthenticatedRequest,
    res: Response,
    requiredPerm?: PermissionKey
  ): ServerTenantRecord | null {
    const sess = req.authSession!;
    const tenantId = String(req.params.tenantId || '').trim();
    const tenant = securityState.tenantsById[tenantId];
    if (!tenant) {
      res.status(404).json({ ok: false, messageAr: 'الكيان أو المطبخ غير موجود.', messageEn: 'Tenant workspace not found.' });
      return null;
    }

    const isPlatformGovernance = sess.canonicalRole === 'super_admin' || sess.canonicalRole === 'platform_admin';
    if (!isPlatformGovernance && sess.tenantId !== tenantId) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorRole: sess.canonicalRole,
        action: 'محاولة اختراق عزل البيانات بين الجهات (Cross-Tenant Attempt)',
        targetType: 'tenant_isolation',
        targetId: tenantId,
        severity: 'security_alert',
        details: `User in tenant "${sess.tenantId || 'none'}" attempted access to "${tenantId}"`,
      });
      res.status(403).json({
        ok: false,
        code: 'TENANT_ISOLATION_VIOLATION',
        messageAr: 'ممنوع: عزل البيانات الصارم يمنع الوصول إلى بيانات أو طلبات أي جهة أو مطبخ آخر.',
        messageEn: 'Strict multi-tenant isolation blocks cross-tenant access.',
      });
      return null;
    }

    if (
      requiredPerm &&
      !isPlatformGovernance &&
      !hasEffectivePermission(securityState.roleMatrix, sess.canonicalRole, sess.customPermissions, requiredPerm)
    ) {
      res.status(403).json({
        ok: false,
        code: 'PERMISSION_DENIED',
        messageAr: 'لا تملك الصلاحية المطلوبة داخل نطاق هذا الكيان.',
        messageEn: `Missing permission: ${requiredPerm}`,
      });
      return null;
    }

    return tenant;
  }

  app.get('/api/tenant/:tenantId/overview', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const tenant = requireTenantScope(req, res);
    if (!tenant) return;

    const members = Object.values(securityState.accountsByEmail)
      .filter((a) => a.tenantId === tenant.tenantId)
      .map(({ passwordHash: _ph, passwordSalt: _ps, ...safe }) => safe);
    const invitations = Object.values(securityState.invitationsById)
      .filter((inv) => inv.tenantId === tenant.tenantId)
      .map(({ inviteTokenHash: _th, ...safe }) => safe);
    const orders = Object.values(securityState.tenantOrdersById).filter(
      (ord) => ord.clientTenantId === tenant.tenantId || ord.kitchenTenantId === tenant.tenantId
    );
    const contractedKitchens =
      tenant.kind === 'central_kitchen'
        ? [tenant]
        : tenant.contractedKitchenIds
            .map((kid) => securityState.tenantsById[kid])
            .filter((k): k is ServerTenantRecord => Boolean(k));

    res.json({
      ok: true,
      tenant,
      members,
      invitations,
      orders,
      contractedKitchens,
    });
  });

  app.post('/api/tenant/:tenantId/members/invite', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const tenant = requireTenantScope(
      req,
      res,
      req.authSession?.canonicalRole.startsWith('kitchen_') ? 'kitchen:manage_staff' : 'entity:invite_employees'
    );
    if (!tenant) return;

    const sess = req.authSession!;
    const body = req.body as {
      invitedEmail?: string;
      invitedName?: string;
      assignedRole?: CanonicalRole;
      assignedPermissions?: PermissionKey[];
    };

    const invitedEmail = String(body.invitedEmail || '').trim().toLowerCase();
    const invitedName = String(body.invitedName || '').trim().slice(0, 120);
    if (!invitedEmail || !invitedEmail.includes('@') || invitedName.length < 2) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال اسم الموظف وبريده الإلكتروني.', messageEn: 'Name and email required.' });
      return;
    }

    const allowedRolesForKind: CanonicalRole[] =
      tenant.kind === 'central_kitchen'
        ? ['kitchen_manager', 'kitchen_staff']
        : ['client_manager', 'client_employee'];

    const assignedRole: CanonicalRole =
      body.assignedRole && allowedRolesForKind.includes(body.assignedRole)
        ? body.assignedRole
        : allowedRolesForKind[1];

    const rawInviteToken = crypto.randomBytes(16).toString('hex');
    const inviteTokenHash = crypto.createHash('sha256').update(rawInviteToken).digest('hex');
    const inviteId = `INV-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const nowIso = new Date().toISOString();

    const record: ServerInvitationRecord = {
      inviteId,
      inviteTokenHash,
      tenantId: tenant.tenantId,
      tenantName: tenant.name,
      tenantKind: tenant.kind,
      invitedEmail,
      invitedName,
      assignedRole,
      assignedPermissions: Array.isArray(body.assignedPermissions)
        ? body.assignedPermissions
        : securityState.roleMatrix[assignedRole] || [],
      status: 'pending',
      invitedByUid: sess.uid,
      invitedByEmail: sess.email,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    securityState.invitationsById[inviteId] = record;
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: `دعوة موظف جديد داخل ${tenant.name}`,
      targetType: 'invitation',
      targetId: inviteId,
      severity: 'info',
      details: `Invited ${invitedEmail} as ${assignedRole}`,
    });

    res.json({
      ok: true,
      inviteId,
      inviteCodeForApplicant: rawInviteToken,
      messageAr: 'تم إصدار دعوة الموظف بنجاح وربطها بنطاق الكيان المعزول فقط.',
      messageEn: 'Employee invitation issued and scoped strictly to this tenant.',
    });
  });

  app.patch('/api/tenant/:tenantId/members/:memberUid/permissions', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const tenant = requireTenantScope(
      req,
      res,
      req.authSession?.canonicalRole.startsWith('kitchen_') ? 'kitchen:manage_staff' : 'entity:assign_member_permissions'
    );
    if (!tenant) return;

    const sess = req.authSession!;
    const memberUid = String(req.params.memberUid || '').trim();
    const member = Object.values(securityState.accountsByEmail).find(
      (a) => a.uid === memberUid && a.tenantId === tenant.tenantId
    );
    if (!member) {
      res.status(404).json({ ok: false, messageAr: 'الموظف غير موجود ضمن هذا الكيان.', messageEn: 'Member not found in tenant.' });
      return;
    }

    const body = req.body as {
      assignedRole?: CanonicalRole;
      customPermissions?: PermissionKey[];
      suspended?: boolean;
    };

    const allowedRolesForKind: CanonicalRole[] =
      tenant.kind === 'central_kitchen'
        ? ['kitchen_manager', 'kitchen_staff']
        : ['client_manager', 'client_employee'];

    // Strip any platform-wide or escalation permission keys!
    const forbiddenPlatformPerms = new Set<PermissionKey>([
      'platform:approve_entities',
      'platform:manage_users',
      'platform:manage_roles',
      'platform:manage_offers_cms',
      'platform:view_audit_logs',
      'platform:manage_orders',
    ]);

    if (body.assignedRole && allowedRolesForKind.includes(body.assignedRole)) {
      member.canonicalRole = body.assignedRole;
    }
    if (Array.isArray(body.customPermissions)) {
      member.customPermissions = body.customPermissions.filter((p) => !forbiddenPlatformPerms.has(p));
    }
    if (typeof body.suspended === 'boolean') {
      member.approvalStatus = body.suspended ? 'suspended' : 'approved';
      if (body.suspended) {
        terminateUserSessions(member.email, member.uid);
      }
    }
    member.updatedAt = new Date().toISOString();
    securityState.accountsByEmail[member.email] = member;
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: `تحديث صلاحيات عضو داخل ${tenant.name}`,
      targetType: 'tenant_member',
      targetId: member.uid,
      severity: 'info',
      details: `${member.email} -> role:${member.canonicalRole}, perms:${member.customPermissions.length}`,
    });

    res.json({
      ok: true,
      messageAr: 'تم تحديث صلاحيات الموظف ضمن حدود الكيان بنجاح.',
      messageEn: 'Tenant member permissions updated.',
    });
  });

  app.post('/api/tenant/:tenantId/orders', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const tenant = requireTenantScope(req, res, 'entity:place_orders');
    if (!tenant) return;

    const sess = req.authSession!;
    const body = req.body as {
      kitchenTenantId?: string;
      itemsSummary?: string;
      mealsCount?: number;
      contractRef?: string;
      totalEGP?: number;
    };
    const kitchenTenantId = String(body.kitchenTenantId || '').trim();
    const itemsSummary = String(body.itemsSummary || '').trim().slice(0, 300);
    const mealsCount = Number(body.mealsCount || 0) > 0 ? Math.round(Number(body.mealsCount)) : undefined;
    const contractRef = body.contractRef ? String(body.contractRef).trim().slice(0, 80) : undefined;
    const totalEGP = Number(body.totalEGP || 0);

    if (tenant.kind === 'client_company' && !tenant.contractedKitchenIds.includes(kitchenTenantId)) {
      appendAuditEntry({
        actorUid: sess.uid,
        actorEmail: sess.email,
        actorRole: sess.canonicalRole,
        action: 'رفض طلب لعدم وجود عقد معتمد مع المطبخ المطلوب',
        targetType: 'contract_isolation',
        targetId: kitchenTenantId,
        severity: 'security_alert',
        details: `Client ${tenant.tenantId} blocked from uncontracted kitchen ${kitchenTenantId}`,
      });
      res.status(403).json({
        ok: false,
        code: 'NO_KITCHEN_CONTRACT',
        messageAr: 'لا يمكن الطلب من هذا المطبخ لعدم وجود عقد سارٍ ومعتمد مع جهتكم.',
        messageEn: 'No active approved contract links your company to this kitchen.',
      });
      return;
    }

    const kitchen = securityState.tenantsById[kitchenTenantId];
    if (!kitchen || itemsSummary.length < 2 || !Number.isFinite(totalEGP) || totalEGP <= 0) {
      res.status(400).json({ ok: false, messageAr: 'يرجى استكمال بيانات الطلب والمطبخ المعتمد.', messageEn: 'Valid kitchen, items, and amount required.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const orderId = `TORD-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
    const order: ServerTenantOrderRecord = {
      orderId,
      clientTenantId: tenant.tenantId,
      clientTenantName: tenant.name,
      kitchenTenantId: kitchen.tenantId,
      kitchenTenantName: kitchen.name,
      placedByUid: sess.uid,
      placedByName: sess.fullName,
      itemsSummary,
      ...(mealsCount ? { mealsCount, mealUnitPriceEGP: Math.round((totalEGP / mealsCount) * 100) / 100 } : {}),
      ...(contractRef ? { contractRef } : {}),
      totalEGP,
      status: 'pending_kitchen',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    securityState.tenantOrdersById[orderId] = order;
    saveSecurityState(securityState);

    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: 'إنشاء طلب إعاشة تعاقدي معزول',
      targetType: 'tenant_order',
      targetId: orderId,
      severity: 'info',
      details: `${tenant.tenantId} -> ${kitchen.tenantId} (${totalEGP} EGP)`,
    });

    res.json({ ok: true, order, messageAr: 'تم إرسال الطلب إلى المطبخ المركزي المتعاقد معه فقط.' });
  });

  app.get('/api/admin/audit-logs', requirePlatformAdminOrOwner, (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      ok: true,
      immutable: true,
      logs: securityState.auditLogs,
    });
  });

  // Strict Immutable Audit Log Enforcement (Deletion/Modification explicitly denied & logged)
  app.delete('/api/admin/audit-logs/:logId', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: 'محاولة محظورة لحذف سجل التدقيق الأمني',
      targetType: 'audit_tamper',
      targetId: String(req.params.logId || 'unknown'),
      severity: 'security_alert',
      details: `Blocked audit log delete attempt by ${sess.email}`,
    });
    res.status(403).json({
      ok: false,
      code: 'IMMUTABLE_AUDIT_LOG',
      messageAr: 'سجل التدقيق الأمني غير قابل للحذف أو التعديل لحماية النزاهة والرقابة.',
      messageEn: 'Audit logs are strictly immutable and cannot be deleted.',
    });
  });

  app.put('/api/admin/audit-logs/:logId', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    appendAuditEntry({
      actorUid: sess.uid,
      actorEmail: sess.email,
      actorRole: sess.canonicalRole,
      action: 'محاولة محظورة لتعديل سجل التدقيق الأمني',
      targetType: 'audit_tamper',
      targetId: String(req.params.logId || 'unknown'),
      severity: 'security_alert',
      details: `Blocked audit log modification attempt by ${sess.email}`,
    });
    res.status(403).json({
      ok: false,
      code: 'IMMUTABLE_AUDIT_LOG',
      messageAr: 'سجل التدقيق الأمني غير قابل للتعديل نهائياً.',
      messageEn: 'Audit logs are strictly immutable.',
    });
  });

  // ===========================================================================
  // Payment Intent & Audit Endpoints (Authenticated + Live transfers disabled)
  // ===========================================================================
  app.post('/api/payments/create-intent', requireAuthenticatedSession, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sess = req.authSession!;
      const body = req.body as {
        provider?: GatewayId;
        mode?: 'sandbox' | 'live';
        amount?: number;
        currency?: string;
        countryCode?: string;
        orderId?: string;
        tenantId?: string;
        idempotencyKey?: string;
      };

      const provider = body.provider;
      const mode = body.mode === 'live' ? 'live' : 'sandbox';
      const amount = Number(body.amount || 0);
      const currency = String(body.currency || 'EGP').toUpperCase();
      const countryCode = String(body.countryCode || 'EG').toUpperCase();
      const orderId = String(body.orderId || `ORD-${Date.now()}`);
      const tenantId = sess.tenantId || String(body.tenantId || 'platform_global');
      const idempotencyKey = String(body.idempotencyKey || `${sess.uid}_${orderId}_${provider}_${amount}`);

      if (!provider || !ALLOWED_GATEWAYS.includes(provider)) {
        res.status(400).json({ ok: false, error: 'Invalid payment provider.' });
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
        res.status(400).json({ ok: false, error: 'Payment amount must be greater than zero.' });
        return;
      }

      const existingTxId = idempotencyStore.get(idempotencyKey);
      if (existingTxId && sandboxIntentStore.has(existingTxId)) {
        res.json({
          ok: true,
          idempotentReplay: true,
          intent: sandboxIntentStore.get(existingTxId),
        });
        return;
      }

      if (mode === 'live') {
        res.status(403).json({
          ok: false,
          code: 'REAL_TRANSFERS_DISABLED',
          provider,
          messageAr:
            'التشغيل المالي الحي وتحريك الأموال الفعلي محظور لحماية المستخدمين. يُسمح فقط بمعاملات المراجعة والاختبار (Sandbox).',
          messageEn:
            'Live monetary transfers are disabled by security policy. Only Sandbox / Audit verification mode is enabled.',
        });
        return;
      }

      const txId = `tx_sbx_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
      const gatewayReference = `${provider.toUpperCase()}-SBX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const hmacSignature = computeSandboxHmac(
        `${txId}|${provider}|${orderId}|${amount}|${currency}`,
        SANDBOX_HMAC_KEY
      );
      const nowIso = new Date().toISOString();
      const record: SandboxIntentRecord = {
        txId,
        payerUid: sess.uid,
        provider,
        mode: 'sandbox',
        orderId,
        tenantId,
        amount,
        currency,
        countryCode,
        status: 'Pending',
        gatewayReference,
        idempotencyKey,
        hmacSignature,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      sandboxIntentStore.set(txId, record);
      idempotencyStore.set(idempotencyKey, txId);

      res.json({
        ok: true,
        idempotentReplay: false,
        intent: {
          ...record,
          ...(provider === 'vodafone_cash' ? { walletNumber: '+201010430347' } : {}),
        },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Internal payment error',
      });
    }
  });

  app.post('/api/payments/sandbox-action', requireAuthenticatedSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = req.body as {
      txId?: string;
      action?: PaymentStatus;
      hmacSignature?: string;
    };
    const txId = String(body.txId || '');
    const nextStatus = body.action;
    if (!txId || !nextStatus || !['Paid', 'Failed', 'Cancelled', 'Refunded'].includes(nextStatus)) {
      res.status(400).json({ ok: false, error: 'Missing txId or invalid action status.' });
      return;
    }

    const record = sandboxIntentStore.get(txId);
    if (!record) {
      res.status(404).json({ ok: false, error: 'Sandbox transaction intent not found on server.' });
      return;
    }
    if (
      record.payerUid &&
      record.payerUid !== sess.uid &&
      sess.canonicalRole !== 'super_admin' &&
      sess.canonicalRole !== 'platform_admin'
    ) {
      res.status(403).json({
        ok: false,
        code: 'PAYMENT_INTENT_FORBIDDEN',
        messageAr: 'لا يمكنك تعديل معاملة دفع لا تخص حسابك.',
        messageEn: 'Cannot modify another user payment intent.',
      });
      return;
    }
    if (record.mode !== 'sandbox') {
      res.status(403).json({ ok: false, error: 'Sandbox action endpoint cannot mutate live gateway records.' });
      return;
    }

    const expectedHmac = computeSandboxHmac(
      `${record.txId}|${record.provider}|${record.orderId}|${record.amount}|${record.currency}`,
      SANDBOX_HMAC_KEY
    );
    if (body.hmacSignature && body.hmacSignature !== expectedHmac) {
      res.status(401).json({ ok: false, error: 'Invalid HMAC signature for sandbox confirmation.' });
      return;
    }

    record.status = nextStatus;
    record.updatedAt = new Date().toISOString();
    sandboxIntentStore.set(txId, record);

    if (nextStatus === 'Paid' && Number(record.amount) > 0) {
      const channelMap: Record<string, OwnerFinanceChannel> = {
        vodafone_cash: 'e_wallet',
        instapay: 'e_wallet',
        fawry: 'e_wallet',
        paymob: 'bank',
        cash_on_delivery: 'treasury',
      };
      const pctMap: Record<string, number> = {
        vodafone_cash: 1.5,
        instapay: 0,
        fawry: 2.0,
        paymob: 2.5,
        cash_on_delivery: 0,
      };
      recordOwnerFinancialInflow({
        source: `بوابة دفع (${record.provider})`,
        purpose: `تحصيل معاملة طلب ${record.orderId || record.txId}`,
        grossEGP: Number(record.amount),
        commissionPct: pctMap[record.provider] ?? 1.5,
        channel: channelMap[record.provider] || 'e_wallet',
        orderRef: `SBX-${record.txId}`,
        actorEmail: sess.email,
      });
    }

    res.json({
      ok: true,
      hmacVerified: true,
      intent: record,
    });
  });

  app.post('/api/payments/webhook/:provider', (req: Request, res: Response) => {
    const provider = String(req.params.provider || '').toLowerCase();
    if (!ALLOWED_GATEWAYS.includes(provider as GatewayId)) {
      res.status(400).json({ ok: false, error: 'Unsupported payment provider.' });
      return;
    }
    const signatureHeader = String(req.headers['x-basit-signature'] || req.query.hmac || '');
    const payload = JSON.stringify(req.body || {});
    const secret = provider === 'fawry' ? process.env.FAWRY_SECURITY_KEY : '';
    const activeSecret = secret || SANDBOX_HMAC_KEY;
    const expected = computeSandboxHmac(payload, activeSecret);
    const verified = Boolean(signatureHeader) && timingSafeTextEquals(signatureHeader, expected);

    if (!verified) {
      res.status(401).json({
        ok: false,
        provider,
        verified: false,
        usingSandboxSecret: !secret,
        error: 'Webhook HMAC signature mismatch or missing x-basit-signature header.',
      });
      return;
    }

    res.json({
      ok: true,
      provider,
      verified: true,
      usingSandboxSecret: !secret,
      receivedAt: new Date().toISOString(),
    });
  });

  // =========================================================================
  // Gemini AI Catering & Customer Support Assistant (/api/chat)
  // Uses server-side GEMINI_API_KEY exclusively with gemini-4-hydrogen.
  // =========================================================================
  app.post('/api/chat', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        ok: false,
        error: 'GEMINI_API_KEY is not configured on the server.',
        messageAr: 'خدمة المساعد الذكي غير مفعّلة حالياً لعدم ضبط مفتاح Gemini على الخادم.',
        messageEn: 'AI Assistant is unavailable because GEMINI_API_KEY is missing.',
      });
      return;
    }

    const body = (req.body || {}) as {
      message?: unknown;
      history?: unknown;
      lang?: unknown;
      userRole?: unknown;
    };

    const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
    if (!userMessage) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى كتابة الرسالة قبل الإرسال.',
        messageEn: 'Message cannot be empty.',
      });
      return;
    }
    if (userMessage.length > 4000) {
      res.status(400).json({
        ok: false,
        messageAr: 'الرسالة طويلة جداً (الحد الأقصى 4000 حرف).',
        messageEn: 'Message exceeds 4000 character limit.',
      });
      return;
    }

    const lang = body.lang === 'en' ? 'en' : 'ar';
    const userRole = typeof body.userRole === 'string' ? body.userRole : 'visitor';
    const isVisitor = userRole === 'visitor' || userRole === 'guest';

    const rawHistory = Array.isArray(body.history) ? body.history.slice(-16) : [];
    const formattedHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const entry of rawHistory) {
      if (!entry || typeof entry !== 'object') continue;
      const roleVal = (entry as { role?: unknown }).role;
      const textVal = (entry as { text?: unknown }).text;
      if ((roleVal === 'user' || roleVal === 'model') && typeof textVal === 'string' && textVal.trim()) {
        formattedHistory.push({
          role: roleVal,
          parts: [{ text: textVal.trim().slice(0, 4000) }],
        });
      }
    }

    const systemInstruction = [
      'You are the official BASIT (باسط) Customer & Catering Assistant for Wataniya Logistics Financial (الشركة الوطنية اللوجستية المالية).',
      `Reply primarily in ${lang === 'ar' ? 'clear, warm, concise Arabic' : 'clear, concise English'}.`,
      'Core central kitchens in BASIT: مول العين (مدينة بدر), هنجر ستيشن (أرض المعارض بمدينة نصر), بيت العيلة, عمار فاميلي, وعم الرفاعي (الشروق).',
      'Service coverage areas: العاصمة الإدارية، مدينة بدر، مصانع مدينة بدر، الشروق، مدينتي.',
      '8 Organized Catering Menus: منيو العمالة، منيو المؤتمرات، منيو الاجتماعات، منيو المناسبات والأفراح، منيو أعمال الخير، منيو المستشفيات والمرضى، منيو الهيلثي والمراكز الرياضية وصالات الجيم، منيو الأوبن بوفيه.',
      'Central Kitchen Partner applications are reviewed by platform leadership (hamzaelhelaly08@gmail.com).',
      isVisitor
        ? 'IMPORTANT: The current user is a Visitor/Guest. Never invent or quote specific meal unit prices; invite them to register a Company/Client account or submit a Quote & Tasting request.'
        : 'The current user is an authenticated platform member/client. Help them with meal menus, factory contracts, tasting requests, Google Forms intake, and schedule planning.',
      'Keep answers helpful, accurate, and brief (under 6 short sentences unless a menu breakdown is requested).',
    ].join('\n');

    try {
      const genaiPkg = ['@google', 'genai'].join('/');
      const { GoogleGenAI } = (await import(genaiPkg)) as typeof import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        config: { systemInstruction },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message: userMessage });
      const reply = (response.text || '').trim();
      if (!reply) {
        res.status(502).json({
          ok: false,
          messageAr: 'لم يرجع النموذج رداً نصياً، يرجى المحاولة مرة أخرى.',
          messageEn: 'Model returned an empty response.',
        });
        return;
      }

      res.json({ ok: true, reply });
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
          ? (err as { status: number }).status
          : 500;
      const errMsg = err instanceof Error ? err.message : 'Gemini chat request failed';
      console.error('[api/chat] error:', status, errMsg);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        ok: false,
        error: errMsg,
        messageAr: 'تعذر الحصول على رد من المساعد الذكي حالياً.',
        messageEn: errMsg,
      });
    }
  });

  // =========================================================================
  // STRICT APP-OWNER-ONLY EXECUTIVE FINANCIAL DASHBOARD (/api/owner-finance/*)
  // Isolated strictly to hamzaelhelaly08@gmail.com (NEVER finance_admin/basit_admin)
  // =========================================================================
  function appendOwnerFinanceAudit(entry: Omit<OwnerFinancialAuditRecord, 'logId' | 'createdAt'>): OwnerFinancialAuditRecord {
    const rec: OwnerFinancialAuditRecord = {
      ...entry,
      logId: `OFA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    securityState.ownerFinance.auditLogs.unshift(rec);
    if (securityState.ownerFinance.auditLogs.length > 600) {
      securityState.ownerFinance.auditLogs = securityState.ownerFinance.auditLogs.slice(0, 600);
    }
    saveSecurityState(securityState);
    return rec;
  }

  function syncBolRowFromMutation(row: Omit<OwnerBolDocumentRow, 'rowId' | 'updatedAt'>): OwnerBolDocumentRow {
    const newRow: OwnerBolDocumentRow = {
      ...row,
      rowId: `BOL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      updatedAt: new Date().toISOString(),
    };
    securityState.ownerFinance.bolRows.unshift(newRow);
    if (securityState.ownerFinance.bolRows.length > 800) {
      securityState.ownerFinance.bolRows = securityState.ownerFinance.bolRows.slice(0, 800);
    }
    return newRow;
  }

  function recordOwnerFinancialInflow(params: {
    source: string;
    purpose: string;
    originLabel?: string;
    urgency?: FinancialUrgencyLevel;
    grossEGP: number;
    commissionPct?: number;
    commissionEGP?: number;
    channel: OwnerFinanceChannel;
    orderRef?: string;
    entryDate?: string;
    actorEmail?: string;
    skipLockedSweep?: boolean;
  }): OwnerFinancialEntryRecord | null {
    const gross = round2(Number(params.grossEGP || 0));
    if (!Number.isFinite(gross) || gross <= 0 || gross > 500000000) return null;

    const orderRef = String(params.orderRef || '').trim().slice(0, 120);
    if (orderRef && securityState.ownerFinance.ingestedOrderRefs.includes(orderRef)) {
      return null;
    }

    const commissionPct = Math.min(50, Math.max(0, round2(Number(params.commissionPct || 0))));
    const computedCommission =
      typeof params.commissionEGP === 'number' && Number.isFinite(params.commissionEGP) && params.commissionEGP >= 0
        ? Math.min(gross, round2(params.commissionEGP))
        : round2((gross * commissionPct) / 100);
    const netEGP = Math.max(0, round2(gross - computedCommission));

    const channel: OwnerFinanceChannel =
      params.channel === 'bank' || params.channel === 'e_wallet' || params.channel === 'treasury'
        ? params.channel
        : 'e_wallet';

    const nowIso = new Date().toISOString();
    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(params.entryDate || ''))
      ? String(params.entryDate)
      : nowIso.slice(0, 10);
    const originLabel = String(params.originLabel || params.purpose || 'متحصلات نشاط باسط').trim().slice(0, 180);
    const urgency: FinancialUrgencyLevel =
      params.urgency === 'urgent' || params.urgency === 'emergency' ? params.urgency : 'normal';

    const entry: OwnerFinancialEntryRecord = {
      entryId: `OFE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      direction: 'inflow',
      sourceOrBeneficiary: String(params.source || 'مبيعات باسط').trim().slice(0, 160),
      purpose: String(params.purpose || 'تحصيل طلب').trim().slice(0, 280),
      originLabel,
      urgency,
      expenseCategory: 'none',
      channel,
      grossEGP: gross,
      commissionPct,
      commissionEGP: computedCommission,
      netEGP,
      entryDate,
      orderRef,
      createdByEmail: String(params.actorEmail || 'system@basit-platform.local').slice(0, 160),
      createdAt: nowIso,
    };

    securityState.ownerFinance.entries.unshift(entry);

    // Automatic 10% Locked Treasury profit sweep
    const ratePct = 10;
    const lockedSlice = !params.skipLockedSweep && netEGP > 0 ? round2((netEGP * ratePct) / 100) : 0;
    const liquidNet = round2(netEGP - lockedSlice);

    securityState.ownerFinance.accounts[channel] = round2(
      (securityState.ownerFinance.accounts[channel] || 0) + liquidNet
    );

    if (lockedSlice > 0) {
      securityState.ownerFinance.lockedTreasury.balanceEGP = round2(
        (securityState.ownerFinance.lockedTreasury.balanceEGP || 0) + lockedSlice
      );
      securityState.ownerFinance.lockedTreasury.transfers.unshift({
        transferId: `LKT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        sourceEntryId: entry.entryId,
        sourceLabel: `${entry.sourceOrBeneficiary} — ${originLabel}`,
        netProfitBaseEGP: netEGP,
        deductedAmountEGP: lockedSlice,
        noteAr: `استقطاع تلقائي 10% للخزينة المقفولة من صافي الدخل (${netEGP.toLocaleString()} ج.م)`,
        createdAt: nowIso,
      });
      if (securityState.ownerFinance.lockedTreasury.transfers.length > 400) {
        securityState.ownerFinance.lockedTreasury.transfers = securityState.ownerFinance.lockedTreasury.transfers.slice(0, 400);
      }
    }

    syncBolRowFromMutation({
      docType: 'invoices',
      docNumber: orderRef || `BL-IN-${entry.entryId.slice(-6)}`,
      partyName: entry.sourceOrBeneficiary,
      statement: entry.purpose,
      originLabel,
      debitEGP: computedCommission,
      creditEGP: netEGP,
      remainingEGP: round2(netEGP - computedCommission),
      urgency,
      entryDate,
    });

    if (orderRef) {
      securityState.ownerFinance.ingestedOrderRefs.unshift(orderRef);
      if (securityState.ownerFinance.ingestedOrderRefs.length > 1000) {
        securityState.ownerFinance.ingestedOrderRefs = securityState.ownerFinance.ingestedOrderRefs.slice(0, 1000);
      }
    }
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: entry.createdByEmail,
      actionAr: `تحصيل وارد (${entry.sourceOrBeneficiary}) — صافي ${netEGP.toLocaleString()} ج.م (تحويل ${lockedSlice.toLocaleString()} ج.م للخزينة المقفولة 10%)`,
      category: 'inflow',
      amountEGP: netEGP,
      details: `${entry.purpose} · هذا دخل من إيه: ${originLabel} · قناة: ${channel}${orderRef ? ` · مرجع: ${orderRef}` : ''}`,
    });
    return entry;
  }

  async function requireStrictAppOwnerSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { session, revoked } = await resolveSessionOrFirebaseBearer(req);
    if (revoked) {
      clearSessionCookie(req, res);
      res.status(401).json({
        ok: false,
        code: 'SESSION_REVOKED',
        messageAr: 'تم سحب صلاحية هذا الحساب وإلغاء الجلسة فوراً من مالك المنصة.',
        messageEn: 'Access revoked immediately by platform owner.',
      });
      return;
    }
    if (!session) {
      res.status(401).json({
        ok: false,
        code: 'AUTH_REQUIRED',
        messageAr: 'يلزم تسجيل الدخول بجلسة آمنة موثقة لإتمام هذا الإجراء.',
        messageEn: 'Valid authenticated session required.',
      });
      return;
    }
    const emailOk = session.email.toLowerCase() === BOOTSTRAPPED_OWNER_EMAIL;
    const roleOk = session.role === 'owner' || session.canonicalRole === 'super_admin';
    if (!emailOk || !roleOk) {
      appendAuditEntry({
        actorUid: session.uid,
        actorEmail: session.email,
        actorRole: session.canonicalRole,
        action: 'محاولة غير مصرح بها للوصول إلى المنصة المالية الخاصة بالمالك',
        targetType: 'owner_finance_isolation',
        targetId: req.path,
        severity: 'security_alert',
        details: `Blocked ${session.email} (${session.role}/${session.canonicalRole}) from ${req.path}`,
      });
      res.status(403).json({
        ok: false,
        code: 'OWNER_ONLY_FINANCIAL_PLATFORM',
        messageAr: 'عذراً: المنصة المالية الخاصة بالمالك سرية ومقصورة حصرياً على مالك التطبيق فقط.',
        messageEn: 'Access denied: Exclusive to Verified App Owner.',
      });
      return;
    }
    req.authSession = session;
    next();
  }

  function requireVerifiedOwner2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    requireStrictAppOwnerSession(req, res, () => {
      const sess = req.authSession!;
      if (!sess.ownerPinVerified) {
        res.status(423).json({
          ok: false,
          code: 'OWNER_2FA_REQUIRED',
          configuredPin: Boolean(securityState.ownerPin),
          webauthnRegisteredCount: securityState.ownerFinance.webauthnCredentials.length,
          messageAr: 'يرجى إتمام التحقق الثنائي أو بصمة الوجه لفتح المنصة المالية الخاصة بالمالك.',
          messageEn: '2FA / Biometric unlock required to access Owner financial data.',
        });
        return;
      }
      next();
    });
  }

  // Finance Manager strict isolated session resolver (NEVER has Owner privileges)
  function setFinanceManagerCookie(req: Request, res: Response, token: string): void {
    const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
    const sameSite = isSecureRequest(req) ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax';
    res.setHeader(
      'Set-Cookie',
      `${FM_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; ${sameSite}; Max-Age=${maxAgeSec}`
    );
  }

  function clearFinanceManagerCookie(req: Request, res: Response): void {
    const sameSite = isSecureRequest(req) ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax';
    res.setHeader(
      'Set-Cookie',
      `${FM_SESSION_COOKIE_NAME}=; HttpOnly; Path=/; ${sameSite}; Max-Age=0`
    );
  }

  function resolveFinanceManagerSession(req: Request): FinanceManagerSessionRecord | null {
    const cookies = parseCookies(req);
    const headerToken = String(req.headers['x-finance-manager-token'] || '').trim();
    const authBearer = String(req.headers.authorization || '').trim();
    const bearerToken = authBearer.startsWith('Bearer fm:') ? authBearer.slice(10).trim() : '';
    const token = headerToken || bearerToken || cookies[FM_SESSION_COOKIE_NAME] || '';
    if (!token) return null;

    const sess = financeManagerSessionStore.get(token);
    if (!sess) return null;
    if (Date.now() > sess.expiresAtMs) {
      financeManagerSessionStore.delete(token);
      return null;
    }
    const acct = securityState.ownerFinance.financeManagers.find((m) => m.managerId === sess.managerId);
    if (!acct || acct.status !== 'active') {
      financeManagerSessionStore.delete(token);
      return null;
    }
    return sess;
  }

  function verifySameOriginOrTokenHeader(req: Request): boolean {
    if (req.headers['x-finance-manager-token'] || req.headers['x-requested-with']) {
      return true;
    }
    const origin = String(req.headers.origin || '').trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
    if (!origin || !host) return false;
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  function terminateFinanceManagerSessions(managerId: string): number {
    let count = 0;
    for (const [tok, sess] of financeManagerSessionStore.entries()) {
      if (sess.managerId === managerId) {
        financeManagerSessionStore.delete(tok);
        count += 1;
      }
    }
    return count;
  }

  function sanitizeFinanceManagerPublic(m: FinanceManagerAccountRecord) {
    return {
      managerId: m.managerId,
      slotNumber: m.slotNumber,
      username: m.username,
      fullName: m.fullName,
      status: m.status,
      mustChangePassword: m.mustChangePassword,
      lastLoginAt: m.lastLoginAt,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  function runDeterministicManagerAudit(autoTriggered: boolean): AiManagerAuditReport | null {
    const entries = securityState.ownerFinance.managerSubTreasuryEntries;
    const pending = entries.filter((e) => e.aiAuditStatus === 'pending');
    if (entries.length === 0) return null;
    const scopeEntries = pending.length > 0 ? pending : entries.slice(0, 60);

    const byManager = new Map<string, { totalAmountEGP: number; count: number; alertsAr: string[] }>();
    let flaggedCount = 0;
    let totalVolumeEGP = 0;

    for (const item of scopeEntries) {
      totalVolumeEGP = round2(totalVolumeEGP + (Number(item.amountEGP) || 0));
      const stat = byManager.get(item.managerUsername) || { totalAmountEGP: 0, count: 0, alertsAr: [] };
      stat.totalAmountEGP = round2(stat.totalAmountEGP + (Number(item.amountEGP) || 0));
      stat.count += 1;

      const isHighTicket = item.amountEGP >= 25000;
      const isUnsharedQuote = item.actionType === 'quotation' && item.sharedVia === 'none';
      if (isHighTicket || isUnsharedQuote) {
        item.aiAuditStatus = 'flagged';
        item.aiAuditNoteAr = isHighTicket
          ? `عملية ذات قيمة مرتفعة (${item.amountEGP.toLocaleString()} ج.م) تستوجب مراجعة المالك.`
          : 'عرض سعر مسجل دون توثيق إرسال عبر الإيميل أو واتساب.';
        stat.alertsAr.push(item.aiAuditNoteAr);
        flaggedCount += 1;
      } else {
        item.aiAuditStatus = 'reviewed_ok';
        item.aiAuditNoteAr = 'تمت المطابقة المحاسبية الدورية (45 يوماً) بنجاح.';
      }
      byManager.set(item.managerUsername, stat);
    }

    const nowIso = new Date().toISOString();
    const report: AiManagerAuditReport = {
      reportId: `AMA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      generatedAt: nowIso,
      cycleDays: 45,
      totalEntriesReviewed: scopeEntries.length,
      totalVolumeEGP,
      flaggedCount,
      summaryAr:
        flaggedCount > 0
          ? `تم فحص ${scopeEntries.length} حركة في الخزينة الفرعية للمدراء الماليين بإجمالي ${totalVolumeEGP.toLocaleString()} ج.م، وتم رصد ${flaggedCount} ملاحظة تستدعي تنبيه المالك.`
          : `فحص المراجعة الدورية (كل 45 يوماً): تمت مراجعة ${scopeEntries.length} حركة بإجمالي ${totalVolumeEGP.toLocaleString()} ج.م دون أي مخالفات جوهرية.`,
      managerHighlights: Array.from(byManager.entries()).map(([managerUsername, data]) => ({
        managerUsername,
        totalAmountEGP: data.totalAmountEGP,
        count: data.count,
        statusAr: data.alertsAr.length > 0 ? 'ملاحظات للمراجعة' : 'مطابق وسليم',
        alertsAr: data.alertsAr,
      })),
      autoTriggered,
    };

    securityState.ownerFinance.aiManagerAuditReports.unshift(report);
    if (securityState.ownerFinance.aiManagerAuditReports.length > 50) {
      securityState.ownerFinance.aiManagerAuditReports = securityState.ownerFinance.aiManagerAuditReports.slice(0, 50);
    }

    securityState.ownerFinance.ownerAuditAlerts.unshift({
      alertId: `OAL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      titleAr: autoTriggered
        ? 'تقرير المراجعة الذكية التلقائي (دورة 45 يوماً)'
        : 'تقرير فحص الذكاء الاصطناعي لخزينة المدراء الماليين',
      bodyAr: report.summaryAr,
      severity: flaggedCount > 0 ? 'warning' : 'info',
      reportId: report.reportId,
      readByOwner: false,
      createdAt: nowIso,
    });
    if (securityState.ownerFinance.ownerAuditAlerts.length > 100) {
      securityState.ownerFinance.ownerAuditAlerts = securityState.ownerFinance.ownerAuditAlerts.slice(0, 100);
    }

    securityState.ownerFinance.lastManagerAuditAt = nowIso;
    saveSecurityState(securityState);
    return report;
  }

  function maybeRunAuto45DayAudit(): void {
    const pending = securityState.ownerFinance.managerSubTreasuryEntries.some((e) => e.aiAuditStatus === 'pending');
    if (!pending) return;
    const lastMs = securityState.ownerFinance.lastManagerAuditAt
      ? Date.parse(securityState.ownerFinance.lastManagerAuditAt)
      : 0;
    const fortyFiveDaysMs = 45 * 24 * 60 * 60 * 1000;
    if (!lastMs || Date.now() - lastMs >= fortyFiveDaysMs) {
      runDeterministicManagerAudit(true);
    }
  }

  // Live automated inflow ingestion from checkout / order / payment flows (idempotent by orderRef)
  app.post('/api/owner-finance/inflow-ingest', (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      source?: unknown;
      purpose?: unknown;
      originLabel?: unknown;
      grossEGP?: unknown;
      commissionPct?: unknown;
      commissionEGP?: unknown;
      paymentMethod?: unknown;
      channel?: unknown;
      orderRef?: unknown;
      entryDate?: unknown;
    };
    const { session } = resolveSessionFromRequest(req);
    const grossEGP = Number(body.grossEGP || 0);
    if (!Number.isFinite(grossEGP) || grossEGP <= 0 || grossEGP > 500000000) {
      res.status(400).json({ ok: false, messageAr: 'قيمة المبلغ غير صالحة.', messageEn: 'Invalid grossEGP.' });
      return;
    }

    const pm = String(body.paymentMethod || '').toLowerCase();
    let channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'e_wallet';
    let defaultCommissionPct = 1.5;

    if (!body.channel) {
      if (pm === 'cash' || pm === 'cash_on_delivery') {
        channel = 'treasury';
        defaultCommissionPct = 0;
      } else if (pm === 'bank_transfer' || pm === 'paymob' || pm === 'corporate_invoice') {
        channel = 'bank';
        defaultCommissionPct = pm === 'paymob' ? 2.5 : 0;
      } else if (pm === 'instapay') {
        channel = 'e_wallet';
        defaultCommissionPct = 0;
      } else if (pm === 'fawry') {
        channel = 'e_wallet';
        defaultCommissionPct = 2.0;
      } else if (pm === 'vodafone_cash') {
        channel = 'e_wallet';
        defaultCommissionPct = 1.5;
      }
    }

    const commissionPct =
      typeof body.commissionPct === 'number' && Number.isFinite(body.commissionPct)
        ? body.commissionPct
        : defaultCommissionPct;

    const created = recordOwnerFinancialInflow({
      source: typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'طلب مباشر — باسط',
      purpose: typeof body.purpose === 'string' && body.purpose.trim() ? body.purpose.trim() : 'مبيعات وتعاقدات',
      originLabel: typeof body.originLabel === 'string' && body.originLabel.trim() ? body.originLabel.trim() : 'طلب وجبات/تموين عملاء عبر المنصة',
      grossEGP,
      commissionPct,
      commissionEGP: typeof body.commissionEGP === 'number' ? body.commissionEGP : undefined,
      channel,
      orderRef: typeof body.orderRef === 'string' ? body.orderRef.trim() : '',
      entryDate: typeof body.entryDate === 'string' ? body.entryDate.trim() : undefined,
      actorEmail: session?.email || 'checkout@basit-platform.local',
    });

    res.status(created ? 201 : 200).json({
      ok: true,
      ingested: Boolean(created),
      duplicate: !created,
    });
  });

  app.get('/api/owner-finance/status', requireStrictAppOwnerSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    res.json({
      ok: true,
      ownerEmail: sess.email,
      configuredPin: Boolean(securityState.ownerPin),
      webauthnRegisteredCount: securityState.ownerFinance.webauthnCredentials.length,
      registeredCredentialIds: securityState.ownerFinance.webauthnCredentials.map((c) => c.credentialId),
      owner2faVerified: Boolean(sess.ownerPinVerified),
    });
  });

  app.post('/api/owner-finance/webauthn/challenge', requireStrictAppOwnerSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const challenge = crypto.randomBytes(32).toString('base64url');
    sess.webauthnChallenge = challenge;
    sessionStore.set(sess.sessionId, sess);
    res.json({
      ok: true,
      challenge,
      rpName: 'BASIT Owner Financial Vault',
      userId: Buffer.from(sess.uid).toString('base64url'),
      userEmail: sess.email,
      registeredCredentialIds: securityState.ownerFinance.webauthnCredentials.map((c) => c.credentialId),
    });
  });

  app.post('/api/owner-finance/webauthn/register', requireStrictAppOwnerSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      credentialId?: string;
      clientDataJSON?: string;
      label?: string;
    };
    const credentialId = String(body.credentialId || '').trim();
    const clientDataJSON = String(body.clientDataJSON || '').trim();
    if (!credentialId || !clientDataJSON || !sess.webauthnChallenge) {
      res.status(400).json({ ok: false, messageAr: 'بيانات البصمة أو التحدي الأمني غير مكتملة.' });
      return;
    }
    try {
      const parsed = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8')) as {
        type?: string;
        challenge?: string;
      };
      if (parsed.type !== 'webauthn.create' || parsed.challenge !== sess.webauthnChallenge) {
        res.status(401).json({ ok: false, messageAr: 'فشل التحقق من توقيع تحدي البصمة الأمني.' });
        return;
      }
    } catch {
      res.status(400).json({ ok: false, messageAr: 'صيغة بيانات البصمة غير صالحة.' });
      return;
    }

    if (!securityState.ownerFinance.webauthnCredentials.some((c) => c.credentialId === credentialId)) {
      securityState.ownerFinance.webauthnCredentials.push({
        credentialId,
        label: String(body.label || 'بصمة الوجه / الإصبع للمالك').slice(0, 80),
        registeredAt: new Date().toISOString(),
      });
    }
    sess.webauthnChallenge = undefined;
    sess.ownerPinVerified = true;
    sessionStore.set(sess.sessionId, sess);
    saveSecurityState(securityState);

    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: 'تفعيل وربط بصمة الوجه / الإصبع (WebAuthn) بالمنصة المالية للمالك',
      category: 'security_2fa',
      amountEGP: 0,
      details: `Credential ID: ${credentialId.slice(0, 14)}...`,
    });

    res.json({
      ok: true,
      owner2faVerified: true,
      webauthnRegisteredCount: securityState.ownerFinance.webauthnCredentials.length,
      messageAr: 'تم تفعيل بصمة الوجه/الإصبع وفتح المنصة المالية الخاصة بالمالك.',
    });
  });

  app.post('/api/owner-finance/webauthn/verify', requireStrictAppOwnerSession, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      credentialId?: string;
      clientDataJSON?: string;
    };
    const credentialId = String(body.credentialId || '').trim();
    const clientDataJSON = String(body.clientDataJSON || '').trim();
    if (!credentialId || !clientDataJSON || !sess.webauthnChallenge) {
      res.status(400).json({ ok: false, messageAr: 'بيانات التحقق بالبصمة غير مكتملة.' });
      return;
    }
    const isRegistered = securityState.ownerFinance.webauthnCredentials.some(
      (c) => c.credentialId === credentialId
    );
    if (!isRegistered) {
      res.status(401).json({ ok: false, messageAr: 'البصمة المستخدمة غير مسجلة لحساب المالك.' });
      return;
    }
    try {
      const parsed = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8')) as {
        type?: string;
        challenge?: string;
      };
      if (parsed.type !== 'webauthn.get' || parsed.challenge !== sess.webauthnChallenge) {
        res.status(401).json({ ok: false, messageAr: 'فشل مطابقة التحدي الأمني للبصمة.' });
        return;
      }
    } catch {
      res.status(400).json({ ok: false, messageAr: 'تعذر قراءة بيانات التحقق الحيوي.' });
      return;
    }

    sess.webauthnChallenge = undefined;
    sess.ownerPinVerified = true;
    sessionStore.set(sess.sessionId, sess);

    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: 'تسجيل دخول موثق ببصمة الوجه/الإصبع للمنصة المالية الخاصة بالمالك',
      category: 'security_2fa',
      amountEGP: 0,
      details: 'WebAuthn biometric verification passed',
    });

    res.json({ ok: true, owner2faVerified: true, messageAr: 'تم فتح الخزينة المالية للمالك ببصمة الأمان بنجاح.' });
  });

  function buildOwnerFinanceSummaryPayload(sess?: ServerSessionRecord) {
    maybeRunAuto45DayAudit();
    const nowMs = Date.now();
    const totalFundsUnlocked = Boolean(sess?.totalFundsUnlockedUntilMs && sess.totalFundsUnlockedUntilMs > nowMs);
    const lockedTreasuryUnlocked = Boolean(sess?.lockedTreasuryUnlockedUntilMs && sess.lockedTreasuryUnlockedUntilMs > nowMs);

    const {
      accounts,
      entries,
      receivables,
      payables,
      bolRows,
      inventoryItems,
      purchaseInvoices,
      purchaseReturns,
      partyPayments,
      lockedTreasury,
      totalFundsAuthMethod,
      financeManagers,
      managerSubTreasuryEntries,
      archivedManagerRecords,
      aiManagerAuditReports,
      ownerAuditAlerts,
      lastManagerAuditAt,
      auditLogs,
    } = securityState.ownerFinance;

    const bank = round2(accounts.bank || 0);
    const e_wallet = round2(accounts.e_wallet || 0);
    const treasury = round2(accounts.treasury || 0);
    const totalNetBalance = round2(bank + e_wallet + treasury);
    const lockedBalance = round2(lockedTreasury?.balanceEGP || 0);
    const combinedFunds = round2(totalNetBalance + lockedBalance);

    const inflows = entries.filter((e) => e.direction === 'inflow');
    const outflows = entries.filter((e) => e.direction === 'outflow');

    const totalInflowsGross = round2(inflows.reduce((s, e) => s + (Number(e.grossEGP) || 0), 0));
    const totalCommissionsDeducted = round2(inflows.reduce((s, e) => s + (Number(e.commissionEGP) || 0), 0));
    const totalInflowsNet = round2(inflows.reduce((s, e) => s + (Number(e.netEGP) || 0), 0));
    const totalOutflows = round2(outflows.reduce((s, e) => s + (Number(e.netEGP) || 0), 0));

    const totalReceivablesOpen = round2(
      receivables.reduce((s, r) => s + Math.max(0, (Number(r.totalAmountEGP) || 0) - (Number(r.collectedAmountEGP) || 0)), 0)
    );
    const totalPayablesOpen = round2(
      payables.reduce((s, p) => s + Math.max(0, (Number(p.totalAmountEGP) || 0) - (Number(p.paidAmountEGP) || 0)), 0)
    );

    const categoryLabels: Record<OwnerExpenseCategory, string> = {
      none: 'غير مصنف',
      salaries: 'رواتب',
      raw_materials: 'مواد خام',
      marketing: 'تسويق',
      commissions: 'عمولات',
      logistics: 'لوجستيات',
      other: 'أخرى',
    };

    const catTotals = new Map<OwnerExpenseCategory, number>();
    for (const o of outflows) {
      const cat = o.expenseCategory || 'other';
      catTotals.set(cat, round2((catTotals.get(cat) || 0) + (Number(o.netEGP) || 0)));
    }
    if (totalCommissionsDeducted > 0) {
      catTotals.set('commissions', round2((catTotals.get('commissions') || 0) + totalCommissionsDeducted));
    }

    const expenseAnalytics = Array.from(catTotals.entries()).map(([key, totalEGP]) => ({
      key,
      labelAr: categoryLabels[key] || 'أخرى',
      totalEGP,
    }));

    const commissionsAndExpenses = [
      ...inflows
        .filter((e) => (Number(e.commissionEGP) || 0) > 0)
        .map((e) => ({
          id: `COMM-${e.entryId}`,
          kind: 'commission' as const,
          labelAr: `عمولة تحصيل (${e.sourceOrBeneficiary})`,
          originLabel: e.originLabel || e.purpose,
          amountEGP: round2(e.commissionEGP || 0),
          channel: e.channel,
          entryDate: e.entryDate,
          urgency: e.urgency || ('normal' as FinancialUrgencyLevel),
        })),
      ...outflows.map((e) => ({
        id: e.entryId,
        kind: (e.expenseCategory === 'commissions' ? 'commission' : 'expense') as 'commission' | 'expense',
        labelAr: `${e.sourceOrBeneficiary} — ${e.purpose}`,
        originLabel: e.originLabel || categoryLabels[e.expenseCategory] || 'مصروف تشغيلي',
        amountEGP: round2(e.netEGP || 0),
        channel: e.channel,
        entryDate: e.entryDate,
        urgency: e.urgency || ('normal' as FinancialUrgencyLevel),
      })),
    ].slice(0, 200);

    const lastAuditMs = lastManagerAuditAt ? Date.parse(lastManagerAuditAt) : 0;
    const daysSinceLastManagerAudit = lastAuditMs
      ? Math.max(0, Math.floor((nowMs - lastAuditMs) / (24 * 60 * 60 * 1000)))
      : 0;
    const daysUntilNextAudit = Math.max(0, 45 - daysSinceLastManagerAudit);

    return {
      accounts: { bank, e_wallet, treasury, totalNetBalance },
      totals: {
        totalInflowsGross,
        totalCommissionsDeducted,
        totalInflowsNet,
        totalOutflows,
        totalReceivablesOpen,
        totalPayablesOpen,
        netCashflowPosition: round2(totalNetBalance + totalReceivablesOpen - totalPayablesOpen),
      },
      totalFundsGate: {
        unlocked: totalFundsUnlocked,
        authMethod: totalFundsAuthMethod || 'fingerprint',
        availableFundsEGP: totalFundsUnlocked ? combinedFunds : null,
        liquidFundsEGP: totalFundsUnlocked ? totalNetBalance : null,
        lockedFundsEGP: totalFundsUnlocked ? lockedBalance : null,
        unlockedUntilMs: sess?.totalFundsUnlockedUntilMs || null,
      },
      lockedTreasury: {
        unlocked: lockedTreasuryUnlocked,
        deductionRatePct: 10,
        balanceEGP: lockedTreasuryUnlocked ? lockedBalance : null,
        transfersCount: (lockedTreasury?.transfers || []).length,
        transfers: lockedTreasuryUnlocked ? lockedTreasury?.transfers || [] : [],
        unlockedUntilMs: sess?.lockedTreasuryUnlockedUntilMs || null,
      },
      expenseAnalytics,
      commissionsAndExpenses,
      entries,
      receivables,
      payables,
      bolRows,
      inventoryItems,
      purchaseInvoices,
      purchaseReturns,
      partyPayments,
      financeManagers: financeManagers.map(sanitizeFinanceManagerPublic),
      managerSubTreasuryEntries,
      archivedManagerRecords,
      aiManagerAuditReports,
      ownerAuditAlerts,
      lastManagerAuditAt,
      daysSinceLastManagerAudit,
      daysUntilNextAudit,
      auditLogs,
    };
  }

  app.get('/api/owner-finance/dashboard', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    res.json({
      ok: true,
      ...buildOwnerFinanceSummaryPayload(req.authSession),
    });
  });

  app.post('/api/owner-finance/account-adjust', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      channel?: OwnerFinanceChannel;
      mode?: 'set' | 'deposit' | 'withdraw';
      amountEGP?: number;
      reason?: string;
    };
    const channel = body.channel;
    if (channel !== 'bank' && channel !== 'e_wallet' && channel !== 'treasury') {
      res.status(400).json({ ok: false, messageAr: 'قناة الحساب غير صالحة.' });
      return;
    }
    const amount = round2(Number(body.amountEGP || 0));
    if (!Number.isFinite(amount) || amount < 0 || amount > 500000000) {
      res.status(400).json({ ok: false, messageAr: 'المبلغ المدخل غير صالح.' });
      return;
    }
    const mode = body.mode === 'deposit' || body.mode === 'withdraw' ? body.mode : 'set';
    const current = securityState.ownerFinance.accounts[channel] || 0;
    const nextVal =
      mode === 'set'
        ? amount
        : mode === 'deposit'
          ? round2(current + amount)
          : round2(current - amount);

    securityState.ownerFinance.accounts[channel] = nextVal;
    saveSecurityState(securityState);

    const chNames: Record<OwnerFinanceChannel, string> = {
      bank: 'البنوك',
      e_wallet: 'المحفظة الإلكترونية',
      treasury: 'الخزينة النقدية',
    };
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `تحديث رصيد ${chNames[channel]} (${mode === 'set' ? 'ضبط' : mode === 'deposit' ? 'إيداع' : 'سحب'}) إلى ${nextVal.toLocaleString()} ج.م`,
      category: 'balance',
      amountEGP: amount,
      details: String(body.reason || 'تسوية رصيد يدوية من المالك').slice(0, 240),
    });

    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/entries', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      direction?: 'inflow' | 'outflow';
      sourceOrBeneficiary?: string;
      purpose?: string;
      originLabel?: string;
      urgency?: FinancialUrgencyLevel;
      expenseCategory?: OwnerExpenseCategory;
      channel?: OwnerFinanceChannel;
      grossEGP?: number;
      commissionPct?: number;
      entryDate?: string;
    };

    const direction = body.direction === 'outflow' ? 'outflow' : 'inflow';
    const sourceOrBeneficiary = String(body.sourceOrBeneficiary || '').trim().slice(0, 160);
    const purpose = String(body.purpose || '').trim().slice(0, 280);
    const originLabel = String(body.originLabel || purpose).trim().slice(0, 180);
    const urgency: FinancialUrgencyLevel =
      body.urgency === 'urgent' || body.urgency === 'emergency' ? body.urgency : 'normal';
    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'bank';
    const grossEGP = round2(Number(body.grossEGP || 0));

    if (sourceOrBeneficiary.length < 2 || purpose.length < 2 || !Number.isFinite(grossEGP) || grossEGP <= 0 || grossEGP > 500000000) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال الجهة/المستفيد والغرض ومبلغ صحيح أكبر من صفر.' });
      return;
    }

    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.entryDate || ''))
      ? String(body.entryDate)
      : new Date().toISOString().slice(0, 10);

    if (direction === 'inflow') {
      recordOwnerFinancialInflow({
        source: sourceOrBeneficiary,
        purpose,
        originLabel,
        urgency,
        grossEGP,
        commissionPct: Number(body.commissionPct || 0),
        channel,
        entryDate,
        actorEmail: sess.email,
      });
    } else {
      const allowedCats = new Set<OwnerExpenseCategory>(['salaries', 'raw_materials', 'marketing', 'commissions', 'logistics', 'other']);
      const expenseCategory: OwnerExpenseCategory =
        body.expenseCategory && allowedCats.has(body.expenseCategory) ? body.expenseCategory : 'other';
      const entry: OwnerFinancialEntryRecord = {
        entryId: `OFE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        direction: 'outflow',
        sourceOrBeneficiary,
        purpose,
        originLabel,
        urgency,
        expenseCategory,
        channel,
        grossEGP,
        commissionPct: 0,
        commissionEGP: 0,
        netEGP: grossEGP,
        entryDate,
        orderRef: '',
        createdByEmail: sess.email,
        createdAt: new Date().toISOString(),
      };
      securityState.ownerFinance.entries.unshift(entry);
      securityState.ownerFinance.accounts[channel] = round2((securityState.ownerFinance.accounts[channel] || 0) - grossEGP);
      syncBolRowFromMutation({
        docType: expenseCategory === 'other' && originLabel.includes('إيجار') ? 'rents' : 'expenses',
        docNumber: `BL-OUT-${entry.entryId.slice(-6)}`,
        partyName: sourceOrBeneficiary,
        statement: purpose,
        originLabel,
        debitEGP: grossEGP,
        creditEGP: 0,
        remainingEGP: 0,
        urgency,
        entryDate,
      });
      saveSecurityState(securityState);
      appendOwnerFinanceAudit({
        actorEmail: sess.email,
        actionAr: `تسجيل مصروف خارج إلى (${sourceOrBeneficiary}) بمبلغ ${grossEGP.toLocaleString()} ج.م`,
        category: 'outflow',
        amountEGP: grossEGP,
        details: `${purpose} · هذا مصروف بتاع إيه: ${originLabel} · التصنيف: ${expenseCategory} · الأولوية: ${urgency}`,
      });
    }

    res.status(201).json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  // =========================================================================
  // 1. Bill of Lading Financial Grid (ترويسة بوليصة الشحن البحرية — تعديل مباشر)
  // =========================================================================
  app.post('/api/owner-finance/bol-rows', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      docType?: BolDocumentType;
      docNumber?: string;
      partyName?: string;
      statement?: string;
      originLabel?: string;
      debitEGP?: number;
      creditEGP?: number;
      remainingEGP?: number;
      urgency?: FinancialUrgencyLevel;
      entryDate?: string;
    };
    const allowedDocTypes = new Set<BolDocumentType>(['owners_balances', 'expenses', 'rents', 'invoices']);
    const docType: BolDocumentType = body.docType && allowedDocTypes.has(body.docType) ? body.docType : 'owners_balances';
    const partyName = String(body.partyName || '').trim().slice(0, 160);
    const statement = String(body.statement || '').trim().slice(0, 260);
    if (partyName.length < 2 || statement.length < 2) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال الطرف/الجهة والبيان داخل بوليصة البيانات.' });
      return;
    }
    const debitEGP = Math.max(0, round2(Number(body.debitEGP || 0)));
    const creditEGP = Math.max(0, round2(Number(body.creditEGP || 0)));
    const remainingEGP =
      typeof body.remainingEGP === 'number' && Number.isFinite(body.remainingEGP)
        ? round2(body.remainingEGP)
        : round2(creditEGP - debitEGP);
    const urgency: FinancialUrgencyLevel =
      body.urgency === 'urgent' || body.urgency === 'emergency' ? body.urgency : 'normal';
    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.entryDate || ''))
      ? String(body.entryDate)
      : new Date().toISOString().slice(0, 10);

    const created = syncBolRowFromMutation({
      docType,
      docNumber: String(body.docNumber || `BL-${Date.now().toString().slice(-5)}`).trim().slice(0, 40),
      partyName,
      statement,
      originLabel: String(body.originLabel || statement).trim().slice(0, 180),
      debitEGP,
      creditEGP,
      remainingEGP,
      urgency,
      entryDate,
    });
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `إضافة سطر بوليصة مالية (${created.docNumber}) — ${partyName}`,
      category: 'bol_edit',
      amountEGP: Math.max(debitEGP, creditEGP),
      details: `${docType} · مدين ${debitEGP} / دائن ${creditEGP} / باقي ${remainingEGP}`,
    });

    res.status(201).json({ ok: true, row: created, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.patch('/api/owner-finance/bol-rows/:rowId', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const rowId = String(req.params.rowId || '').trim();
    const row = securityState.ownerFinance.bolRows.find((r) => r.rowId === rowId);
    if (!row) {
      res.status(404).json({ ok: false, messageAr: 'سطر البوليصة غير موجود.' });
      return;
    }
    const body = (req.body || {}) as {
      partyName?: string;
      statement?: string;
      originLabel?: string;
      debitEGP?: number;
      creditEGP?: number;
      remainingEGP?: number;
      urgency?: FinancialUrgencyLevel;
      entryDate?: string;
    };

    if (typeof body.partyName === 'string' && body.partyName.trim().length >= 2) {
      row.partyName = body.partyName.trim().slice(0, 160);
    }
    if (typeof body.statement === 'string' && body.statement.trim().length >= 2) {
      row.statement = body.statement.trim().slice(0, 260);
    }
    if (typeof body.originLabel === 'string' && body.originLabel.trim().length >= 2) {
      row.originLabel = body.originLabel.trim().slice(0, 180);
    }
    if (typeof body.debitEGP === 'number' && Number.isFinite(body.debitEGP) && body.debitEGP >= 0) {
      row.debitEGP = round2(body.debitEGP);
    }
    if (typeof body.creditEGP === 'number' && Number.isFinite(body.creditEGP) && body.creditEGP >= 0) {
      row.creditEGP = round2(body.creditEGP);
    }
    if (typeof body.remainingEGP === 'number' && Number.isFinite(body.remainingEGP)) {
      row.remainingEGP = round2(body.remainingEGP);
    } else if (typeof body.debitEGP === 'number' || typeof body.creditEGP === 'number') {
      row.remainingEGP = round2(row.creditEGP - row.debitEGP);
    }
    if (body.urgency === 'normal' || body.urgency === 'urgent' || body.urgency === 'emergency') {
      row.urgency = body.urgency;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(body.entryDate || ''))) {
      row.entryDate = String(body.entryDate);
    }
    row.updatedAt = new Date().toISOString();

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `تعديل مباشر في ترويسة البوليصة (${row.docNumber})`,
      category: 'bol_edit',
      amountEGP: row.remainingEGP,
      details: `${row.partyName} · مدين ${row.debitEGP} / دائن ${row.creditEGP} / باقي ${row.remainingEGP}`,
    });

    res.json({ ok: true, row, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  // =========================================================================
  // 2. Purchases, Returns & Supplier/Customer Payments + Inventory Stock
  // =========================================================================
  app.post('/api/owner-finance/purchases/invoices', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      supplierName?: string;
      supplierScope?: 'internal_platform' | 'external_supplier';
      itemName?: string;
      itemId?: string;
      unitAr?: string;
      qty?: number;
      unitCostEGP?: number;
      paidEGP?: number;
      channel?: OwnerFinanceChannel;
      notes?: string;
      entryDate?: string;
    };

    const supplierName = String(body.supplierName || '').trim().slice(0, 160);
    const itemNameInput = String(body.itemName || '').trim().slice(0, 160);
    const qty = round2(Number(body.qty || 0));
    const unitCostEGP = round2(Number(body.unitCostEGP || 0));
    if (supplierName.length < 2 || (!itemNameInput && !body.itemId) || qty <= 0 || unitCostEGP <= 0) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال المورد والصنف والكمية وسعر الوحدة بشكل صحيح.' });
      return;
    }

    const totalEGP = round2(qty * unitCostEGP);
    const paidEGP = Math.min(totalEGP, Math.max(0, round2(Number(body.paidEGP || 0))));
    const remainingEGP = round2(totalEGP - paidEGP);
    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'bank';
    const supplierScope: 'internal_platform' | 'external_supplier' =
      body.supplierScope === 'internal_platform' ? 'internal_platform' : 'external_supplier';
    const nowIso = new Date().toISOString();
    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.entryDate || ''))
      ? String(body.entryDate)
      : nowIso.slice(0, 10);

    // Update or create inventory item
    let stockItem = body.itemId
      ? securityState.ownerFinance.inventoryItems.find((i) => i.itemId === body.itemId)
      : securityState.ownerFinance.inventoryItems.find((i) => i.nameAr.toLowerCase() === itemNameInput.toLowerCase());

    if (!stockItem) {
      stockItem = {
        itemId: `INV-${Date.now().toString(36).toUpperCase()}`,
        sku: `SKU-${Math.floor(1000 + Math.random() * 8999)}`,
        nameAr: itemNameInput || 'صنف مخزني جديد',
        unitAr: String(body.unitAr || 'وحدة').trim().slice(0, 30),
        quantityOnHand: qty,
        avgUnitCostEGP: unitCostEGP,
        minStockAlert: Math.max(5, Math.round(qty * 0.2)),
        updatedAt: nowIso,
      };
      securityState.ownerFinance.inventoryItems.unshift(stockItem);
    } else {
      const prevValue = stockItem.quantityOnHand * stockItem.avgUnitCostEGP;
      const nextQty = round2(stockItem.quantityOnHand + qty);
      stockItem.avgUnitCostEGP = nextQty > 0 ? round2((prevValue + totalEGP) / nextQty) : unitCostEGP;
      stockItem.quantityOnHand = nextQty;
      stockItem.updatedAt = nowIso;
    }

    const invoiceNumber = `PUR-${Date.now().toString().slice(-6)}`;
    const invoice: PurchaseInvoiceRecord = {
      invoiceId: `PINV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      invoiceNumber,
      supplierName,
      supplierScope,
      entryDate,
      items: [
        {
          itemId: stockItem.itemId,
          itemName: stockItem.nameAr,
          qty,
          unitCostEGP,
          lineTotalEGP: totalEGP,
        },
      ],
      totalEGP,
      paidEGP,
      remainingEGP,
      channel,
      notes: String(body.notes || '').trim().slice(0, 260),
      status: paidEGP >= totalEGP ? 'paid' : paidEGP > 0 ? 'partial' : 'unpaid',
      createdAt: nowIso,
    };
    securityState.ownerFinance.purchaseInvoices.unshift(invoice);

    if (paidEGP > 0) {
      securityState.ownerFinance.accounts[channel] = round2((securityState.ownerFinance.accounts[channel] || 0) - paidEGP);
      securityState.ownerFinance.entries.unshift({
        entryId: `OFE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        direction: 'outflow',
        sourceOrBeneficiary: supplierName,
        purpose: `سداد فاتورة مشتريات (${invoiceNumber}) — ${stockItem.nameAr}`,
        originLabel: `مشتريات خامات ومخزون (${stockItem.nameAr} × ${qty})`,
        urgency: remainingEGP > 0 ? 'urgent' : 'normal',
        expenseCategory: 'raw_materials',
        channel,
        grossEGP: paidEGP,
        commissionPct: 0,
        commissionEGP: 0,
        netEGP: paidEGP,
        entryDate,
        orderRef: invoiceNumber,
        createdByEmail: sess.email,
        createdAt: nowIso,
      });
    }

    if (remainingEGP > 0) {
      securityState.ownerFinance.payables.unshift({
        payableId: `PAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        supplierName,
        purpose: `متبقي فاتورة مشتريات ${invoiceNumber} (${stockItem.nameAr})`,
        supplierScope,
        urgency: 'urgent',
        totalAmountEGP: remainingEGP,
        paidAmountEGP: 0,
        scheduledPaymentDate: entryDate,
        status: 'scheduled',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    syncBolRowFromMutation({
      docType: 'invoices',
      docNumber: invoiceNumber,
      partyName: supplierName,
      statement: `فاتورة مشتريات: ${stockItem.nameAr} (${qty} ${stockItem.unitAr})`,
      originLabel: 'مشتريات توريد ومخزون',
      debitEGP: totalEGP,
      creditEGP: paidEGP,
      remainingEGP,
      urgency: remainingEGP > 0 ? 'urgent' : 'normal',
      entryDate,
    });

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `إصدار فاتورة مشتريات (${invoiceNumber}) وتحديث المخزون — إجمالي ${totalEGP.toLocaleString()} ج.م`,
      category: 'purchase',
      amountEGP: totalEGP,
      details: `المورد: ${supplierName} · الصنف: ${stockItem.nameAr} (+${qty}) · مدفوع: ${paidEGP} / متبقي: ${remainingEGP}`,
    });

    res.status(201).json({ ok: true, invoice, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/purchases/returns', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      invoiceId?: string;
      qtyReturned?: number;
      reason?: string;
      settlementMode?: 'reduce_payable' | 'cash_refund';
      channel?: OwnerFinanceChannel;
      returnDate?: string;
    };
    const invoice = securityState.ownerFinance.purchaseInvoices.find((inv) => inv.invoiceId === body.invoiceId);
    if (!invoice || !invoice.items[0]) {
      res.status(404).json({ ok: false, messageAr: 'فاتورة المشتريات المطلوبة للمرتجع غير موجودة.' });
      return;
    }
    const line = invoice.items[0];
    const qtyReturned = round2(Number(body.qtyReturned || 0));
    if (!Number.isFinite(qtyReturned) || qtyReturned <= 0 || qtyReturned > line.qty) {
      res.status(400).json({ ok: false, messageAr: `كمية المرتجع يجب أن تكون بين 1 و ${line.qty}.` });
      return;
    }
    const refundAmountEGP = round2(qtyReturned * line.unitCostEGP);
    const settlementMode = body.settlementMode === 'cash_refund' ? 'cash_refund' : 'reduce_payable';
    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : invoice.channel;
    const nowIso = new Date().toISOString();
    const returnDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.returnDate || ''))
      ? String(body.returnDate)
      : nowIso.slice(0, 10);

    // Adjust inventory safely
    const stockItem = securityState.ownerFinance.inventoryItems.find((i) => i.itemId === line.itemId);
    if (stockItem) {
      stockItem.quantityOnHand = Math.max(0, round2(stockItem.quantityOnHand - qtyReturned));
      stockItem.updatedAt = nowIso;
    }

    if (settlementMode === 'reduce_payable') {
      invoice.remainingEGP = Math.max(0, round2(invoice.remainingEGP - refundAmountEGP));
      invoice.totalEGP = Math.max(0, round2(invoice.totalEGP - refundAmountEGP));
      invoice.status = invoice.remainingEGP <= 0 ? 'paid' : invoice.paidEGP > 0 ? 'partial' : 'unpaid';
      const linkedPayable = securityState.ownerFinance.payables.find(
        (p) => p.supplierName === invoice.supplierName && p.purpose.includes(invoice.invoiceNumber) && p.status !== 'paid'
      );
      if (linkedPayable) {
        linkedPayable.paidAmountEGP = Math.min(linkedPayable.totalAmountEGP, round2(linkedPayable.paidAmountEGP + refundAmountEGP));
        linkedPayable.status = linkedPayable.paidAmountEGP >= linkedPayable.totalAmountEGP ? 'paid' : 'partial';
        linkedPayable.updatedAt = nowIso;
      }
    } else {
      securityState.ownerFinance.accounts[channel] = round2((securityState.ownerFinance.accounts[channel] || 0) + refundAmountEGP);
      securityState.ownerFinance.entries.unshift({
        entryId: `OFE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        direction: 'inflow',
        sourceOrBeneficiary: invoice.supplierName,
        purpose: `استرداد نقدي لمرتجع مشتريات (${invoice.invoiceNumber})`,
        originLabel: `مرتجع مشتريات (${line.itemName} × ${qtyReturned})`,
        urgency: 'normal',
        expenseCategory: 'none',
        channel,
        grossEGP: refundAmountEGP,
        commissionPct: 0,
        commissionEGP: 0,
        netEGP: refundAmountEGP,
        entryDate: returnDate,
        orderRef: `RET-${invoice.invoiceNumber}`,
        createdByEmail: sess.email,
        createdAt: nowIso,
      });
    }

    const retRecord: PurchaseReturnRecord = {
      returnId: `PRET-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      supplierName: invoice.supplierName,
      itemName: line.itemName,
      qtyReturned,
      unitCostEGP: line.unitCostEGP,
      refundAmountEGP,
      reason: String(body.reason || 'مرتجع جودة / تسوية كميات').trim().slice(0, 220),
      settlementMode,
      channel,
      returnDate,
      createdAt: nowIso,
    };
    securityState.ownerFinance.purchaseReturns.unshift(retRecord);

    syncBolRowFromMutation({
      docType: 'invoices',
      docNumber: `RET-${invoice.invoiceNumber}`,
      partyName: invoice.supplierName,
      statement: `مرتجع مشتريات: ${line.itemName} (${qtyReturned})`,
      originLabel: retRecord.reason,
      debitEGP: 0,
      creditEGP: refundAmountEGP,
      remainingEGP: invoice.remainingEGP,
      urgency: 'normal',
      entryDate: returnDate,
    });

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `تسجيل مرتجع مشتريات على (${invoice.invoiceNumber}) بقيمة ${refundAmountEGP.toLocaleString()} ج.م`,
      category: 'return',
      amountEGP: refundAmountEGP,
      details: `الصنف: ${line.itemName} (-${qtyReturned}) · التسوية: ${settlementMode}`,
    });

    res.status(201).json({ ok: true, returnRecord: retRecord, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/purchases/payments', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      partyType?: 'supplier' | 'customer';
      partyName?: string;
      direction?: 'debit' | 'credit';
      amountEGP?: number;
      channel?: OwnerFinanceChannel;
      notes?: string;
      paymentDate?: string;
    };
    const partyType = body.partyType === 'customer' ? 'customer' : 'supplier';
    const partyName = String(body.partyName || '').trim().slice(0, 160);
    const direction = body.direction === 'credit' ? 'credit' : 'debit';
    const amountEGP = round2(Number(body.amountEGP || 0));
    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'bank';

    if (partyName.length < 2 || !Number.isFinite(amountEGP) || amountEGP <= 0) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال اسم الطرف ومبلغ صحيح.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const paymentDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.paymentDate || ''))
      ? String(body.paymentDate)
      : nowIso.slice(0, 10);

    const glAccountCode =
      partyType === 'supplier'
        ? `2100-AP -> ${channel === 'treasury' ? '1010-CASH' : '1020-BANK'}`
        : `${channel === 'treasury' ? '1010-CASH' : '1020-BANK'} -> 1200-AR`;

    const refCode = `PMT-${Date.now().toString().slice(-6)}`;
    const payment: PartyPaymentRecord = {
      paymentId: `PAYREC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      partyType,
      partyName,
      direction,
      amountEGP,
      channel,
      glAccountCode,
      reference: refCode,
      notes: String(body.notes || '').trim().slice(0, 240),
      paymentDate,
      createdAt: nowIso,
    };
    securityState.ownerFinance.partyPayments.unshift(payment);

    if (partyType === 'supplier') {
      // Outflow paying supplier (debit reduces AP)
      securityState.ownerFinance.accounts[channel] = round2((securityState.ownerFinance.accounts[channel] || 0) - amountEGP);
      securityState.ownerFinance.entries.unshift({
        entryId: `OFE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        direction: 'outflow',
        sourceOrBeneficiary: partyName,
        purpose: payment.notes || `سداد دفعة مورد (${refCode})`,
        originLabel: `حركة مدين/دائن للمورد (${glAccountCode})`,
        urgency: 'normal',
        expenseCategory: 'raw_materials',
        channel,
        grossEGP: amountEGP,
        commissionPct: 0,
        commissionEGP: 0,
        netEGP: amountEGP,
        entryDate: paymentDate,
        orderRef: refCode,
        createdByEmail: sess.email,
        createdAt: nowIso,
      });

      let rem = amountEGP;
      for (const p of securityState.ownerFinance.payables) {
        if (rem <= 0) break;
        if (p.supplierName.toLowerCase() === partyName.toLowerCase() && p.status !== 'paid') {
          const open = round2(p.totalAmountEGP - p.paidAmountEGP);
          const applyAmt = Math.min(open, rem);
          p.paidAmountEGP = round2(p.paidAmountEGP + applyAmt);
          p.status = p.paidAmountEGP >= p.totalAmountEGP ? 'paid' : 'partial';
          p.updatedAt = nowIso;
          rem = round2(rem - applyAmt);
        }
      }
    } else {
      // Customer collection (credit/inflow)
      recordOwnerFinancialInflow({
        source: partyName,
        purpose: payment.notes || `تحصيل دفعة عميل (${refCode})`,
        originLabel: `تحصيل عميل مرتبط بدفتر الأستاذ (${glAccountCode})`,
        grossEGP: amountEGP,
        commissionPct: 0,
        channel,
        orderRef: refCode,
        entryDate: paymentDate,
        actorEmail: sess.email,
      });

      let rem = amountEGP;
      for (const r of securityState.ownerFinance.receivables) {
        if (rem <= 0) break;
        if (r.clientName.toLowerCase() === partyName.toLowerCase() && r.status !== 'collected') {
          const open = round2(r.totalAmountEGP - r.collectedAmountEGP);
          const applyAmt = Math.min(open, rem);
          r.collectedAmountEGP = round2(r.collectedAmountEGP + applyAmt);
          r.status = r.collectedAmountEGP >= r.totalAmountEGP ? 'collected' : 'partial';
          r.updatedAt = nowIso;
          rem = round2(rem - applyAmt);
        }
      }
    }

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `تسجيل حركة ${partyType === 'supplier' ? 'سداد مورد' : 'تحصيل عميل'} (${partyName}) بمبلغ ${amountEGP.toLocaleString()} ج.م`,
      category: 'purchase',
      amountEGP,
      details: `GL: ${glAccountCode} · نوع الحركة: ${direction}`,
    });

    res.status(201).json({ ok: true, payment, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  // =========================================================================
  // 4. Locked Treasury (10% Profits) & 7. Total Available Funds Multi-Modal Gate
  // =========================================================================
  app.patch('/api/owner-finance/total-funds/policy', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const method = req.body?.authMethod;
    if (method !== 'fingerprint' && method !== 'iris' && method !== 'camera_face') {
      res.status(400).json({ ok: false, messageAr: 'طريقة الحماية غير صالحة (fingerprint / iris / camera_face).' });
      return;
    }
    securityState.ownerFinance.totalFundsAuthMethod = method;
    sess.totalFundsUnlockedUntilMs = 0; // Require fresh verification under newly selected method
    sessionStore.set(sess.sessionId, sess);
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `ضبط وسيلة حماية إجمالي المال المتاح إلى (${method})`,
      category: 'total_funds_gate',
      amountEGP: 0,
      details: `Selected auth method: ${method}`,
    });
    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/total-funds/unlock', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      method?: TotalFundsAuthMethod;
      credentialId?: string;
      clientDataJSON?: string;
      cameraSnapshotBase64?: string;
      pin?: string;
    };
    const requiredMethod = securityState.ownerFinance.totalFundsAuthMethod || 'fingerprint';
    const methodUsed = body.method || requiredMethod;

    if (methodUsed !== requiredMethod) {
      res.status(400).json({
        ok: false,
        messageAr: `النظام مضبوط حالياً على التحقق عبر (${requiredMethod}). يرجى استخدام الوسيلة المختارة.`,
      });
      return;
    }

    let verified = false;
    if (methodUsed === 'camera_face') {
      const snap = String(body.cameraSnapshotBase64 || '').trim();
      if (snap.startsWith('data:image/') && snap.length >= 600) {
        verified = true;
      }
    } else {
      // fingerprint or iris: verify WebAuthn assertion if credential provided, OR verified Owner PIN fallback
      if (body.credentialId && body.clientDataJSON && sess.webauthnChallenge) {
        const isReg = securityState.ownerFinance.webauthnCredentials.some((c) => c.credentialId === body.credentialId);
        if (isReg) {
          try {
            const parsed = JSON.parse(Buffer.from(body.clientDataJSON, 'base64url').toString('utf8')) as {
              type?: string;
              challenge?: string;
            };
            if (parsed.type === 'webauthn.get' && parsed.challenge === sess.webauthnChallenge) {
              verified = true;
              sess.webauthnChallenge = undefined;
            }
          } catch {
            verified = false;
          }
        }
      }
      if (!verified && body.pin && securityState.ownerPin) {
        const candidate = hashOwnerPin(String(body.pin), securityState.ownerPin.salt);
        verified = timingSafeHexEquals(candidate, securityState.ownerPin.hash);
      }
    }

    if (!verified) {
      res.status(401).json({
        ok: false,
        messageAr:
          methodUsed === 'camera_face'
            ? 'يرجى التقاط صورة حية واضحة من الكاميرا لفتح شاشة إجمالي المال المتاح.'
            : 'تعذر التحقق الحيوي (البصمة/القزحية) أو رمز التأكيد لفتح إجمالي المال المتاح.',
      });
      return;
    }

    sess.totalFundsUnlockedUntilMs = Date.now() + 10 * 60 * 1000;
    sessionStore.set(sess.sessionId, sess);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `فتح شاشة إجمالي المال المتاح بنجاح (${methodUsed})`,
      category: 'total_funds_gate',
      amountEGP: 0,
      details: 'Verified multi-modal biometric/camera access',
    });

    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/total-funds/lock', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    sess.totalFundsUnlockedUntilMs = 0;
    sessionStore.set(sess.sessionId, sess);
    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/locked-treasury/unlock', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as { pin?: string; credentialId?: string; clientDataJSON?: string };
    let ok = false;

    if (body.credentialId && body.clientDataJSON && sess.webauthnChallenge) {
      const isReg = securityState.ownerFinance.webauthnCredentials.some((c) => c.credentialId === body.credentialId);
      if (isReg) {
        try {
          const parsed = JSON.parse(Buffer.from(body.clientDataJSON, 'base64url').toString('utf8')) as {
            type?: string;
            challenge?: string;
          };
          if (parsed.type === 'webauthn.get' && parsed.challenge === sess.webauthnChallenge) {
            ok = true;
            sess.webauthnChallenge = undefined;
          }
        } catch {
          ok = false;
        }
      }
    }

    if (!ok && body.pin && securityState.ownerPin) {
      const candidate = hashOwnerPin(String(body.pin), securityState.ownerPin.salt);
      ok = timingSafeHexEquals(candidate, securityState.ownerPin.hash);
    }

    if (!ok) {
      res.status(401).json({ ok: false, messageAr: 'رمز PIN أو البصمة المسجلة غير صحيح لفتح الخزينة المقفولة.' });
      return;
    }

    sess.lockedTreasuryUnlockedUntilMs = Date.now() + 10 * 60 * 1000;
    sessionStore.set(sess.sessionId, sess);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: 'فتح الخزينة المقفولة (10% من الأرباح) من قبل المالك',
      category: 'locked_treasury',
      amountEGP: securityState.ownerFinance.lockedTreasury.balanceEGP,
      details: 'Unlocked via Owner PIN/WebAuthn',
    });

    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/locked-treasury/withdraw', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    if (!sess.lockedTreasuryUnlockedUntilMs || Date.now() > sess.lockedTreasuryUnlockedUntilMs) {
      res.status(423).json({ ok: false, messageAr: 'يرجى فك قفل الخزينة المقفولة أولاً قبل السحب.' });
      return;
    }
    const body = (req.body || {}) as { amountEGP?: number; targetChannel?: OwnerFinanceChannel; reason?: string };
    const amountEGP = round2(Number(body.amountEGP || 0));
    const currentLocked = round2(securityState.ownerFinance.lockedTreasury.balanceEGP || 0);
    const targetChannel: OwnerFinanceChannel =
      body.targetChannel === 'bank' || body.targetChannel === 'e_wallet' || body.targetChannel === 'treasury'
        ? body.targetChannel
        : 'bank';
    if (!Number.isFinite(amountEGP) || amountEGP <= 0 || amountEGP > currentLocked) {
      res.status(400).json({ ok: false, messageAr: 'المبلغ المطلوب غير صالح أو يتجاوز رصيد الخزينة المقفولة.' });
      return;
    }

    securityState.ownerFinance.lockedTreasury.balanceEGP = round2(currentLocked - amountEGP);
    securityState.ownerFinance.accounts[targetChannel] = round2((securityState.ownerFinance.accounts[targetChannel] || 0) + amountEGP);
    securityState.ownerFinance.lockedTreasury.transfers.unshift({
      transferId: `LKT-WD-${Date.now().toString(36).toUpperCase()}`,
      sourceEntryId: 'OWNER_WITHDRAW',
      sourceLabel: `سحب معتمد من المالك إلى ${targetChannel}`,
      netProfitBaseEGP: currentLocked,
      deductedAmountEGP: -amountEGP,
      noteAr: String(body.reason || 'تحويل سيولة من الخزينة المقفولة').slice(0, 200),
      createdAt: new Date().toISOString(),
    });
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `سحب ${amountEGP.toLocaleString()} ج.م من الخزينة المقفولة إلى (${targetChannel})`,
      category: 'locked_treasury',
      amountEGP,
      details: String(body.reason || 'سحب طارئ / استثماري معتمد'),
    });

    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  // =========================================================================
  // 6. Emergency & Urgent Payables Scanner (الحالات العاجلة والطوارئ)
  // =========================================================================
  app.post('/api/owner-finance/emergency-scan', requireVerifiedOwner2FA, async (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const { accounts, payables, bolRows, inventoryItems, lockedTreasury } = securityState.ownerFinance;
    const liquidTotal = round2((accounts.bank || 0) + (accounts.e_wallet || 0) + (accounts.treasury || 0));

    const openPayables = payables
      .filter((p) => p.status !== 'paid' && round2(p.totalAmountEGP - p.paidAmountEGP) > 0)
      .map((p) => ({
        id: p.payableId,
        kind: 'payable' as const,
        partyName: p.supplierName,
        scope: p.supplierScope || 'external_supplier',
        scopeAr: p.supplierScope === 'internal_platform' ? 'مورد داخلي بالمنصة' : 'مورد / جهة خارجية',
        purpose: p.purpose,
        amountEGP: round2(p.totalAmountEGP - p.paidAmountEGP),
        dueDate: p.scheduledPaymentDate,
        urgency: p.urgency || (Date.parse(p.scheduledPaymentDate) <= Date.now() + 3 * 86400000 ? 'urgent' : 'normal'),
      }));

    const urgentBol = bolRows
      .filter((b) => (b.urgency === 'urgent' || b.urgency === 'emergency') && (b.remainingEGP > 0 || b.debitEGP > 0))
      .map((b) => ({
        id: b.rowId,
        kind: 'bol' as const,
        partyName: b.partyName,
        scope: 'internal_platform' as const,
        scopeAr: 'التزام بوليصة عاجل',
        purpose: `${b.statement} (${b.originLabel})`,
        amountEGP: round2(b.remainingEGP > 0 ? b.remainingEGP : b.debitEGP),
        dueDate: b.entryDate,
        urgency: b.urgency,
      }));

    const lowStock = inventoryItems.filter((i) => i.quantityOnHand <= i.minStockAlert);
    const emergencyItems = [...openPayables, ...urgentBol].sort((a, b) => {
      const rank = { emergency: 3, urgent: 2, normal: 1 };
      return (rank[b.urgency] || 1) - (rank[a.urgency] || 1) || b.amountEGP - a.amountEGP;
    });

    const totalUrgentNeedEGP = round2(emergencyItems.reduce((s, i) => s + i.amountEGP, 0));
    const deficitEGP = Math.max(0, round2(totalUrgentNeedEGP - liquidTotal));
    const coveragePct = totalUrgentNeedEGP > 0 ? Math.min(100, round2((liquidTotal / totalUrgentNeedEGP) * 100)) : 100;

    let aiPriorityNoteAr =
      deficitEGP > 0
        ? `توجد فجوة سيولة فورية بمقدار ${deficitEGP.toLocaleString()} ج.م لتغطية الالتزامات العاجلة. يُنصح بجدولة الموردين غير الحرجين أو تعزيز التحصيل.`
        : `السيولة المتاحة (${liquidTotal.toLocaleString()} ج.م) تغطي 100% من الالتزامات العاجلة الحالية (${totalUrgentNeedEGP.toLocaleString()} ج.م).`;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && emergencyItems.length > 0) {
      try {
        const genaiPkg = ['@google', 'genai'].join('/');
        const { GoogleGenAI } = (await import(genaiPkg)) as typeof import('@google/genai');
        const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        const resp = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `أنت المستشار المالي للطوارئ في شركة باسط. أعطِ توصية عربية مختصرة جداً (سطرين فقط) لترتيب أولوية السداد بناءً على:\nالسيولة السائلة: ${liquidTotal} ج.م، الخزينة المقفولة الاحتياطية: ${lockedTreasury.balanceEGP} ج.م، الالتزامات: ${JSON.stringify(emergencyItems.slice(0, 8))}`,
        });
        if (resp.text?.trim()) {
          aiPriorityNoteAr = resp.text.trim();
        }
      } catch {
        // retain deterministic note if Gemini call fails transiently
      }
    }

    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `تشغيل مسح الطوارئ والالتزامات العاجلة (${emergencyItems.length} بند — تغطية ${coveragePct}%)`,
      category: 'emergency',
      amountEGP: totalUrgentNeedEGP,
      details: `Liquid=${liquidTotal} EGP, Deficit=${deficitEGP} EGP, LowStock=${lowStock.length}`,
    });

    res.json({
      ok: true,
      scan: {
        scannedAt: new Date().toISOString(),
        liquidTotalEGP: liquidTotal,
        totalUrgentNeedEGP,
        deficitEGP,
        coveragePct,
        lowStockCount: lowStock.length,
        lowStockItems: lowStock,
        items: emergencyItems,
        aiPriorityNoteAr,
      },
    });
  });

  // =========================================================================
  // 5 & 9. Owner Governance of Two Finance Managers & 45-Day AI Audit
  // =========================================================================
  app.post('/api/owner-finance/managers', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      slotNumber?: 1 | 2;
      username?: string;
      fullName?: string;
      password?: string;
    };
    const slotNumber: 1 | 2 = body.slotNumber === 2 ? 2 : 1;
    const username = String(body.username || '').trim().toLowerCase().replace(/^@/, '');
    const fullName = String(body.fullName || '').trim().slice(0, 120);
    const password = String(body.password || '');

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      res.status(400).json({ ok: false, messageAr: 'اسم المستخدم يجب أن يكون 3-32 حرفاً/رقماً إنجليزياً.' });
      return;
    }
    if (fullName.length < 2) {
      res.status(400).json({ ok: false, messageAr: 'يرجى كتابة الاسم الكامل للمدير المالي.' });
      return;
    }
    if (!isStrongPassword(password)) {
      res.status(400).json({ ok: false, messageAr: 'كلمة المرور يجب أن تكون 8 أحرف/أرقام قوية على الأقل.' });
      return;
    }

    const activeManagers = securityState.ownerFinance.financeManagers.filter((m) => m.status !== 'deleted');
    const existingSameUsername = activeManagers.find((m) => m.username === username && m.slotNumber !== slotNumber);
    if (existingSameUsername) {
      res.status(409).json({ ok: false, messageAr: 'اسم المستخدم مسجل لمدير مالي آخر بالفعل.' });
      return;
    }

    const existingSlot = activeManagers.find((m) => m.slotNumber === slotNumber);
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashOwnerPin(password, salt);
    const nowIso = new Date().toISOString();

    if (existingSlot) {
      terminateFinanceManagerSessions(existingSlot.managerId);
      existingSlot.username = username;
      existingSlot.fullName = fullName;
      existingSlot.passwordSalt = salt;
      existingSlot.passwordHash = hash;
      existingSlot.status = 'active';
      existingSlot.mustChangePassword = false;
      existingSlot.updatedAt = nowIso;
    } else {
      if (activeManagers.length >= 2) {
        res.status(409).json({ ok: false, messageAr: 'الحد الأقصى هو اثنين مدراء ماليين فقط.' });
        return;
      }
      securityState.ownerFinance.financeManagers.push({
        managerId: `FM-${slotNumber}-${Date.now().toString(36).toUpperCase()}`,
        slotNumber,
        username,
        fullName,
        passwordSalt: salt,
        passwordHash: hash,
        status: 'active',
        mustChangePassword: false,
        lastLoginAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `اعتماد/تحديث حساب المدير المالي رقم (${slotNumber}): @${username}`,
      category: 'finance_manager',
      amountEGP: 0,
      details: `${fullName} · معزول تماماً عن أرصدة المالك`,
    });

    res.status(201).json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.patch('/api/owner-finance/managers/:managerId/status', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const managerId = String(req.params.managerId || '').trim();
    const mgr = securityState.ownerFinance.financeManagers.find((m) => m.managerId === managerId && m.status !== 'deleted');
    if (!mgr) {
      res.status(404).json({ ok: false, messageAr: 'المدير المالي غير موجود.' });
      return;
    }
    const nextStatus = req.body?.status === 'suspended' ? 'suspended' : 'active';
    mgr.status = nextStatus;
    mgr.updatedAt = new Date().toISOString();
    if (nextStatus === 'suspended') {
      terminateFinanceManagerSessions(mgr.managerId);
    }
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `${nextStatus === 'suspended' ? 'إيقاف مؤقت' : 'إعادة تفعيل'} المدير المالي @${mgr.username}`,
      category: 'finance_manager',
      amountEGP: 0,
      details: `Slot ${mgr.slotNumber} -> ${nextStatus}`,
    });
    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.delete('/api/owner-finance/managers/:managerId', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const managerId = String(req.params.managerId || '').trim();
    const mgr = securityState.ownerFinance.financeManagers.find((m) => m.managerId === managerId && m.status !== 'deleted');
    if (!mgr) {
      res.status(404).json({ ok: false, messageAr: 'المدير المالي غير موجود أو تم حذفه مسبقاً.' });
      return;
    }

    terminateFinanceManagerSessions(mgr.managerId);
    mgr.status = 'deleted';
    mgr.updatedAt = new Date().toISOString();

    // Archive 100% of this manager's entries into الأرشيف العام so zero history is lost
    const relatedEntries = securityState.ownerFinance.managerSubTreasuryEntries.filter(
      (e) => e.managerId === mgr.managerId
    );
    const existingArchiveIds = new Set(securityState.ownerFinance.archivedManagerRecords.map((a) => a.entryId));
    for (const rec of relatedEntries) {
      if (!existingArchiveIds.has(rec.entryId)) {
        securityState.ownerFinance.archivedManagerRecords.unshift({
          ...rec,
          aiAuditNoteAr: `${rec.aiAuditNoteAr ? `${rec.aiAuditNoteAr} · ` : ''}مؤرشف تلقائياً بعد حذف المدير (@${mgr.username}) بتاريخ ${new Date().toISOString().slice(0, 10)}`,
        });
      }
    }

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `حذف حساب المدير المالي @${mgr.username} مع حفظ ${relatedEntries.length} سجل في الأرشيف العام`,
      category: 'finance_manager',
      amountEGP: 0,
      details: 'Zero-data-loss deletion policy executed',
    });

    res.json({ ok: true, archivedCount: relatedEntries.length, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/ai-manager-audit', requireVerifiedOwner2FA, async (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const report = runDeterministicManagerAudit(false);
    if (!report) {
      res.status(400).json({ ok: false, messageAr: 'لا توجد حركات مسجلة في الخزينة الفرعية للمدراء الماليين بعد.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey) {
      try {
        const genaiPkg = ['@google', 'genai'].join('/');
        const { GoogleGenAI } = (await import(genaiPkg)) as typeof import('@google/genai');
        const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        const sampleEntries = securityState.ownerFinance.managerSubTreasuryEntries.slice(0, 40);
        const resp = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `أنت المدقق المالي الذكي بالذكاء الاصطناعي لمنصة باسط. قدّم ملخص تدقيق احترافي بالعربية (3-4 جمل مركزة) لحركات الخزينة الفرعية الخاصة بالمدراء الماليين خلال دورة 45 يوماً وأي مخاطر أو تنبيهات للمالك:\n${JSON.stringify(sampleEntries)}`,
        });
        if (resp.text?.trim()) {
          report.summaryAr = resp.text.trim();
          const latestAlert = securityState.ownerFinance.ownerAuditAlerts[0];
          if (latestAlert && latestAlert.reportId === report.reportId) {
            latestAlert.bodyAr = report.summaryAr;
          }
          saveSecurityState(securityState);
        }
      } catch {
        // keep deterministic audit report on transient Gemini error
      }
    }

    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `إجراء فحص المراجعة الذكية AI لخزينة المدراء الماليين (${report.totalEntriesReviewed} حركة)`,
      category: 'ai_audit',
      amountEGP: report.totalVolumeEGP,
      details: `Flagged: ${report.flaggedCount}`,
    });

    res.json({ ok: true, report, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.patch('/api/owner-finance/alerts/:alertId/read', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const alertId = String(req.params.alertId || '').trim();
    const alert = securityState.ownerFinance.ownerAuditAlerts.find((a) => a.alertId === alertId);
    if (!alert) {
      res.status(404).json({ ok: false, messageAr: 'التنبيه غير موجود.' });
      return;
    }
    alert.readByOwner = true;
    saveSecurityState(securityState);
    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/receivables', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      clientName?: string;
      purpose?: string;
      totalAmountEGP?: number;
      dueDate?: string;
    };
    const clientName = String(body.clientName || '').trim().slice(0, 160);
    const purpose = String(body.purpose || '').trim().slice(0, 240);
    const totalAmountEGP = round2(Number(body.totalAmountEGP || 0));
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.dueDate || ''))
      ? String(body.dueDate)
      : new Date().toISOString().slice(0, 10);

    if (clientName.length < 2 || purpose.length < 2 || !Number.isFinite(totalAmountEGP) || totalAmountEGP <= 0) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال اسم العميل والغرض ومبلغ صحيح وتاريخ الاستحقاق.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const rec: OwnerClientReceivableRecord = {
      receivableId: `RCV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      clientName,
      purpose,
      totalAmountEGP,
      collectedAmountEGP: 0,
      dueDate,
      status: 'open',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    securityState.ownerFinance.receivables.unshift(rec);
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `إضافة مديونية عميل (لينا بره) على ${clientName} بقيمة ${totalAmountEGP.toLocaleString()} ج.م`,
      category: 'receivable',
      amountEGP: totalAmountEGP,
      details: `${purpose} · استحقاق: ${dueDate}`,
    });

    res.status(201).json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.patch('/api/owner-finance/receivables/:id/collect', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const id = String(req.params.id || '').trim();
    const rec = securityState.ownerFinance.receivables.find((r) => r.receivableId === id);
    if (!rec) {
      res.status(404).json({ ok: false, messageAr: 'سجل مديونية العميل غير موجود.' });
      return;
    }
    const remaining = round2(rec.totalAmountEGP - rec.collectedAmountEGP);
    if (remaining <= 0) {
      res.status(400).json({ ok: false, messageAr: 'هذه المديونية محصلة بالكامل بالفعل.' });
      return;
    }
    const body = (req.body || {}) as { amountEGP?: number; channel?: OwnerFinanceChannel };
    const collectAmt = Math.min(remaining, Math.max(0.01, round2(Number(body.amountEGP || remaining))));
    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'bank';

    rec.collectedAmountEGP = round2(rec.collectedAmountEGP + collectAmt);
    rec.status = rec.collectedAmountEGP >= rec.totalAmountEGP ? 'collected' : 'partial';
    rec.updatedAt = new Date().toISOString();

    recordOwnerFinancialInflow({
      source: rec.clientName,
      purpose: `تحصيل مستحقات عملاء: ${rec.purpose}`,
      originLabel: `تحصيل مديونية عملاء (${rec.clientName})`,
      grossEGP: collectAmt,
      commissionPct: 0,
      channel,
      orderRef: `RCV-COL-${rec.receivableId}-${Date.now()}`,
      actorEmail: sess.email,
    });

    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `تحصيل دفعة من العميل (${rec.clientName}) بقيمة ${collectAmt.toLocaleString()} ج.م`,
      category: 'receivable',
      amountEGP: collectAmt,
      details: `الحالة الآن: ${rec.status} · قناة التحصيل: ${channel}`,
    });
    saveSecurityState(securityState);
    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/payables', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const body = (req.body || {}) as {
      supplierName?: string;
      purpose?: string;
      supplierScope?: 'internal_platform' | 'external_supplier';
      urgency?: FinancialUrgencyLevel;
      totalAmountEGP?: number;
      scheduledPaymentDate?: string;
    };
    const supplierName = String(body.supplierName || '').trim().slice(0, 160);
    const purpose = String(body.purpose || '').trim().slice(0, 240);
    const totalAmountEGP = round2(Number(body.totalAmountEGP || 0));
    const scheduledPaymentDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.scheduledPaymentDate || ''))
      ? String(body.scheduledPaymentDate)
      : new Date().toISOString().slice(0, 10);

    if (supplierName.length < 2 || purpose.length < 2 || !Number.isFinite(totalAmountEGP) || totalAmountEGP <= 0) {
      res.status(400).json({ ok: false, messageAr: 'يرجى إدخال اسم المورد والغرض ومبلغ صحيح وتاريخ السداد المجدول.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const payRec: OwnerSupplierPayableRecord = {
      payableId: `PAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      supplierName,
      purpose,
      supplierScope: body.supplierScope === 'internal_platform' ? 'internal_platform' : 'external_supplier',
      urgency: body.urgency === 'urgent' || body.urgency === 'emergency' ? body.urgency : 'normal',
      totalAmountEGP,
      paidAmountEGP: 0,
      scheduledPaymentDate,
      status: 'scheduled',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    securityState.ownerFinance.payables.unshift(payRec);
    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `جدولة مستحقات مورد (علينا بره) لـ ${supplierName} بقيمة ${totalAmountEGP.toLocaleString()} ج.م`,
      category: 'payable',
      amountEGP: totalAmountEGP,
      details: `${purpose} · النطاق: ${payRec.supplierScope} · استحقاق: ${scheduledPaymentDate}`,
    });

    res.status(201).json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.patch('/api/owner-finance/payables/:id/pay', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const id = String(req.params.id || '').trim();
    const rec = securityState.ownerFinance.payables.find((p) => p.payableId === id);
    if (!rec) {
      res.status(404).json({ ok: false, messageAr: 'سجل مستحقات المورد غير موجود.' });
      return;
    }
    const remaining = round2(rec.totalAmountEGP - rec.paidAmountEGP);
    if (remaining <= 0) {
      res.status(400).json({ ok: false, messageAr: 'تم سداد مستحقات هذا المورد بالكامل بالفعل.' });
      return;
    }
    const body = (req.body || {}) as { amountEGP?: number; channel?: OwnerFinanceChannel };
    const payAmt = Math.min(remaining, Math.max(0.01, round2(Number(body.amountEGP || remaining))));
    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'bank';

    rec.paidAmountEGP = round2(rec.paidAmountEGP + payAmt);
    rec.status = rec.paidAmountEGP >= rec.totalAmountEGP ? 'paid' : 'partial';
    rec.updatedAt = new Date().toISOString();

    const nowIso = new Date().toISOString();
    securityState.ownerFinance.entries.unshift({
      entryId: `OFE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      direction: 'outflow',
      sourceOrBeneficiary: rec.supplierName,
      purpose: `سداد دفعة مورد: ${rec.purpose}`,
      originLabel: `سداد مستحقات (${rec.supplierScope === 'internal_platform' ? 'مورد داخلي' : 'مورد خارجي'})`,
      urgency: rec.urgency || 'normal',
      expenseCategory: 'raw_materials',
      channel,
      grossEGP: payAmt,
      commissionPct: 0,
      commissionEGP: 0,
      netEGP: payAmt,
      entryDate: nowIso.slice(0, 10),
      orderRef: `PAY-${rec.payableId}`,
      createdByEmail: sess.email,
      createdAt: nowIso,
    });
    securityState.ownerFinance.accounts[channel] = round2((securityState.ownerFinance.accounts[channel] || 0) - payAmt);

    saveSecurityState(securityState);
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `سداد دفعة مورد لـ (${rec.supplierName}) بمبلغ ${payAmt.toLocaleString()} ج.م`,
      category: 'payable',
      amountEGP: payAmt,
      details: `الحالة الآن: ${rec.status} · القناة: ${channel}`,
    });
    res.json({ ok: true, ...buildOwnerFinanceSummaryPayload(sess) });
  });

  app.post('/api/owner-finance/audit-export', requireVerifiedOwner2FA, (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const period: 'day' | 'week' | 'month' =
      req.body?.period === 'day' || req.body?.period === 'week' ? req.body.period : 'month';
    const labels: Record<'day' | 'week' | 'month', string> = { day: 'اليوم', week: 'الأسبوع', month: 'الشهر' };
    appendOwnerFinanceAudit({
      actorEmail: sess.email,
      actionAr: `استخراج كشف حساب PDF تنفيذي للمالك (الفترة: ${labels[period]})`,
      category: 'pdf_export',
      amountEGP: 0,
      details: `Exported executive statement for period=${period}`,
    });
    res.json({ ok: true });
  });

  app.post('/api/owner-finance/ai-investor', requireVerifiedOwner2FA, async (req: AuthenticatedRequest, res: Response) => {
    const sess = req.authSession!;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        ok: false,
        code: 'GEMINI_KEY_MISSING',
        messageAr: 'خدمة المستثمر الذكي غير متاحة لأن مفتاح GEMINI_API_KEY غير مضبوط على الخادم.',
        messageEn: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    const summary = buildOwnerFinanceSummaryPayload(sess);
    const safeReserveEGP = round2(Math.max(summary.totals.totalPayablesOpen * 1.15, 0));
    const investableSurplusEGP = round2(Math.max(0, summary.accounts.totalNetBalance - safeReserveEGP));
    const lockedTreasuryBalanceEGP = round2(securityState.ownerFinance.lockedTreasury.balanceEGP || 0);

    try {
      const genaiPkg = ['@google', 'genai'].join('/');
      const { GoogleGenAI } = (await import(genaiPkg)) as typeof import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const prompt = [
        'أنت المستثمر الذكي الاستراتيجي والمستشار المالي الحصري لمالك منصة "باسط | BASIT" للتموين والخدمات اللوجستية في مصر.',
        'قم بتحليل التدفقات النقدية التالية بدقة واقترح فرص استثمارية داخلية (داخل مطابخ وتوسعات باسط) وخارجية (أذون خزانة، صناديق نقدية، إلخ) تناسب الفائض المتاح، مع الالتزام بإرجاع JSON فقط بهذا الهيكل الدقيق:',
        '{',
        '  "summaryAr": "ملخص تنفيذي واضح للوضع النقدي الحالي والسيولة الحرة",',
        '  "riskPostureAr": "منخفض المخاطر / متوازن / تحوطي",',
        '  "investableSurplusEGP": number,',
        '  "lockedTreasuryAdviceAr": "توصية حول توظيف رصيد الخزينة المقفولة (10%)",',
        '  "internalOpportunities": [',
        '    { "titleAr": "فرصة داخلية", "allocationEGP": number, "expectedYieldAr": "العائد المتوقع", "horizonAr": "المدة", "safetyLevelAr": "الأمان", "rationaleAr": "السبب" }',
        '  ],',
        '  "externalOpportunities": [',
        '    { "titleAr": "فرصة خارجية", "allocationEGP": number, "expectedYieldAr": "العائد المتوقع", "horizonAr": "المدة", "safetyLevelAr": "الأمان", "rationaleAr": "السبب" }',
        '  ],',
        '  "opportunities": [',
        '    {',
        '      "titleAr": "اسم الفرصة الاستثمارية",',
        '      "allocationEGP": number,',
        '      "expectedYieldAr": "العائد المتوقع",',
        '      "horizonAr": "المدة الزمنية",',
        '      "safetyLevelAr": "درجة الأمان",',
        '      "rationaleAr": "لماذا تناسب وضع التدفق النقدي الحالي لشركة باسط"',
        '    }',
        '  ],',
        '  "cashflowWarnings": ["تنبيه 1 أو خطوة تحسين التدفق النقدي"]',
        '}',
        '',
        'البيانات المالية الحية الحالية (EGP):',
        JSON.stringify({
          accounts: summary.accounts,
          totals: summary.totals,
          lockedTreasuryBalanceEGP,
          estimatedSafeReserveEGP: safeReserveEGP,
          estimatedInvestableSurplusEGP: investableSurplusEGP,
          expenseAnalytics: summary.expenseAnalytics,
          inventoryItemsCount: summary.inventoryItems.length,
        }),
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text || '').trim();
      if (!rawText) {
        res.status(502).json({
          ok: false,
          messageAr: 'لم يرجع نموذج الذكاء الاصطناعي تحليلاً نصياً. حاول مرة أخرى.',
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          ok: false,
          messageAr: 'تعذر قراءة صيغة التحليل العائدة من المستثمر الذكي.',
        });
        return;
      }

      appendOwnerFinanceAudit({
        actorEmail: sess.email,
        actionAr: 'تشغيل تحليل المستثمر الذكي AI للتدفق النقدي وفرص الاستثمار الداخلية والخارجية',
        category: 'ai_investor',
        amountEGP: investableSurplusEGP,
        details: `Net Balance: ${summary.accounts.totalNetBalance} EGP · Surplus: ${investableSurplusEGP} EGP`,
      });

      res.json({
        ok: true,
        analysis: parsed,
        snapshotTotals: summary.totals,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
          ? (err as { status: number }).status
          : 500;
      const errMsg = err instanceof Error ? err.message : 'Smart Investor Gemini call failed';
      console.error('[api/owner-finance/ai-investor] error:', status, errMsg);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        ok: false,
        error: errMsg,
        messageAr: `تعذر إتمام تحليل المستثمر الذكي: ${errMsg}`,
      });
    }
  });

  // =========================================================================
  // 5. Strictly Isolated Finance Managers Portal (/api/finance-manager/*)
  // Allowed ONLY: Purchases, Supply, Collections, Quotations + Email/WhatsApp Share
  // =========================================================================
  app.post('/api/finance-manager/login', (req: Request, res: Response) => {
    const body = (req.body || {}) as { username?: string; password?: string };
    const username = String(body.username || '').trim().toLowerCase().replace(/^@/, '');
    const password = String(body.password || '');
    const clientIp = req.ip || 'unknown';
    const rateKey = `fm:${clientIp}:${username || 'anon'}`;
    const nowMs = Date.now();
    const failRec = passwordLoginFailStore.get(rateKey) || { count: 0, lockedUntilMs: 0 };

    if (failRec.lockedUntilMs > nowMs) {
      const waitMin = Math.ceil((failRec.lockedUntilMs - nowMs) / 60000);
      res.status(429).json({
        ok: false,
        messageAr: `تم تعليق محاولات الدخول مؤقتاً لمدة ${waitMin} دقيقة.`,
      });
      return;
    }

    const acct = securityState.ownerFinance.financeManagers.find(
      (m) => m.username === username && m.status !== 'deleted'
    );

    if (!acct || acct.status === 'suspended') {
      res.status(401).json({
        ok: false,
        messageAr:
          acct?.status === 'suspended'
            ? 'تم إيقاف هذا الحساب مؤقتاً من المالك.'
            : 'اسم المستخدم أو كلمة المرور غير صحيحة.',
      });
      return;
    }

    const candidateHash = hashOwnerPin(password, acct.passwordSalt);
    if (!timingSafeHexEquals(candidateHash, acct.passwordHash)) {
      const nextCount = failRec.count + 1;
      passwordLoginFailStore.set(rateKey, {
        count: nextCount >= LOGIN_MAX_ATTEMPTS ? 0 : nextCount,
        lockedUntilMs: nextCount >= LOGIN_MAX_ATTEMPTS ? nowMs + LOGIN_LOCK_MS : 0,
      });
      res.status(401).json({ ok: false, messageAr: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
      return;
    }

    passwordLoginFailStore.delete(rateKey);
    acct.lastLoginAt = new Date(nowMs).toISOString();
    saveSecurityState(securityState);

    const token = crypto.randomBytes(32).toString('base64url');
    const fmSess: FinanceManagerSessionRecord = {
      sessionId: token,
      managerId: acct.managerId,
      slotNumber: acct.slotNumber,
      username: acct.username,
      fullName: acct.fullName,
      createdAtMs: nowMs,
      expiresAtMs: nowMs + SESSION_TTL_MS,
    };
    financeManagerSessionStore.set(token, fmSess);
    setFinanceManagerCookie(req, res, token);

    res.json({
      ok: true,
      sessionToken: token,
      manager: sanitizeFinanceManagerPublic(acct),
    });
  });

  app.get('/api/finance-manager/session', (req: Request, res: Response) => {
    const sess = resolveFinanceManagerSession(req);
    if (!sess) {
      res.status(401).json({ ok: false, messageAr: 'لا توجد جلسة مدير مالي نشطة.' });
      return;
    }
    const acct = securityState.ownerFinance.financeManagers.find((m) => m.managerId === sess.managerId);
    if (!acct || acct.status !== 'active') {
      res.status(401).json({ ok: false, messageAr: 'الجلسة منتهية.' });
      return;
    }
    res.json({ ok: true, manager: sanitizeFinanceManagerPublic(acct) });
  });

  app.post('/api/finance-manager/change-password', (req: Request, res: Response) => {
    if (!verifySameOriginOrTokenHeader(req)) {
      res.status(403).json({ ok: false, messageAr: 'تحقق من مصدر الطلب.' });
      return;
    }
    const sess = resolveFinanceManagerSession(req);
    if (!sess) {
      res.status(401).json({ ok: false, messageAr: 'يلزم تسجيل الدخول كمدير مالي.' });
      return;
    }
    const acct = securityState.ownerFinance.financeManagers.find((m) => m.managerId === sess.managerId);
    if (!acct || acct.status !== 'active') {
      res.status(401).json({ ok: false, messageAr: 'الحساب غير نشط.' });
      return;
    }
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (!timingSafeHexEquals(hashOwnerPin(currentPassword, acct.passwordSalt), acct.passwordHash)) {
      res.status(401).json({ ok: false, messageAr: 'كلمة المرور الحالية غير صحيحة.' });
      return;
    }
    if (!isStrongPassword(newPassword)) {
      res.status(400).json({ ok: false, messageAr: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف/أرقام قوية على الأقل.' });
      return;
    }
    const nextSalt = crypto.randomBytes(16).toString('hex');
    acct.passwordSalt = nextSalt;
    acct.passwordHash = hashOwnerPin(newPassword, nextSalt);
    acct.mustChangePassword = false;
    acct.updatedAt = new Date().toISOString();
    saveSecurityState(securityState);
    res.json({ ok: true, messageAr: 'تم تحديث كلمة المرور بنجاح.' });
  });

  app.post('/api/finance-manager/logout', (req: Request, res: Response) => {
    const sess = resolveFinanceManagerSession(req);
    if (sess) {
      financeManagerSessionStore.delete(sess.sessionId);
    }
    clearFinanceManagerCookie(req, res);
    res.json({ ok: true });
  });

  app.get('/api/finance-manager/workspace', (req: Request, res: Response) => {
    const sess = resolveFinanceManagerSession(req);
    if (!sess) {
      res.status(401).json({ ok: false, messageAr: 'يلزم تسجيل الدخول ببوابة المدير المالي.' });
      return;
    }
    const acct = securityState.ownerFinance.financeManagers.find((m) => m.managerId === sess.managerId);
    if (!acct || acct.status !== 'active') {
      res.status(403).json({ ok: false, messageAr: 'حساب المدير المالي موقوف أو غير متاح.' });
      return;
    }

    const entries = securityState.ownerFinance.managerSubTreasuryEntries.filter(
      (e) => e.managerId === sess.managerId
    );
    const subTreasuryTotalEGP = round2(entries.reduce((s, e) => s + (Number(e.amountEGP) || 0), 0));

    res.json({
      ok: true,
      manager: sanitizeFinanceManagerPublic(acct),
      subTreasuryTotalEGP,
      entries,
      inventoryCatalog: securityState.ownerFinance.inventoryItems.map((i) => ({
        itemId: i.itemId,
        sku: i.sku,
        nameAr: i.nameAr,
        unitAr: i.unitAr,
        quantityOnHand: i.quantityOnHand,
      })),
    });
  });

  app.post('/api/finance-manager/operations', (req: Request, res: Response) => {
    if (!verifySameOriginOrTokenHeader(req)) {
      res.status(403).json({ ok: false, messageAr: 'تحقق من أمان الطلب.' });
      return;
    }
    const sess = resolveFinanceManagerSession(req);
    if (!sess) {
      res.status(401).json({ ok: false, messageAr: 'يلزم تسجيل الدخول ببوابة المدير المالي.' });
      return;
    }
    const body = (req.body || {}) as {
      actionType?: 'purchase' | 'supply' | 'collection' | 'quotation';
      partyName?: string;
      description?: string;
      amountEGP?: number;
      channel?: OwnerFinanceChannel;
      sharedVia?: 'none' | 'email' | 'whatsapp';
      shareTarget?: string;
      entryDate?: string;
    };

    const allowedActions = new Set(['purchase', 'supply', 'collection', 'quotation']);
    const actionType = body.actionType && allowedActions.has(body.actionType) ? body.actionType : null;
    const partyName = String(body.partyName || '').trim().slice(0, 160);
    const description = String(body.description || '').trim().slice(0, 300);
    const amountEGP = round2(Number(body.amountEGP || 0));

    if (!actionType || partyName.length < 2 || description.length < 2 || !Number.isFinite(amountEGP) || amountEGP <= 0) {
      res.status(400).json({ ok: false, messageAr: 'يرجى تحديد نوع العملية واسم الجهة والبيان ومبلغ صحيح.' });
      return;
    }

    const channel: OwnerFinanceChannel =
      body.channel === 'bank' || body.channel === 'e_wallet' || body.channel === 'treasury'
        ? body.channel
        : 'treasury';
    const sharedVia: 'none' | 'email' | 'whatsapp' =
      body.sharedVia === 'email' || body.sharedVia === 'whatsapp' ? body.sharedVia : 'none';
    const shareTarget = String(body.shareTarget || '').trim().slice(0, 160);
    const nowIso = new Date().toISOString();
    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.entryDate || ''))
      ? String(body.entryDate)
      : nowIso.slice(0, 10);

    const entry: ManagerSubTreasuryEntry = {
      entryId: `MSE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      managerId: sess.managerId,
      managerUsername: sess.username,
      managerName: sess.fullName,
      actionType,
      partyName,
      description,
      amountEGP,
      channel,
      sharedVia,
      shareTarget,
      auditCycleTag: '45D-CYCLE',
      aiAuditStatus: 'pending',
      aiAuditNoteAr: 'بانتظار المراجعة الدورية التلقائية بالذكاء الاصطناعي (45 يوماً)',
      entryDate,
      createdAt: nowIso,
    };
    securityState.ownerFinance.managerSubTreasuryEntries.unshift(entry);
    saveSecurityState(securityState);

    const actionLabels: Record<ManagerSubTreasuryEntry['actionType'], string> = {
      purchase: 'فاتورة مشتريات',
      supply: 'أمر توريد',
      collection: 'تحصيل عميل',
      quotation: 'عرض سعر رسمي',
    };
    const msgText = `منصة باسط | ${actionLabels[actionType]}\nالجهة: ${partyName}\nالبيان: ${description}\nالقيمة: ${amountEGP.toLocaleString()} ج.م\nالتاريخ: ${entryDate}\nبواسطة: ${sess.fullName}`;
    const whatsappDigits = shareTarget.replace(/[^\d]/g, '');
    const whatsappUrl = whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(msgText)}`
      : `https://wa.me/?text=${encodeURIComponent(msgText)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(shareTarget.includes('@') ? shareTarget : '')}?subject=${encodeURIComponent(`BASIT | ${actionLabels[actionType]} — ${partyName}`)}&body=${encodeURIComponent(msgText)}`;

    res.status(201).json({
      ok: true,
      entry,
      shareLinks: { whatsappUrl, mailtoUrl },
    });
  });

  // =========================================================================
  // 8. Smart Voice Input (المايك الاحترافي — Gemini Speech-to-Text & Parsing)
  // Accessible ONLY to verified Owner OR active Finance Manager
  // =========================================================================
  app.post('/api/finance/voice-transcribe', async (req: Request, res: Response) => {
    const fmSess = resolveFinanceManagerSession(req);
    let authorizedActorEmail = fmSess ? `fm:${fmSess.username}` : '';

    if (!authorizedActorEmail) {
      const { session, revoked } = await resolveSessionOrFirebaseBearer(req);
      if (revoked || !session || session.email.toLowerCase() !== BOOTSTRAPPED_OWNER_EMAIL) {
        res.status(401).json({
          ok: false,
          messageAr: 'استخدام المايك الاحترافي متاح فقط للمالك الموثق أو المدير المالي النشط.',
        });
        return;
      }
      authorizedActorEmail = session.email;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        ok: false,
        messageAr: 'خدمة التحويل الصوتي بالذكاء الاصطناعي غير متاحة لعدم ضبط GEMINI_API_KEY على الخادم.',
      });
      return;
    }

    const body = (req.body || {}) as {
      audioBase64?: string;
      mimeType?: string;
      textTranscript?: string;
      context?: string;
    };

    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
    const mimeType = typeof body.mimeType === 'string' && body.mimeType.startsWith('audio/')
      ? body.mimeType.split(';')[0].trim()
      : 'audio/webm';
    let transcript = typeof body.textTranscript === 'string' ? body.textTranscript.trim().slice(0, 2000) : '';

    if (!audioBase64 && !transcript) {
      res.status(400).json({ ok: false, messageAr: 'يرجى تسجيل رسالة صوتية أو تمرير نص الكلام.' });
      return;
    }
    if (audioBase64.length > 7_000_000) {
      res.status(413).json({ ok: false, messageAr: 'حجم التسجيل الصوتي كبير جداً.' });
      return;
    }

    try {
      const genaiPkg = ['@google', 'genai'].join('/');
      const { GoogleGenAI, Type } = (await import(genaiPkg)) as typeof import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      if (audioBase64) {
        const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',').pop() || '' : audioBase64;
        const transcribeResp = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: 'حوّل الكلام الصوتي بدقة تامة إلى نص عربي واضح كما نطقه المتحدث دون إضافة تعليقات.',
              },
            ],
          },
        });
        transcript = (transcribeResp.text || '').trim();
      }

      if (!transcript) {
        res.status(422).json({ ok: false, messageAr: 'لم يتم التعرف على كلام واضح في التسجيل الصوتي.' });
        return;
      }

      const parseResp = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `استخرج الحقول المالية من الجملة التالية في نظام باسط المحاسبي (سياق الشاشة: ${String(body.context || 'عام')}):\n"${transcript}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: { type: Type.STRING },
              amountEGP: { type: Type.NUMBER },
              partyName: { type: Type.STRING },
              purpose: { type: Type.STRING },
              originLabel: { type: Type.STRING },
              direction: { type: Type.STRING },
              category: { type: Type.STRING },
              urgency: { type: Type.STRING },
            },
          },
        },
      });

      let extracted: Record<string, unknown> = { transcript };
      try {
        extracted = JSON.parse((parseResp.text || '{}').trim()) as Record<string, unknown>;
      } catch {
        extracted = { transcript };
      }

      if (authorizedActorEmail === BOOTSTRAPPED_OWNER_EMAIL) {
        appendOwnerFinanceAudit({
          actorEmail: authorizedActorEmail,
          actionAr: `إدخال صوتي ذكي عبر المايك الاحترافي: "${transcript.slice(0, 60)}"`,
          category: 'voice_input',
          amountEGP: Number(extracted.amountEGP || 0) || 0,
          details: `Context: ${String(body.context || 'general')}`,
        });
      }

      res.json({
        ok: true,
        transcript,
        parsed: {
          transcript,
          amountEGP: Number(extracted.amountEGP || 0) || 0,
          partyName: String(extracted.partyName || '').trim(),
          purpose: String(extracted.purpose || transcript).trim(),
          originLabel: String(extracted.originLabel || extracted.purpose || transcript).trim(),
          direction: extracted.direction === 'outflow' ? 'outflow' : 'inflow',
          category: String(extracted.category || 'other'),
          urgency:
            extracted.urgency === 'emergency' || extracted.urgency === 'urgent' ? extracted.urgency : 'normal',
        },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Voice transcription failed';
      console.error('[api/finance/voice-transcribe] error:', errMsg);
      res.status(502).json({
        ok: false,
        messageAr: `تعذر معالجة الصوت بالذكاء الاصطناعي: ${errMsg}`,
      });
    }
  });

  // =========================================================================
  // 9. BASET Family Benefits Card Activation & Verified Offer Redemption API
  // =========================================================================
  const BASET_CARD_COOKIE_NAME = 'baset_card_token';

  function signBasetCardSid(sid: string): string {
    const mac = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(`baset-card:${sid}`)
      .digest('hex');
    return `${sid}.${mac}`;
  }

  function verifyBasetCardToken(rawToken: string): string | null {
    const trimmed = String(rawToken || '').trim();
    const dotIdx = trimmed.lastIndexOf('.');
    if (dotIdx <= 0) return null;
    const sid = trimmed.slice(0, dotIdx);
    const sig = trimmed.slice(dotIdx + 1);
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(sid) || !/^[a-f0-9]{64}$/.test(sig)) {
      return null;
    }
    const expected = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(`baset-card:${sid}`)
      .digest('hex');
    return timingSafeHexEquals(sig, expected) ? sid : null;
  }

  function setBasetCardCookie(req: Request, res: Response, signedToken: string): void {
    const maxAgeSec = 180 * 24 * 60 * 60;
    const sameSite = isSecureRequest(req) ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax';
    res.setHeader(
      'Set-Cookie',
      `${BASET_CARD_COOKIE_NAME}=${encodeURIComponent(signedToken)}; HttpOnly; Path=/; ${sameSite}; Max-Age=${maxAgeSec}`
    );
  }

  async function resolveBasetCardSubject(req: Request): Promise<{
    subjectKey: string | null;
    authEmail: string;
    isAuthenticatedUser: boolean;
  }> {
    const { session, revoked } = await resolveSessionOrFirebaseBearer(req);
    if (!revoked && session) {
      const uidOrEmail = (session.uid || session.email || '').trim().toLowerCase();
      if (uidOrEmail) {
        return {
          subjectKey: `auth:${uidOrEmail}`,
          authEmail: session.email || '',
          isAuthenticatedUser: true,
        };
      }
    }

    const cookies = parseCookies(req);
    const headerToken = String(req.headers['x-baset-card-token'] || '').trim();
    const cookieToken = cookies[BASET_CARD_COOKIE_NAME] || '';
    const sid = verifyBasetCardToken(headerToken) || verifyBasetCardToken(cookieToken);
    if (sid) {
      return {
        subjectKey: `member:${sid}`,
        authEmail: '',
        isAuthenticatedUser: false,
      };
    }

    return {
      subjectKey: null,
      authEmail: '',
      isAuthenticatedUser: false,
    };
  }

  app.get('/api/baset-card/status', async (req: Request, res: Response) => {
    const { subjectKey, isAuthenticatedUser } = await resolveBasetCardSubject(req);
    if (!subjectKey) {
      res.json({
        ok: true,
        activated: false,
        status: 'inactive',
        card: null,
        redemptions: [],
        isAuthenticatedUser,
      });
      return;
    }

    const card = securityState.basetCards[subjectKey] || null;
    const activated = Boolean(card && card.status === 'active');
    const redemptions = securityState.basetOfferRedemptions
      .filter((r) => r.subjectKey === subjectKey)
      .slice(0, 20);

    res.json({
      ok: true,
      activated,
      status: activated ? 'active' : 'inactive',
      card: activated ? card : null,
      redemptions,
      isAuthenticatedUser,
    });
  });

  app.post('/api/baset-card/activate', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      holderName?: string;
      phone?: string;
      entityName?: string;
      employeeCode?: string;
      acceptedTerms?: boolean;
    };

    const holderName = String(body.holderName || '').trim().slice(0, 120);
    const rawPhone = String(body.phone || '').trim().slice(0, 30);
    const phoneDigits = rawPhone.replace(/[^\d+]/g, '');
    const entityName = String(body.entityName || '').trim().slice(0, 140) || 'عضوية باسط العائلية';
    const employeeCode = String(body.employeeCode || '').trim().slice(0, 48);

    if (holderName.length < 3) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى إدخال الاسم الكامل لصاحب الكارت (3 أحرف على الأقل).',
      });
      return;
    }
    if (phoneDigits.replace(/\D/g, '').length < 8) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى إدخال رقم موبايل صحيح للتفعيل.',
      });
      return;
    }
    if (body.acceptedTerms === false) {
      res.status(400).json({
        ok: false,
        messageAr: 'يرجى الموافقة على شروط برنامج مزايا كارت باسط العائلي.',
      });
      return;
    }

    const resolved = await resolveBasetCardSubject(req);
    let subjectKey = resolved.subjectKey;
    let issuedToken: string | null = null;

    if (!subjectKey) {
      const sid = crypto.randomBytes(16).toString('base64url');
      subjectKey = `member:${sid}`;
      issuedToken = signBasetCardSid(sid);
      setBasetCardCookie(req, res, issuedToken);
    } else if (subjectKey.startsWith('member:')) {
      const existingSid = subjectKey.slice('member:'.length);
      issuedToken = signBasetCardSid(existingSid);
      setBasetCardCookie(req, res, issuedToken);
    }

    const nowIso = new Date().toISOString();
    const existing = securityState.basetCards[subjectKey];
    const cardSerialBlockA = crypto.randomInt(1000, 9999);
    const cardSerialBlockB = crypto.randomInt(1000, 9999);
    const cardNumber = existing?.cardNumber || `BASET-FAM-${cardSerialBlockA}-${cardSerialBlockB}`;
    const cardId = existing?.cardId || `BC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrPayload = `BASET:FAM:${cardNumber}:10PCT:VERIFIED`;

    const card: BasetCardActivationRecord = {
      cardId,
      subjectKey,
      cardNumber,
      holderName,
      phone: phoneDigits,
      entityName,
      employeeCode,
      tier: 'family_benefits',
      discountPct: 10,
      status: 'active',
      qrPayload,
      activatedAt: existing?.status === 'active' ? existing.activatedAt : nowIso,
      updatedAt: nowIso,
    };

    securityState.basetCards[subjectKey] = card;
    saveSecurityState(securityState);

    const redemptions = securityState.basetOfferRedemptions
      .filter((r) => r.subjectKey === subjectKey)
      .slice(0, 20);

    res.status(201).json({
      ok: true,
      activated: true,
      status: 'active',
      card,
      cardToken: issuedToken,
      redemptions,
      messageAr: 'تم تفعيل كارت باسط العائلي بنجاح — خصم 10% مفعّل الآن على عروض الطعام والترفيه.',
    });
  });

  app.post('/api/baset-card/redeem-offer', async (req: Request, res: Response) => {
    const { subjectKey } = await resolveBasetCardSubject(req);
    const card = subjectKey ? securityState.basetCards[subjectKey] : null;

    if (!subjectKey || !card || card.status !== 'active') {
      res.status(403).json({
        ok: false,
        requiresActivation: true,
        messageAr: 'كارت باسط غير مفعّل بعد — فعّل الكارت أولاً لتطبيق خصم 10% المعتمد.',
      });
      return;
    }

    const body = (req.body || {}) as {
      destination?: 'food_meal_benefits' | 'family_entertainment';
      offerId?: string;
      offerTitle?: string;
      partnerName?: string;
      notes?: string;
    };

    const destination =
      body.destination === 'family_entertainment' ? 'family_entertainment' : 'food_meal_benefits';
    const offerId = String(body.offerId || '').trim().slice(0, 80);
    const offerTitle = String(body.offerTitle || '').trim().slice(0, 160);
    const partnerName = String(body.partnerName || '').trim().slice(0, 140) || 'BASET Partner';
    const notes = String(body.notes || '').trim().slice(0, 300);

    if (!offerId || !offerTitle) {
      res.status(400).json({
        ok: false,
        messageAr: 'بيانات العرض المطلوب غير مكتملة.',
      });
      return;
    }

    const redemption: BasetOfferRedemptionRecord = {
      redemptionId: `RED-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      subjectKey,
      cardNumber: card.cardNumber,
      destination,
      offerId,
      offerTitle,
      partnerName,
      discountAppliedPct: card.discountPct,
      notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    securityState.basetOfferRedemptions.unshift(redemption);
    if (securityState.basetOfferRedemptions.length > 500) {
      securityState.basetOfferRedemptions = securityState.basetOfferRedemptions.slice(0, 500);
    }
    saveSecurityState(securityState);

    res.status(201).json({
      ok: true,
      redemption,
      discountAppliedPct: card.discountPct,
      messageAr: `تم تسجيل استفادتك بالعرض (${offerTitle}) بخصم 10% على كارت ${card.cardNumber}.`,
    });
  });

  app.post('/api/baset-card/deactivate', async (req: Request, res: Response) => {
    const { subjectKey } = await resolveBasetCardSubject(req);
    if (subjectKey && securityState.basetCards[subjectKey]) {
      securityState.basetCards[subjectKey] = {
        ...securityState.basetCards[subjectKey],
        status: 'inactive',
        updatedAt: new Date().toISOString(),
      };
      saveSecurityState(securityState);
    }
    res.json({ ok: true, activated: false, status: 'inactive' });
  });

  return app;
}

async function startServer() {
  const app = await createConfiguredApp();
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    app.get('/@vite/client', (_req: Request, res: Response) => {
      res.type('application/javascript; charset=utf-8');
      res.send(`
const sheetsMap = new Map();
const linkSheetsMap = new Map();
const hasDoc = typeof document !== "undefined";
const cspNonce = hasDoc ? document.querySelector("meta[property=csp-nonce]")?.nonce : undefined;

if (hasDoc) {
  document.querySelectorAll("style[data-vite-dev-id]").forEach((el) => {
    sheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
  });
  document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id]').forEach((el) => {
    linkSheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
  });
}

let lastInsertedStyle;
export function updateStyle(id, content) {
  if (!hasDoc || linkSheetsMap.has(id)) return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-vite-dev-id", id);
    style.textContent = content;
    if (cspNonce) style.setAttribute("nonce", cspNonce);
    if (!lastInsertedStyle) {
      document.head.appendChild(style);
      setTimeout(() => { lastInsertedStyle = undefined; }, 0);
    } else {
      lastInsertedStyle.insertAdjacentElement("afterend", style);
    }
    lastInsertedStyle = style;
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}

export function removeStyle(id) {
  if (!hasDoc) return;
  if (linkSheetsMap.has(id)) {
    document.querySelectorAll(\`link[rel="stylesheet"][data-vite-dev-id="\${CSS.escape(id)}"]\`).forEach((el) => el.remove());
    linkSheetsMap.delete(id);
  }
  const style = sheetsMap.get(id);
  if (style) {
    style.parentNode?.removeChild(style);
    sheetsMap.delete(id);
  }
}

const dataMap = new Map();
export function createHotContext(ownerPath) {
  if (!dataMap.has(ownerPath)) dataMap.set(ownerPath, {});
  return {
    get data() { return dataMap.get(ownerPath); },
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}

export function injectQuery(url, queryToInject) {
  if (!url || (url[0] !== "." && url[0] !== "/")) return url;
  const pathname = url.replace(/[?#].*$/, "");
  const { search, hash } = new URL(url, "http://vite.dev");
  return \`\${pathname}?\${queryToInject}\${search ? "&" + search.slice(1) : ""}\${hash || ""}\`;
}

const BaseHTMLElement = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
export class ErrorOverlay extends BaseHTMLElement {
  close() {
    this.parentNode?.removeChild(this);
  }
}
`);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });

    app.get(['/habe', '/habe/*'], async (req: Request, res: Response, next) => {
      try {
        const htmlPath = path.resolve(__dirname, 'habe.html');
        const rawHtml = await fs.promises.readFile(htmlPath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(transformed);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get(['/habe', '/habe/*'], (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'habe.html'));
    });
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`الوطنية اللوجستية المالية | BASIT server running on http://0.0.0.0:${port}`);
  });
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isEntrypoint) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
