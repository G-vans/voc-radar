// This is the main dashboard page (like home/index.html.erb)
// We'll build this step by step

'use client' // Need this because we'll use useState

import { useState } from 'react'
import ProductSelector from '@/components/ProductSelector'

export default function Home() {
  // State to track if analysis is running (like @analyzing = false in Rails)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  // Handler function (like a Rails controller action)
  const handleAnalyze = async (product: string) => {
    console.log('Analyzing product:', product)
    setSelectedProduct(product)
    setIsAnalyzing(true)
    
    // TODO: Call API endpoint here
    // For now, just simulate
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>VOC Radar</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Customer Feedback Monitor</p>
      </header>
      
      {/* Product Selector Component */}
      <ProductSelector onAnalyze={handleAnalyze} />
      
      {/* Status message */}
      {isAnalyzing && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          Analyzing reviews for {selectedProduct}...
        </div>
      )}
    </main>
  )
}
