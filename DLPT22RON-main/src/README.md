# VisionGuide Frontend

## Overview

VisionGuide frontend is a React-based web application providing an intuitive interface for visually impaired users to interact with AI-powered navigation assistance. The application features real-time object detection, person counting, text-to-speech announcements, and user profile management.

## Project Architecture

The frontend follows a component-based React architecture with:
- **Pages**: Main application views
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks
- **Routing**: React Router v6 for navigation
- **State Management**: React hooks + TanStack Query for server state

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

## Project Structure

```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Main app component with routing
├── App.css                     # Global styles
├── index.css                   # Tailwind CSS imports
├── pages/                      # Page components
│   ├── Index.tsx              # Landing page
│   ├── NotFound.tsx          # 404 page
│   └── dashboard/             # Dashboard pages
│       ├── ObjectDetection.tsx    # Main detection page
│       ├── Translation.tsx         # Translation page
│       ├── Profile.tsx            # User profile page
│       └── [other pages...]      # Additional dashboard pages
├── components/              # Reusable components
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── DashboardLayout.tsx    # Main dashboard layout
│   │   ├── DashboardHeader.tsx    # Dashboard header
│   │   └── DashboardSidebar.tsx  # Navigation sidebar
│   ├── landing/               # Landing page components
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── TechnologySection.tsx
│   │   ├── UseCasesSection.tsx
│   │   └── Footer.tsx
│   ├── ui/                    # shadcn/ui components (49 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   └── [46 more...]
│   └── NavLink.tsx            # Navigation link component
├── hooks/                     # Custom React hooks
│   ├── use-theme.tsx          # Theme management (dark/light)
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
└── lib/                       # Utility libraries
    └── utils.ts               # Utility functions (cn, etc.)
```

## Modules Overview

### 1. Pages (`pages/`)

#### `Index.tsx`
- **Purpose**: Landing page
- **Features**: Hero section, features, about, technology showcase
- **Route**: `/`

#### `pages/dashboard/ObjectDetection.tsx`
- **Purpose**: Main object and person detection interface
- **Features**:
  - Real-time camera feed
  - Object detection with bounding boxes
  - Person counting
  - Auto-announcements with language selection
  - Manual announcement button
  - Detection statistics
  - Collapsible detection details
- **Key Functionality**:
  - Camera access and frame capture
  - Parallel API calls to `/detect_frame` and `/api/detect_persons`
  - Real-time overlay rendering
  - Smart auto-announcement logic (prioritizes obstacles ahead)
  - Language selection (English/Telugu)
  - Distance and position calculation
- **State Management**:
  - `isDetecting` - Camera state
  - `detectionResult` - Current detections
  - `userLanguage` - Selected language for TTS
  - `autoAnnounce` - Auto-announcement toggle
  - `lastAnnouncedState` - Tracks previous announcements
- **Route**: `/dashboard` (index route)

#### `pages/dashboard/Translation.tsx`
- **Purpose**: Text translation interface
- **Features**:
  - Source/target language selection
  - Text input/output
  - Language swap
  - Copy to clipboard
  - Text-to-speech for translated text
- **Route**: `/dashboard/translation`

#### `pages/dashboard/Profile.tsx`
- **Purpose**: User profile management
- **Features**:
  - View/edit user profile
  - Language preferences
  - Profile data persistence
- **Route**: `/dashboard/profile`

### 2. Components (`components/`)

#### Dashboard Components (`components/dashboard/`)

##### `DashboardLayout.tsx`
- **Purpose**: Main dashboard layout wrapper
- **Features**: Provides sidebar and header structure
- **Children**: Renders dashboard page routes

##### `DashboardSidebar.tsx`
- **Purpose**: Navigation sidebar
- **Features**:
  - Collapsible sidebar
  - Menu items: Object Detection, Profile
  - Active route highlighting
  - Back to home button
- **Menu Items**:
  - Object Detection → `/dashboard`
  - Profile → `/dashboard/profile`

##### `DashboardHeader.tsx`
- **Purpose**: Dashboard header/top bar
- **Features**: User info, theme toggle, etc.

#### Landing Components (`components/landing/`)
- **Purpose**: Marketing/landing page sections
- **Components**: Navbar, Hero, Features, About, Technology, UseCases, Footer

#### UI Components (`components/ui/`)
- **Purpose**: Reusable shadcn/ui components
- **Count**: 49 components (buttons, cards, selects, dialogs, etc.)
- **Source**: Based on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming

### 3. Hooks (`hooks/`)

#### `use-theme.tsx`
- **Purpose**: Theme management (dark/light mode)
- **Provider**: `ThemeProvider` wraps the app

#### `use-mobile.tsx`
- **Purpose**: Detect mobile devices
- **Usage**: Responsive UI adjustments

#### `use-toast.ts`
- **Purpose**: Toast notification system
- **Usage**: Success/error notifications

### 4. Routing (`App.tsx`)

