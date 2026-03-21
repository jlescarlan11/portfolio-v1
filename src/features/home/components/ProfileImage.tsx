'use client';

import Image from 'next/image';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProfileImage({
  src,
  alt,
  className = ''
}: ProfileImageProps): React.JSX.Element {
  return (
    <figure className={['flex justify-center', className].filter(Boolean).join(' ')}>
      <div className="h-full max-h-full w-full max-w-full shrink-0 cursor-default overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:scale-[1.02]">
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="block h-full w-full object-cover grayscale"
          priority
        />
      </div>
    </figure>
  );
}
