# Create Tools via Kibana UI

Since the API format can be tricky, let's create the tools via Kibana UI (easier and more reliable).

## Step 1: Open Kibana

1. Go to your Elastic Cloud dashboard
2. Click **"Open Kibana"** (or use the Kibana URL)
3. Log in if needed

## Step 2: Navigate to Agent Builder

1. In Kibana, look for **"Agent Builder"** in the left sidebar
2. Click on it
3. Go to **"Tools"** tab

## Step 3: Create Tool 1 - Search Recent Reviews

1. Click **"Create tool"** or **"Add tool"**
2. Select **"ES|QL"** as the tool type
3. Fill in:

   **Tool Name:** `search_recent_reviews`
   
   **Description:** 
   ```
   Search for recent customer reviews for a specific product. Returns reviews from the last 7 days with their text, rating, sentiment, and platform information.
   ```

   **ES|QL Query:**
   ```esql
   FROM customer_reviews 
   | WHERE product == "?product" 
   | WHERE @timestamp >= NOW() - 7d 
   | SORT @timestamp DESC 
   | LIMIT 100
   ```
   
   **Important:** 
   - Try `"?product"` (with quotes) for string comparison
   - If that doesn't work, try `?product` without quotes
   - The parameter name `product` in the form must match what you use in the query

   **Parameters:**
   - Click "Add parameter"
   - **Name:** `product` (try this simpler name first - no underscores)
   - **Type:** `string` (select from dropdown)
   - **Description:** `The name of the product to search reviews for (e.g., 'Product A', 'Product B', 'Product C')`
   - **Required:** ✅ Yes
   
   **Important:** 
   - Parameter **Name** field: `product` (simple name, no underscores)
   - In the **ES|QL Query**: try `?product` OR `{{product}}` OR just check what Kibana suggests when you type

4. Click **"Save"** or **"Create"**

## Step 4: Create Tool 2 - Analyze Sentiment Trends

1. Click **"Create tool"** again
2. Select **"ES|QL"** as the tool type
3. Fill in:

   **Tool Name:** `analyze_sentiment_trends`
   
   **Description:**
   ```
   Analyze sentiment trends for a product over the last 30 days. Detects sentiment shifts, complaint patterns, and emerging issues. Returns daily averages of sentiment scores, complaint counts, and total review counts.
   ```

   **ES|QL Query:**
   ```esql
   FROM customer_reviews 
   | WHERE product == ?product 
   | WHERE @timestamp >= NOW() - 30d 
   | EVAL is_complaint = CASE(sentiment_score < 0.3, 1, 0)
   | STATS avg_sentiment = AVG(sentiment_score), 
          complaint_count = SUM(is_complaint), 
          total_reviews = COUNT() 
   BY BUCKET(@timestamp, 1d)
   ```
   
   **Note:** 
   - BUCKET can only be used in STATS BY clause (not in EVAL)
   - Removed `SORT @timestamp DESC` because `@timestamp` is not available after BUCKET
   - The data will be returned grouped by day (the BUCKET column will be in the results)
   - The agent can sort/analyze the results as needed
   
   **Note:** 
   - The `?product` parameter is on line 2: `WHERE product == ?product`
   - Try the first query with `CASE` first
   - If that fails, try the alternative with `FILTER` clause
   
   **Option 3:** Try escaping or different syntax - check if Kibana shows validation errors with suggestions
   
   **Note:** The ES|QL validator might be strict. If both options fail, the parameter might need to be added AFTER the query is written, or there might be a UI button to insert parameters.

   **Parameters:**
   - Click "Add parameter"
   - **Name:** `product` (use the same simple name as Tool 1)
   - **Type:** `string` (select from dropdown)
   - **Description:** `The name of the product to analyze trends for (e.g., 'Product A', 'Product B', 'Product C')`
   - **Required:** ✅ Yes

4. Click **"Save"** or **"Create"**

## Step 5: Verify Tools

1. You should now see both tools in the Tools list:
   - `search_recent_reviews`
   - `analyze_sentiment_trends`

2. You can test them by clicking on each tool and using the "Test" feature

## Next Step

Once both tools are created, we'll create the custom agent that uses these tools!

---

**Note:** If you don't see "Agent Builder" in Kibana, it might need to be enabled in your deployment settings, or you might need a different subscription tier. Let me know if you run into any issues!
