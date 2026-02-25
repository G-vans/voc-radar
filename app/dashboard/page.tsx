// Dashboard page moved from app/page.tsx
'use client'

import { useState } from 'react'
import ProductSelector from '@/components/ProductSelector'
import AgentStatus, { type AgentStep } from '@/components/AgentStatus'
import ResultsDisplay, { type Issue, type Action } from '@/components/ResultsDisplay'

export default function DashboardPage() {
  const [currentStep, setCurrentStep] = useState<AgentStep>('idle')
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [actions, setActions] = useState<Action[]>([])

  const handleAnalyze = async (product: string) => {
    console.log('Analyzing product:', product)
    setSelectedProduct(product)
    setIssues([])
    setActions([])

    const steps: AgentStep[] = [
      'fetching_reviews',
      'analyzing_trends',
      'detecting_issues',
      'creating_issue',
      'complete'
    ]

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setIssues(data.issues || [])
        setActions(data.actions || [])
      } else {
        console.error('API returned error:', data.error)
      }
    } catch (error) {
      console.error('Error calling API:', error)
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>VOC Radar</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Customer Feedback Monitor</p>
      </header>

      <ProductSelector onAnalyze={handleAnalyze} />

      <AgentStatus
        currentStep={currentStep}
        productName={selectedProduct || undefined}
      />

      <ResultsDisplay
        issues={issues}
        actions={actions}
        productName={selectedProduct || undefined}
      />
    </main>
  )
}