```typescript
Routes:
- /                    → Index (Landing page)
- /dashboard           → ObjectDetection (index)
- /dashboard/profile   → Profile
- /dashboard/translation → Translation (if enabled)
- *                    → NotFound (404)
```

## Key Features

### Object Detection Page

#### Camera Integration
- **Access**: Browser MediaDevices API
- **Format**: Base64-encoded JPEG frames
- **Interval**: 1.5 seconds between detections
- **Resolution**: 640x480 (ideal)

#### Detection Flow
1. Capture frame from video element
2. Convert to base64 JPEG
3. Send parallel requests:
   - `POST /detect_frame` (objects)
   - `POST /api/detect_persons` (persons)
4. Combine results
5. Render bounding boxes as overlays
6. Update statistics
7. Trigger auto-announcements if enabled

#### Auto-Announcement Logic
- **Prioritization**: Obstacles ahead > sides
- **Distance Thresholds**: 
  - Ahead: up to 5m
  - Sides: up to 2m (only very close)
- **Smart Filtering**: Only announces drastic changes:
  - New obstacle appears
  - Obstacle moves >1m closer
  - Path clears
- **Cooldown**: 10 seconds between announcements
- **Language**: Uses selected language (English/Telugu)

#### Visual Overlays
- **Objects**: Green bounding boxes
- **Persons**: Primary color bounding boxes
- **Labels**: Object name + confidence percentage
- **Positioning**: Scaled to video element size

### Language Selection
- **Location**: Object Detection page
- **Options**: English (en), Telugu (te)
- **Effect**: Immediately applies to next TTS announcement
- **Storage**: Local state (not persisted)

## API Integration

### Base URLs
```typescript
const BACKEND_URL = "http://localhost:5000";
const API_BASE_URL = "http://localhost:5000/api";
```

### API Calls

#### Object Detection
```typescript
POST /detect_frame
Body: { frame: "data:image/jpeg;base64,..." }
Response: { objects: [...], frame_height, frame_width }
```

#### Person Detection
```typescript
POST /api/detect_persons
Body: { frame: "data:image/jpeg;base64,..." }
Response: { persons: [...], person_count, frame_height, frame_width }
```

#### Text-to-Speech
```typescript
POST /api/speak
Body: { text: "string", language: "en|te" }
Response: MP3 audio blob
```

#### Profile
```typescript
GET /api/profile
Response: { name, language, ... }

POST /api/profile
Body: { name, language, ... }
Response: { message: "Profile updated successfully" }
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Backend server running on port 5000

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

The frontend will start on `http://localhost:5173` (Vite default)

## Configuration

### Environment Variables
- Currently hardcoded to `localhost:5000`
- Update `BACKEND_URL` and `API_BASE_URL` in components for production

### Vite Configuration
- **Port**: 5173 (default)
- **Config**: `vite.config.ts`
- **Aliases**: `@/` points to `src/`

### Tailwind Configuration
- **Config**: `tailwind.config.ts`
- **Theme**: Custom theme with CSS variables
- **Plugins**: `tailwindcss-animate`

## How to Navigate the Codebase

### Adding a New Page
1. Create component in `pages/dashboard/`
2. Add route in `App.tsx`
3. Add menu item in `DashboardSidebar.tsx` (if needed)

### Adding a New API Endpoint Call
1. Create fetch function in the page component
2. Use TanStack Query for caching (if needed)
3. Handle loading/error states

### Modifying Detection Logic
- Main logic: `pages/dashboard/ObjectDetection.tsx`
- Auto-announcement: `autoAnnounceDetections()` function
- Detection interval: `DETECTION_INTERVAL` constant (1500ms)

### Styling
- Use Tailwind CSS classes
- Custom theme variables in `index.css`
- shadcn/ui components are pre-styled

## Key Files to Understand

1. **`App.tsx`** - Start here for routing structure
2. **`pages/dashboard/ObjectDetection.tsx`** - Main detection page (781 lines)
3. **`components/dashboard/DashboardLayout.tsx`** - Layout structure
4. **`components/dashboard/DashboardSidebar.tsx`** - Navigation

## Development Notes

### State Management
- Local state: `useState` for component-specific state
- Server state: TanStack Query for API data
- No global state management (Redux/Zustand) currently

### Performance
- Detection interval: 1.5 seconds (configurable)
- Frame processing: Debounced to prevent overlap
- Canvas: Hidden, used only for frame capture
- Video: Direct rendering, overlays via absolute positioning

### Browser Compatibility
- Requires camera access (MediaDevices API)
- Modern browsers (Chrome, Firefox, Edge, Safari)
- HTTPS required for camera access (except localhost)

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS (or localhost)
- Verify camera is not in use by another app

### API Calls Failing
- Verify backend is running on port 5000
- Check CORS settings in backend
- Verify network connectivity

### Detection Not Showing
- Check browser console for errors
- Verify API responses in Network tab
- Check `detectionResult` state updates
