// API Route: /api/analyze-product
// This is like a Rails controller action
// Handles POST requests to analyze a product

import { NextRequest, NextResponse } from 'next/server'

// Type definitions (like Ruby structs)
interface AnalyzeRequest {
  product: string
}

interface AnalyzeResponse {
  success: boolean
  issues: Array<{
    id: string
    title: string
    description: string
    confidence: 'high' | 'medium' | 'low'
    platforms: string[]
    trend: 'increasing' | 'stable' | 'decreasing'
    reviewCount: number
    firstDetected: string
    evidence: string[]
  }>
  actions: Array<{
    type: string
    status: 'success' | 'pending' | 'failed'
    message: string
    timestamp: string
  }>
  error?: string
}

// POST handler (like def create in Rails)
export async function POST(request: NextRequest) {
  try {
    // Parse request body (like params in Rails)
    const body: AnalyzeRequest = await request.json()
    const { product } = body

    // Validate input (like strong parameters in Rails)
    if (!product || typeof product !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    // TODO: Call Elastic Agent Builder API here
    // For now, we'll use mock data
    // When Elastic is ready, we'll replace this with real API calls
    
    const results = await analyzeProductWithAgent(product)

    // Return success response (like render json: in Rails)
    return NextResponse.json({
      success: true,
      ...results
    })

  } catch (error) {
    // Handle errors (like rescue_from in Rails)
    console.error('Error analyzing product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

// Helper function to call Elasticsearch directly (ES|QL + indexing)
async function analyzeProductWithAgent(product: string): Promise<Omit<AnalyzeResponse, 'success' | 'error'>> {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY

  if (!baseUrl || !apiKey) {
    console.warn('Elastic credentials not configured, using mock data')
    return getMockResults(product)
  }

  try {
    const [recentReviews, sentimentTrends] = await Promise.all([
      runEsqlQuery(baseUrl, apiKey, buildRecentReviewsQuery(product)),
      runEsqlQuery(baseUrl, apiKey, buildTrendQuery(product))
    ])

    const { issues, actions } = await buildIssuesFromData(product, recentReviews, sentimentTrends)

    if (issues.length === 0) {
      console.log(`No critical issues detected for ${product}`)
      return { issues: [], actions: [] }
    }

    return { issues, actions }
  } catch (error) {
    console.error('Error calling Elasticsearch:', error)
    console.warn('Falling back to mock data')
    return getMockResults(product)
  }
}

interface EsqlResponse {
  columns?: Array<{ name: string }>
  values?: any[][]
}

function buildRecentReviewsQuery(product: string) {
  return `FROM customer_reviews
| WHERE product == "${product}"
| WHERE @timestamp >= NOW() - 7d
| KEEP @timestamp, platform, rating, sentiment_score, sentiment_label, review_text
| SORT @timestamp DESC
| LIMIT 100`
}

function buildTrendQuery(product: string) {
  return `FROM customer_reviews
| WHERE product == "${product}"
| WHERE @timestamp >= NOW() - 30d
| EVAL complaint_flag = CASE(sentiment_score < 0.35, 1, 0)
| STATS avg_sentiment = AVG(sentiment_score), complaint_count = SUM(complaint_flag), total_reviews = COUNT()
  BY BUCKET(@timestamp, 1d)
| LIMIT 30`
}

async function runEsqlQuery(baseUrl: string, apiKey: string, query: string): Promise<EsqlResponse> {
  const response = await fetch(`${baseUrl}/_query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${apiKey}`
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ES|QL query failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

function esqlRowsToObjects(result?: EsqlResponse): Record<string, any>[] {
  if (!result?.columns || !result?.values) return []
  return result.values.map((row) => {
    const item: Record<string, any> = {}
    result.columns!.forEach((col, index) => {
      item[col.name] = row[index]
    })
    return item
  })
}

async function buildIssuesFromData(
  product: string,
  recentReviews: EsqlResponse,
  sentimentTrends: EsqlResponse
): Promise<{ issues: AnalyzeResponse['issues']; actions: AnalyzeResponse['actions'] }> {
  const reviewRows = esqlRowsToObjects(recentReviews)
  const trendRows = esqlRowsToObjects(sentimentTrends)

  const complaintRows = reviewRows.filter((row) => {
    const sentiment = Number(row.sentiment_score ?? 0.5)
    const rating = Number(row.rating ?? 5)
    return sentiment < 0.35 || rating <= 2
  })

  const totalComplaints = complaintRows.length
  const avgSentiment = (() => {
    if (trendRows.length > 0) {
      const sum = trendRows.reduce((acc, row) => acc + Number(row.avg_sentiment ?? 0), 0)
      return sum / trendRows.length
    }
    if (reviewRows.length === 0) return 0.5
    const sum = reviewRows.reduce((acc, row) => acc + Number(row.sentiment_score ?? 0.5), 0)
    return sum / reviewRows.length
  })()

  const hasIssue = totalComplaints >= 3 || avgSentiment < 0.45
  if (!hasIssue) {
    return { issues: [], actions: [] }
  }

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
  if (trendRows.length >= 2) {
    const sorted = [...trendRows].sort((a, b) => new Date(a['@timestamp']).getTime() - new Date(b['@timestamp']).getTime())
    const oldest = sorted[0]
    const newest = sorted[sorted.length - 1]
    const oldComplaints = Number(oldest.complaint_count ?? 0)
    const newComplaints = Number(newest.complaint_count ?? 0)
    if (newComplaints > oldComplaints * 1.3) {
      trend = 'increasing'
    } else if (newComplaints < oldComplaints * 0.7) {
      trend = 'decreasing'
    }
  }

  let confidence: 'high' | 'medium' | 'low' = 'medium'
  if (totalComplaints >= 15 || avgSentiment < 0.3) {
    confidence = 'high'
  } else if (totalComplaints < 5 && avgSentiment >= 0.42) {
    confidence = 'low'
  }

  const uniquePlatforms = Array.from(new Set(reviewRows.map((row) => row.platform).filter(Boolean))) as string[]
  const evidenceSource = complaintRows.length > 0 ? complaintRows : reviewRows
  const evidence = evidenceSource
    .slice(0, 3)
    .map((row) => (row.review_text ?? '').toString().trim())
    .filter(Boolean)

  if (evidence.length === 0) {
    evidence.push('Detected anomalies in sentiment trends for this product over the last 30 days.')
  }

  const issueId = `issue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const issue: AnalyzeResponse['issues'][0] = {
    id: issueId,
    title: totalComplaints >= 5
      ? `High Complaint Volume Detected for ${product}`
      : `Sentiment Decline Detected for ${product}`,
    description: `Detected ${totalComplaints} recent complaints with an average sentiment score of ${avgSentiment.toFixed(2)}.`,
    confidence,
    platforms: uniquePlatforms.length > 0 ? uniquePlatforms : ['Multiple Platforms'],
    trend,
    reviewCount: totalComplaints || reviewRows.length,
    firstDetected: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    evidence
  }

  const issues: AnalyzeResponse['issues'] = [issue]
  const actions: AnalyzeResponse['actions'] = []

  try {
    await createIssueRecord(issue, product)
    actions.push({
      type: 'issue_created',
      status: 'success',
      message: `Issue #${issueId} created in tracking system`,
      timestamp: new Date().toLocaleString()
    })
  } catch (error) {
    console.error('Error creating issue record:', error)
    actions.push({
      type: 'issue_created',
      status: 'failed',
      message: 'Failed to create issue record',
      timestamp: new Date().toLocaleString()
    })
  }

  return { issues, actions }
}

// Create issue record in Elasticsearch
async function createIssueRecord(issue: AnalyzeResponse['issues'][0], product: string): Promise<void> {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY

  if (!baseUrl || !apiKey) {
    console.warn('Elastic credentials not configured, skipping issue creation')
    return
  }

  try {
    const url = baseUrl.replace(':9243', '').replace(':443', '')
    const indexUrl = `${url}/issues/_doc`

    const document = {
      product,
      title: issue.title,
      description: issue.description,
      confidence: issue.confidence,
      platforms: issue.platforms,
      trend: issue.trend,
      review_count: issue.reviewCount,
      first_detected: issue.firstDetected,
      created_at: new Date().toISOString(),
      status: 'open',
      issue_id: issue.id
    }

    const response = await fetch(indexUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`
      },
      body: JSON.stringify(document)
    })

    if (!response.ok) {
      // Try to create index if it doesn't exist
      if (response.status === 404) {
        await createIssuesIndex(url, apiKey)
        // Retry creating the document
        const retryResponse = await fetch(indexUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${apiKey}`
          },
          body: JSON.stringify(document)
        })
        if (!retryResponse.ok) {
          throw new Error(`Failed to create issue: ${retryResponse.statusText}`)
        }
      } else {
        throw new Error(`Failed to create issue: ${response.statusText}`)
      }
    }
  } catch (error) {
    console.error('Error creating issue record in Elasticsearch:', error)
    throw error
  }
}

