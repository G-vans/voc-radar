// ResultsDisplay Component
// Shows the issues found by the agent and evidence
// Like displaying search results or analysis output

'use client'

// Define the data structure for an issue (like a Ruby class or struct)
export interface Issue {
  id: string
  title: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  platforms: string[]  // Which platforms have this issue
  trend: 'increasing' | 'stable' | 'decreasing'
  reviewCount: number
  firstDetected: string  // Date string
  evidence: string[]     // Sample review snippets
}

// Define the data structure for actions taken
export interface Action {
  type: 'issue_created' | 'response_drafted' | 'alert_sent'
  status: 'success' | 'pending' | 'failed'
  message: string
  timestamp: string
}

interface ResultsDisplayProps {
  issues: Issue[]
  actions: Action[]
  productName?: string
}

export default function ResultsDisplay({ issues, actions, productName }: ResultsDisplayProps) {
  // Don't show anything if no results
  if (issues.length === 0 && actions.length === 0) {
    return null
  }

  // Helper function to get confidence color (like a Ruby method)
  const getConfidenceColor = (confidence: Issue['confidence']) => {
    switch (confidence) {
      case 'high': return '#f44336'    // Red
      case 'medium': return '#ff9800'  // Orange
      case 'low': return '#ffc107'     // Yellow
      default: return '#999'
    }
  }

  // Helper function to get trend icon
  const getTrendIcon = (trend: Issue['trend']) => {
    switch (trend) {
      case 'increasing': return '↑'
      case 'decreasing': return '↓'
      case 'stable': return '→'
      default: return ''
    }
  }

  // Helper function to get action status icon
  const getActionIcon = (status: Action['status']) => {
    switch (status) {
      case 'success': return '✓'
      case 'pending': return '⟳'
      case 'failed': return '✗'
      default: return ''
    }
  }

  return (
    <div>
      {/* Issues Section */}
      {issues.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Issues Detected
            {productName && (
              <span style={{ color: '#666', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                - {productName}
              </span>
            )}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {issues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: '#fafafa'
                }}
              >
                {/* Issue Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#333' }}>
                      {issue.title}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '0.75rem' }}>
                      {issue.description}
                    </p>
                  </div>
                  
                  {/* Confidence Badge */}
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    backgroundColor: getConfidenceColor(issue.confidence),
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {issue.confidence} Confidence
                  </div>
                </div>

                {/* Issue Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {/* Platforms */}
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      Platforms Affected
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      {issue.platforms.join(', ')}
                    </div>
                  </div>

                  {/* Trend */}
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      Trend
                    </div>
                    <div style={{ fontWeight: '500', color: issue.trend === 'increasing' ? '#f44336' : '#666' }}>
                      {getTrendIcon(issue.trend)} {issue.trend} in last 5 days
                    </div>
                  </div>

                  {/* Review Count */}
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      Reviews Found
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      {issue.reviewCount} similar complaints
                    </div>
                  </div>

                  {/* First Detected */}
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      First Detected
                    </div>
                    <div style={{ fontWeight: '500' }}>
                      {issue.firstDetected}
                    </div>
                  </div>
                </div>

                {/* Evidence Section */}
                {issue.evidence.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Evidence (Sample Reviews)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {issue.evidence.map((review, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: '0.875rem',
                            color: '#555',
                            fontStyle: 'italic',
                            paddingLeft: '1rem',
                            borderLeft: '3px solid #2196f3'
                          }}
                        >
                          "{review}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Taken Section */}
      {actions.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Automated Actions Taken
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {actions.map((action, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: action.status === 'success' ? '#e8f5e9' : '#fff3e0',
                  borderRadius: '4px',
                  border: `1px solid ${action.status === 'success' ? '#4caf50' : '#ff9800'}`
                }}
              >
                {/* Status Icon */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: action.status === 'success' ? '#4caf50' : '#ff9800',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {getActionIcon(action.status)}
                </div>

                {/* Action Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {action.message}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {action.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
