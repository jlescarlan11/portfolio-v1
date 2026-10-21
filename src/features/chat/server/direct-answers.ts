import { aboutContent } from '@/features/about/content';
import { CHAT_OVERVIEW_ANSWER, getDirectContactAnswer } from '../content';

const employers = aboutContent.experience.map(item => item.company.split(' — ')[0]);
const workAnswer = `John has worked at ${employers.slice(0, -1).join(', ')}, and ${employers.at(-1)}.`;
const currentEducation = aboutContent.education.find(item => item.isCurrent);

// Only standalone questions receive fixed answers; detailed or mixed requests
// continue to the model with the full portfolio context.
const directAnswers: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /^(?:tell me about (?:john|yourself)|who (?:is john|are you)|(?:give me an? )?(?:overview|introduction) of john)$/,
    CHAT_OVERVIEW_ANSWER
  ],
  [
    /^(?:where (?:has john|has he|have you) worked|what is john's work (?:history|experience))$/,
    workAnswer
  ],
  [
    /^(?:which projects show mobile development experience|(?:does john|do you) have mobile (?:development )?experience|what is john's mobile development experience)$/,
    'HEALTH demonstrates mobile development with React Native and Expo, including offline care records stored on-device.'
  ],
  [
    /^(?:what is|what's|tell me about) pricecraft$/,
    'PriceCraft is a live, offline-capable pricing app that helps small food businesses turn ingredient, labor, and overhead costs into selling prices.'
  ],
  [
    /^(?:has rent n roll launched(?:,? and how many customers does it have)?|how many (?:customers|users) does rent n roll have|is rent n roll (?:live|launched)|what is rent n roll's launch status)$/,
    'Rent N Roll is pre-launch; customer numbers and adoption have not been verified.'
  ]
];

export function getDirectPortfolioAnswer(message: string): string | undefined {
  const contactAnswer = getDirectContactAnswer(message);
  if (contactAnswer) return contactAnswer;

  const normalized = message.trim().toLowerCase().replace(/’/g, "'")
    .replace(/[?.!]+$/, '').replace(/\s+/g, ' ');
  if (currentEducation && /^(?:what is john studying(?: now)?(?:,? and where)?|what (?:is|are) (?:he|you) studying|(?:what is|what's) (?:john's|his|your) education|where (?:does john|do you) study)$/.test(normalized)) {
    return `John is pursuing a ${currentEducation.degree} at the ${currentEducation.school}.`;
  }
  return directAnswers.find(([pattern]) => pattern.test(normalized))?.[1];
}
