import React, { useEffect, useRef, useState } from 'react'
import { Tldraw, Editor } from 'tldraw'
import { exportPdf, usePDFLoader } from '../hooks/usePDFLoader'
import { applyPdfToEditor } from '../utils/applyPdfToEditor'
import { CardShapeUtil } from '../tools/SizeButtonShape/CardShapeUtil'
import { CardShapeTool } from '../tools/SizeButtonShape/CardShapeTool'
import { PinShapeUtil } from '../tools/PinShape/PinShapeUtil'
import { PinTool } from '../tools/PinShape/PinTool'
import { PinBindingUtil } from '../tools/PinShape/PinBindingUtil'
import { ScreenshotTool } from '../tools/ScreenshotTool/ScreenshotTool'
import { components, uiOverrides } from './ui-overrides'

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  backgroundColor: string
}

function ControlButton({ backgroundColor, disabled, style, ...props }: ControlButtonProps) {
  const disabledBackground = '#9ca3af'
  const resolvedBackground = disabled ? disabledBackground : backgroundColor

  const baseStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
    backgroundColor: resolvedBackground,
  }

  return <button type="button" disabled={disabled} style={{ ...baseStyle, ...style }} {...props} />
}

const customShapeUtils = [CardShapeUtil, PinShapeUtil]
const customTools = [CardShapeTool, PinTool, ScreenshotTool]
const customBindingUtils = [PinBindingUtil]

export function TldrawApp() {
  const editorRef = useRef<Editor | null>(null)
  const pdfCleanupRef = useRef<(() => void) | null>(null)
  const { pdf, isLoading, error, openFilePicker, loadFromUrl } = usePDFLoader()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  useEffect(() => {
    return () => {
      pdfCleanupRef.current?.()
      pdfCleanupRef.current = null
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    pdfCleanupRef.current?.()
    pdfCleanupRef.current = null

    if (!pdf) return

    pdfCleanupRef.current = applyPdfToEditor(editor, pdf)
  }, [pdf])

  const handleUrlLoad = async () => {
    const url = prompt('Enter PDF URL:')
    if (url) {
      await loadFromUrl(url)
    }
  }

  const handleExport = async () => {
    const editor = editorRef.current
    if (!pdf || !editor) return

    try {
      setIsExporting(true)
      setExportProgress(0)
      await exportPdf(editor, pdf, setExportProgress)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* PDF Loading Controls */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <ControlButton onClick={openFilePicker} backgroundColor="#3b82f6">
          Open PDF
        </ControlButton>

        <ControlButton onClick={handleUrlLoad} backgroundColor="#10b981">
          Load from URL
        </ControlButton>

        {isLoading && <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading PDF...</span>}
        {error && <span style={{ fontSize: '14px', color: '#ef4444' }}>{error}</span>}
        {!isLoading && pdf && !error && (
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            PDF loaded ({pdf.pages.length} pages)
          </span>
        )}
        <ControlButton
          onClick={handleExport}
          disabled={!pdf || isExporting}
          backgroundColor="#3b82f6"
          style={{ marginLeft: 'auto' }}
        >
          {isExporting ? `Exporting… ${Math.round(exportProgress * 100)}%` : 'Export PDF'}
        </ControlButton>
      </div>

      {/* Tldraw Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Tldraw
          shapeUtils={customShapeUtils}
          overrides={uiOverrides}
          tools={customTools}
          bindingUtils={customBindingUtils}
          components={components}
          onMount={(editor) => {
            editorRef.current = editor
          }}
        />
      </div>
    </div>
  )
}
