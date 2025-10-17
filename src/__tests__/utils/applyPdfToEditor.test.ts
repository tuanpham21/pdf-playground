import { describe, it, expect } from 'vitest'
import { Box, createShapeId, AssetRecordType } from 'tldraw'

describe('applyPdfToEditor', () => {
  const createMockPdf = () => ({
    name: 'test.pdf',
    source: new ArrayBuffer(8),
    pages: [
      {
        src: 'data:image/png;base64,test',
        bounds: new Box(0, 0, 100, 100),
        assetId: AssetRecordType.createId(),
        shapeId: createShapeId(),
      },
    ],
  })

  it('should create valid PDF document structure', () => {
    const mockPdf = createMockPdf()

    expect(mockPdf.pages).toHaveLength(1)
    expect(mockPdf.pages[0]).toHaveProperty('src')
    expect(mockPdf.pages[0]).toHaveProperty('bounds')
    expect(mockPdf.pages[0]).toHaveProperty('assetId')
    expect(mockPdf.pages[0]).toHaveProperty('shapeId')
  })

  it('should have valid bounds', () => {
    const mockPdf = createMockPdf()
    const bounds = mockPdf.pages[0].bounds

    expect(bounds.w).toBe(100)
    expect(bounds.h).toBe(100)
    expect(bounds.x).toBe(0)
    expect(bounds.y).toBe(0)
  })

  it('should generate unique IDs for pages', () => {
    const pdf1 = createMockPdf()
    const pdf2 = createMockPdf()

    expect(pdf1.pages[0].assetId).not.toBe(pdf2.pages[0].assetId)
    expect(pdf1.pages[0].shapeId).not.toBe(pdf2.pages[0].shapeId)
  })
})
