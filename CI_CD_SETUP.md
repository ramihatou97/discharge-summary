# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for Continuous Integration and Continuous Deployment. The pipeline ensures code quality, runs tests, checks security, and automatically deploys to GitHub Pages.

---

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master` or `main`

**Jobs:**

#### Test Job
- ✅ Checkout code
- ✅ Setup Node.js 20
- ✅ Install dependencies (with caching)
- ✅ Run linter (if configured)
- ✅ Run Vitest tests
- ✅ Build project
- ✅ Upload build artifacts

**Artifacts:** Build output stored for 7 days

#### Security Job
- ✅ Run npm audit
- ✅ Check for high/critical vulnerabilities
- ✅ Fail if vulnerabilities found

**Threshold:** Moderate+ vulnerabilities

#### Build Quality Check
- ✅ Verify production build
- ✅ Check bundle sizes
- ✅ Verify dist/ structure
- ✅ Ensure index.html exists

**Dependencies:** Runs after test job passes

---

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Triggers:**
- Push to `master` or `main` branches
- Manual workflow dispatch

**Permissions:**
- `contents: read` - Read repository
- `pages: write` - Deploy to Pages
- `id-token: write` - OIDC token

**Jobs:**

#### Build Job
- ✅ Checkout code
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Build for production
- ✅ Upload Pages artifact

#### Deploy Job
- ✅ Deploy to GitHub Pages
- ✅ Set environment URL

**Environment:** `github-pages`

---

## Setup Instructions

### Initial Setup

1. **Enable GitHub Pages**
   ```
   Repository → Settings → Pages
   Source: GitHub Actions
   ```

2. **Configure Branch Protection (Optional)**
   ```
   Settings → Branches → Add rule
   - Require status checks to pass
   - Require branches to be up to date
   - Select: test, security, build-quality
   ```

3. **Add Repository Secrets (If Needed)**
   ```
   Settings → Secrets and variables → Actions
   Add any required API keys or secrets
   ```

---

## Workflow Status Badges

Add to README.md:

```markdown
![CI/CD](https://github.com/ramihatou97/discharge-summary-ultimate/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/ramihatou97/discharge-summary-ultimate/actions/workflows/deploy.yml/badge.svg)
```

---

## Local Development

### Run tests locally:
```bash
npm test              # Watch mode
npm test -- --run     # Run once (CI mode)
npm run test:coverage # With coverage report
```

### Build locally:
```bash
npm run build         # Production build
npm run preview       # Preview production build
```

### Check for vulnerabilities:
```bash
npm audit                      # Full audit
npm audit --audit-level=high   # High+ only
```

---

## Pipeline Flow

### On Push to master/main:

```
┌─────────────┐
│   Push to   │
│   master    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬────────────────┐
       │              │              │                │
       ▼              ▼              ▼                ▼
┌──────────┐  ┌───────────┐  ┌────────────┐  ┌──────────┐
│   Test   │  │ Security  │  │   Build    │  │  Deploy  │
│          │  │   Audit   │  │  Quality   │  │   (if    │
│  - Lint  │  │           │  │            │  │ master)  │
│  - Test  │  │ - npm     │  │  - Bundle  │  │          │
│  - Build │  │   audit   │  │    size    │  │ GitHub   │
└──────────┘  └───────────┘  └────────────┘  │  Pages   │
                                              └──────────┘
```

### On Pull Request:

```
┌─────────────┐
│Pull Request │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬────────────────┐
       │              │              │                │
       ▼              ▼              ▼                │
┌──────────┐  ┌───────────┐  ┌────────────┐         │
│   Test   │  │ Security  │  │   Build    │         │
│          │  │   Audit   │  │  Quality   │         │
│  Results │  │  Results  │  │  Results   │         │
└────┬─────┘  └─────┬─────┘  └──────┬─────┘         │
     │              │               │                │
     └──────────────┴───────────────┴────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Status Checks   │
            │ (Pass/Fail)     │
            └─────────────────┘
```

---

## Performance Metrics

### Build Times (Approximate)

| Job | Duration | Notes |
|-----|----------|-------|
| Install dependencies | ~30s | With npm cache |
| Run tests | ~10s | Vitest is fast! |
| Build | ~5-10s | Vite build |
| Security audit | ~5s | npm audit |
| Deploy | ~20s | GitHub Pages |

**Total CI/CD time:** ~2-3 minutes

---

## Monitoring & Debugging

### View Workflow Runs
```
Repository → Actions → Select workflow
```

### Check Logs
```
Click on workflow run → Click on job → View logs
```

### Download Artifacts
```
Workflow run → Artifacts section → Download
```

### Re-run Failed Jobs
```
Workflow run → Re-run jobs → Select which to re-run
```

---

## Failure Scenarios & Solutions

### Test Failures
**Cause:** Tests failing locally or in CI
**Solution:**
```bash
# Run tests locally
npm test

# Check for environment differences
# Fix tests or code
# Push changes
```

### Security Audit Failures
**Cause:** High/critical vulnerabilities detected
**Solution:**
```bash
# Check vulnerabilities
npm audit

# Update dependencies
npm audit fix

# Or update individually
npm update <package>

# Verify and commit
npm audit
git commit -am "fix: update vulnerable dependencies"
```

### Build Failures
**Cause:** Build errors in production mode
**Solution:**
```bash
# Test build locally
npm run build

# Check for:
# - Import errors
# - Missing dependencies
# - Environment variables

# Fix and test
npm run preview
```

### Deployment Failures
**Cause:** GitHub Pages deployment issues
**Solution:**
1. Check Pages is enabled in Settings
2. Verify workflow permissions
3. Check artifact upload logs
4. Ensure `dist/` folder structure is correct

---

## Best Practices

### Before Pushing

1. **Run tests locally**
   ```bash
   npm test -- --run
   ```

2. **Build locally**
   ```bash
   npm run build
   ```

3. **Check for issues**
   ```bash
   npm audit
   ```

### Pull Request Guidelines

1. Keep PRs focused and small
2. Ensure all checks pass
3. Add descriptive commit messages
4. Update tests if needed

### Commit Message Format

```
type(scope): description

Examples:
feat(ui): add dark mode toggle
fix(extraction): resolve date parsing bug
test(app): add dark mode tests
docs(readme): update installation steps
```

---

## Environment Variables

Currently, no secrets are required for CI/CD. If you need to add API keys in the future:

### Adding Secrets

1. Go to: `Settings → Secrets and variables → Actions`
2. Click "New repository secret"
3. Add name and value
4. Use in workflow:
   ```yaml
   - name: Step with secret
     env:
       API_KEY: ${{ secrets.API_KEY }}
     run: npm run something
   ```

---

## Caching Strategy

### Node Modules Cache
- **Key:** `node-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}`
- **Benefit:** 50-70% faster install times
- **Location:** GitHub Actions cache

### Build Cache
- **Vite:** Uses esbuild's fast caching
- **Local:** `node_modules/.vite/`
- **Not cached in CI:** Fresh builds ensure reliability

---

## Future Enhancements

### Potential Additions

1. **Code Coverage Reports**
   ```yaml
   - name: Upload coverage
     uses: codecov/codecov-action@v4
     with:
       file: ./coverage/coverage-final.json
   ```

2. **Performance Budgets**
   ```yaml
   - name: Check bundle size
     uses: andresz1/size-limit-action@v1
   ```

3. **Visual Regression Testing**
   ```yaml
   - name: Percy screenshots
     uses: percy/exec-action@v0.3.1
   ```

4. **Automated Dependency Updates**
   - Configure Dependabot
   - Or use Renovate Bot

5. **Release Automation**
   - Semantic versioning
   - Changelog generation
   - GitHub Releases

---

## Troubleshooting

### "npm ci" fails
**Solution:** Delete `package-lock.json` and regenerate:
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
```

### Tests pass locally but fail in CI
**Possible causes:**
- Environment differences
- Timezone issues
- Missing test setup

**Solution:** Add environment setup to `src/test/setup.js`

### Build works locally but fails in CI
**Possible causes:**
- Case-sensitive imports (Linux CI vs Windows local)
- Missing environment variables
- Node version mismatch

**Solution:** Ensure Node 20 locally: `nvm use 20`

---

## Support

For issues or questions:
- Check workflow logs in Actions tab
- Review this documentation
- Open an issue on GitHub

---

*Last Updated: 2025-10-07*
*CI/CD Status: ✅ Active and Operational*
