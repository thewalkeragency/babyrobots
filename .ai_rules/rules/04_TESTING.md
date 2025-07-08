# 04 - TESTING: Strategy and Standards

**If it's not tested, it's broken.**

---

## 1. Testing Philosophy

### 1.1. The Testing Pyramid
We adhere to the testing pyramid model:
1.  **Unit Tests (Most Numerous):** Test individual functions, components, or classes in isolation. They are fast and cheap to write.
2.  **Integration Tests:** Test how multiple units work together (e.g., a service and a database model, a component and a state store).
3.  **End-to-End (E2E) Tests (Fewest):** Test the entire application flow from the user's perspective, simulating real user interactions in a browser. They are slow and expensive but provide the highest confidence.

### 1.2. Coverage Requirements
- A minimum of **80% test coverage** is required for all new code before a PR can be merged.
- Coverage reports will be automatically generated and checked in the CI/CD pipeline.
- Focus on testing logic, not just lines of code.

## 2. Tooling

### 2.1. Unit & Integration Testing
- **Jest** is the primary testing framework.
- **React Testing Library** is used for testing React components, encouraging tests that resemble how users interact with the UI.
- **Mock Service Worker (MSW)** is used to mock API requests in tests, ensuring frontend tests can run without a live backend.

### 2.2. End-to-End (E2E) Testing
- **Playwright** is the framework for E2E tests. It allows for reliable testing across different browsers.
- E2E tests should cover critical user paths:
  - User registration and login
  - Core feature workflows (e.g., creating a product, completing a purchase)
  - Form submissions

## 3. Writing Good Tests

### 3.1. The AAA Pattern
Structure all tests using the Arrange, Act, Assert (AAA) pattern:
1.  **Arrange:** Set up the test environment, including any necessary data, mocks, or component rendering.
2.  **Act:** Execute the function or perform the user interaction you are testing.
3.  **Assert:** Check that the outcome is what you expected.

### 3.2. Test Naming
- Test descriptions should be clear and descriptive, explaining what is being tested and what the expected outcome is.
- **Format:** `it('should [do something] when [in some state or condition]')`
- **Example:** `it('should disable the submit button when the email is invalid')`

### 3.3. Test Location
- Unit and integration tests for a specific file should be located in a `__tests__` subdirectory next to the file or have a `.test.js` (or `.spec.js`) extension.
- E2E tests reside in the top-level `tests/e2e/` directory.

---
**Automated tests are a critical part of the development process and are not optional.**
