import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  User,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

setLogLevel('silent');

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Force HTTP long-polling so Cloud Run reverse proxies, iframes, and mobile LTE networks
// never fail WebChannel HTTP/2 streaming Listen RPCs.
function createResilientFirestore(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId
    );
  } catch {
    const customDbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
}

export const db = createResilientFirestore();
export const auth = getAuth(app);
try {
  auth.useDeviceLanguage();
} catch {
  // ignore in SSR
}

export const redirectAuthResultPromise: Promise<User | null> =
  typeof window !== 'undefined'
    ? getRedirectResult(auth)
        .then((res) => res?.user || null)
        .catch(() => null)
    : Promise.resolve(null);

export const ecosystemGoogleProvider = new GoogleAuthProvider();
ecosystemGoogleProvider.addScope('email');
ecosystemGoogleProvider.addScope('profile');
ecosystemGoogleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isTransientFirestoreOrNetworkError(error: unknown): boolean {
  if (!error) return false;
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '').toLowerCase()
      : '';
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();

  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'auth/network-request-failed' ||
    code === 'cancelled'
  ) {
    return true;
  }

  return (
    msg.includes('client is offline') ||
    msg.includes('failed to get document') ||
    msg.includes('network-request-failed') ||
    msg.includes('fetching auth token failed') ||
    msg.includes('could not reach cloud firestore') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('transport errored')
  );
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  if (isTransientFirestoreOrNetworkError(error)) {
    console.warn(`Firestore offline (${operationType} ${path || ''}): continuing in resilient local mode.`);
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }
  const probe = async (): Promise<boolean> => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      setLogLevel('error');
      return true;
    } catch (error) {
      if (isTransientFirestoreOrNetworkError(error)) {
        return false;
      }
      setLogLevel('error');
      return true;
    }
  };
  const timeout = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), 3000);
  });
  return Promise.race([probe(), timeout]);
}

let cachedAccessToken: string | null = null;
let isSigningIn = false;
let activeEcosystemSignInPromise: Promise<User | null> | null = null;

function isPopupCancellationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code || '';
  return (
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/popup-closed-by-user'
  );
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        try {
          const token = await user.getIdToken();
          cachedAccessToken = token;
          if (onAuthSuccess) onAuthSuccess(user, token);
        } catch {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

let lastGoogleAuthError: string | null = null;

export function getLastGoogleAuthErrorMessage(lang: 'ar' | 'en' = 'ar'): string | null {
  if (!lastGoogleAuthError) return null;
  const code = lastGoogleAuthError;
  if (code === 'POPUP_BLOCKED_IFRAME' || code === 'auth/popup-blocked') {
    return lang === 'ar'
      ? 'تم حظر نافذة تسجيل دخول Google. يرجى السماح بالنوافذ المنبثقة أو فتح التطبيق في نافذة مستقلة.'
      : 'Google sign-in popup was blocked. Please allow popups or open the app in a new tab.';
  }
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    return lang === 'ar'
      ? `النطاق الحالي (${host}) غير مضاف ضمن النطاقات المصرح بها في Firebase Auth.`
      : `Domain (${host}) is not authorized in Firebase Authentication settings.`;
  }
  if (code === 'auth/operation-not-allowed') {
    return lang === 'ar'
      ? 'مزود تسجيل الدخول عبر Google غير مفعّل في إعدادات Firebase Authentication.'
      : 'Google Sign-In provider is disabled in Firebase Authentication settings.';
  }
  if (code === 'auth/network-request-failed') {
    return lang === 'ar'
      ? 'تعذر الاتصال بخوادم Google للمصادقة. تحقق من الاتصال بالإنترنت وأعد المحاولة.'
      : 'Network error reaching Google Authentication. Check your connection and retry.';
  }
  return lang === 'ar'
    ? `تعذر إتمام تسجيل الدخول عبر Google (${code}).`
    : `Google sign-in could not complete (${code}).`;
}

export const ecosystemGoogleSignIn = async (): Promise<User | null> => {
  if (activeEcosystemSignInPromise) {
    return activeEcosystemSignInPromise;
  }

  activeEcosystemSignInPromise = (async () => {
    lastGoogleAuthError = null;
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, ecosystemGoogleProvider, browserPopupRedirectResolver);
      cachedAccessToken = await result.user.getIdToken();
      return result.user;
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code || '')
          : '';
      const msg = error instanceof Error ? error.message : String(error || '');
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (isPopupCancellationError(error)) {
        return null;
      }

      if (code === 'auth/popup-blocked' && !isInIframe) {
        try {
          await signInWithRedirect(auth, ecosystemGoogleProvider, browserPopupRedirectResolver);
          return null;
        } catch {
          lastGoogleAuthError = 'auth/popup-blocked';
          return null;
        }
      }

      if (msg.includes('Pending promise') || code === 'auth/network-request-failed') {
        try {
          const retryResult = await signInWithPopup(auth, ecosystemGoogleProvider);
          cachedAccessToken = await retryResult.user.getIdToken();
          return retryResult.user;
        } catch (retryErr) {
          const retryCode =
            typeof retryErr === 'object' && retryErr !== null && 'code' in retryErr
              ? String((retryErr as { code?: unknown }).code || '')
              : '';
          lastGoogleAuthError = retryCode || code || 'auth/network-request-failed';
        }
      } else {
        lastGoogleAuthError =
          code || (isInIframe ? 'POPUP_BLOCKED_IFRAME' : msg || 'google_signin_failed');
      }

      console.warn('BASIT Google Sign-in handled gracefully:', error);
      if (auth.currentUser) return auth.currentUser;
      return null;
    } finally {
      isSigningIn = false;
      activeEcosystemSignInPromise = null;
    }
  })();

  return activeEcosystemSignInPromise;
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  if (auth.currentUser) {
    cachedAccessToken = await auth.currentUser.getIdToken();
    return cachedAccessToken;
  }
  return null;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
