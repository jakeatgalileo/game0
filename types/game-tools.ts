import type { ToolUIPart } from 'ai';

// Input types for game description tools
export type GameMechanicsInput = {
  gameName: string;
};

export type GameVisualStyleInput = {
  gameName: string;
  styleHint?: string;
};

// Output types for game description tools
export type GameMechanicsOutput = {
  game: string;
  summary: string;
  coreLoop: string[];
  mechanics: string[];
  scoring: string;
  difficultyCurve: string;
  references: string[];
};

export type GameVisualStyleOutput = {
  game: string;
  palette: string[];
  background: string;
  sprites: {
    bird: string;
    pipes: string;
  };
  ui: {
    score: string;
    start: string;
    gameOver: string;
  };
  motion: string;
  styleHint: string | null;
} | {
  game: string;
  note: string;
  styleHint: string | null;
};

// Tool UI Part types for rendering with the Tool component
export type GameMechanicsToolUIPart = ToolUIPart<{
  getGameMechanics: {
    input: GameMechanicsInput;
    output: GameMechanicsOutput;
  };
}>;

export type GameVisualStyleToolUIPart = ToolUIPart<{
  getGameVisualStyle: {
    input: GameVisualStyleInput;
    output: GameVisualStyleOutput;
  };
}>;

// Union type for all game tool UI parts
export type GameToolUIPart = GameMechanicsToolUIPart | GameVisualStyleToolUIPart;