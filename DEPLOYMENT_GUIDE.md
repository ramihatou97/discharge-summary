# Deployment Guide for GitHub Pages

## Overview
This guide explains how to deploy the updated application to GitHub Pages after merging the PR.

## Prerequisites
- PR has been reviewed and merged to the main/master branch
- You have push access to the repository
- Node.js and npm are installed locally

## Deployment Steps

### 1. Pull Latest Changes
```bash
git checkout master
git pull origin master
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Application
```bash
npm run build
```

This will create an optimized production build in the `dist/` folder.

### 4. Deploy to GitHub Pages
```bash
npm run deploy
```

This command will:
- Build the application (if not already built)
- Push the `dist/` folder contents to the `gh-pages` branch
- Make the site available at: https://ramihatou97.github.io/discharge-summary

### 5. Verify Deployment
After a few minutes, visit:
- **Production URL**: https://ramihatou97.github.io/discharge-summary

Verify that:
- The auto-save indicator shows "Auto-save input on"
- The tooltip says "Toggle auto-save for input text only (ML learnings always saved)"
- When editing a generated summary, the ML Learning notification shows "ML learnings are always auto-saved and persist through updates"

## What Changed

### User-Facing Changes
1. **Auto-save toggle** - Now clearly labeled as "Auto-save input on" to indicate it only affects input text
2. **Tooltip clarity** - Explains that ML learnings are always saved regardless of toggle state
3. **ML Learning notification** - Confirms that learnings persist through updates

### Technical Changes
1. **gh-pages updated** from 5.0.0 to 6.3.0 for better deployment reliability
2. **No breaking changes** - All existing functionality preserved

## Rollback Procedure (If Needed)

If issues are encountered:

```bash
# 1. Checkout previous commit
git log --oneline  # Find the commit before the merge
git checkout <previous-commit-sha>

# 2. Rebuild and redeploy
npm install
npm run build
npm run deploy
```

## Notes

- ML learning data is stored in browser localStorage and is never lost during deployments
- Input text auto-save settings are also preserved in localStorage
- No user data needs to be migrated or backed up
- The deployment only affects the application code, not user data

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deploy Fails
- Ensure you have push access to the repository
- Check that the `gh-pages` branch exists
- Verify GitHub Pages is enabled in repository settings

### Site Not Updating
- GitHub Pages can take 5-10 minutes to update
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check the `gh-pages` branch to verify new files were pushed

## Support

For issues or questions:
1. Check the UPGRADE_NOTES.md file
2. Review test results: `npm test`
3. Check build output: `npm run build`
4. Open an issue in the repository
