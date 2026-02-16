# Elastic Cloud Setup Guide

## Step 1: Create a Deployment (If You Don't Have One)

### On Elastic Cloud Home Page:

1. **Click "Create deployment"** (or "Deployments" → "Create deployment")

2. **Choose settings:**
   - **Name:** `voc-radar` (or any name you like)
   - **Cloud provider:** Any (AWS, GCP, Azure - doesn't matter)
   - **Region:** Choose closest to you
   - **Version:** Latest (8.x or 9.x is fine)
   - **Template:** Leave as default (or choose "I want to customize")

3. **Click "Create deployment"**

4. **Wait 2-3 minutes** for deployment to be ready

---

## Step 2: Get Your Credentials

Once deployment is ready, you'll see a dashboard. You need:

### A. Elasticsearch Endpoint URL
- Look for **"Elasticsearch"** section
- Copy the **endpoint URL** (looks like: `https://xxxxx.es.us-central1.gcp.cloud.es.io:9243`)
- Save this - we'll use it as `ELASTIC_BASE_URL`

### B. API Key or Username/Password

**Option 1: API Key (Recommended)**
1. Go to **"Security"** → **"API Keys"**
2. Click **"Create API key"**
3. Name it: `voc-radar-api-key`
4. Copy the **API key** (you'll only see it once!)
5. Save it - we'll use it as `ELASTIC_API_KEY`

**Option 2: Username/Password**
- Default username: `elastic`
- Password: Shown when you created deployment (or reset it in Security)

---

## Step 3: Enable Agent Builder Feature

1. Go to your deployment dashboard
2. Click **"Open Kibana"** (or go to Kibana URL)
3. In Kibana, check if **"Agent Builder"** is available in the left menu
4. If not visible, you may need to enable it in deployment settings

**Note:** Agent Builder should be available in Elastic Cloud by default. If you don't see it, let me know and we'll troubleshoot.

---

## Step 4: Save Your Credentials

Create a `.env.local` file in your project root:

```bash
# Elastic Cloud Configuration
ELASTIC_BASE_URL=https://your-deployment-id.es.region.cloud.es.io:9243
ELASTIC_API_KEY=your_api_key_here

# Or if using username/password:
# ELASTIC_USERNAME=elastic
# ELASTIC_PASSWORD=your_password_here
```

**Important:** 
- `.env.local` is in `.gitignore` (won't be committed)
- Never commit credentials to git!

---

## Step 5: Test Connection (Optional)

We can test the connection once we have credentials. For now, just save them.

---

## What We'll Do Next

Once you have:
- ✅ Deployment created
- ✅ Endpoint URL
- ✅ API key (or username/password)

We'll:
1. Create Elasticsearch index for customer reviews
2. Generate and index synthetic review data
3. Create custom ES|QL tools
4. Create custom agent
5. Create workflow
6. Connect to our API route

---

## Quick Checklist

- [ ] Deployment created
- [ ] Endpoint URL copied
- [ ] API key created and saved
- [ ] `.env.local` file created with credentials
- [ ] Kibana accessible (can open it)

---

## Need Help?

If you're stuck at any step, tell me:
- What page you're on
- What you see
- What you're trying to do

I'll guide you through it! 🚀
