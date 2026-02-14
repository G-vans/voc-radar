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

  // Generate mock data (like a Rails method that creates sample data)
  const generateMockResults = (product: string) => {
    // Mock issue data
    const mockIssues: Issue[] = [
      {
        id: 'issue-1',
        title: 'Packaging Leakage Issue',
        description: 'Multiple customers reporting product leakage from packaging. Issue appears to be affecting product integrity during shipping.',
        confidence: 'high',
        platforms: ['Marketplace A', 'Marketplace B'],
        trend: 'increasing',
        reviewCount: 18,
        firstDetected: 'Feb 22, 2026',
        evidence: [
          'Product arrived with leaking container, very disappointed',
          'Package was damaged and contents spilled out',
          'Leakage issue - needs immediate attention'
        ]
      },
      {
        id: 'issue-2',
        title: 'Quality Degradation Concerns',
        description: 'Customers noticing decline in product quality compared to previous purchases.',
        confidence: 'medium',
        platforms: ['Marketplace A'],
        trend: 'stable',
        reviewCount: 7,
        firstDetected: 'Feb 20, 2026',
        evidence: [
          'Quality not as good as before',
          'Seems different from what I ordered last time'
        ]
      }
    ]

    // Mock actions taken
    const mockActions: Action[] = [
      {
        type: 'issue_created',
        status: 'success',
        message: 'Issue #1234 created in tracking system',
        timestamp: new Date().toLocaleString()
      },
      {
        type: 'response_drafted',
        status: 'success',
        message: 'Customer response template generated',
        timestamp: new Date().toLocaleString()
      }
    ]

    return { issues: mockIssues, actions: mockActions }
  }

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
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i])
      
      // Wait before moving to next step
      // In real app, we'll wait for API response instead
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // When complete, show results
    const results = generateMockResults(product)
    setIssues(results.issues)
    setActions(results.actions)

    // After showing results for a while, reset (optional)
    // setTimeout(() => {
    //   setCurrentStep('idle')
    //   setIssues([])
    //   setActions([])
    // }, 10000)
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
