# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Design Philosophy

**🎨 This project follows a JOURNAL/NOTEBOOK aesthetic, NOT an admin dashboard style.**

Before making any UI changes, remember:
- ❌ **AVOID**: Blue colors, corporate styling, sharp edges, formal layouts
- ✅ **USE**: Mint green (#72B385), soft curves, organic layouts, warm typography
- 🎯 **GOAL**: Create a personal, intimate, handwritten journal feeling

## Project Overview

Floria's Wonderland is a personal website built with Next.js 15, featuring a portfolio, blog, interactive components, and database-backed features. The site includes forum/messaging functionality, a lab/projects section, gallery showcase, performance monitoring, and experimental features.

## Development Commands

```bash
# Development
yarn dev                    # Start development server
yarn predev                 # Generate Ant Design CSS (runs automatically before dev)

# Build & Production
yarn build                  # Build for production
yarn prebuild              # Generate Ant Design CSS for production
yarn start                  # Start production server

# Code Quality
yarn lint                   # ESLint code linting
yarn typecheck             # TypeScript type checking

# Testing
yarn test                   # Run Jest unit tests
yarn test:watch            # Run Jest in watch mode
yarn test:e2e              # Run Playwright end-to-end tests
yarn test:e2e:ui           # Run Playwright with UI
yarn test:e2e:debug        # Debug Playwright tests

# Utilities
yarn img:opt               # Optimize images using scripts/optimize-images.mjs
yarn clean:cache           # Clear Next.js cache
yarn clean:console         # Remove console statements from code
```

## Architecture

### Frontend Structure
- **Next.js App Router**: Uses the modern app directory structure
- **Components**: Reusable UI components in `/src/components/`
- **Pages**: Route-based pages in `/src/app/` with nested layouts
- **Styling**: Tailwind CSS + Ant Design + SCSS modules
- **State Management**: React hooks + SWR for data fetching
- **Rich Text**: TipTap editor for content creation

### Backend Structure
- **API Routes**: RESTful APIs in `/src/app/api/`
- **Database**: MongoDB with Mongoose ODM
- **Models**: Database schemas in `/src/app/api/*/models/`
- **Connection**: Centralized database connection in `/src/app/api/lib/mongoose.js`

### Key Features
1. **Blog System**: Markdown-based blog with TOC, syntax highlighting, and pin functionality
2. **Forum/Letters**: Message threading system with rich text editing
3. **Lab**: Project showcase with CRUD operations
4. **Gallery**: Image showcase with optimization and sync capabilities
5. **Performance Monitoring**: Real-time web vitals and error tracking (admin-only)
6. **Interactive Elements**: 3D scenes, maps, animations
7. **Contact System**: Personal contact and resume integration
8. **Travel**: Geographic content with Mapbox integration

### Route Structure
```
/                    # Homepage with navigation cards
/blog               # Blog listing and articles with pin support
/letters            # Message/forum system
/whispers           # Personal whispers/thoughts timeline (碎碎念)
/lab                # Projects showcase
/gallery            # Image gallery with optimization
/contact            # Contact information and resume
/space              # 3D interactive scene
/tools              # Utility tools
/dance              # Dance-related content
/admin/monitoring   # Performance monitoring dashboard (admin-only)
/travel             # Travel logs (hidden route)
```

### Database Collections
- **Lab**: Project/experiment entries
- **Message**: Forum/letter threading system
- **WhisperEntry**: Personal whispers/thoughts entries
- **Github**: Integration for repository data
- **WebVitals**: Performance monitoring data
- **Logs**: Error and performance logs
- **Posts**: Blog posts with metadata and pin status

### Environment Setup
- Requires `.env.local` with `MONGODB_URI`
- Optional: Mapbox tokens for map features
- GitHub integration for repository data
- Optional: Sentry configuration for error tracking
- Optional: NextAuth configuration for admin features

### Build Process
- **Pre-build**: Ant Design CSS extraction via `scripts/genAntdCss.tsx`
- **Console Removal**: Automatic console statement removal in production
- **Image Optimization**: Custom script for asset optimization via `scripts/optimize-images.mjs`
- **Bundle Analysis**: Available via `ANALYZE=true yarn build`

### Testing Strategy
- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright for full user flows
- **Type Safety**: Strict TypeScript configuration

### Development Notes
- Uses Yarn 4.2.2 as package manager
- Husky pre-commit hooks with lint-staged
- Component library: Ant Design v5 with React 19 compatibility patch
- Performance monitoring: Web Vitals integration with @ant-design/plots
- Error tracking: Sentry integration for production monitoring
- Font: Delius Google Font for branding
- Background: Custom parallax and 3D elements for visual appeal

### Code Quality Guidelines
- **Avoid Deprecated APIs**: Don't use deprecated Ant Design properties (check docs first)
- **Style Organization**: Use inline Tailwind classes - NO SCSS modules, NO CSS modules
- **Component Wrapping**: Use AntDShell to ensure consistent theming
- **Performance**: Monitor components skip expensive operations in development

## Design System & Style Guidelines

### Journal Style Theme
**IMPORTANT**: This project follows a **journal/notebook aesthetic**, NOT a typical admin dashboard style.

**Design Scope Note**: Hidden routes (e.g., `/travel`) do not need design suggestions unless explicitly requested by the user.

#### Visual Principles:
- **Color Palette**: Mint green (#72B385) as primary, avoiding default blue
- **Typography**: Soft, rounded fonts with emotional warmth
- **Layout**: Organic, flowing layouts with plenty of whitespace
- **Components**: Rounded corners, soft shadows, subtle gradients
- **Interactions**: Gentle animations, hover effects with scale transforms

#### Component Styling Requirements:
1. **Use inline Tailwind classes** - NO SCSS modules, NO CSS modules
2. **Use custom journal components** - Prefer JournalPagination over Ant Design Pagination
3. **Wrap important components with AntDShell** for proper style overrides
4. **Override Ant Design colors** - Avoid blue and mint-green in pagination, use rose/amber/warmOrange from tailwind.config
5. **Use Next.js Image for decorations** - Avoid CSS pseudo-elements for background images
6. **Prefer lightweight interactions** - Popover over Modal when possible
7. **Include texture and depth** - Subtle shadows, warm colors, handwritten fonts (Delius)

#### Ant Design Customization:
- Primary colors should be overridden to mint green variants
- Use `classNames` prop for custom styling (not deprecated `overlayClassName`)
- Buttons, inputs, and interactive elements need journal-style treatment
- Maintain consistency with existing design tokens in `constants/theme.ts`

#### Pagination Guidelines:
- **Always use JournalPagination** for list pagination (whispers, letters, etc.)
- **Color scheme**: Rose (复古玫瑰红) - rose-300/400/500/600
- **Avoid**: Mint-green, blue, or corporate colors in pagination
- **Style**: Handwritten numbers, dashed borders, pagination.png background
- **Location**: `/src/components/JournalPagination`

## Ant Design Deprecation Warnings

⚠️ **IMPORTANT REMINDERS FOR CLAUDE CODE**:

### Deprecated Properties to Avoid:
1. **`overlayClassName`** - Use `classNames={{ content: "your-class" }}` instead
2. **`dropdownClassName`** - Use `classNames={{ dropdown: "your-class" }}` instead
3. **`popupClassName`** - Use `classNames={{ popup: "your-class" }}` instead
4. **`getPopupContainer`** - Use `getContainer` instead (context-dependent)

### Style Organization:
- **NO inline `<style jsx>` tags** - Always create corresponding `.module.scss` files
- **NO hardcoded blue colors** - Use theme constants or mint green variants
- **NO plain Ant components without customization** - Apply journal theme styling

### Component Wrapping Pattern:
```tsx
// ✅ Good: Wrapped with AntDShell for styling
<AntDShell>
  <Popover
    classNames={{ content: styles.customPopover }}
    // ... other props
  >
    {children}
  </Popover>
</AntDShell>

// ❌ Bad: Using deprecated properties
<Popover overlayClassName="custom-class">
  {children}
</Popover>
```

### UIProvider Pattern (REQUIRED):
**IMPORTANT**: Always use the project's `UIProvider` hooks for Ant Design's message and modal APIs.

#### ❌ **NEVER** use direct imports:
```tsx
import { message, Modal } from "antd";

// DON'T do this:
Modal.confirm({ ... });
message.success("Operation completed");
```

#### ✅ **ALWAYS** use UIProvider hooks:
```tsx
import { useMessage, useModal } from "@/provider/UIProviders";

function MyComponent() {
  const messageApi = useMessage();
  const modalApi = useModal();

  const handleAction = () => {
    modalApi.confirm({
      title: "Are you sure?",
      onOk: () => {
        messageApi.success("Operation completed");
      },
    });
  };

  return <button onClick={handleAction}>Action</button>;
}
```

#### Alternative Pattern (also valid):
```tsx
import { App } from "antd";

function MyComponent() {
  const { message, modal } = App.useApp();

  // Use message and modal as needed
}
```

**Why?** Using UIProvider ensures proper React context setup and prevents console warnings about static method usage. It also provides better control over notification positioning and styling.

## Type System Best Practices

### Core Principles
**IMPORTANT**: This project uses a layered type system to minimize duplication and maintain consistency between database models, API responses, and frontend types.

### Type Utility Wrappers
Located in `/src/types/common.ts`:

```typescript
// Database documents (MongoDB) - adds _id field
export type WithDbId<T> = T & { _id: string };

// API responses - adds id field (converted from _id)
export type WithApiId<T> = T & { id: string };

// Common timestamp fields for all database models
export interface TimestampBase {
  createdAt: Date;
  updatedAt: Date;
}

// Standardized API response wrapper
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}
```

### Design Pattern (Follow this for ALL features)

#### ✅ **CORRECT Pattern** - Reference: `/src/types/whisper.ts`

```typescript
// 1. Define core type with shared fields
export interface WhisperEntryCore extends TimestampBase {
  timestamp: Date;
  content: string;
  images: string[];
  tags: string[];
  source: string;
  visibility: "public" | "private";
}

// 2. Database type - add _id via wrapper
export type WhisperEntryDb = WithDbId<WhisperEntryCore>;

// 3. API response type - add id via wrapper
export type WhisperEntryApi = WithApiId<WhisperEntryCore>;

// 4. Specialized types as needed
export interface WhisperListResponse {
  data: WhisperEntryApi[];
  pagination: { ... };
  filters: { ... };
}
```

#### ❌ **WRONG Pattern** - DO NOT do this:

```typescript
// BAD: Duplicating fields across types
export interface WhisperDb {
  _id: string;
  timestamp: Date;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  // ... duplicate fields
}

export interface WhisperApi {
  id: string;
  timestamp: Date;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  // ... duplicate fields again!
}
```

### Model → API Conversion Pattern

In API routes, convert database documents to API responses:

```typescript
// In your API route
import WhisperEntry from "@/app/api/models/WhisperEntry";
import { WhisperEntryApi } from "@/types/whisper";

const entries = await WhisperEntry.find().lean({ virtuals: true });

// Mongoose virtual 'id' automatically converts _id
const apiEntries: WhisperEntryApi[] = entries.map(entry => ({
  id: entry.id,  // virtual getter from _id
  timestamp: entry.timestamp,
  content: entry.content,
  // ... other fields
}));
```

### Guidelines

1. **Define once, extend everywhere** - Core types should contain all shared fields
2. **Use wrappers for IDs** - `WithDbId` for MongoDB, `WithApiId` for API responses
3. **Inherit timestamps** - All database models extend `TimestampBase`
4. **API responses** - Wrap data with `ApiResponse<T>` for consistency
5. **No duplication** - If you copy-paste field definitions, you're doing it wrong
6. **Reference examples** - Look at `whisper.ts`, `lab.d.ts`, `letter.d.ts` for patterns

### Benefits
- **Single source of truth** - Change a field once, updates everywhere
- **Type safety** - TypeScript catches mismatches between layers
- **Maintainability** - Easy to add new fields or modify existing ones
- **Consistency** - API contracts match database schemas

## Git Workflow
- Main branch: `main`
- Development branch: `dev`
- Conventional commits enforced via commitlint

## Security & Admin Features

### Admin-Only Routes
- **`/admin/monitoring`** - Performance monitoring dashboard
  - Web Vitals tracking and analysis
  - Error log monitoring
  - Performance metrics visualization
  - **⚠️ Should be hidden from public access**

### Performance Monitoring
- Real-time web vitals collection
- Error tracking and logging
- Performance metrics analysis
- Device type breakdown
- Time-based performance trends

### API Endpoints
```
# Public APIs
/api/posts/*           # Blog post management
/api/letters/*         # Forum/messaging system
/api/whispers/list     # Whisper entries list (GET: public, DELETE: admin)
/api/whispers/stats    # Whisper statistics (GET: public)
/api/lab/*             # Lab project operations
/api/gallery/*         # Gallery management

# Admin APIs (require authentication)
/api/whispers/upload   # Upload whisper HTML exports
/api/whispers/clear    # Clear all whisper entries
/api/monitoring/*      # Performance monitoring data
```

## Recent Updates

### Performance & Monitoring (Latest)
- Added comprehensive performance monitoring dashboard
- Integrated web vitals tracking with @ant-design/plots
- Error logging and monitoring capabilities
- Device-specific performance analytics

### Gallery System
- Image optimization and compression
- Gallery sync and cleanup APIs
- AVIF format support for better performance

### Blog Enhancements
- Pin functionality for important posts
- Improved metadata handling
- Enhanced content management

### Code Quality Improvements
- Console statement removal in production builds
- Enhanced TypeScript configurations
- Improved error handling and logging