# tldraw PDF Canvas

Interactive canvas application powered by **tldraw** with PDF background rendering and three custom interactive tools.

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [Custom Tools](#custom-tools)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [OpenSpec Documentation](#openspec-documentation)

---

## Features

- 🎨 **tldraw Canvas** - Full-featured drawing canvas with all standard tools
- 📄 **PDF Integration** - Load PDFs as locked background layers
- 📊 **Size Button Tool** - Interactive shape showing real-time dimensions and click count
- 📌 **Pin Tool** - Attach overlapping shapes with automatic movement synchronization
- 📷 **Screenshot Tool** - Crop and export canvas regions as PNG images
- 📤 **Export to PDF** - Save canvas with annotations merged into original PDF
- ⚡ **High Performance** - PDF.js rendering at 2× scale for quality
- 🔒 **Type-safe** - Full TypeScript with strict mode
- 🧪 **Well-tested** - Unit tests for core functionality

---

## Quick Start

### Installation

```bash
# Clone repository
git clone <repo-url>
cd h2-tldrawn

# Install dependencies
pnpm install
```

### Running the App

```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

### First Steps

1. **Load a PDF**
   - Click "Open PDF" button → select `requirements/README.pdf`
   - Or click "Load from URL" → paste any PDF URL

2. **Try the Custom Tools**
   - Press `1` for Size Button tool
   - Press `2` for Pin tool
   - Press `3` for Screenshot tool

3. **Draw on Canvas**
   - Use standard tldraw tools (Draw, Rectangle, Text, etc.)
   - Your drawings appear on top of the PDF

4. **Export**
   - Click "Export PDF" to download with your annotations

---

## Usage Guide

### Loading PDFs

**Method 1: Upload Local File**
- Click **"Open PDF"** button in top-left
- Select a PDF file from your computer
- PDF pages appear as locked shapes on canvas

**Method 2: Load from URL**
- Click **"Load from URL"** button
- Enter PDF URL in the prompt
- PDF loads and displays on canvas

**Multi-page PDFs:**
- Pages stack **vertically** on the canvas
- Scroll down to see all pages
- Each page is a separate locked shape

---

## Custom Tools

### 📊 Size Button (Keyboard: `1`)

**What it does:**
- Creates an interactive shape with a button
- Button label shows shape dimensions in real-time
- Tracks how many times the button is clicked

**How to use:**
1. Press `1` or click 📊 icon in toolbar
2. Click on canvas to create the shape
3. **Resize the shape** → size display updates automatically
   - Shows: "300 × 200" (width × height)
4. **Click the button** labeled "Click here"
   - Counter increments: "Clicks: 5"

**Features:**
- Custom color support (use tldraw's color picker)
- Resizable in any direction
- Counter persists with shape

**Implementation:** `src/tools/SizeButtonShape/CardShapeUtil.tsx`

---

### 📌 Pin (Keyboard: `2`)

**What it does:**
- Creates a pin that attaches two overlapping shapes
- Attached shapes move together automatically
- Uses tldraw's **bindings API** for relationships

**How to use:**
1. **First, create 2 shapes** (e.g., rectangles using `R` key)
2. **Make them overlap** (drag one on top of the other)
3. Press `2` or click 📌 icon in toolbar
4. **Click on the overlapping area** to place a pin
5. Pin creates bindings to both shapes
6. **Move one shape** → the other follows automatically!

**How it works:**
- Pin detects shapes at its location
- Creates tldraw bindings with anchor points
- When one shape moves, binding calculates delta
- Delta applied to connected shape via anchor
- Maintains relative positioning

**Implementation:**
- Shape: `src/tools/PinShape/PinShapeUtil.tsx`
- Bindings: `src/tools/PinShape/PinBindingUtil.ts` ⭐

---

### 📷 Screenshot (Keyboard: `3`)

**What it does:**
- Lets you crop any part of the canvas
- Exports selected area as PNG image
- Supports keyboard modifiers for advanced control

**How to use:**
1. Press `3` or click 📷 icon in toolbar
2. **Click and drag** on canvas to draw selection rectangle
3. **Release mouse** → PNG downloads automatically

**Keyboard Modifiers:**
- **Hold Shift** while dragging → 16:9 aspect ratio
- **Hold Alt** while dragging → draw from center point
- **Hold Ctrl** when releasing → copy to clipboard (instead of download)

**Features:**
- Real-time selection box preview
- Exports all shapes within the box
- Includes PDF background in export
- Returns to Select tool after export

**Implementation:**
- Tool: `src/tools/ScreenshotTool/ScreenshotTool.tsx` ⭐
- States: `src/tools/ScreenshotTool/childStates/`

---

## Architecture

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **tldraw** | 4.0.3 | Canvas framework |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **PDF.js** | 5.4.296 | PDF rendering |
| **pdf-lib** | Latest | PDF export |
| **Vite** | 7.1.9 | Build tool |
| **Vitest** | 3.2.4 | Testing framework |
| **pnpm** | 10.8+ | Package manager |

### Key Design Decisions

#### 1. PDF as Locked Image Shapes
**Pattern:** PDF pages → PNG images → tldraw assets → locked image shapes

**Why:**
- Follows tldraw's "everything is a shape" principle
- Proper integration with tldraw's rendering and export
- Easy z-index management via side effects
- Can be referenced in tools and bindings

**Code:** `src/utils/applyPdfToEditor.ts`

#### 2. Bindings API for Pin Tool
**Pattern:** Custom binding extending `BindingUtil`

**Why:**
- Proper tldraw pattern for shape relationships
- Automatic anchor-based positioning
- Built-in lifecycle management
- Clean movement synchronization

**Code:** `src/tools/PinShape/PinBindingUtil.ts`

#### 3. StateNode for Screenshot Tool  
**Pattern:** Tool with child states (Idle → Pointing → Dragging)

**Why:**
- Proper tldraw pattern for complex interactions
- Clear state transitions
- Cursor management
- Keyboard modifier support

**Code:** `src/tools/ScreenshotTool/ScreenshotTool.tsx`

### Data Flow

#### PDF Loading Flow
```
User clicks "Open PDF"
  ↓
usePDFLoader hook triggered
  ↓
PDF.js loads and renders each page
  ↓
Pages converted to PNG data URLs
  ↓
applyPdfToEditor creates:
  - Image assets
  - Locked image shapes
  - Camera bounds constraints
  ↓
PDF visible on canvas (locked, bottom z-index)
```

#### Pin Attachment Flow
```
User places pin on 2 overlapping shapes
  ↓
PinTool creates pin shape
  ↓
Pin detects nearby shapes
  ↓
PinBindingUtil creates bindings with anchors
  ↓
User moves Shape A
  ↓
Binding.onOperationComplete() triggered
  ↓
Calculates delta from anchor movement
  ↓
Applies delta to Shape B
  ↓
Both shapes move in sync
```

#### Screenshot Export Flow
```
User presses 3
  ↓
ScreenshotTool enters Idle state
  ↓
User clicks and drags
  ↓
Idle → Pointing → Dragging
  ↓
Box updates with modifiers (Shift/Alt)
  ↓
User releases mouse
  ↓
exportAs() or copyAs() called
  ↓
PNG downloads or copied to clipboard
```

---

## Development

### Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:5173)
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm typecheck        # Type checking
pnpm lint             # Lint code
pnpm format           # Format code

# Production
pnpm build            # Build for production
```

### Code Quality Tools

- **TypeScript** - Strict mode, zero type errors
- **ESLint** - Code linting with React/TypeScript rules
- **Prettier** - Consistent code formatting
- **Husky** - Git hooks for pre-commit checks
- **Commitlint** - Conventional commit enforcement

### Git Workflow

This project uses **conventional commits**:
```bash
feat(tool): add pin binding functionality
fix(pdf): correct worker loading issue
docs(readme): update usage guide
```

Commits are automatically validated via Husky hooks.

---

## Testing

### Test Coverage

**13 tests across 4 test files:**

- `src/__tests__/hooks/usePDFLoader.test.ts` (4 tests)
  - Hook initialization
  - Function exports

- `src/__tests__/tools/CardShapeUtil.test.ts` (4 tests)
  - Shape type validation
  - Default props
  - Resize capability

- `src/__tests__/tools/PinBindingUtil.test.ts` (2 tests)
  - Binding type
  - Anchor props

- `src/__tests__/utils/applyPdfToEditor.test.ts` (3 tests)
  - PDF structure validation
  - Bounds checking
  - ID uniqueness

### Running Tests

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

**All tests passing:** ✅ 13/13

---

## Project Structure

```
src/
├── components/
│   ├── TldrawApp.tsx              # Main tldraw integration
│   └── ui-overrides.tsx           # Custom toolbar & keyboard shortcuts
├── tools/
│   ├── SizeButtonShape/           # Task 3: Size button
│   │   ├── CardShapeUtil.tsx      # Shape implementation
│   │   └── CardShapeTool.ts       # Tool class
│   ├── PinShape/                  # Task 4: Pin attachment
│   │   ├── PinShapeUtil.tsx       # Shape rendering
│   │   ├── PinBindingUtil.ts      # Binding logic (movement sync)
│   │   └── PinTool.ts             # Tool class
│   └── ScreenshotTool/            # Task 5: Screenshot export
│       ├── ScreenshotTool.tsx     # State machine
│       ├── ScreenshotBox.tsx      # Overlay component
│       └── childStates/           # Tool states
│           ├── Idle.tsx
│           ├── Pointing.tsx
│           └── Dragging.tsx
├── hooks/
│   └── usePDFLoader.ts            # PDF loading & export
├── utils/
│   └── applyPdfToEditor.ts        # PDF → canvas integration
├── types/
│   └── shapes.types.ts            # Type definitions
└── __tests__/                     # Unit tests
    ├── setup.ts
    ├── hooks/
    ├── tools/
    └── utils/


├── main.tsx                       # Entry point
├── index.html                     # HTML template
└── styles.css                     # App styles
```

### Key Files

**Core Implementation:**
- `src/components/TldrawApp.tsx` - Integrates everything
- `src/hooks/usePDFLoader.ts` - PDF loading and export
- `src/utils/applyPdfToEditor.ts` - Adds PDF to canvas

**Custom Tools:**
- `src/tools/SizeButtonShape/CardShapeUtil.tsx` - Task 3
- `src/tools/PinShape/PinBindingUtil.ts` - Task 4 (⭐ bindings)
- `src/tools/ScreenshotTool/ScreenshotTool.tsx` - Task 5 (⭐ StateNode)

---

## OpenSpec Documentation

This project uses **OpenSpec** for specification-driven development.

**Location:** `openspec/changes/tldraw-pdf-canvas-tools/`

**Structure:**
```
openspec/changes/tldraw-pdf-canvas-tools/
├── proposal.md           # Project overview & impact
├── tasks.md              # Implementation checklist (all ✅)
├── design.md             # Technical decisions & rationale
└── specs/                # Detailed requirements
    ├── canvas-integration/
    ├── pdf-rendering/
    └── custom-shapes/
```

**View with OpenSpec CLI:**
```bash
openspec show tldraw-pdf-canvas-tools
openspec validate tldraw-pdf-canvas-tools --strict
```

**What it demonstrates:**
- Requirements documented before implementation
- Clear design decision rationale
- Traceability from spec → code

---

## API Reference

### TldrawApp Component

```tsx
import { TldrawApp } from 'h2-tldrawn'

function App() {
  return <TldrawApp />
}
```

The main component that includes:
- tldraw canvas
- PDF loading controls
- All custom tools registered
- Export functionality

### Hooks

#### usePDFLoader

```tsx
import { usePDFLoader } from 'h2-tldrawn'

const {
  pdf,              // Loaded PDF document
  isLoading,        // Loading state
  error,            // Error message
  openFilePicker,   // Open file dialog
  loadFromUrl,      // Load from URL
  loadFromFile,     // Load from File object
} = usePDFLoader()
```

### Custom Tools Registration

```tsx
import { 
  CardShapeUtil, 
  CardShapeTool,
  PinShapeUtil, 
  PinBindingUtil,
  PinTool,
  ScreenshotTool 
} from 'h2-tldrawn'

<Tldraw
  shapeUtils={[CardShapeUtil, PinShapeUtil]}
  tools={[CardShapeTool, PinTool, ScreenshotTool]}
  bindingUtils={[PinBindingUtil]}
/>
```

### Type Definitions

```typescript
// Size Button Shape
type SizeButtonShape = TLBaseShape<
  'size-button',
  {
    w: number
    h: number
    color: TLDefaultColorStyle
  }
>

// Pin Shape
type PinShape = TLBaseShape<'pin', {}>

// PDF Document
interface PdfDocument {
  name: string
  pages: PdfPage[]
  source: ArrayBuffer
}

interface PdfPage {
  src: string           // PNG data URL
  bounds: Box           // Position and size
  assetId: TLAssetId    // tldraw asset ID
  shapeId: TLShapeId    // tldraw shape ID
}
```

---

## Requirements

- **Node.js** 18+
- **pnpm** 8+
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **React** 19+
- **TypeScript** 5+

---

## Performance

- **PDF Rendering:** 2× device pixel ratio for high quality
- **Image Format:** PNG data URLs (embedded, no network requests)
- **Z-Index Management:** Side effects keep PDF at bottom
- **Camera Constraints:** Prevents scrolling outside PDF bounds
- **Export:** Efficient with progress tracking

---

## Browser Support

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## License

MIT

---

## Contributing

1. Follow conventional commits (`feat:`, `fix:`, `docs:`, etc.)
2. Run tests before committing (`pnpm test`)
3. Format code (`pnpm format`)
4. Update OpenSpec docs for new features

---

## Acknowledgments

- [tldraw](https://tldraw.dev) - Canvas framework
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering by Mozilla
- [pdf-lib](https://pdf-lib.js.org/) - PDF manipulation

---

## Task Implementation Summary

This project implements **all 5 required tasks**:

### ✅ Task 1: Repository Setup
- Package manager: **pnpm**
- Code quality: **Prettier + ESLint + Husky**
- Testing: **Vitest + React Testing Library**
- Build: **Vite**
- TypeScript: **Strict mode**

### ✅ Task 2: PDF Rendering
- PDF pages as **locked tldraw image shapes**
- High-quality rendering with **PDF.js**
- Multi-page support with **vertical stacking**
- Export annotations back to PDF with **pdf-lib**

**Key Innovation:** PDF as shapes (not background) - proper tldraw pattern

### ✅ Task 3: Size Button Shape
- Real-time size display: "300 × 200"
- Click counter: "Clicks: 5"
- Interactive button component
- Custom color support

**Implementation:** `CardShapeUtil` extending `BaseBoxShapeUtil`

### ✅ Task 4: Pin Tool
- Binds 2 overlapping shapes
- Automatic movement synchronization
- Anchor-based positioning

**Key Innovation:** Uses tldraw's **bindings API** (proper pattern, not manual tracking)

**Implementation:** `PinBindingUtil` extending `BindingUtil`

### ✅ Task 5: Screenshot Tool
- Draw rectangle to select area
- Export as PNG
- Keyboard modifiers (Shift/Alt/Ctrl)
- Copy to clipboard support

**Key Innovation:** **StateNode** with child states (proper tldraw tool pattern)

**Implementation:** `ScreenshotTool` extending `StateNode`

---

## tldraw Patterns Demonstrated

This implementation showcases proper usage of tldraw's APIs:

1. **Custom Shapes** - `BaseBoxShapeUtil` with React components
2. **Custom Bindings** - `BindingUtil` for shape relationships
3. **Custom Tools** - `StateNode` with state machine
4. **UI Overrides** - Custom toolbar integration
5. **Side Effects** - Z-ordering and constraints
6. **Asset Management** - PDF images as tldraw assets
7. **Export API** - Using `exportAs` and `copyAs`

---

## Development Guide

### Adding a New Tool

1. **Create shape util** in `src/tools/YourTool/`
2. **Define type** in `src/types/shapes.types.ts`
3. **Register in TldrawApp.tsx:**
   ```tsx
   const customShapeUtils = [..., YourShapeUtil]
   ```
4. **Add to toolbar** in `src/components/ui-overrides.tsx`
5. **Export** in `src/index.ts`

### Testing

Create test file in `src/__tests__/tools/YourTool.test.ts`:
```tsx
import { describe, it, expect } from 'vitest'
import { YourShapeUtil } from '../../tools/YourTool/YourShapeUtil'

describe('YourShapeUtil', () => {
  it('should have correct type', () => {
    expect(YourShapeUtil.type).toBe('your-tool')
  })
})
```

---

## Troubleshooting

### PDF Won't Load
- Check browser console for errors
- Verify PDF URL is accessible  
- Try a different PDF file
- Check network tab for fetch errors

### Tool Not Working
- Ensure tool is selected (check toolbar)
- Use keyboard shortcut (1, 2, or 3)
- Check console for errors
- Verify shape was created

### Pin Not Attaching
- Make sure 2 shapes **overlap**
- Place pin **on the overlapping area**
- Check console for binding logs
- Try creating new shapes

### Screenshot Exports Empty
- Ensure shapes exist within selection
- Check console for export errors
- Try a smaller area
- Verify shapes are visible

---

## Resources

- **tldraw Docs:** https://tldraw.dev
- **Custom Shapes Guide:** https://tldraw.dev/docs/shapes
- **Bindings Guide:** https://tldraw.dev/docs/bindings
- **Tools Guide:** https://tldraw.dev/docs/tools
- **PDF.js Docs:** https://mozilla.github.io/pdf.js/

---

**Built with ❤️ using tldraw**
