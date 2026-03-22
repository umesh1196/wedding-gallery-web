interface EventEditorialContent {
  subtitle: string;
  chapterNote: string;
  moodLabel: string;
}

const EVENT_EDITORIAL: Record<string, EventEditorialContent> = {
  haldi: {
    subtitle: 'Playful colour, warm laughter, and the first rush of celebration settling over the day.',
    chapterNote: 'A bright chapter of teasing smiles, family hands, and the easy joy that arrives before everything becomes ceremonial.',
    moodLabel: 'Playful and sunlit',
  },
  mehendi: {
    subtitle: 'Intricate detail, quiet anticipation, and the slower rhythm of hands being adorned.',
    chapterNote: 'This chapter leans into texture and closeness, where the smallest gestures begin to feel like part of the larger story.',
    moodLabel: 'Detailed and intimate',
  },
  sangeet: {
    subtitle: 'Movement, light, and the louder pulse of the celebration coming into view.',
    chapterNote: 'A chapter full of performance, applause, and the kind of energy that turns family into a single moving crowd.',
    moodLabel: 'Lively and electric',
  },
  ceremony: {
    subtitle: 'The emotional center of the wedding, held in vows, rituals, and the people closest to them.',
    chapterNote: 'Portraits, embraces, and sacred pauses come together here, giving the day its clearest emotional shape.',
    moodLabel: 'Sacred and grounded',
  },
  reception: {
    subtitle: 'A softer close to the celebration, where portraits, greetings, and evening light take over.',
    chapterNote: 'This chapter settles into a quieter elegance, mixing the formal with the candid as the day begins to exhale.',
    moodLabel: 'Elegant and unhurried',
  },
};

const FALLBACK_EDITORIAL: EventEditorialContent = {
  subtitle: 'A carefully gathered chapter from the wedding story.',
  chapterNote: 'A mix of portraits, candid frames, and the in-between moments that shaped this part of the celebration.',
  moodLabel: 'Quietly curated',
};

export function getEventEditorial(eventId: string) {
  return EVENT_EDITORIAL[eventId] ?? FALLBACK_EDITORIAL;
}
