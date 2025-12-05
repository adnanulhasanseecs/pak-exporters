# Troubleshooting Guide

## Common Issues and Solutions

### Build Issues

#### Error: Module not found

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### TypeScript Errors

**Solution:**
```bash
# Check TypeScript version
npm list typescript

# Update if needed
npm install -D typescript@latest

# Run type check
npm run type-check
```

#### Build Fails with Memory Error

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### Runtime Issues

#### Page Not Loading

**Check:**
1. Server is running: `npm run dev` or `npm start`
2. Port is correct (default: 3000)
3. No console errors
4. Network tab for failed requests

#### Images Not Loading

**Check:**
1. Image paths are correct
2. Images exist in `public/` folder
3. Next.js Image component is used
4. Image domains configured in `next.config.ts`

#### Forms Not Submitting

**Check:**
1. Form validation errors
2. Network tab for API errors
3. Console for JavaScript errors
4. Form handler is properly connected

---

### Development Issues

#### Hot Reload Not Working

**Solution:**
```bash
# Restart dev server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### Styling Not Applying

**Check:**
1. TailwindCSS is configured
2. Classes are spelled correctly
3. No conflicting styles
4. Browser cache cleared

#### Type Errors in IDE

**Solution:**
```bash
# Restart TypeScript server in IDE
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

### Performance Issues

#### Slow Page Loads

**Check:**
1. Bundle size (should be < 200KB gzipped)
2. Image optimization
3. Unused dependencies
4. Network tab for slow requests

**Solutions:**
- Optimize images
- Code split large components
- Remove unused dependencies
- Enable compression

#### High Memory Usage

**Check:**
1. Memory leaks in components
2. Large data structures
3. Unclosed subscriptions
4. Service worker cache size

---

### Security Issues

#### CSP Violations

**Check:**
1. Browser console for CSP errors
2. Update CSP in `next.config.ts`
3. Allow necessary domains
4. Test in production mode

#### CSRF Errors

**Check:**
1. Origin header is correct
2. Referer header is present
3. Middleware is working
4. API endpoints are protected

---

### Deployment Issues

#### Build Fails on Vercel

**Check:**
1. Environment variables set
2. Node.js version (18+)
3. Build command is correct
4. No TypeScript errors

#### Environment Variables Not Working

**Check:**
1. Variables prefixed with `NEXT_PUBLIC_` for client
2. Variables set in Vercel dashboard
3. Restart deployment after adding variables
4. No typos in variable names

---

### Testing Issues

#### Tests Failing

**Check:**
1. Test environment is set up
2. Mock data is correct
3. Async operations are awaited
4. Test isolation (no shared state)

**Solution:**
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test -- path/to/test.tsx
```

#### E2E Tests Failing

**Check:**
1. Playwright is installed
2. Browsers are installed: `npx playwright install`
3. Server is running
4. Test selectors are correct

---

### Accessibility Issues

#### Screen Reader Not Working

**Check:**
1. ARIA labels are present
2. Semantic HTML is used
3. Focus management is correct
4. Live regions are configured

#### Keyboard Navigation Broken

**Check:**
1. All interactive elements are focusable
2. Tab order is logical
3. Focus indicators are visible
4. No focus traps (except modals)

---

## Getting Help

### Debug Steps

1. **Check Console** - Browser and terminal
2. **Check Network Tab** - Failed requests
3. **Check Build Output** - Warnings and errors
4. **Check Logs** - Server and application logs
5. **Reproduce Issue** - Clear steps to reproduce

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Reporting Issues

When reporting issues, include:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots/error messages

---

**Last Updated:** 2025-01-XX

