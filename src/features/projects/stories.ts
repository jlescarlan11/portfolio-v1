// Short homepage chapters. Detailed evidence lives in the project records.
export const healthHackathonResult = 'Hackathon semifinalist · Top 15 of 200+ teams';

export const projectStories: Record<string, { kind: string; preview: string; detail: string }> = {
  pacu: {
    kind: 'Client project · Feb–Aug 2026',
    preview: 'Some learners at PACU could see their course progress go past 100%. I fixed how the platform counted completed work and made sure retrying a certificate write couldn’t create a duplicate record.',
    detail: 'I also added a way for the team to roll back content releases if something went wrong.'
  },
  pricecraft: {
    kind: 'Personal project · Offline pricing app',
    preview: 'I built PriceCraft so small food businesses can turn ingredient costs, labor, and overhead into a selling price. The calculator works offline without an account.',
    detail: 'If you scan a receipt, you can check the suggested prices before they change your costs.'
  },
  health: {
    kind: 'Hackathon prototype · Team lead',
    preview: 'I led a five-person team building a health app prototype for Naga City.',
    detail: 'We put safety checks ahead of AI-assisted assessment and kept selected records available offline.'
  }
};
