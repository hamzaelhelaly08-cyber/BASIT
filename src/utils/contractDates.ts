const CONTRACT_MARKER_REGEX = /\s*\[CONTRACT:(\d{4}-\d{2}-\d{2})?\|(\d{4}-\d{2}-\d{2})?\]\s*$/;

export interface ParsedContractSchedule {
  cleanSchedule: string;
  startDate: string;
  endDate: string;
}

export function extractContractDates(cateringScheduleText?: string): ParsedContractSchedule {
  const raw = cateringScheduleText || '';
  const match = raw.match(CONTRACT_MARKER_REGEX);
  if (!match) {
    return { cleanSchedule: raw.trim(), startDate: '', endDate: '' };
  }
  return {
    cleanSchedule: raw.replace(CONTRACT_MARKER_REGEX, '').trim(),
    startDate: match[1] || '',
    endDate: match[2] || '',
  };
}

export function embedContractDates(
  cleanSchedule: string,
  startDate: string,
  endDate: string
): string {
  const base = cleanSchedule.replace(CONTRACT_MARKER_REGEX, '').trim();
  const s = startDate.trim();
  const e = endDate.trim();
  if (!s && !e) {
    return base.slice(0, 500);
  }
  const marker = `[CONTRACT:${s}|${e}]`;
  const maxBaseLen = Math.max(0, 500 - marker.length - 1);
  const clipped = base.slice(0, maxBaseLen).trim();
  return clipped ? `${clipped} ${marker}` : marker;
}

export interface ContractExpiryStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
}

export function getContractExpiryState(endDate: string): ContractExpiryStatus {
  if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { isExpired: false, isExpiringSoon: false, daysRemaining: null };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) {
    return { isExpired: false, isExpiringSoon: false, daysRemaining: null };
  }
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    isExpired: diffDays < 0,
    isExpiringSoon: diffDays >= 0 && diffDays <= 30,
    daysRemaining: diffDays,
  };
}
