import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ShoppingCart,
  Languages,
  X,
  ChefHat,
  UtensilsCrossed,
  FileText,
  Gift,
  MapPin,
  Tag,
  Sun,
  Moon,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Menu,
  LogIn,
  User as UserIcon,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Home,
  QrCode,
  HeartHandshake,
  Scale,
  Building2,
  Heart,
  Settings,
  HelpCircle,
  ClipboardList,
  LogOut,
  Trash2,
  Leaf,
  CreditCard,
  Truck,
  Factory,
  PartyPopper,
  Users,
  Lock,
} from 'lucide-react';
import {
  CountryCode,
  LanguageCode,
  SearchScope,
  SUPPORTED_COUNTRIES,
  PHASE1_I18N,
  PLATFORM_FUNCTIONS,
  THREE_CENTRAL_KITCHENS,
  FOOD_CATEGORIES,
  RoleScope,
  CentralKitchenId,
} from '../data/phase1Data';
import { FRESH_WORLD_PRODUCTS } from '../data/freshWorldData';
import type { NotificationDoc } from '../types/faydEcosystem';
import { OfficialCountryFlag } from './OfficialCountryFlags';
import { PWAInstallButton } from './PWAInstallButton';
import { AL_AIN_RESTAURANTS, PARTNER_ENTERTAINMENT_VENUES } from '../data/visitorWorldData';
import { BasitBrandMark } from './BasitBrandMark';
import { MobileCoverWaves } from './MobileCoverFrame';
import { BASET_FAMILY_CARD_ASSET } from '../data/basetBenefitsData';

export interface NotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'order' | 'offer' | 'invoice' | 'message';
  allowedRoles: RoleScope[];
  timeLabel: string;
}

interface Phase1TopBarProps {
  lang: LanguageCode;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  country: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  role: RoleScope;
  customLogoDataUrl: string | null;
  onUploadLogo: (dataUrl: string) => void;
  onResetLogo: () => void;
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onOpenIconsGuide?: () => void;
  notifications: NotificationItem[];
  firestoreNotifications?: NotificationDoc[];
  isAuthenticated?: boolean;
  isGuestMode?: boolean;
  isAdminUser?: boolean;
  isStrictAppOwner?: boolean;
  loggedInEmail?: string;
  onOpenPdfBuilder?: () => void;
  onOpenOperationalTasks?: () => void;
  onOpenAuthGate?: () => void;
  onSignOut?: () => void;
  onMarkNotificationStatus?: (notifId: string, status: 'read' | 'processed') => void;
  onNavigateSection: (
    section: string,
    kitchenId?: CentralKitchenId
  ) => void;
}

