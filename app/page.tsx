// This is the main dashboard page (like home/index.html.erb)
// We'll build this step by step

'use client' // Need this because we'll use useState

import { useState } from 'react'
import ProductSelector from '@/components/ProductSelector'
import AgentStatus, { type AgentStep } from '@/components/AgentStatus'

export default function Home() {
  // State to track agent progress (like @current_step = 'idle' in Rails)
  const [currentStep, setCurrentStep] = useState<AgentStep>('idle')
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  // Handler function (like a Rails controller action)
  const handleAnalyze = async (product: string) => {
    console.log('Analyzing product:', product)
    setSelectedProduct(product)
    
    // Simulate agent progress through steps
    // In real app, this will be driven by API responses
    const steps: AgentStep[] = [
      'fetching_reviews',
      'analyzing_trends',
      'detecting_issues',
      'creating_issue',
      'complete'
    ]

    // Go through each step with a delay (like a progress bar)
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i])
      
      // Wait before moving to next step
      // In real app, we'll wait for API response instead
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // After completion, reset after a delay
    setTimeout(() => {
      setCurrentStep('idle')
    }, 3000)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>VOC Radar</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Customer Feedback Monitor</p>
      </header>
      
      {/* Product Selector Component */}
      <ProductSelector onAnalyze={handleAnalyze} />
      
      {/* Agent Status Component - Shows multi-step progress */}
      <AgentStatus 
        currentStep={currentStep} 
        productName={selectedProduct || undefined}
      />
    </main>
  )
}
