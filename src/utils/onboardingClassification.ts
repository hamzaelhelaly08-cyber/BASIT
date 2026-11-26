import type {
  AccountRegistrationKind,
  OnboardingEntityType,
  OnboardingTargetRole,
  TenantEntityType,
} from '../types/faydEcosystem';

export const ALLOWED_ENTITY_TYPES_BY_KIND: Record<
  Exclude<AccountRegistrationKind, 'customer'>,
  OnboardingEntityType[]
> = {
  factory_company: ['company_factory'],
  merchant_owner: ['restaurant', 'store', 'central_kitchen', 'company_factory'],
  courier: ['courier_individual'],
  opportunity_partner: ['project_owner', 'site_owner'],
};

export const DEFAULT_ENTITY_TYPE_BY_KIND: Record<
  Exclude<AccountRegistrationKind, 'customer'>,
  OnboardingEntityType
> = {
  factory_company: 'company_factory',
  merchant_owner: 'restaurant',
  courier: 'courier_individual',
  opportunity_partner: 'project_owner',
};

export function supportsDeliveryOnlyToggle(
  kind: AccountRegistrationKind
): kind is 'factory_company' | 'merchant_owner' {
  return kind === 'factory_company' || kind === 'merchant_owner';
}

export function normalizeOnboardingClassification(
  kind: Exclude<AccountRegistrationKind, 'customer'>,
  requestedRole: OnboardingTargetRole,
  requestedEntityType: OnboardingEntityType
): {
  targetRole: OnboardingTargetRole;
  entityType: OnboardingEntityType;
} {
  const allowedEntities = ALLOWED_ENTITY_TYPES_BY_KIND[kind];
  const entityType = allowedEntities.includes(requestedEntityType)
    ? requestedEntityType
    : DEFAULT_ENTITY_TYPE_BY_KIND[kind];

  let targetRole: OnboardingTargetRole;
  if (kind === 'courier') {
    targetRole = 'courier';
  } else if (kind === 'opportunity_partner') {
    targetRole = 'opportunity_partner';
  } else {
    targetRole = requestedRole === 'delivery_client' ? 'delivery_client' : 'merchant_owner';
  }

  return { targetRole, entityType };
}

export function resolveOnboardingClassificationForRole(
  targetRole: OnboardingTargetRole,
  entityType: OnboardingEntityType
): {
  targetRole: OnboardingTargetRole;
  entityType: OnboardingEntityType;
} {
  if (targetRole === 'courier') {
    return { targetRole: 'courier', entityType: 'courier_individual' };
  }
  if (targetRole === 'opportunity_partner') {
    return {
      targetRole: 'opportunity_partner',
      entityType: entityType === 'site_owner' ? 'site_owner' : 'project_owner',
    };
  }
  const commercialTypes: OnboardingEntityType[] = [
    'company_factory',
    'restaurant',
    'store',
    'central_kitchen',
  ];
  return {
    targetRole: targetRole === 'delivery_client' ? 'delivery_client' : 'merchant_owner',
    entityType: commercialTypes.includes(entityType) ? entityType : 'store',
  };
}

export function resolveTenantEntityTypeFromApplication(
  targetRole: OnboardingTargetRole,
  entityType: OnboardingEntityType
): TenantEntityType {
  if (targetRole === 'delivery_client') {
    return 'delivery_client';
  }
  if (
    entityType === 'restaurant' ||
    entityType === 'store' ||
    entityType === 'central_kitchen' ||
    entityType === 'company_factory'
  ) {
    return entityType;
  }
  return 'store';
}
