# Language Switcher Debugging Plan

## Problem Analysis

**Challenge**: Language switcher component not visible and not appearing in DOM

**Expected Location**: Header, rightmost position (after all other buttons)

## Likely Issues

1. **React Hooks Rules Violation** ⚠️ CRITICAL
   - Hooks cannot be called conditionally or in try-catch
   - Current code has hooks in try-catch block (INVALID)

2. **Component Erroring Silently**
   - Hooks might be failing but error is caught
   - Component might not be rendering due to error

3. **Build/Compilation Error**
   - Component might not be compiling correctly
   - Check build output for errors

4. **Context Issue**
   - Component needs to be within NextIntlClientProvider
   - Header is inside provider, so should work

5. **Import/Export Issue**
   - Component might not be exported correctly
   - Import path might be wrong

## Solution Options

### Option 1: Fix React Hooks (RECOMMENDED)
- Remove try-catch around hooks
- Call hooks unconditionally at top level
- Add error boundary if needed
- **Pros**: Follows React rules, proper error handling
- **Cons**: None

### Option 2: Simplify Component First
- Create minimal test version (just a button with flag)
- Verify it renders
- Then add functionality incrementally
- **Pros**: Isolates the problem
- **Cons**: Takes more steps

### Option 3: Use Same Pattern as Header
- Header successfully uses `useRouter()` from `@/i18n/routing`
- Copy the exact same pattern
- **Pros**: Uses proven working pattern
- **Cons**: None

### Option 4: Add Debugging
- Add console.logs
- Add visible test element
- Check browser console for errors
- **Pros**: Helps identify the issue
- **Cons**: Temporary solution

### Option 5: Check Build Errors
- Run build and check for compilation errors
- Fix any TypeScript/build errors
- **Pros**: Catches build-time issues
- **Cons**: Might not catch runtime issues

## Recommended Approach

1. **Fix hooks violation** (remove try-catch)
2. **Use same pattern as Header** (proven to work)
3. **Add simple fallback** if hooks fail
4. **Test incrementally**

