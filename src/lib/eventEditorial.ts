interface EventEditorialContent {
  subtitle: string;
  chapterNote: string;
  moodLabel: string;
}

const EVENT_EDITORIAL: Record<string, EventEditorialContent> = {
  engagement: {
    subtitle: 'The first yes, captured in rings, smiles, and the quiet joy of two families becoming one.',
    chapterNote: 'An intimate chapter of close-ups, nervous laughter, and the simple delight of a moment everyone has been waiting for.',
    moodLabel: 'Joyful and intimate',
  },
  prewedding: {
    subtitle: 'Portraits taken before the ceremony — candid, unhurried, and full of the couple as they are.',
    chapterNote: 'A chapter away from the crowd, where the camera catches the two of them in a quieter light before the celebrations begin.',
    moodLabel: 'Romantic and relaxed',
  },
  haldi: {
    subtitle: 'Playful colour, warm laughter, and the first rush of celebration settling over the day.',
    chapterNote: 'A bright chapter of teasing smiles, family hands, and the easy joy that arrives before everything becomes ceremonial.',
    moodLabel: 'Playful and sunlit',
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
