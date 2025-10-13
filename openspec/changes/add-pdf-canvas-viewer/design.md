## Context
Adding PDF viewing capability to a tldraw canvas application. Users need to view, navigate, and interact with PDF documents directly on the canvas without external viewers. The solution must integrate seamlessly with tldraw's existing canvas architecture and provide smooth interaction patterns.

**Constraints**:
- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Keep bundle size reasonable (<500KB for PDF library)
- No server-side rendering required (client-side only)
- TypeScript-first development

**Stakeholders**: Frontend developers integrating PDF viewer, end users viewing PDFs on canvas

## Goals / Non-Goals

### Goals
- Implement minimal viable PDF viewer with core features (render, pan, zoom, navigate)
- Achieve smooth 60fps interactions during pan/zoom
- Support both single-page and multi-page PDFs
- Provide intuitive UI controls that match tldraw design language
- Ensure accessibility (keyboard navigation, screen reader support)

### Non-Goals
- PDF editing or annotation (out of scope for initial implementation)
- OCR or text extraction features
- PDF generation or conversion
- Support for password-protected PDFs (can add later)
- Mobile touch gestures (focus on desktop first)

## Decisions

### Decision 1: PDF Rendering Library
**Options Considered**:

1. **PDF.js (Mozilla)** ✓ RECOMMENDED
   - Pros: Industry standard, well-maintained, pure JavaScript, no external dependencies
   - Cons: ~500KB bundle size, learning curve for API
   - License: Apache 2.0
   
2. **react-pdf**
   - Pros: React-friendly API, simpler integration if using React
   - Cons: Adds React dependency, wrapper around PDF.js anyway
   - License: MIT

3. **pdfjs-dist**
   - Pros: Official npm package for PDF.js
   - Cons: Same as PDF.js, just different packaging
   - License: Apache 2.0

**Decision**: Use **PDF.js (pdfjs-dist)** via npm
- Rationale: Most mature, no framework lock-in, TypeScript definitions available
- Implementation: `npm install pdfjs-dist @types/pdfjs-dist`

### Decision 2: UI Framework Approach
**Options Considered**:

1. **React + TypeScript** ✓ RECOMMENDED
   - Pros: Rich ecosystem, excellent TypeScript support, declarative UI, state management
   - Cons: Bundle size (~45KB), requires build setup
   - Reality check: tldraw itself uses React - full compatibility guaranteed
   
2. **Preact + TypeScript**
   - Pros: Smaller bundle (4KB), React-compatible API
   - Cons: Smaller ecosystem, occasional compatibility issues
   
3. **Vanilla TypeScript**
   - Pros: Zero framework overhead
   - Cons: Manual DOM manipulation, reinventing state management, harder to maintain

**Decision**: **React + TypeScript**
- Rationale: tldraw is built with React - use the same stack for seamless integration
- Implementation: React components for UI controls, React hooks for state, canvas for PDF rendering
- Bundle impact: Negligible since tldraw already includes React

### Decision 3: Styling Approach
**Options Considered**:

1. **CSS Modules** ✓ RECOMMENDED
   - Pros: Scoped styles, TypeScript integration, no runtime overhead
   - Cons: Build step required
   
2. **Inline Styles (JS objects)**
   - Pros: Dynamic, no external files
   - Cons: No pseudo-selectors, harder to maintain

3. **Tailwind CSS**
   - Pros: Utility-first, consistent design tokens
   - Cons: Large dependency for small UI surface area

**Decision**: **CSS Modules**
- Rationale: Balance between maintainability and bundle size
- Implementation: `*.module.css` files alongside TypeScript components

### Decision 4: Project Structure - Nx Monorepo vs Standalone React + Vite

**Critical architectural decision that impacts scalability and daily workflow**

#### Option A: Nx Monorepo ⚖️
**What is it**: Full-featured monorepo toolkit with build caching, task orchestration, code generation

**Pros**:
- Future-proof for multiple packages (e.g., `@pdf-viewer/core`, `@pdf-viewer/react`, `@pdf-viewer/utils`)
- Built-in code generation (`nx g component PDFViewer`)
- Task caching speeds up repeated builds/tests
- Dependency graph visualization
- Excellent for teams with >5 developers
- Enforces consistent structure across packages

