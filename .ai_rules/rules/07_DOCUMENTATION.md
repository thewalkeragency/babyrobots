# 07 - DOCUMENTATION: Standards and Practices

**Code tells you how, documentation tells you why.**

---

## 1. Documentation Philosophy

### 1.1. Documentation as a Deliverable
- Documentation is not an optional extra; it is a required part of any feature or task.
- Pull Requests with new features or significant changes will not be merged without corresponding documentation updates.

### 1.2. Audience-First Approach
- Always consider the audience for the documentation you are writing.
  - **For Developers:** In-code comments, API docs, architectural diagrams.
  - **For Future You:** Clear commit messages, PR descriptions.
  - **For Non-technical Stakeholders:** High-level PRDs, project README.

## 2. Types of Documentation

### 2.1. In-Code Documentation
- **JSDoc for Public APIs:** All exported functions, classes, and modules MUST have a JSDoc comment block explaining their purpose, parameters, and return values.
- **Comments for Complex Logic:** Any code that is complex, non-obvious, or contains a "hack" or workaround MUST be explained with a comment. Explain the *why*, not the *what*.
  - **Bad:** `// Increment i`
  - **Good:** `// We increment here because the external API is off-by-one.`

### 2.2. `README.md`
- Every project MUST have a `README.md` file in the root directory.
- The README should contain:
  - Project title and a brief description.
  - How to get the project running locally (setup, installation, environment variables).
  - How to run tests.
  - A brief overview of the project's architecture.
  - A link to the production deployment.

### 2.3. `docs/` Directory
- The `docs/` directory is for long-form documentation.
- **`docs/prd/`:** Contains Product Requirements Documents for major features.
- **`docs/architecture/`:** Contains architectural decision records (ADRs), diagrams, and explanations of high-level design choices.
- **`docs/api/`:** Auto-generated or manually written documentation for the project's API endpoints.

### 2.4. Commit Messages and Pull Requests
- **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
  - **Format:** `feat: add user login endpoint` or `fix: correct validation logic for emails`
  - This allows for automated changelog generation.
- **Pull Request Descriptions:** The PR description should clearly explain:
  - **What:** A summary of the changes.
  - **Why:** The reason for the change (e.g., "Fixes #123").
  - **How:** A brief explanation of the implementation approach.
  - Include screenshots or GIFs for UI changes.

---
**Good documentation is a gift to your future self and your teammates.**
