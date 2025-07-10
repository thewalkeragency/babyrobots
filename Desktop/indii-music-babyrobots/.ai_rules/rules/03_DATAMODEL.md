# 03 - DATA MODEL & STATE: Schema, Validation, and Management

**A single source of truth for the shape and flow of data.**

---

## 1. Data Schema & Validation

### 1.1. Centralized Schema Definitions
- All core data structures (e.g., User, Product, Order) MUST have a schema defined in a central location (e.g., `src/models` or `src/schemas`).
- **Zod** is the preferred library for schema definition and validation. It provides a single source of truth for both frontend and backend.

### 1.2. Example Zod Schema
```javascript
// src/schemas/user.js
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  createdAt: z.date(),
});

// Type inference for TypeScript
// export type User = z.infer<typeof UserSchema>;
```

### 1.3. Strict Validation
- **Backend:** All incoming data from API requests (body, params, query) MUST be validated against its Zod schema before processing. If validation fails, return a `400 Bad Request` response with a clear error message.
- **Frontend:** All form inputs should be validated against the same Zod schema before submission to provide instant user feedback and prevent unnecessary API calls.

## 2. State Management

### 2.1. Guiding Principles
- **Minimize Global State:** Keep state as local as possible. Only elevate state to a global store when it is truly shared across many disconnected components.
- **Immutability:** State should be treated as immutable. Never mutate state directly; always create a new state object. This is enforced by libraries like Zustand and Redux Toolkit.

### 2.2. Frontend State (React)
- **UI State:** State that controls the UI (e.g., modal visibility, dropdown open/closed) should be managed within the component using `useState`.
- **Server Cache State:** Data fetched from the server is considered "server cache state." It should be managed by a dedicated library like **React Query** or **SWR**. This handles caching, background updates, and stale-while-revalidate logic automatically.
- **Global Application State:** For state that is truly global (e.g., authenticated user info, theme), use **Zustand**. It's lightweight and has a simple API.

### 2.3. Example Zustand Store
```javascript
// src/stores/userStore.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  logout: () => set({ user: null }),
}));
```

---
**Data is the lifeblood of the application. Treat it with precision and care.**
