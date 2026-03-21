import Image from 'next/image';
import { Typography } from '@/shared/components/Typography';
import { SURFACE } from '@/shared/styles/shared';

interface DeviceViewProps {
  label: string;
  imageSrc: string;
  alt: string;
  aspectRatio: 'desktop' | 'tablet' | 'mobile';
}

const ASPECT_RATIOS = {
  desktop: 'aspect-[16/9]',
  tablet: 'aspect-[4/3]',
  mobile: 'aspect-[9/16] max-w-sm'
} as const;

export function DeviceView({
  label,
  imageSrc,
  alt,
  aspectRatio
}: DeviceViewProps): React.JSX.Element {
  return (
    <div>
      <Typography variant="label" className="mb-4 block">
        {label}
      </Typography>
      <div className={`${ASPECT_RATIOS[aspectRatio]} overflow-hidden border ${SURFACE.hairline} bg-surface-muted`}>
        <div className="relative h-full w-full">
          <Image src={imageSrc} alt={alt} fill className="object-cover grayscale" />
        </div>
      </div>
    </div>
  );
}
