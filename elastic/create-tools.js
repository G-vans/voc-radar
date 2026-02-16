// Script to create custom ES|QL tools in Elastic Agent Builder
// Requires .env.local with ELASTIC_BASE_URL and ELASTIC_API_KEY

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

const TOOLS_DIR = path.join(__dirname, 'tools')

async function createTool(toolConfig) {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('Missing ELASTIC_BASE_URL or ELASTIC_API_KEY in .env.local')
  }

  // Remove port and construct Kibana API URL
  const url = baseUrl.replace(':9243', '').replace(':443', '')
  // Elastic Agent Builder API is typically at /api/agent_builder/tools
  // For Elastic Cloud, we need to use the Kibana API endpoint
  const kibanaUrl = url.replace('.es.', '.kb.')
  const apiUrl = `${kibanaUrl}/api/agent_builder/tools`

  console.log(`\nCreating tool: ${toolConfig.name}`)
  console.log(`URL: ${apiUrl}`)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true' // Required for Kibana API
      },
      body: JSON.stringify(toolConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      // Check if tool already exists (409 conflict)
      if (response.status === 409) {
        console.log(`⚠️  Tool '${toolConfig.name}' already exists. Updating...`)
        
        // Try to update (DELETE then CREATE)
        const deleteUrl = `${apiUrl}/${toolConfig.name}`
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `ApiKey ${apiKey}`,
            'kbn-xsrf': 'true'
          }
        })
        
        // Create again
        const createResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${apiKey}`,
            'kbn-xsrf': 'true'
          },
          body: JSON.stringify(toolConfig)
        })
        
        if (!createResponse.ok) {
          const updateError = await createResponse.text()
          throw new Error(`Failed to update tool: ${createResponse.status} ${updateError}`)
        }
        
        console.log(`✅ Tool '${toolConfig.name}' updated successfully!`)
        return true
      }
      
      throw new Error(`Failed to create tool: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log(`✅ Tool '${toolConfig.name}' created successfully!`)
    console.log(`   ID: ${result.id || toolConfig.name}`)
    return true
  } catch (error) {
    console.error(`❌ Error creating tool '${toolConfig.name}':`, error.message)
    throw error
  }
}

async function listTools() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const kibanaUrl = url.replace('.es.', '.kb.')
  const apiUrl = `${kibanaUrl}/api/agent_builder/tools`

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true'
      }
    })

    if (response.ok) {
      const tools = await response.json()
      console.log(`\n📋 Existing tools (${tools.length || 0}):`)
      if (tools.length > 0) {
        tools.forEach(tool => {
          console.log(`   - ${tool.name} (${tool.type})`)
        })
      }
    }
  } catch (error) {
    console.log('Could not list tools (this is okay)')
  }
}

async function main() {
  try {
    console.log('🚀 Creating Elastic Agent Builder Tools...\n')

    // List existing tools first
    await listTools()

    // Read tool definitions
    const toolFiles = [
      'search-recent-reviews.json',
      'analyze-sentiment-trends.json'
    ]

    for (const toolFile of toolFiles) {
      const toolPath = path.join(TOOLS_DIR, toolFile)
      if (!fs.existsSync(toolPath)) {
        console.error(`❌ Tool file not found: ${toolPath}`)
        continue
      }

      const toolConfig = JSON.parse(fs.readFileSync(toolPath, 'utf8'))
      await createTool(toolConfig)
    }

    console.log('\n🎉 All tools created successfully!')
    console.log('\nNext step: Create the custom agent')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check your .env.local has correct ELASTIC_BASE_URL and ELASTIC_API_KEY')
    console.error('2. Make sure your Elastic Cloud deployment is running')
    console.error('3. Verify Agent Builder is enabled in your deployment')
    console.error('4. Try accessing Kibana to verify your credentials work')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createTool }
