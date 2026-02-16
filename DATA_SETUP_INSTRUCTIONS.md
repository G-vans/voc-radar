# Data Setup Instructions

## Quick Start

Run this command to generate and index all review data:

```bash
npm run setup-elastic
```

This will:
1. Generate synthetic review data
2. Create Elasticsearch index
3. Upload all reviews to Elasticsearch

---

## Step-by-Step (If You Want More Control)

### Step 1: Generate Review Data

```bash
npm run generate-reviews
```

This creates `data/reviews.json` with ~600 synthetic reviews.

### Step 2: Index Reviews to Elasticsearch

```bash
npm run index-reviews
```

This will:
- Create the `customer_reviews` index
- Upload all reviews from `data/reviews.json`
- Verify the data was indexed

---

## What Gets Created

### Index: `customer_reviews`

**Fields:**
- `product` (keyword) - Product name
- `platform` (keyword) - Marketplace/platform
- `review_text` (text) - Review content
- `rating` (integer) - 1-5 star rating
- `sentiment_score` (float) - 0.0 to 1.0
- `sentiment_label` (keyword) - positive/neutral/negative
- `review_id` (keyword) - Unique review ID
- `@timestamp` (date) - When review was created

### Data Generated

- **3 products** (Product A, B, C)
- **3 platforms** (Marketplace A, B, C)
- **~200 reviews per product** (600 total)
- **Last 90 days** of data
- **Realistic sentiment distribution** (60% positive, 20% neutral, 20% negative)
- **Some recent negative reviews** for Product A (to create demo issues)

---

## Troubleshooting

### Error: "Missing ELASTIC_BASE_URL or ELASTIC_API_KEY"

Make sure your `.env.local` file exists and has:
```bash
ELASTIC_BASE_URL=https://your-endpoint.es.region.cloud.es.io:9243
ELASTIC_API_KEY=your-api-key-here
```

### Error: "Failed to create index"

- Check your API key is correct
- Make sure the base URL doesn't have the port `:9243` (the script removes it)
- Try accessing Kibana to verify your deployment is running

### Error: "Reviews file not found"

Run `npm run generate-reviews` first to create the data file.

---

## Verify Data in Kibana

1. Open Kibana (from your Elastic Cloud dashboard)
2. Go to **Discover**
3. Select index pattern: `customer_reviews`
4. You should see reviews with timestamps, ratings, sentiment, etc.

---

## Next Steps

Once data is indexed:
1. ✅ Create custom ES|QL tools
2. ✅ Create custom agent
3. ✅ Create workflow
4. ✅ Connect API route to real Elastic

Let's continue! 🚀
