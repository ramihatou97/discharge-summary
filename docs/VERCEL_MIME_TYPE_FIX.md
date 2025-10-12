# Vercel MIME Type Issue Fix

## Problem

When deploying to Vercel, the application was experiencing MIME type errors where CSS and JavaScript files were being served with `text/html` MIME type instead of their correct types (`text/css` and `application/javascript`).

### Error Messages
```
Refused to apply style from '...assets/index-CLtjZZEa.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.

Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
```

## Root Cause

The issue was caused by two configuration problems:

1. **Overly broad rewrite rule in `vercel.json`**: The rewrite rule `"source": "/:path*"` was catching ALL requests, including requests for static assets (CSS, JS files), and redirecting them to `/index.html`.

2. **Incorrect base path for Vercel**: The `vite.config.js` had `base: '/discharge-summary/'` which is correct for GitHub Pages but incorrect for Vercel deployments where the app is served from the root path `/`.

## Solution

### 1. Updated `vercel.json` Rewrite Rule

Changed from:
```json
{
  "source": "/:path*",
  "destination": "/index.html"
}
```

To:
```json
{
  "source": "/((?!assets/|.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)).*)",
  "destination": "/index.html"
}
```

**What this does**: Uses a negative lookahead regex pattern to exclude:
- Any path starting with `assets/` (the directory where Vite outputs built assets)
- Any path ending with static file extensions (`.js`, `.css`, `.png`, etc.)

This ensures that:
- ✅ Static assets are served directly by Vercel with correct MIME types
- ✅ Client-side routes (like `/about`, `/dashboard`) are still rewritten to `/index.html` for SPA routing

### 2. Updated `vite.config.js` Base Path

Changed from:
```javascript
base: '/discharge-summary/',
```

To:
```javascript
base: process.env.VERCEL ? '/' : '/discharge-summary/',
```

**What this does**: 
- When building on Vercel (where `VERCEL` environment variable is automatically set), uses base path `/`
- When building locally or for GitHub Pages, uses base path `/discharge-summary/`

This ensures:
- ✅ Vercel builds have asset paths like `/assets/index-CkpgiJjM.js`
- ✅ GitHub Pages builds have asset paths like `/discharge-summary/assets/index-CkpgiJjM.js`
- ✅ Both deployment targets work correctly without manual configuration changes

## Verification

### Build Output Comparison

**With VERCEL environment variable** (for Vercel deployment):
```html
<script type="module" crossorigin src="/assets/index-CkpgiJjM.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-CLtjZZEa.css">
```

**Without VERCEL environment variable** (for GitHub Pages):
```html
<script type="module" crossorigin src="/discharge-summary/assets/index-CkpgiJjM.js"></script>
<link rel="stylesheet" crossorigin href="/discharge-summary/assets/index-CLtjZZEa.css">
```

### Testing
All 77 tests continue to pass after the changes, confirming no functionality was broken.

## Benefits

1. **Automatic environment detection**: No manual configuration changes needed when deploying to different platforms
2. **Proper MIME types**: Static assets are served with correct Content-Type headers
3. **SPA routing preserved**: Client-side routing still works correctly
4. **Minimal changes**: Only 2 lines changed across 2 files

## Future Deployments

### Vercel
Simply push to the connected branch. Vercel will automatically:
1. Set the `VERCEL` environment variable
2. Build with the correct base path (`/`)
3. Serve assets with correct MIME types
4. Apply the rewrite rule only to non-asset routes

### GitHub Pages
Use the existing `npm run deploy` command. The build will:
1. Use base path `/discharge-summary/` (no VERCEL env variable)
2. Generate assets with the correct path prefix
3. Deploy to GitHub Pages successfully

## References

- [Vercel SPA Configuration](https://vercel.com/docs/configuration#project/rewrites)
- [Vite Base Public Path](https://vitejs.dev/config/shared-options.html#base)
- [MIME Type Errors MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
