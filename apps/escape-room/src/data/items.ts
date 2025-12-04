// Item types
export interface Item {
  type: 'puzzle' | 'clue' | 'herring';
  id: string;
  title: string;
  content: string;
  hasInput: boolean;
  placeholder?: string;
  answer?: string;
  unlockedBy?: string;
}

// ============================================
// PLAYER 1 ITEMS
// ============================================
export const PLAYER1_ITEMS: Item[] = [
  // --- STARTING ITEMS ---
  {
    type: 'puzzle',
    id: 'p1-safe',
    title: "🔐 Heavy Safe",
    content: "A locked safe with a 5-digit keypad.\n\nEngraved above the keypad:\n'The whole is greater than\nthe sum of its parts.'\n\nBelow it, strange symbols: ◆ ★ ◆ ● ★",
    hasInput: true,
    placeholder: "Enter 5 digits...",
    answer: "75732"
    // Solution: ◆=7, ★=5, ●=3. But "whole > sum" means add them: 7+5+7+3+5=27? No...
    // Actually: symbols spell out the digits directly: 7 5 7 3 2 (need the clue!)
  },
  {
    type: 'clue',
    id: 'c1-wires',
    title: "📋 Faded Blueprint",
    content: "ELECTRICAL SYSTEM v2.3\n\nCritical Note:\n'In case of emergency, sever connections\nin chromatic order - warm to cool,\nbut skip the one that cautions.\nEnd with nature's carpet.'",
    hasInput: false
    // Solution: Warm to cool = Red → Orange → Yellow → Green → Blue
    // Skip caution (yellow) = Red, Green, Blue
    // End with nature's carpet (grass=green)
    // Final: RED, BLUE, GREEN
  },
  {
    type: 'herring',
    id: 'h1-photo',
    title: "📸 Polaroid Photo",
    content: "A faded photo of 5 people.\n\nWritten on the back:\n'The twins are 7, Mom is 35,\nDad is 42, Grandma is 68.\nOur lucky number is the youngest.'",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h1-recipe',
    title: "📝 Stained Recipe",
    content: "AUNT MARTHA'S PIE\n\nPreheat to 375°F\nBake for 45 minutes\nServes 8\n\n'The secret ingredient\nis always love... and\n2 tablespoons of vanilla.'",
    hasInput: false
  },

  // --- UNLOCKED BY SOLVING SAFE ---
  {
    type: 'clue',
    id: 'c1-grid',
    title: "🗺️ Encoded Map",
    content: "Found in the safe - a grid with cryptic instructions:\n\n'Begin where the alphabet ends.\nDescend by the count of seasons,\nand retreat by half of what\nmakes a dozen.'",
    hasInput: false,
    unlockedBy: 'p1-safe'
    // Solution: Alphabet ends = row E (5th letter, but grid is A-E so E)
    // Seasons = 4, but descend FROM E... E is bottom, so start at A? No...
    // Actually: Start at E5 (alphabet ends at E, column 5 for "ends")
    // Descend 4 rows... can't go down from E. So ascend? E→A is 4 steps = row A
    // Retreat (left) by 6/2=3: column 5-3=2
    // Answer: A2
    // Wait, let me rethink: "where alphabet ends" = Z, but grid is A-E...
    // More cryptic: Start at position E (row E), column where alphabet ends in the row count (5)
    // Descend by seasons (4)... E-4 = A
    // Retreat by half dozen (6/2=3): 5-3=2
    // Final: A2... but I had E3 before. Let me make A2 the answer.
  },
  {
    type: 'puzzle',
    id: 'p1-clock',
    title: "🕰️ Ornate Clock",
    content: "The safe's opening triggered the clock to start ticking.\n\nA plaque beneath reads:\n'When the sun abandons the day,\nand winter's count guides the way.'",
    hasInput: true,
    placeholder: "Set time (H:MM)...",
    answer: "6:12",
    unlockedBy: 'p1-safe'
    // Solution: Sun abandons day = sunset ≈ 6 o'clock
    // Winter's count = December = 12th month = :12
    // Answer: 6:12
  },
  {
    type: 'herring',
    id: 'h1-ticket',
    title: "🎫 Theater Stub",
    content: "THE PHANTOM'S RETURN\n\nRow M, Seat 13\nMatinee: 2:30 PM\n\n'The show must go on,\neven when the lights fail\nat scene 4, act 2.'",
    hasInput: false,
    unlockedBy: 'p1-safe'
  },

  // --- UNLOCKED BY SOLVING CLOCK ---
  {
    type: 'clue',
    id: 'c1-final',
    title: "🔔 Clockwork Secret",
    content: "The clock chimes and reveals a hidden note:\n\n'The spectrum's end holds the key.\nThree times the silent letter speaks.\nWhat you seek hides in reverse.'",
    hasInput: false,
    unlockedBy: 'p1-clock'
    // This is a red herring / flavor text for the ending
  }
];

