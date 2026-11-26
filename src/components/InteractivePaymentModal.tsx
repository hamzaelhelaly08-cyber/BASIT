import React from 'react';
import { X } from 'lucide-react';
import { PaymentMethodsHubView, PaymentGatewayKey } from './PaymentMethodsHubView';

export type PaymentMethodTab = 'instapay' | 'vodafone_cash' | 'fawry' | 'bank_transfer' | 'card';

interface InteractivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
  totalAmount: number;
  currencyLabel?: string;
  orderReference?: string;
  appliedCoupon?: string | null;
  initialMethod?: PaymentMethodTab;
  onPaymentSuccess?: (method: string, refId: string) => void;
}

export const InteractivePaymentModal: React.FC<InteractivePaymentModalProps> = ({
  isOpen,
  onClose,
  isRtl = true,
  totalAmount,
  currencyLabel = 'ج.م',
  orderReference = `BST-${Date.now().toString().slice(-6)}`,
  appliedCoupon = null,
  initialMethod = 'instapay',
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  // Map legacy PaymentMethodTab to PaymentGatewayKey
  const mappedInitialMethod: PaymentGatewayKey =
    initialMethod === 'bank_transfer'
      ? 'bank_wire'
      : initialMethod === 'card'
        ? 'cards'
        : initialMethod;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#181126] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#62339A]/30 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Modal Top Bar Close Handle */}
        <div className="px-5 py-3 bg-[#201735] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1.5 rounded-full bg-white/30 mx-auto sm:hidden" />
            <span className="text-xs font-black text-[#FFC928]">
              {isRtl ? 'بوابة الدفع الإلكتروني المباشر' : 'Direct Payment Gateway'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body Hosting PaymentMethodsHubView */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <PaymentMethodsHubView
            isRtl={isRtl}
            totalAmount={totalAmount}
            currencyLabel={currencyLabel}
            orderReference={orderReference}
            appliedCoupon={appliedCoupon}
            initialMethod={mappedInitialMethod}
            onPaymentSuccess={(method, refId) => {
              if (onPaymentSuccess) {
                onPaymentSuccess(method, refId);
              }
            }}
            onBack={onClose}
          />
        </div>
      </div>
    </div>
  );
};
