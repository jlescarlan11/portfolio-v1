import Image from 'next/image';

interface DeviceViewProps {
  label: string;
  imageSrc: string;
  alt: string;
  aspectRatio: 'desktop' | 'tablet' | 'mobile';
}

const ASPECT_RATIOS = {
  desktop: 'aspect-[16/9]',
  tablet: 'aspect-[4/3]',
  mobile: 'aspect-[9/16] max-w-sm',
} as const;

export function DeviceView({ label, imageSrc, alt, aspectRatio }: DeviceViewProps) {
  return (
    <div>
      <div className="text-sm uppercase tracking-wider text-gray-500 mb-4">
        {label}
      </div>
      <div className={`
        ${ASPECT_RATIOS[aspectRatio]}
        overflow-hidden
        bg-gray-900
        border border-gray-800
      `}>
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

