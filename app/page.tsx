// This is the main dashboard page (like home/index.html.erb)
// We'll build this step by step

'use client' // Need this because we'll use useState

import { useState } from 'react'
import ProductSelector from '@/components/ProductSelector'
import AgentStatus, { type AgentStep } from '@/components/AgentStatus'
import ResultsDisplay, { type Issue, type Action } from '@/components/ResultsDisplay'

export default function Home() {
  // State to track agent progress (like @current_step = 'idle' in Rails)
  const [currentStep, setCurrentStep] = useState<AgentStep>('idle')
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [actions, setActions] = useState<Action[]>([])

  // Handler function (like a Rails controller action)
  const handleAnalyze = async (product: string) => {
    console.log('Analyzing product:', product)
    setSelectedProduct(product)
    
    // Clear previous results
    setIssues([])
    setActions([])
    
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
    // This simulates the agent working through steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i])
      
      // Wait before moving to next step
      // In real app, we'll wait for API response instead
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Call the API endpoint (like making a request in Rails)
    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Set results from API response
        setIssues(data.issues || [])
        setActions(data.actions || [])
      } else {
        console.error('API returned error:', data.error)
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Error calling API:', error)
      // You could show an error message to the user here
      // For now, we'll just log it
    }
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

      {/* Results Display - Shows issues and actions */}
      <ResultsDisplay
        issues={issues}
        actions={actions}
        productName={selectedProduct || undefined}
      />
    </main>
  )
}
