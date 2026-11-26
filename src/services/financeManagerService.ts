import type {
  FinanceManagerPublicRecord,
  ManagerSubTreasuryEntry,
  OwnerFinanceChannel,
} from './ownerFinanceService';

export interface FinanceManagerWorkspacePayload {
  manager: FinanceManagerPublicRecord;
  subTreasuryTotalEGP: number;
  entries: ManagerSubTreasuryEntry[];
  inventoryCatalog: Array<{
    itemId: string;
    sku: string;
    nameAr: string;
    unitAr: string;
    quantityOnHand: number;
  }>;
}

// Keep in-memory session token only (never localStorage/sessionStorage)
let inMemoryFmToken: string | null = null;

export function getInMemoryFinanceManagerToken(): string | null {
  return inMemoryFmToken;
}

async function fmFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (inMemoryFmToken) {
    headers.set('X-Finance-Manager-Token', inMemoryFmToken);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}

async function parseFmJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    messageAr?: string;
    error?: string;
  } & T;
  if (!res.ok || data.ok === false) {
    throw new Error(data.messageAr || data.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function loginFinanceManager(payload: {
  username: string;
  password: string;
}): Promise<{ sessionToken: string; manager: FinanceManagerPublicRecord }> {
  const res = await fmFetch('/api/finance-manager/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseFmJson<{ sessionToken: string; manager: FinanceManagerPublicRecord }>(res);
  inMemoryFmToken = data.sessionToken;
  return data;
}

export async function fetchFinanceManagerSession(): Promise<FinanceManagerPublicRecord | null> {
  try {
    const res = await fmFetch('/api/finance-manager/session');
    if (!res.ok) return null;
    const data = await parseFmJson<{ manager: FinanceManagerPublicRecord }>(res);
    return data.manager;
  } catch {
    return null;
  }
}

export async function logoutFinanceManager(): Promise<void> {
  try {
    await fmFetch('/api/finance-manager/logout', { method: 'POST' });
  } finally {
    inMemoryFmToken = null;
  }
}

export async function changeFinanceManagerPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await fmFetch('/api/finance-manager/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseFmJson(res);
}

export async function fetchFinanceManagerWorkspace(): Promise<FinanceManagerWorkspacePayload> {
  const res = await fmFetch('/api/finance-manager/workspace');
  return parseFmJson<FinanceManagerWorkspacePayload>(res);
}

export async function submitFinanceManagerOperation(payload: {
  actionType: 'purchase' | 'supply' | 'collection' | 'quotation';
  partyName: string;
  description: string;
  amountEGP: number;
  channel: OwnerFinanceChannel;
  sharedVia: 'none' | 'email' | 'whatsapp';
  shareTarget?: string;
  entryDate?: string;
}): Promise<{
  entry: ManagerSubTreasuryEntry;
  shareLinks: { whatsappUrl: string; mailtoUrl: string };
}> {
  const res = await fmFetch('/api/finance-manager/operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseFmJson<{
    entry: ManagerSubTreasuryEntry;
    shareLinks: { whatsappUrl: string; mailtoUrl: string };
  }>(res);
}
