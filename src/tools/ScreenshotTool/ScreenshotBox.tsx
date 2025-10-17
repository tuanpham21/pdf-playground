import { Box, useEditor, useValue } from 'tldraw'
import { ScreenshotDragging } from './childStates/Dragging'

// Override InFrontOfTheCanvas to draw the active screenshot box above the canvas.
export function ScreenshotBox() {
  const editor = useEditor()

  const screenshotBrush = useValue(
    'screenshot brush',
    () => {
      // Check whether the screenshot tool (and its dragging state) is active
      if (editor.getPath() !== 'screenshot.dragging') return null

      // Get screenshot.dragging state node
      const draggingState = editor.getStateDescendant<ScreenshotDragging>('screenshot.dragging')!

      // Get the box from the screenshot.dragging state node
      const box = draggingState.screenshotBox.get()

      // The box is in "page space", i.e. panned and zoomed with the canvas, but we
      // want to show it in front of the canvas, so we'll need to convert it to
      // "page space", i.e. uneffected by scale, and relative to the tldraw
      // page's top left corner.
      const zoomLevel = editor.getZoomLevel()
      const { x, y } = editor.pageToViewport({ x: box.x, y: box.y })
      return new Box(x, y, box.w * zoomLevel, box.h * zoomLevel)
    },
    [editor]
  )

  if (!screenshotBrush) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate(${screenshotBrush.x}px, ${screenshotBrush.y}px)`,
        width: screenshotBrush.w,
        height: screenshotBrush.h,
        border: '1px solid var(--tl-color-text-0)',
        zIndex: 999,
      }}
    />
  )
}
