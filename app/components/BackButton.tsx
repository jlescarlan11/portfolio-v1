'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <button
          onClick={() => router.back()}
          className="
            inline-flex items-center gap-2
            text-sm uppercase tracking-wider
            text-white
            transition-colors duration-300
            hover:text-gray-400
          "
        >
          <span>←</span>
          Back
        </button>
      </div>
    </div>
  );
}

