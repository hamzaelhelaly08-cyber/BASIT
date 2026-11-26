import React from 'react';
import { BasitBrandMark } from './BasitBrandMark';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showGlow?: boolean;
  altText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const mappedSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' =
    size === 'hero' ? 'xl' : size;

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <BasitBrandMark size={mappedSize} isRtl={true} />
    </div>
  );
};
