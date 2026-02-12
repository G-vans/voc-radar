# UI Build Guide - Step by Step

## What We've Set Up So Far ✅

1. **npm init** - Created package.json (like Gemfile)
2. **Installed Next.js** - React framework (like Rails for React)
3. **Created app structure**:
   - `app/layout.tsx` - Root layout (like application.html.erb)
   - `app/page.tsx` - Home page
   - `app/globals.css` - Global styles

## Next.js vs Rails (Quick Reference)

| Rails | Next.js | Purpose |
|-------|---------|---------|
| `app/views/` | `app/` | Views/Pages |
| `app/controllers/` | `app/api/` | API endpoints |
| `app/views/shared/_partial.html.erb` | `components/` | Reusable components |
| `application.html.erb` | `app/layout.tsx` | Root layout |
| `application.css` | `app/globals.css` | Global styles |
| `bundle install` | `npm install` | Install dependencies |
| `rails server` | `npm run dev` | Start dev server |

## React Concepts (For Ruby Developers)

### Components
- Like Rails partials, but with JavaScript logic
- Can have state (like instance variables)
- Reusable pieces of UI

### Props
- Like passing variables to partials: `<%= render 'user', user: @user %>`
- In React: `<UserComponent user={user} />`

### State
- Like instance variables in controllers
- But updates trigger re-renders automatically
- Use `useState` hook

### JSX
- Like ERB templates, but JavaScript
- `<div>Hello</div>` instead of `<div>Hello</div>`
- Can embed JavaScript: `<div>{user.name}</div>`

## Next Steps

We'll build components one by one:
1. ✅ Basic setup
2. ⏭️ ProductSelector component
3. ⏭️ AgentStatus component  
4. ⏭️ ResultsDisplay component
5. ⏭️ API route to trigger agent
