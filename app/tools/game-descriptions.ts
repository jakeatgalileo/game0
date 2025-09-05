import { tool } from 'ai';
import { z } from 'zod';

/* 
Ideally, we have a bank of existing games or jdo a web-search for existing games.

TODO: need a game asset library.
*/

// Tool: Get a deeper, gameplay-focused description of a game.
// For now this is stubbed with hard-coded data for Flappy Bird.
export const getGameDescription = tool({
  description:
    'Get an extended description of a known game, including core loop and mechanics.',
  inputSchema: z.object({
    gameName: z
      .string()
      .describe('Name of the game to describe, e.g. "Flappy Bird"'),
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
    // Stub fallback for non-Flappy Bird requests
    return {
      game: gameName,
      summary:
        'No details available in this stub. Only "Flappy Bird" is supported for now.',
    } as const;
  },
});

// Tool: Describe the visual style, palette, and UI elements of a game.
// For now this is stubbed with hard-coded data for Flappy Bird.
export const getGameVisuals = tool({
  description:
    'Describe the visual presentation of a game: palette, sprites, background, and screen layout.',
  inputSchema: z.object({
    gameName: z
      .string()
      .describe('Name of the game, e.g. "Flappy Bird"'),
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
    // Stub fallback for non-Flappy Bird requests
    return {
      game: gameName,
      note:
        'No visual details available in this stub. Only "Flappy Bird" is supported for now.',
      styleHint: styleHint ?? null,
    } as const;
  },
});

// Export as a tool set for easy inclusion in generateText/streamText calls.
export const gameDescriptionsTools = {
  getGameDescription,
  getGameVisuals,
};
