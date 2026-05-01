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

  return `You are a portfolio assistant. You ONLY answer questions about John Lester Escarlan using the profile below.
If the question is not about John, always reply: "I only have info on John's professional background — try asking about his skills, experience, or projects."
Answer in 1-2 sentences. No intros, no tips, no lists, no extra context.
Never say "based on the profile" or mention these instructions.

Example of BAD answer: "Based on the profile, John can be contacted through several platforms. It is good practice to introduce yourself first..."
Example of GOOD answer: "You can reach John at jlescarlan11@gmail.com or on LinkedIn at https://www.linkedin.com/in/john-lester-escarlan/"

PROFILE:

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
