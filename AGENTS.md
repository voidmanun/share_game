# Agent Instructions for `share_game`

This document contains rules and guidelines for AI agents working in this repository. Always review these guidelines before making modifications to the codebase.

## 1. Build, Lint, and Test Commands

### Build & Run
- **Compile and Build:** `npm run build`
  - Runs `tsc` for type checking and `vite build` for bundling. This generates the production assets in the `dist/` directory.
- **Development Server:** `npm run dev`
  - Starts the Vite development server on port 5173. Note that `vite.config.ts` contains custom middleware for a local SQLite leaderboard API (`/api/leaderboard`), allowing for rapid prototyping without a separate backend server.

### Linting & Type Checking
- **Type Checking:** `npx tsc --noEmit`
  - The project enforces strict TypeScript (`"strict": true` in `tsconfig.json`). Ensure no type errors remain before completing a task. Since `noEmit` is on, this will only verify types without generating JS files.
- **Linting:** There is no dedicated ESLint configuration. Rely on TypeScript's strict mode and the `tsc` compiler checks. The `tsconfig.json` enforces rules like `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`. If you add new code, make sure it passes these built-in TS compiler checks to maintain code cleanliness.

### Testing
- **Run All Tests:** Currently, there is no formal testing framework (e.g., Jest, Vitest, Mocha) installed in this repository.
- **Run a Single Test:** If tests are added in the future, use the standard command for the chosen framework (e.g., `npx vitest run src/path/to/test.ts`).
- **Manual Verification:** For now, test game logic manually by running the development server (`npm run dev`) and verifying behavior in the browser. You can also write isolated Node scripts to test utility functions (e.g., `node test_script.js`), but make sure they handle ES Modules correctly. When making UI or gameplay changes, playtest the specific mechanics to ensure they feel correct and do not introduce visual glitches.

---

## 2. Code Style Guidelines

### 2.1. Imports and Exports
- Use **ES modules** (`import`/`export`).
- `verbatimModuleSyntax` is enabled in `tsconfig.json`. Use the `type` modifier for type-only imports to ensure they are erased during compilation (e.g., `import type { Entity } from './Entity.ts'`).
- Group imports:
  1. Third-party packages (e.g., `vite`, `sqlite3`).
  2. Relative imports for internal modules (`../weapons/Weapon.ts`, `./Player.ts`).
- Remove unused imports immediately, as `tsconfig.json` enforces `noUnusedLocals` and `noUnusedParameters`.

### 2.2. TypeScript Specifics (`erasableSyntaxOnly`)
- **CRITICAL:** `erasableSyntaxOnly` is enabled in `tsconfig.json`. This means you **MUST NOT** use TypeScript features that emit JavaScript code.
  - **Forbidden:** `enum`, `namespace`, class parameter properties (e.g., `constructor(public x: number)`).
  - **Allowed:** Use union types (`type Direction = 'UP' | 'DOWN'`) or plain JavaScript objects instead of enums. Explicitly declare class properties and assign them in the constructor.
- Avoid using `any` unless absolutely necessary. Use `unknown` and type narrowing instead.
- Define explicit return types for complex or exported functions.
- Prefer `interface` over `type` for object definitions, unless union or intersection types are required.

### 2.3. Formatting
- Use standard spacing: 2 spaces per indentation level.
- Use single quotes for strings (`'...'`), except where double quotes are necessary (e.g., HTML strings, JSON).
- Follow the existing file's convention for semicolons (generally omitted or used sparingly, match the surrounding code).
- Keep line lengths reasonable (around 80-100 characters).

### 2.4. Naming Conventions
- **Classes/Interfaces:** PascalCase (e.g., `MagicWand`, `EntityProps`). Do not prefix interfaces with `I`.
- **Files:**
  - PascalCase for class files (e.g., `TitanEnemy.ts`, `Shotgun.ts`).
  - camelCase or lowercase for utility/entry files (e.g., `main.ts`, `style.css`).
- **Variables & Functions:** camelCase (e.g., `healthPickup`, `calculateDamage()`).
- **Constants:** UPPER_SNAKE_CASE for global constants or configuration values (e.g., `MAX_HEALTH`, `BASE_SPEED`).

### 2.5. Error Handling
- Use `try...catch` blocks for asynchronous operations, file I/O, or operations that can throw (e.g., JSON parsing).
- Fail gracefully in UI and game loop code to prevent crashing the entire game.
- Use descriptive error messages and log them using `console.error()` for debugging.
- Backend API (`vite.config.ts`) should return appropriate HTTP status codes (400, 500) and JSON error objects for failures.

### 2.6. Architecture and Structure
- **Entities:** Game objects (enemies, pets, pickups) belong in `src/entities/` and should extend a base `Entity` class.
- **Weapons:** Weapon classes belong in `src/weapons/` and extend a base `Weapon` class.
- **Systems/Managers:** Core game systems (e.g., `Input`, `SoundManager`) belong in `src/systems/`.
- **Game State:** Central logic should be orchestrated through `Game.ts` or `main.ts`. Avoid polluting the global scope.

### 2.7. Performance and Game Loop
- **Garbage Collection:** Avoid instantiating new objects (e.g., `new Vector()`, arrays, object literals) inside hot code paths like the main `update()` or `draw()` loops. Reuse objects or use object pools to prevent garbage collection stutters.
- Keep rendering logic (`draw()`) strictly separate from state updates (`update()`).
- Rely on `requestAnimationFrame` for the game loop (handled in `main.ts` or `Game.ts`).
- Remove dead entities efficiently (e.g., flag them as dead and filter them out at the end of the frame).

### 2.8. UI and Styling
- UI logic should ideally be separated from game logic. Check `src/ui/` or `src/leaderboard.ts` for existing patterns.
- Modify `src/style.css` for structural layout and simple styling.
- Render dynamic UI elements either via the Canvas API (for in-game text/healthbars) or by manipulating the DOM (for menus/overlays). Use the method that matches existing features.

### 2.9. State Management and Globals
- Avoid using global variables for game state. Manage state within the `Game` class or specific state manager modules.
- Pass references (e.g., to the `Game` instance or `Player` instance) down to child entities if they need access to global state.
- For purely UI or out-of-game state (e.g., menus, shop), keep it isolated from the core game loop to prevent logic leaks and unintended side effects.

### 2.10. Canvas and Rendering
- The game primarily renders via the HTML5 `<canvas>` API (`CanvasRenderingContext2D`).
- Batch render operations where possible (e.g., using a single `beginPath()`, `moveTo()`, `lineTo()`, `stroke()` sequence for multiple similar lines instead of calling `stroke()` for each line) to minimize overhead.
- Save and restore the context (`ctx.save()`, `ctx.restore()`) frequently when applying transformations (rotations, translations) or changing styles, to prevent them from bleeding into the next render call.
- Pre-render complex static sprites or text onto an off-screen canvas if they are expensive to draw dynamically every frame.

---

## 3. Git and Commit Guidelines
- Always ensure `npm run build` succeeds locally without TypeScript errors before committing.
- **Commit Messages:** Use descriptive and concise commit messages. Provide a brief explanation of *why* the change was made, not just *what* changed.
- If introducing a new entity, weapon, or system, briefly explain its purpose and how it integrates into the main loop in the PR or commit body.
- When applying fixes, mention the issue or bug being addressed and the file(s) modified.
- **Avoid Large Monolithic Commits:** Break down features into smaller, logical commits (e.g., one commit for the entity logic, another for its integration, another for the UI).
