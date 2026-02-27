# Security Headers

This document describes the security headers implemented in the dev-card-showcase project.

## Content Security Policy (CSP)

The following CSP rules are applied:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
img-src 'self' data: https:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

## Additional Security Headers

- **X-Frame-Options**: DENY - Prevents the site from being embedded in frames
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-XSS-Protection**: 1; mode=block - Enables XSS filtering
- **Referrer-Policy**: strict-origin-when-cross-origin - Controls referrer information
- **Permissions-Policy**: geolocation=(), microphone=(), camera=() - Disables browser features

## Deployment

### Netlify
The `_headers` file in the root directory is automatically processed by Netlify.

### GitHub Pages
Meta tags are included in the HTML head section of each page.

### Apache (.htaccess)
Add the following to your `.htaccess` file:

```apache
<IfModule mod_headers.c>
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
    Header set X-Frame-Options "DENY"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

## Testing

Use security headers checking tools:
- https://securityheaders.com
- https://csp-evaluator.withgoogle.com
