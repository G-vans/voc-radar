# Create Custom Agent via Kibana UI

Now that both tools are created, let's create the custom agent that uses them.

## Step 1: Navigate to Agents

1. In Kibana, go to **Agent Builder**
2. Click on **"Agents"** tab
3. Click **"Create agent"** or **"New agent"**

## Step 2: Configure the Agent

### Basic Information

**Agent Name:** `voc-analysis-agent`

**Description:**
```
Voice of Customer (VOC) analysis agent. Analyzes customer reviews across platforms to detect emerging issues, sentiment trends, and automatically creates issue records when problems are identified.
```

### Agent Instructions

**Instructions/Prompt:**
```
You are a Voice of Customer (VOC) analysis agent. Your job is to analyze customer reviews for products and detect emerging issues.

When given a product name, you should:

1. First, use the search_recent_reviews tool to get recent reviews (last 7 days) for the product
2. Then, use the analyze_sentiment_trends tool to analyze sentiment patterns over the last 30 days
3. Analyze the results to identify:
   - Emerging issues (sudden drops in sentiment, spikes in complaints)
   - Recurring complaints or patterns
   - Trends that indicate problems
4. If you detect significant issues (high complaint counts, declining sentiment), summarize them clearly
5. Provide actionable insights with evidence from the review data

Be thorough in your analysis and provide specific examples from the review data when identifying issues.
```

### Assign Tools

1. Look for **"Tools"** or **"Available Tools"** section
2. Select/assign these tools:
   - ✅ `search_recent_reviews`
   - ✅ `analyze_sentiment_trends`

### Model Selection

- Use the default model (or select one if prompted)
- For hackathon, the default should work fine

## Step 3: Save the Agent

1. Click **"Save"** or **"Create"**
2. Note the agent ID (you'll need it for the API)

## Step 4: Test the Agent

1. Go to **Agent Chat** or find a test/chat interface
2. Try asking: "Analyze reviews for Product A"
3. The agent should:
   - Use search_recent_reviews tool
   - Use analyze_sentiment_trends tool
   - Provide analysis of the results

## Step 5: Get Agent ID

1. After creating, note the agent ID or name
2. You'll need this to call the agent via API
3. It might be visible in the agent details or URL

## Next Steps

Once the agent is created and tested:
1. ✅ We'll create the workflow for issue creation
2. ✅ Update the API route to call this agent
3. ✅ Connect everything together

---

**Note:** If you don't see certain options, the UI might be slightly different. Look for similar options or let me know what you see!
