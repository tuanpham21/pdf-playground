## Why
Users need to view and interact with PDF documents directly on the tldraw canvas without leaving the application. This enables seamless document review workflows where PDFs can be annotated alongside other canvas content.

## What Changes
- Add PDF rendering capability to canvas with page-by-page display
- Implement smooth pan and zoom controls for PDF navigation
- Add page navigation controls (next/previous/jump to page)
- Integrate PDF.js library for cross-browser PDF rendering
- Create canvas shape type for PDF documents

## Impact
- Affected specs: `pdf-viewer` (new capability)
- Affected code: 
  - `src/` - core PDF viewer implementation
  - New dependency: PDF.js for rendering
- No breaking changes to existing functionality
