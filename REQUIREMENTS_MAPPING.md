# VOC Radar - Hackathon Requirements Mapping

## ✅ Hackathon Requirements Checklist

### Required Components

| Requirement | Status | Implementation |
|------------|--------|----------------|
| **Custom Agent** | ✅ Planned | VOC Analysis Agent with multi-step reasoning |
| **Custom Tool(s)** | ✅ Planned | 3 tools: Search, Trend Analysis, Issue Creation |
| **Elasticsearch Data** | ✅ Planned | Customer reviews index with synthetic data |
| **Multi-step Reasoning** | ✅ Planned | Agent uses tools sequentially, not single prompt |
| **Business Automation** | ✅ Planned | Auto-creates issues when problems detected |
| **ES|QL Usage** | ✅ Planned | Trend analysis tool uses ES|QL queries |
| **Elastic Workflows** | ✅ Planned | Issue creation workflow triggered by agent |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Dashboard (Vercel)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Product Selector → "Analyze Reviews" Button      │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Route: /api/analyze-product                 │  │
│  │  Calls Elastic Agent Builder REST API            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         Elastic Agent Builder (Cloud/Serverless)        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Custom Agent: "VOC Analysis Agent"               │  │
│  │  Instructions: Multi-step review analysis         │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌──────────────┬──────────────┬──────────────────┐   │
│  │  Tool 1:     │  Tool 2:     │  Tool 3:         │   │
│  │  Search      │  Trend       │  Create Issue    │   │
│  │  Reviews     │  Analysis    │  Workflow        │   │
│  │  (ES|QL)     │  (ES|QL)     │  (Workflow)      │   │
│  └──────────────┴──────────────┴──────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Elasticsearch Cluster                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Index: customer_reviews                          │  │
│  │  Fields: product, platform, review_text,         │  │
│  │          sentiment, rating, timestamp            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Custom Agent Definition

**Name:** `voc-analysis-agent`

**Instructions:**
```
You are a Voice of Customer (VOC) analysis agent. Your job is to:
1. Search recent customer reviews for a given product
2. Analyze sentiment trends over time
3. Detect emerging issues (negative sentiment spikes, recurring complaints)
4. If an issue is detected, automatically create an issue record

Use your tools in sequence:
- First, search for recent reviews
- Then, analyze trends to identify patterns
- Finally, if issues are found, trigger the issue creation workflow
```

**Tools Assigned:**
- `search_recent_reviews` (ES|QL tool)
- `analyze_sentiment_trends` (ES|QL tool)
- `create_issue_workflow` (Workflow tool)

---

### 2. Custom Tools

#### Tool 1: Search Recent Reviews
**Type:** ES|QL Tool
**Purpose:** Retrieve recent reviews for a product

**ES|QL Query:**
```esql
FROM customer_reviews
| WHERE product == "{{product_name}}"
| WHERE @timestamp >= NOW() - 7d
| SORT @timestamp DESC
| LIMIT 100
```

**Parameters:**
- `product_name` (keyword): Product to analyze

---

#### Tool 2: Analyze Sentiment Trends
**Type:** ES|QL Tool
**Purpose:** Detect sentiment shifts and emerging issues

**ES|QL Query:**
```esql
FROM customer_reviews
| WHERE product == "{{product_name}}"
| WHERE @timestamp >= NOW() - 30d
| STATS 
    avg_sentiment = AVG(sentiment_score),
    complaint_count = COUNT(WHERE sentiment_score < 0.3),
    total_reviews = COUNT()
  BY BUCKET(@timestamp, 1d)
| SORT @timestamp DESC
```

**Parameters:**
- `product_name` (keyword): Product to analyze

**Logic:** Agent analyzes results to detect:
- Sudden drops in avg_sentiment
- Spikes in complaint_count
- Recurring keywords in negative reviews

---

#### Tool 3: Create Issue Workflow
**Type:** Elastic Workflow Tool
**Purpose:** Automate issue creation when problems detected

**Workflow Steps:**
1. Create issue record in Elasticsearch (`issues` index)
2. Generate issue summary from review analysis
3. Tag with product, platform, severity
4. Return issue ID to agent

**Triggered by:** Agent decision (when trend analysis shows problem)

---

### 3. Elasticsearch Data Structure

**Index:** `customer_reviews`

**Mapping:**
```json
{
  "mappings": {
    "properties": {
      "product": { "type": "keyword" },
      "platform": { "type": "keyword" },
      "review_text": { "type": "text" },
      "rating": { "type": "integer" },
      "sentiment_score": { "type": "float" },
      "sentiment_label": { "type": "keyword" },
      "@timestamp": { "type": "date" },
      "review_id": { "type": "keyword" }
    }
  }
}
```

