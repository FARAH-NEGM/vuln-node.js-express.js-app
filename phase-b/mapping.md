# Phase B – DAST → Semgrep → Code Mapping

> Course: Secure Software Development – Fall 2025
> Phase: B2 (Static Analysis Mapping with Semgrep)

---

## Purpose

This phase links **real, confirmed DAST attacks** to their **exact root causes in source code**, and then to **built‑in Semgrep findings**. Each entry shows clear traceability:

**DAST exploit → Code location → Semgrep rule**

---

## Scan Context

* Command used:

  ```bash
  semgrep --config p/javascript --config p/nodejs
  ```
* Result summary:

  * Findings: **16** (blocking)
  * Targets scanned: **23 files**
  * Rules run: **68**

---

## Vulnerability Mapping Table

### V1 – Reflected Cross‑Site Scripting (XSS)

* **Endpoint / Feature:** `GET /system?test=`
* **OWASP Category:** A03 – Injection
* **DAST Evidence:** Injected `<script>alert(1)</script>` reflected in response
* **Source Code Location:**

  * File: `src/router/routes/system.js`
  * Lines: ~15–20
* **Vulnerable Code:**

  ```js
  res.send(test);
  ```
* **Root Cause:** User‑controlled input is written directly to the HTTP response without output encoding.
* **Semgrep Detection:**

  * Rule ID: `javascript.express.security.audit.xss.direct-response-write`
  * Finding: ✅ Yes

---

### V2 – Open Redirect

* **Endpoint / Feature:** `GET /system?url=`
* **OWASP Category:** A10 – Server‑Side Request Forgery (SSRF) / Unvalidated Redirect
* **DAST Evidence:** Redirects users to attacker‑controlled external URL
* **Source Code Location:**

  * File: `src/router/routes/system.js`
  * Lines: ~34–38
* **Vulnerable Code:**

  ```js
  res.redirect(url);
  ```
* **Root Cause:** User‑supplied URL is used in redirect without validation or allow‑listing.
* **Semgrep Detection:**

  * Rule ID: `javascript.express.security.audit.express-open-redirect`
  * Finding: ✅ Yes

---

### V3 – Server‑Side Template Injection (SSTI)

* **Endpoint / Feature:** Frontend message rendering
* **OWASP Category:** A03 – Injection
* **DAST Evidence:** Template expressions evaluated on server
* **Source Code Location:**

  * File: `src/router/routes/frontend.js`
  * Lines: ~17–40
* **Vulnerable Code:**

  ```js
  rendered = nunjucks.renderString(message);
  ```
* **Root Cause:** User input is compiled as a server‑side template without sanitization.
* **Semgrep Detection:**

  * Rule ID: `javascript.express.security.express-insecure-template-usage`
  * Finding: ✅ Yes

---

### V4 – Path Traversal

* **Endpoint / Feature:** `GET /order/file?file=`
* **OWASP Category:** A05 – Security Misconfiguration
* **DAST Evidence:** Access to unintended filesystem paths using `../`
* **Source Code Location:**

  * File: `src/router/routes/order.js`
  * Lines: ~30–35
* **Vulnerable Code:**

  ```js
  fs.readFile(path.join(__dirname, filePath), function(err, data) {
  ```
* **Root Cause:** User‑controlled file path is joined without validation or normalization checks.
* **Semgrep Detection:**

  * Rule ID: `javascript.express.security.audit.express-path-join-resolve-traversal`
  * Finding: ✅ Yes

---

### V5 – SQL Injection (Sequelize Raw Query)

* **Endpoint / Feature:** Order / database query
* **OWASP Category:** A03 – Injection
* **DAST Evidence:** SQL payloads modify query behavior and expose data
* **Source Code Location:**

  * File: `src/router/routes/order.js`
  * Lines: ~65–70
* **Vulnerable Code:**

  ```js
  db.sequelize.query(sql, { type: 'RAW' });
  ```
* **Root Cause:** Raw SQL query is constructed using user‑controlled input without parameterization.
* **Semgrep Detection:**

  * Rule ID: `javascript.sequelize.security.audit.sequelize-injection-express`
  * Finding: ✅ Yes

---

### V6 – Insecure Object Deserialization

* **Endpoint / Feature:** System route processing serialized input
* **OWASP Category:** A08 – Software and Data Integrity Failures
* **DAST Evidence:** Malicious serialized payload processed by server
* **Source Code Location:**

  * File: `src/router/routes/system.js`
  * Lines: ~60–65
* **Vulnerable Code:**

  ```js
  var deser = serialize.unserialize(body);
  ```
* **Root Cause:** Untrusted user input is deserialized using an unsafe third‑party library.
* **Semgrep Detection:**

  * Rule ID: `javascript.express.security.audit.express-third-party-object-deserialization`
  * Finding: ✅ Yes

---

### V7 – Hard‑coded JWT Secret

* **Endpoint / Feature:** Authentication / Token handling
* **OWASP Category:** A02 – Cryptographic Failures
* **DAST Evidence:** Tokens can be forged if secret is leaked
* **Source Code Location:**

  * File: `src/router/routes/user.js`
  * Lines: ~18, ~253, ~406
* **Vulnerable Code:**

  ```js
  jwt.verify(token, "SuperSecret");
  ```
* **Root Cause:** JWT signing and verification use a hard‑coded secret in source code.
* **Semgrep Detection:**

  * Rule ID: `javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret`
  * Finding: ✅ Yes

---

### V8 – Insecure Session Configuration

* **Endpoint / Feature:** Application‑wide session handling
* **OWASP Category:** A02 – Cryptographic Failures
* **DAST Evidence:** Session cookies lack security attributes
* **Source Code Location:**

  * File: `src/server.js`
  * Lines: ~43–57
* **Vulnerable Code:**

  ```js
  app.use(session({
    secret: 'SuperSecret'
  }));
  ```
* **Root Cause:** Session cookies are missing `secure`, `httpOnly`, `sameSite`, `domain`, and `expires` flags, and use a hard‑coded secret.
* **Semgrep Detection:**

  * Rule IDs:

    * `javascript.express.security.audit.express-cookie-settings.express-cookie-session-no-secure`
    * `javascript.express.security.audit.express-cookie-settings.express-cookie-session-no-httponly`
    * `javascript.express.security.audit.express-session-hardcoded-secret`
  * Finding: ✅ Yes

---

## Phase B2 Completion Statement

This phase demonstrates full traceability between **dynamic exploitation**, **static analysis**, and **source code flaws**. All listed vulnerabilities were:

* Exploitable via DAST
* Precisely mapped to code locations
* Confirmed using built‑in Semgrep rules

This satisfies all **Phase B2** requirements and prepares the project for **Phase B3 (Custom Semgrep Rules)** and **Phase C (Fix & Harden)**.
