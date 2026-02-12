# VOC Radar

Voice of Customer (VOC) analysis dashboard using Elastic Agent Builder.

## Project Structure

```
voc_radar/
├── app/                    # Next.js App Router (like Rails app/views)
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout (like application.html.erb)
│   └── api/               # API routes (like Rails controllers)
│       └── analyze-product/
│           └── route.ts   # API endpoint
├── components/            # React components (like Rails partials)
│   ├── ProductSelector.tsx
│   ├── AgentStatus.tsx
│   └── ResultsDisplay.tsx
├── package.json           # Like Gemfile (dependencies)
└── tsconfig.json          # TypeScript config
```

## Getting Started

```bash
# Install dependencies (like bundle install)
npm install

# Start development server (like rails server)
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- **Next.js 14** - React framework (like Rails for React)
- **TypeScript** - Type-safe JavaScript
- **Elastic Agent Builder** - AI agent framework
