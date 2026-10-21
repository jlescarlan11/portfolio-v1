import React from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { FaAmazon } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import { FiArrowRight, FiFileText } from 'react-icons/fi';
import type { AboutContent } from './content';

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

function date(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}-01T00:00:00Z`));
}

export function ExperienceHistory({ content, full = false }: { content: AboutContent; full?: boolean }): React.JSX.Element {
  const entries = [
    ...content.experience.map(item => ({
      id: item.id, title: item.title, organization: item.company.split(' — ')[0],
      startDate: item.startDate, endDate: item.endDate, isCurrent: item.isCurrent,
      details: item.responsibilities,
    })),
    ...content.education.map(item => ({
      id: item.id, title: item.degree, organization: item.school,
      startDate: item.startDate, endDate: item.endDate, isCurrent: item.isCurrent,
      details: item.achievements ?? [],
    })),
  ].sort((a, b) => b.startDate.localeCompare(a.startDate));
  return <div>{entries.slice(0, full ? undefined : 3).map(item => <article key={item.id} className="experience-row">
    <p className="text-muted-foreground">{date(item.startDate)} – {item.isCurrent ? 'Present' : date(item.endDate!)}</p>
    <h3 className="font-normal">{item.title}</h3>
    <p className="text-muted-foreground experience-company">{item.organization}</p>
    {full && <ul className="experience-details list-disc space-y-3 pl-5 text-muted-foreground">{item.details.map(text => <li key={text}>{text}</li>)}</ul>}
  </article>)}</div>;
}

export function FullStack({ content }: { content: AboutContent }): React.JSX.Element {
  return <div className="space-y-10">{content.techCategories.map(category => <section key={category.category}>
    <h2 className="mb-4 font-medium">{category.category}</h2>
    <ul className="flex flex-wrap gap-2">{category.items.map(item => <li className="stack-chip" key={item.label}>{item.label}</li>)}</ul>
  </section>)}</div>;
}

export function CertificateCards({ content }: { content: AboutContent }): React.JSX.Element {
  return <div className="certificate-grid">{content.certifications.map(item => <article className="certificate-card" key={item.name}>
    <IssuerLogo issuer={item.issuer} /><h3 className="font-medium">{item.name.replace(' April 2026', '')}</h3>
    <p className="text-muted-foreground">{item.issuer}</p>
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-link certificate-action">{item.url?.startsWith('/') ? 'View certificate' : 'Verify'}<FiArrowRight aria-hidden="true" /></a>
  </article>)}</div>;
}

export default function ExperienceSection({ content }: { content: AboutContent }): React.JSX.Element {
  const order = ['exp-pharmacy-acute-care-software-engineer', 'exp-freelance-software-engineer', 'exp-wg-monitoring-engineer', 'exp-asi-software-engineer-intern', 'exp-bayoa-full-stack-intern'];
  const entries = order.flatMap(id => content.experience.filter(item => item.id === id));
  return <section id="experience" className="portfolio-container portfolio-section" aria-labelledby="experience-heading">
    <div className="section-heading"><h2 id="experience-heading" className="h2">Where I’ve grown</h2><Link className="portfolio-link" href="/experience">Full history<FiArrowRight aria-hidden="true" /></Link></div>
    <div>{entries.map(item => <article key={item.id} className="experience-row">
      <p className="text-muted-foreground"><time dateTime={item.startDate}>{date(item.startDate)}</time> – {item.isCurrent ? 'Present' : <time dateTime={item.endDate!}>{date(item.endDate!)}</time>}</p>
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
