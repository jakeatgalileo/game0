import { tool } from 'ai';
import { z } from 'zod';

export const getGameMechanics = tool({
  description:
    'Return Flappy-like mechanics with hard invariants: (1) Start in idle hover mid-screen; wait for first input (Space/click/tap). (2) On first input, apply a small upward impulse and begin constant horizontal scroll; later inputs are flaps that counter gravity briefly. (3) Spawn paired vertical pipes with a small gap; randomize vertical offset; fixed horizontal spacing; +1 score per pipe pair passed. (4) Collision with any pipe or ground ends the run and surfaces restart. Populate only the typed fields.',
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
          'Idle bird hovers until first input; first flap starts scroll. Tap to flap against gravity and thread pipe gaps.',
        coreLoop: [
          'Idle hover waiting for first input',
          'Tap/press to flap upward; release to fall',
          'Maintain altitude to pass through pipe gaps',
          'Score +1 per pipe pair passed; continue until collision',
        ],
        mechanics: [
          'Single-button flap adds upward impulse; gravity pulls down',
          'World scrolls horizontally at constant speed after first input',
          'Pipe pairs spawn at intervals with small randomized gap offset',
          'Collision with pipe or ground ends the run; restart available',
        ],
        scoring: '+1 per pipe pair passed; goal is highest score.',
        difficultyCurve:
          'Constant speed with tight gaps; tension from precision and lack of recovery.',
        references: [],
      } as const;
    }
    return {
      game: gameName,
      summary: 'Game mechanics data not available for this title.',
    } as const;
  },
});

export const getGameVisualStyle = tool({
  description:
    'Describe visuals. For Flappy-like: anchor to the latest reference screenshot in this conversation—glossy lime-green pipes with top-lip highlight, cyan/sky-blue sky with subtle clouds, looping ground stripe, small yellow bird with white belly, red beak, black outline, bold centered white score. If no screenshot is available, approximate this style. Output only the typed fields; no links.',
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
        background: 'Sky-blue with soft clouds; parallax feel; ground uses a repeating tile stripe.',
        sprites: {
          bird:
            'Small yellow bird, white belly, red beak, black outline; 2–3 frame wing flap.',
          pipes:
            'Glossy lime-green cylindrical pipes with darker rim and top-lip highlight; paired top/bottom with a tight gap.',
        },
        ui: {
          score: 'Centered white numeric score at top in bold, high-contrast font.',
          start: 'Subtle “Press Space / Tap to flap” text during idle.',
          gameOver:
            'Centered banner with score and best; restart prompt below.',
        },
        motion:
          'Constant horizontal scroll; bird bobbing idle; pipe pairs spawn at fixed intervals with vertical offset; looping ground.',
        styleHint: styleHint ?? null,
      } as const;
    }
    return {
      game: gameName,
      note: 'Visual design data not available for this title.',
      styleHint: styleHint ?? null,
    } as const;
  },
});

// Export as a tool set for easy inclusion in generateText/streamText calls.
export const gameDescriptionsTools = {
  getGameMechanics,
  getGameVisualStyle,
};
