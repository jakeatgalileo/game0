import { tool } from 'ai';
import { z } from 'zod';

export const getGameMechanics = tool({
  description:
    'Get detailed gameplay mechanics and core loop information for a specified game.',
  inputSchema: z.object({
    gameName: z
      .string()
      .describe('Name of the game to analyze for mechanics and gameplay'),
  }),
  async execute({ gameName }) {
    if (/flappy\s*bird/i.test(gameName)) {
      return {
        game: 'Flappy Bird',
        summary:
          'Tap to flap and navigate a bird through gaps between vertically aligned pipes. The game emphasizes rhythm, timing, and micro-adjustments to maintain altitude.',
        coreLoop: [
          'Wait for the right moment',
          'Tap to flap and gain altitude',
          'Release to descend under gravity',
          'Pass through pipe gaps to score',
          'Repeat while difficulty ramps via tighter gaps/spacing',
        ],
        mechanics: [
          '1-button input (tap/press) controls vertical velocity',
          'Gravity pulls bird downward; flap adds an upward impulse',
          'Horizontal auto-scroll creates constant forward motion',
          'Collision with pipes or ground ends the run',
        ],
        scoring: 'Gain +1 per set of pipes cleared. The goal is a high score.',
        difficultyCurve:
          'Consistent speed with tight gaps; tension comes from precision and lack of recovery time.',
        references: [
          'https://en.wikipedia.org/wiki/Flappy_Bird',
        ],
      } as const;
    }
    return {
      game: gameName,
      summary:
        'Game mechanics data not available for this title.',
    } as const;
  },
});

export const getGameVisualStyle = tool({
  description:
    'Get visual design information including color palette, art style, and UI layout for a specified game.',
  inputSchema: z.object({
    gameName: z
      .string()
      .describe('Name of the game to analyze for visual design'),
    styleHint: z
      .string()
      .optional()
      .describe('Optional art direction hint, e.g. "retro-pixel" or "flat-minimal"'),
  }),
  async execute({ gameName, styleHint }) {
    if (/flappy\s*bird/i.test(gameName)) {
      return {
        game: 'Flappy Bird',
        palette: ['sky-blue', 'lime-green', 'gold', 'white', 'black'],
        background: 'Parallax sky with subtle clouds; ground with repeating tile.',
        sprites: {
          bird:
            'Small, cartoony bird with 2–3 frame wing flaps; circular eye with high-contrast outline.',
          pipes:
            'Bright green cylindrical pipes with top lip highlight; paired top/bottom with a gap.',
        },
        ui: {
          score: 'Centered numeric score at the top in bold pixel or rounded font.',
          start: 'Tap prompt overlay; fades on first input.',
          gameOver:
            'Centered banner with score and best; restart prompt below.',
        },
        motion:
          'Constant horizontal scroll; bird bobbing; pipe pairs spawn at intervals; subtle ground loop.',
        styleHint: styleHint ?? null,
      } as const;
    }
    return {
      game: gameName,
      note:
        'Visual design data not available for this title.',
      styleHint: styleHint ?? null,
    } as const;
  },
});

// Export as a tool set for easy inclusion in generateText/streamText calls.
export const gameDescriptionsTools = {
  getGameMechanics,
  getGameVisualStyle,
};
