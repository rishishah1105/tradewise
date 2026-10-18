import { getLevelInfo } from '../utils/level';

export interface PopulationLearner {
  name: string;
  institution: string;
  xp: number;
  portfolioReturn: number;
  streak: number;
  level: number;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Kabir',
  'Aditi', 'Vikram', 'Pooja', 'Rahul', 'Neha',
  'Arjun', 'Isha', 'Kunal', 'Diya', 'Aditya',
  'Riya', 'Siddharth', 'Tanvi', 'Varun', 'Meera'
];

const LAST_NAMES = [
  'Patel', 'Shah', 'Sharma', 'Verma', 'Gupta',
  'Mehta', 'Deshmukh', 'Joshi', 'Chopra', 'Nair',
  'Iyer', 'Reddy', 'Agarwal', 'Bhatia', 'Singh',
  'Kulkarni', 'Jain', 'Rao', 'Mishra', 'Pandey'
];

const INSTITUTIONS = [
  'SPIT Mumbai',
  'IIT Bombay',
  'VJTI',
  'NMIMS',
  'BITS Pilani',
  'SRCC Delhi',
  'IIM Ahmedabad',
  'DJ Sanghvi',
  'KJ Somaiya',
  'Christ University',
  'NIT Trichy',
  'Delhi School of Economics'
];

const generatePopulation = (): PopulationLearner[] => {
  const rng = mulberry32(20261018);

  const existingEntries: PopulationLearner[] = [
    { name: 'Elena Rostova', institution: 'IIT Bombay FinTech', xp: 2450, streak: 14, portfolioReturn: 18.4, level: getLevelInfo(2450).level },
    { name: 'Marcus Chen', institution: 'IIM Ahmedabad', xp: 1980, streak: 11, portfolioReturn: 14.2, level: getLevelInfo(1980).level },
    { name: 'Priya Sharma', institution: 'Delhi School of Economics', xp: 1720, streak: 9, portfolioReturn: 12.8, level: getLevelInfo(1720).level },
    { name: 'David Kim', institution: 'BITS Pilani Finance', xp: 1410, streak: 7, portfolioReturn: 9.5, level: getLevelInfo(1410).level },
    { name: 'Sarah Jenkins', institution: 'SRCC Delhi', xp: 1150, streak: 6, portfolioReturn: 7.1, level: getLevelInfo(1150).level },
  ];

  const generatedCount = 500 - existingEntries.length;
  const generated: PopulationLearner[] = [];

  for (let i = 0; i < generatedCount; i++) {
    const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const institution = INSTITUTIONS[Math.floor(rng() * INSTITUTIONS.length)];

    // Skewed XP: most 100-1200, tail up to 3000, rounded to 10
    const rawXp = 100 + Math.pow(rng(), 2) * 2900;
    const xp = Math.min(3000, Math.max(100, Math.round(rawXp / 10) * 10));

    // Box-Muller roughly normal return: mean 4, sd 8, clamped -20..+30, 1 decimal
    const u1 = rng() || 0.0001;
    const u2 = rng();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const rawRet = 4 + z0 * 8;
    const clampedRet = Math.min(30, Math.max(-20, rawRet));
    const portfolioReturn = Math.round(clampedRet * 10) / 10;

    const streak = Math.floor(rng() * 31); // 0-30
    const level = getLevelInfo(xp).level;

    generated.push({
      name: `${fn} ${ln}`,
      institution,
      xp,
      portfolioReturn,
      streak,
      level
    });
  }

  return [...existingEntries, ...generated];
};

export const LEADERBOARD_POPULATION: PopulationLearner[] = generatePopulation();
