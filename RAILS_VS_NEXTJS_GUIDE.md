# Rails vs Next.js Comparison Guide

A comprehensive side-by-side comparison for Ruby on Rails developers learning Next.js.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Routing](#routing)
3. [Controllers vs API Routes](#controllers-vs-api-routes)
4. [Views vs Components](#views-vs-components)
5. [Models vs Data Fetching](#models-vs-data-fetching)
6. [Forms & User Input](#forms--user-input)
7. [State Management](#state-management)
8. [Asset Pipeline](#asset-pipeline)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)

---

## Project Structure

### Rails Structure
```
my_app/
├── app/
│   ├── controllers/
│   │   └── products_controller.rb
│   ├── models/
│   │   └── product.rb
│   ├── views/
│   │   └── products/
│   │       └── index.html.erb
│   └── assets/
│       ├── stylesheets/
│       └── javascripts/
├── config/
│   ├── routes.rb
│   └── database.yml
├── Gemfile
└── db/
    └── schema.rb
```

### Next.js Structure (App Router)
```
my_app/
├── app/
│   ├── api/
│   │   └── products/
│   │       └── route.ts          # API endpoint
│   ├── products/
│   │   └── page.tsx              # View/page
│   ├── layout.tsx                # Application layout
│   └── globals.css               # Global styles
├── components/
│   └── ProductCard.tsx          # Reusable component
├── package.json                  # Like Gemfile
└── tsconfig.json                 # TypeScript config
```

**Key Differences:**
- Next.js uses `app/` for both routes AND pages (file-based routing)
- Components are separate from pages
- No separate `models/` folder (data fetching happens in components/API routes)

---

## Routing

### Rails Routes
```ruby
# config/routes.rb
Rails.application.routes.draw do
  resources :products
  get '/about', to: 'pages#about'
  post '/api/products', to: 'api/products#create'
end
```

**URLs:**
- `/products` → `ProductsController#index`
- `/products/:id` → `ProductsController#show`
- `/api/products` → `Api::ProductsController#create`

### Next.js Routes (App Router)
```typescript
// File-based routing - no config file needed!

// app/products/page.tsx
// → GET /products

// app/products/[id]/page.tsx
// → GET /products/:id

// app/api/products/route.ts
// → POST /api/products
```

**File Structure:**
```
app/
├── page.tsx              → GET /
├── about/
│   └── page.tsx         → GET /about
├── products/
│   ├── page.tsx         → GET /products
│   └── [id]/
│       └── page.tsx     → GET /products/:id
└── api/
    └── products/
        └── route.ts     → POST /api/products
```

**Key Differences:**
- Next.js uses **file-based routing** (no routes.rb)
- Folders = URL paths
- `page.tsx` = the page component
- `route.ts` = API endpoint

---

## Controllers vs API Routes

### Rails Controller
```ruby
# app/controllers/products_controller.rb
class ProductsController < ApplicationController
  before_action :set_product, only: [:show, :edit, :update, :destroy]

  def index
    @products = Product.all
    render json: @products
  end

  def show
    render json: @product
  end

  def create
    @product = Product.new(product_params)
    
    if @product.save
      render json: @product, status: :created
    else
      render json: @product.errors, status: :unprocessable_entity
    end
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(:name, :price)
  end
end
```

### Next.js API Route
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const products = await fetchProducts() // Your data fetching logic
    
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price } = body

    // Validate (like strong parameters)
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const product = await createProduct({ name, price })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
```

**Key Differences:**
- Rails: One controller class with multiple actions
- Next.js: One file per HTTP method (GET, POST, etc.)
- Rails: `params` hash
- Next.js: `await request.json()` for body, `request.nextUrl.searchParams` for query params
- Rails: `render json:`
- Next.js: `NextResponse.json()`

---

## Views vs Components

### Rails View (ERB)
```erb
<!-- app/views/products/index.html.erb -->
<h1>Products</h1>

<% @products.each do |product| %>
  <div class="product-card">
    <h2><%= product.name %></h2>
    <p>$<%= product.price %></p>
    <%= link_to "View", product_path(product) %>
  </div>
<% end %>

<%= render 'shared/footer' %>
```

### Next.js Component (React/JSX)
```typescript
// app/products/page.tsx
'use client' // Needed for interactivity

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'

export default function ProductsPage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Fetch data on component mount
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**Key Differences:**
- Rails: ERB templates with Ruby code
- Next.js: JSX (JavaScript + HTML)
- Rails: Instance variables (`@products`)
- Next.js: State hooks (`useState`)
- Rails: Partials (`render 'shared/footer'`)
- Next.js: Components (`<ProductCard />`)

---

## Models vs Data Fetching

### Rails Model
```ruby
# app/models/product.rb
class Product < ApplicationRecord
  validates :name, presence: true
  validates :price, numericality: { greater_than: 0 }

  scope :expensive, -> { where('price > ?', 100) }

  def formatted_price
    "$#{sprintf('%.2f', price)}"
  end
end
```

**Usage in Controller:**
```ruby
@products = Product.expensive.order(created_at: :desc)
```

### Next.js Data Fetching
```typescript
// No models! Data fetching happens in components or API routes

// Option 1: Server Component (runs on server)
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json())

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}

// Option 2: Client Component (runs in browser)
// app/products/page.tsx
'use client'
import { useState, useEffect } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return <div>...</div>
}
```

**Key Differences:**
- Rails: ActiveRecord models with database
- Next.js: Fetch data from APIs (no ORM by default)
- Rails: `Product.all` (database query)
- Next.js: `fetch('/api/products')` (HTTP request)
- Rails: Validations in model
- Next.js: Validations in API route or use Zod library

---

## Forms & User Input

### Rails Form
```erb
<!-- app/views/products/new.html.erb -->
<%= form_with model: @product, url: products_path do |f| %>
  <%= f.label :name %>
  <%= f.text_field :name %>

  <%= f.label :price %>
  <%= f.number_field :price %>

  <%= f.submit "Create Product" %>
<% end %>
```

**Controller:**
```ruby
def create
  @product = Product.new(product_params)
  if @product.save
    redirect_to @product
  else
    render :new
  end
end
```

### Next.js Form
```typescript
// components/ProductForm.tsx
'use client'

import { useState } from 'react'

export default function ProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page refresh

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    })

    if (response.ok) {
      // Success! Redirect or show message
      window.location.href = '/products'
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label>
        Price:
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      <button type="submit">Create Product</button>
    </form>
  )
}
```

**Key Differences:**
- Rails: `form_with` helper, automatic CSRF protection
- Next.js: Manual form handling, need `e.preventDefault()`
- Rails: `params[:product][:name]`
- Next.js: State variables (`name`, `price`)
- Rails: `redirect_to` after success
- Next.js: `window.location.href` or Next.js router

---

## State Management

### Rails (Server-Side)
```ruby
# Controller
def index
  @products = Product.all
  @search_term = params[:search]
  @filtered_products = @products.where("name LIKE ?", "%#{@search_term}%")
end
```

### Next.js (Client-Side State)
```typescript
'use client'
import { useState } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {filteredProducts.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

**Key Differences:**
- Rails: State lives in controller instance variables
- Next.js: State lives in component using `useState` hook
- Rails: State resets on each request
- Next.js: State persists in browser (until page refresh)

---

## Asset Pipeline

### Rails Asset Pipeline
```ruby
# app/assets/stylesheets/application.css
.product-card {
  border: 1px solid #ccc;
}

# app/assets/javascripts/application.js
document.addEventListener('DOMContentLoaded', function() {
  // JavaScript code
end
```

**In View:**
```erb
<%= stylesheet_link_tag 'application' %>
<%= javascript_include_tag 'application' %>
```

### Next.js (CSS Modules or Global CSS)
```css
/* app/globals.css - Global styles */
.product-card {
  border: 1px solid #ccc;
}
```

**In Component:**
```typescript
// app/products/page.tsx
import './globals.css' // Or import in layout.tsx

export default function ProductsPage() {
  return <div className="product-card">...</div>
}
```

**CSS Modules (Scoped Styles):**
```css
/* components/ProductCard.module.css */
.card {
  border: 1px solid #ccc;
}
```

```typescript
// components/ProductCard.tsx
import styles from './ProductCard.module.css'

export default function ProductCard() {
  return <div className={styles.card}>...</div>
}
```

**Key Differences:**
- Rails: Asset pipeline compiles and minifies
- Next.js: Built-in CSS support, CSS Modules for scoped styles
- Rails: Separate asset files
- Next.js: Import CSS directly in components

---

## Environment Variables

### Rails
```ruby
# config/application.yml (using figaro gem)
# Or .env file

# config/application.rb
config.api_key = ENV['API_KEY']
```

**Usage:**
```ruby
# In controller or model
api_key = ENV['API_KEY']
```

### Next.js
```bash
# .env.local (not committed to git)
API_KEY=your_secret_key
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Usage:**
```typescript
// In API route or server component
const apiKey = process.env.API_KEY

// In client component (must prefix with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

**Key Differences:**
- Rails: `ENV['KEY']`
- Next.js: `process.env.KEY`
- Next.js: Client-side variables need `NEXT_PUBLIC_` prefix
- Both: `.env.local` or `.env` files (gitignored)

---

## Deployment

### Rails Deployment
```bash
# Production setup
RAILS_ENV=production
SECRET_KEY_BASE=...
DATABASE_URL=...

# Deploy to Heroku
git push heroku main

# Or deploy to AWS/Railway/etc.
```

### Next.js Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel (easiest)
vercel deploy

# Or deploy to other platforms
# - Netlify
# - AWS
# - Railway
# - Docker
```

**Key Differences:**
- Rails: Needs server (Puma, Passenger, etc.)
- Next.js: Can be static or serverless
- Rails: Database required
- Next.js: Can be fully static (no server needed)
- Rails: More complex deployment
- Next.js: Very simple (especially Vercel)

---

## Common Patterns Comparison

### 1. Redirect After Action

**Rails:**
```ruby
def create
  @product = Product.create(product_params)
  redirect_to @product
end
```

**Next.js:**
```typescript
// Client-side
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/products')

// Or server-side
import { redirect } from 'next/navigation'
redirect('/products')
```

---

### 2. Flash Messages

**Rails:**
```ruby
flash[:notice] = "Product created successfully"
redirect_to products_path
```

**In View:**
```erb
<% if flash[:notice] %>
  <div class="notice"><%= flash[:notice] %></div>
<% end %>
```

**Next.js:**
```typescript
// Use state or URL params
const [message, setMessage] = useState('')

// After action
setMessage('Product created successfully')

// In JSX
{message && <div className="notice">{message}</div>}
```

---

### 3. Partials/Components

**Rails Partial:**
```erb
<!-- app/views/shared/_header.html.erb -->
<header>
  <h1><%= title %></h1>
</header>

<!-- Usage -->
<%= render 'shared/header', title: 'My App' %>
```

**Next.js Component:**
```typescript
// components/Header.tsx
interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
    </header>
  )
}

// Usage
<Header title="My App" />
```

---

### 4. Layouts

**Rails Layout:**
```erb
<!-- app/views/layouts/application.html.erb -->
<html>
  <head>
    <title><%= yield(:title) || "Default" %></title>
  </head>
  <body>
    <%= render 'shared/header' %>
    <%= yield %>
    <%= render 'shared/footer' %>
  </body>
</html>
```

**Next.js Layout:**
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <title>Default</title>
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

---

## Quick Reference Cheat Sheet

| Task | Rails | Next.js |
|------|-------|---------|
| **Start server** | `rails server` | `npm run dev` |
| **Create model** | `rails generate model Product` | N/A (use API) |
| **Create controller** | `rails generate controller Products` | Create `app/api/products/route.ts` |
| **Create view** | `app/views/products/index.html.erb` | `app/products/page.tsx` |
| **Route** | `config/routes.rb` | File-based (folder structure) |
| **Params** | `params[:id]` | `request.nextUrl.searchParams.get('id')` |
| **JSON response** | `render json: @products` | `NextResponse.json(products)` |
| **Redirect** | `redirect_to products_path` | `router.push('/products')` |
| **Form** | `form_with` helper | `<form onSubmit={handleSubmit}>` |
| **State** | `@variable` in controller | `useState()` hook |
| **Database** | ActiveRecord | Fetch from API |
| **Environment** | `ENV['KEY']` | `process.env.KEY` |

---

## Summary

**Rails Philosophy:**
- Convention over configuration
- Server-side rendering
- Database-centric
- Full-stack framework

**Next.js Philosophy:**
- File-based routing
- Server + client rendering
- API-centric
- React framework

**When to Use Rails:**
- Traditional web apps with database
- Admin panels
- Content management
- Rapid prototyping with database

**When to Use Next.js:**
- Modern web apps
- API-first architecture
- Static sites
- React-based applications
- Serverless deployment

---

This guide should help you translate your Rails knowledge to Next.js! 🚀
