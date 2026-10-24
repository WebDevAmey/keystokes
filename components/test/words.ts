export const COMMON_WORDS: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so",
  "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people",
  "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
  "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "is",
  "sound", "keyboard", "type", "word", "press", "light", "dark", "play", "fast", "slow",
  "click", "rhythm", "focus", "quick", "brown", "fox", "jump", "stream", "cloud", "dream",
  "music", "piano", "note", "beat", "flow", "grace", "spark", "vivid", "calm", "sharp",
];

export function generatePassage(wordCount = 48): string[] {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i += 1) {
    words.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]);
  }
  return words;
}

/**
 * Passage store: the server snapshot is deterministic so static prerender
 * stays safe, while the first client snapshot swaps in a random passage
 * (useSyncExternalStore corrects the hydration pass automatically).
 */
const SERVER_WORDS: string[] = COMMON_WORDS.slice(0, 48);

let sessionWords: string[] = SERVER_WORDS;
let clientStarted = false;
const listeners = new Set<() => void>();

export function subscribeWords(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getWordsSnapshot(): string[] {
  if (!clientStarted && typeof window !== "undefined") {
    clientStarted = true;
    sessionWords = generatePassage();
  }
  return sessionWords;
}

export function getWordsServerSnapshot(): string[] {
  return SERVER_WORDS;
}

export function regenerateWords(): void {
  sessionWords = generatePassage();
  for (const listener of listeners) {
    listener();
  }
}
