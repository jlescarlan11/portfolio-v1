import { HomePage, ProfileStructuredData } from '@/features/home';

export default function Home(): React.JSX.Element {
  return (
    <>
      <ProfileStructuredData />
      <HomePage />
    </>
  );
}
