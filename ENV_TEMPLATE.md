# Environment Variables Template

Create a `.env.local` file in the root directory with:

```bash
# Elastic Cloud Configuration
ELASTIC_BASE_URL=https://your-deployment.es.us-central1.gcp.cloud.es.io:9243
ELASTIC_API_KEY=your_api_key_here
AGENT_ID=voc-analysis-agent
```

**Note:** 
- `.env.local` is in `.gitignore` so it won't be committed to git
- `AGENT_ID` should be the name or ID of your agent (defaults to `voc-analysis-agent` if not set)
- The API will use real Elastic Agent Builder calls if credentials are provided
- If credentials are missing, it falls back to mock data
