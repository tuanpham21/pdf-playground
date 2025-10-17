# Design Document: tldraw PDF Canvas with Custom Tools

## Context

Building a web application around tldraw canvas that allows users to interact with PDF documents and use custom tools. This implements all 5 tasks from the project requirements.

**Constraints:**
- Must use tldraw as the core canvas framework
- PDF must be integrated seamlessly with tldraw
- Custom tools must follow tldraw's patterns
- All interactions happen on the tldraw canvas
- TypeScript-first development

**Stakeholders:** Frontend developers, end users interacting with PDFs on canvas

## Goals / Non-Goals

### Goals
- Implement tldraw-based canvas application
- PDF rendering as background layer
- Three custom interactive tools (size-button, pin, camera)
- Professional integration with tldraw API
- Type-safe implementation
- Well-documented codebase

### Non-Goals
- PDF editing (annotation, text extraction)
- Mobile-first design (desktop focus)
- Multi-user collaboration (not in scope)
- PDF generation or conversion
- Advanced PDF features (forms, signatures)

## Decisions

### Decision 1: tldraw as Core Framework ✓ CHOSEN

**Why tldraw:**
- Project requirement explicitly states "canvas powered by tldraw"
- Rich API for custom shapes and tools
- Built-in shape management, selection, transformation
- Excellent TypeScript support
- Active development and documentation

**Alternatives Considered:**
- Fabric.js - Good but less suitable for shape-based tools
- Konva - Lower-level, more work to implement
- Custom canvas - Too much reinvention

**Implementation:**
```typescript
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
```

---

### Decision 2: PDF as Background Layer ✓ CHOSEN

**Options Considered:**

**A) PDF as Custom Shape** ❌
- Pros: Can move/resize PDF
- Cons: PDF would be selectable, interfere with tools, complex

**B) PDF as Background Layer** ✅ CHOSEN
- Pros: PDF locked, non-interactive, natural drawing on top
- Cons: Can't move PDF (acceptable for use case)

**Implementation:**
```typescript
components={{
  Background: () => (
    <image href={pdfImage} />
  )
}}
```

**Rationale:**
- PDFs should stay fixed while users draw
- Simpler implementation
- Better performance
- Matches expected UX

---

### Decision 3: PDF.js for Rendering ✓ CHOSEN

**Rationale:**
- Industry standard for PDF rendering
- Already selected in previous implementation
- Proven reliability
- Convert PDF pages to images for canvas

**Implementation Flow:**
1. Load PDF with PDF.js
2. Render page to off-screen canvas
3. Convert to PNG data URL
4. Use as tldraw background image

---

### Decision 4: Custom Shapes vs Custom Tools

**Decision: Use Custom Shapes** ✅

**Why:**
- tldraw's shape system handles selection, movement, resize
- Shapes persist on canvas
- Can embed React components (buttons, etc.)
- Easier to implement complex interactions

**Shape Types Created:**
1. `size-button` - Interactive button shape
2. `pin` - Attachment shape
3. `camera` - Export shape

Each extends `BaseBoxShapeUtil` from tldraw.

---

### Decision 5: Shape Implementations

#### Size Button Shape (Task 3)

**Requirements:**
- Button displays shape size in real-time
- Click counter

**Implementation:**
```typescript
class SizeButtonShapeUtil extends BaseBoxShapeUtil<SizeButtonShape> {
  component(shape) {
    return (
      <HTMLContainer>
        <button onClick={handleClick}>
          Size: {shape.props.w}×{shape.props.h}
        </button>
        <div>Clicks: {shape.props.clickCount}</div>
      </HTMLContainer>
    )
  }
}
```

**Key Features:**
- Real-time updates via shape props
- Interactive button with click handling
- Shape update on click increments counter

---

#### Pin Shape (Task 4)

**Requirements:**
- Pin-shaped visual
- Attach 2 overlapping shapes
- Synchronized movement

**Implementation Approach:**

**Overlap Detection:**
```typescript
useEffect(() => {
  const pinBounds = editor.getShapeGeometry(shape).bounds
  const overlapping = allShapes.filter(s => 
    shapeBounds.containsPoint(pinCenter)
  )
  if (overlapping.length >= 2) {
    attachShapes(overlapping.slice(0, 2))
  }
}, [shape.position])
```

**Movement Sync:**
```typescript
editor.sideEffects.registerAfterChangeHandler('shape', (prev, next) => {
  if (isAttachedShape(next.id)) {
    moveOtherShape(delta)
  }
})
```

**Visual Feedback:**
- Green pin = 2 shapes attached
- Red pin = not attached

**Challenges:**
- Detecting overlaps efficiently
- Preventing infinite update loops
- Maintaining attachment through transformations

**Solution:**
- Use tldraw's geometry API for overlap
- Side effects API for movement sync
- Store attached IDs in shape props

---

#### Camera Shape (Task 5)

**Requirements:**
- Crop rectangle
- Export selected area

**Implementation:**
```typescript
const handleExport = async () => {
  const shapeBounds = editor.getShapePageBounds(shape)
  const svg = await editor.getSvgString(shapeIds, {
    bounds: shapeBounds,
    scale: 2,
    background: true
  })
  downloadSVG(svg)
}
```

