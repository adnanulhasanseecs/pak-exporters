# Screen Reader Testing Guide

This guide provides instructions for manual screen reader testing to ensure the Pak-Exporters application is accessible to users with visual impairments.

## Overview

Screen reader testing is a manual process that requires testing with actual screen reader software. This document outlines the testing procedures and checklist.

## Screen Readers to Test

### Recommended Screen Readers

1. **NVDA (Windows)** - Free, open-source
   - Download: https://www.nvaccess.org/
   - Best for: Windows testing

2. **JAWS (Windows)** - Commercial
   - Most popular Windows screen reader
   - Best for: Professional testing

3. **VoiceOver (macOS/iOS)** - Built-in
   - Built into macOS and iOS
   - Best for: Mac/iPhone testing

4. **TalkBack (Android)** - Built-in
   - Built into Android
   - Best for: Android testing

5. **Narrator (Windows)** - Built-in
   - Built into Windows 10/11
   - Basic testing option

## Testing Checklist

### Navigation

- [ ] **Skip Navigation Link**
  - Press Tab from page load
  - Skip navigation link should be first focusable element
  - Activates and moves focus to main content

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - All elements should be reachable via keyboard
  - Focus indicators are visible
  - Tab order is logical

- [ ] **Landmarks**
  - Screen reader announces page regions (header, main, footer, navigation)
  - Landmarks are properly labeled

### Forms

- [ ] **Form Labels**
  - All form inputs have associated labels
  - Labels are announced when field receives focus
  - Required fields are clearly indicated

- [ ] **Error Messages**
  - Error messages are announced when they appear
  - Error messages are associated with form fields
  - Error messages are clear and actionable

- [ ] **Form Validation**
  - Validation errors are announced immediately
  - Success messages are announced
  - Form submission is clearly indicated

### Content

- [ ] **Headings**
  - Heading hierarchy is logical (h1 → h2 → h3)
  - All headings are announced
  - Heading levels are correct

- [ ] **Links**
  - Link text is descriptive (not just "click here")
  - Links are announced with context
  - External links are indicated

- [ ] **Images**
  - All images have alt text
  - Decorative images have empty alt text
  - Informative images have descriptive alt text

- [ ] **Lists**
  - Lists are announced with item count
  - List items are clearly identified

- [ ] **Tables**
  - Tables have headers
  - Headers are associated with cells
  - Table structure is announced

### Dynamic Content

- [ ] **Loading States**
  - Loading announcements are made
  - Screen reader users know when content is loading

- [ ] **Toast Notifications**
  - Toast messages are announced
  - Messages are clear and actionable
  - Messages don't interrupt reading

- [ ] **Modal Dialogs**
  - Modal opens are announced
  - Focus moves to modal
  - Modal can be closed with Escape
  - Focus returns to trigger after close

- [ ] **Dynamic Updates**
  - Content changes are announced
  - Live regions are used appropriately
  - Updates don't interrupt reading

### Interactive Elements

- [ ] **Buttons**
  - Button purpose is clear from label
  - Button state is announced (disabled, pressed, etc.)

- [ ] **Dropdowns/Menus**
  - Menu opens are announced
  - Menu items are navigable
  - Selected items are announced

- [ ] **Tabs**
  - Tab panels are announced
  - Active tab is indicated
  - Tab navigation works with arrow keys

- [ ] **Accordions**
  - Accordion state is announced (expanded/collapsed)
  - Content is accessible when expanded

## Testing Procedure

### 1. Setup

1. Install and start screen reader
2. Open browser (Chrome or Firefox recommended)
3. Navigate to application URL
4. Turn on screen reader

### 2. Test Each Page

For each page:

1. **Page Load**
   - Page title is announced
   - Main heading is announced
   - Skip navigation is available

2. **Navigation**
   - Navigate through all interactive elements
   - Verify all elements are reachable
   - Check focus indicators

3. **Content Reading**
   - Read through page content
   - Verify headings, links, images are announced correctly
   - Check for any unannounced content

4. **Forms**
   - Fill out forms using screen reader
   - Verify labels, errors, and success messages
   - Test form submission

5. **Interactive Elements**
   - Test all buttons, links, menus
   - Verify state changes are announced
   - Test keyboard navigation

### 3. Document Issues

For each issue found:

- **Page/Component:** Where the issue occurs
- **Issue Description:** What's wrong
- **Severity:** Critical, High, Medium, Low
- **Steps to Reproduce:** How to find the issue
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens

## Common Issues to Look For

### Critical Issues

- Content that cannot be accessed via keyboard
- Missing form labels
- Missing alt text on informative images
- Missing page titles
- Unannounced error messages

### High Priority Issues

- Poor heading hierarchy
- Unclear link text
- Missing ARIA labels on icons
- Unannounced dynamic content
- Missing focus indicators

### Medium Priority Issues

- Redundant announcements
- Verbose or unclear labels
- Missing skip links
- Inconsistent navigation

### Low Priority Issues

- Minor labeling improvements
- Cosmetic accessibility enhancements

## Testing Tools

### Browser Extensions

- **WAVE** - Web Accessibility Evaluation Tool
- **axe DevTools** - Accessibility testing
- **Lighthouse** - Accessibility audit

### Automated Testing

While automated tools are helpful, they cannot replace manual screen reader testing. Use them as a supplement:

```bash
# Run Lighthouse accessibility audit
npm run lighthouse -- --only-categories=accessibility

# Run axe-core tests
npm run test:accessibility
```

## Test Results Template

```markdown
# Screen Reader Testing Results

**Date:** [Date]
**Tester:** [Name]
**Screen Reader:** [NVDA/JAWS/VoiceOver/etc.]
**Browser:** [Chrome/Firefox/etc.]
**Version:** [Version]

## Pages Tested

### Homepage
- [ ] Navigation works
- [ ] Content is readable
- [ ] Forms are accessible
- **Issues Found:** [List issues]

### Product Pages
- [ ] Navigation works
- [ ] Content is readable
- [ ] Forms are accessible
- **Issues Found:** [List issues]

[... continue for all pages ...]

## Summary

**Total Issues Found:** [Number]
**Critical:** [Number]
**High:** [Number]
**Medium:** [Number]
**Low:** [Number]

## Recommendations

[Action items based on findings]
```

## Resources

- [WebAIM Screen Reader User Survey](https://webaim.org/projects/screenreadersurvey/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [NVDA Documentation](https://www.nvaccess.org/about-nvda/)
- [JAWS Documentation](https://www.freedomscientific.com/support/jaws-documentation/)

## Next Steps

After completing screen reader testing:

1. **Document all findings** using the template above
2. **Prioritize fixes** based on severity
3. **Fix critical and high-priority issues** first
4. **Re-test** after fixes are implemented
5. **Update accessibility documentation** with findings

---

**Last Updated:** 2025-01-XX

