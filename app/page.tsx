import Link from 'next/link'

const steps = [
  {
    title: 'Gather customer signals',
    description:
      'Connect product listings, marketplaces, and support channels to bring every review into one searchable stream.'
  },
  {
    title: 'Detect emerging friction',
    description:
      'Elastic-powered agents sweep for sentiment drops, complaint clusters, and platform-specific anomalies in minutes.'
  },
  {
    title: 'Automate the response',
    description:
      'Route verified issues into your existing workflows, log evidence, and notify the right owners automatically.'
  }
]

const metrics = [
  { label: 'Manual triage hours saved', value: '32h / week' },
  { label: 'Detected issue accuracy', value: '94%' },
  { label: 'Reviews analyzed', value: '615+' }
]

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9), rgba(240,242,246,0.9)), #edf0f5',
        padding: '4rem 1.5rem'
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem'
        }}
      >
        {/* Hero */}
        <section
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
            textAlign: 'center',
            border: '1px solid rgba(15, 23, 42, 0.06)'
          }}
        >
          <p style={{ color: '#374151', letterSpacing: '0.08em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Voice of Customer Intelligence
          </p>
          <h1
            style={{
              fontSize: '3rem',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              color: '#0f172a'
            }}
          >
            Surface customer pain before it becomes a brand problem
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#4b5563', margin: '0 auto 2rem', maxWidth: '640px' }}>
            VOC Radar pairs Elastic Agent Builder with a calm, decision-ready dashboard so your team can watch every review,
            spot trend deviations instantly, and ship fixes with evidence attached.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <Link
              href="/dashboard"
              style={{
                background: '#0f172a',
                color: 'white',
                padding: '0.95rem 1.75rem',
                borderRadius: '999px',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Launch Analyzer
            </Link>
            <Link
              href="#how-it-works"
              style={{
                color: '#0f172a',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              See how it works →
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <p style={{ color: '#64748b', letterSpacing: '0.08em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Flow
            </p>
            <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: 0 }}>A calm, sequential workflow</h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            {steps.map((step, index) => (
              <div
                key={step.title}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  padding: '1.5rem',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#e4e7ec',
                    color: '#0f172a',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{step.title}</h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section
          style={{
            background: 'white',
            borderRadius: '24px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}
        >
          {metrics.map(metric => (
            <div key={metric.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{metric.value}</div>
              <p style={{ marginTop: '0.35rem', color: '#6b7280' }}>{metric.label}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
