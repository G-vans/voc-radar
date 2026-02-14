# API Route Summary - Step by Step

## What We Built

### 1. API Endpoint
**File:** `/app/api/analyze-product/route.ts`

**URL:** `http://localhost:3000/api/analyze-product`

**Method:** POST

**Purpose:** Receives product name, calls Elastic Agent Builder (or returns mock data), returns issues and actions.

---

## How It Works (Rails Comparison)

### Next.js API Route vs Rails Controller

| Rails | Next.js | What It Does |
|-------|---------|--------------|
| `app/controllers/products_controller.rb` | `app/api/analyze-product/route.ts` | Handles requests |
| `def create` | `export async function POST()` | Handles POST requests |
| `params[:product]` | `await request.json()` | Gets request data |
| `render json: {...}` | `NextResponse.json({...})` | Returns JSON response |
| `rescue_from` | `try/catch` | Error handling |

---

## Request/Response Format

### Request (from frontend)
```json
{
  "product": "Product A"
}
```

### Response (to frontend)
```json
{
  "success": true,
  "issues": [
    {
      "id": "issue-1234567890-1",
      "title": "Packaging Leakage Issue",
      "description": "...",
      "confidence": "high",
      "platforms": ["Marketplace A", "Marketplace B"],
      "trend": "increasing",
      "reviewCount": 18,
      "firstDetected": "Feb 22, 2026",
      "evidence": ["...", "..."]
    }
  ],
  "actions": [
    {
      "type": "issue_created",
      "status": "success",
      "message": "Issue #1234 created in tracking system",
      "timestamp": "2/27/2026, 3:45:30 PM"
    }
  ]
}
```

---

## Current Implementation

### Mock Data Mode
Right now, the API returns mock data. This is perfect for:
- ✅ Testing the frontend
- ✅ Developing without Elastic account
- ✅ Demo purposes

### Future: Real Elastic Integration
When Elastic is ready, we'll replace the `analyzeProductWithAgent` function with real API calls:

```typescript
// Future implementation (commented in route.ts)
async function callElasticAgentBuilder(product: string) {
  const response = await fetch(
    `${process.env.ELASTIC_BASE_URL}/api/agent_builder/agents/${process.env.AGENT_ID}/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${process.env.ELASTIC_API_KEY}`
      },
      body: JSON.stringify({
        message: `Analyze reviews for ${product}`,
        stream: false
      })
    }
  )
  
  return await response.json()
}
```

---

## Frontend Integration

The frontend (`app/page.tsx`) now:
1. Calls `/api/analyze-product` when user clicks "Analyze Reviews"
2. Sends product name in request body
3. Receives issues and actions
4. Displays them in ResultsDisplay component

---

## Error Handling

The API handles:
- ✅ Missing product name (400 error)
- ✅ Invalid request format (400 error)
- ✅ API errors (500 error)
- ✅ Network errors (caught in try/catch)

Frontend catches errors and logs them (you can add user-facing error messages later).

---

## Testing

### Test the API directly:
```bash
curl -X POST http://localhost:3000/api/analyze-product \
  -H "Content-Type: application/json" \
  -d '{"product": "Product A"}'
```

### Test via UI:
1. Open http://localhost:3000
2. Select a product
3. Click "Analyze Reviews"
4. See results appear (from API)

---

## Next Steps

1. ✅ API route created
2. ✅ Frontend connected
3. ⏭️ Set up Elastic Cloud
4. ⏭️ Replace mock data with real API calls
5. ⏭️ Add error messages to UI
6. ⏭️ Add loading states (optional)
