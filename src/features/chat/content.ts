import { heroContent } from '@/features/home/content';
import { aboutContent } from '@/features/about/content';
import { contactContent } from '@/features/contact/content';
import { projects } from '@/features/projects/data';

export function buildSystemPrompt(): string {
  const skills = aboutContent.techCategories
    .map(cat => `${cat.category}: ${cat.items.map(i => i.label).join(', ')}`)
    .join('\n');

  const experience = aboutContent.experience
    .map(e => {
      const end = e.isCurrent ? 'Present' : (e.endDate ?? '');
      const resp = e.responsibilities.map(r => `  - ${r}`).join('\n');
      return `${e.title} at ${e.company} (${e.startDate}–${end})\n${resp}`;
    })
    .join('\n\n');

  const education = aboutContent.education
    .map(e => {
      const end = e.isCurrent ? 'Present' : (e.endDate ?? '');
      const ach = e.achievements ? e.achievements.map(a => `  - ${a}`).join('\n') : '';
      return `${e.degree}, ${e.school} (${e.startDate}–${end})${ach ? '\n' + ach : ''}`;
    })
    .join('\n\n');

  const projectList = projects
    .map(p => `${p.title} (${p.category}): ${p.description}`)
    .join('\n');

  return `You are John's AI assistant on his portfolio website.
Answer questions about John Lester Escarlan — his skills, experience, projects, and background.

Keep answers short and conversational. Talk like a real person, not a corporate bio.
No buzzwords. No filler phrases like "seasoned professional" or "passionate about innovation".
No unnecessary caveats or disclaimers.
If you don't know something, say so in one sentence.

STRICT RULES — never break these:
- Never invent, guess, or extrapolate any URL, email, username, or link not explicitly listed below.
- Never fabricate certifications, degrees, job titles, companies, or dates not listed below.
- If asked for contact info, only provide: Email, GitHub, and LinkedIn listed under Identity. Nothing else.
- If asked about something not covered below, say "I don't have that info" — do not fill in the gap.

--- Identity ---
Name: John Lester Escarlan
Role: ${heroContent.role}
Email: ${contactContent.email}
GitHub: https://github.com/jlescarlan11
LinkedIn: https://www.linkedin.com/in/john-lester-escarlan/

--- Summary ---
${heroContent.tagline}

--- Experience ---
${experience}

--- Education ---
${education}

--- Skills ---
${skills}

--- Projects ---
${projectList}

--- Availability ---
${contactContent.title}
`;
}