**Export Format: SVG** ✓
- Why: tldraw's native export format
- Vector format = high quality
- Can convert to raster later if needed
- Simple implementation

**Alternative (PNG Export):**
- More complex: need canvas rendering
- Raster format = fixed resolution
- Deferred to future enhancement

---

### Decision 6: State Management

**Approach: React Hooks + tldraw Editor State**

**PDF State:**
- `usePDFBackground` hook manages PDF loading, pages
- React state for current page, images, errors
- No need for Redux/MobX (state is localized)

**Shape State:**
- Managed by tldraw's shape system
- Shape props for custom data (clickCount, attachedShapes)
- Editor API for queries and updates

**Why this approach:**
- Leverages tldraw's built-in state management
- Hooks are sufficient for component state
- No complex global state needed

---

### Decision 7: File Structure

```
src/
├── components/
│   └── TldrawApp.tsx          # Main tldraw integration
├── tools/
│   ├── SizeButtonShape/
│   │   └── SizeButtonShapeUtil.tsx
│   ├── PinShape/
│   │   └── PinShapeUtil.tsx
│   └── CameraShape/
│       └── CameraShapeUtil.tsx
├── hooks/
│   └── usePDFBackground.ts    # PDF state management
├── utils/
│   └── pdfToImage.ts          # PDF conversion
└── types/
    └── shapes.types.ts        # Shape type definitions
```

**Rationale:**
- Tools organized by feature
- Clear separation of concerns
- Easy to add new tools
- Follows tldraw patterns

---

## Technical Specifications

### Custom Shape Type Definitions

```typescript
// Task 3
export type SizeButtonShape = TLBaseShape<
  'size-button',
  {
    w: number
    h: number
    clickCount: number
  }
>

// Task 4
export type PinShape = TLBaseShape<
  'pin',
  {
    w: number
    h: number
    attachedShapes: string[]
  }
>

// Task 5
export type CameraShape = TLBaseShape<
  'camera',
  {
    w: number
    h: number
  }
>
```

### Shape Registration

```typescript
const customShapeUtils = [
  SizeButtonShapeUtil,
  PinShapeUtil,
  CameraShapeUtil,
]

<Tldraw shapeUtils={customShapeUtils} />
```

### Keyboard Shortcuts

- `1` - Size Button tool
- `2` - Pin tool
- `3` - Camera tool

Integrated via tldraw's UI overrides.

---

## Performance Considerations

### PDF Rendering
- **Issue:** Large PDFs can be slow
- **Solution:** Render at 2x scale (quality vs performance balance)
- **Optimization:** Cache rendered images, lazy load pages

### Shape Updates
- **Issue:** Real-time size updates on every resize
- **Solution:** React component updates automatically via props
- **Note:** tldraw handles throttling internally

### Movement Sync
- **Issue:** Pin attachment could cause performance issues
- **Solution:** Use tldraw's side effects API (optimized)
- **Guard:** Only sync when shapes actually attached

---

## Testing Strategy

### Unit Tests
- Shape utilities logic
- PDF conversion functions
- Hook state management

### Integration Tests
- Shape creation and interaction
- Pin attachment behavior
- Export functionality

### Manual Testing
- Load various PDFs
- Test each tool with different scenarios
- Verify keyboard shortcuts
- Test edge cases (empty canvas, overlapping shapes)

---

## Migration Notes

**From Standalone PDF Viewer to tldraw:**

**What Changed:**
- Entry point completely rewritten
- PDF viewer is now tldraw canvas
- New tools directory structure

**What Stayed:**
- PDF.js integration (adapted for image conversion)
- Build configuration
- Testing infrastructure

**Breaking Changes:**
- Previous PDFViewer component not used
- Different props/API
- New dependency (tldraw)

**Migration Path:**
- Old viewer kept in `src/components/PDFViewer.tsx` for reference
- New app uses `src/components/TldrawApp.tsx`
- Can run side-by-side if needed

---

## Future Enhancements

1. **PNG Export:** Add raster export option for Camera tool
2. **Pin Groups:** Support pinning more than 2 shapes
3. **Shape Templates:** Pre-built shape libraries
4. **Persistence:** Save canvas state to localStorage
5. **Collaboration:** Multi-user editing
6. **Mobile Support:** Touch gestures
7. **PDF Annotations:** Edit PDF content

---

## Open Questions

**Q: Should PDF be movable on canvas?**
**A:** No (current design). Background layer is fixed. Could add zoom/pan controls if needed.

**Q: Should pins work with more than 2 shapes?**
**A:** Not in v1. Could enhance to support shape groups.

**Q: PNG vs SVG export?**
**A:** SVG for v1 (simpler). PNG can be added later.

**Q: Should shapes persist across page changes?**
**A:** Currently no. Each PDF page is independent. Could add persistence.

---

## References

- [tldraw Documentation](https://tldraw.dev)
- [tldraw Custom Shapes](https://tldraw.dev/docs/shapes)
- [tldraw Editor API](https://tldraw.dev/reference/editor/Editor)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Project Requirements](../../../requirements/README.pdf)

---

## Summary

This design implements all 5 project tasks using tldraw as the core framework. PDF rendering is handled as a background layer, with three custom interactive tools built using tldraw's shape system. The architecture is clean, type-safe, and extensible for future enhancements.
