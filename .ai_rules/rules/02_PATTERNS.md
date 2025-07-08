# 02 - PATTERNS: Architectural and Design Patterns

**Standardized approaches to common problems for a cohesive and maintainable codebase.**

---

## 1. Application Architecture

### 1.1. Frontend (React/Next.js)
- **Component-Based Architecture:** The UI is built from small, reusable, and independent components.
- **State Management:**
  - For simple, local state, use React's built-in hooks (`useState`, `useReducer`).
  - For complex, global state shared across the application, use a dedicated state management library (e.g., Zustand, Redux Toolkit). Avoid prop-drilling.
- **Data Fetching:**
  - Use a dedicated data-fetching library like React Query or SWR to handle caching, re-fetching, and loading/error states.
  - Centralize API calls in a `src/services` or `src/lib/api` directory.
- **Routing:** Use the file-based routing provided by Next.js.

### 1.2. Backend (Node.js/Express)
- **Layered (or Onion) Architecture:**
  1.  **Routes/Controllers Layer:** Handles incoming HTTP requests, validates input, and calls the appropriate service. It knows nothing about the database.
  2.  **Services Layer:** Contains the core business logic. It orchestrates data from different sources and performs operations. It does not directly interact with the database.
  3.  **Data Access Layer (DAL) / Models:** Responsible for all communication with the database. It abstracts the database logic from the rest of the application.
- **Dependency Injection:** Use a container or a simple pattern to inject dependencies (like database models or services) into higher-level modules. This improves testability.

## 2. Common Design Patterns

### 2.1. API Design
- **RESTful Principles:** Design APIs to be RESTful, using standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) and status codes.
- **Standardized Response Format:** All API responses, whether success or error, MUST follow a consistent JSON structure.
  ```json
  {
    "success": true,
    "data": { ... }, // or [...]
    "message": "Operation successful"
  }
  ```
  ```json
  {
    "success": false,
    "error": {
      "code": "AUTH_ERROR",
      "message": "Invalid credentials"
    }
  }
  ```

### 2.2. Asynchronous Operations
- Use `async/await` for all asynchronous code. Avoid raw Promises (`.then()`, `.catch()`) where possible for better readability.
- Wrap asynchronous operations in `try...catch` blocks for robust error handling.

### 2.3. Configuration Management
- Use environment variables (`.env` files) for all configuration settings (API keys, database URLs, etc.).
- **NEVER** hard-code secrets or configuration values in the source code.
- Provide a `.env.example` file in the repository with placeholder values.

---
**These patterns are not suggestions; they are the blueprint for building the application.**
