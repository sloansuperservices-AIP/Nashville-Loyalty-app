import React from 'react';
import { Card as CardType, Suit } from '../types';

interface CardProps {
  card?: CardType;
}

const suitSymbols: { [key in Suit]: string } = {
  [Suit.Hearts]: '♥',
  [Suit.Diamonds]: '♦',
  [Suit.Clubs]: '♣',
  [Suit.Spades]: '♠',
};

const suitColors: { [key in Suit]: string } = {
  [Suit.Hearts]: 'text-red-500',
  [Suit.Diamonds]: 'text-red-500',
  [Suit.Clubs]: 'text-slate-800',
  [Suit.Spades]: 'text-slate-800',
};

export const PlayingCard: React.FC<CardProps> = ({ card }) => {
  if (!card) {
    return (
      <div className="aspect-[2.5/3.5] w-full rounded-lg bg-slate-700/50 border-2 border-dashed border-slate-600 flex items-center justify-center">
        <span className="text-slate-500 text-lg">+</span>
      </div>
    );
  }

  const { suit, rank } = card;

  return (
    <div className="aspect-[2.5/3.5] w-full bg-white rounded-lg shadow-lg p-2 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <div className={`text-left ${suitColors[suit]}`}>
        <p className="font-bold text-xl leading-none">{rank}</p>
        <p className="text-lg leading-none">{suitSymbols[suit]}</p>
      </div>
      <div className={`text-center text-4xl font-bold ${suitColors[suit]}`}>
        {suitSymbols[suit]}
      </div>
      <div className={`text-right transform rotate-180 ${suitColors[suit]}`}>
        <p className="font-bold text-xl leading-none">{rank}</p>
        <p className="text-lg leading-none">{suitSymbols[suit]}</p>
      </div>
    </div>
  );
};
