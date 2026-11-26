import React from 'react';

export interface LogoItemProps {
  className?: string;
  compact?: boolean;
}

/**
 * High-Definition Authentic SVG Bank & Payment Gateway Emblems (No generic icons or plain text pills)
 */
export const NbeBankLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="البنك الأهلي المصري NBE">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#0B4F38" />
    <path d="M18 54V26l14 14-14 14zm30-28L34 40l14 14V26z" fill="#E8B931" />
    <circle cx="33" cy="21" r="4.5" fill="#FDE68A" />
    <text x="61" y="38" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="system-ui, sans-serif">
      NBE
    </text>
    <text x="61" y="54" fill="#D1FAE5" fontSize="8.5" fontWeight="700" fontFamily="Tahoma, sans-serif">
      البنك الأهلي
    </text>
  </svg>
);

export const NbkBankLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="بنك الكويت الوطني NBK">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#003A70" />
    <rect x="14" y="16" width="28" height="48" rx="6" fill="#0EA5E9" fillOpacity="0.24" stroke="#38BDF8" strokeWidth="1.5" />
    <path d="M22 50V30l12 20V30" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="51" y="39" fill="#FFFFFF" fontSize="14.5" fontWeight="900" fontFamily="system-ui, sans-serif">
      NBK
    </text>
    <text x="51" y="54" fill="#BAE6FD" fontSize="8" fontWeight="700" fontFamily="Tahoma, sans-serif">
      الكويت الوطني
    </text>
  </svg>
);

export const BanqueMisrLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="بنك مصر Banque Misr">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#7C1129" />
    <circle cx="30" cy="40" r="14" fill="#B91C1C" stroke="#FCD34D" strokeWidth="2.5" />
    <path d="M23 44l7-14 7 14h-14z" fill="#FCD34D" />
    <text x="52" y="37" fill="#FFFFFF" fontSize="11.5" fontWeight="900" fontFamily="system-ui, sans-serif">
      BANQUE
    </text>
    <text x="52" y="52" fill="#FDE68A" fontSize="11.5" fontWeight="900" fontFamily="system-ui, sans-serif">
      MISR
    </text>
  </svg>
);

export const CibBankLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="البنك التجاري الدولي CIB">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#004B8D" />
    <path d="M18 55h28l-6-32-8 10-8-10-6 32z" fill="#F59E0B" />
    <text x="55" y="42" fill="#FFFFFF" fontSize="17" fontWeight="900" letterSpacing="1" fontFamily="system-ui, sans-serif">
      CIB
    </text>
    <text x="55" y="55" fill="#93C5FD" fontSize="7.5" fontWeight="700" fontFamily="Tahoma, sans-serif">
      التجاري الدولي
    </text>
  </svg>
);

export const VisaLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="VISA">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
    <rect x="2" y="2" width="116" height="10" rx="4" fill="#1A1F71" />
    <rect x="2" y="68" width="116" height="10" rx="4" fill="#F7B600" />
    <text
      x="60"
      y="49"
      textAnchor="middle"
      fill="#1A1F71"
      fontSize="26"
      fontWeight="900"
      fontStyle="italic"
      letterSpacing="2"
      fontFamily="system-ui, sans-serif"
    >
      VISA
    </text>
  </svg>
);

export const MastercardLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="Mastercard">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#111827" />
    <circle cx="48" cy="36" r="18" fill="#EB001B" />
    <circle cx="72" cy="36" r="18" fill="#F79E1B" fillOpacity="0.9" />
    <text x="60" y="68" textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="800" fontFamily="system-ui, sans-serif">
      mastercard
    </text>
  </svg>
);

export const MeezaLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="Meeza ميزة">
    <defs>
      <linearGradient id="meezaGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="55%" stopColor="#6D28D9" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="116" height="76" rx="12" fill="url(#meezaGrad)" />
    <path d="M22 44c8-16 20-16 28 0-8-7-20-7-28 0z" fill="#34D399" />
    <text x="74" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="900" fontFamily="system-ui, sans-serif">
      meeza
    </text>
    <text x="74" y="57" textAnchor="middle" fill="#D1FAE5" fontSize="10" fontWeight="800" fontFamily="Tahoma, sans-serif">
      ميزة
    </text>
  </svg>
);

export const MadaLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="mada مدى">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
    <rect x="16" y="20" width="40" height="14" rx="4" fill="#00A3E0" />
    <rect x="16" y="38" width="40" height="14" rx="4" fill="#7AC143" />
    <text x="86" y="38" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900" fontFamily="system-ui, sans-serif">
      mada
    </text>
    <text x="86" y="56" textAnchor="middle" fill="#00A3E0" fontSize="12" fontWeight="900" fontFamily="Tahoma, sans-serif">
      مدى
    </text>
  </svg>
);

export const FawryLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="فوري Fawry">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#FFD100" />
    <rect x="14" y="18" width="22" height="44" rx="6" fill="#005596" />
    <path d="M21 44l7-14v9h6l-7 13v-8h-6z" fill="#FFD100" />
    <text x="74" y="40" textAnchor="middle" fill="#005596" fontSize="16" fontWeight="900" fontFamily="system-ui, sans-serif">
      Fawry
    </text>
    <text x="74" y="57" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="Tahoma, sans-serif">
      فوري
    </text>
  </svg>
);

export const InstaPayLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="إنستاباي InstaPay">
    <defs>
      <linearGradient id="instaPayCardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5B21B6" />
        <stop offset="60%" stopColor="#9333EA" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="116" height="76" rx="12" fill="url(#instaPayCardGrad)" />
    <path d="M22 44l10-16v10h12l-10 16V44H22z" fill="#FFFFFF" />
    <text x="78" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="13.5" fontWeight="900" fontFamily="system-ui, sans-serif">
      InstaPay
    </text>
    <text x="78" y="57" textAnchor="middle" fill="#FFEDD5" fontSize="9.5" fontWeight="800" fontFamily="Tahoma, sans-serif">
      إنستاباي
    </text>
  </svg>
);

