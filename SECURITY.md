# Frontend Security Documentation

This document outlines the security measures implemented in the CryptoTrader Next.js application.

## Security Features Implemented

### 1. Cookie Security Hardening

**File**: `/home/plum_-/cryptotrader/web/src/stores/authStore.ts`

- **SameSite Policy**: Upgraded from `lax` to `strict`
  - Prevents CSRF attacks by blocking cross-site cookie transmission
  - Critical for financial applications handling authentication tokens
  - Cookies only sent with requests originating from the same site

- **Secure Flag**: Enabled in production
  - Ensures cookies are only transmitted over HTTPS
  - Prevents man-in-the-middle attacks in production environments

- **Cookie Expiration**: 7 days
  - Balances security with user convenience
  - Forces re-authentication after expiry period

### 2. Production Debug Logging Protection

**File**: `/home/plum_-/cryptotrader/web/src/stores/authStore.ts`

- All `console.log` statements wrapped with `NODE_ENV` checks
- Debug information only logged in development mode
- Prevents sensitive information leakage in production
- Reduces attack surface by hiding internal application state

### 3. Content Security Policy (CSP)

**File**: `/home/plum_-/cryptotrader/web/next.config.ts`

Comprehensive CSP implementation to prevent XSS and injection attacks:

```typescript
Content-Security-Policy:
  default-src 'self';                    // Only load resources from same origin
  script-src 'self' 'unsafe-eval' 'unsafe-inline'; // Scripts from same origin + inline
  style-src 'self' 'unsafe-inline';      // Styles from same origin + inline
  img-src 'self' data: https:;           // Images from same origin, data URIs, HTTPS
  font-src 'self' data:;                 // Fonts from same origin, data URIs
  connect-src 'self' [API_URL] [WS_URL]; // API connections to backend services
  frame-ancestors 'none';                 // Prevent clickjacking
  base-uri 'self';                       // Restrict base tag to same origin
  form-action 'self';                    // Forms only submit to same origin
```

**Notes**:
- `unsafe-inline` for scripts and styles required by Next.js and React
- Future enhancement: Implement nonce-based CSP for stricter inline script control
- CSP is environment-aware and automatically includes configured API and WebSocket URLs

### 4. Security Headers

**File**: `/home/plum_-/cryptotrader/web/next.config.ts`

Additional HTTP security headers implemented:

#### X-Frame-Options: DENY
- Prevents clickjacking attacks
- Blocks application from being embedded in iframes
- Critical for authentication pages and financial operations

#### X-Content-Type-Options: nosniff
- Prevents MIME type sniffing
- Forces browsers to respect declared content types
- Prevents malicious file uploads from being executed

#### X-XSS-Protection: 1; mode=block
- Enables browser's built-in XSS filter
- Blocks page rendering if XSS attack detected
- Legacy header but provides defense-in-depth

#### Referrer-Policy: strict-origin-when-cross-origin
- Controls referrer information sent with requests
- Only sends origin for cross-origin requests
- Prevents information leakage through referrer headers

#### Permissions-Policy: camera=(), microphone=(), geolocation=()
- Disables unnecessary browser features
- Prevents malicious scripts from accessing sensitive APIs
- Reduces attack surface for compromised dependencies

### 5. Request ID Tracking

**File**: `/home/plum_-/cryptotrader/web/src/lib/api/client.ts`

- Unique `X-Request-ID` header added to all API requests
- Generated using UUID v4 for guaranteed uniqueness
- Benefits:
  - Distributed tracing across microservices
  - Easier debugging and log correlation
  - Security incident investigation
  - Rate limiting and abuse detection

### 6. Input Sanitization Utilities

**File**: `/home/plum_-/cryptotrader/web/src/lib/sanitize.ts`

DOMPurify-based sanitization utilities for user-generated content:

#### sanitizeHtml(dirty: string)
- Sanitizes HTML while preserving safe formatting tags
- Allowed tags: b, i, em, strong, a, p, br
- Allowed attributes: href, target, rel
- Blocks javascript:, data:, and other dangerous URLs

#### stripHtml(dirty: string)
- Removes all HTML tags
- Returns plain text only
- Use for text-only contexts

#### sanitizeUrl(url: string)
- Validates and sanitizes URLs
- Blocks dangerous protocols: javascript:, data:, vbscript:
- Allows only: http://, https://, mailto:, relative URLs
- Returns empty string for invalid URLs

