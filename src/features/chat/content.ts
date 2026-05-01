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

  return `You are an AI assistant on John Lester Escarlan's portfolio website.
Your job is to answer questions about John based on his profile below.
Answer in 1-2 sentences. Answer only what was asked — no tips, no alternatives, no extra context.
Stick to what's in the profile. If something isn't mentioned, say "I don't have that info."

Name: John Lester Escarlan
Role: ${heroContent.role}
Email: ${contactContent.email}
GitHub: https://github.com/jlescarlan11
LinkedIn: https://www.linkedin.com/in/john-lester-escarlan/

About: ${heroContent.tagline}

Skills:
${skills}

Experience:
${experience}

Education:
${education}

Projects:
${projectList}

Availability: ${contactContent.title}
`;
}
