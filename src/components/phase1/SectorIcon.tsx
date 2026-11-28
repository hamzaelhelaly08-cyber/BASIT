import React from 'react';
import {
  ShoppingBag,
  Briefcase,
  CreditCard,
  HeartPulse,
  Factory,
  Landmark,
} from 'lucide-react';
import type { SectorIconName } from '../../data/phase1Sectors';

interface SectorIconProps {
  name: SectorIconName;
  className?: string;
}

export const SectorIcon: React.FC<SectorIconProps> = ({
  name,
  className = 'w-5 h-5',
}) => {
  const props = { className, strokeWidth: 1.85 };

  switch (name) {
    case 'shopping-bag':
      return <ShoppingBag {...props} />;
    case 'briefcase':
      return <Briefcase {...props} />;
    case 'credit-card':
      return <CreditCard {...props} />;
    case 'heart-pulse':
      return <HeartPulse {...props} />;
    case 'factory':
      return <Factory {...props} />;
    case 'landmark':
      return <Landmark {...props} />;
  }
};
