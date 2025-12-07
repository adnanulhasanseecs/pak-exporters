# Security Best Practices Guide - Pak-Exporters

This document outlines security best practices for developers working on the Pak-Exporters application.

---

## 1. Input Validation & Sanitization

### ✅ Always Do

1. **Validate All Inputs**
   ```typescript
   import { validateAndSanitizeEmail, sanitizeInputEnhanced } from "@/lib/security-enhanced";
   
   // Validate email
   const emailResult = validateAndSanitizeEmail(userInput);
   if (!emailResult.isValid) {
     return { error: emailResult.error };
   }
   
   // Sanitize user input
   const sanitized = sanitizeInputEnhanced(userInput);
   ```

2. **Use Schema Validation**
   ```typescript
   import { z } from "zod";
   
   const userSchema = z.object({
     email: z.string().email(),
     name: z.string().min(1).max(100),
     age: z.number().int().positive(),
   });
   
   const result = userSchema.safeParse(data);
   if (!result.success) {
     return { error: result.error };
   }
   ```

3. **Set Length Limits**
   - Email: max 254 characters
   - Name: max 100 characters
   - Description: max 5000 characters
   - Always validate length before processing

4. **Sanitize Nested Objects**
   ```typescript
   import { sanitizeObject } from "@/lib/security-enhanced";
   
   const sanitized = sanitizeObject(userData);
   ```

### ❌ Never Do

- ❌ Trust client-side validation alone
- ❌ Use `eval()` or `Function()` constructor
- ❌ Store unsanitized user input in database
- ❌ Display user input without sanitization
- ❌ Allow unlimited input length

---

## 2. Authentication & Authorization

### ✅ Always Do

1. **Use Secure Password Hashing**
   ```typescript
   import { hashPassword, verifyPassword } from "@/lib/auth";
   
   // Hash password before storing
   const hashedPassword = await hashPassword(password);
   
   // Verify password on login
   const isValid = await verifyPassword(password, hashedPassword);
   ```

2. **Require Authentication for Protected Routes**
   ```typescript
   import { requireAuth, requireRole } from "@/lib/middleware-auth";
   
   // Require authentication
   const authResult = await requireAuth(request);
   if (authResult.response) {
     return authResult.response;
   }
   
   // Require specific role
   const roleResult = await requireRole(request, ["admin", "supplier"]);
   if (roleResult.response) {
     return roleResult.response;
   }
   ```

3. **Validate JWT Tokens**
   - Always verify token signature
   - Check token expiration
   - Validate token payload

4. **Use Strong Secrets**
   - JWT_SECRET: minimum 32 characters, random
   - Never commit secrets to git
   - Use environment variables

### ❌ Never Do

- ❌ Store passwords in plain text
- ❌ Use weak passwords (enforce strength requirements)
- ❌ Expose sensitive data in API responses
- ❌ Skip authentication checks
- ❌ Use default or weak secrets

---

## 3. API Security

### ✅ Always Do

1. **Validate Request Bodies**
   ```typescript
   import { validateRequestBodySize } from "@/lib/security-enhanced";
   
   const body = await request.json();
   const sizeCheck = validateRequestBodySize(body, 1024 * 1024); // 1MB limit
   if (!sizeCheck.isValid) {
     return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
   }
   ```

2. **Implement Rate Limiting**
   ```typescript
   import { enhancedRateLimiter } from "@/lib/security-enhanced";
   
   const ip = request.headers.get("x-forwarded-for") || "unknown";
   const rateLimit = enhancedRateLimiter.check(ip);
   if (!rateLimit.allowed) {
     return NextResponse.json(
       { error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter },
       { status: 429 }
     );
   }
   ```

3. **Validate File Uploads**
   ```typescript
   import { validateFileUpload } from "@/lib/security-enhanced";
   
   const file = formData.get("file") as File;
   const validation = validateFileUpload(file, {
     maxSize: 10 * 1024 * 1024, // 10MB
     allowedTypes: ["image/jpeg", "image/png"],
     allowedExtensions: [".jpg", ".jpeg", ".png"],
   });
   
   if (!validation.isValid) {
     return NextResponse.json({ error: validation.error }, { status: 400 });
   }
   ```

4. **Use HTTPS in Production**
   - Always use HTTPS for API calls
   - Enforce HTTPS with HSTS header

5. **Validate CSRF Tokens**
   - Middleware handles CSRF protection
   - Verify origin and referer headers

### ❌ Never Do

- ❌ Accept unlimited file sizes
- ❌ Allow arbitrary file types
- ❌ Skip rate limiting
- ❌ Trust client-provided data without validation
- ❌ Expose internal errors to clients

---

## 4. Data Protection

### ✅ Always Do

1. **Never Return Sensitive Data**
   ```typescript
   // ❌ Bad
   return NextResponse.json({ user });
   
   // ✅ Good
   const { password, ...safeUser } = user;
   return NextResponse.json({ user: safeUser });
   ```

2. **Use Environment Variables for Secrets**
   ```typescript
   // ✅ Good
   const secret = process.env.JWT_SECRET;
   if (!secret) {
     throw new Error("JWT_SECRET not configured");
   }
   ```

3. **Encrypt Sensitive Data at Rest**
   - Use database encryption
   - Encrypt backups
   - Use secure cloud storage

4. **Implement Data Retention Policies**
   - Delete old data regularly
   - Anonymize analytics data
   - Comply with GDPR requirements

### ❌ Never Do

