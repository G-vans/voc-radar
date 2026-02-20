# Troubleshooting: Agent 404 Error

## Problem

Getting 404 error when calling the agent:
```
Elastic API error: 404 {"statusCode":404,"error":"Not Found","message":"Not Found"}
```

## Solution

The agent ID might be incorrect. Let's find the correct agent ID.

### Step 1: List Your Agents

Run this command to see all your agents:

```bash
npm run list-agents
```

This will show:
- Agent names
- Agent IDs
- Which tools are assigned

### Step 2: Update .env.local

Once you see the agent list, update your `.env.local`:

```bash
AGENT_ID=the-actual-agent-id-from-the-list
```

**Note:** The agent ID might be:
- The agent name (e.g., `voc-analysis-agent`)
- Or a different ID (e.g., a UUID or different format)

### Step 3: Alternative - Get Agent ID from Kibana

1. Open Kibana
2. Go to **Agent Builder** → **Agents**
3. Click on your agent (`voc-analysis-agent`)
4. Look at the URL - it might show the agent ID
5. Or check the agent details page for an ID field

### Step 4: Verify API Endpoint

The API endpoint format should be:
```
https://your-deployment.kb.region.cloud.es.io/api/agent_builder/agents/{AGENT_ID}/chat
```

Make sure:
- The URL uses `.kb.` (Kibana) not `.es.` (Elasticsearch)
- The agent ID matches exactly (case-sensitive)

### Step 5: Test Again

1. Update `.env.local` with correct `AGENT_ID`
2. Restart dev server: `npm run dev`
3. Try analyzing a product again

---

## Quick Fix

If you can't find the agent ID, you can also:

1. **Check Kibana UI:**
   - Go to Agent Builder → Agents
   - Open your agent
   - The ID might be in the URL or agent details

2. **Try different formats:**
   - Just the name: `voc-analysis-agent`
   - With prefix: `agent:voc-analysis-agent`
   - Full path format (if shown in Kibana)

3. **Test in Kibana first:**
   - Use the Agent Chat in Kibana
   - If it works there, the agent exists
   - Then we just need the correct API format

---

Let me know what `npm run list-agents` shows, and we'll fix the agent ID!
