# Clawdbot

## Project Overview

**Clawdbot** is a personal AI assistant that runs locally on your device. It serves as a central gateway connecting various messaging platforms (WhatsApp, Telegram, Slack, Discord, Signal, etc.) to an AI agent (Claude, OpenAI, etc.).

**Key Features:**
*   **Local-first Gateway:** A WebSocket control plane for sessions, channels, and tools.
*   **Multi-Channel Support:** Unified inbox for WhatsApp, Telegram, Slack, Discord, Signal, iMessage, and more.
*   **Multi-Agent Routing:** Routes messages to isolated agents based on context.
*   **Companion Apps:** Native apps for macOS, iOS, and Android for voice and device control.
*   **Extensible:** Supports plugins and skills.

**Tech Stack:**
*   **Runtime:** Node.js (>=22)
*   **Language:** TypeScript (ES2022 target, NodeNext modules)
*   **Package Manager:** pnpm (>=10.23.0)
*   **Linting/Formatting:** oxlint, oxfmt
*   **Testing:** vitest

## Building and Running

### Prerequisites
*   Node.js >= 22.12.0
*   pnpm >= 10.23.0

### Installation
```bash
# Install dependencies
pnpm install

# Build the project (includes UI build)
pnpm build
```

### Development
```bash
# Start the Gateway in watch mode (auto-reload on changes)
pnpm gateway:watch

# Start the Gateway in dev mode (skips channel connections for faster startup)
pnpm gateway:dev

# Run the CLI
pnpm clawdbot <command>
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run coverage
pnpm test:coverage

# Run End-to-End tests
pnpm test:e2e
```

## Development Conventions

### Code Style
*   **Linting:** The project uses `oxlint`. Run `pnpm lint` to check for issues and `pnpm lint:fix` to fix them.
*   **Formatting:** The project uses `oxfmt`. Run `pnpm format` to check formatting and `pnpm format:fix` to apply it.
*   **Strictness:** TypeScript is configured with `"strict": true` in `tsconfig.json`.

### Contribution Guidelines
*   **AI-Assisted Code:** AI-generated code is welcome but must be marked as such in PRs. Include prompts/logs if possible.
*   **Testing:** Ensure changes are tested locally. Run `pnpm test` before submitting.
*   **Focus:** Keep PRs focused on a single change.
*   **Commit Messages:** Descriptive messages explaining "what" and "why".

## Key Directories
*   `src/`: Main source code.
    *   `src/gateway/`: The core WebSocket control plane.
    *   `src/channels/`: Adapters for various messaging platforms.
    *   `src/agents/`: AI agent logic.
*   `dist/`: Compiled output.
*   `extensions/`: Plugin extensions.
*   `apps/`: Native companion apps (android, ios, macos).
*   `scripts/`: Build and utility scripts.
*   `docs/`: Documentation files.
