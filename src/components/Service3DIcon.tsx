import React from 'react';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  ChefHat,
  Clapperboard,
  ClipboardList,
  Clock,
  Coffee,
  Factory,
  FileText,
  Flame,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Home,
  Hospital,
  MapPin,
  MessageCircleWarning,
  Music,
  PartyPopper,
  Pizza,
  Presentation,
  Scale,
  Scissors,
  ShieldCheck,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Store,
  Tags,
  TrendingUp,
  Truck,
  UserRound,
  Utensils,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { useOwnerCms } from '../context/OwnerCmsContext';

interface Service3DIconProps {
  iconKey: string;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  chef: ChefHat,
  kitchens: ChefHat,
  utensils: Utensils,
  meals: Utensils,
  factory: Factory,
  schools: GraduationCap,
  education: GraduationCap,
  hospital: Hospital,
  conference: Presentation,
  banquet: Presentation,
  party: PartyPopper,
  occasions: PartyPopper,
  christmas_corporate: PartyPopper,
  gift: PartyPopper,
  orders: ClipboardList,
  truck: Truck,
  delivery: Truck,
  driver: Truck,
  courier: Truck,
  warehouse: Warehouse,
  products: Warehouse,
  inventory: Warehouse,
  layers: Warehouse,
  coupon: Tags,
  offers: Tags,
  support: MessageCircleWarning,
  complaints: MessageCircleWarning,
  star: Star,
  portfolio: Star,
  register: UserRound,
  customer: UserRound,
  user: UserRound,
  business: Briefcase,
  merchant: Store,
  market: Store,
  store: Store,
  shopping: Store,
  sushi: Utensils,
  shield: ShieldCheck,
  admin: ShieldCheck,
  receipt: FileText,
  finance: FileText,
  wallet: Wallet,
  notifications: Bell,
  calendar: CalendarDays,
  cinema: Clapperboard,
  aqua_park: Sparkles,
  circus: Sparkles,
  kids: Smile,
  spa: Sparkles,
  barber: Scissors,
  salt: Home,
  charity: HeartHandshake,
  heart: HeartHandshake,
  scale: Scale,
  oud: Music,
  coffee: Coffee,
  pizza: Pizza,
  grills: Flame,
  grill: Flame,
  globe: Globe2,
  compass: Globe2,
  dates_harvest: Sprout,
  sahar_meals: Clock,
  usufruct: TrendingUp,
  opportunity: TrendingUp,
  file: TrendingUp,
  analytics: TrendingUp,
  reports: TrendingUp,
  rally: MapPin,
  building: Building2,
};

/**
 * Unified BASIT | باسط Icon System (Instruction Set #3):
 * - Consistent Lucide Icons (uniform strokeWidth 1.85, zero emojis, zero random colors).
 * - Mobile-first clear 30–40px sizing (md = w-8 h-8 / 32px, lg = w-10 h-10 / 40px, sm = w-7 h-7 / 28px).
 * - Royal Purple (#62339A) primary geometry with clean Signature Yellow (#FFC928) accent detail.
 * - Clean open spacing without redundant double square frames.
 */
export const Service3DIcon: React.FC<Service3DIconProps> = ({
  iconKey: rawIconKey,
  size = 'md',
  highlighted = false,
}) => {
  const cms = useOwnerCms();
  const iconKey = cms.resolveIconKey(rawIconKey);
  const IconComponent = ICON_MAP[iconKey] || Briefcase;

  const iconSizeClass =
    size === 'lg'
      ? 'w-9 h-9 sm:w-10 sm:h-10'
      : size === 'sm'
        ? 'w-7 h-7'
        : 'w-8 h-8 sm:w-9 sm:h-9';

  const containerSizeClass =
    size === 'lg'
      ? 'w-12 h-12 sm:w-13 sm:h-13'
      : size === 'sm'
        ? 'w-9 h-9'
        : 'w-11 h-11';

  return (
    <div
      className={`relative ${containerSizeClass} rounded-2xl flex items-center justify-center shrink-0 select-none ${
        highlighted
          ? 'bg-[#F6D95B]/35 dark:bg-[#FFC928]/15'
          : 'bg-[#F2ECF9] dark:bg-[#2A1E40]'
      } transition-transform duration-200 group-hover:scale-105`}
    >
      <IconComponent
        className={`${iconSizeClass} text-[#62339A] dark:text-[#A34FE8]`}
        strokeWidth={1.85}
      />
      <span
        aria-hidden="true"
        className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-[#FFC928] ring-2 ring-white dark:ring-[#1F172F]"
      />
    </div>
  );
};
