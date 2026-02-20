// Test script to find the correct agent API endpoint
require('dotenv').config({ path: '.env.local' })

async function testAgentAPI() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const agentId = process.env.AGENT_ID || 'voc-analysis-agent'

  if (!baseUrl || !apiKey) {
    throw new Error('Missing credentials')
  }

  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const kibanaUrl = url.replace('.es.', '.kb.')

  // Test different endpoint formats
  const endpoints = [
    `${kibanaUrl}/api/agent_builder/agents/${agentId}/chat`,
    `${kibanaUrl}/api/agent_builder/conversations`,
    `${kibanaUrl}/api/agent_builder/agents/${agentId}/execute`,
    `${kibanaUrl}/api/agent_builder/chat`,
  ]

  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${apiKey}`,
          'kbn-xsrf': 'true'
        },
        body: JSON.stringify({
          message: 'Test message',
          stream: false,
          ...(endpoint.includes('conversations') ? { agent_id: agentId } : {})
        })
      })

      console.log(`Status: ${response.status}`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ SUCCESS! This endpoint works!')
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500))
        return endpoint
      } else {
        const error = await response.text()
        console.log(`❌ Failed: ${error.substring(0, 200)}`)
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
  }

  console.log('\n⚠️  None of the endpoints worked. Check Kibana API documentation.')
}

testAgentAPI().catch(console.error)
