import { auth } from '../lib/firebase';

export interface BasetCardRecord {
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

export interface BasetRedemptionRecord {
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

export interface BasetCardStatusResponse {
  ok: boolean;
  activated: boolean;
  status: 'active' | 'inactive';
  card: BasetCardRecord | null;
  redemptions: BasetRedemptionRecord[];
  isAuthenticatedUser?: boolean;
  messageAr?: string;
}

const CARD_TOKEN_STORAGE_KEY = 'baset_family_card_token';

function readStoredCardToken(): string {
  try {
    return localStorage.getItem(CARD_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveStoredCardToken(token: string | null | undefined): void {
  if (!token) return;
  try {
    localStorage.setItem(CARD_TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore storage limits
  }
}

async function buildAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const cardToken = readStoredCardToken();
  if (cardToken) {
    headers['X-Baset-Card-Token'] = cardToken;
  }
  try {
    const user = auth?.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`;
      }
    }
  } catch {
    // anonymous or cookie member flow continues cleanly
  }
  return headers;
}

export async function fetchBasetCardStatus(): Promise<BasetCardStatusResponse> {
  try {
    const headers = await buildAuthHeaders();
    const res = await fetch('/api/baset-card/status', {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      return {
        ok: false,
        activated: false,
        status: 'inactive',
        card: null,
        redemptions: [],
      };
    }
    return (await res.json()) as BasetCardStatusResponse;
  } catch {
    return {
      ok: false,
      activated: false,
      status: 'inactive',
      card: null,
      redemptions: [],
    };
  }
}

export async function activateBasetCard(payload: {
  holderName: string;
  phone: string;
  entityName: string;
  employeeCode: string;
  acceptedTerms: boolean;
}): Promise<BasetCardStatusResponse> {
  const headers = await buildAuthHeaders();
  const res = await fetch('/api/baset-card/activate', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as BasetCardStatusResponse & { cardToken?: string | null };
  if (data.cardToken) {
    saveStoredCardToken(data.cardToken);
  }
  if (!res.ok) {
    throw new Error(data.messageAr || 'تعذر تفعيل كارت باسط.');
  }
  return data;
}

export async function redeemBasetOffer(payload: {
  destination: 'food_meal_benefits' | 'family_entertainment';
  offerId: string;
  offerTitle: string;
  partnerName: string;
  notes?: string;
}): Promise<{
  ok: boolean;
  requiresActivation?: boolean;
  discountAppliedPct?: number;
  redemption?: BasetRedemptionRecord;
  messageAr?: string;
}> {
  const headers = await buildAuthHeaders();
  const res = await fetch('/api/baset-card/redeem-offer', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    ok: boolean;
    requiresActivation?: boolean;
    discountAppliedPct?: number;
    redemption?: BasetRedemptionRecord;
    messageAr?: string;
  };
  return data;
}

export async function deactivateBasetCard(): Promise<BasetCardStatusResponse> {
  const headers = await buildAuthHeaders();
  const res = await fetch('/api/baset-card/deactivate', {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  return (await res.json()) as BasetCardStatusResponse;
}
