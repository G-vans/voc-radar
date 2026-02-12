// This is like application.html.erb in Rails
// It wraps every page with common HTML structure

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VOC Radar - Customer Feedback Monitor',
  description: 'AI-powered customer review analysis using Elastic Agent Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
