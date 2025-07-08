# 08 - TOOLING: Development and Build Toolchain

**The right tools for the job, configured consistently.**

---

## 1. Development Environment

### 1.1. Node.js & Package Manager
- **Node.js:** The project MUST specify a required Node.js version in a `.nvmrc` file to ensure all developers are using the same runtime.
- **Package Manager:** **`yarn`** (version 1.x) is the standard package manager for this project. A `yarn.lock` file MUST be committed to the repository to ensure deterministic dependency installation. Do not use `npm` or `pnpm`.

### 1.2. IDE and Extensions
- **VS Code** is the recommended IDE.
- A `.vscode/extensions.json` file MUST be included in the repository, recommending key extensions for the project, such as:
  - `dbaeumer.vscode-eslint`
  - `esbenp.prettier-vscode`
  - `ms-playwright.playwright`
  - `bradlc.vscode-tailwindcss` (if using Tailwind CSS)
- A `.vscode/settings.json` file should also be included to configure format-on-save for a seamless development experience.

## 2. Build & Bundling

### 2.1. Framework
- **Next.js** is the chosen React framework for its hybrid static/server rendering, file-based routing, and API route capabilities.

### 2.2. Code Transpilation
- Next.js handles transpilation of modern JavaScript and TypeScript via its integrated SWC (Speedy Web Compiler).
- A `tsconfig.json` file MUST be present for TypeScript projects, configured with strict type checking.

## 3. Code Quality & Formatting

### 3.1. Formatting
- **Prettier** is used for all code formatting. The configuration is stored in `.prettierrc` and a `.prettierignore` file should be used to exclude generated files.

### 3.2. Linting
- **ESLint** is used for static analysis of JavaScript/TypeScript code. The configuration is stored in `.eslintrc.js`.

### 3.3. Pre-commit Hooks
- **Husky** and **lint-staged** MUST be used to automate code quality checks before any code is committed.
- The pre-commit hook should:
  1. Run Prettier to format all staged files.
  2. Run ESLint to lint all staged files.
- This prevents improperly formatted or low-quality code from ever entering the codebase.

## 4. AI Agent Tooling

### 4.1. Agent Definitions
- Agent capabilities and instructions are defined in Markdown files within the `.ai_rules/agents/` directory (e.g., `memex_agent.md`, `warp_agent.md`).

### 4.2. Communication Protocol
- Communication between agents is primarily handled via GitHub Issues and Pull Requests, as defined in `00_GLOBAL.md`.

---
**This toolchain is designed to maximize productivity and minimize errors through automation.**
