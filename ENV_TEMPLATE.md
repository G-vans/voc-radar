# Environment Variables Template

When you set up Elastic Cloud, create a `.env.local` file in the root directory with:

```bash
# Elastic Cloud Configuration
ELASTIC_BASE_URL=https://your-deployment.es.us-central1.gcp.cloud.es.io:9243
ELASTIC_API_KEY=your_api_key_here
AGENT_ID=your_agent_id_here
```

**Note:** `.env.local` is in `.gitignore` so it won't be committed to git.

For now, the API uses mock data, so these aren't required yet.
