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
    <p className="text-muted-foreground">{date(item.startDate)} – {item.isCurrent ? 'Present' : date(item.endDate!)}{item.id.includes('pharmacy') && <span className="block">Completed</span>}</p>
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
  const featuredStack = ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker'];
  return <section id="experience" className="portfolio-container portfolio-section" aria-labelledby="experience-heading">
    <div className="section-heading"><h2 id="experience-heading" className="h2">Experience</h2><Link className="portfolio-link" href="/experience">Full history<FiArrowRight aria-hidden="true" /></Link></div>
    <ExperienceHistory content={content} />
    <div className="mt-10">
      <div className="section-heading subsection-heading"><h3 className="text-muted-foreground uppercase">Stack</h3><Link className="portfolio-link" href="/stack">View all<FiArrowRight aria-hidden="true" /></Link></div>
      <ul className="flex flex-wrap gap-2">{featuredStack.map(item => <li className="stack-chip" key={item}>{item}</li>)}</ul>
    </div>
    <div className="mt-10" id="certifications">
      <div className="section-heading subsection-heading"><h3 className="text-muted-foreground uppercase">Certifications</h3><Link className="portfolio-link" href="/certifications">All certifications<FiArrowRight aria-hidden="true" /></Link></div>
      <CertificateCards content={content} />
    </div>
  </section>;
}
