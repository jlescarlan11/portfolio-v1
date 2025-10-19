'use client';

import Image from 'next/image';
import { useHoverAnimation } from '../hooks/useHoverAnimation';
import { ANIMATION_CONFIG } from '../styles/shared';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProfileImage({ 
  src, 
  alt, 
  className = '' 
}: ProfileImageProps) {
  // Use shared hover animation hook (DRY principle)
  const { ref, handleMouseEnter, handleMouseLeave } = useHoverAnimation<HTMLDivElement>({
    scale: [1, 1.05],
    rotate: [0, 2],
    duration: ANIMATION_CONFIG.durations.medium,
  });

  return (
    <div className={`profile-image-container ${className}`}>
      <div 
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px]"
      >
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="rounded-full object-cover w-full h-full"
          priority
        />
      </div>
    </div>
  );
}
