'use client';

import { LAYOUT_STYLES, TYPOGRAPHY_STYLES, SPACING, SURFACE, MOTION } from '../styles/shared';
import { useMemo, useState } from 'react';

interface PillProps {
	label: string;
}

const Pill = ({ label }: PillProps) => (
	<span
		className="inline-flex items-center border border-white/15 bg-transparent px-2.5 py-0.5 text-[11px] tracking-[0.25em] uppercase text-white/80"
	>
		{label}
	</span>
);

// Manifesto removed per design update

interface LabelCardProps {
	label: string;
	title: string;
	subtitle: string;
	badges?: string[];
}

const LabelCard = ({ label, title, subtitle, badges = [] }: LabelCardProps) => (
	<section className="relative">
		<div className={`relative border ${SURFACE.hairline} bg-black p-5 md:p-6`}>
			<div className="absolute inset-0 translate-x-[1.5px] translate-y-[1.5px] pointer-events-none border border-white/10" aria-hidden />
			<h3 className="mb-2 text-[11px] tracking-[0.3em] uppercase text-white/70">{label}</h3>
			<div className="text-white">{title}</div>
			<div className="text-white/70 text-sm md:text-base">{subtitle}</div>
			{badges.length > 0 ? (
				<div className="mt-2 flex flex-wrap gap-2">
					{badges.map((b) => (<Pill key={b} label={b} />))}
				</div>
			) : null}
		</div>
	</section>
);

interface TechItem {
	label: string; // short label like TS, React, etc.
	iconHref?: string;
	iconAlt?: string;
}

interface TimelineItem { title: string; subtitle: string; badges?: string[]; period?: string; watermark?: string }

interface AboutSectionProps {
	education: TimelineItem[];
	experience: TimelineItem[];
	tech: TechItem[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
    badge?: string; // optional icon URL or short label
    url?: string; // optional external link
  }>;
}

