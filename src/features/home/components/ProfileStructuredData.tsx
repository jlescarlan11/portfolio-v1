import {
  createProfilePageSchema,
  serializeJsonLd
} from '@/features/home/profile-schema';

export default function ProfileStructuredData(): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(createProfilePageSchema())
      }}
    />
  );
}
