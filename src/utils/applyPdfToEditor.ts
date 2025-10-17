import { Editor, TLImageShape, TLShapePartial, getIndicesBetween, react, sortByIndex } from 'tldraw'

import type { PdfDocument } from '../hooks/usePDFLoader'

export function applyPdfToEditor(editor: Editor, pdf: PdfDocument): () => void {
  editor.createAssets(
    pdf.pages.map((page) => ({
      id: page.assetId,
      typeName: 'asset' as const,
      type: 'image' as const,
      meta: {},
      props: {
        w: page.bounds.w,
        h: page.bounds.h,
        mimeType: 'image/png',
        src: page.src,
        name: 'page',
        isAnimated: false,
      },
    }))
  )

  editor.createShapes(
    pdf.pages.map(
      (page): TLShapePartial<TLImageShape> => ({
        id: page.shapeId,
        type: 'image',
        x: page.bounds.x,
        y: page.bounds.y,
        isLocked: true,
        props: {
          assetId: page.assetId,
          w: page.bounds.w,
          h: page.bounds.h,
        },
      })
    )
  )

  const shapeIds = pdf.pages.map((page) => page.shapeId)
  const shapeIdSet = new Set(shapeIds)

  // Don't let the user unlock the PDF page shapes
  const beforeChangeDispose = editor.sideEffects.registerBeforeChangeHandler(
    'shape',
    (prev, next) => {
      if (!shapeIdSet.has(next.id)) return next
      if (next.isLocked) return next
      return { ...prev, isLocked: true }
    }
  )

  // Make sure the shapes are below any of the other shapes
  function makeSureShapesAreAtBottom() {
    const shapes = shapeIds
      .map((id) => editor.getShape(id))
      .filter((shape): shape is TLImageShape => Boolean(shape))
      .sort(sortByIndex)

    if (shapes.length === 0) return

    const pageId = editor.getCurrentPageId()
    const siblings = editor.getSortedChildIdsForParent(pageId)
    const currentBottomShapes = siblings
      .slice(0, shapes.length)
      .map((id) => editor.getShape(id))
      .filter((shape): shape is TLImageShape => Boolean(shape))

    if (
      currentBottomShapes.length === shapes.length &&
      currentBottomShapes.every((shape, i) => shape.id === shapes[i].id)
    ) {
      return
    }

    const otherSiblings = siblings.filter((id) => !shapeIdSet.has(id))
    const bottomSibling = otherSiblings[0]
    if (!bottomSibling) return

    const lowestIndex = editor.getShape(bottomSibling)!.index
    const indexes = getIndicesBetween(undefined, lowestIndex, shapes.length)
    editor.updateShapes(
      shapes.map((shape, i) => ({
        id: shape.id,
        type: shape.type,
        isLocked: shape.isLocked,
        index: indexes[i],
      }))
    )
  }

  makeSureShapesAreAtBottom()
  const afterCreateDispose = editor.sideEffects.registerAfterCreateHandler(
    'shape',
    makeSureShapesAreAtBottom
  )
  const afterChangeDispose = editor.sideEffects.registerAfterChangeHandler(
    'shape',
    makeSureShapesAreAtBottom
  )

  // Constrain the camera to the bounds of the pages
  const targetBounds = pdf.pages.reduce(
    (acc, page) => acc.union(page.bounds),
    pdf.pages[0].bounds.clone()
  )

  function updateCameraBounds(isMobile: boolean) {
    editor.setCameraOptions({
      constraints: {
        bounds: targetBounds,
        padding: { x: isMobile ? 16 : 164, y: 64 },
        origin: { x: 0.5, y: 0 },
        initialZoom: 'fit-x-100',
        baseZoom: 'default',
        behavior: 'contain',
      },
    })
    editor.setCamera(editor.getCamera(), { reset: true })
  }

  let isMobile = editor.getViewportScreenBounds().width < 840

  const reactionDispose = react('update camera', () => {
    const isMobileNow = editor.getViewportScreenBounds().width < 840
    if (isMobileNow === isMobile) return
    isMobile = isMobileNow
    updateCameraBounds(isMobile)
  })

  updateCameraBounds(isMobile)

  return () => {
    beforeChangeDispose()
    afterCreateDispose()
    afterChangeDispose()
    if (typeof reactionDispose === 'function') {
      reactionDispose()
    }

    const existingShapes = shapeIds
      .map((id) => editor.getShape(id))
      .filter((shape): shape is TLImageShape => Boolean(shape))

    if (existingShapes.length > 0) {
      editor.updateShapes(
        existingShapes.map((shape) => ({
          id: shape.id,
          type: shape.type,
          isLocked: false,
        }))
      )
      editor.deleteShapes(existingShapes.map((shape) => shape.id))
    }

    const assetIds = pdf.pages.map((page) => page.assetId)
    const existingAssetIds = assetIds.filter((id) => editor.getAsset(id))
    if (existingAssetIds.length > 0) {
      editor.deleteAssets(existingAssetIds)
    }
  }
}
