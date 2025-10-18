'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { animate } from 'motion';

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
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (imageRef.current) {
      animate(
        imageRef.current,
        { transform: ['scale(1) rotate(0deg)', 'scale(1.05) rotate(2deg)'] },
        { duration: 0.3 }
      );
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      animate(
        imageRef.current,
        { transform: ['scale(1.05) rotate(2deg)', 'scale(1) rotate(0deg)'] },
        { duration: 0.3 }
      );
    }
  };

  return (
    <div className={`profile-image-container ${className}`}>
      <div 
        ref={imageRef}
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
