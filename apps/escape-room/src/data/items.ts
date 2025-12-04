// Item types
export interface Item {
  type: 'puzzle' | 'clue' | 'herring';
  id: string;
  title: string;
  content: string;
  hasInput: boolean;
  placeholder?: string;
  answer?: string;
}

// Everything Player 1 sees (puzzles, clues, and red herrings all mixed)
export const PLAYER1_ITEMS: Item[] = [
  {
    type: 'puzzle',
    id: 'p1-safe',
    title: "🔐 Heavy Safe",
    content: "A locked safe with a 4-digit keypad. Strange symbols above it: ● ▲ ■ ▲",
    hasInput: true,
    placeholder: "Enter code...",
    answer: "3797"
  },
  {
    type: 'clue',
    id: 'c1-wires',
    title: "📋 Maintenance Manual",
    content: "EMERGENCY WIRE PROTOCOL:\n\n1. First cut what rhymes with 'bed'\n2. Then the color of a clear sky\n3. Next, the color of warning signs\n4. Finally, the color of spring grass",
    hasInput: false
  },
  {
    type: 'puzzle',
    id: 'p1-clock',
    title: "🕰️ Grandfather Clock",
    content: "An antique clock. The hands can be moved. Something feels important about the time...",
    hasInput: true,
    placeholder: "Set time (H:MM)...",
    answer: "9:20"
  },
  {
    type: 'clue',
    id: 'c1-grid',
    title: "🗺️ Old Map",
    content: "A dusty map with a grid. An X is marked at:\nRow C, Column 4\n\nScrawled in the margin:\n'Go 2 rows down,\n1 column left'",
    hasInput: false
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
  {
    type: 'herring',
    id: 'h1-ticket',
    title: "🎫 Concert Ticket",
    content: "THE ROLLING KEYS\nLive at Madison Square\nRow Q, Seat 17\nDoors: 7:30 PM",
    hasInput: false
  }
];

// Everything Player 2 sees (puzzles, clues, and red herrings all mixed)
export const PLAYER2_ITEMS: Item[] = [
  {
    type: 'clue',
    id: 'c2-symbols',
    title: "🔍 Torn Note",
    content: "Found crumpled in a corner:\n\n▲ = 7\n● = 3\n■ = 9\n\n(the rest is torn off)",
    hasInput: false
  },
  {
    type: 'puzzle',
    id: 'p2-wires',
    title: "✂️ Wire Panel",
    content: "A mess of wires behind a panel:\n🔴 RED   🔵 BLUE\n🟡 YELLOW   🟢 GREEN\n\nCut them in the right order!",
    hasInput: true,
    placeholder: "e.g. RED,BLUE,YELLOW,GREEN",
    answer: "RED,BLUE,YELLOW,GREEN"
  },
  {
    type: 'clue',
    id: 'c2-journal',
    title: "📜 Journal Entry",
    content: "March 15th, 1923\n\n'The old clock holds the secret.\nPoint the hour to where\nsun meets horizon in evening.\nMinutes show the seasons count.'",
    hasInput: false
  },
  {
    type: 'puzzle',
    id: 'p2-grid',
    title: "📍 Grid Lock",
    content: "A strange lock with a 5x5 grid:\n\n    1  2  3  4  5\nA   ○  ○  ○  ○  ○\nB   ○  ○  ○  ○  ○\nC   ○  ○  ○  ○  ○\nD   ○  ○  ○  ○  ○\nE   ○  ○  ○  ○  ○",
    hasInput: true,
    placeholder: "Enter coordinate (e.g. B3)...",
    answer: "E3"
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
  {
    type: 'herring',
    id: 'h2-postcard',
    title: "✉️ Postcard",
    content: "Greetings from BERMUDA!\n\nWeather is lovely.\nRoom 447 has ocean view.\nSee you in 2 weeks!\n\n- Uncle Frank",
    hasInput: false
  }
];

