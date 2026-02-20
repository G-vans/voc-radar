// Script to discover the correct API endpoints
require('dotenv').config({ path: '.env.local' })

async function discoverEndpoints() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const agentId = process.env.AGENT_ID || 'voc-analysis-agent'

  if (!baseUrl || !apiKey) {
    throw new Error('Missing credentials')
  }

  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const kibanaUrl = url.replace('.es.', '.kb.')

  // Try to discover API structure
  const basePaths = [
    '/api/agent_builder',
    '/internal/agent_builder',
    '/api/ai_assistant',
    '/api/assistant',
    '/api/agents',
  ]

  console.log('🔍 Discovering API endpoints...\n')

  for (const basePath of basePaths) {
    const testUrl = `${kibanaUrl}${basePath}`
    console.log(`Testing base path: ${testUrl}`)
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `ApiKey ${apiKey}`,
          'kbn-xsrf': 'true'
        }
      })

      console.log(`  Status: ${response.status}`)
      
      if (response.status !== 404) {
        const text = await response.text()
        console.log(`  Response (first 200 chars): ${text.substring(0, 200)}`)
        
        if (response.ok) {
          console.log(`  ✅ Found valid base path: ${basePath}`)
        }
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`)
    }
    console.log('')
  }

  // Also try the agent-specific endpoints with different formats
  console.log('\n📋 Testing agent-specific endpoints:\n')
  
  const agentEndpoints = [
    `${kibanaUrl}/api/agent_builder/agents/${agentId}`,
    `${kibanaUrl}/api/agent_builder/agents/${agentId}/_chat`,
    `${kibanaUrl}/api/agent_builder/agents/${agentId}/messages`,
    `${kibanaUrl}/internal/agent_builder/agents/${agentId}/chat`,
  ]

  for (const endpoint of agentEndpoints) {
    console.log(`Testing: ${endpoint}`)
    try {
      const response = await fetch(endpoint, {
        method: 'GET', // Try GET first to see if endpoint exists
        headers: {
          'Authorization': `ApiKey ${apiKey}`,
          'kbn-xsrf': 'true'
        }
      })
      console.log(`  Status: ${response.status}`)
      if (response.status !== 404) {
        console.log(`  ✅ Endpoint exists! Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`)
    }
    console.log('')
  }
}

discoverEndpoints().catch(console.error)
