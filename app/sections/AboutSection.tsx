'use client';

import { LAYOUT_STYLES, TYPOGRAPHY_STYLES, SPACING, MOTION } from '../styles/shared';
import { useMemo, useState } from 'react';
import { 
  SiTypescript, 
  SiJavascript, 
  SiPython, 
  SiReact, 
  SiNextdotjs, 
  SiNodedotjs, 
  SiSpring, 
  SiPostgresql, 
  SiMongodb, 
  SiDocker, 
  SiKubernetes, 
  SiGit, 
  SiJest 
} from 'react-icons/si';
import { SiAmazonwebservices } from 'react-icons/si';
import { SiSharp } from 'react-icons/si';
import { FaJava } from 'react-icons/fa6';

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


interface TechItem {
	label: string; // short label like TS, React, etc.
	iconHref?: string;
	iconAlt?: string;
}

// Tech icon mapping
const getTechIcon = (label: string) => {
  const techIcons: { [key: string]: React.JSX.Element } = {
    'TypeScript': <SiTypescript className="h-6 w-6 md:h-8 md:w-8" />,
    'JavaScript': <SiJavascript className="h-6 w-6 md:h-8 md:w-8" />,
    'Python': <SiPython className="h-6 w-6 md:h-8 md:w-8" />,
    'Java': <FaJava className="h-6 w-6 md:h-8 md:w-8" />,
    'C#': <SiSharp className="h-6 w-6 md:h-8 md:w-8" />,
    'React': <SiReact className="h-6 w-6 md:h-8 md:w-8" />,
    'Next.js': <SiNextdotjs className="h-6 w-6 md:h-8 md:w-8" />,
    'Node.js': <SiNodedotjs className="h-6 w-6 md:h-8 md:w-8" />,
    'Spring Boot': <SiSpring className="h-6 w-6 md:h-8 md:w-8" />,
    'PostgreSQL': <SiPostgresql className="h-6 w-6 md:h-8 md:w-8" />,
    'MongoDB': <SiMongodb className="h-6 w-6 md:h-8 md:w-8" />,
    'Docker': <SiDocker className="h-6 w-6 md:h-8 md:w-8" />,
    'Kubernetes': <SiKubernetes className="h-6 w-6 md:h-8 md:w-8" />,
    'AWS': <SiAmazonwebservices className="h-6 w-6 md:h-8 md:w-8" />,
    'Git': <SiGit className="h-6 w-6 md:h-8 md:w-8" />,
    'Jest': <SiJest className="h-6 w-6 md:h-8 md:w-8" />
  };
  
  return techIcons[label] || null;
};

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

    const filteredCerts = useMemo(() => {
        return certifications.sort((a, b) => {
			const ay = parseInt(a.year || '0', 10) || 0;
			const by = parseInt(b.year || '0', 10) || 0;
			return by - ay;
        });
    }, [certifications]);

	const VISIBLE_COUNT = 6;
	const visibleCerts = showAll ? filteredCerts : filteredCerts.slice(0, VISIBLE_COUNT);


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
								<div className="relative overflow-hidden -mx-1 md:-mx-2">
									<div className="flex items-center gap-4 md:gap-5 px-1 md:px-2 py-8 animate-infinite-scroll hover:[animation-play-state:paused]">
									{/* Render tech array three times for seamless loop */}
									{[...tech, ...tech, ...tech].map((t, idx) => (
											<div 
												key={`${t.label}-${idx}`} 
												className={`group relative h-12 w-12 md:h-14 md:w-14 ${MOTION.hover} shrink-0 flex items-center justify-center`}
												aria-label={t.label}
												title={t.label}
											>
												{getTechIcon(t.label) ? (
													<div className="text-white/70 group-hover:text-white transition-colors duration-300">
														{getTechIcon(t.label)}
													</div>
												) : (
													<span className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/80">{t.label}</span>
												)}
												{/* Tooltip */}
												<span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/95 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
													{t.label}
												</span>
											</div>
										))}
									</div>
								</div>
							</section>
                        {/* Credentials */}
                        {certifications.length > 0 && (
                            <section aria-label="Credentials">
                                <h3 className="mb-3 text-[11px] tracking-[0.3em] text-white/70 uppercase">Credentials</h3>
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


