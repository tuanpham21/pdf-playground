import { Box, RecordProps, Rectangle2d, ShapeUtil, TLShapeUtilCanBindOpts, invLerp } from 'tldraw'
import type { PinShape } from '../../types/shapes.types'

const offsetX = -16
const offsetY = -26

export class PinShapeUtil extends ShapeUtil<PinShape> {
  static override type = 'pin' as const
  static override props: RecordProps<PinShape> = {}

  override getDefaultProps(): PinShape['props'] {
    return {}
  }

  override canBind({ toShapeType, bindingType }: TLShapeUtilCanBindOpts<PinShape>) {
    if (bindingType === 'pin') {
      // Pins cannot bind to other pins
      return toShapeType !== 'pin'
    }
    return true
  }

  override canEdit() {
    return false
  }

  override canResize() {
    return false
  }

  override hideRotateHandle() {
    return true
  }

  override isAspectRatioLocked() {
    return true
  }

  override getGeometry() {
    return new Rectangle2d({
      width: 32,
      height: 32,
      x: offsetX,
      y: offsetY,
      isFilled: true,
    })
  }

  override component() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          marginLeft: offsetX,
          marginTop: offsetY,
          fontSize: '26px',
          textAlign: 'center',
          pointerEvents: 'all',
        }}
      >
        📍
      </div>
    )
  }

  override indicator() {
    return <rect width={32} height={32} x={offsetX} y={offsetY} />
  }

  override onTranslateStart(shape: PinShape) {
    const bindings = this.editor.getBindingsFromShape(shape, 'pin')
    this.editor.deleteBindings(bindings)
  }

  override onTranslateEnd(_initial: PinShape, pin: PinShape) {
    const pageAnchor = this.editor.getShapePageTransform(pin).applyToPoint({ x: 0, y: 0 })

    const targets = this.editor
      .getShapesAtPoint(pageAnchor, { hitInside: true })
      .filter((shape) => {
        // Ignore locked PDF page images so pin bindings don't try to move them.
        if (shape.type === 'image' && shape.isLocked) {
          return false
        }
        return (
          this.editor.canBindShapes({ fromShape: pin, toShape: shape, binding: 'pin' }) &&
          shape.parentId === pin.parentId &&
          shape.index < pin.index
        )
      })

    for (const target of targets) {
      const targetBounds = Box.ZeroFix(this.editor.getShapeGeometry(target)!.bounds)
      const pointInTargetSpace = this.editor.getPointInShapeSpace(target, pageAnchor)

      const anchor = {
        x: invLerp(targetBounds.minX, targetBounds.maxX, pointInTargetSpace.x),
        y: invLerp(targetBounds.minY, targetBounds.maxY, pointInTargetSpace.y),
      }

      this.editor.createBinding({
        type: 'pin',
        fromId: pin.id,
        toId: target.id,
        props: {
          anchor,
        },
      })
    }
  }
}
