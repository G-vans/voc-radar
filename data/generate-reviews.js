// Synthetic Review Data Generator
// Generates realistic customer review data for Elasticsearch

const fs = require('fs')
const path = require('path')

// Products to generate reviews for
const PRODUCTS = ['Product A', 'Product B', 'Product C']

// Platforms
const PLATFORMS = ['Marketplace A', 'Marketplace B', 'Marketplace C']

// Review templates with different sentiments
const POSITIVE_REVIEWS = [
  'Great product! Very satisfied with my purchase.',
  'Excellent quality, exactly as described.',
  'Love it! Would definitely buy again.',
  'Amazing value for money. Highly recommend!',
  'Perfect! Fast shipping and great packaging.',
  'Outstanding product quality. Exceeded expectations.',
  'Very happy with this purchase. Great customer service too.',
  'Top quality product. Will order more soon.'
]

const NEUTRAL_REVIEWS = [
  'Product is okay, nothing special.',
  'It works as expected, but could be better.',
  'Average product, does the job.',
  'Decent quality, but not exceptional.',
  'It\'s fine, but I expected more.',
  'Okay product, meets basic requirements.'
]

const NEGATIVE_REVIEWS = [
  'Product arrived damaged. Very disappointed.',
  'Poor quality, not worth the price.',
  'Packaging was leaking when it arrived.',
  'Quality has gone down since last purchase.',
  'Not as described. Very disappointed.',
  'Product leaked during shipping. Container was broken.',
  'Packaging issue - contents spilled out.',
  'Quality degradation noticed. Not the same as before.',
  'Leakage problem with packaging. Needs immediate attention.',
  'Product arrived with leaking container, very disappointed.',
  'Package was damaged and contents spilled out.',
  'Leakage issue - needs immediate attention.',
  'Quality not as good as before.',
  'Seems different from what I ordered last time.',
  'Packaging leakage is a serious problem.',
  'Multiple issues with product quality lately.'
]

// Generate a single review
function generateReview(product, platform, daysAgo) {
  // Determine sentiment (weighted: 60% positive, 20% neutral, 20% negative)
  const rand = Math.random()
  let sentimentLabel, sentimentScore, reviewText, rating

  if (rand < 0.6) {
    // Positive
    sentimentLabel = 'positive'
    sentimentScore = 0.7 + Math.random() * 0.3 // 0.7 to 1.0
    reviewText = POSITIVE_REVIEWS[Math.floor(Math.random() * POSITIVE_REVIEWS.length)]
    rating = 4 + Math.floor(Math.random() * 2) // 4 or 5
  } else if (rand < 0.8) {
    // Neutral
    sentimentLabel = 'neutral'
    sentimentScore = 0.4 + Math.random() * 0.3 // 0.4 to 0.7
    reviewText = NEUTRAL_REVIEWS[Math.floor(Math.random() * NEUTRAL_REVIEWS.length)]
    rating = 3
  } else {
    // Negative
    sentimentLabel = 'negative'
    sentimentScore = Math.random() * 0.4 // 0.0 to 0.4
    reviewText = NEGATIVE_REVIEWS[Math.floor(Math.random() * NEGATIVE_REVIEWS.length)]
    rating = 1 + Math.floor(Math.random() * 2) // 1 or 2
  }

  // Generate timestamp (days ago)
  const timestamp = new Date()
  timestamp.setDate(timestamp.getDate() - daysAgo)
  timestamp.setHours(Math.floor(Math.random() * 24))
  timestamp.setMinutes(Math.floor(Math.random() * 60))

  return {
    product,
    platform,
    review_text: reviewText,
    rating,
    sentiment_score: parseFloat(sentimentScore.toFixed(2)),
    sentiment_label: sentimentLabel,
    review_id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    '@timestamp': timestamp.toISOString()
  }
}

// Generate reviews for a product
function generateProductReviews(product, count = 200) {
  const reviews = []
  const platforms = [...PLATFORMS]
  
  // Distribute reviews across platforms
  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const daysAgo = Math.floor(Math.random() * 90) // Last 90 days
    
    reviews.push(generateReview(product, platform, daysAgo))
  }

  // Add some recent negative reviews to create issues (for demo)
  // This simulates emerging problems
  if (product === 'Product A') {
    // Add recent packaging issues
    for (let i = 0; i < 15; i++) {
      reviews.push({
        product,
        platform: 'Marketplace A',
        review_text: 'Product arrived with leaking container, very disappointed',
        rating: 1,
        sentiment_score: 0.2,
        sentiment_label: 'negative',
        review_id: `review-issue-${i}`,
        '@timestamp': new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() // Last 5 days
      })
    }
  }

  return reviews
}

// Generate all reviews
function generateAllReviews() {
  const allReviews = []

  PRODUCTS.forEach(product => {
    const productReviews = generateProductReviews(product, 200)
    allReviews.push(...productReviews)
  })

  return allReviews
}

// Main execution
function main() {
  console.log('Generating synthetic review data...')
  
  const reviews = generateAllReviews()
  
  console.log(`Generated ${reviews.length} reviews`)
  console.log(`Products: ${PRODUCTS.join(', ')}`)
  console.log(`Platforms: ${PLATFORMS.join(', ')}`)
  
  // Save to JSON file
  const outputPath = path.join(__dirname, 'reviews.json')
  fs.writeFileSync(outputPath, JSON.stringify(reviews, null, 2))
  
  console.log(`\n✅ Reviews saved to: ${outputPath}`)
  console.log(`\nNext step: Index this data into Elasticsearch`)
  console.log(`Use the index-reviews.js script to upload to Elasticsearch`)
}

if (require.main === module) {
  main()
}

module.exports = { generateAllReviews, generateProductReviews }