**Synthetic Data:**
- 3 products
- 2-3 platforms per product
- ~500-1000 reviews per product
- Realistic sentiment distribution
- Time-series data (last 90 days)
- Some reviews with negative patterns (for demo)

---

### 4. Next.js Dashboard

**Structure:**
```
/app
  /api
    /analyze-product
      route.ts          # Triggers Elastic Agent Builder API
  /components
    ProductSelector.tsx
    AgentStatus.tsx     # Shows agent steps in real-time
    ResultsDisplay.tsx  # Shows issues found
    ActionsTaken.tsx    # Shows automated actions
  page.tsx              # Main dashboard
```

**API Route Flow:**
1. Receives product selection from frontend
2. Calls Elastic Agent Builder REST API:
   ```
   POST /api/agent_builder/agents/{agent_id}/chat
   {
     "message": "Analyze reviews for {{product}}",
     "stream": false
   }
   ```
3. Agent executes multi-step process
4. Returns structured results
5. Frontend displays results

---

## Multi-Step Agent Flow (Visible to Judges)

### Step 1: User Action
- User selects product from dropdown
- Clicks "Analyze Reviews"

### Step 2: Agent Status (Real-time)
Dashboard shows:
```
✓ Fetching recent reviews...
✓ Analyzing sentiment trends...
✓ Detecting emerging issues...
✓ Creating issue record...
```

### Step 3: Results Display
- Issue cards appear
- Evidence shown (review count, trend charts)
- Confidence scores

### Step 4: Actions Taken
- Issue created (with ID)
- Response drafted (optional)

---

## Hackathon Judging Criteria Alignment

| Criterion | How VOC Radar Demonstrates It |
|-----------|------------------------------|
| **Multi-step reasoning** | Agent uses 3 tools sequentially, makes decisions |
| **Tool orchestration** | Agent selects right tool at right time |
| **Elasticsearch integration** | ES|QL queries, search, data storage |
| **Business automation** | Auto-creates issues, no manual intervention |
| **Real-world value** | Solves actual e-commerce problem |
| **Measurable impact** | Time saved, issues caught early |

---

## Technical Stack

- **Frontend:** Next.js 14+ (App Router)
- **Deployment:** Vercel
- **Elastic:** Elastic Cloud (free trial for hackathon)
- **Agent Builder:** Via Kibana REST APIs
- **Data:** Synthetic reviews (generated script)

---

## Next Steps

1. ✅ **Requirements mapped** ← You are here
2. ⏭️ Set up Elastic Cloud account
3. ⏭️ Create Elasticsearch index with mapping
4. ⏭️ Generate synthetic review data
5. ⏭️ Define custom tools via Agent Builder API
6. ⏭️ Create custom agent with instructions
7. ⏭️ Build Elastic Workflow for issue creation
8. ⏭️ Set up Next.js project
9. ⏭️ Build dashboard UI
10. ⏭️ Integrate Agent Builder REST API
11. ⏭️ Test end-to-end flow
12. ⏭️ Record demo video
13. ⏭️ Write submission description

---

## Key Files to Create

```
/voc-radar
  /elastic
    agent-definition.json          # Custom agent config
    tools/
      search-reviews.json          # ES|QL tool 1
      analyze-trends.json          # ES|QL tool 2
    workflows/
      create-issue.json           # Workflow definition
  /data
    generate-reviews.js            # Synthetic data generator
    reviews-mapping.json           # Elasticsearch mapping
  /app
    /api/analyze-product/route.ts  # Agent trigger endpoint
    /components/...                # Dashboard components
  README.md                        # Setup instructions
  REQUIREMENTS_MAPPING.md          # This file
```

---

## Questions to Resolve

1. **Elastic Cloud Setup:** Do you have access? (Free trial works)
2. **Authentication:** API keys or username/password?
3. **Agent Builder API Base URL:** Will be provided by Elastic Cloud
4. **Workflow Definition:** Need to check exact format

---

## References

- [Elastic Agent Builder Docs](https://www.elastic.co/docs/explore-analyze/ai-features/elastic-agent-builder)
- [ES|QL Query Language](https://www.elastic.co/guide/en/elasticsearch/reference/current/esql.html)
- [Elastic Workflows](https://www.elastic.co/guide/en/kibana/current/workflows.html)
- [Kibana REST APIs](https://www.elastic.co/guide/en/kibana/current/api.html)
