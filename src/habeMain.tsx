import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, X } from 'lucide-react';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './index.css';
import { HabeGermanMarketPortal } from './components/HabeGermanMarketPortal';
import { auth, db, ecosystemGoogleSignIn, logout } from './lib/firebase';
import { BOOTSTRAPPED_ADMIN_EMAIL, type PlatformSettingsDoc } from './types/faydEcosystem';

interface ServerSessionUser {
  uid: string;
  email: string;
  username?: string;
  employeeCode?: string;
  canApproveHabe?: boolean;
  fullName: string;
  role: 'customer' | 'basit_admin' | 'finance_admin' | 'owner';
  canonicalRole: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
}

function parseEmailCsv(csv?: string): string[] {
  if (!csv) return [];
  return csv
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes('@'));
}

const StandaloneHabeApp: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [serverUser, setServerUser] = useState<ServerSessionUser | null>(null);
  const [designatedHabeApproversCsv, setDesignatedHabeApproversCsv] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.classList.remove('dark');

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        const cleanEmail = user.email.trim().toLowerCase();
        const isOwner = cleanEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
        setServerUser({
          uid: user.uid,
          email: cleanEmail,
          fullName: user.displayName || cleanEmail,
          role: isOwner ? 'owner' : 'customer',
          canonicalRole: isOwner ? 'super_admin' : 'customer',
          approvalStatus: 'approved',
        });
      } else {
        setServerUser(null);
      }
    });

    const unsubSettings = onSnapshot(
      doc(db, 'platform_settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<PlatformSettingsDoc>;
          setDesignatedHabeApproversCsv(data.designatedHabeApproverEmailsCsv || '');
        }
      },
      () => {
        // Keep current state on transient read failure
      }
    );

    return () => {
      unsubAuth();
      unsubSettings();
    };
  }, []);

  const isOwnerAdmin = useMemo(() => {
    return Boolean(
      (firebaseUser?.emailVerified &&
        firebaseUser.email?.trim().toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) ||
        serverUser?.canonicalRole === 'super_admin' ||
        serverUser?.role === 'owner'
    );
  }, [firebaseUser, serverUser]);

  const isDesignatedHabeApprover = useMemo(() => {
    if (serverUser?.canApproveHabe) return true;
    if (!firebaseUser?.emailVerified || !firebaseUser.email) return false;
    const email = firebaseUser.email.trim().toLowerCase();
    return parseEmailCsv(designatedHabeApproversCsv).includes(email);
  }, [firebaseUser, designatedHabeApproversCsv, serverUser]);

  const canApproveHabePurchases = isOwnerAdmin || isDesignatedHabeApprover;
  const isAuthVerified = Boolean(firebaseUser?.emailVerified) || Boolean(serverUser);
  const currentAuthUserEmail = firebaseUser?.email || serverUser?.email || '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 py-2 px-2 sm:px-5 pb-16">
      <HabeGermanMarketPortal
        isRtl={true}
        isStandaloneApp={true}
        canApproveHabePurchases={canApproveHabePurchases}
        isOwnerAdmin={isOwnerAdmin}
        currentAuthUserEmail={currentAuthUserEmail}
        currentUsername={serverUser?.username}
        currentEmployeeCode={serverUser?.employeeCode}
        isAuthVerified={isAuthVerified}
        onSessionAuthenticated={(userObj) => {
          setServerUser((userObj as ServerSessionUser) || null);
          window.dispatchEvent(new CustomEvent('basit:session-updated'));
        }}
        onGoogleSignIn={() => {
          void ecosystemGoogleSignIn().then((u) => {
            if (u) {
              showToast(`تم تسجيل الدخول بنجاح (${u.email})`);
            }
          });
        }}
        onSignOut={() => {
          void logout().then(() => {
            setServerUser(null);
            window.dispatchEvent(new CustomEvent('basit:session-updated'));
            showToast('تم تسجيل الخروج بنجاح.');
          });
        }}
        onAddAuditLog={() => {
          // Local isolated audit trail
        }}
        onShowToast={showToast}
      />

      {toastMessage && (
        <div className="fixed bottom-4 start-4 end-4 sm:end-auto sm:start-6 z-50 sm:max-w-md bg-slate-950 text-white border-2 border-red-500 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-300 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-xl cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

createRoot(document.getElementById('habe-root')!).render(<StandaloneHabeApp />);
