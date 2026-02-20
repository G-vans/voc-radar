// Script to list agents and get the correct agent ID
// Requires .env.local with ELASTIC_BASE_URL and ELASTIC_API_KEY

require('dotenv').config({ path: '.env.local' })

async function listAgents() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('Missing ELASTIC_BASE_URL or ELASTIC_API_KEY in .env.local')
  }

  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const kibanaUrl = url.replace('.es.', '.kb.')
  const apiUrl = `${kibanaUrl}/api/agent_builder/agents`

  console.log('Fetching agents from:', apiUrl)

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to list agents: ${response.status} ${errorText}`)
    }

    const responseData = await response.json()
    
    // Handle different response formats
    const agents = Array.isArray(responseData) 
      ? responseData 
      : responseData.data || responseData.results || responseData.items || []
    
    console.log('\n📋 Available Agents:')
    console.log('='.repeat(50))
    console.log('Response structure:', JSON.stringify(responseData, null, 2).substring(0, 200))
    console.log('='.repeat(50))
    
    if (!Array.isArray(agents) || agents.length === 0) {
      console.log('No agents found or unexpected response format.')
      console.log('Full response:', JSON.stringify(responseData, null, 2))
    } else {
      agents.forEach((agent, index) => {
        console.log(`\n${index + 1}. Agent:`)
        console.log(`   Name: ${agent.name}`)
        console.log(`   ID: ${agent.id || agent.name}`)
        console.log(`   Description: ${agent.description || 'N/A'}`)
        if (agent.tools) {
          console.log(`   Tools: ${agent.tools.map(t => t.name || t).join(', ')}`)
        }
      })
    }

    console.log('\n' + '='.repeat(50))
    console.log('\n💡 Use the agent ID (or name) in your .env.local:')
    console.log('   AGENT_ID=your-agent-id-here')
    
    return agents
  } catch (error) {
    console.error('Error listing agents:', error.message)
    throw error
  }
}

if (require.main === module) {
  listAgents().catch(console.error)
}

module.exports = { listAgents }
