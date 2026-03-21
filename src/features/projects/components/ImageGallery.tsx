import Image from 'next/image';
import { Typography } from '@/shared/components/Typography';
import { LAYOUT_STYLES, SURFACE } from '@/shared/styles/shared';

interface ImageGalleryProps {
  title: string;
  images: string[];
  projectTitle: string;
}

export function ImageGallery({
  title,
  images,
  projectTitle
}: ImageGalleryProps): React.JSX.Element | null {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="gallery-section mb-16 md:mb-24">
      <Typography variant="h2" as="h2" className="mb-8">
        {title}
      </Typography>
      <div className={LAYOUT_STYLES.responsiveGrid}>
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className={`aspect-[4/3] overflow-hidden border ${SURFACE.hairline} bg-surface`}>
            <div className="relative h-full w-full">
              <Image
                src={image}
                alt={`${projectTitle} - Additional view ${index + 1}`}
                fill
                className="object-cover grayscale"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
