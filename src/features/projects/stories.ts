// Short homepage chapters. Detailed evidence lives in the project records.
export const projectStories: Record<string, { kind: string; preview: string; lesson: string }> = {
  pacu: {
    kind: 'Client work · Feb–Aug 2026',
    preview: 'At PACU, I worked on progress that could exceed 100%, certificate records, and content promotion. I aligned completion checks across five code paths and used database constraints to prevent duplicate achievements. The certificate change was validated with 51 passing tests.',
    lesson: 'It reinforced how much a learning experience depends on consistent records behind the interface.'
  },
  pricecraft: {
    kind: 'Personal product · Offline-capable PWA',
    preview: 'I built PriceCraft to turn ingredients, labor, and overhead into a clearer selling price. It works offline before sign-in, and receipt OCR suggests entries for the person using it to review before costs change.',
    lesson: 'I learned to treat OCR as a useful draft and make the math behind a price visible.'
  },
  health: {
    kind: 'Hackathon prototype · Team lead',
    preview: 'I led a five-person team building symptom assessment, facility discovery, and offline records. We put deterministic safety checks before AI-assisted assessment and reached the top 15 of more than 200 teams.',
    lesson: 'The prototype taught me to define clear limits for both AI assistance and offline support.'
  }
};
