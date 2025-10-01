# CoinIT - Content Tokenization Platform

## Overview

CoinIT is a Web3 application that transforms blog content and articles into collectible digital assets (coins) on blockchain networks. The platform bridges traditional web content and blockchain-based digital assets by allowing users to scrape blog posts, extract metadata, and mint them as tokens. Built with React, Express, and integrating with blockchain infrastructure through Neon Database and IPFS storage via Pinata.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript and Vite as the build tool

**Routing**: Wouter for client-side routing with a simple switch-based route configuration

**UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. The design system uses a "new-york" style with CSS variables for theming and supports dark mode.

**State Management**: 
- TanStack Query (React Query) for server state management and data fetching
- Local React hooks (useState, useEffect) for component-level state
- Custom query client configured with specific retry and caching strategies

**Key Design Patterns**:
- Component-based architecture with reusable UI primitives
- Custom hooks for cross-cutting concerns (useToast, useIsMobile)
- Path aliases for clean imports (@/, @shared/, @assets/)

### Backend Architecture

**Framework**: Express.js running on Node.js with TypeScript

**Server Structure**:
- Single entry point (`server/index.ts`) handling all middleware setup
- Modular route registration system (`server/routes.ts`)
- In-memory storage implementation with interface-based design for easy database migration
- Custom logging middleware for API request tracking

**API Design**:
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Scraping endpoint (`POST /api/scrape`) for extracting web content
- CRUD operations for scraped content and coins

**Development Setup**:
- Vite middleware integration for HMR in development
- Static file serving for production builds
- Separation of client and server concerns

### Data Storage

**Current Implementation**: In-memory storage using Map data structures (MemStorage class)

**Planned Database**: PostgreSQL via Neon serverless database
- Drizzle ORM configured for database operations
- Schema defined in `shared/schema.ts` with two main tables:
  - `scraped_content`: Stores web scraping results with metadata
  - `coins`: Stores blockchain token information linked to scraped content
- Connection pooling configured for `connect-pg-simple` sessions

**Data Models**:
- ScrapedContent: url, title, description, author, publishDate, image, content, tags
- Coin: name, symbol, address, creator, scrapedContentId (foreign key), ipfsUri

**Schema Validation**: Zod schemas generated via drizzle-zod for runtime validation

### External Dependencies

**Web Scraping**:
- axios: HTTP client for fetching web pages
- cheerio: Server-side DOM manipulation for HTML parsing
- Extracts Open Graph metadata, article metadata, and content

**IPFS Storage**:
- Pinata: Decentralized file storage service
- Used for storing coin metadata permanently
- API integration via REST endpoints
- Falls back to mock URIs if credentials not configured

**Blockchain Integration** (Placeholder Implementation):
- Zora SDK references in code (not fully implemented)
- Wallet connection stubs (WalletConnect mentioned)
- Mock blockchain operations for development
- Designed for future integration with Zora network for coin minting

**UI Libraries**:
- Radix UI: Accessible, unstyled component primitives
- Tailwind CSS: Utility-first styling
- class-variance-authority: Component variant management
- Lucide React: Icon library

**Development Tools**:
- TypeScript: Type safety across frontend and backend
- Vite: Fast build tool with HMR
- Replit plugins: Dev banner, cartographer, runtime error overlay
- ESBuild: Server-side bundling for production

**Session Management**:
- connect-pg-simple: PostgreSQL session store (configured but not active with in-memory storage)

### Architecture Decisions

**Monorepo Structure**: Client and server code in same repository with shared types/schemas for type safety across boundaries.

**Why chosen**: Simplifies development, ensures type consistency, and reduces duplication.

**Trade-offs**: Requires careful build configuration; could be split into separate repos for independent deployment.

**In-Memory Storage**: Current implementation uses Map-based storage instead of database.

**Why chosen**: Simplifies initial development and removes database dependency for prototyping.

**Trade-offs**: Data doesn't persist across restarts; must migrate to PostgreSQL for production (infrastructure already configured).

**IPFS via Pinata**: Centralized service for decentralized storage.

**Why chosen**: Easier setup than running own IPFS node; reliable gateway access.

**Trade-offs**: Depends on third-party service; additional cost considerations.

**Mock Blockchain Operations**: Placeholder implementations for wallet and Zora integration.

**Why chosen**: Allows frontend development without blockchain complexity.

**Trade-offs**: Requires significant work to integrate real blockchain functionality; current implementation is not production-ready for actual token minting.