// Create issues index if it doesn't exist
async function createIssuesIndex(baseUrl: string, apiKey: string): Promise<void> {
  const indexUrl = `${baseUrl}/issues`
  const mapping = {
    mappings: {
      properties: {
        product: { type: 'keyword' },
        title: { type: 'text' },
        description: { type: 'text' },
        confidence: { type: 'keyword' },
        platforms: { type: 'keyword' },
        trend: { type: 'keyword' },
        review_count: { type: 'integer' },
        first_detected: { type: 'date' },
        created_at: { type: 'date' },
        status: { type: 'keyword' },
        issue_id: { type: 'keyword' }
      }
    }
  }

  const response = await fetch(indexUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${apiKey}`
    },
    body: JSON.stringify(mapping)
  })

  if (!response.ok && response.status !== 400) {
    // 400 might mean index already exists, which is fine
    console.warn('Could not create issues index:', await response.text())
  }
}

// Fallback mock data function
function getMockResults(product: string): Omit<AnalyzeResponse, 'success' | 'error'> {
  return {
    issues: [
      {
        id: `issue-${Date.now()}-1`,
        title: 'Packaging Leakage Issue',
        description: `Multiple customers reporting product leakage from packaging for ${product}. Issue appears to be affecting product integrity during shipping.`,
        confidence: 'high',
        platforms: ['Marketplace A', 'Marketplace B'],
        trend: 'increasing',
        reviewCount: 18,
        firstDetected: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        evidence: [
          'Product arrived with leaking container, very disappointed',
          'Package was damaged and contents spilled out',
          'Leakage issue - needs immediate attention'
        ]
      }
    ],
    actions: [
      {
        type: 'issue_created',
        status: 'success',
        message: `Issue analyzed for ${product}`,
        timestamp: new Date().toLocaleString()
      }
    ]
  }
}
