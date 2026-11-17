# Kejapoa - Real Estate Management System with Matterport-like 3D Tours

## Project Overview

**Kejapoa** is a comprehensive real estate management platform featuring interactive 3D virtual tours similar to Matterport. Built with React, Vite, TypeScript, and Tailwind CSS for a modern, responsive web application.

### Tech Stack

- **Frontend:** React 18 + Vite 6 + TypeScript + Tailwind CSS
- **3D Viewer:** Three.js (WebGL)
- **API:** REST API (Django DRF backend expected)
- **Authentication:** JWT

---

## Project Structure

```
kejapoa/
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── property/          # Property-related components
│   │   ├── tour/               # 3D tour components
│   │   └── layout/             # Layout components
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Properties.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── Agents.tsx
│   │   ├── AgentProfile.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/                  # Custom React hooks
│   ├── services/              # API services
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/
└── docs/
```

---

## Design Language

### Theme: Modern Real Estate with Professional Warmth

**Color Palette:**
- Primary: `#2563eb` (Blue 600) - Trust, professionalism
- Primary Dark: `#1d4ed8` (Blue 700)
- Secondary: `#f59e0b` (Amber 500) - Warmth, inviting
- Accent: `#10b981` (Emerald 500) - Success, growth
- Background: `#f8fafc` (Slate 50)
- Surface: `#ffffff` (White)
- Text Primary: `#1e293b` (Slate 800)
- Text Secondary: `#64748b` (Slate 500)
- Border: `#e2e8f0` (Slate 200)

### Typography

- **Headings:** Inter (Google Fonts) - Modern, professional
- **Body:** Inter - Clean, readable
- **Monospace:** JetBrains Mono (for code/data)

### Spatial System

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Border radius: 6px (small), 8px (medium), 12px (large), 16px (xl)
- Shadow: subtle, layered for depth

### Motion Philosophy

- Page transitions: fade + slide (200ms ease-out)
- Micro-interactions: scale(1.02) on hover, 150ms
- Loading states: skeleton shimmer animation
- 3D viewer: smooth camera transitions (500ms ease-in-out)

---

## Core Features

### 1. Landing Page
- Hero section with search bar
- Featured properties carousel
- How it works section
- Testimonials
- Call-to-action for agents

### 2. Property Listing
- Grid/list view toggle
- Advanced filters sidebar
  - Location (city, area)
  - Property type (apartment, house, villa, commercial)
  - Price range (slider)
  - Bedrooms/bathrooms
  - Amenities (multiple select)
- Pagination
- Sort options (price, date, popularity)

### 3. Property Detail
- Image gallery with lightbox
- Property info cards
- Amenities grid
- Agent contact card
- Embedded 3D tour viewer
- Inquiry form
- Similar properties

### 4. 3D Tour Viewer (Three.js)
- 360° panorama sphere
- Mouse/touch drag to look around
- Zoom controls
- Hotspot navigation markers
- Info tag tooltips
- Scene transition (fade effect)
- Mini-map overlay
- Scene list sidebar
- Fullscreen toggle
- Loading progress indicator

### 5. Agent Pages
- Agent listing grid
- Agent profile with bio
- Listed properties
- Contact information
- Reviews/ratings

### 6. Dashboard (Role-based)
- Client: Saved properties, inquiries, profile
- Agent: My listings, create/edit, tour builder, leads
- Admin: All listings, approvals, users, analytics

---

## Component Inventory

### Navigation
- **Navbar:** Logo, nav links, auth buttons, mobile menu
- States: default, scrolled (shadow), mobile (hamburger)

### Property Card
- Image with badge (sale/rent, featured)
- Price display
- Property details (beds, baths, sqft)
- Location
- Agent avatar
- States: default, hover (lift + shadow), loading (skeleton)

### Search Bar
- Location input with autocomplete
- Property type dropdown
- Price range
- Search button
- States: default, focused, searching

### Filter Panel
- Collapsible sections
- Checkboxes, radio buttons, range sliders
- Apply/Reset buttons
- States: expanded, collapsed, mobile drawer

### Tour Viewer
- Canvas container
- Control bar (zoom, fullscreen, scenes)
- Hotspot markers (3D positioned)
- Info popup cards
- Loading spinner
- States: loading, interactive, transitioning, error

### Forms
- Input fields with labels
- Validation states (error, success)
- Submit button with loading state
- States: default, focused, filled, error, disabled

---

## Technical Approach

### State Management
- React Context for global state (auth, theme)
- Local state for component-specific data
- React Query patterns for data fetching

### Routing
- React Router v6
- Route guards for dashboard

### 3D Implementation
- Three.js for panorama rendering
- React-three-fiber optional for cleaner integration
- Custom hotspots and info tags

### API Services
- Axios-based API client
- Typed responses
- Error handling wrapper

---

## Implementation Phases

### Phase 1: Core UI
- [x] Project initialization
- [ ] Landing page
- [ ] Property listing
- [ ] Property detail

### Phase 2: 3D Tour
- [ ] Tour viewer component
- [ ] Hotspot system
- [ ] Scene navigation

### Phase 3: Dashboard
- [ ] User dashboard
- [ ] Agent dashboard
- [ ] Admin dashboard

### Phase 4: Tour Builder
- [ ] Scene upload
- [ ] Hotspot editor
- [ ] Tour management

---

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Accessibility

- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus visible states
- Color contrast compliance

---

## Performance Targets

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90