import { UserRole } from '../types/dashboard';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullNameAr: string;
  fullNameEn: string;
  jobTitleAr: string;
  jobTitleEn: string;
  role: UserRole;
  tenantId?: string;
  tenantNameAr?: string;
  status: 'active' | 'requires_password_change' | 'pending_approval' | 'suspended';
  isTemporaryPassword?: boolean;
  lastLoginAt?: string;
  phone?: string;
  avatarText: string;
  badgeColor: string;
  canManageUsers?: boolean;
  canApproveContracts?: boolean;
  canAccessVault?: boolean;
}

// Legacy static password records & localStorage session persistence removed.
// Authentication is exclusively enforced via server-issued HttpOnly sessions and Firebase Auth.
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [];

export function getStoredUsers(): UserAccount[] {
  return [];
}

export function saveStoredUsers(_users: UserAccount[]): void {
  // No-op: localStorage credential persistence is disabled for security.
}

export function getActiveSessionUser(): UserAccount | null {
  return null;
}

export function setActiveSessionUser(_user: UserAccount | null): void {
  // No-op: session tokens live strictly inside HttpOnly server cookies.
}
