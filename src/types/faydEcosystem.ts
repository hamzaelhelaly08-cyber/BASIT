import type { Timestamp } from 'firebase/firestore';
import type { CountryCode, PaymentGatewayId } from '../data/phase1Data';

export type FaydRole =
  | 'visitor'
  | 'customer'
  | 'employee'
  | 'entity_admin'
  | 'merchant_owner'
  | 'merchant_staff'
  | 'kitchen_partner'
  | 'entertainment_partner'
  | 'delivery_client'
  | 'courier'
  | 'opportunity_partner'
  | 'finance_admin'
  | 'central_admin'
  | 'central_super_admin';

export type ContractStatus =
  | 'contracted'
  | 'in_contracting'
  | 'prospective'
  | 'unlaunched_sector';

export type AccountRegistrationKind =
  | 'factory_company'
  | 'merchant_owner'
  | 'customer'
  | 'courier'
  | 'opportunity_partner';

export type OnboardingTargetRole =
  | 'merchant_owner'
  | 'delivery_client'
  | 'courier'
  | 'opportunity_partner';

export type OnboardingEntityType =
  | 'restaurant'
  | 'store'
  | 'central_kitchen'
  | 'company_factory'
  | 'courier_individual'
  | 'project_owner'
  | 'site_owner';

export type TenantEntityType =
  | 'restaurant'
  | 'store'
  | 'central_kitchen'
  | 'company_factory'
  | 'delivery_client';

export type OnboardingStatus = 'pending_review' | 'needs_info' | 'approved' | 'rejected';
export type CommercialOrderStatus =
  | 'pending_merchant'
  | 'accepted_preparing'
  | 'ready_for_pickup'
  | 'in_delivery'
  | 'completed'
  | 'cancelled';

export type DeliveryStatus =
  | 'requested'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type OpportunityKind = 'project_expertise' | 'commercial_site';
export type OpportunityApprovalStatus = 'pending_admin' | 'approved' | 'rejected' | 'closed';

export type UsufructProposalStatus =
  | 'awaiting_site_owner'
  | 'awaiting_admin'
  | 'contract_issued'
  | 'rejected';

export type LedgerSourceType =
  | 'order_commission'
  | 'delivery_fee'
  | 'subscription'
  | 'usufruct_share';

export type NotificationStatus = 'new' | 'read' | 'processed';
export type NotificationCategory =
  | 'onboarding'
  | 'order'
  | 'payment'
  | 'delivery'
  | 'offer'
  | 'system';

export type PaymentTransactionStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'hamzaelhelaly08@gmail.com';
export const OWNER_INBOX_UID = 'owner_central_admin';
export const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
}

export function clampText(raw: string, maxLen: number): string {
  return raw.trim().slice(0, maxLen);
}

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  role: FaydRole;
  tenantId?: string;
  status: 'active' | 'pending' | 'suspended';
  countryCode: CountryCode;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserPrivateProfileDoc {
  uid: string;
  email: string;
  phone?: string;
  nationalOrTaxId?: string;
  address?: string;
  updatedAt?: Timestamp;
}

