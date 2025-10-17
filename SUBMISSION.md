# Submission Notes

## Purpose

This document provides context for reviewers evaluating this hometest submission. It highlights key decisions and guides reviewers to important aspects of the implementation.

---

## 🚀 Quick Evaluation Guide

### To Run the App (< 2 minutes)
```bash
pnpm install
pnpm dev
# Open http://localhost:5173
# Click "Open PDF" → select requirements/README.pdf
# Press 1, 2, 3 to try each custom tool
```

### To Review Code Quality (< 5 minutes)
```bash
pnpm typecheck  # TypeScript validation
pnpm test       # Run 13 unit tests
```

---

## 📋 Task Completion Summary

| Task | Implementation | Key File |
|------|----------------|----------|
| 1 | Repository setup with pnpm, TypeScript, testing | `package.json`, `tsconfig.json` |
| 2 | PDF as locked tldraw image shapes | `src/utils/applyPdfToEditor.ts` |
| 3 | Size button with real-time size + click counter | `src/tools/SizeButtonShape/CardShapeUtil.tsx` |
| 4 | Pin tool with tldraw bindings API | `src/tools/PinShape/PinBindingUtil.ts` ⭐ |
| 5 | Screenshot tool as StateNode | `src/tools/ScreenshotTool/ScreenshotTool.tsx` ⭐ |

**All 5 tasks completed with proper tldraw patterns.**

---

## 🎯 Key Technical Decisions

### 1. Bindings API for Pin Tool ⭐
**Decision:** Used tldraw's `BindingUtil` for shape attachment

**Why:**
- Proper tldraw pattern for relationships
- Automatic anchor-based positioning
- Built-in movement synchronization
- Clean, maintainable code

**See:** `src/tools/PinShape/PinBindingUtil.ts`

### 2. StateNode for Screenshot Tool ⭐
**Decision:** Implemented as `StateNode` with child states

**Why:**
- Proper pattern for complex tool interactions
- Clear state machine (Idle → Pointing → Dragging)
- Built-in cursor and keyboard handling
- Matches tldraw's built-in tool patterns

**See:** `src/tools/ScreenshotTool/ScreenshotTool.tsx`

### 3. PDF as Locked Shapes
**Decision:** Render PDF pages as locked image shapes (not background)

**Why:**
- Follows tldraw's "everything is a shape" philosophy
- Proper integration with tldraw's export and rendering
- Clean z-index management via side effects

**See:** `src/utils/applyPdfToEditor.ts`

---

## 🔍 Code Highlights for Review

### Best Examples of tldraw Mastery

**Bindings Implementation:**
- File: `src/tools/PinShape/PinBindingUtil.ts`
- Shows: Anchor system, movement sync, operation lifecycle

**StateNode Tool:**
- File: `src/tools/ScreenshotTool/ScreenshotTool.tsx`
- Shows: State machine, child states, cursor handling

**Interactive Shape:**
- File: `src/tools/SizeButtonShape/CardShapeUtil.tsx`
- Shows: HTMLContainer, event handling, real-time updates

---

## 📚 Documentation

### README.md
Complete documentation including:
- Quick start guide
- Usage for each tool
- Architecture overview
- Development guide

### OpenSpec
Specification-driven development demonstrated in:
- `openspec/changes/tldraw-pdf-canvas-tools/`

Shows planning before implementation with:
- Requirements (specs/)
- Design decisions (design.md)
- Task tracking (tasks.md)

---

## ✅ Quality Checklist

- [x] All 5 tasks completed
- [x] Proper tldraw patterns (bindings, StateNode)
- [x] TypeScript strict mode (zero errors)
- [x] 13 unit tests passing
- [x] Code formatted (Prettier + ESLint)
- [x] Conventional commits
- [x] Comprehensive documentation
- [x] Production-ready code

---

**This project is ready for evaluation.**

For detailed information, see [README.md](./README.md).
