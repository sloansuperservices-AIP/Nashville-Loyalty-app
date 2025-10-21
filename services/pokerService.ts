import { Card, Suit, Rank, HandStrength } from '../types';

const SUITS: Suit[] = [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: { [key in Rank]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export const createDeck = (): Card[] => {
  return SUITS.flatMap(suit =>
    RANKS.map(rank => ({
      suit,
      rank,
      value: RANK_VALUES[rank]
    }))
  );
};

export const shuffleDeck = <T,>(deck: T[]): T[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const HAND_STRENGTHS: { [key: string]: HandStrength } = {
  ROYAL_FLUSH: { name: 'Royal Flush', value: 10 },
  STRAIGHT_FLUSH: { name: 'Straight Flush', value: 9 },
  FOUR_OF_A_KIND: { name: 'Four of a Kind', value: 8 },
  FULL_HOUSE: { name: 'Full House', value: 7 },
  FLUSH: { name: 'Flush', value: 6 },
  STRAIGHT: { name: 'Straight', value: 5 },
  THREE_OF_A_KIND: { name: 'Three of a Kind', value: 4 },
  TWO_PAIR: { name: 'Two Pair', value: 3 },
  ONE_PAIR: { name: 'One Pair', value: 2 },
  HIGH_CARD: { name: 'High Card', value: 1 },
};


export const evaluateHand = (hand: Card[]): HandStrength => {
  if (hand.length !== 5) return { name: 'Invalid Hand', value: 0 };

  const sortedHand = [...hand].sort((a, b) => a.value - b.value);
  const ranks = sortedHand.map(c => c.rank);
  const values = sortedHand.map(c => c.value);
  const suits = sortedHand.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = values.every((v, i) => i === 0 || v === values[i - 1] + 1) ||
    (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14); // Ace-low straight

  if (isStraight && isFlush && values[4] === 14 && values[0] === 10) {
    return HAND_STRENGTHS.ROYAL_FLUSH;
  }
  if (isStraight && isFlush) {
    return HAND_STRENGTHS.STRAIGHT_FLUSH;
  }

  // Fix: Corrected the type of the accumulator to resolve type errors.
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (counts[0] === 4) return HAND_STRENGTHS.FOUR_OF_A_KIND;
  if (counts[0] === 3 && counts[1] === 2) return HAND_STRENGTHS.FULL_HOUSE;
  if (isFlush) return HAND_STRENGTHS.FLUSH;
  if (isStraight) return HAND_STRENGTHS.STRAIGHT;
  if (counts[0] === 3) return HAND_STRENGTHS.THREE_OF_A_KIND;
  if (counts[0] === 2 && counts[1] === 2) return HAND_STRENGTHS.TWO_PAIR;
  if (counts[0] === 2) return HAND_STRENGTHS.ONE_PAIR;

  return HAND_STRENGTHS.HIGH_CARD;
};