export const Phase1TopBar: React.FC<Phase1TopBarProps> = ({
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
  country,
  onSelectCountry,
  role,
  cartCount,
  onOpenCart,
  favoritesCount = 0,
  onOpenFavorites,
  onOpenIconsGuide,
  notifications,
  firestoreNotifications = [],
  isAuthenticated = false,
  isGuestMode = false,
  isAdminUser = false,
  isStrictAppOwner = false,
  loggedInEmail = '',
  onOpenPdfBuilder,
  onOpenOperationalTasks,
  onOpenAuthGate,
  onSignOut,
  onMarkNotificationStatus,
  onNavigateSection,
}) => {
  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('basit_dismissed_notifications');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const handleDismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDismissedNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('basit_dismissed_notifications', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearAllNotifications = () => {
    const currentIds = [
      ...firestoreNotifications.map((n) => n.notifId),
      ...notifications.map((n) => n.id),
    ];
    setDismissedNotifIds((prev) => {
      const next = Array.from(new Set([...prev, ...currentIds]));
      try {
        localStorage.setItem('basit_dismissed_notifications', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const notifContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        notifOpen &&
        notifContainerRef.current &&
        target &&
        !notifContainerRef.current.contains(target)
      ) {
        setNotifOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen]);

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      setNotifOpen(false);
      setDrawerOpen(true);
    };
    const handleOpenNotificationsEvent = () => {
      setDrawerOpen(false);
      setNotifOpen((prev) => !prev);
    };
    const handleOpenSearchEvent = () => {
      setDrawerOpen(false);
      setNotifOpen(false);
      setSearchModalOpen(true);
    };
    window.addEventListener('basit:open-menu-drawer', handleOpenDrawerEvent);
    window.addEventListener('basit:open-notifications', handleOpenNotificationsEvent);
    window.addEventListener('basit:open-search', handleOpenSearchEvent);
    return () => {
      window.removeEventListener('basit:open-menu-drawer', handleOpenDrawerEvent);
      window.removeEventListener('basit:open-notifications', handleOpenNotificationsEvent);
      window.removeEventListener('basit:open-search', handleOpenSearchEvent);
    };
  }, []);

  const selectedCountryObj =
    SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];

  const sortedFirestoreNotifications = useMemo(() => {
    const statusWeight = { new: 0, read: 1, processed: 2 } as const;
    return [...firestoreNotifications]
      .filter((n) => !dismissedNotifIds.includes(n.notifId))
      .sort((a, b) => statusWeight[a.status] - statusWeight[b.status]);
  }, [firestoreNotifications, dismissedNotifIds]);

  const visibleFallbackNotifications = useMemo(() => {
    return notifications
      .filter((n) => n.allowedRoles.includes(role))
      .filter((n) => !dismissedNotifIds.includes(n.id));
  }, [notifications, role, dismissedNotifIds]);

  const unreadCount = isAuthenticated
    ? sortedFirestoreNotifications.filter((n) => n.status === 'new').length
    : visibleFallbackNotifications.length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const items: {
      id: string;
      scope: Exclude<SearchScope, 'all'>;
      title: string;
      subtitle: string;
      section: string;
      kitchenId?: CentralKitchenId;
    }[] = [];

    FRESH_WORLD_PRODUCTS.forEach((p) => {
      items.push({
        id: `fw_${p.id}`,
        scope: 'products',
        title: isRtl ? p.nameAr : p.nameEn,
        subtitle: isRtl
          ? `حصاد النيل الأخضر — ${p.priceEgp} ج.م · ${p.unitAr}`
          : `Green Nile Harvest — ${p.priceEgp} EGP · ${p.unitEn}`,
        section: 'fresh_world',
      });
    });

    const b2bCateringCatalog = [
      {
        id: 'b2b_cat_factory',
        titleAr: 'توريد وجبات المصانع والورديات',
        titleEn: 'Factory & Shift Meal Supply',
        subAr: 'وجبات حرارية جاهزة للميكرويف بمعايير HACCP',
        subEn: 'HACCP sealed microwavable daily factory meal boxes',
        section: 'service_corporate',
      },
      {
        id: 'b2b_cat_events',
        titleAr: 'تجهيز الحفلات والمؤتمرات',
        titleEn: 'Event & Conference Catering',
        subAr: 'بوفيهات مفتوحة وضيافة احترافية للمؤتمرات والفعاليات',
        subEn: 'Open buffets and hospitality service for corporate events',
        section: 'logistics_services',
      },
      {
        id: 'b2b_cat_weddings',
        titleAr: 'خدمات الأفراح والولائم',
        titleEn: 'Wedding & Gala Catering',
        subAr: 'ولائم وصواني فاخرة وبوفيهات متكاملة للضيوف',
        subEn: 'VIP banquet trays and full wedding catering setups',
        section: 'service_weddings',
      },
      {
        id: 'b2b_cat_venue',
        titleAr: 'تجهيز المواقع والقاعات',
        titleEn: 'Venue & Industrial Site Supply',
        subAr: 'تجهيز الكانتين ومواقع الإنشاءات وسكن المهندسين',
        subEn: 'On-site canteens, construction hubs & housing supply',
        section: 'b2b_checkout',
      },
    ];
    b2bCateringCatalog.forEach((c) => {
      items.push({
        id: c.id,
        scope: 'catering',
        title: isRtl ? c.titleAr : c.titleEn,
        subtitle: isRtl ? c.subAr : c.subEn,
        section: c.section,
      });
    });

    const partnerCompanies = [
      {
        id: 'comp_elsewedy',
        titleAr: 'شركة السويدي إليكتريك (تعاقد تغذية)',
        titleEn: 'El Sewedy Electric (Corporate Partner)',
        subAr: 'توريد وجبات المصانع والمنشآت الصناعية — العاشر وبدر',
        subEn: 'Industrial workforce meal supply — 10th of Ramadan & Badr',
        section: 'b2b_tracking',
      },
      {
        id: 'comp_egemac',
        titleAr: 'شركة XD EGEMAC (بوابة الشركات)',
        titleEn: 'XD EGEMAC Corporate Portal',
        subAr: 'شراكة تشغيلية في تغذية العاملين وخدمات الضيافة',
        subEn: 'Continuous staff catering & hospitality partnership',
        section: 'b2b_tracking',
      },
      {
        id: 'comp_habe',
        titleAr: 'شركة Ha-Be المصرية للخرسانة والكيماويات',
        titleEn: 'Ha-Be German Market & Corporate Portal',
        subAr: 'بوابة موظفي Ha-Be والمنيو المعتمد وبطاقة الخصم 10%',
        subEn: 'Dedicated Ha-Be employee dining & 10% Basit Card access',
        section: 'al_ain_habe',
      },
      {
        id: 'comp_green_nile',
        titleAr: 'حصاد النيل الأخضر (توريد خضروات وفواكه 3D)',
        titleEn: 'Green Nile Harvest (3D Produce Supply)',
        subAr: 'توريد يومي طازج للشركات والفنادق والمطابخ المركزية',
        subEn: 'Daily chilled produce supply for B2B facilities',
        section: 'fresh_world',
      },
    ];
    partnerCompanies.forEach((co) => {
      items.push({
        id: co.id,
        scope: 'companies',
        title: isRtl ? co.titleAr : co.titleEn,
        subtitle: isRtl ? co.subAr : co.subEn,
        section: co.section,
      });
    });

    THREE_CENTRAL_KITCHENS.forEach((k) => {
      items.push({
        id: `k_${k.id}`,
        scope: 'kitchens',
        title: isRtl ? k.nameAr : k.nameEn,
        subtitle: isRtl ? k.coverageAr : k.coverageEn,
        section: 'kitchen_detail',
        kitchenId: k.id,
      });
      items.push({
        id: `pl_${k.id}`,
        scope: 'places',
        title: isRtl ? k.locationAr : k.locationEn,
        subtitle: isRtl ? k.nameAr : k.nameEn,
        section: 'kitchen_detail',
        kitchenId: k.id,
      });
    });

    PLATFORM_FUNCTIONS.forEach((s) => {
      let mappedScope: Exclude<SearchScope, 'all'> = 'offers';
      if (s.id.includes('invoice') || s.id.includes('payment')) mappedScope = 'invoices';
      else if (s.id.includes('voucher')) mappedScope = 'gift_cards';
      else if (s.id.includes('food')) mappedScope = 'meals';

      items.push({
        id: `srv_${s.id}`,
        scope: mappedScope,
        title: isRtl ? s.titleAr : s.titleEn,
        subtitle: isRtl ? s.subtitleAr : s.subtitleEn,
        section: s.targetSection,
      });
    });

    FOOD_CATEGORIES.forEach((cat) => {
      items.push({
        id: `cat_${cat.id}`,
        scope: 'meals',
        title: isRtl ? cat.ar : cat.en,
        subtitle: isRtl
          ? 'تصنيف وجبات — بانتظار اعتماد الأسعار'
          : 'Food category — Awaiting pricing data',
        section: 'service_meals_offer',
      });
    });

    AL_AIN_RESTAURANTS.forEach((r) => {
      items.push({
        id: `al_ain_r_${r.id}`,
        scope: r.id === 'al_ain_grand_market' ? 'places' : 'meals',
        title: isRtl ? r.nameAr : r.nameEn,
        subtitle: isRtl ? `مول العين — ${r.taglineAr}` : `Al Ain Mall — ${r.taglineEn}`,
        section: `al_ain_restaurant:${r.id}`,
      });
    });

    PARTNER_ENTERTAINMENT_VENUES.forEach((v) => {
      items.push({
        id: `ent_${v.id}`,
        scope: 'places',
        title: isRtl ? v.nameAr : v.nameEn,
        subtitle: isRtl ? `${v.categoryAr} — ${v.locationAr}` : `${v.categoryEn} — ${v.locationEn}`,
        section: v.targetSection,
      });
    });

    const alAinDestinations = [
      {
        id: 'al_ain_majlis',
        scope: 'places' as const,
        titleAr: 'مجلس ضيافة العين',
        titleEn: 'Al Ain Hospitality Majlis',
        subAr: 'الكبدة الجمالي، المندي، والجلسات الخاصة',
        subEn: 'Camel liver griddle, Mandi feasts & VIP lounge',
        section: 'al_ain_majlis',
      },
      {
        id: 'al_ain_wellness',
        scope: 'places' as const,
        titleAr: 'بيت الملح والسبا وصالون الحلاقة',
        titleEn: 'Salt House, Spa & Barber Salon',
        subAr: 'صالون حلاقة، سبا، حمام مغربي وبخار، وبيت الملح',
        subEn: 'Men salon, spa, Moroccan hammam & Salt House',
        section: 'al_ain_wellness',
      },
      {
        id: 'al_ain_kids',
        scope: 'places' as const,
        titleAr: 'منطقة ألعاب الأطفال Kids Area',
        titleEn: 'Kids Area Play Zone',
        subAr: 'ألعاب ترفيهية آمنة للأطفال والعائلات',
        subEn: 'Safe family & kids play zone',
        section: 'al_ain_kids',
      },
      {
        id: 'al_ain_circus',
        scope: 'places' as const,
        titleAr: 'سيرك العين أمام مول العين',
        titleEn: 'Al Ain Circus — Opposite Al Ain Mall',
        subAr: 'عروض بهلوانية وسيرك وترفيه عائلي أمام مول العين',
        subEn: 'Acrobatic circus performances opposite Al Ain Mall',
        section: 'al_ain_circus',
      },
      {
        id: 'al_ain_oriental_nights',
        scope: 'places' as const,
        titleAr: 'ليالي الطرب الشرقي والتخت والعود',
        titleEn: 'Oriental Takht & Oud Nights',
        subAr: 'أمسيات طرب وموسيقى شرقية بالعود كل خميس وجمعة',
        subEn: 'Live Oud & Oriental evenings every Thu & Fri',
        section: 'al_ain_oriental_nights',
      },
      {
        id: 'al_ain_coupons',
        scope: 'offers' as const,
        titleAr: 'قسائم وعروض التوفير (9 قسائم)',
        titleEn: 'Discount Vouchers & Offers (9)',
        subAr: 'كوبونات المطاعم والمجالس والسبا والترفيه (عرض تجريبي)',
        subEn: 'Dining, Majlis, wellness & entertainment vouchers (Demo)',
        section: 'al_ain_coupons',
      },
      {
        id: 'al_ain_occasions',
        scope: 'gift_cards' as const,
        titleAr: 'عروض المناسبات والاحتفالات والأعياد',
        titleEn: 'Seasonal Occasions & Celebrations',
        subAr: 'رمضان، عيد الفطر والأضحى، الولائم والمناسبات',
        subEn: 'Ramadan, Eids, Mother’s Day & corporate gatherings',
        section: 'al_ain_occasions',
      },
      {
        id: 'basit_entertainment_benefits',
        scope: 'offers' as const,
        titleAr: 'الترفيه والمزايا التعاقدية (أكوا بارك، رالي، سيرك، سينمات، نوادي)',
        titleEn: 'Entertainment & Employee Benefits Portal',
        subAr: 'مزايا وحجوزات الترفيه والسياحة المعتمدة للجهات والأفراد',
        subEn: 'Approved parks, rally, circus, cinemas, clubs & resort benefits',
        section: 'entertainment_benefits',
      },
      {
        id: 'basit_logistics_services',
        scope: 'places' as const,
        titleAr: 'الخدمات المكملة — الوطنية اللوجستية (الأفراح والمؤتمرات والضيافة والمطابخ)',
        titleEn: 'Elwataniya Logistics — 7 Complementary Services',
        subAr: 'الأفراح، المؤتمرات، البوفيهات، الضيافة، تجهيز المطابخ، واللوجستيات',
        subEn: 'Weddings, conferences, open buffets, hospitality & central kitchens setup',
        section: 'logistics_services',
      },
      {
        id: 'basit_charity_good_deeds',
        scope: 'offers' as const,
        titleAr: 'اعمل الخير (قسم مستقل)',
        titleEn: 'Do Good — Charity Initiatives',
        subAr: 'مبادرات الإطعام والخير المعتمدة مع توثيق التنفيذ',
        subEn: 'Approved feeding initiatives with verified proof tracking',
        section: 'charity_good_deeds',
      },
      {
        id: 'basit_kaffarah_yamin',
        scope: 'invoices' as const,
        titleAr: 'كفارات اليمين (قسم مستقل بالمرجعية الشرعية)',
        titleEn: 'Kaffarat Al-Yamin (Sharia Governed)',
        subAr: 'منضبط بالمرجعية الشرعية المعتمدة وإثباتات التنفيذ الموثقة',
        subEn: 'Standalone Kaffarah portal gated by Sharia approval & proof',
        section: 'kaffarah_yamin',
      },
      {
        id: 'basit_corporate_portfolio',
        scope: 'places' as const,
        titleAr: 'سابقة الأعمال والشراكات المستمرة (السويدي، XD EGEMAC، سيديكو، الهلال الأحمر، مستقبل مصر، NTA)',
        titleEn: 'Corporate Track Record & Long-Term Partners',
        subAr: 'شراكات متواصلة لسنوات ومستمرين مع كبرى المؤسسات والمصانع',
        subEn: 'Multi-year continuous partnerships across industry and government',
        section: 'logistics_services',
      },
      {
        id: 'basit_christmas_corporate',
        scope: 'offers' as const,
        titleAr: 'أعياد الميلاد والكريسماس للشركات والمصانع',
        titleEn: 'Corporate & Factory Birthdays & Christmas Celebrations',
        subAr: 'تنظيم احتفالات رأس السنة والكريسماس وأعياد الميلاد للمصانع والشركات',
        subEn: 'Corporate & factory New Year, Christmas & birthday celebrations',
        section: 'al_ain_occasions',
      },
      {
        id: 'baset_food_benefits_dir',
        scope: 'offers' as const,
        titleAr: 'وجباتك واحتياجاتك أحلى مع باسط (4 عروض خصم 10%)',
        titleEn: 'BASET Food & Meal Benefits (4 Offers · 10% Off)',
        subAr: 'لحوم الأضحية، كرتونة رمضان، كحك العيد، وتمور زادي الوادي والفرافرة',
        subEn: 'Eid Meat, Ramadan Carton, Eid Kahk & ZADI Oasis Dates',
        section: 'baset_food_benefits',
      },
      {
        id: 'baset_family_entertainment_dir',
        scope: 'places' as const,
        titleAr: 'باسط بسطناها على عيلتك (8 وجهات ترفيهية)',
        titleEn: 'BASET Family Entertainment & Lifestyle (8 Categories)',
        subAr: 'السيرك، السينمات، الشاشات، القرى السياحية، السبا، بيت الملح، الرحلات، الشاليهات',
        subEn: 'Circus, Cinemas, Screens, Resorts, Spa, Salt House, Trips & Chalets',
        section: 'baset_family_entertainment',
      },
      {
        id: 'baset_card_activation_dir',
        scope: 'gift_cards' as const,
        titleAr: 'كارت باسط العائلي والتفعيل الرسمي (خصم 10%)',
        titleEn: 'BASET Family Benefits Card & Official Activation',
        subAr: 'استعراض الكارت ثلاثي الأبعاد، الشروط، والتفعيل الموثق للخصم',
        subEn: '3D Card showcase, explicit offer terms & verified 10% activation',
        section: 'baset_card',
      },
    ];

    alAinDestinations.forEach((d) => {
      items.push({
        id: d.id,
        scope: d.scope,
        title: isRtl ? d.titleAr : d.titleEn,
        subtitle: isRtl ? d.subAr : d.subEn,
        section: d.section,
      });
    });

    const guestAllowed = (sec: string) =>
      sec === 'home' ||
      sec === 'fresh_world' ||
      sec === 'b2b_checkout' ||
      sec === 'b2b_tracking' ||
      sec === 'al_ain_restaurants' ||
      sec === 'al_ain_coupons' ||
      sec === 'al_ain_habe' ||
      sec === 'baset_food_benefits' ||
      sec === 'baset_family_entertainment' ||
      sec === 'baset_card' ||
      sec === 'service_meals_offer' ||
      sec === 'service_corporate' ||
      sec === 'service_weddings' ||
      sec === 'logistics_services' ||
      sec === 'fayd_marketplace' ||
      sec === 'payments' ||
      sec === 'payment_methods' ||
      sec.startsWith('al_ain_restaurant:');

    return items.filter((item) => {
      if (isGuestMode && !guestAllowed(item.section)) return false;
      const matchesScope = searchScope === 'all' || item.scope === searchScope;
      if (!matchesScope) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, searchScope, isRtl, isGuestMode]);

  const scopeOptions: { id: SearchScope; label: string }[] = [
    { id: 'all', label: t.scopes.all },
    { id: 'products', label: t.scopes.products },
    { id: 'catering', label: t.scopes.catering },
    { id: 'companies', label: t.scopes.companies },
    { id: 'kitchens', label: t.scopes.kitchens },
    { id: 'offers', label: t.scopes.offers },
    { id: 'places', label: t.scopes.places },
  ];

  const getStatusLabel = (status: NotificationDoc['status']) => {
    if (status === 'new') return isRtl ? 'جديد' : 'New';
    if (status === 'read') return isRtl ? 'مقروء' : 'Read';
    return isRtl ? 'معالج' : 'Processed';
  };

  return (
    <>
      {notifOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#3B0764]/40 backdrop-blur-[2px]"
          onClick={() => {
            setNotifOpen(false);
          }}
        />
      )}

      {/* Sleek Royal Purple Sticky Top Bar (Uncrowded Single-Row Header + Smooth Ivory Transition) */}
      <header className="sticky top-0 z-50 w-full max-w-[430px] mx-auto pt-safe bg-gradient-to-b from-[#3B0764] to-[#4C1D95] text-white shadow-[0_8px_24px_-8px_rgba(30,22,51,0.35)] transition-colors overflow-x-clip">
        <div
          dir="ltr"
          className="w-full px-3.5 py-2.5 min-h-[54px] flex items-center justify-between gap-2 min-w-0"
        >
          {/* Left: Clean Brand Emblem + Wordmark */}
          <button
            type="button"
            onClick={() => {
              setNotifOpen(false);
              onNavigateSection('home');
            }}
            className="flex items-center gap-2 cursor-pointer shrink-0 group text-left"
            aria-label="BASIT | باسط"
          >
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-sm overflow-hidden shrink-0">
              <BasitBrandMark size="xs" isRtl={isRtl} className="w-full h-full border-0 shadow-none" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black text-[#F5C451] tracking-wide whitespace-nowrap">
                BASIT
              </span>
              <span className="text-[10px] font-bold text-white/90 whitespace-nowrap">
                باسط
              </span>
            </div>
          </button>

          {/* Center: Clean Market / Account Chip */}
          <button
            type="button"
            onClick={() => {
              if (onOpenAuthGate && isGuestMode) onOpenAuthGate();
              else onNavigateSection('login');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 hover:bg-white/18 border border-white/15 text-[11px] font-bold text-white cursor-pointer max-w-[165px] truncate transition-colors"
            title={loggedInEmail || (isRtl ? 'الحساب' : 'Account')}
          >
            <OfficialCountryFlag country={selectedCountryObj.code} className="w-4 h-3 rounded-[2px] shrink-0" />
            <span className="truncate">
              {isAuthenticated
                ? isAdminUser
                  ? isRtl ? 'الإدارة' : 'Admin'
                  : (loggedInEmail?.split('@')[0] || (isRtl ? 'حسابي' : 'Account'))
                : isRtl ? 'زائر · تسجيل' : 'Visitor · Sign In'}
            </span>
          </button>

          {/* Right: Search + Menu Trigger */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNotifOpen(false);
                setSearchModalOpen(true);
              }}
              aria-label={isRtl ? 'بحث' : 'Search'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/90 hover:text-[#F5C451] cursor-pointer transition-colors"
            >
              <Search className="w-5 h-5" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={() => {
                setNotifOpen(false);
                setDrawerOpen(true);
              }}
              aria-label={isRtl ? 'فتح القائمة الرئيسية' : 'Open navigation menu'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-[#F5C451] cursor-pointer transition-colors"
            >
              <Menu className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Notifications Popover Container */}
        <div ref={notifContainerRef} className="relative">
          {notifOpen && (
            <div className="fixed inset-x-0 max-w-[430px] mx-auto px-3 top-20 z-50">
              <div className="w-full max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 p-4 space-y-2.5 shadow-2xl text-[#1E1633] dark:text-[#FAF8F5]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#4C1D95]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#3B0764]">
                      {t.notificationsTitle}
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#FFD54F] text-[#3B0764] text-[9px] font-black">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(sortedFirestoreNotifications.length > 0 || visibleFallbackNotifications.length > 0) && (
                      <button
                        type="button"
                        onClick={handleClearAllNotifications}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#4C1D95] hover:bg-[#EDE9FE] flex items-center gap-1 cursor-pointer transition-colors"
                        title={isRtl ? 'مسح جميع الإشعارات' : 'Clear all notifications'}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isRtl ? 'مسح الكل' : 'Clear all'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="p-1 rounded-lg text-[#4C1D95] hover:bg-[#EDE9FE] cursor-pointer"
                      aria-label={isRtl ? 'إغلاق الإشعارات' : 'Close notifications'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#581C87]">{t.notificationsScopedBy}</p>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {isAuthenticated ? (
                    sortedFirestoreNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#581C87]">{t.noNotifications}</div>
                    ) : (
                      sortedFirestoreNotifications.map((n) => (
                        <div
                          key={n.notifId}
                          className="p-2.5 rounded-xl border border-[#4C1D95]/15 bg-[#FAF8F5] dark:bg-[#241B38] text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (n.status === 'new' && onMarkNotificationStatus) {
                                  onMarkNotificationStatus(n.notifId, 'read');
                                }
                                onNavigateSection(n.targetSection || 'home');
                                setNotifOpen(false);
                              }}
                              className="text-start font-extrabold text-[#3B0764] hover:text-[#4C1D95] cursor-pointer flex-1 min-w-0 break-words"
                            >
                              {isRtl ? n.titleAr : n.titleEn}
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-[#FFD54F] text-[#3B0764] text-[10px] font-black shrink-0">
                                {getStatusLabel(n.status)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDismissNotification(n.notifId, e)}
                                className="p-1 text-[#581C87] hover:text-[#3B0764] rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#581C87] leading-snug break-words">
                            {isRtl ? n.bodyAr : n.bodyEn}
                          </p>
                          {onMarkNotificationStatus && n.status !== 'processed' && (
                            <div className="flex items-center gap-2 pt-1">
                              {n.status === 'new' && (
                                <button
                                  type="button"
                                  onClick={() => onMarkNotificationStatus(n.notifId, 'read')}
                                  className="text-[10px] font-bold text-[#4C1D95] flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <CheckCheck className="w-3 h-3" />
                                  <span>{isRtl ? 'تحديد كمقروء' : 'Mark Read'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onMarkNotificationStatus(n.notifId, 'processed')}
                                className="text-[10px] font-bold text-[#3B0764] flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isRtl ? 'تمت المعالجة' : 'Processed'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )
                  ) : visibleFallbackNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#581C87]">{t.noNotifications}</div>
                  ) : (
                    visibleFallbackNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/15 text-xs space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (n.id === 'n_cart_reminder') onOpenCart?.();
                              else if (n.id.startsWith('n_rfq_')) onNavigateSection('orders');
                              else onNavigateSection('home');
                              setNotifOpen(false);
                            }}
                            className="text-start font-bold text-[#3B0764] cursor-pointer flex-1 min-w-0 break-words"
                          >
                            {isRtl ? n.titleAr : n.titleEn}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDismissNotification(n.id, e)}
                            className="p-1 text-[#581C87] rounded cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-[#581C87]">{n.timeLabel}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-[#4C1D95]/15 text-[10px] text-[#581C87] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#4C1D95] shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? 'التنبيهات الداخلية عبر Firestore مفعّلة لحظياً داخل المنظومة.'
                      : 'In-app Firestore alerts are active in real time across the platform.'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <MobileCoverWaves />
      </header>

      {/* Main Navigation Drawer (Calm Ivory Canvas + Royal Purple Header) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 max-w-[430px] w-full mx-auto z-50 bg-[#FAF8F5] dark:bg-[#120D1D] text-[#1E1633] dark:text-[#FAF8F5] overflow-y-auto overflow-x-hidden pt-safe"
          role="dialog"
          aria-modal="true"
          aria-label={isRtl ? 'القائمة الرئيسية — باسط' : 'BASIT Main Menu'}
        >
          <div className="bg-gradient-to-b from-[#3B0764] to-[#4C1D95] text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-0.5 rounded-xl bg-white shadow-sm shrink-0">
                <BasitBrandMark size="xs" isRtl={isRtl} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white truncate">
                  {isRtl ? 'القائمة الرئيسية — باسط' : 'BASIT Menu'}
                </h2>
                <p className="text-[11px] font-semibold text-white/80 truncate">
                  {isRtl ? 'الضيافة، التموين، ومزايا العائلة' : 'Hospitality, Catering & Family Perks'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
              className="min-h-[44px] min-w-[44px] text-white hover:text-[#F5C451] flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full px-3.5 py-4 space-y-4 pb-16 min-w-0">
            {/* Quick Settings Card: Search · Language · Country */}
            <div className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="flex-1 min-h-[44px] px-3 rounded-xl bg-[#4C1D95] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#F5C451]" />
                  <span>{isRtl ? 'بحث شامل' : 'Search'}</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleLang}
                  className="min-h-[44px] px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#231938] border border-[#4C1D95]/15 text-[#3B0764] dark:text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Languages className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451]" />
                  <span>{isRtl ? 'English' : 'العربية'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {SUPPORTED_COUNTRIES.slice(0, 4).map((c) => {
                  const active = c.code === country;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => onSelectCountry(c.code)}
                      className={`min-h-[40px] px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between gap-1.5 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#4C1D95] text-white shadow-xs'
                          : 'bg-[#FAF8F5] dark:bg-[#231938] text-[#1E1633] dark:text-[#FAF8F5] border border-[#4C1D95]/12'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <OfficialCountryFlag country={c.code} className="w-4 h-3 rounded-[2px] shrink-0" />
                        <span className="truncate">{isRtl ? c.nameAr : c.nameEn}</span>
                      </span>
                      <span className="font-mono text-[9px] opacity-80 shrink-0">{c.currencyEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dedicated Basit Card Featured Highlight (Royal Purple + Luminous Gold Accent) */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#3B0764] to-[#4C1D95] p-4 shadow-md text-white space-y-3">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD54F] text-[#3B0764] text-xs font-black">
                    <CreditCard className="w-4 h-4" />
                    <span>{isRtl ? 'بطاقة باسط المعتمدة' : 'BASIT Official Card'}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {isRtl
                      ? 'خصم 10% للعاملين المتعاقدين مع باسط'
                      : '10% discount for employees contracted with Basit'}
                  </h3>
                  <p className="text-xs font-semibold text-[#EDE9FE] leading-relaxed">
                    {isRtl
                      ? 'تُستخدم بطاقة باسط في جميع مطاعم مول العين، حصاد النيل الأخضر، والمطابخ المركزية المتعاقدة مع المصانع والشركات.'
                      : 'Valid across Al Ain Mall dining, Green Nile Harvest 3D store, and contracted central kitchens.'}
                  </p>
                </div>

                <div className="w-full rounded-2xl bg-[#3B0764]/80 backdrop-blur-md border border-[#FFD54F]/60 p-3.5 space-y-3">
                  {/* Real 3D BASET Family Benefits Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onNavigateSection('baset_card');
                    }}
                    className="relative w-full rounded-2xl p-2 bg-gradient-to-b from-white/12 to-[#2A1459]/75 border border-[#FFD54F]/50 shadow-[0_12px_28px_rgba(0,0,0,0.45)] flex items-center justify-center overflow-hidden cursor-pointer group active:scale-98 transition-all"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-8 bottom-1 h-8 rounded-full bg-[#FFD54F]/30 blur-xl"
                    />
                    <img
                      src={BASET_FAMILY_CARD_ASSET}
                      alt={isRtl ? 'بطاقة باسط الرسمية المعتمدة' : 'Official BASIT Card'}
                      className="relative z-10 w-full max-h-[175px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform"
                    />
                  </button>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigateSection('baset_card');
                      }}
                      className="w-full min-h-[40px] rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#FACC15] hover:brightness-105 text-[#3B0764] text-xs font-black cursor-pointer shadow-sm transition-transform active:scale-95"
                    >
                      {isRtl ? 'كارت باسط العائلي والتفعيل الرسمي' : 'BASET Family Card & Activation'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          onNavigateSection('baset_food_benefits');
                        }}
                        className="min-h-[38px] px-2 rounded-xl bg-white/15 hover:bg-white/25 border border-[#FFD54F]/45 text-white text-[11px] font-black cursor-pointer truncate"
                      >
                        {isRtl ? 'وجبات باسط (4 عروض)' : 'Food Offers (4)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          onNavigateSection('baset_family_entertainment');
                        }}
                        className="min-h-[38px] px-2 rounded-xl bg-white/15 hover:bg-white/25 border border-[#C084FC]/45 text-white text-[11px] font-black cursor-pointer truncate"
                      >
                        {isRtl ? 'بسطناها على عيلتك (8)' : 'Family Fun (8)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Corporate & Hospitality Services (Unified Lucide Icons on Ivory Cards) */}
            <section className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451]" />
                <h3 className="text-xs font-black text-[#3B0764] dark:text-white">
                  {isRtl ? 'قطاع خدمات الأعمال والمناسبات B2B' : 'B2B Catering & Events'}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'b2b_factory',
                    icon: Factory,
                    labelAr: 'توريد وجبات المصانع والورديات',
                    labelEn: 'Factory Meal Supply',
                    action: () => window.dispatchEvent(new CustomEvent('basit:open-catering-modal', { detail: 'quote_tasting' })),
                  },
                  {
                    id: 'b2b_event',
                    icon: PartyPopper,
                    labelAr: 'تجهيز الحفلات والمؤتمرات والأفراح',
                    labelEn: 'Events, Conferences & Weddings',
                    action: () => window.dispatchEvent(new CustomEvent('basit:open-catering-modal', { detail: 'events_conference_quote' })),
                  },
                  {
                    id: 'b2b_venue',
                    icon: UtensilsCrossed,
                    labelAr: 'تجهيز المواقع والقاعات والضيافة',
                    labelEn: 'Venue & Site Supply',
                    action: () => window.dispatchEvent(new CustomEvent('basit:open-catering-modal', { detail: 'client_supply_order' })),
                  },
                  {
                    id: 'b2b_track',
                    icon: Truck,
                    labelAr: 'تتبع توريد الوجبات والشحنات',
                    labelEn: 'B2B Meal Tracking',
                    action: () => onNavigateSection('b2b_tracking'),
                  },
                ].map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        srv.action();
                      }}
                      className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#231938] hover:bg-[#EDE9FE]/60 border border-[#4C1D95]/10 text-[#1E1633] dark:text-white text-xs font-bold text-start flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Icon className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                      <span className="truncate">{isRtl ? srv.labelAr : srv.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Quick Navigation & Account Utilities */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onNavigateSection('fresh_world');
                }}
                className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Leaf className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                <span className="truncate">{isRtl ? 'حصاد النيل الأخضر' : 'Green Nile'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onNavigateSection('al_ain_restaurants');
                }}
                className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <UtensilsCrossed className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                <span className="truncate">{isRtl ? 'عالم العين' : 'Al Ain Mall'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenCart();
                }}
                className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ShoppingCart className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                <span className="truncate">{isRtl ? `السلة (${cartCount})` : `Cart (${cartCount})`}</span>
              </button>

              {onOpenFavorites && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenFavorites();
                  }}
                  className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Heart className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                  <span className="truncate">{isRtl ? `المفضلة (${favoritesCount})` : `Favorites (${favoritesCount})`}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setNotifOpen(true);
                }}
                className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Bell className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                <span className="truncate">{isRtl ? `التنبيهات (${unreadCount})` : `Alerts (${unreadCount})`}</span>
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#F5C451] shrink-0" /> : <Moon className="w-4 h-4 text-[#4C1D95] shrink-0" />}
                <span className="truncate">{isDark ? (isRtl ? 'الوضع النهاري' : 'Light Mode') : (isRtl ? 'الوضع الليلي' : 'Dark Mode')}</span>
              </button>

              {!isGuestMode && isAuthenticated && onOpenOperationalTasks && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenOperationalTasks();
                  }}
                  className="col-span-2 min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ClipboardList className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                  <span className="truncate">{isRtl ? 'مهام التشغيل والمتابعة' : 'Operational Tasks'}</span>
                </button>
              )}

              {/* Owner & Admin Portals strictly visible ONLY to verified Owners/Admins */}
              {isStrictAppOwner && !isGuestMode && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onNavigateSection('owner_finance');
                  }}
                  className="col-span-2 min-h-[48px] px-3.5 rounded-xl bg-[#3B0764] text-[#F5C451] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {isRtl ? 'المنصة المالية الخاصة بالمالك' : 'Owner Financial Vault'}
                  </span>
                </button>
              )}

              {(isAdminUser || isStrictAppOwner) && !isGuestMode && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onNavigateSection('finance_manager_portal');
                  }}
                  className="col-span-2 min-h-[46px] px-3.5 rounded-xl bg-[#4C1D95] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-[#F5C451] shrink-0" />
                  <span className="truncate">
                    {isRtl ? 'بوابة الإدارة والمالية' : 'Management & Finance Portal'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  if (onOpenAuthGate && isGuestMode) onOpenAuthGate();
                  else onNavigateSection('login');
                }}
                className="min-h-[46px] px-3 rounded-xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 text-[#1E1633] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer min-w-0"
              >
                <UserIcon className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                <span className="truncate">{loggedInEmail || (isRtl ? 'الحساب والتسجيل' : 'Account')}</span>
              </button>

              {isAuthenticated && onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onSignOut();
                  }}
                  className="min-h-[46px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="truncate">{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              )}
              <div className="col-span-2 flex justify-center pt-1">
                <PWAInstallButton isRtl={isRtl} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Scope Search Modal (Constrained cleanly inside 430px) */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 max-w-[430px] w-full mx-auto z-50 bg-[#3B0764]/65 backdrop-blur-md flex items-start justify-center p-3"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full basit-liquid-glass rounded-3xl overflow-hidden mt-6 text-[#3B0764]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#4C1D95]/15 flex items-center gap-3 bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-white">
              <Search className="w-5 h-5 text-[#FFD54F] shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 text-sm text-white placeholder-[#D8B4FE] focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-2 text-white hover:text-[#FFD54F] cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#231938] border-b border-[#4C1D95]/10 flex flex-wrap items-center gap-1.5">
              {scopeOptions.map((opt) => {
                const active = searchScope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSearchScope(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#4C1D95] text-white shadow-xs'
                        : 'bg-white dark:bg-[#1B132B] text-[#3B0764] dark:text-[#FAF8F5] border border-[#4C1D95]/15 hover:border-[#4C1D95]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-[#4C1D95]/10 p-2 bg-white dark:bg-[#1B132B]">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#5B5270] dark:text-[#C4B5FD]">
                  {isRtl ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching results found'}
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigateSection(item.section, item.kitchenId);
                      setSearchModalOpen(false);
                    }}
                    className="w-full p-3 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#231938] text-start flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] dark:bg-[#231938] text-[#4C1D95] dark:text-[#F5C451] flex items-center justify-center shrink-0">
                        {item.scope === 'products' && <Leaf className="w-4 h-4" />}
                        {item.scope === 'catering' && <PartyPopper className="w-4 h-4" />}
                        {item.scope === 'companies' && <Factory className="w-4 h-4" />}
                        {item.scope === 'kitchens' && <ChefHat className="w-4 h-4" />}
                        {item.scope === 'places' && <MapPin className="w-4 h-4" />}
                        {item.scope === 'offers' && <Tag className="w-4 h-4" />}
                        {item.scope === 'invoices' && <FileText className="w-4 h-4" />}
                        {item.scope === 'gift_cards' && <Gift className="w-4 h-4" />}
                        {item.scope === 'meals' && <UtensilsCrossed className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#1E1633] dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#5B5270] dark:text-[#C4B5FD] truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#4C1D95] dark:text-[#F5C451] shrink-0">
                      {t.scopes[item.scope]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
