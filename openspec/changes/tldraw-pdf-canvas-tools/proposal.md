# Proposal: tldraw PDF Canvas with Custom Interactive Tools

## Why

We need to build a web app centered around a tldraw canvas that enables users to:
1. View and interact with PDF documents as a background layer
2. Use custom interactive tools on top of the PDF
3. Perform advanced operations like shape attachment and canvas export

This is the core foundation of the product, implementing all 5 required tasks from the project specification.

## What Changes

### Task 1: Repository Setup ✅
- Package management with pnpm
- TypeScript with strict mode configuration
- Code quality tools (Prettier, ESLint, Husky)
- Testing infrastructure (Vitest, React Testing Library)
- Build tooling with Vite

### Task 2: PDF Rendering on tldraw Canvas ✅
- **BREAKING**: Replaced standalone PDF viewer with tldraw-integrated solution
- PDF rendered as background layer on tldraw canvas
- Multi-page PDF support with navigation controls
- PDF.js integration for high-quality rendering
- Interactive drawing layer on top of PDF

### Task 3: Size Button Custom Shape ✅
- New custom shape type: `size-button`
- Interactive button component that displays shape dimensions in real-time
- Click counter that persists with shape
- Full integration with tldraw's shape system

### Task 4: Pin Attachment Tool ✅
- New custom shape type: `pin`
- Automatic detection of overlapping shapes
- Bidirectional movement synchronization
- Visual feedback (green when attached, red when not)

### Task 5: Camera/Crop Export Tool ✅
- New custom shape type: `camera`
- Resizable crop rectangle
- Canvas region export as SVG
- One-click download functionality

## Impact

**Affected Components:**
- Entry point: Completely rewritten to use TldrawApp
- New tools directory with 3 custom shapes
- New PDF utilities for image conversion
- New hooks for PDF state management

**Code Files:**
- `example/main.tsx` - New tldraw-based entry point
- `src/components/TldrawApp.tsx` - New main component
- `src/tools/SizeButtonShape/` - New custom shape
- `src/tools/PinShape/` - New custom shape
- `src/tools/CameraShape/` - New custom shape
- `src/utils/pdfToImage.ts` - New PDF conversion utility
- `src/hooks/usePDFBackground.ts` - New hook

**Breaking Changes:**
- Standalone PDF viewer is now deprecated (kept for reference)
- Main app now requires tldraw dependency
- Different component structure and API

**Dependencies Added:**
- `tldraw` - Core canvas framework
- Existing: `pdfjs-dist`, `react`, `react-dom`

**Benefits:**
- Proper implementation matching project requirements
- All 5 tasks completed and integrated
- Extensible architecture for future tools
- Professional tldraw integration
