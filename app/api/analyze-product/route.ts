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

// Helper function to call Elastic Agent Builder
async function analyzeProductWithAgent(product: string): Promise<Omit<AnalyzeResponse, 'success' | 'error'>> {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const agentId = process.env.AGENT_ID || 'voc-analysis-agent' // Default to agent name if ID not set

  if (!baseUrl || !apiKey) {
    console.warn('Elastic credentials not configured, using mock data')
    return getMockResults(product)
  }

  try {
    // Use Elasticsearch endpoint format (as shown in docs)
    // Format: https://deployment.es.region.cloud.es.io:443
    let esUrl = baseUrl
    if (esUrl.includes(':9243')) {
      esUrl = esUrl.replace(':9243', ':443')
    }
    
    // For Agent Builder, we need Kibana URL
    const kibanaUrl = esUrl.replace('.es.', '.kb.').replace(':443', '').replace(':9243', '')
    
    console.log(`Using Kibana URL: ${kibanaUrl}`)
    console.log(`Agent ID: ${agentId}`)
    
    // Try conversation-based approach (create conversation, then send message)
    // Step 1: Create or get conversation
    const conversationsUrl = `${kibanaUrl}/api/agent_builder/conversations`
    
    console.log('Step 1: Creating/getting conversation...')
    let convResponse = await fetch(conversationsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true'
      },
      body: JSON.stringify({
        agent_id: agentId
      })
    })

    console.log(`Conversation creation status: ${convResponse.status}`)

    let conversationId = null
    if (convResponse.ok) {
      const convData = await convResponse.json()
      conversationId = convData.id || convData.conversation_id
      console.log(`✅ Conversation created: ${conversationId}`)
    } else if (convResponse.status === 409) {
      // Conversation might already exist, try to get it
      console.log('Conversation might exist, trying to get list...')
      const listResponse = await fetch(conversationsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `ApiKey ${apiKey}`,
          'kbn-xsrf': 'true'
        }
      })
      if (listResponse.ok) {
        const conversations = await listResponse.json()
        const existingConv = conversations.find((c: any) => c.agent_id === agentId)
        if (existingConv) {
          conversationId = existingConv.id || existingConv.conversation_id
          console.log(`✅ Using existing conversation: ${conversationId}`)
        }
      }
    }

    // Step 2: Send message to conversation
    if (conversationId) {
      const messageUrl = `${kibanaUrl}/api/agent_builder/conversations/${conversationId}/messages`
      console.log(`Step 2: Sending message to conversation ${conversationId}...`)
      
      const response = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${apiKey}`,
          'kbn-xsrf': 'true'
        },
        body: JSON.stringify({
          message: `Analyze reviews for ${product}. Identify any emerging issues, sentiment trends, and provide actionable insights.`,
          stream: false
        })
      })

      console.log(`Message response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Message API error:', response.status, errorText)
        throw new Error(`Message API error: ${response.status} ${errorText}`)
      }

      const agentResponse = await response.json()
      console.log('Agent response received:', JSON.stringify(agentResponse, null, 2).substring(0, 500))
      
      // Parse agent response and convert to our format
      return await parseAgentResponse(agentResponse, product)
    } else {
      throw new Error('Could not create or find conversation')
    }

  } catch (error) {
    console.error('Error calling Elastic Agent Builder:', error)
    // Fallback to mock data if API call fails
    console.warn('Falling back to mock data')
    return getMockResults(product)
  }
}

