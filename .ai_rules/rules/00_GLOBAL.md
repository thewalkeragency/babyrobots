# 00 - GLOBAL: Core Principles & Project-Wide Standards

**The Unchanging Foundation for All Agents and Processes**

---

## 1. Core Principles

### 1.1. PRD -> Task -> Sub-task -> Prompt Hierarchy
All work MUST follow a strict hierarchical breakdown:
1.  **Product Requirements Document (PRD):** A high-level document outlining the project's vision, goals, target users, and major features. *Memex is the primary owner.*
2.  **Task:** A major functional component derived from the PRD (e.g., "User Authentication System," "Product Display Page"). *Memex breaks the PRD into Tasks.*
3.  **Sub-task:** A specific, actionable unit of work within a Task (e.g., "Build the login API endpoint," "Create the product card component"). *Memex or a specialized agent can break Tasks into Sub-tasks.*
4.  **Prompt:** A precise, single-focus instruction to an AI agent to execute a Sub-task. It contains all necessary context, file paths, and expected output. *This is the level at which agents like Warp and Jules operate.*

### 1.2. Source of Truth: GitHub
- The `main` branch of the GitHub repository is the absolute source of truth.
- All significant changes MUST be captured in a Pull Request (PR).
- No direct pushes to `main` are permitted.

### 1.3. AI Agent Responsibilities
- **Memex (Architect):** High-level design, project scaffolding, task breakdown (PRD -> Task), and coordination.
- **Warp 2.0 (Engineer):** Detailed code implementation, refactoring, and optimization based on specific prompts.
- **Google Jules (Automation Specialist):** Background tasks like testing, documentation generation, and dependency management.
- **Gemini CLI (Prototyper/Specialist):** Rapid prototyping, specialized code generation, and complex algorithm implementation.

### 1.4. Automatic Scaffolding Protocol
- When a new feature or module is initiated, Memex MUST first generate a complete file and directory scaffold.
- The scaffold should include empty files with clear names (e.g., `userController.js`, `authService.js`, `userRoutes.js`).
- Boilerplate code (imports, function signatures, `TODO:` comments) should be added.
- **No detailed implementation should occur until the scaffold is reviewed and approved.**

## 2. Communication & Handoffs

### 2.1. GitHub Issues as the Primary Communication Channel
- A new Task or a significant bug fix starts with a GitHub Issue.
- The issue description MUST clearly define the "what" and the "why."
- Agents are assigned to issues (e.g., `@WarpAgent`, `@JulesAI`).
- All conversation related to a task happens within that issue's thread.

### 2.2. Standardized Handoff Prompts
- When Memex hands off to another agent, the prompt MUST be clear and concise.
- **Format:** `Agent: [Action]. [Context]. [Expected Outcome].`
- **Example:** `Warp: Implement the API endpoint defined in `src/routes/user.js`. Use the data model from `src/models/user.js`. The endpoint should return a JWT upon successful login.`

## 3. Code & Directory Structure

### 3.1. Consistent Naming Conventions
- **Directories:** `lower-case-kebab` (e.g., `src/api-routes`).
- **Files:** `camelCase` or `PascalCase` depending on the language convention (e.g., `userController.js`, `ProductCard.jsx`).
- **Variables/Functions:** `camelCase`.
- **Classes/Components:** `PascalCase`.

### 3.2. Standard Project Layout
- **`.ai_rules/`:** Contains all rules and agent definitions.
- **`docs/`:** Project documentation, including PRDs and architectural diagrams.
- **`src/`:** All source code.
  - **`src/api/` or `src/pages/api`:** Server-side routes/endpoints.
  - **`src/components/`:** Reusable UI components.
  - **`src/lib/` or `src/utils/`:** Shared helper functions, constants.
  - **`src/services/`:** Business logic, external API clients.
- **`tests/`:** All automated tests.
  - **`tests/unit/`:** Unit tests.
  - **`tests/integration/`:** Integration tests.
  - **`tests/e2e/`:** End-to-end tests.

---
**This document is the highest authority. In cases of conflict with other rules, this one prevails.**