**Cons**:
- Heavy initial setup (~50+ config files, `nx.json`, `workspace.json`)
- Steeper learning curve for new contributors
- Overkill for single-package projects
- Slower initial dev server start (~3-5s vs <1s for Vite)
- More moving parts to debug when things break
- Requires understanding of Nx concepts (executors, generators, affected commands)

**When to use Nx**:
- ✅ Multiple packages that need to share code
- ✅ Multiple applications (web, mobile, desktop)
- ✅ Team >5 developers needing strict boundaries
- ✅ Existing Nx infrastructure

#### Option B: Standalone React + Vite ✓ RECOMMENDED FOR THIS SCOPE
**What is it**: Single-package project with Vite as build tool, minimal configuration

**Pros**:
- Instant dev server start (<1s)
- Minimal configuration (3 config files: `vite.config.ts`, `tsconfig.json`, `package.json`)
- Lower learning curve - standard React + Vite
- Faster iteration for single-purpose library
- Easy to upgrade to monorepo later if needed
- Standard patterns, huge community

**Cons**:
- No built-in code generation
- Manual setup for shared utilities if project grows
- Less structure enforcement (team must maintain discipline)

**When to use Standalone**:
- ✅ Single package/library (this PDF viewer)
- ✅ Small-medium team (<5 developers)
- ✅ Need rapid prototyping/iteration
- ✅ Want minimal tooling overhead

---

#### **Decision: Standalone React + Vite for MVP, with Nx migration path**

**Rationale**:

1. **Current Scope**: Single PDF viewer component
   - No multiple packages yet
   - No separate backend/frontend/mobile apps
   - Nx would add complexity without value

2. **Development Velocity**: 
   - Vite: `pnpm dev` → running in <1s
   - Nx: Initial setup takes hours, adds learning overhead

3. **Team Size**: Likely small team or solo developer for MVP
   - Don't need Nx's enterprise features yet

4. **Easy Migration Path**: Can upgrade to Nx later if needed
   ```bash
   # Future migration (if needed):
   npx nx@latest init
   # Converts existing project to Nx workspace in ~5 minutes
   ```

5. **YAGNI Principle**: "You Aren't Gonna Need It"
   - Don't build infrastructure for problems you don't have yet
   - Start simple, add complexity when it brings value

**When to reconsider Nx**:
- Need to split into multiple packages (`@pdf-viewer/core`, `@pdf-viewer/react`, `@pdf-viewer/vue`)
- Team grows beyond 5 developers
- Build times become slow (Nx cache would help)
- Need strict code boundaries between modules

**Quick Comparison**:

| Factor | Nx Monorepo | React + Vite (Standalone) |
|--------|-------------|---------------------------|
| **Setup Time** | Hours (complex) | Minutes (simple) |
| **Dev Server Start** | 3-5s | <1s ⚡ |
| **Config Files** | 50+ files | 3 files |
| **Learning Curve** | Steep | Minimal |
| **Build Caching** | ✅ Built-in | ❌ Manual |
| **Code Generation** | ✅ Built-in | ❌ Manual |
| **Multi-package** | ✅ Native | ❌ Not supported |
| **Best For** | Enterprise, 5+ devs | MVP, small teams ✓ |
| **Migration Path** | N/A | Easy to Nx later ✅ |

**Real-world analogy**:
- **Nx** = Building a shopping mall (future-proof, over-engineered for 1 store)
- **Vite** = Building a single storefront (right-sized, fast to open) ✓

**Bottom line**: Start with Vite. If you outgrow it (multiple packages, large team), migrate to Nx takes ~1 day.

---

### Decision 5: Repository Setup & Tooling
**Critical for daily development workflow - these decisions impact every commit**

#### Package Manager
**Decision**: **pnpm** ✓ RECOMMENDED
- Rationale: 
  - Faster than npm (3x), more efficient disk usage (content-addressable store)
  - Strict dependency resolution prevents phantom dependencies
  - Growing adoption, good TypeScript support
- Alternatives: npm (slower, wasteful), yarn (better than npm, but pnpm is faster)
- Implementation: `pnpm install`, commit `pnpm-lock.yaml`

#### Code Formatting
**Decision**: **Prettier + ESLint**
- **Prettier**: Opinionated code formatting (no debates on style)
  - Config: `.prettierrc.json` with:
    ```json
    {
      "semi": false,
      "singleQuote": true,
      "tabWidth": 2,
      "trailingComma": "es5",
      "printWidth": 100
    }
    ```
