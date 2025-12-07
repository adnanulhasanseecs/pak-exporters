# Homepage Restoration Plan

## Root Cause Analysis

### What Happened?
During the internationalization process, the homepage (`app/[locale]/page.tsx`) was simplified and several critical sections were removed or lost. The original homepage had a much richer structure with multiple sections showcasing the platform's features.

### What Was Lost?

1. **Trust Signals Section** (3 cards)
   - Global Connectivity
   - Advertise with Us
   - Online Support 24/7

2. **"Why Choose Pak-Exporters?" Section** (Complete section missing)
   - Tabbed interface with two tabs:
     - **Core Benefits Tab**: 6 benefit cards (Verified Suppliers, Global Reach, Easy to Use, Advanced Analytics, Secure Transactions, 24/7 Support)
     - **AI Features Tab**: AI-powered features showcase

3. **Product Section Enhancements**
   - Missing "Trending Products" vs "Featured Gold Products" tabs
   - Simplified to single product list

4. **Membership CTA Position**
   - Currently: After Products section
   - Should be: BEFORE Categories section (as per original design)

5. **Image URLs**
   - Many images using `pak-exporters.com/wp-content/uploads/` URLs (broken)
   - Should use Unsplash URLs like the original

6. **Card Layouts**
   - Some styling may have been simplified

## What's Still Intact?

✅ Hero Carousel
✅ Stats Section (simplified but present)
✅ Basic Features Section (4 cards - simplified)
✅ Categories Section
✅ Products Section (basic version)
✅ Membership CTA Section (wrong position)

## SEO & Features Status

### SEO Features (from TODO.md)
- ✅ Meta tags structure (should verify)
- ✅ JSON-LD schemas (should verify)
- ✅ Semantic HTML (should verify)
- ⚠️ Need to check if structured data is still present

### Other Features (from TODO.md)
- ✅ Animations (Framer Motion)
- ✅ Responsive design
- ✅ Image optimization (Next/Image)
- ⚠️ Need to verify all sections have proper animations

## Restoration Steps

1. **Restore Trust Signals Section**
   - Add 3-card section after Hero Carousel
   - Use proper icons and styling

2. **Restore "Why Choose Pak-Exporters?" Section**
   - Add tabbed interface
   - Restore Core Benefits tab (6 cards)
   - Restore AI Features tab
   - Add proper animations and styling

3. **Fix Membership CTA Position**
   - Move from after Products to before Categories

4. **Enhance Products Section**
   - Add tabs for "Trending Products" and "Featured Gold Products"
   - Restore proper product data structure

5. **Fix Image URLs**
   - Replace broken `pak-exporters.com` URLs with Unsplash URLs
   - Ensure all images use proper Next/Image optimization

6. **Restore Card Layouts**
   - Ensure all cards match original styling
   - Verify hover effects and animations

7. **Internationalization**
   - Ensure all new/restored sections use `useTranslations` hook
   - Add translation keys to `messages/en.json`

8. **Verify SEO**
   - Check meta tags are present
   - Verify JSON-LD structured data
   - Ensure semantic HTML structure

## Files to Modify

1. `app/[locale]/page.tsx` - Main homepage file
2. `messages/en.json` - Add translation keys for new sections
3. Verify `app/[locale]/layout.tsx` - Ensure SEO metadata is intact

## Backup Location

Original homepage structure available in git:
- Commit: `b11771c`
- File: `app/page.tsx` (saved to `temp_original_page.tsx`)

## Testing Checklist

- [ ] All sections render correctly
- [ ] Images load properly
- [ ] Animations work smoothly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Membership CTA is in correct position
- [ ] Tabs work correctly
- [ ] Translation keys are present
- [ ] SEO metadata is intact
- [ ] No console errors
- [ ] Performance is acceptable