- ❌ Log sensitive data (passwords, tokens, PII)
- ❌ Store secrets in code
- ❌ Commit `.env` files to git
- ❌ Return full database objects to clients
- ❌ Expose internal system information

---

## 5. Error Handling

### ✅ Always Do

1. **Don't Expose Internal Errors**
   ```typescript
   try {
     // ... code
   } catch (error) {
     // Log full error internally
     console.error("Internal error:", error);
     
     // Return generic error to client
     return NextResponse.json(
       { error: "An error occurred. Please try again later." },
       { status: 500 }
     );
   }
   ```

2. **Use Appropriate HTTP Status Codes**
   - 400: Bad Request (validation errors)
   - 401: Unauthorized (authentication required)
   - 403: Forbidden (insufficient permissions)
   - 404: Not Found
   - 429: Too Many Requests (rate limiting)
   - 500: Internal Server Error

3. **Log Security Events**
   ```typescript
   // Log failed login attempts
   console.warn("Failed login attempt:", { email, ip, timestamp });
   
   // Log authorization failures
   console.warn("Authorization denied:", { userId, resource, action });
   ```

### ❌ Never Do

- ❌ Return stack traces to clients
- ❌ Expose database schema in errors
- ❌ Log passwords or tokens
- ❌ Use generic error messages for security issues

---

## 6. File Upload Security

### ✅ Always Do

1. **Validate File Type**
   ```typescript
   const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
   if (!allowedTypes.includes(file.type)) {
     return { error: "Invalid file type" };
   }
   ```

2. **Validate File Size**
   ```typescript
   const maxSize = 10 * 1024 * 1024; // 10MB
   if (file.size > maxSize) {
     return { error: "File too large" };
   }
   ```

3. **Rename Uploaded Files**
   ```typescript
   // Don't use original filename
   const safeFilename = `${uuid()}.${extension}`;
   ```

4. **Store Files Securely**
   - Store outside web root
   - Use cloud storage with proper permissions
   - Validate file content (not just extension)

### ❌ Never Do

- ❌ Trust file extension alone
- ❌ Allow executable files
- ❌ Store files with original names
- ❌ Allow unlimited file sizes
- ❌ Skip virus scanning (in production)

---

## 7. SQL Injection Prevention

### ✅ Always Do

1. **Use Parameterized Queries**
   ```typescript
   // ✅ Good - Prisma handles this automatically
   const user = await prisma.user.findUnique({
     where: { email: userEmail },
   });
   ```

2. **Never Use Raw SQL with User Input**
   ```typescript
   // ❌ Bad - Never do this
   const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
   
   // ✅ Good - Use Prisma
   const user = await prisma.user.findUnique({
     where: { email: userEmail },
   });
   ```

### ❌ Never Do

- ❌ Concatenate user input into SQL queries
- ❌ Use raw SQL without parameterization
- ❌ Trust user input in database queries

---

## 8. XSS Prevention

### ✅ Always Do

1. **Sanitize All User Input**
   ```typescript
   import { sanitizeInputEnhanced } from "@/lib/security-enhanced";
   
   const safeInput = sanitizeInputEnhanced(userInput);
   ```

2. **Use React's Built-in Escaping**
   ```tsx
   // ✅ Good - React escapes by default
   <div>{userInput}</div>
   
   // ⚠️ Careful - Only if you trust the content
   <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
   ```

3. **Validate URLs**
   ```typescript
   import { validateAndSanitizeURL } from "@/lib/security-enhanced";
   
   const urlResult = validateAndSanitizeURL(userUrl);
   if (!urlResult.isValid) {
     return { error: urlResult.error };
   }
   ```

### ❌ Never Do

- ❌ Use `dangerouslySetInnerHTML` with unsanitized content
- ❌ Allow `javascript:` URLs
- ❌ Trust user-provided HTML
- ❌ Skip sanitization for "trusted" users

---

## 9. Dependency Security

### ✅ Always Do

1. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use Automated Scanning**
   - Enable Dependabot
   - Use Snyk or similar tools
   - Review security advisories

3. **Minimize Dependencies**
   - Only install what you need
   - Remove unused packages
   - Prefer well-maintained packages

### ❌ Never Do

- ❌ Ignore security warnings
- ❌ Use packages with known vulnerabilities
- ❌ Skip dependency updates
- ❌ Install packages from untrusted sources

---

## 10. Security Headers

### ✅ Always Do

1. **Verify Security Headers Are Set**
   - Check `next.config.ts` for security headers
   - Verify headers in production
   - Use security header testing tools

2. **Maintain CSP Policy**
   - Keep CSP rules up to date
   - Minimize use of `unsafe-inline` and `unsafe-eval`
   - Use nonces for inline scripts

### ❌ Never Do

- ❌ Remove security headers
- ❌ Use overly permissive CSP
- ❌ Skip header validation

---

## 11. Code Review Checklist

When reviewing code, check for:

- [ ] All user inputs are validated and sanitized
- [ ] Authentication is required for protected routes
- [ ] Authorization checks are in place
- [ ] No sensitive data in responses
- [ ] Error messages don't expose internal details
- [ ] File uploads are validated
- [ ] Rate limiting is implemented
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Security headers are maintained
- [ ] Dependencies are up to date
- [ ] Secrets are not in code

---

## 12. Incident Response

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. **Do** report to: security@pak-exporters.com
3. **Do** provide:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Security Audit Report](./SECURITY_AUDIT.md)

---

**Last Updated:** 2025-01-04