export default function AboutSection({ education, experience, tech, certifications = [] }: AboutSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const [yearFilter, setYearFilter] = useState<string | null>(null);

    const filteredCerts = useMemo(() => {
        const base = yearFilter ? certifications.filter((c) => (c.year || '') === yearFilter) : certifications;
        return base.sort((a, b) => {
			const ay = parseInt(a.year || '0', 10) || 0;
			const by = parseInt(b.year || '0', 10) || 0;
			return by - ay;
        });
    }, [certifications, yearFilter]);

	const VISIBLE_COUNT = 6;
	const visibleCerts = showAll ? filteredCerts : filteredCerts.slice(0, VISIBLE_COUNT);

	const years = useMemo(() => {
		const set = new Set<string>();
		certifications.forEach((c) => { if (c.year) set.add(c.year); });
		return Array.from(set).sort((a, b) => parseInt(b) - parseInt(a));
	}, [certifications]);

    return (
        <section
            id="about"
            className={`${LAYOUT_STYLES.section} border-t border-white/12`}
            style={{ scrollPaddingTop: '120px' }}
            aria-label="About section"
        >
            <div className={LAYOUT_STYLES.container}>
			{/* Header */}
			<div className="text-center mb-8 md:mb-12 pt-8 sm:pt-12">
                    <h2 className={TYPOGRAPHY_STYLES.sectionTitle}>About</h2>
                </div>

			{/* Content grid (single column) */}
			<div className="md:grid md:grid-cols-12 md:gap-10">
				<div className={`md:col-span-12 ${SPACING.asymmetry.body}`}>
						<div className="">
							{/* Toolbelt strip (horizontal) */}
							<section aria-label="Toolbelt" className="mb-8">
								<div className="no-scrollbar overflow-x-auto -mx-1 md:-mx-2">
									<div className="flex items-center gap-4 md:gap-5 px-1 md:px-2">
										{tech.map((t) => (
											<div key={t.label} className={`relative h-12 w-12 md:h-14 md:w-14 border ${SURFACE.hairline} bg-transparent ${MOTION.hover} shrink-0`} aria-label={t.label}>
												{t.iconHref ? (
													<>
                                                        <img src={t.iconHref} alt={t.iconAlt || t.label} loading="lazy" className="absolute inset-0 m-auto h-6 w-6 md:h-8 md:w-8 object-contain opacity-70 grayscale" />
														<span className="sr-only">{t.label}</span>
													</>
												) : (
													<span className="absolute inset-0 grid place-items-center text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/80">{t.label}</span>
												)}
											</div>
										))}
									</div>
								</div>
							</section>
                        {/* Credentials */}
                        {certifications.length > 0 && (
                            <section aria-label="Credentials">
                                <h3 className="mb-3 text-[11px] tracking-[0.3em] text-white/70 uppercase">Credentials</h3>
                                <div className="mb-4 flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setYearFilter(null)}
                                            className={`text-[11px] uppercase tracking-wider rounded-full border px-3 py-1 ${yearFilter === null ? 'border-white/20 text-white' : 'border-white/12 text-white/70'} ${MOTION.hover}`}
                                        >All</button>
                                        {years.map((y) => (
                                            <button key={y}
                                                type="button"
                                                onClick={() => setYearFilter(y)}
                                                className={`text-[11px] uppercase tracking-wider rounded-full border px-3 py-1 ${yearFilter === y ? 'border-white/20 text-white' : 'border-white/12 text-white/70'} ${MOTION.hover}`}
                                            >{y}</button>
                                        ))}
                                    </div>
                                    <div className="ml-auto text-xs text-white/55">
                                        {filteredCerts.length} result{filteredCerts.length === 1 ? '' : 's'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1">
                                    <ul className="divide-y divide-white/10">
                                        {visibleCerts.map((c) => (
                                            <li key={c.name} className="py-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        {c.url ? (
                                                            <a href={c.url} target="_blank" rel="noreferrer" className="block text-sm text-white/90 hover:underline underline-offset-4 truncate">
                                                                {c.name}
                                                            </a>
                                                        ) : (
                                                            <span className="block text-sm text-white/90 truncate">{c.name}</span>
                                                        )}
                                                        <div className="text-xs text-white/55 truncate">{[c.issuer].filter(Boolean).join('')}</div>
                                                    </div>
                                                    <div className="text-xs text-white/55 whitespace-nowrap">{c.year || '—'}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    {filteredCerts.length > VISIBLE_COUNT && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowAll((s) => !s)}
                                                className="text-[11px] uppercase tracking-wider rounded-full border border-white/12 px-3 py-1 text-white/80 hover:border-white/20"
                                            >
                                                {showAll ? 'Show less' : 'Show more'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Experience */}
                        <section aria-label="Experience" className="mt-10 md:mt-12">
                            <h3 className="mb-3 text-[11px] tracking-[0.3em] text-white/70 uppercase">Experience</h3>
                            <ul className="divide-y divide-white/10">
                                {experience.map((item) => (
                                    <li key={item.title} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-white">{item.title}</div>
                                            {item.period ? <div className="text-xs text-white/55">{item.period}</div> : null}
                                        </div>
                                        <div className="text-white/70 text-sm md:text-base">{item.subtitle}</div>
                                        {item.badges && item.badges.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">{item.badges.map((b) => (<Pill key={b} label={b} />))}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Education */}
                        <section aria-label="Education" className="mt-10 md:mt-12">
                            <h3 className="mb-3 text-[11px] tracking-[0.3em] text-white/70 uppercase">Education</h3>
                            <ul className="divide-y divide-white/10">
                                {education.map((item) => (
                                    <li key={item.title} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-white">{item.title}</div>
                                            {item.period ? <div className="text-xs text-white/55">{item.period}</div> : null}
                                        </div>
                                        <div className="text-white/70 text-sm md:text-base">{item.subtitle}</div>
                                        {item.badges && item.badges.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">{item.badges.map((b) => (<Pill key={b} label={b} />))}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>

							{/* Skills taxonomy removed per toolbelt-only preference */}
                    </div>
				</div>
			</div>
            </div>
        </section>
    );
}