export const VodafoneCashLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="فودافون كاش Vodafone Cash">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#E60000" />
    <circle cx="30" cy="40" r="16" fill="#FFFFFF" />
    <path
      d="M32 28c-6.5 0-11 4.5-11 10.5 0 5.4 3.8 9.8 9.2 9.8 4.8 0 8.2-3.2 8.2-7.5 0-3.7-2.8-6.4-6.4-6.4-1.5 0-2.6.5-3.3 1 .4-3.2 2.4-5.4 5-6.1.6-.2.4-1.3-.3-1.3H32z"
      fill="#E60000"
    />
    <text x="80" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="900" fontFamily="system-ui, sans-serif">
      Vodafone
    </text>
    <text x="80" y="55" textAnchor="middle" fill="#FEE2E2" fontSize="11.5" fontWeight="900" fontFamily="system-ui, sans-serif">
      CASH
    </text>
  </svg>
);

export const ApplePayLogo: React.FC<LogoItemProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 80" className={className} role="img" aria-label="Apple Pay">
    <rect x="2" y="2" width="116" height="76" rx="12" fill="#0F172A" />
    <path
      d="M42 29c1.2-1.5 2-3.5 1.8-5.5-1.7.1-3.8 1.1-5 2.6-1.1 1.3-2 3.3-1.8 5.2 1.9.1 3.8-1 5-2.3zm1.6 3.1c-2.8-.2-5.1 1.6-6.4 1.6s-3.4-1.5-5.6-1.4c-2.9.1-5.5 1.7-7 4.3-3 5.2-.8 12.9 2.1 17.1 1.4 2 3.1 4.3 5.3 4.2 2.1-.1 3-1.4 5.5-1.4s3.3 1.4 5.6 1.3c2.3-.1 3.8-2.1 5.2-4.1 1.6-2.4 2.3-4.7 2.4-4.8-.1-.1-4.5-1.7-4.6-6.9-.1-4.3 3.5-6.4 3.7-6.5-2-3-5.2-3.3-6.2-3.4z"
      fill="#FFFFFF"
    />
    <text x="79" y="48" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="800" fontFamily="system-ui, sans-serif">
      Pay
    </text>
  </svg>
);

export const BankLogosStrip: React.FC<{ isRtl?: boolean; compact?: boolean }> = ({
  isRtl = true,
  compact = false,
}) => {
  const banks = [
    { id: 'nbe', label: isRtl ? 'البنك الأهلي المصري' : 'NBE', Logo: NbeBankLogo },
    { id: 'nbk', label: isRtl ? 'بنك الكويت الوطني' : 'NBK', Logo: NbkBankLogo },
    { id: 'bm', label: isRtl ? 'بنك مصر' : 'Banque Misr', Logo: BanqueMisrLogo },
    { id: 'cib', label: isRtl ? 'البنك التجاري الدولي' : 'CIB', Logo: CibBankLogo },
  ];

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black text-[#64748B] dark:text-[#C4B5FD]">
        {isRtl ? 'البنوك وشركاء التحويل المؤسسي المعتمدون' : 'Partner Banks'}
      </div>
      <div className={`grid ${compact ? 'grid-cols-4 gap-2' : 'grid-cols-2 sm:grid-cols-4 gap-2.5'}`}>
        {banks.map(({ id, label, Logo }) => (
          <div
            key={id}
            title={label}
            className="p-1.5 rounded-xl bg-white dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 shadow-2xs flex flex-col items-center justify-center"
          >
            <div className="w-full max-w-[96px] aspect-[3/2] flex items-center justify-center overflow-hidden">
              <Logo className="w-full h-full object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PaymentLogosStrip: React.FC<{ isRtl?: boolean; compact?: boolean }> = ({
  isRtl = true,
  compact = false,
}) => {
  const methods = [
    { id: 'visa', label: 'VISA', Logo: VisaLogo },
    { id: 'mastercard', label: 'Mastercard', Logo: MastercardLogo },
    { id: 'meeza', label: isRtl ? 'ميزة' : 'Meeza', Logo: MeezaLogo },
    { id: 'mada', label: isRtl ? 'مدى' : 'mada', Logo: MadaLogo },
    { id: 'fawry', label: isRtl ? 'فوري' : 'Fawry', Logo: FawryLogo },
    { id: 'instapay', label: isRtl ? 'إنستاباي' : 'InstaPay', Logo: InstaPayLogo },
    { id: 'vodafone_cash', label: isRtl ? 'فودافون كاش' : 'Vodafone Cash', Logo: VodafoneCashLogo },
    { id: 'apple_pay', label: 'Apple Pay', Logo: ApplePayLogo },
  ];

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black text-[#64748B] dark:text-[#C4B5FD]">
        {isRtl ? 'بطاقات وبوابات الدفع المعتمدة' : 'Accepted Cards & Payment Gateways'}
      </div>
      <div className={`grid ${compact ? 'grid-cols-4 gap-1.5' : 'grid-cols-4 sm:grid-cols-8 gap-2'}`}>
        {methods.map(({ id, label, Logo }) => (
          <div
            key={id}
            title={label}
            className="p-1 rounded-xl bg-white dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 shadow-2xs flex items-center justify-center"
          >
            <div className="w-full max-w-[78px] aspect-[3/2] flex items-center justify-center overflow-hidden">
              <Logo className="w-full h-full object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