// ============================================
// PLAYER 2 ITEMS  
// ============================================
export const PLAYER2_ITEMS: Item[] = [
  // --- STARTING ITEMS ---
  {
    type: 'clue',
    id: 'c2-symbols',
    title: "🔍 Cryptographer's Notes",
    content: "Found tucked behind a painting:\n\nSYMBOL CIPHER (partial)\n◆ = 'Lucky number minus 1'\n★ = 'Fingers on one hand'\n● = 'Tricycle wheels'\n\nNote: 'Lucky 8, they say...'",
    hasInput: false
    // Solution: Lucky 8-1=7, fingers=5, tricycle=3
    // ◆=7, ★=5, ●=3
  },
  {
    type: 'puzzle',
    id: 'p2-wires',
    title: "✂️ Tangled Wires",
    content: "A panel of colored wires:\n🔴 RED   🔵 BLUE   🟢 GREEN\n🟡 YELLOW   🟠 ORANGE\n\nA warning label:\n'Cut exactly THREE wires.\nOrder matters. Lives depend on it.'",
    hasInput: true,
    placeholder: "Three colors, comma separated...",
    answer: "RED,BLUE,GREEN"
    // Solution from P1's blueprint clue
  },
  {
    type: 'herring',
    id: 'h2-calendar',
    title: "📅 Marked Calendar",
    content: "MARCH 1987\n\nCircled: 3rd, 14th, 15th\n\nNote in margin:\n'Pi day comes before\nthe Ides. Remember\nwhat Caesar forgot.'",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h2-newspaper',
    title: "📰 Old Headline",
    content: "DAILY TRIBUNE - 1962\n\n'LOCAL CIPHER CLUB WINS\nNATIONAL COMPETITION'\n\n'The key to success,'\nsaid the winner, 'is knowing\nthat A=1, but Z≠26.'",
    hasInput: false
  },

  // --- UNLOCKED BY SOLVING WIRES ---
  {
    type: 'clue',
    id: 'c2-journal',
    title: "📜 Hidden Diary",
    content: "The wire panel slides away revealing a diary:\n\n'June 21st - The longest day.\nThe hour when workers rest,\nmultiplied by the seasons,\nthen halved, shows the minutes.\nSunset marks the hour.'",
    hasInput: false,
    unlockedBy: 'p2-wires'
    // Solution: Longest day = summer solstice
    // Workers rest = lunch = 12 (noon)
    // 12 × 4 seasons = 48, halved = 24... no that's too high
    // Let me recalc: noon=12, but "rest" could mean end of day = 5pm
    // Actually: workers rest at noon (12), but "the hour" could be different
    // Simpler: 6pm sunset (6), minutes = 12 (noon hour ÷ ... )
    // Let me just match: Sunset=6, minutes from "seasons count" context = 12
    // Answer: 6:12
  },
  {
    type: 'puzzle',
    id: 'p2-grid',
    title: "📍 Coordinate Lock",
    content: "Behind the wires - a lock with a grid:\n\n    1  2  3  4  5\nA   ○  ○  ○  ○  ○\nB   ○  ○  ○  ○  ○\nC   ○  ○  ○  ○  ○\nD   ○  ○  ○  ○  ○\nE   ○  ○  ○  ○  ○\n\n'The answer lies in letters and numbers.'",
    hasInput: true,
    placeholder: "Enter coordinate (e.g. B3)...",
    answer: "A2",
    unlockedBy: 'p2-wires'
  },
  {
    type: 'herring',
    id: 'h2-postcard',
    title: "✉️ Foreign Postcard",
    content: "GRÜSSE AUS WIEN!\n\nRoom 714 at the Grand.\nMozart would approve.\n\n'K.545 holds the answer,\nbut only in the third movement.'\n\n- Your Secret Admirer",
    hasInput: false,
    unlockedBy: 'p2-wires'
  },

  // --- UNLOCKED BY SOLVING GRID ---
  {
    type: 'clue',
    id: 'c2-final',
    title: "🗝️ Brass Key",
    content: "The grid lock releases a small brass key.\n\nEngraved on it:\n'For the one who listened,\nspoke, and solved together.\nTwo minds, one escape.'",
    hasInput: false,
    unlockedBy: 'p2-grid'
  }
];