- **ESLint**: TypeScript-specific linting + React rules
  - Config: `.eslintrc.json` extending:
    - `@typescript-eslint/recommended`
    - `plugin:react/recommended`
    - `plugin:react-hooks/recommended`
- **Pre-commit Hook**: Husky + lint-staged to enforce formatting
  - Auto-format on commit (no manual `prettier --write`)
  - Reject commits with linting errors

#### Build Tooling
**Decision**: **Vite** ✓ RECOMMENDED
- Rationale:
  - Lightning-fast HMR (Hot Module Replacement) for dev workflow
  - Native ESM, optimized for TypeScript + React
  - Simple config, production builds with Rollup
- Alternative: Webpack (slower, more config), esbuild (less mature ecosystem)
- Configuration:
  ```typescript
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs']
      }
    }
  })
  ```

#### TypeScript Configuration
**Strict mode enabled** for type safety:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist"
  }
}
```

#### Testing Setup
**Decision**: **Vitest + React Testing Library**
- Rationale: Vitest = Vite-native testing (same config, fast)
- Unit tests: Component logic, utility functions
- Integration tests: PDF loading, page navigation flows
- Commands:
  - `pnpm test` - Run all tests
  - `pnpm test:watch` - Watch mode for TDD
  - `pnpm test:coverage` - Generate coverage report

#### Git Workflow
**Conventional Commits** + semantic versioning:
- Commit format: `type(scope): description`
  - `feat(pdf): add zoom controls`
  - `fix(rendering): handle corrupted PDFs`
  - `docs(api): update usage examples`
- Tools: `commitlint` to enforce format
- Changelog generation: `standard-version` for automatic releases

### Decision 6: Component Architecture
**Structure**:
```
src/
├── components/
│   ├── PDFViewer.tsx            # Main viewer orchestrator (React)
│   ├── PDFCanvas.tsx            # Canvas rendering component
│   ├── Controls/
│   │   ├── Toolbar.tsx          # Main control panel
│   │   ├── NavigationButtons.tsx # Next/Prev/Jump controls
│   │   ├── ZoomControls.tsx     # Zoom in/out/fit buttons
│   │   └── PageIndicator.tsx    # Page counter display
│   └── ErrorBoundary.tsx        # Error handling wrapper
├── hooks/
│   ├── usePDFDocument.ts        # PDF loading + state management
│   ├── usePDFPage.ts            # Single page rendering logic
│   ├── useZoom.ts               # Zoom state + calculations
│   └── usePan.ts                # Pan/drag state + handlers
├── utils/
│   ├── pdfLoader.ts             # PDF.js wrapper
│   ├── transformations.ts       # Pan/zoom math
│   ├── renderPage.ts            # Canvas rendering logic
│   └── errors.ts                # Error handling utilities
├── types/
│   ├── pdf.types.ts             # PDF-related types
│   └── viewer.types.ts          # Viewer state/config types
├── styles/
│   ├── PDFViewer.module.css     # Main viewer styles
│   └── Controls.module.css      # Toolbar styles
└── index.ts                     # Public API exports
```

**State Management**: React hooks + Context API
- `usePDFDocument` - Document loading, page count, metadata
- `useZoom` - Zoom level (50-300%), transform calculations
- `usePan` - Pan offset (x, y), drag handlers
- No Redux/MobX needed - local state sufficient for isolated feature

## Risks / Trade-offs

### Risk 1: PDF.js Bundle Size (~500KB)
- **Impact**: Increased initial load time
- **Mitigation**: 
  - Lazy load PDF.js only when PDF viewer is activated
  - Use code splitting: `import('pdfjs-dist')` 
  - Consider CDN for worker files

### Risk 2: Performance with Large PDFs
- **Impact**: Memory consumption, slow rendering on pages >10MB
- **Mitigation**:
  - Implement page virtualization (only render visible pages)
  - Add configurable quality/scale settings
  - Show loading indicators for heavy operations

### Risk 3: Cross-browser Canvas Rendering Differences
- **Impact**: Inconsistent text quality, especially Safari
- **Mitigation**:
  - Test on all major browsers early
  - Use PDF.js default rendering settings (battle-tested)
  - Document known limitations per browser

### Trade-off: Desktop-first vs Mobile-first
- **Decision**: Desktop-first for MVP
- **Rationale**: tldraw canvas is primarily desktop tool, mobile gestures add complexity
- **Future**: Add touch gesture support in v2

## Migration Plan
**N/A** - This is a new feature with no migration needed.

**Rollout Strategy**:
1. Merge feature behind feature flag (if available)
2. Internal testing with sample PDFs
3. Beta release to subset of users
4. Full release with documentation

**Rollback**: Simply disable feature flag or revert PR (no data persistence)

## Boilerplate Template Setup

To enable quick adaptation and immediate productivity, we'll provide a **complete scaffold script**:

```bash
#!/bin/bash
# setup-pdf-viewer.sh - Run once to bootstrap the entire project

