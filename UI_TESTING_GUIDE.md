# UI Testing Guide

## Main Dashboard URL

**Open in your browser:**
```
http://localhost:3000
```

This is the main dashboard page (`app/page.tsx`).

## What You'll See

### 1. Header Section
- "VOC Radar" title
- "Customer Feedback Monitor" subtitle

### 2. Product Selector Section
- Dropdown with 3 products (Product A, B, C)
- "Analyze Reviews" button (disabled until product selected)

### 3. Agent Status Section (appears after clicking Analyze)
- Shows 5 steps with progress indicators:
  - ✓ Fetching recent reviews
  - ✓ Analyzing sentiment trends
  - ✓ Detecting emerging issues
  - ✓ Creating issue record
  - ✓ Analysis complete

### 4. Results Display Section (appears when complete)
- **Issues Detected:**
  - Packaging Leakage Issue (high confidence)
  - Quality Degradation Concerns (medium confidence)
- **Automated Actions Taken:**
  - Issue #1234 created
  - Customer response template generated

## Testing Flow

1. **Open** http://localhost:3000
2. **Select** a product from dropdown
3. **Click** "Analyze Reviews" button
4. **Watch** the agent progress through steps (1.5 seconds each)
5. **See** results appear automatically when complete

## If Server Isn't Running

Start the dev server:
```bash
cd /Users/macbook/Documents/Hackathons/voc_radar
npm run dev
```

Then open: http://localhost:3000

## Next.js Routes (App Router)

In Next.js App Router:
- `app/page.tsx` → `/` (root URL)
- `app/about/page.tsx` → `/about`
- `app/api/analyze-product/route.ts` → `/api/analyze-product` (API endpoint)

We only have one page right now: the main dashboard at `/`

## Browser DevTools

Open browser DevTools (F12 or Cmd+Option+I) to:
- See console logs
- Inspect elements
- Check network requests (when we add API)
