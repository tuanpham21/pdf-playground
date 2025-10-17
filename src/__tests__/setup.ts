import { vi } from 'vitest'

// Mock tldraw
vi.mock('tldraw', async () => {
  const actual = await vi.importActual('tldraw')
  return {
    ...actual,
    Tldraw: vi.fn(() => null),
  }
})

// Mock PDF.js worker
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: 'mock-worker-url',
}))