set -e

echo "🚀 Setting up PDF Viewer boilerplate..."

# 1. Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi

# 2. Install all dependencies
echo "📦 Installing dependencies..."
pnpm add react react-dom pdfjs-dist
pnpm add -D @types/react @types/react-dom @types/pdfjs-dist \
  typescript vite @vitejs/plugin-react \
  vitest @testing-library/react @testing-library/user-event \
  prettier eslint @typescript-eslint/eslint-plugin \
  husky lint-staged commitlint

# 3. Generate config files
echo "⚙️  Generating configuration files..."

# Prettier config
cat > .prettierrc.json << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
EOF

# ESLint config
cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react"],
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
EOF

# Vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
EOF

# 4. Setup Git hooks
echo "🪝 Setting up Git hooks..."
pnpm exec husky install
pnpm exec husky add .husky/pre-commit "pnpm exec lint-staged"
pnpm exec husky add .husky/commit-msg "pnpm exec commitlint --edit \$1"

# 5. Create folder structure
echo "📁 Creating folder structure..."
mkdir -p src/{components/Controls,hooks,utils,types,styles}
mkdir -p src/__tests__/{components,hooks,utils}

# 6. Generate sample files
echo "📝 Generating starter files..."

cat > src/index.ts << 'EOF'
export { PDFViewer } from './components/PDFViewer'
export type { PDFViewerProps } from './types/viewer.types'
EOF

# 7. Update package.json scripts
echo "📜 Updating package.json scripts..."
pnpm pkg set scripts.dev="vite"
pnpm pkg set scripts.build="tsc && vite build"
pnpm pkg set scripts.test="vitest"
pnpm pkg set scripts.test:watch="vitest --watch"
pnpm pkg set scripts.lint="eslint src --ext .ts,.tsx"
pnpm pkg set scripts.format="prettier --write 'src/**/*.{ts,tsx,css}'"
pnpm pkg set scripts.typecheck="tsc --noEmit"

echo "✅ Setup complete! Ready to develop."
echo ""
echo "Quick start commands:"
echo "  pnpm dev        - Start development server"
echo "  pnpm test       - Run tests"
echo "  pnpm build      - Build for production"
echo "  pnpm lint       - Lint code"
echo "  pnpm format     - Format code"
```

**What this gives you**:
1. ✅ All dependencies installed (React, PDF.js, TypeScript, Vite, testing)
2. ✅ All config files generated (Prettier, ESLint, Vite, TypeScript)
3. ✅ Git hooks configured (auto-format on commit, conventional commits enforced)
4. ✅ Folder structure created (components, hooks, utils, types, styles, tests)
5. ✅ Package.json scripts ready (`dev`, `build`, `test`, `lint`, `format`)
6. ✅ Ready to code immediately - no manual setup needed

**Usage**:
```bash
chmod +x setup-pdf-viewer.sh
./setup-pdf-viewer.sh
pnpm dev  # Start developing!
```

## Open Questions

1. **Q**: Should PDF viewer support multiple PDFs open simultaneously?
   - **A**: No for MVP. Single PDF at a time keeps state management simple.

2. **Q**: How to handle PDF links/annotations (clickable links in PDFs)?
   - **A**: Defer to v2. Focus on viewing only for MVP.

3. **Q**: Keyboard shortcuts for navigation (arrow keys, +/- for zoom)?
   - **A**: Yes, include in MVP. Document in accessibility section.

4. **Q**: Should zoom preserve position or center on page?
   - **A**: Center on mouse cursor position (standard behavior).

5. **Q**: Default zoom level when loading PDF?
   - **A**: Fit to viewport width while maintaining aspect ratio.
