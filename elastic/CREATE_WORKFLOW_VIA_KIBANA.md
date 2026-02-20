# Create Elastic Workflow for Issue Creation

The workflow will automatically create issue records when the agent detects problems.

## Step 1: Navigate to Workflows

1. In Kibana, look for **"Workflows"** in the left sidebar
2. Click on it
3. Click **"Create workflow"** or **"New workflow"**

## Step 2: Configure Workflow

### Basic Information

**Workflow Name:** `create-issue-workflow`

**Description:**
```
Automatically creates issue records when VOC analysis detects problems. Stores issues in Elasticsearch for tracking and follow-up.
```

### Workflow Steps

#### Step 1: Create Issue Record

1. Add an **"Elasticsearch"** action step
2. Configure:
   - **Action:** `Index document`
   - **Index:** `issues` (we'll create this index)
   - **Document:**
   ```json
   {
     "product": "{{product}}",
     "title": "{{issue_title}}",
     "description": "{{issue_description}}",
     "confidence": "{{confidence}}",
     "platforms": {{platforms}},
     "trend": "{{trend}}",
     "review_count": {{review_count}},
     "first_detected": "{{first_detected}}",
     "created_at": "{{_now}}",
     "status": "open"
   }
   ```

#### Step 2: Return Issue ID

1. Add a step to extract the issue ID from the response
2. Or configure the workflow to return the document ID

### Workflow Trigger

For now, we'll trigger this workflow manually from the agent or API. Later, you can set up automatic triggers.

## Step 3: Create Issues Index (if needed)

If the `issues` index doesn't exist, create it:

1. Go to **Dev Tools** in Kibana
2. Run:
```json
PUT /issues
{
  "mappings": {
    "properties": {
      "product": { "type": "keyword" },
      "title": { "type": "text" },
      "description": { "type": "text" },
      "confidence": { "type": "keyword" },
      "platforms": { "type": "keyword" },
      "trend": { "type": "keyword" },
      "review_count": { "type": "integer" },
      "first_detected": { "type": "date" },
      "created_at": { "type": "date" },
      "status": { "type": "keyword" }
    }
  }
}
```

## Step 4: Save and Test

1. Save the workflow
2. Note the workflow ID (you'll need it for the API)
3. Test it manually if possible

## Alternative: Simplified Approach

If workflows are complex, we can:
- Have the agent return structured data
- Create issues directly in the API route (simpler for hackathon)

**For hackathon speed, I recommend the simplified approach** - we'll create issues in the API route instead of using a workflow. This is faster and still demonstrates automation.

---

## Next Step

After workflow (or if skipping it), we'll update the API route to:
1. Call the real Elastic Agent Builder API
2. Process the agent's response
3. Create issue records
4. Return formatted results to the frontend

Let me know if you want to create the workflow or skip to updating the API route!
