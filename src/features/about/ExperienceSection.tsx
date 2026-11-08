import React from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { FaAmazon } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import { FiArrowRight, FiFileText } from 'react-icons/fi';
import { NewTabNotice } from '@/shared/components/NewTabNotice';
import { formatMonthYear, isRenderableExternalUrl, isRenderableInternalPath } from '@/shared/lib/project';
import { stackExamples, type AboutContent } from './content';

function IssuerLogo({ issuer }: { issuer?: string }): React.JSX.Element {
  return (
    <span className="certificate-issuer-logo" aria-hidden="true">
      {issuer?.startsWith('Matsuo') ? (
        <Image src="/issuers/matsuo-iwasawa.jpg" alt="" width={48} height={48} />
      ) : issuer === 'Amazon' ? (
        <FaAmazon size={28} />
      ) : issuer === 'Google' ? (
        <SiGoogle size={28} />
      ) : (
        <FiFileText size={28} />
      )}
    </span>
  );
}

interface HistoryRowProps {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  expectedGraduationDate?: string;
  details: string[];
}

function HistoryRow({
  title,
  organization,
  startDate,
  endDate,
  isCurrent,
  expectedGraduationDate,
  details
}: HistoryRowProps): React.JSX.Element {
  return (
    <article className="experience-row">
      <div className="text-muted-foreground">
        <p>
          <time dateTime={startDate}>{formatMonthYear(startDate)}</time>
          {isCurrent ? ' – Present' : endDate && (
            <> – <time dateTime={endDate}>{formatMonthYear(endDate)}</time></>
          )}
        </p>
        {expectedGraduationDate && (
          <p className="mt-1">
            Expected graduation <time dateTime={expectedGraduationDate}>{formatMonthYear(expectedGraduationDate)}</time>
          </p>
        )}
      </div>
      <h3 className="h3">{title}</h3>
      <p className="text-muted-foreground experience-company">{organization}</p>
      {details.length > 0 && (
        <ul className="experience-details list-disc space-y-3 pl-5 text-muted-foreground">
          {details.map(text => <li key={text}>{text}</li>)}
        </ul>
      )}
    </article>
  );
}

export function ExperienceHistory({ content }: { content: AboutContent }): React.JSX.Element {
  const work = [...content.experience].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const education = [...content.education].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-12">
      <section aria-labelledby="work-history-heading">
        <h2 id="work-history-heading" className="h2 mb-5">Work experience</h2>
        {work.map(({ id, title, company, startDate, endDate, isCurrent, responsibilities }) => (
          <HistoryRow
            key={id}
            title={title}
            organization={id === 'exp-freelance-software-engineer' ? `Client work through ${company}` : company}
            startDate={startDate}
            endDate={endDate}
            isCurrent={isCurrent}
            details={responsibilities}
          />
        ))}
      </section>
      <section aria-labelledby="education-history-heading">
        <h2 id="education-history-heading" className="h2 mb-5">{content.educationHeading}</h2>
        {education.map(({ id, degree, school, startDate, endDate, isCurrent, expectedGraduationDate, achievements }) => (
          <HistoryRow
            key={id}
            title={degree}
            organization={school}
            startDate={startDate}
            endDate={endDate}
            isCurrent={isCurrent}
            expectedGraduationDate={expectedGraduationDate}
            details={achievements ?? []}
          />
        ))}
      </section>
    </div>
  );
}

export function FullStack({ content }: { content: AboutContent }): React.JSX.Element {
  const [core, ...otherCategories] = content.techCategories;

  return (
    <div className="space-y-10">
      {core && (
        <section aria-labelledby="core-stack-heading">
          <h2 id="core-stack-heading" className="h2 mb-4">{core.category}</h2>
          <ul className="flex flex-wrap gap-2">
            {core.items.map(item => <li className="stack-chip" key={item.label}>{item.label}</li>)}
          </ul>
        </section>
      )}
      <section aria-labelledby="stack-projects-heading">
        <h2 id="stack-projects-heading" className="h2 mb-5">How I use these tools</h2>
        <ul className="space-y-5">
          {stackExamples.map(({ slug, title, description }) => (
            <li key={slug} className="space-y-1">
              <h3 className="h3">
                <Link href={`/projects/${slug}`} className="portfolio-link">
                  {title}<FiArrowRight aria-hidden="true" />
                </Link>
              </h3>
              <p className="text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="other-tools-heading">
        <h2 id="other-tools-heading" className="h2 mb-5">Other tools I use</h2>
        <div className="space-y-5">
          {otherCategories.map(({ category, items }) => (
            <div key={category}>
              <h3 className="h3 mb-3">{category}</h3>
              <ul className="flex flex-wrap gap-2">
                {items.map(item => <li className="stack-chip" key={item.label}>{item.label}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const certificateDateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});

export function CertificateCards({ content }: { content: AboutContent }): React.JSX.Element {
  return (
    <div className="certificate-grid">
      {content.certifications.map(({ name, issuer, description, issuedOn, year, url }) => {
        const isCertificatePdf = isRenderableInternalPath(url);

        return (
          <article className="certificate-card" key={name}>
            <IssuerLogo issuer={issuer} />
            <h2 className="h3">{name}</h2>
            <p className="text-muted-foreground">{issuer}</p>
            {description && <p className="text-muted-foreground">{description}</p>}
            {issuedOn ? (
              <p className="text-muted-foreground">
                Issued <time dateTime={issuedOn}>{certificateDateFormat.format(new Date(issuedOn))}</time>
              </p>
            ) : year && <time dateTime={year} className="text-muted-foreground">{year}</time>}
            {(isCertificatePdf || isRenderableExternalUrl(url)) && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="portfolio-link certificate-action">
                {isCertificatePdf ? 'View certificate (PDF)' : 'Verify on Coursera'}
                <span className="sr-only"> for {name}</span>
                <NewTabNotice />
                <FiArrowRight aria-hidden="true" />
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function ExperienceSection({ content }: { content: AboutContent }): React.JSX.Element {
  const order = ['exp-pharmacy-acute-care-software-engineer', 'exp-freelance-software-engineer', 'exp-wg-monitoring-engineer', 'exp-asi-software-engineer-intern', 'exp-bayoa-full-stack-intern'];
  const entries = order.flatMap(id => content.experience.filter(item => item.id === id));
  return <section id="experience" className="portfolio-container portfolio-section" aria-labelledby="experience-heading">
    <div className="section-heading"><h2 id="experience-heading" className="h2">Experience</h2><Link className="portfolio-link" href="/experience">View full experience<FiArrowRight aria-hidden="true" /></Link></div>
    <div>{entries.map(item => <article key={item.id} className="experience-row">
      <p className="text-muted-foreground"><time dateTime={item.startDate}>{formatMonthYear(item.startDate)}</time> – {item.isCurrent ? 'Present' : <time dateTime={item.endDate!}>{formatMonthYear(item.endDate!)}</time>}</p>
      <h3 className="font-medium">{item.title}</h3>
      <p className="text-muted-foreground experience-company">{item.company.split(' — ')[0]}</p>
      <p className="experience-details text-muted-foreground">{item.summary}</p>
    </article>)}</div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <Link className="portfolio-link" href="/stack">Tools I use<FiArrowRight aria-hidden="true" /></Link>
      <span id="certifications"><Link className="portfolio-link" href="/certifications">Certifications<FiArrowRight aria-hidden="true" /></Link></span>
    </div>
  </section>;
}