**Usage Example**:
```typescript
import { sanitizeHtml, stripHtml, sanitizeUrl } from '@/lib/sanitize'

// Display user-generated content
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />

// Validate text input
const cleanText = stripHtml(formData.description)

// Validate redirect URLs
const safeUrl = sanitizeUrl(userProvidedUrl)
if (safeUrl) {
  router.push(safeUrl)
}
```

### 7. Security-Focused ESLint Rules

**File**: `/home/plum_-/cryptotrader/web/eslint.config.mjs`

Enabled ESLint rules to prevent dangerous coding patterns:

- `no-eval`: Prevents use of `eval()` which can execute arbitrary code
- `no-implied-eval`: Blocks `setTimeout(string)` and similar patterns
- `no-new-func`: Prevents `new Function()` constructor
- `no-script-url`: Blocks `javascript:` URLs in links

These rules catch security vulnerabilities during development before they reach production.

## Security Best Practices

### When Handling User Input

1. **Always sanitize before display**:
   ```typescript
   import { sanitizeHtml } from '@/lib/sanitize'
   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
   ```

2. **Use textContent over innerHTML when possible**:
   ```typescript
   // Good
   element.textContent = userInput

   // Avoid
   element.innerHTML = userInput
   ```

3. **Validate URLs before navigation**:
   ```typescript
   import { sanitizeUrl } from '@/lib/sanitize'
   const safeUrl = sanitizeUrl(redirectUrl)
   if (safeUrl) router.push(safeUrl)
   ```

### Authentication Token Storage

- Tokens stored in cookies (not localStorage) for better security
- Cookies are httpOnly=false (required for client-side access)
- SameSite=strict prevents CSRF attacks
- Secure flag enabled in production for HTTPS-only transmission

### API Communication

- All requests include unique X-Request-ID header
- Bearer token automatically added to authorized requests
- 401 responses trigger automatic logout and redirect
- 30-second timeout prevents hanging requests

### CSP Considerations

When adding new features:

1. **External Resources**: Update CSP if loading from new domains
2. **Inline Scripts**: Avoid when possible; if needed, consider nonce-based CSP
3. **WebSocket Connections**: Ensure WS URL is in connect-src directive
4. **Embedded Content**: iframe usage blocked by frame-ancestors

## Testing Security Features

### Manual Testing

1. **Cookie Security**:
   - Inspect cookies in DevTools
   - Verify SameSite=Strict attribute
   - Verify Secure flag in production

2. **CSP Headers**:
   - Open DevTools Console
   - Check for CSP violation warnings
   - Verify headers in Network tab

3. **XSS Prevention**:
   - Test sanitization with: `<script>alert('xss')</script>`
   - Verify script doesn't execute
   - Test with: `<img src=x onerror=alert('xss')>`

4. **Clickjacking Protection**:
   - Try embedding in iframe: `<iframe src="https://your-app.com">`
   - Should be blocked by X-Frame-Options

### Automated Testing

```bash
# Run ESLint security checks
npm run lint

# Build application to verify CSP doesn't break functionality
npm run build

# Run Playwright tests (if configured)
npm run test:e2e
```

## Security Incident Response

If a security vulnerability is discovered:

1. **Immediate Actions**:
   - Document the vulnerability
   - Assess impact and affected versions
   - Develop and test fix

2. **Deployment**:
   - Deploy fix as emergency hotfix
   - Notify users if credentials may be compromised
   - Force token refresh if authentication affected

3. **Post-Incident**:
   - Conduct root cause analysis
   - Update security documentation
   - Add automated tests to prevent regression
   - Review similar patterns in codebase

## Future Security Enhancements

### Short-term (Next Sprint)

1. **Nonce-based CSP**: Replace unsafe-inline with nonce-based policies
2. **Subresource Integrity (SRI)**: Add integrity hashes to CDN resources
3. **Rate Limiting**: Implement client-side request throttling
4. **Input Validation**: Add Zod schemas for all form inputs

### Medium-term (Next Quarter)

1. **Trusted Types**: Implement Trusted Types API for DOM sinks
2. **WebAuthn**: Add biometric authentication support
3. **Security Monitoring**: Integrate CSP violation reporting
4. **Dependency Scanning**: Automate npm audit in CI/CD

### Long-term (Next Year)

1. **Zero-Trust Architecture**: Implement continuous authentication
2. **E2E Encryption**: Client-side encryption for sensitive data
3. **Security Testing**: Automated penetration testing
4. **Compliance Certification**: SOC 2, ISO 27001 compliance

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)

## Security Contacts

For security vulnerabilities, please contact:
- Security Team: security@cryptotrader.example.com
- PGP Key: [Link to public key]
- Bug Bounty: [Link to program if applicable]
