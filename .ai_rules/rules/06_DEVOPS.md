# 06 - DEVOPS: CI/CD, Environments, and Deployment

**Automating the path from code to production.**

---

## 1. Environments

### 1.1. Standard Environments
- **`development`:** Your local machine. Runs against local services or mocked data.
- **`preview` (or `staging`):** A production-like environment. Every Pull Request is automatically deployed to a unique preview URL for review. Connects to a staging database.
- **`production`:** The live application serving real users.

### 1.2. Environment Variables
- Each environment MUST have its own configuration and secrets, managed via environment variables.
- A `.env.example` file MUST be maintained in the repository to show what variables are required.
- Production secrets are managed via a secure vault (e.g., Vercel Environment Variables, AWS Secrets Manager).

## 2. Continuous Integration (CI)

### 2.1. CI Pipeline (GitHub Actions)
- A CI pipeline MUST be configured using GitHub Actions (`.github/workflows/ci.yml`).
- The pipeline is triggered on every `push` to any branch and on every `pull_request` to `main`.

### 2.2. CI Workflow Steps
The pipeline MUST perform the following checks in order:
1.  **Install Dependencies:** `npm install` or `yarn install`.
2.  **Lint:** Run the linter (`npm run lint`) to check for code quality issues.
3.  **Format Check:** Run the formatter (`npm run format:check`) to ensure code style is consistent.
4.  **Run Tests:** Execute all unit and integration tests (`npm test`). This includes checking for test coverage.
5.  **Build:** Create a production build of the application (`npm run build`).

- **A Pull Request cannot be merged if any of these steps fail.**

## 3. Continuous Deployment (CD)

### 3.1. Preview Deployments
- Every Pull Request opened against the `main` branch automatically triggers a deployment to a unique, shareable preview URL (e.g., using Vercel or Netlify).
- This allows for thorough review of changes in a live, production-like environment before merging.

### 3.2. Production Deployment
- Merging a Pull Request to the `main` branch automatically triggers a deployment to the production environment.
- The deployment process should be zero-downtime.
- Rollbacks should be possible with a single click or command.

## 4. Logging and Monitoring

### 4.1. Logging
- All services should produce structured logs (JSON format).
- Logs should be sent to a centralized logging service (e.g., Sentry, Logtail, Datadog) in production.
- Do NOT log sensitive information (passwords, API keys, PII).

### 4.2. Monitoring & Alerting
- The production environment MUST be monitored for uptime, performance (response times, error rates), and resource utilization.
- An alerting system (e.g., Sentry, PagerDuty) MUST be configured to notify the team of critical issues, such as a spike in errors or application downtime.

---
**The goal is to make deployments boring, predictable, and frequent.**
