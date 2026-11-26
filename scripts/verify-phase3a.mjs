#!/usr/bin/env node
/**
 * BASIT | باسط — Phase 3-A Reproducible Verification Suite (9 Checks)
 *
 * IMPORTANT:
 * - This script validates TypeScript business logic, payload builders, validation guards,
 *   classification helpers, async React sync hooks, and Firestore rules declarations
 *   against an IN-MEMORY mock of firebase/firestore.
 * - Live Firestore / Firebase Emulator E2E tests are NOT executed by this script.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const ROOT = process.cwd();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'basit-phase3a-'));
const bundleOut = path.join(tmpDir, 'phase3a-bundle.mjs');

// Build a clean virtual entry that bundles the real TS source modules with an in-memory Firestore mock
const mockPlugin = {
  name: 'basit-phase3a-inmemory-firestore',
  setup(build) {
    const store = new Map();
    build.onResolve({ filter: /^firebase\/firestore$/ }, () => ({
      path: 'firebase-firestore-mock',
      namespace: 'mock-ns',
    }));
    build.onResolve({ filter: /^firebase\/auth$/ }, () => ({
      path: 'firebase-auth-mock',
      namespace: 'mock-ns',
    }));
    build.onResolve({ filter: /^\.\.\/lib\/firebase$/ }, () => ({
      path: 'lib-firebase-mock',
      namespace: 'mock-ns',
    }));

    build.onLoad({ filter: /^firebase-firestore-mock$/, namespace: 'mock-ns' }, () => ({
      contents: `
        const __store = globalThis.__BASIT_MOCK_DB__ || (globalThis.__BASIT_MOCK_DB__ = new Map());
        const clone = (v) => (v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v);
        export const serverTimestamp = () => ({ __serverTimestamp: true, iso: new Date().toISOString() });
        export const doc = (_db, ...segments) => ({ path: segments.join('/'), id: segments[segments.length - 1] });
        export const collection = (_db, ...segments) => ({ path: segments.join('/') });
        export const query = (col) => col;
        export const where = () => ({});
        export const onSnapshot = () => () => {};
        export const getDoc = async (ref) => ({
          exists: () => __store.has(ref.path),
          data: () => clone(__store.get(ref.path)),
        });
        export const getDocs = async (col) => {
          const prefix = col.path + '/';
          const docs = [];
          for (const [k, v] of __store.entries()) {
            if (k.startsWith(prefix)) docs.push({ id: k.slice(prefix.length), data: () => clone(v) });
          }
          return { docs };
        };
        export const setDoc = async (ref, data) => {
          __store.set(ref.path, clone(data));
        };
        export const updateDoc = async (ref, patch) => {
          if (!__store.has(ref.path)) {
            throw new Error('NOT_FOUND: ' + ref.path);
          }
          const prev = __store.get(ref.path);
          __store.set(ref.path, { ...clone(prev), ...clone(patch) });
        };
        export const deleteDoc = async (ref) => {
          __store.delete(ref.path);
        };
        export const writeBatch = () => {
          const ops = [];
          return {
            set: (ref, data) => ops.push(() => __store.set(ref.path, clone(data))),
            update: (ref, patch) => ops.push(() => {
              const prev = __store.get(ref.path) || {};
              __store.set(ref.path, { ...clone(prev), ...clone(patch) });
            }),
            delete: (ref) => ops.push(() => __store.delete(ref.path)),
            commit: async () => ops.forEach((fn) => fn()),
          };
        };
      `,
      loader: 'js',
    }));

    build.onLoad({ filter: /^firebase-auth-mock$/, namespace: 'mock-ns' }, () => ({
      contents: `export const User = {};`,
      loader: 'js',
    }));

    build.onLoad({ filter: /^lib-firebase-mock$/, namespace: 'mock-ns' }, () => ({
      contents: `
        export const db = { __mock: true };
        export const OperationType = { CREATE: 'create', UPDATE: 'update', DELETE: 'delete', LIST: 'list', GET: 'get', WRITE: 'write' };
        export const handleFirestoreError = (err, op, p) => {
          throw err instanceof Error ? err : new Error(op + ' ' + p + ': ' + String(err));
        };
        export const isTransientFirestoreOrNetworkError = (err) => {
          const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
          return msg.includes('offline') || msg.includes('network-request-failed') || msg.includes('unavailable');
        };
      `,
      loader: 'js',
    }));

    // Keep bundle self-contained without needing void runtime store errors
    void store;
  },
};

const entryFile = path.join(tmpDir, 'entry.ts');
fs.writeFileSync(
  entryFile,
  `
export * from ${JSON.stringify(path.join(ROOT, 'src/data/phase1Data.ts'))};
export * from ${JSON.stringify(path.join(ROOT, 'src/utils/onboardingClassification.ts'))};
export * from ${JSON.stringify(path.join(ROOT, 'src/services/faydFirestoreService.ts'))};
`
);

async function run() {
  const results = [];
  const record = async (num, name, fn) => {
    await fn();
    results.push({ num, name, status: 'PASS' });
    console.log(`[PASS] (${num}/9) ${name}`);
  };

  try {
    await esbuild.build({
      entryPoints: [entryFile],
      outfile: bundleOut,
      bundle: true,
      format: 'esm',
      platform: 'node',
      loader: { '.jpg': 'dataurl', '.png': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
      plugins: [mockPlugin],
      logLevel: 'silent',
    });

    const mod = await import(`file://${bundleOut}`);
    const mockDb = globalThis.__BASIT_MOCK_DB__;
    const adminUser = {
      uid: 'uid_admin_01',
      displayName: 'Bootstrapped Admin',
      email: 'hamzaelhelaly08@gmail.com',
      emailVerified: true,
    };
    const partnerUser = {
      uid: 'uid_partner_01',
      displayName: 'Al-Ain Entertainment Partner',
      email: 'partner@basit.eg',
      emailVerified: true,
    };
    const merchantUser = {
      uid: 'uid_merchant_01',
      displayName: 'National Kitchen Owner',
      email: 'merchant@basit.eg',
      emailVerified: true,
    };

    // 1. Unified Platform Function Count = 20
    await record(1, 'Unified Platform Function Count (20) & Copy Sync', () => {
      assert.equal(mod.PLATFORM_FUNCTIONS.length, 20);
      assert.equal(mod.PLATFORM_18_FUNCTIONS.length, 20);
      assert.equal(mod.TWELVE_SERVICES.length, 20);
      assert.ok(mod.PHASE1_I18N.ar.nav.services.includes('20'));
      assert.ok(mod.PHASE1_I18N.ar.servicesHeading.includes('20'));
      assert.ok(mod.PHASE1_I18N.en.nav.services.includes('20'));
      assert.ok(mod.PHASE1_I18N.en.servicesHeading.includes('20'));
      const visitor = mod.PHASE1_ROLES.find((r) => r.id === 'visitor');
      assert.ok(visitor.permissionsAr.join(' ').includes('20'));
      assert.ok(visitor.permissionsEn.join(' ').includes('20'));
    });

    // 2. Onboarding Entity Classification & Tenant EntityType Mapping
    await record(2, 'Onboarding Classification & Tenant EntityType Resolution', () => {
      const f = mod.normalizeOnboardingClassification('factory_company', 'merchant_owner', 'restaurant');
      assert.deepEqual(f, { targetRole: 'merchant_owner', entityType: 'company_factory' });
      const d = mod.normalizeOnboardingClassification('factory_company', 'delivery_client', 'store');
      assert.deepEqual(d, { targetRole: 'delivery_client', entityType: 'company_factory' });
      const c = mod.normalizeOnboardingClassification('courier', 'merchant_owner', 'restaurant');
      assert.deepEqual(c, { targetRole: 'courier', entityType: 'courier_individual' });
      const o = mod.normalizeOnboardingClassification('opportunity_partner', 'delivery_client', 'store');
      assert.deepEqual(o, { targetRole: 'opportunity_partner', entityType: 'project_owner' });
      const rRole = mod.resolveOnboardingClassificationForRole('courier', 'restaurant');
      assert.deepEqual(rRole, { targetRole: 'courier', entityType: 'courier_individual' });
      assert.equal(mod.resolveTenantEntityTypeFromApplication('merchant_owner', 'central_kitchen'), 'central_kitchen');
      assert.equal(mod.resolveTenantEntityTypeFromApplication('delivery_client', 'company_factory'), 'delivery_client');
    });

    // 3. EntertainmentBenefit Create / Edit (createdAt + partnerUid preserved) / Delete
    await record(3, 'EntertainmentBenefit CRUD + createdAt & partnerUid Preservation', async () => {
      const benId = await mod.saveEntertainmentBenefit(partnerUser, {
        venueName: 'Aqua Park Oasis',
        category: 'parks',
        imageUrl: '',
        description: 'Family water park benefit for contracted employees',
        approvedBenefitText: '25% Discount',
        eligibilityScope: 'contracted_entity',
        eligibleTenantIdsCsv: 'tnt_01',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        terms: 'Valid with employee badge',
        countryCode: 'EG',
        isApproved: false,
        isActive: true,
      });
      const created = mockDb.get(`entertainment_benefits/${benId}`);
      assert.equal(created.partnerUid, partnerUser.uid);
      const origCreatedAt = { ...created.createdAt, marker: 'orig_ben_ts' };
      mockDb.set(`entertainment_benefits/${benId}`, { ...created, createdAt: origCreatedAt });

      await mod.saveEntertainmentBenefit(adminUser, {
        benefitId: benId,
        venueName: 'Aqua Park Oasis — Updated',
        category: 'parks',
        imageUrl: '',
        description: 'Updated water park benefit',
        approvedBenefitText: '30% Discount',
        eligibilityScope: 'contracted_entity',
        eligibleTenantIdsCsv: 'tnt_01',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        terms: 'Valid with employee badge',
        countryCode: 'EG',
        isApproved: true,
        isActive: false,
      });
      const updated = mockDb.get(`entertainment_benefits/${benId}`);
      assert.deepEqual(updated.createdAt, origCreatedAt);
      assert.equal(updated.partnerUid, partnerUser.uid);
      assert.equal(updated.isActive, false);

      await mod.adminDeleteEntertainmentBenefit(adminUser, benId);
      assert.equal(mockDb.has(`entertainment_benefits/${benId}`), false);
    });

    // 4. OfferAd Create / Edit (createdAt & createdByUid preserved) / Delete
    await record(4, 'OfferAd CRUD + createdAt & createdByUid Preservation', async () => {
      const offId = await mod.adminSaveOfferAd(adminUser, {
        tenantId: 'platform',
        category: 'food',
        titleAr: 'عرض إعاشة المصانع',
        titleEn: 'Factory Catering Offer',
        discountBadgeAr: 'خصم 15%',
        discountBadgeEn: '15% OFF',
        ctaAr: 'اطلب الآن',
        ctaEn: 'Order Now',
        countryCode: 'EG',
        isApproved: true,
        isActive: true,
      });
      const created = mockDb.get(`offers_ads/${offId}`);
      const origCreatedAt = { ...created.createdAt, marker: 'orig_off_ts' };
      mockDb.set(`offers_ads/${offId}`, { ...created, createdAt: origCreatedAt });

      await mod.adminSaveOfferAd(adminUser, {
        offerId: offId,
        tenantId: 'platform',
        category: 'food',
        titleAr: 'عرض إعاشة المصانع المحدث',
        titleEn: 'Factory Catering Offer Updated',
        discountBadgeAr: 'خصم 20%',
        discountBadgeEn: '20% OFF',
        ctaAr: 'اطلب الآن',
        ctaEn: 'Order Now',
        countryCode: 'EG',
        isApproved: true,
        isActive: false,
      });
      const updated = mockDb.get(`offers_ads/${offId}`);
      assert.deepEqual(updated.createdAt, origCreatedAt);
      assert.equal(updated.createdByUid, adminUser.uid);
      assert.equal(updated.isActive, false);

      await mod.adminDeleteOfferAd(adminUser, offId);
      assert.equal(mockDb.has(`offers_ads/${offId}`), false);
    });

    // 5. CharityInitiative Create / Edit (createdAt & counters preserved) / Delete
    await record(5, 'CharityInitiative CRUD + createdAt & Counters Preservation', async () => {
      const chrId = await mod.saveCharityInitiative(adminUser, {
        titleAr: 'إطعام صائم رمضان',
        titleEn: 'Ramadan Iftar Drive',
        executingEntity: 'الوطنية اللوجستية',
        mechanismAr: 'تجهيز وتوزيع وجبات ساخنة موثقة ميدانياً',
        contributionType: 'إطعام',
        targetGoalCount: 1000,
        recordedContributionsCount: 42,
        verifiedDeliveriesCount: 39,
        isApproved: true,
        isActive: true,
      });
      const created = mockDb.get(`charity_initiatives/${chrId}`);
      const origCreatedAt = { ...created.createdAt, marker: 'orig_chr_ts' };
      mockDb.set(`charity_initiatives/${chrId}`, { ...created, createdAt: origCreatedAt });

      await mod.saveCharityInitiative(adminUser, {
        initiativeId: chrId,
        titleAr: 'إطعام صائم رمضان — محدث',
        titleEn: 'Ramadan Iftar Drive Updated',
        executingEntity: 'الوطنية اللوجستية',
        mechanismAr: 'تجهيز وتوزيع وجبات ساخنة موثقة ميدانياً بالصور',
        contributionType: 'إطعام',
        targetGoalCount: 1500,
        isApproved: true,
        isActive: false,
      });
      const updated = mockDb.get(`charity_initiatives/${chrId}`);
      assert.deepEqual(updated.createdAt, origCreatedAt);
      assert.equal(updated.recordedContributionsCount, 42);
      assert.equal(updated.verifiedDeliveriesCount, 39);
      assert.equal(updated.isActive, false);

      await mod.adminDeleteCharityInitiative(adminUser, chrId);
      assert.equal(mockDb.has(`charity_initiatives/${chrId}`), false);
    });

    // 6. CatalogItem Create / Edit (createdAt & immutable keys preserved) / Delete
    await record(6, 'CatalogItem CRUD + createdAt & Tenant Key Preservation', async () => {
      const tenant = {
        tenantId: 'tnt_merchant_01',
        name: 'Central Kitchen #1',
        ownerUid: merchantUser.uid,
      };
      const itemId = await mod.saveCatalogItem(merchantUser, tenant, {
        title: 'وجبة مصنع متوازنة',
        category: 'إعاشة',
        priceEGP: 95,
        stockQty: 200,
        isAvailable: true,
      });
      const created = mockDb.get(`catalog_items/${itemId}`);
      const origCreatedAt = { ...created.createdAt, marker: 'orig_cat_ts' };
      mockDb.set(`catalog_items/${itemId}`, { ...created, createdAt: origCreatedAt });

      await mod.saveCatalogItem(merchantUser, tenant, {
        itemId,
        title: 'وجبة مصنع متوازنة — مطورة',
        category: 'إعاشة',
        priceEGP: 110,
        stockQty: 180,
        isAvailable: false,
      });
      const updated = mockDb.get(`catalog_items/${itemId}`);
      assert.deepEqual(updated.createdAt, origCreatedAt);
      assert.equal(updated.tenantId, tenant.tenantId);
      assert.equal(updated.merchantOwnerUid, merchantUser.uid);
      assert.equal(updated.priceEGP, 110);
      assert.equal(updated.isAvailable, false);

      await mod.deleteCatalogItem(merchantUser, itemId);
      assert.equal(mockDb.has(`catalog_items/${itemId}`), false);
    });

    // 7. Onboarding Phone Guard (>=6 chars) & Admin Approval Tenant Mapping
    await record(7, 'Onboarding Phone Guard & Admin Approval Tenant EntityType', async () => {
      await assert.rejects(
        () =>
          mod.submitOnboardingApplication(merchantUser, {
            targetRole: 'courier',
            entityType: 'restaurant',
            businessName: 'Fast Rider',
            contactName: 'Ahmed',
            phone: '123',
            countryCode: 'EG',
            city: 'Cairo',
            commercialRegRef: 'CR-99',
            selectedPlanId: 'starter',
          }),
        /6/
      );

      const appId = await mod.submitOnboardingApplication(merchantUser, {
        targetRole: 'courier',
        entityType: 'restaurant',
        businessName: 'Fast Rider Fleet',
        contactName: 'Ahmed Courier',
        phone: '01012345678',
        countryCode: 'EG',
        city: 'Cairo',
        commercialRegRef: 'CR-9988',
        selectedPlanId: 'starter',
      });
      const appDoc = mockDb.get(`onboarding_applications/${appId}`);
      assert.equal(appDoc.targetRole, 'courier');
      assert.equal(appDoc.entityType, 'courier_individual');

      const appMerchantId = await mod.submitOnboardingApplication(merchantUser, {
        targetRole: 'delivery_client',
        entityType: 'company_factory',
        businessName: 'Delta Steel Factory',
        contactName: 'M. Hassan',
        phone: '01099887766',
        countryCode: 'EG',
        city: '10th of Ramadan',
        commercialRegRef: 'CR-7755',
        selectedPlanId: 'growth',
      });
      const merchantApp = mockDb.get(`onboarding_applications/${appMerchantId}`);
      await mod.adminApproveOnboardingApplication(adminUser, merchantApp, undefined, 'Approved');
      const approvedApp = mockDb.get(`onboarding_applications/${appMerchantId}`);
      assert.equal(approvedApp.status, 'approved');
      const createdTenant = mockDb.get(`tenants/${approvedApp.createdTenantId}`);
      assert.equal(createdTenant.entityType, 'delivery_client');
    });

    // 8. Charity & Kaffarah Phone Validation Parity (>=6 chars) + Sharia Guard
    await record(8, 'Charity & Kaffarah Phone Validation (>=6) & Sharia Rule Guard', async () => {
      await assert.rejects(
        () =>
          mod.submitCharityContribution(
            merchantUser,
            { initiativeId: 'chr_1', titleAr: 'مبادرة إطعام' },
            { contributorName: 'Ali', phone: '12345', contributionNote: '', pledgeAmountEGP: 100 }
          ),
        /6/
      );
      await assert.rejects(
        () =>
          mod.submitKaffarahOrder(
            merchantUser,
            {
              ruleId: 'official',
              isOfficiallyApproved: true,
              shariaAuthorityName: 'دار الإفتاء',
              referenceCode: 'FATWA-01',
              unitCostEGP: 350,
              mealsPerKaffarah: 10,
              notesAr: '',
              updatedByUid: adminUser.uid,
              updatedAt: null,
            },
            { donorName: 'Ali', phone: '123', kaffarahCount: 1, distributionNotes: '' }
          ),
        /6/
      );
    });

    // 9. Packaging Emblem Asset, Async Form Sync Hooks & Delete Rules Protection
    await record(9, 'Packaging Emblem Asset, Async Form Sync Hooks & Rules Guards', () => {
      const badgePath = path.join(ROOT, 'public/assets/catering/basit_packaging_badge.jpg');
      assert.equal(fs.existsSync(badgePath), true);
      assert.ok(fs.statSync(badgePath).size > 10_000);

      const modalSrc = fs.readFileSync(
        path.join(ROOT, 'src/components/OfficialLegalPaperworkModal.tsx'),
        'utf8'
      );
      assert.ok(modalSrc.includes('/assets/catering/basit_packaging_badge.jpg'));

      const requiredHooks = [
        'src/components/fayd/CentralAdminGovernanceView.tsx',
        'src/components/fayd/MerchantWorkspaceView.tsx',
        'src/components/fayd/CourierPortalView.tsx',
        'src/components/fayd/FaydDeliveryPartnerView.tsx',
      ];
      for (const rel of requiredHooks) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        assert.ok(src.includes('useEffect('), `${rel} missing useEffect async sync`);
      }

      const adminSrc = fs.readFileSync(
        path.join(ROOT, 'src/components/fayd/CentralAdminGovernanceView.tsx'),
        'utf8'
      );
      assert.ok(adminSrc.includes('adminDeleteOfferAd'));
      assert.ok(adminSrc.includes('adminDeleteEntertainmentBenefit'));
      assert.ok(adminSrc.includes('adminDeleteCharityInitiative'));

      const merchSrc = fs.readFileSync(
        path.join(ROOT, 'src/components/fayd/MerchantWorkspaceView.tsx'),
        'utf8'
      );
      assert.ok(merchSrc.includes('deleteCatalogItem'));

      const rulesSrc = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
      assert.ok(rulesSrc.includes('allow delete: if isValidId(offerId) && isAdmin();'));
      assert.ok(rulesSrc.includes('allow delete: if isValidId(benefitId) && isAdmin();'));
      assert.ok(rulesSrc.includes('allow delete: if isValidId(initiativeId) && isAdmin();'));
      assert.ok(
        rulesSrc.includes(
          'allow delete: if isValidId(itemId) && isSignedIn() && (existing().merchantOwnerUid == request.auth.uid || isAdmin());'
        )
      );
    });

    console.log(`\nSummary: ${results.length}/9 PASS (IN-MEMORY MOCK — live Firestore/Emulator NOT executed)`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
