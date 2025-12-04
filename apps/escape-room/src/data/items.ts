// Item types
export interface Item {
  type: 'puzzle' | 'clue' | 'herring';
  id: string;
  title: string;
  content: string;
  hasInput: boolean;
  placeholder?: string;
  answer?: string;
  unlockedBy?: string; // ID of puzzle that must be solved to reveal this item
}

// ============================================
// PLAYER 1 ITEMS
// ============================================
// Progression: Start with safe puzzle → solving reveals more clues/puzzles
export const PLAYER1_ITEMS: Item[] = [
  // --- STARTING ITEMS (visible from the beginning) ---
  {
    type: 'puzzle',
    id: 'p1-safe',
    title: "🔐 Heavy Safe",
    content: "A locked safe with a 4-digit keypad. Strange symbols above it: ● ▲ ■ ▲",
    hasInput: true,
    placeholder: "Enter code...",
    answer: "3797"
    // No unlockedBy = visible from start
  },
  {
    type: 'clue',
    id: 'c1-wires',
    title: "📋 Maintenance Manual",
    content: "EMERGENCY WIRE PROTOCOL:\n\n1. First cut what rhymes with 'bed'\n2. Then the color of a clear sky\n3. Next, the color of warning signs\n4. Finally, the color of spring grass",
    hasInput: false
    // Helps Player 2 solve wires - available from start
  },
  {
    type: 'herring',
    id: 'h1-photo',
    title: "📸 Faded Photograph",
    content: "A family photo from 1952.\nFour people standing in front of a house.\nThe house number reads: 7734",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h1-recipe',
    title: "📝 Recipe Card",
    content: "GRANDMOTHER'S SECRET SOUP\n\n2 cups water\n3 carrots\n1 onion\n4 potatoes\n\n'Stir clockwise 7 times'",
    hasInput: false
  },

  // --- UNLOCKED BY SOLVING SAFE ---
  {
    type: 'clue',
    id: 'c1-grid',
    title: "🗺️ Hidden Map",
    content: "Inside the safe, you find a dusty map!\n\nAn X is marked at: Row C, Column 4\n\nScrawled in the margin:\n'Go 2 rows down, 1 column left'",
    hasInput: false,
    unlockedBy: 'p1-safe' // Only appears after safe is solved
  },
  {
    type: 'puzzle',
    id: 'p1-clock',
    title: "🕰️ Grandfather Clock",
    content: "With the safe open, you notice the clock has started ticking...\n\nThe hands can be moved. What time should it show?",
    hasInput: true,
    placeholder: "Set time (H:MM)...",
    answer: "9:20",
    unlockedBy: 'p1-safe' // Only appears after safe is solved
  },
  {
    type: 'herring',
    id: 'h1-ticket',
    title: "🎫 Concert Ticket",
    content: "Found in the safe:\n\nTHE ROLLING KEYS\nLive at Madison Square\nRow Q, Seat 17\nDoors: 7:30 PM",
    hasInput: false,
    unlockedBy: 'p1-safe'
  },

  // --- UNLOCKED BY SOLVING CLOCK ---
  {
    type: 'clue',
    id: 'c1-final',
    title: "🔔 Clock Chime Secret",
    content: "The clock chimes and a compartment opens!\n\nInside is a note:\n'The colors of the rainbow,\nbut only the primary ones,\nreversed and repeated.'",
    hasInput: false,
    unlockedBy: 'p1-clock' // Only appears after clock is solved
  }
];

// ============================================
// PLAYER 2 ITEMS
// ============================================
// Progression: Start with wire puzzle → solving reveals more clues/puzzles
export const PLAYER2_ITEMS: Item[] = [
  // --- STARTING ITEMS (visible from the beginning) ---
  {
    type: 'clue',
    id: 'c2-symbols',
    title: "🔍 Torn Note",
    content: "Found crumpled in a corner:\n\n▲ = 7\n● = 3\n■ = 9\n\n(the rest is torn off)",
    hasInput: false
    // Helps Player 1 solve safe - available from start
  },
  {
    type: 'puzzle',
    id: 'p2-wires',
    title: "✂️ Wire Panel",
    content: "A mess of wires behind a panel:\n🔴 RED   🔵 BLUE\n🟡 YELLOW   🟢 GREEN\n\nCut them in the right order!",
    hasInput: true,
    placeholder: "e.g. RED,BLUE,YELLOW,GREEN",
    answer: "RED,BLUE,YELLOW,GREEN"
    // No unlockedBy = visible from start
  },
  {
    type: 'herring',
    id: 'h2-calendar',
    title: "📅 Old Calendar",
    content: "DECEMBER 1987\n\nCircled dates: 3, 12, 25\n\nNote: 'Don't forget the party!\nBring 4 bottles of wine.'",
    hasInput: false
  },
  {
    type: 'herring',
    id: 'h2-newspaper',
    title: "📰 Newspaper Clipping",
    content: "LOCAL MAN WINS LOTTERY\n\nNumbers: 7-14-21-28-35\n\n'I always knew lucky 7\nwould save me,' he said.",
    hasInput: false
  },

  // --- UNLOCKED BY SOLVING WIRES ---
  {
    type: 'clue',
    id: 'c2-journal',
    title: "📜 Hidden Journal",
    content: "The wire panel slides open revealing a journal!\n\nMarch 15th, 1923:\n'The old clock holds the secret.\nPoint the hour to where sun meets\nhorizon in evening (West).\nMinutes show the seasons count.'",
    hasInput: false,
    unlockedBy: 'p2-wires' // Only appears after wires solved
  },
  {
    type: 'puzzle',
    id: 'p2-grid',
    title: "📍 Grid Lock",
    content: "Behind the wires, a new lock appears!\n\n    1  2  3  4  5\nA   ○  ○  ○  ○  ○\nB   ○  ○  ○  ○  ○\nC   ○  ○  ○  ○  ○\nD   ○  ○  ○  ○  ○\nE   ○  ○  ○  ○  ○",
    hasInput: true,
    placeholder: "Enter coordinate (e.g. B3)...",
    answer: "E3",
    unlockedBy: 'p2-wires' // Only appears after wires solved
  },
  {
    type: 'herring',
    id: 'h2-postcard',
    title: "✉️ Old Postcard",
    content: "Found behind the panel:\n\nGreetings from BERMUDA!\nWeather is lovely.\nRoom 447 has ocean view.\n\n- Uncle Frank",
    hasInput: false,
    unlockedBy: 'p2-wires'
  },

  // --- UNLOCKED BY SOLVING GRID ---
  {
    type: 'clue',
    id: 'c2-final',
    title: "🗝️ Final Clue",
    content: "The grid lock clicks open!\n\nA small key falls out with a tag:\n'For the music box.\nPlay the notes: Do Re Mi Fa'",
    hasInput: false,
    unlockedBy: 'p2-grid' // Only appears after grid solved
  }
];
