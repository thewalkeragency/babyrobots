# 05 - SECURITY: Best Practices and Standards

**Security is not an afterthought; it is a foundational requirement.**

---

## 1. Core Security Principles

### 1.1. Never Trust User Input
- All data coming from the client (API request bodies, URL parameters, headers) MUST be treated as untrusted.
- **Validate and Sanitize:**
  - **Validate:** Use Zod schemas (as defined in `03_DATAMODEL.md`) to ensure incoming data conforms to the expected shape and type. Reject any request that fails validation with a `400 Bad Request`.
  - **Sanitize:** Before rendering user-generated content in the HTML, sanitize it to prevent Cross-Site Scripting (XSS) attacks. Use libraries like `dompurify`. Frameworks like React often provide this protection by default, but be vigilant.

### 1.2. Principle of Least Privilege
- Users and processes should only have the minimum level of access (privileges) necessary to perform their function.
- **API Authorization:** Every API endpoint that performs a sensitive action or accesses protected data MUST be protected. Verify the user's identity (authentication) and their permission to perform the action (authorization) on every request.

### 1.3. Secret Management
- **NO SECRETS IN CODE:** Under no circumstances should secrets (API keys, database credentials, JWT secrets) be hard-coded or committed to the repository.
- **Use Environment Variables:** All secrets MUST be loaded from environment variables (`.env` files).
- **`.gitignore`:** The `.env.local` or equivalent file containing actual secrets MUST be listed in `.gitignore`.
- **Secret Vaults:** In production, use a dedicated secret management service (e.g., HashiCorp Vault, AWS Secrets Manager, Doppler).

## 2. Common Vulnerabilities and Defenses

### 2.1. Cross-Site Scripting (XSS)
- **Defense:** Sanitize all user-generated content before it is rendered. Use modern frontend frameworks like React that automatically escape data rendered in JSX. Set appropriate `Content-Security-Policy` (CSP) headers.

### 2.2. SQL Injection (or NoSQL equivalent)
- **Defense:** Use an Object-Relational Mapper (ORM) like Prisma or a query builder that parameterizes queries. Never construct database queries using string concatenation with user input.

### 2.3. Cross-Site Request Forgery (CSRF)
- **Defense:** Use a standard method like anti-CSRF tokens. Frameworks like Next.js may have built-in protections, but they must be correctly configured. For APIs, stateless authentication methods like JWTs (when used correctly) can mitigate this risk.

### 2.4. Insecure Direct Object References (IDOR)
- **Defense:** When a user tries to access a resource (e.g., `/orders/123`), do not just check if they are logged in. You MUST also check that the resource at `id: 123` actually belongs to that specific user.
- **Example Query:** `db.orders.find({ id: orderId, userId: currentUser.id })`

## 3. Dependency Security
- Regularly scan project dependencies for known vulnerabilities using tools like `npm audit`, `yarn audit`, or Snyk.
- Keep dependencies up-to-date to ensure security patches are applied.

---
**A security vulnerability is a critical bug. Treat it with the highest priority.**
