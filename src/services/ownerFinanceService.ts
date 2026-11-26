import { auth } from '../lib/firebase';

export type OwnerFinanceChannel = 'bank' | 'e_wallet' | 'treasury';
export type OwnerExpenseCategory =
  | 'none'
  | 'salaries'
  | 'raw_materials'
  | 'marketing'
  | 'commissions'
  | 'logistics'
  | 'other';
export type BolDocumentType = 'owners_balances' | 'expenses' | 'rents' | 'invoices';
export type FinancialUrgencyLevel = 'normal' | 'urgent' | 'emergency';
export type TotalFundsAuthMethod = 'fingerprint' | 'iris' | 'camera_face';

export interface OwnerFinancialAccountSummary {
  bank: number;
  e_wallet: number;
  treasury: number;
  totalNetBalance: number;
}

export interface OwnerFinancialEntry {
  entryId: string;
  direction: 'inflow' | 'outflow';
  sourceOrBeneficiary: string;
  purpose: string;
  originLabel?: string;
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

export interface OwnerClientReceivable {
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

export interface OwnerSupplierPayable {
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

export interface OwnerBolDocumentRow {
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

export interface InventoryStockItem {
  itemId: string;
  sku: string;
  nameAr: string;
  unitAr: string;
  quantityOnHand: number;
  avgUnitCostEGP: number;
  minStockAlert: number;
  updatedAt: string;
}

export interface PurchaseInvoiceLine {
  itemId: string;
  itemName: string;
  qty: number;
  unitCostEGP: number;
  lineTotalEGP: number;
}

export interface PurchaseInvoiceRecord {
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

export interface PurchaseReturnRecord {
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

export interface PartyPaymentRecord {
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

export interface LockedTreasuryTransfer {
  transferId: string;
  sourceEntryId: string;
  sourceLabel: string;
  netProfitBaseEGP: number;
  deductedAmountEGP: number;
  noteAr: string;
  createdAt: string;
}

export interface FinanceManagerPublicRecord {
  managerId: string;
  slotNumber: 1 | 2;
  username: string;
  fullName: string;
  status: 'active' | 'suspended' | 'deleted';
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerSubTreasuryEntry {
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

export interface AiManagerAuditReport {
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

export interface OwnerAuditAlert {
  alertId: string;
  titleAr: string;
  bodyAr: string;
  severity: 'info' | 'warning' | 'critical';
  reportId: string;
  readByOwner: boolean;
  createdAt: string;
}

export interface CommissionExpenseItem {
  id: string;
  kind: 'commission' | 'expense';
  labelAr: string;
  originLabel: string;
  amountEGP: number;
  channel: OwnerFinanceChannel;
  entryDate: string;
  urgency: FinancialUrgencyLevel;
}

export interface OwnerFinancialAudit {
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

export interface OwnerExpenseBreakdownItem {
  key: OwnerExpenseCategory;
  labelAr: string;
  totalEGP: number;
}

export interface OwnerFinanceDashboardPayload {
  accounts: OwnerFinancialAccountSummary;
  totals: {
    totalInflowsGross: number;
    totalCommissionsDeducted: number;
    totalInflowsNet: number;
    totalOutflows: number;
    totalReceivablesOpen: number;
    totalPayablesOpen: number;
    netCashflowPosition: number;
  };
  totalFundsGate: {
    unlocked: boolean;
    authMethod: TotalFundsAuthMethod;
    availableFundsEGP: number | null;
    liquidFundsEGP: number | null;
    lockedFundsEGP: number | null;
    unlockedUntilMs: number | null;
  };
  lockedTreasury: {
    unlocked: boolean;
    deductionRatePct: number;
    balanceEGP: number | null;
    transfersCount: number;
    transfers: LockedTreasuryTransfer[];
    unlockedUntilMs: number | null;
  };
  expenseAnalytics: OwnerExpenseBreakdownItem[];
  commissionsAndExpenses: CommissionExpenseItem[];
  entries: OwnerFinancialEntry[];
  receivables: OwnerClientReceivable[];
  payables: OwnerSupplierPayable[];
  bolRows: OwnerBolDocumentRow[];
  inventoryItems: InventoryStockItem[];
  purchaseInvoices: PurchaseInvoiceRecord[];
  purchaseReturns: PurchaseReturnRecord[];
  partyPayments: PartyPaymentRecord[];
  financeManagers: FinanceManagerPublicRecord[];
  managerSubTreasuryEntries: ManagerSubTreasuryEntry[];
  archivedManagerRecords: ManagerSubTreasuryEntry[];
  aiManagerAuditReports: AiManagerAuditReport[];
  ownerAuditAlerts: OwnerAuditAlert[];
  lastManagerAuditAt: string | null;
  daysSinceLastManagerAudit: number;
  daysUntilNextAudit: number;
  auditLogs: OwnerFinancialAudit[];
}

export interface OwnerFinanceStatus {
  ownerEmail: string;
  configuredPin: boolean;
  webauthnRegisteredCount: number;
  registeredCredentialIds: string[];
  owner2faVerified: boolean;
}

export interface OwnerAiOpportunity {
  titleAr: string;
  allocationEGP: number;
  expectedYieldAr: string;
  horizonAr: string;
  safetyLevelAr: string;
  rationaleAr: string;
}

export interface OwnerAiInvestorAnalysis {
  summaryAr: string;
  riskPostureAr: string;
  investableSurplusEGP: number;
  lockedTreasuryAdviceAr?: string;
  internalOpportunities?: OwnerAiOpportunity[];
  externalOpportunities?: OwnerAiOpportunity[];
  opportunities: OwnerAiOpportunity[];
  cashflowWarnings: string[];
}

export interface EmergencyScanReport {
  scannedAt: string;
  liquidTotalEGP: number;
  totalUrgentNeedEGP: number;
  deficitEGP: number;
  coveragePct: number;
  lowStockCount: number;
  lowStockItems: InventoryStockItem[];
  items: Array<{
    id: string;
    kind: 'payable' | 'bol';
    partyName: string;
    scope: 'internal_platform' | 'external_supplier';
    scopeAr: string;
    purpose: string;
    amountEGP: number;
    dueDate: string;
    urgency: FinancialUrgencyLevel;
  }>;
  aiPriorityNoteAr: string;
}

export interface VoiceParsedFields {
  transcript: string;
  amountEGP: number;
  partyName: string;
  purpose: string;
  originLabel: string;
  direction: 'inflow' | 'outflow';
  category: string;
  urgency: FinancialUrgencyLevel;
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

async function ownerFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) {
      headers.set('Authorization', `Bearer ${idToken}`);
    }
  } catch {
    // fallback if offline
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    messageAr?: string;
    messageEn?: string;
    error?: string;
    code?: string;
  } & T;
  if (!res.ok || data.ok === false) {
    const err = new Error(
      data.messageAr || data.messageEn || data.error || `HTTP ${res.status}`
    ) as Error & { status?: number; code?: string };
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export async function fetchOwnerFinanceStatus(): Promise<OwnerFinanceStatus> {
  const res = await ownerFetch('/api/owner-finance/status');
  return parseJsonOrThrow<OwnerFinanceStatus>(res);
}

export async function setupOwnerSecurityPassphrase(pin: string): Promise<void> {
  const res = await ownerFetch('/api/owner/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  await parseJsonOrThrow(res);
}

export async function verifyOwnerSecurityPassphrase(pin: string): Promise<void> {
  const res = await ownerFetch('/api/owner/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  await parseJsonOrThrow(res);
}

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

export async function runOwnerWebAuthnAssertion(): Promise<{
  credentialId: string;
  clientDataJSON: string;
}> {
  if (!isWebAuthnSupported()) {
    throw new Error('المتصفح الحالي لا يدعم التحقق بالبصمة (WebAuthn).');
  }
  const chRes = await ownerFetch('/api/owner-finance/webauthn/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const chData = await parseJsonOrThrow<{
    challenge: string;
    registeredCredentialIds: string[];
  }>(chRes);

  if (!chData.registeredCredentialIds || chData.registeredCredentialIds.length === 0) {
    await enrollOwnerBiometricWebAuthn();
    const chRes2 = await ownerFetch('/api/owner-finance/webauthn/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const chData2 = await parseJsonOrThrow<{
      challenge: string;
      registeredCredentialIds: string[];
    }>(chRes2);
    chData.challenge = chData2.challenge;
    chData.registeredCredentialIds = chData2.registeredCredentialIds;
  }

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: base64UrlToUint8Array(chData.challenge) as BufferSource,
      allowCredentials: chData.registeredCredentialIds.map((id) => ({
        type: 'public-key',
        id: base64UrlToUint8Array(id) as BufferSource,
      })),
      userVerification: 'required',
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error('لم تكتمل مصادقة البصمة الحيوية.');
  }
  const resp = assertion.response as AuthenticatorAssertionResponse;
  return {
    credentialId: bufferToBase64Url(assertion.rawId),
    clientDataJSON: bufferToBase64Url(resp.clientDataJSON),
  };
}

export async function enrollOwnerBiometricWebAuthn(): Promise<void> {
  if (!isWebAuthnSupported()) {
    throw new Error('المتصفح أو الجهاز الحالي لا يدعم البصمة / Face ID (WebAuthn).');
  }
  const chRes = await ownerFetch('/api/owner-finance/webauthn/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const chData = await parseJsonOrThrow<{
    challenge: string;
    rpName: string;
    userId: string;
    userEmail: string;
  }>(chRes);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: base64UrlToUint8Array(chData.challenge) as BufferSource,
      rp: { name: chData.rpName },
      user: {
        id: base64UrlToUint8Array(chData.userId) as BufferSource,
        name: chData.userEmail,
        displayName: 'مالك منصة باسط',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null;

  if (!cred) {
    throw new Error('تم إلغاء عملية تسجيل البصمة الحيوية.');
  }

  const resp = cred.response as AuthenticatorAttestationResponse;
  const regRes = await ownerFetch('/api/owner-finance/webauthn/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credentialId: bufferToBase64Url(cred.rawId),
      clientDataJSON: bufferToBase64Url(resp.clientDataJSON),
      label: 'بصمة الوجه / الإصبع الموثقة للمالك',
    }),
  });
  await parseJsonOrThrow(regRes);
}

export async function unlockOwnerBiometricWebAuthn(): Promise<void> {
  const proof = await runOwnerWebAuthnAssertion();
  const verifyRes = await ownerFetch('/api/owner-finance/webauthn/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proof),
  });
  await parseJsonOrThrow(verifyRes);
}

export async function fetchOwnerFinanceDashboard(): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/dashboard');
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function adjustOwnerAccountBalance(payload: {
  channel: OwnerFinanceChannel;
  mode: 'set' | 'deposit' | 'withdraw';
  amountEGP: number;
  reason?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/account-adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createOwnerFinanceEntry(payload: {
  direction: 'inflow' | 'outflow';
  sourceOrBeneficiary: string;
  purpose: string;
  originLabel?: string;
  urgency?: FinancialUrgencyLevel;
  expenseCategory?: OwnerExpenseCategory;
  channel: OwnerFinanceChannel;
  grossEGP: number;
  commissionPct?: number;
  entryDate?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createOwnerBolRow(payload: {
  docType: BolDocumentType;
  docNumber?: string;
  partyName: string;
  statement: string;
  originLabel: string;
  debitEGP: number;
  creditEGP: number;
  remainingEGP?: number;
  urgency?: FinancialUrgencyLevel;
  entryDate?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/bol-rows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function updateOwnerBolRow(
  rowId: string,
  payload: Partial<{
    partyName: string;
    statement: string;
    originLabel: string;
    debitEGP: number;
    creditEGP: number;
    remainingEGP: number;
    urgency: FinancialUrgencyLevel;
    entryDate: string;
  }>
): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch(`/api/owner-finance/bol-rows/${encodeURIComponent(rowId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createPurchaseInvoice(payload: {
  supplierName: string;
  supplierScope: 'internal_platform' | 'external_supplier';
  itemName?: string;
  itemId?: string;
  unitAr?: string;
  qty: number;
  unitCostEGP: number;
  paidEGP: number;
  channel: OwnerFinanceChannel;
  notes?: string;
  entryDate?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/purchases/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createPurchaseReturn(payload: {
  invoiceId: string;
  qtyReturned: number;
  reason: string;
  settlementMode: 'reduce_payable' | 'cash_refund';
  channel?: OwnerFinanceChannel;
  returnDate?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/purchases/returns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createPartyPayment(payload: {
  partyType: 'supplier' | 'customer';
  partyName: string;
  direction: 'debit' | 'credit';
  amountEGP: number;
  channel: OwnerFinanceChannel;
  notes?: string;
  paymentDate?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/purchases/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function setTotalFundsAuthPolicy(
  authMethod: TotalFundsAuthMethod
): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/total-funds/policy', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authMethod }),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function unlockTotalAvailableFunds(payload: {
  method: TotalFundsAuthMethod;
  credentialId?: string;
  clientDataJSON?: string;
  cameraSnapshotBase64?: string;
  pin?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/total-funds/unlock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function lockTotalAvailableFunds(): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/total-funds/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function unlockLockedTreasury(payload: {
  pin?: string;
  credentialId?: string;
  clientDataJSON?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/locked-treasury/unlock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function withdrawFromLockedTreasury(payload: {
  amountEGP: number;
  targetChannel: OwnerFinanceChannel;
  reason?: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/locked-treasury/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function runOwnerEmergencyScan(): Promise<EmergencyScanReport> {
  const res = await ownerFetch('/api/owner-finance/emergency-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await parseJsonOrThrow<{ scan: EmergencyScanReport }>(res);
  return data.scan;
}

export async function createOrUpdateFinanceManager(payload: {
  slotNumber: 1 | 2;
  username: string;
  fullName: string;
  password: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/managers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function updateFinanceManagerStatus(
  managerId: string,
  status: 'active' | 'suspended'
): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch(`/api/owner-finance/managers/${encodeURIComponent(managerId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function deleteFinanceManagerPreserveArchive(
  managerId: string
): Promise<OwnerFinanceDashboardPayload & { archivedCount?: number }> {
  const res = await ownerFetch(`/api/owner-finance/managers/${encodeURIComponent(managerId)}`, {
    method: 'DELETE',
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload & { archivedCount?: number }>(res);
}

export async function runOwnerAiManagerAudit(): Promise<
  OwnerFinanceDashboardPayload & { report?: AiManagerAuditReport }
> {
  const res = await ownerFetch('/api/owner-finance/ai-manager-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload & { report?: AiManagerAuditReport }>(res);
}

export async function markOwnerAuditAlertRead(
  alertId: string
): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch(`/api/owner-finance/alerts/${encodeURIComponent(alertId)}/read`, {
    method: 'PATCH',
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createOwnerReceivable(payload: {
  clientName: string;
  purpose: string;
  totalAmountEGP: number;
  dueDate: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/receivables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function collectOwnerReceivable(
  receivableId: string,
  payload: { amountEGP?: number; channel: OwnerFinanceChannel }
): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch(
    `/api/owner-finance/receivables/${encodeURIComponent(receivableId)}/collect`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function createOwnerPayable(payload: {
  supplierName: string;
  purpose: string;
  supplierScope?: 'internal_platform' | 'external_supplier';
  urgency?: FinancialUrgencyLevel;
  totalAmountEGP: number;
  scheduledPaymentDate: string;
}): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch('/api/owner-finance/payables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function payOwnerPayable(
  payableId: string,
  payload: { amountEGP?: number; channel: OwnerFinanceChannel }
): Promise<OwnerFinanceDashboardPayload> {
  const res = await ownerFetch(`/api/owner-finance/payables/${encodeURIComponent(payableId)}/pay`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<OwnerFinanceDashboardPayload>(res);
}

export async function runOwnerAiSmartInvestor(): Promise<{
  analysis: OwnerAiInvestorAnalysis;
  generatedAt: string;
}> {
  const res = await ownerFetch('/api/owner-finance/ai-investor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJsonOrThrow<{
    analysis: OwnerAiInvestorAnalysis;
    generatedAt: string;
  }>(res);
}

export async function transcribeFinanceVoice(payload: {
  audioBase64?: string;
  mimeType?: string;
  textTranscript?: string;
  context?: string;
  fmToken?: string | null;
}): Promise<{ transcript: string; parsed: VoiceParsedFields }> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (payload.fmToken) {
    headers.set('X-Finance-Manager-Token', payload.fmToken);
    const res = await fetch('/api/finance/voice-transcribe', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        audioBase64: payload.audioBase64,
        mimeType: payload.mimeType,
        textTranscript: payload.textTranscript,
        context: payload.context,
      }),
    });
    return parseJsonOrThrow<{ transcript: string; parsed: VoiceParsedFields }>(res);
  }

  const res = await ownerFetch('/api/finance/voice-transcribe', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      audioBase64: payload.audioBase64,
      mimeType: payload.mimeType,
      textTranscript: payload.textTranscript,
      context: payload.context,
    }),
  });
  return parseJsonOrThrow<{ transcript: string; parsed: VoiceParsedFields }>(res);
}

export async function recordOwnerPdfExportAudit(
  period: 'day' | 'week' | 'month'
): Promise<void> {
  try {
    await ownerFetch('/api/owner-finance/audit-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    });
  } catch {
    // non-fatal telemetry
  }
}

export async function ingestPurchaseToOwnerLedger(payload: {
  source: string;
  purpose: string;
  originLabel?: string;
  grossEGP: number;
  paymentMethod?: string;
  channel?: OwnerFinanceChannel;
  commissionPct?: number;
  orderRef?: string;
}): Promise<void> {
  if (!Number.isFinite(payload.grossEGP) || payload.grossEGP <= 0) return;
  try {
    await fetch('/api/owner-finance/inflow-ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    // keep customer checkout resilient if offline
  }
}
