// ProductSelector Component
// This is like a Rails partial that handles product selection
// In React, we use "useState" to manage component state (like @variables in Rails)

'use client' // This tells Next.js this is a client component (can use interactivity)

import { useState } from 'react'

// Define the props this component accepts (like method parameters)
interface ProductSelectorProps {
  onAnalyze: (product: string) => void  // Callback function when "Analyze" is clicked
}

// Available products (we'll make this dynamic later)
const PRODUCTS = [
  'Product A',
  'Product B',
  'Product C'
]

export default function ProductSelector({ onAnalyze }: ProductSelectorProps) {
  // useState is like @selected_product = 'Product A' in Rails
  // But when it changes, React automatically re-renders the component
  const [selectedProduct, setSelectedProduct] = useState<string>('')

  // Handle form submission (like a Rails form_with)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Prevent page refresh (like Rails form)
    
    if (selectedProduct) {
      onAnalyze(selectedProduct) // Call the callback function
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
        Select Product to Analyze
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="product-select"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
          >
            Product:
          </label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            <option value="">-- Select a product --</option>
            {PRODUCTS.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedProduct}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: selectedProduct ? '#0070f3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedProduct ? 'pointer' : 'not-allowed',
            fontWeight: '500'
          }}
        >
          Analyze Reviews
        </button>
      </form>
    </div>
  )
}
