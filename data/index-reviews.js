// Script to create Elasticsearch index and upload review data
// Requires .env.local with ELASTIC_BASE_URL and ELASTIC_API_KEY

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

const INDEX_NAME = 'customer_reviews'

async function createIndex() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('Missing ELASTIC_BASE_URL or ELASTIC_API_KEY in .env.local')
  }

  // Remove port from URL if present (Elastic Cloud uses different format)
  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const indexUrl = `${url}/${INDEX_NAME}`

  console.log('Creating Elasticsearch index...')
  console.log(`Index: ${INDEX_NAME}`)
  console.log(`URL: ${indexUrl}`)

  // Read mapping
  const mappingPath = path.join(__dirname, '..', 'elastic', 'index-mapping.json')
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))

  try {
    // Check if index exists
    const checkResponse = await fetch(indexUrl, {
      method: 'HEAD',
      headers: {
        'Authorization': `ApiKey ${apiKey}`
      }
    })

    if (checkResponse.ok) {
      console.log('Index already exists. Deleting...')
      await fetch(indexUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `ApiKey ${apiKey}`
        }
      })
    }

    // Create index with mapping
    const createResponse = await fetch(indexUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`
      },
      body: JSON.stringify(mapping)
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Failed to create index: ${createResponse.status} ${errorText}`)
    }

    console.log('✅ Index created successfully!')
    return true
  } catch (error) {
    console.error('Error creating index:', error.message)
    throw error
  }
}

async function indexReviews() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('Missing ELASTIC_BASE_URL or ELASTIC_API_KEY in .env.local')
  }

  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const bulkUrl = `${url}/_bulk`

  // Read reviews
  const reviewsPath = path.join(__dirname, 'reviews.json')
  if (!fs.existsSync(reviewsPath)) {
    throw new Error(`Reviews file not found: ${reviewsPath}\nRun generate-reviews.js first!`)
  }

  const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'))
  console.log(`\nIndexing ${reviews.length} reviews...`)

  // Prepare bulk request
  // Elasticsearch bulk format: action\n{data}\naction\n{data}...
  let bulkBody = ''
  reviews.forEach(review => {
    bulkBody += JSON.stringify({ index: { _index: INDEX_NAME } }) + '\n'
    bulkBody += JSON.stringify(review) + '\n'
  })

  try {
    const response = await fetch(bulkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Authorization': `ApiKey ${apiKey}`
      },
      body: bulkBody
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to index reviews: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      console.error('Some errors occurred during indexing:')
      console.error(JSON.stringify(result, null, 2))
    } else {
      console.log(`✅ Successfully indexed ${result.items.length} reviews!`)
    }

    return true
  } catch (error) {
    console.error('Error indexing reviews:', error.message)
    throw error
  }
}

async function verifyIndex() {
  const baseUrl = process.env.ELASTIC_BASE_URL
  const apiKey = process.env.ELASTIC_API_KEY
  const url = baseUrl.replace(':9243', '').replace(':443', '')
  const countUrl = `${url}/${INDEX_NAME}/_count`

  try {
    const response = await fetch(countUrl, {
      headers: {
        'Authorization': `ApiKey ${apiKey}`
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`\n✅ Index verification: ${result.count} documents in index`)
    }
  } catch (error) {
    console.error('Error verifying index:', error.message)
  }
}

async function main() {
  try {
    // Step 1: Generate reviews if needed
    const reviewsPath = path.join(__dirname, 'reviews.json')
    if (!fs.existsSync(reviewsPath)) {
      console.log('Reviews file not found. Generating reviews...')
      const { generateAllReviews } = require('./generate-reviews.js')
      const reviews = generateAllReviews()
      fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2))
      console.log('✅ Reviews generated!')
    }

    // Step 2: Create index
    await createIndex()

    // Step 3: Index reviews
    await indexReviews()

    // Step 4: Verify
    await verifyIndex()

    console.log('\n🎉 All done! Your Elasticsearch index is ready.')
    console.log(`\nIndex name: ${INDEX_NAME}`)
    console.log('You can now create the agent and tools!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createIndex, indexReviews }
