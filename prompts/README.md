# Game Generator Prompts

This directory contains the system prompts used by the game generator application.

## Prompt Files

### `game-planning.txt`
Used by `/api/chat` endpoint for the game planning phase. This prompt guides the AI to act as a game design consultant, helping users plan and refine their game ideas before implementation.

### `code-generation.txt`
Used by `/api/generate-code` endpoint for the code generation phase. This prompt instructs the AI to generate complete, working HTML games based on the conversation from the planning phase.

## Usage

Prompts are automatically loaded by the API routes using the `lib/prompts.ts` utility. In development mode, changes to prompt files will be reflected on the next API call (no server restart required).

## Editing Prompts

When editing prompts:
1. Keep the tone and structure consistent
2. Test thoroughly with different game types
3. Ensure prompts are clear and specific about expected output formats
4. Consider both simple and complex game scenarios

## Format Guidelines

- Use clear, numbered instructions when possible
- Include specific examples for complex requirements
- End with a clear directive about what to do next
- Keep language conversational but precise