export interface OnboardingApplicationDoc {
  appId: string;
  applicantUid: string;
  targetRole: OnboardingTargetRole;
  entityType: OnboardingEntityType;
  businessName: string;
  contactName: string;
  phone: string;
  countryCode: CountryCode;
  city: string;
  commercialRegRef: string;
  selectedPlanId: string;
  notes?: string;
  status: OnboardingStatus;
  adminComment?: string;
  reviewedByUid?: string;
  createdTenantId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TenantWorkspaceDoc {
  tenantId: string;
  ownerUid: string;
  name: string;
  entityType: TenantEntityType;
  countryCode: CountryCode;
  city: string;
  commercialRegRef: string;
  planId: string;
  customCommissionPct: number;
  deliveryEnabled: boolean;
  status: 'active' | 'suspended';
  contractStatus?: ContractStatus;
  contractedKitchenIdsCsv?: string;
  logoUrl?: string;
  cateringScheduleText?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TenantMemberDoc {
  uid: string;
  tenantId: string;
  staffName: string;
  memberEmail?: string;
  memberRole: 'owner' | 'manager' | 'staff';
  canonicalRole?: string;
  permissions?: string[];
  inviteStatus?: 'pending' | 'active' | 'suspended';
  invitedByUid?: string;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PublicStorefrontDoc {
  tenantId: string;
  name: string;
  entityType: TenantEntityType;
  countryCode: CountryCode;
  city: string;
  isActive: boolean;
  updatedAt?: Timestamp;
}

export interface CatalogItemDoc {
  itemId: string;
  tenantId: string;
  merchantOwnerUid: string;
  storeName: string;
  title: string;
  category: string;
  priceEGP: number;
  stockQty: number;
  isAvailable: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CommercialOrderDoc {
  orderId: string;
  tenantId: string;
  merchantOwnerUid: string;
  customerUid: string;
  customerName: string;
  itemsSummary: string;
  subtotalEGP: number;
  platformCommissionEGP: number;
  deliveryFeeEGP: number;
  netMerchantEGP: number;
  needsDelivery: boolean;
  dropoffAddress: string;
  status: CommercialOrderStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CourierProfileDoc {
  courierUid: string;
  fullName: string;
  vehicleType: 'motorcycle' | 'car' | 'chilled_van' | 'truck';
  zone: string;
  isOnline: boolean;
  isApproved: boolean;
  walletBalanceEGP: number;
  completedDeliveries: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface DeliveryRequestDoc {
  deliveryId: string;
  requesterUid: string;
  tenantId: string;
  orderId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  packageNote?: string;
  deliveryFeeEGP: number;
  courierShareEGP: number;
  platformDeliveryFeeEGP: number;
  assignedCourierUid: string;
  podConfirmationNote?: string;
  status: DeliveryStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FaydOpportunityDoc {
  oppId: string;
  ownerUid: string;
  ownerName: string;
  oppKind: OpportunityKind;
  title: string;
  category: string;
  city: string;
  description: string;
  commercialTerms: string;
  costOrInvestmentEGP: number;
  freeResourceBlocked: true;
  approvalStatus: OpportunityApprovalStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UsufructProposalDoc {
  proposalId: string;
  opportunityId: string;
  opportunityOwnerUid: string;
  proposerUid: string;
  proposerName: string;
  proposerProfitPct: number;
  siteOwnerProfitPct: number;
  platformUsufructPct: number;
  termsSummary: string;
  proposerAgreed: boolean;
  siteOwnerAgreed: boolean;
  adminApproved: boolean;
  contractId?: string;
  status: UsufructProposalStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UsufructContractDoc {
  contractId: string;
  proposalId: string;
  opportunityId: string;
  opportunityOwnerUid: string;
  proposerUid: string;
  proposerProfitPct: number;
  siteOwnerProfitPct: number;
  platformUsufructPct: number;
  commercialTerms: string;
  approvedByAdminUid: string;
  contractStatus: 'active' | 'completed' | 'terminated';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SubscriptionPlanDoc {
  planId: string;
  nameAr: string;
  nameEn: string;
  monthlyFeeEGP: number;
  orderCommissionPct: number;
  deliveryDiscountPct: number;
  isActive: boolean;
  updatedAt?: Timestamp;
}

export interface CommissionRuleDoc {
  ruleId: string;
  defaultOrderCommissionPct: number;
  defaultDeliveryPlatformPct: number;
  defaultCourierSharePct: number;
  defaultUsufructPlatformPct: number;
  minDeliveryFeeEGP: number;
  updatedAt?: Timestamp;
}

export interface LedgerSettlementDoc {
  entryId: string;
  sourceType: LedgerSourceType;
  referenceId: string;
  tenantId?: string;
  beneficiaryUid: string;
  grossAmountEGP: number;
  platformRevenueEGP: number;
  beneficiaryNetEGP: number;
  settlementStatus: 'accrued' | 'settled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SecurityAuditLogDoc {
  logId: string;
  actorUid: string;
  actionAr: string;
  actionEn: string;
  targetCollection: string;
  targetId: string;
  details?: string;
  createdAt?: Timestamp;
}

export interface NotificationDoc {
  notifId: string;
  recipientUid: string;
  recipientRole: FaydRole;
  tenantId?: string;
  category: NotificationCategory;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  targetSection: string;
  status: NotificationStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OfferAdDoc {
  offerId: string;
  tenantId: string;
  category: 'food' | 'shopping' | 'factory_merchant';
  titleAr: string;
  titleEn: string;
  discountBadgeAr: string;
  discountBadgeEn: string;
  ctaAr: string;
  ctaEn: string;
  countryCode: CountryCode;
  validFrom?: string;
  validTo?: string;
  targetScope?: 'public' | 'contracted_entity' | 'employee_tier';
  eligibleTenantIdsCsv?: string;
  terms?: string;
  isApproved: boolean;
  isActive: boolean;
  createdByUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PaymentTransactionDoc {
  txId: string;
  payerUid: string;
  tenantId: string;
  orderId: string;
  provider: PaymentGatewayId;
  mode: 'sandbox' | 'live';
  countryCode: CountryCode;
  currency: string;
  amount: number;
  status: PaymentTransactionStatus;
  gatewayReference: string;
  idempotencyKey: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PaymentGatewayConfigDoc {
  providerId: PaymentGatewayId;
  displayName: string;
  isEnabled: boolean;
  mode: 'sandbox' | 'live';
  merchantPublicId: string;
  countryCode: CountryCode;
  updatedByUid: string;
  updatedAt?: Timestamp;
}

export interface CmsMenuOverrideItem {
  id: string;
  titleAr: string;
  merchantAr: string;
  priceEGP: number;
  oldPriceEGP?: number;
  discountBadge?: string;
  section: string;
  isCustom?: boolean;
  isHidden?: boolean;
}

export interface PlatformSettingsDoc {
  settingId: 'global';
  autoActivateCustomers: boolean;
  requireAdminApprovalForPartners: boolean;
  defaultLanguage: 'ar' | 'en';
  defaultCountryCode: CountryCode;
  enabledCountriesCsv: string;
  cmsPrimaryPurple?: string;
  cmsAccentYellow?: string;
  cmsHeroBadgeAr?: string;
  cmsHeroTitleAr?: string;
  cmsHeroSubtitleAr?: string;
  cmsMenuOverridesJson?: string;
  cmsIconOverridesJson?: string;
  designatedBasitAdminEmailsCsv?: string;
  designatedHabeApproverEmailsCsv?: string;
  rolePermissionsMatrixJson?: string;
  updatedByUid: string;
  updatedAt?: Timestamp;
}

export type EntertainmentCategory =
  | 'circus'
  | 'amusement_park'
  | 'club'
  | 'hotel_resort'
  | 'beach'
  | 'kids_area'
  | 'trip'
  | 'seasonal';

export interface EntertainmentBenefitDoc {
  benefitId: string;
  partnerUid: string;
  venueName: string;
  category: EntertainmentCategory;
  imageUrl: string;
  description: string;
  approvedBenefitText: string;
  eligibilityScope: 'public' | 'contracted_entity' | 'employee_tier';
  eligibleTenantIdsCsv: string;
  validFrom: string;
  validTo: string;
  terms: string;
  countryCode: CountryCode;
  isApproved: boolean;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BenefitBookingDoc {
  bookingId: string;
  uid: string;
  userName: string;
  tenantId: string;
  benefitId: string;
  venueName: string;
  requestedDate: string;
  peopleCount: number;
  notes: string;
  employerName?: string;
  employeeCode?: string;
  phone?: string;
  discountLabel?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface VipDirectOrderItem {
  title: string;
  qty: number;
  unitPriceEGP: number;
  note?: string;
}

export type VipDirectOrderStatus =
  | 'pending_owner'
  | 'approved'
  | 'preparing'
  | 'completed'
  | 'rejected';

export interface VipDirectOrderDoc {
  orderId: string;
  customerUid: string;
  customerName: string;
  phone: string;
  sourceChannel: 'camel_liver_vip' | 'cart_direct' | 'al_ain_offer';
  itemsSummary: string;
  items: VipDirectOrderItem[];
  totalEGP: number;
  paymentMethod: PaymentGatewayId;
  notes: string;
  status: VipDirectOrderStatus;
  ownerReply?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CharityInitiativeDoc {
  initiativeId: string;
  titleAr: string;
  titleEn: string;
  executingEntity: string;
  mechanismAr: string;
  contributionType: string;
  targetGoalCount: number;
  recordedContributionsCount: number;
  verifiedDeliveriesCount: number;
  proofMediaUrl: string;
  isApproved: boolean;
  isActive: boolean;
  createdByUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CharityContributionDoc {
  contributionId: string;
  initiativeId: string;
  initiativeTitle: string;
  contributorUid: string;
  contributorName: string;
  phone: string;
  contributionNote: string;
  pledgeAmountEGP: number;
  status: 'recorded' | 'executed_verified';
  proofUrl: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface KaffarahRuleDoc {
  ruleId: 'official';
  isOfficiallyApproved: boolean;
  shariaAuthorityName: string;
  referenceCode: string;
  unitCostEGP: number;
  mealsPerKaffarah: number;
  notesAr: string;
  updatedByUid: string;
  updatedAt?: Timestamp;
}

export interface KaffarahOrderDoc {
  orderId: string;
  requesterUid: string;
  donorName: string;
  phone: string;
  kaffarahCount: number;
  totalMeals: number;
  totalAmountEGP: number;
  shariaReferenceUsed: string;
  distributionNotes: string;
  executionStatus: 'pending_verification' | 'awaiting_execution' | 'executed_verified';
  executionProofUrl: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type LogisticsServiceKey =
  | 'weddings_occasions'
  | 'conferences_events'
  | 'open_buffets'
  | 'hospitality'
  | 'central_kitchens_setup'
  | 'institutional_events_catering'
  | 'supply_distribution_logistics';

export interface LogisticsServiceInquiryDoc {
  inquiryId: string;
  requesterUid: string;
  serviceKey: LogisticsServiceKey;
  organizationName: string;
  contactName: string;
  phone: string;
  eventDate: string;
  guestCount: number;
  city: string;
  notes: string;
  status: 'new' | 'in_review' | 'quoted';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CateringFeedbackDoc {
  feedbackId: string;
  authorUid: string;
  tenantId: string;
  category: 'catering_quality' | 'benefit_partner' | 'general_complaint';
  subject: string;
  details: string;
  status: 'open' | 'resolved';
  adminReply: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

