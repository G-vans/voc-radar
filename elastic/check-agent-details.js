// Check agent details to find the correct API format
require('dotenv').config({ path: '.env.local' })

async function checkAgentDetails() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const agentId = process.env.AGENT_ID || 'voc-analysis-agent'

  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const kibanaUrl = url.replace('.es.', '.kb.')
  const agentUrl = `${kibanaUrl}/api/agent_builder/agents/${agentId}`

  console.log('Fetching agent details from:', agentUrl)

  try {
    const response = await fetch(agentUrl, {
      method: 'GET',
      headers: {
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true'
      }
    })

    if (response.ok) {
      const agent = await response.json()
      console.log('\n✅ Agent Details:')
      console.log(JSON.stringify(agent, null, 2))
      
      // Now try to find chat endpoint
      console.log('\n🔍 Trying chat endpoints...\n')
      
      const chatEndpoints = [
        `${agentUrl}/chat`,
        `${agentUrl}/_chat`,
        `${agentUrl}/execute`,
        `${agentUrl}/invoke`,
        `${kibanaUrl}/api/agent_builder/chat?agentId=${agentId}`,
        `${kibanaUrl}/api/agent_builder/conversations?agent_id=${agentId}`,
      ]

      for (const endpoint of chatEndpoints) {
        console.log(`Testing: ${endpoint}`)
        try {
          const chatResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `ApiKey ${apiKey}`,
              'kbn-xsrf': 'true'
            },
            body: JSON.stringify({
              message: 'Test',
              stream: false
            })
          })
          console.log(`  Status: ${chatResponse.status}`)
          if (chatResponse.ok) {
            console.log(`  ✅ SUCCESS! Use this endpoint: ${endpoint}`)
            const data = await chatResponse.json()
            console.log(`  Response: ${JSON.stringify(data, null, 2).substring(0, 300)}`)
            return endpoint
          } else {
            const error = await chatResponse.text()
            console.log(`  ❌ ${error.substring(0, 100)}`)
          }
        } catch (error) {
          console.log(`  ❌ Error: ${error.message}`)
        }
        console.log('')
      }
    } else {
      console.error('Failed to get agent:', response.status, await response.text())
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkAgentDetails().catch(console.error)
