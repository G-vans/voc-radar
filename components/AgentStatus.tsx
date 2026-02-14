// AgentStatus Component
// Shows the agent's progress through multiple steps
// Like a progress indicator, but for agent actions

'use client'

// Define the different steps the agent goes through
export type AgentStep = 
  | 'idle'                    // Not running
  | 'fetching_reviews'         // Step 1: Getting reviews from Elasticsearch
  | 'analyzing_trends'         // Step 2: Running ES|QL trend analysis
  | 'detecting_issues'         // Step 3: Agent reasoning about issues
  | 'creating_issue'           // Step 4: Triggering workflow to create issue
  | 'complete'                 // All done!

interface AgentStatusProps {
  currentStep: AgentStep
  productName?: string
}

// Step labels for display (user-friendly names)
const STEP_LABELS: Record<AgentStep, string> = {
  idle: '',
  fetching_reviews: 'Fetching recent reviews',
  analyzing_trends: 'Analyzing sentiment trends',
  detecting_issues: 'Detecting emerging issues',
  creating_issue: 'Creating issue record',
  complete: 'Analysis complete'
}

// Step descriptions (what's happening)
const STEP_DESCRIPTIONS: Record<AgentStep, string> = {
  idle: '',
  fetching_reviews: 'Searching Elasticsearch for recent customer reviews...',
  analyzing_trends: 'Running ES|QL queries to detect sentiment shifts...',
  detecting_issues: 'Agent analyzing patterns and making decisions...',
  creating_issue: 'Triggering Elastic Workflow to create issue...',
  complete: 'All steps completed successfully'
}

export default function AgentStatus({ currentStep, productName }: AgentStatusProps) {
  // Don't show anything if agent is idle
  if (currentStep === 'idle') {
    return null
  }

  // Define all steps in order
  const allSteps: AgentStep[] = [
    'fetching_reviews',
    'analyzing_trends',
    'detecting_issues',
    'creating_issue',
    'complete'
  ]

  // Find current step index
  const currentStepIndex = allSteps.indexOf(currentStep)

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Agent Status
        {productName && (
          <span style={{ color: '#666', fontWeight: 'normal', marginLeft: '0.5rem' }}>
            - {productName}
          </span>
        )}
      </h2>

      {/* Progress steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {allSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <div
              key={step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                borderRadius: '4px',
                backgroundColor: isCurrent ? '#e3f2fd' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              {/* Status icon */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted 
                  ? '#4caf50' 
                  : isCurrent 
                    ? '#2196f3' 
                    : '#e0e0e0',
                color: isCompleted || isCurrent ? 'white' : '#999',
                fontWeight: 'bold',
                fontSize: '14px',
                flexShrink: 0
              }}>
                {isCompleted ? '✓' : isCurrent ? '⟳' : index + 1}
              </div>

              {/* Step info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: isCurrent ? '600' : '400',
                  color: isCompleted ? '#4caf50' : isCurrent ? '#2196f3' : '#666',
                  marginBottom: '0.25rem'
                }}>
                  {STEP_LABELS[step]}
                </div>
                {isCurrent && (
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#666'
                  }}>
                    {STEP_DESCRIPTIONS[step]}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
