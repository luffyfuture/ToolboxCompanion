# Replit.md

## Overview

This is a full-stack TypeScript web application built with Vue 3 and Express, featuring a collection of utility tools like calculators, text processors, and converters. The application follows a modern architecture with a Vue 3 frontend using Element Plus components, an Express backend with TypeScript, and PostgreSQL database integration via Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: Vue 3 with TypeScript and Composition API
- **Build Tool**: Vite for fast development and building
- **UI Library**: Element Plus components with comprehensive Vue 3 support
- **Styling**: Element Plus theming with custom CSS
- **State Management**: Vue 3 reactive system with ref and computed
- **Component Structure**: Single File Components (.vue) with script setup syntax

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware for JSON parsing and request logging
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Built-in session handling with connect-pg-simple
- **Development**: Hot reloading with Vite middleware integration

### Build System
- **Development**: Single command runs both frontend and backend concurrently
- **Production**: Vite builds the frontend, esbuild bundles the backend
- **Type Safety**: Shared types between frontend and backend via `/shared` directory

## Key Components

### Database Schema (shared/schema.ts)
- **Users Table**: Basic user authentication with username/password
- **Tools Table**: Metadata for available tools with categories and descriptions
- **Validation**: Zod schemas for runtime type validation and inference

### Storage Layer (server/storage.ts)
- **Interface**: IStorage defines CRUD operations for data access
- **Implementation**: DatabaseStorage provides PostgreSQL-backed storage
- **Database**: Type-safe operations using Drizzle ORM with Neon serverless PostgreSQL

### Frontend Tools
- **Calculator**: Advanced calculator with history and expression parsing
- **Text Tools**: Character/word counter, case converter, Base64 encoder
- **Generators**: QR code generator, password generator, hash generator
- **Converters**: Unit converter for length, weight, temperature
- **System Info**: Browser and system information display
- **Color Picker**: Color format converter (hex, RGB, HSL)

### UI Components
- **Design System**: Consistent component library with variants
- **Theming**: Light/dark mode support with CSS custom properties
- **Responsive**: Mobile-first design with responsive breakpoints
- **Accessibility**: ARIA-compliant components from Radix UI

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Layer**: Express routes handle requests and interact with storage
3. **Storage**: IStorage interface abstracts data persistence
4. **Response**: Type-safe responses using shared schemas
5. **UI Updates**: React Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe SQL query builder
- **drizzle-zod**: Integration between Drizzle and Zod
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing library

### UI Dependencies
- **@radix-ui/***: Primitive UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management  
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts both frontend and backend
- **Hot Reloading**: Vite provides instant feedback for frontend changes
- **Type Checking**: Continuous TypeScript compilation checking
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Frontend build output served by Express in production
- **Environment**: NODE_ENV controls development/production behavior

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Port**: External port 80 maps to internal port 5000
- **Auto-deployment**: Configured for Replit's autoscale deployment target

## Changelog

```
Changelog:
- June 21, 2025. Initial setup with React
- June 21, 2025. Converted to Vue 3 + Element Plus architecture
- June 21, 2025. Integrated PostgreSQL database with Drizzle ORM
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```