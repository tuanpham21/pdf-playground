## 1. Setup and Dependencies

### 1.1 Technical Stack Selection
- [ ] 1.1.1 Evaluate PDF rendering libraries (PDF.js vs react-pdf vs pdfjs-dist)
  - Criteria: Bundle size, TypeScript support, browser compatibility, license
  - Decision: Document choice with rationale in design.md
- [ ] 1.1.2 Confirm tldraw's React version and configure peer dependencies
  - Verify tldraw uses React (it does)
  - Match React version for compatibility
  - Configure as peer dependency to avoid duplicate React bundles
- [ ] 1.1.3 Select styling approach
  - Options: CSS modules, Tailwind, styled-components, inline styles
  - Ensure consistency with tldraw canvas aesthetics
- [ ] 1.1.4 Install chosen dependencies and configure TypeScript types
  - Update package.json with peer dependencies
  - Configure tsconfig.json for library types

### 1.2 Initial UI Design
- [ ] 1.2.1 Design toolbar/control panel layout
  - Sketch UI mockup: navigation buttons, zoom controls, page counter
  - Position: Floating toolbar or canvas-integrated controls
  - Define z-index hierarchy with canvas layers
- [ ] 1.2.2 Define viewer canvas dimensions and aspect ratios
  - Default size: responsive or fixed dimensions
  - Viewport behavior: full-screen, modal, embedded
  - Document constraints for mobile/desktop
- [ ] 1.2.3 Design loading and error states UI
  - Loading spinner/progress indicator
  - Error message display patterns
  - Empty state when no PDF loaded
- [ ] 1.2.4 Run boilerplate setup script and verify structure
  - Execute setup-pdf-viewer.sh to scaffold project
  - Verify all config files generated (Prettier, ESLint, Vite, tsconfig)
  - Verify folder structure: components/, hooks/, utils/, types/, styles/
  - Verify Git hooks installed (pre-commit formatting, commit-msg linting)
  - Test with `pnpm dev` to ensure dev server starts

## 2. Core PDF Rendering
- [ ] 2.1 Implement PDF document loader that accepts file path/URL
- [ ] 2.2 Implement page rendering to canvas element
- [ ] 2.3 Add error handling for invalid/corrupted PDFs

## 3. Navigation Controls
- [ ] 3.1 Implement page navigation (next/previous page)
- [ ] 3.2 Implement direct page jump by number
- [ ] 3.3 Display current page number and total pages

## 4. Pan and Zoom
- [ ] 4.1 Implement smooth zoom in/out with mouse wheel
- [ ] 4.2 Implement pan/drag functionality with mouse
- [ ] 4.3 Add zoom level indicator and reset-to-fit button

## 5. Testing and Documentation
- [ ] 5.1 Write unit tests for PDF loader and page navigation
- [ ] 5.2 Test with various PDF files (single/multi-page, different sizes)
- [ ] 5.3 Document API usage and integration examples
