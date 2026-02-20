// Try conversations API approach
require('dotenv').config({ path: '.env.local' })

async function tryConversations() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const agentId = process.env.AGENT_ID || 'voc-analysis-agent'

  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const kibanaUrl = url.replace('.es.', '.kb.')

  // Try creating a conversation first
  console.log('1. Trying to create a conversation...\n')
  
  const createConvUrl = `${kibanaUrl}/api/agent_builder/conversations`
  console.log(`POST ${createConvUrl}`)
  
  try {
    const createResponse = await fetch(createConvUrl, {
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

    console.log(`Status: ${createResponse.status}`)
    const createData = await createResponse.text()
    console.log(`Response: ${createData.substring(0, 300)}`)

    if (createResponse.ok) {
      const conv = JSON.parse(createData)
      console.log(`\n✅ Conversation created! ID: ${conv.id || conv.conversation_id}`)
      
      // Try sending a message to the conversation
      const convId = conv.id || conv.conversation_id
      const messageUrl = `${kibanaUrl}/api/agent_builder/conversations/${convId}/messages`
      
      console.log(`\n2. Sending message to conversation...\n`)
      console.log(`POST ${messageUrl}`)
      
      const messageResponse = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${apiKey}`,
          'kbn-xsrf': 'true'
        },
        body: JSON.stringify({
          message: 'Analyze reviews for Product A'
        })
      })

      console.log(`Status: ${messageResponse.status}`)
      const messageData = await messageResponse.text()
      console.log(`Response: ${messageData.substring(0, 500)}`)
      
      if (messageResponse.ok) {
        console.log(`\n✅ SUCCESS! Use this approach:`)
        console.log(`   1. Create conversation: POST /api/agent_builder/conversations`)
        console.log(`   2. Send message: POST /api/agent_builder/conversations/{id}/messages`)
        return true
      }
    }
  } catch (error) {
    console.error('Error:', error.message)
  }

  // Try alternative: direct message endpoint
  console.log('\n3. Trying direct message endpoint...\n')
  const directUrl = `${kibanaUrl}/api/agent_builder/agents/${agentId}/messages`
  console.log(`POST ${directUrl}`)
  
  try {
    const directResponse = await fetch(directUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true'
      },
      body: JSON.stringify({
        message: 'Analyze reviews for Product A',
        stream: false
      })
    })

    console.log(`Status: ${directResponse.status}`)
    const directData = await directResponse.text()
    console.log(`Response: ${directData.substring(0, 500)}`)
    
    if (directResponse.ok) {
      console.log(`\n✅ SUCCESS! Use: POST /api/agent_builder/agents/${agentId}/messages`)
      return true
    }
  } catch (error) {
    console.error('Error:', error.message)
  }

  console.log('\n⚠️  None of the approaches worked.')
  console.log('💡 You might need to check Kibana API documentation or use the Kibana UI to chat with the agent.')
}

tryConversations().catch(console.error)
