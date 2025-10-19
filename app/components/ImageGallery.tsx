import Image from 'next/image';
import { LAYOUT_STYLES, ANIMATION_STYLES } from '../styles/shared';

interface ImageGalleryProps {
  title: string;
  images: string[];
  projectTitle: string;
}

export function ImageGallery({ title, images, projectTitle }: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className={`mb-16 md:mb-24 ${ANIMATION_STYLES.fadeIn}`} style={ANIMATION_STYLES.fadeInOpacity}>
      <h2 className="
        text-2xl md:text-3xl
        font-light
        tracking-tight
        text-white
        mb-8
      ">
        {title}
      </h2>
      <div className={LAYOUT_STYLES.responsiveGrid}>
        {images.map((image, index) => (
          <div
            key={index}
            className="
              aspect-[4/3]
              overflow-hidden
              bg-gray-900
              border border-gray-800
            "
          >
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={`${projectTitle} - Additional view ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

