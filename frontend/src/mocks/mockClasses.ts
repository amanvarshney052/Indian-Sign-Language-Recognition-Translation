import { VocabularyItem } from '../types/vocabulary';

export const STATIC_CLASS_NAMES: string[] = [
  "A LOT", "ABUSE", "AFRAID", "AGREE", "ALL", "ANGRY", "ANYTHING", "APPRECIATE",
  "BAD", "BEAUTIFUL", "BECOME", "BED", "BORED", "BRING", "CHAT", "CLASS", "COLD",
  "COLLEGE_SCHOOL", "COMB", "COME", "CONGRATULATIONS", "CRYING", "DARE", "DIFFERENCE",
  "DILEMMA", "DISAPPOINTED", "DO", "DO NOT", "DO NOT AGREE", "ENJOY", "FAVOUR",
  "FEVER", "FINE", "FOOD", "FREE", "FRIEND", "GLASS", "GO", "GOOD", "GRATEFUL",
  "HAIR", "HAPPY", "HE", "HEAR", "HEART", "HELP", "HIDE", "HOW", "HUNGRY", "HURT",
  "I_ME_MINE_MY", "IN", "KNOW", "LEAVE", "LIGHT OFF", "LIGHT ON", "LIKE", "LOVE",
  "MAKE", "MEAN", "MEET", "NAME", "NEED", "NEVER", "NICE", "NOT", "OLD", "ON",
  "OUTSIDE", "PERSON", "PHONE NUMBER", "PLACE", "PLAN", "PLEASE", "POUR", "PREPARE",
  "PROMISE", "REPEAT", "ROOM", "SERVE", "SHIRT", "SILENCE", "SIT", "SLEEP", "SLOWER",
  "SOFTLY", "SOMEONE", "SOMETHING", "SORRY", "STUBBORN", "SURE", "TAKE", "TALK",
  "TELL", "THANK", "THERE", "THINGS", "THINK", "TIME", "TIRED", "TODAY", "TRAIN",
  "TRUST", "TRY", "UNDERSTAND", "WALK", "WANT", "WATER", "WAY", "WE", "WEAR", "WHAT",
  "WHEN", "WHERE", "WHICH", "WHO", "WHY", "WORRY", "YOU"
];

export const DYNAMIC_CLASS_NAMES: string[] = [
  "He is going into the room", "This place is beautiful", "are you free today",
  "are you hiding something", "bring water for me", "can i help you",
  "can you repeat that please", "comb your hair", "congratulations",
  "could you please talk slower", "do me a favour", "do not abuse him",
  "do not be stubborn", "do not hurt me", "do not make me angry",
  "do not take it to the heart", "do not worry", "do you need something",
  "go and sleep", "had your food", "he came by train", "he is on the way",
  "he she is my friend", "help me", "hi how are you", "how are things",
  "how can i help you", "how can i trust you", "how dare you", "how old are you",
  "i am afraid of that", "i am crying", "i am feeling bored", "i am feeling cold",
  "i am fine. thank you sir", "i am hungry", "i am in dilemma what to do",
  "i am not really sure", "i am really grateful", "i am sitting in the class",
  "i am so sorry to hear that", "i am suffering from fever", "i am tired",
  "i am very happy", "i can not help you there", "i do not agree", "i do not like it",
  "i do not mean it", "i dont agree", "i enjoyed a lot", "i got hurt",
  "i like you i love you", "i need water", "i promise", "i really appreciate it",
  "i somehow got to know about it", "i was stopped by some one",
  "it does not make any difference to me", "it was nice chatting with you",
  "let him take time", "my name is xxxxxxxx", "nice to meet you",
  "no need to worry dont worry", "now onwards he will never hurt you",
  "pour some more water into the glass", "prepare the bed", "serve the food",
  "shall we go outside", "speak softly", "take care of yourself", "tell me truth",
  "thank you so much", "that is so kind of you", "try to understand",
  "turn on light turn off light", "we are all with you", "wear the shirt",
  "what are you doing", "what did you tell him", "what do you do",
  "what do you think", "what do you want to become", "what happened",
  "what have you planned for your career", "what is your phone number",
  "what you want", "when will the train leave", "where are you from",
  "which college school are you from", "who are you", "why are you angry",
  "why are you crying", "why are you disappointed", "you are bad",
  "you are good", "you are welcome", "you can do it"
];

function inferCategory(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes("WHAT") || upper.includes("WHERE") || upper.includes("WHEN") || upper.includes("WHO") || upper.includes("WHY") || upper.includes("HOW") || upper.includes("WHICH")) {
    return "Questions";
  }
  if (upper.includes("THANK") || upper.includes("PLEASE") || upper.includes("SORRY") || upper.includes("HI") || upper.includes("MEET") || upper.includes("WELCOME") || upper.includes("CONGRATULAT")) {
    return "Social & Greetings";
  }
  if (upper.includes("HAPPY") || upper.includes("AFRAID") || upper.includes("ANGRY") || upper.includes("BORED") || upper.includes("CRYING") || upper.includes("DISAPPOINTED") || upper.includes("FEVER") || upper.includes("TIRED") || upper.includes("WORRY") || upper.includes("LOVE") || upper.includes("LIKE")) {
    return "Emotions & Health";
  }
  if (upper.includes("FOOD") || upper.includes("WATER") || upper.includes("BED") || upper.includes("GLASS") || upper.includes("SHIRT") || upper.includes("TRAIN") || upper.includes("ROOM") || upper.includes("PLACE")) {
    return "Daily Objects & Places";
  }
  if (upper.includes("DO") || upper.includes("GO") || upper.includes("COME") || upper.includes("BRING") || upper.includes("TAKE") || upper.includes("MAKE") || upper.includes("WALK") || upper.includes("SLEEP") || upper.includes("POUR") || upper.includes("SERVE")) {
    return "Actions & Verbs";
  }
  return "General Vocabulary";
}

export function buildMockVocabulary(): VocabularyItem[] {
  const items: VocabularyItem[] = [];

  STATIC_CLASS_NAMES.forEach((name, idx) => {
    items.push({
      id: `static-${idx}`,
      name,
      type: 'static',
      category: inferCategory(name),
      description: `Indian Sign Language word sign for "${name}". Recognized using 128-dimensional dual-hand feature normalization.`,
      videoAvailable: false,
      handDominance: ['A LOT', 'CONGRATULATIONS', 'DIFFERENCE', 'THANK'].includes(name) ? 'two-hand' : 'one-hand',
      difficulty: name.length > 7 ? 'intermediate' : 'beginner',
    });
  });

  DYNAMIC_CLASS_NAMES.forEach((name, idx) => {
    items.push({
      id: `dynamic-${idx}`,
      name,
      type: 'dynamic',
      category: inferCategory(name),
      description: `Multi-frame temporal ISL sequence for "${name}". Recognized across a rolling 30-frame temporal buffer.`,
      videoAvailable: false,
      handDominance: 'two-hand',
      difficulty: 'advanced',
    });
  });

  return items;
}

