'use client';

import { useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import { SURFACE } from '@/shared/styles/shared';

interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
}

interface CertificationsListProps {
  certifications: Certification[];
  initialVisibleCount: number;
}

export function CertificationsList({ 
  certifications, 
  initialVisibleCount 
}: CertificationsListProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedCerts = [...certifications].sort(
    (a, b) => parseInt(b.year ?? '0', 10) - parseInt(a.year ?? '0', 10)
  );

  const visibleCerts = showAll ? sortedCerts : sortedCerts.slice(0, initialVisibleCount);
  const hiddenCount = sortedCerts.length - initialVisibleCount;

  return (
    <>
      <ul className="divide-y divide-foreground/5">
        {visibleCerts.map((cert) => (
          <li
            key={cert.name}
            className="group flex items-start justify-between gap-6 py-5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <Typography
                variant="body"
                as="p"
                className="leading-snug transition-colors duration-200 group-hover:text-foreground"
              >
                {cert.url ? (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 decoration-foreground/20 transition-colors duration-200 hover:decoration-foreground"
                  >
                    {cert.name}
                  </a>
                ) : cert.name}
              </Typography>
              {cert.issuer && (
                <Typography variant="caption" as="p" className="mt-1 text-[11px] text-subtle-foreground">
                  {cert.issuer}
                </Typography>
              )}
            </div>
            {cert.year && (
              <span className={`mt-0.5 flex-shrink-0 border ${SURFACE.hairline} px-2 py-0.5`}>
                <Typography
                  variant="caption"
                  as="time"
                  dateTime={cert.year}
                  className="font-mono text-[10px] tabular-nums text-subtle-foreground"
                >
                  {cert.year}
                </Typography>
              </span>
            )}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-5 text-[12px] font-medium text-subtle-foreground underline underline-offset-4 decoration-foreground/20 transition-colors duration-200 hover:text-foreground hover:decoration-foreground"
        >
          {showAll ? 'Show less' : `Show ${hiddenCount} more`}
        </button>
      )}
    </>
  );
}
