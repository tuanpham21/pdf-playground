import { PDFDocument } from 'pdf-lib'
import { useCallback, useState } from 'react'
import { AssetRecordType, Box, Editor, TLAssetId, TLShapeId, createShapeId } from 'tldraw'

// Worker URL will be set dynamically
let PdfJSWorkerSrc: string

export interface PdfPage {
  src: string
  bounds: Box
  assetId: TLAssetId
  shapeId: TLShapeId
}

export interface PdfDocument {
  name: string
  pages: PdfPage[]
  source: ArrayBuffer
}

const pageSpacing = 32
const visualScale = 2

function getFileNameFromUrl(url: string) {
  try {
    const parsed = new URL(url, window.location.href)
    const lastSegment = parsed.pathname.split('/').pop()
    return lastSegment && lastSegment.trim().length > 0
      ? decodeURIComponent(lastSegment)
      : 'document.pdf'
  } catch {
    const lastSegment = url.split('/').pop()
    return lastSegment && lastSegment.trim().length > 0 ? lastSegment : 'document.pdf'
  }
}

async function loadPdfDocument(name: string, source: ArrayBuffer): Promise<PdfDocument> {
  const PdfJS = await import('pdfjs-dist')

  if (!PdfJSWorkerSrc) {
    try {
      PdfJSWorkerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
    } catch {
      PdfJSWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJS.version}/pdf.worker.min.mjs`
    }
  }

  PdfJS.GlobalWorkerOptions.workerSrc = PdfJSWorkerSrc

  const pdf = await PdfJS.getDocument(source.slice(0)).promise
  const pages: PdfPage[] = []

  const canvas = window.document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Failed to create canvas context')

  const scale = window.devicePixelRatio
  console.log(scale, 'scale')

  let top = 0
  let widest = 0
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: scale * visualScale })
    canvas.width = viewport.width
    canvas.height = viewport.height
    const renderContext = {
      canvasContext: context,
      viewport,
    }
    await page.render(renderContext as any).promise

    const width = viewport.width / scale
    const height = viewport.height / scale
    pages.push({
      src: canvas.toDataURL(),
      bounds: new Box(0, top, width, height),
      assetId: AssetRecordType.createId(),
      shapeId: createShapeId(),
    })
    top += height + pageSpacing
    widest = Math.max(widest, width)
  }
  canvas.width = 0
  canvas.height = 0

  for (const page of pages) {
    page.bounds.x = (widest - page.bounds.width) / 2
  }

  return {
    name,
    pages,
    source,
  }
}

export function usePDFLoader() {
  const [pdf, setPdf] = useState<PdfDocument | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFromArrayBuffer = useCallback(async (name: string, source: ArrayBuffer) => {
    setIsLoading(true)
    setError(null)
    try {
      const document = await loadPdfDocument(name, source)
      setPdf(document)
    } catch (err) {
      console.error('PDF loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load PDF')
      setPdf(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadFromFile = useCallback(
    async (file: File) => {
      await loadFromArrayBuffer(file.name, await file.arrayBuffer())
    },
    [loadFromArrayBuffer]
  )

  const loadFromUrl = useCallback(
    async (url: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch PDF (${response.status})`)
        const buffer = await response.arrayBuffer()
        const name = getFileNameFromUrl(url)
        await loadFromArrayBuffer(name, buffer)
      } catch (err) {
        console.error('PDF loading error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load PDF')
        setPdf(null)
        setIsLoading(false)
      }
    },
    [loadFromArrayBuffer]
  )

  const openFilePicker = useCallback(() => {
    const input = window.document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.addEventListener(
      'change',
      async (event) => {
        const fileList = (event.target as HTMLInputElement).files
        if (!fileList || fileList.length === 0) return
        const file = fileList[0]
        await loadFromFile(file)
      },
      { once: true }
    )
    input.click()
  }, [loadFromFile])

  return {
    pdf,
    isLoading,
    error,
    loadFromFile,
    loadFromUrl,
    openFilePicker,
  }
}

export async function exportPdf(
  editor: Editor,
  { name, source, pages }: PdfDocument,
  onProgress: (progress: number) => void
) {
  const totalThings = pages.length * 2 + 2
  let progressCount = 0
  const tickProgress = () => {
    progressCount++
    onProgress(progressCount / totalThings)
  }

  const pdf = await PDFDocument.load(source)
  tickProgress()

  const pdfPages = pdf.getPages()
  if (pdfPages.length !== pages.length) {
    throw new Error('PDF page count mismatch')
  }

  const pageShapeIds = new Set(pages.map((page) => page.shapeId))
  const allIds = Array.from(editor.getCurrentPageShapeIds()).filter((id) => !pageShapeIds.has(id))

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const pdfPage = pdfPages[i]

    const bounds = page.bounds
    const shapesInBounds = allIds.filter((id) => {
      const shapePageBounds = editor.getShapePageBounds(id)
      if (!shapePageBounds) return false
      return shapePageBounds.collides(bounds)
    })

    if (shapesInBounds.length === 0) {
      tickProgress()
      tickProgress()
      continue
    }

    const exportedPng = await editor.toImage(allIds, {
      format: 'png',
      background: false,
      bounds: page.bounds,
      padding: 0,
      scale: 1,
    })
    tickProgress()

    pdfPage.drawImage(await pdf.embedPng(await exportedPng.blob.arrayBuffer()), {
      x: 0,
      y: 0,
      width: pdfPage.getWidth(),
      height: pdfPage.getHeight(),
    })
    tickProgress()
  }

  const pdfBytes = await pdf.save()
  const url = URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' }))
  tickProgress()
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