// Parse agent response and convert to our expected format
async function parseAgentResponse(agentResponse: any, product: string): Promise<Omit<AnalyzeResponse, 'success' | 'error'>> {
  // Extract tool results from agent response
  const toolResults = agentResponse.results?.filter((r: any) => r.type === 'tabular_data') || []
  
  // Try to extract issues from agent's analysis
  const agentMessage = agentResponse.message || agentResponse.content || ''
  
  const issues: AnalyzeResponse['issues'] = []
  const actions: AnalyzeResponse['actions'] = []

  // Analyze tool results to detect issues
  const trendData = toolResults.find((r: any) => 
    r.data?.columns?.some((c: any) => c.name === 'complaint_count' || c.name === 'avg_sentiment')
  )

  let hasComplaints = false
  let complaintCount = 0
  let avgSentiment = 0.5
  let platforms: string[] = []

  if (trendData?.data?.values) {
    const complaintIndex = trendData.data.columns?.findIndex((c: any) => c.name === 'complaint_count') ?? -1
    const sentimentIndex = trendData.data.columns?.findIndex((c: any) => c.name === 'avg_sentiment') ?? -1
    
    // Sum up complaints and calculate average sentiment
    let totalComplaints = 0
    let totalSentiment = 0
    let sentimentCount = 0

    trendData.data.values.forEach((row: any[]) => {
      if (complaintIndex >= 0 && row[complaintIndex]) {
        totalComplaints += Number(row[complaintIndex]) || 0
      }
      if (sentimentIndex >= 0 && row[sentimentIndex]) {
        totalSentiment += Number(row[sentimentIndex]) || 0
        sentimentCount++
      }
    })

    complaintCount = totalComplaints
    hasComplaints = complaintCount > 5 // Threshold: more than 5 complaints
    avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0.5
  }

  // Check recent reviews for platforms
  const reviewData = toolResults.find((r: any) => 
    r.data?.columns?.some((c: any) => c.name === 'platform')
  )
  if (reviewData?.data?.values) {
    const platformIndex = reviewData.data.columns?.findIndex((c: any) => c.name === 'platform') ?? -1
    if (platformIndex >= 0) {
      const uniquePlatforms = new Set<string>()
      reviewData.data.values.forEach((row: any[]) => {
        if (row[platformIndex]) {
          uniquePlatforms.add(String(row[platformIndex]))
        }
      })
      platforms = Array.from(uniquePlatforms)
    }
  }

  // Determine if we have significant issues
  const hasIssues = hasComplaints || avgSentiment < 0.4 || agentMessage.toLowerCase().includes('issue') || agentMessage.toLowerCase().includes('problem')

  if (hasIssues) {
    // Determine confidence and trend
    let confidence: 'high' | 'medium' | 'low' = 'medium'
    if (complaintCount > 10 || avgSentiment < 0.3) {
      confidence = 'high'
    } else if (complaintCount < 3) {
      confidence = 'low'
    }

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (trendData?.data?.values && trendData.data.values.length >= 2) {
      const recent = trendData.data.values[0]
      const older = trendData.data.values[trendData.data.values.length - 1]
      const complaintIndex = trendData.data.columns?.findIndex((c: any) => c.name === 'complaint_count') ?? -1
      if (complaintIndex >= 0) {
        const recentComplaints = Number(recent[complaintIndex]) || 0
        const olderComplaints = Number(older[complaintIndex]) || 0
        if (recentComplaints > olderComplaints * 1.5) {
          trend = 'increasing'
        } else if (recentComplaints < olderComplaints * 0.7) {
          trend = 'decreasing'
        }
      }
    }

    const issueId = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const issue = {
      id: issueId,
      title: hasComplaints 
        ? `High Complaint Volume Detected for ${product}`
        : `Sentiment Decline Detected for ${product}`,
      description: agentMessage.substring(0, 500) || 
        `Agent detected issues for ${product}. ${complaintCount} complaints found, average sentiment: ${avgSentiment.toFixed(2)}.`,
      confidence,
      platforms: platforms.length > 0 ? platforms : ['Multiple Platforms'],
      trend,
      reviewCount: complaintCount || reviewData?.data?.values?.length || 0,
      firstDetected: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      evidence: extractEvidence(toolResults)
    }

    issues.push(issue)

    // Create issue record in Elasticsearch
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

// Extract evidence from tool results
function extractEvidence(toolResults: any[]): string[] {
  const evidence: string[] = []
  
  toolResults.forEach((result: any) => {
    if (result.data?.values) {
      // Get sample review texts or complaint data
      const reviewTextIndex = result.data.columns?.findIndex((c: any) => 
        c.name === 'review_text' || c.name === 'reviewText'
      ) ?? -1
      
      if (reviewTextIndex >= 0) {
        result.data.values.slice(0, 3).forEach((row: any[]) => {
          if (row[reviewTextIndex]) {
            evidence.push(String(row[reviewTextIndex]).substring(0, 100))
          }
        })
      }
    }
  })

  return evidence.length > 0 ? evidence : ['Analysis completed - see agent response for details']
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
