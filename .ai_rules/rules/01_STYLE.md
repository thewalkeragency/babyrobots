# 01 - STYLE: Code Style, Formatting, and Linting

**Consistency is key. All code must adhere to these style guidelines.**

---

## 1. Universal Style Principles

### 1.1. Automated Formatting is Mandatory
- All code MUST be formatted automatically before commit.
- **Prettier** is the default formatter for this project. A `.prettierrc` file MUST exist in the root.
- The configuration should enforce:
  - `tabWidth: 2`
  - `semi: true`
  - `singleQuote: true`
  - `trailingComma: 'es5'`

### 1.2. Linting for Code Quality
- **ESLint** (for JavaScript/TypeScript) or a language-equivalent linter MUST be used.
- A `.eslintrc.js` (or similar) configuration file must exist in the root.
- Linting rules should be configured to catch common errors and enforce best practices (e.g., no-unused-vars, no-console).
- Custom project-specific linting rules should be added as needed.

## 2. JavaScript/TypeScript Specific

### 2.1. Imports
- Use ES6 `import`/`export` syntax.
- Imports should be grouped and ordered:
  1. React/Framework imports
  2. External library imports
  3. Internal absolute path imports (`@/components/...`)
  4. Internal relative path imports (`../`)
- Alphabetize imports within each group.

### 2.2. Comments
- Use `//` for single-line comments.
- Use `/** ... */` for multi-line JSDoc-style comments for functions, classes, and complex logic blocks.
- **All public functions and classes MUST have a JSDoc block** explaining their purpose, parameters, and return value.
- Use `TODO:` comments to mark areas that need future work, including a brief description of what's needed.

## 3. HTML/CSS Specific

### 3.1. CSS
- Prefer utility-first CSS (like Tailwind CSS) over custom CSS-in-JS or stylesheets when possible.
- If writing custom CSS, use BEM (Block, Element, Modifier) naming conventions.
- Keep CSS selectors as specific as necessary, but no more.

## 4. Markdown Specific

### 4.1. Formatting
- Use Prettier to format Markdown files (`.md`).
- Use headings (`#`, `##`, etc.) to structure documents.
- Use bullet points (`-` or `*`) for lists.
- Use backticks (`` ` ``) for inline code and code blocks (```) for multi-line code snippets.

---
**Adherence to these style rules is enforced by automated pre-commit hooks.**
