# Vercel MIME Type Fix - Visual Explanation

## Before Fix ❌

```
Browser Request Flow (Vercel):
┌──────────────────────────────────────────────────────┐
│ 1. Browser requests:                                 │
│    /discharge-summary/assets/index-CLtjZZEa.css     │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 2. Vercel receives request                           │
│    Checks rewrite rules in vercel.json               │
│                                                       │
│    Rule: "source": "/:path*"                         │
│    ↳ Matches EVERYTHING including assets!           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 3. Vercel rewrites to /index.html                    │
│    Returns HTML content                              │
│    Content-Type: text/html                           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 4. Browser receives HTML instead of CSS              │
│    Expected: text/css                                │
│    Got: text/html                                    │
│                                                       │
│    ERROR: "Refused to apply style... MIME type       │
│            'text/html' is not a supported            │
│            stylesheet MIME type"                     │
└──────────────────────────────────────────────────────┘
```

## After Fix ✅

```
Browser Request Flow (Vercel):
┌──────────────────────────────────────────────────────┐
│ 1. Browser requests:                                 │
│    /assets/index-CLtjZZEa.css                        │
│    (Note: No /discharge-summary/ prefix!)           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 2. Vercel receives request                           │
│    Checks rewrite rules in vercel.json               │
│                                                       │
│    Rule: "source": "/((?!assets/|.*\\.(css|js...)).*│
│    ↳ Uses negative lookahead                         │
│    ↳ Does NOT match paths with:                      │
│       - "assets/" in them                            │
│       - .css, .js, etc. extensions                   │
│                                                       │
│    Result: No rewrite! Serve actual file.           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 3. Vercel serves actual CSS file                     │
│    Content-Type: text/css                            │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 4. Browser receives CSS file                         │
│    Expected: text/css ✅                             │
│    Got: text/css ✅                                  │
│                                                       │
│    SUCCESS: Styles applied!                          │
└──────────────────────────────────────────────────────┘
```

## Client-Side Routing Still Works! ✅

```
Browser Request Flow for SPA routes:
┌──────────────────────────────────────────────────────┐
│ 1. Browser requests:                                 │
│    /dashboard (client-side route)                    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 2. Vercel receives request                           │
│    Checks rewrite rules                              │
│                                                       │
│    "/dashboard" does NOT contain:                    │
│    - "assets/"                                       │
│    - file extensions (.css, .js, etc.)              │
│                                                       │
│    Result: MATCHES rewrite rule!                     │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 3. Vercel rewrites to /index.html                    │
│    Returns HTML content                              │
│    Content-Type: text/html                           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 4. Browser receives index.html                       │
│    React Router handles /dashboard route             │
│                                                       │
│    SUCCESS: SPA routing works!                       │
└──────────────────────────────────────────────────────┘
```

## Regex Pattern Explanation

```regex
/((?!assets/|.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)).*)
```

Breaking it down:
```
/               - Match paths starting with /
 (              - Start capture group
  (?!           - Negative lookahead (exclude if matches)
    assets/     - Paths containing "assets/"
    |           - OR
    .*\.        - Any characters followed by a dot
    (js|css|...) - Common static file extensions
  )
  .*            - Match any remaining characters
 )              - End capture group
```

**What it matches:**
- ✅ `/` (root)
- ✅ `/dashboard`
- ✅ `/about`
- ✅ `/users/123`

**What it DOES NOT match:**
- ❌ `/assets/style.css`
- ❌ `/assets/script.js`
- ❌ `/image.png`
- ❌ `/font.woff`

## Environment-Based Base Path

```javascript
// vite.config.js
base: process.env.VERCEL ? '/' : '/discharge-summary/',
```

### On Vercel:
```
process.env.VERCEL = "1" (automatically set by Vercel)
↓
base = '/'
↓
Assets in index.html:
<script src="/assets/index-CkpgiJjM.js"></script>
<link href="/assets/index-CLtjZZEa.css"></link>
```

### On GitHub Pages:
```
process.env.VERCEL = undefined (not set)
↓
base = '/discharge-summary/'
↓
Assets in index.html:
<script src="/discharge-summary/assets/index-CkpgiJjM.js"></script>
<link href="/discharge-summary/assets/index-CLtjZZEa.css"></link>
```

## Key Takeaways

1. **Selective Rewriting**: Only rewrite non-asset paths for SPA routing
2. **Environment Detection**: Automatically adapt to deployment platform
3. **Zero Configuration**: No manual changes needed when deploying
4. **Minimal Changes**: Only 2 lines of code changed
5. **Backwards Compatible**: GitHub Pages deployment unchanged

## Testing the Fix

### Vercel Build:
```bash
VERCEL=1 npm run build
cat dist/index.html  # Check asset paths are /assets/...
```

### GitHub Pages Build:
```bash
npm run build
cat dist/index.html  # Check asset paths are /discharge-summary/assets/...
```

### Verify MIME Types:
```bash
curl -I https://your-app.vercel.app/assets/style.css
# Should return: Content-Type: text/css

curl -I https://your-app.vercel.app/assets/script.js
# Should return: Content-Type: application/javascript
```
