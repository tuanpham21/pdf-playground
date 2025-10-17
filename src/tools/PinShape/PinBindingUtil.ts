import {
  BindingOnShapeChangeOptions,
  BindingOnShapeDeleteOptions,
  BindingUtil,
  TLShapeId,
  lerp,
  Vec,
  VecModel,
  TLBaseBinding,
} from 'tldraw'
import type { PinShape } from '../../types/shapes.types'

type PinBinding = TLBaseBinding<
  'pin',
  {
    anchor: VecModel
  }
>

export class PinBindingUtil extends BindingUtil<PinBinding> {
  static override type = 'pin' as const

  override getDefaultProps() {
    return {
      anchor: { x: 0.5, y: 0.5 },
    }
  }

  private changedToShapes = new Set<TLShapeId>()

  override onOperationComplete(): void {
    if (this.changedToShapes.size === 0) return

    const fixedShapes = this.changedToShapes
    const toCheck = [...this.changedToShapes]

    const initialPositions = new Map<TLShapeId, VecModel>()
    const targetDeltas = new Map<TLShapeId, Map<TLShapeId, VecModel>>()

    const addTargetDelta = (fromId: TLShapeId, toId: TLShapeId, delta: VecModel) => {
      if (!targetDeltas.has(fromId)) targetDeltas.set(fromId, new Map())
      targetDeltas.get(fromId)!.set(toId, delta)

      if (!targetDeltas.has(toId)) targetDeltas.set(toId, new Map())
      targetDeltas.get(toId)!.set(fromId, { x: -delta.x, y: -delta.y })
    }

    const allShapes = new Set<TLShapeId>()
    while (toCheck.length) {
      const shapeId = toCheck.pop()!

      const shape = this.editor.getShape(shapeId)
      if (!shape) continue

      if (allShapes.has(shapeId)) continue
      allShapes.add(shapeId)

      const bindings = this.editor.getBindingsToShape<PinBinding>(shape, 'pin')
      for (const binding of bindings) {
        if (allShapes.has(binding.fromId)) continue
        allShapes.add(binding.fromId)

        const pin = this.editor.getShape<PinShape>(binding.fromId)
        if (!pin) continue

        const pinPosition = this.editor.getShapePageTransform(pin).applyToPoint({ x: 0, y: 0 })
        initialPositions.set(pin.id, pinPosition)

        for (const binding of this.editor.getBindingsFromShape<PinBinding>(pin.id, 'pin')) {
          const shapeBounds = this.editor.getShapeGeometry(binding.toId)!.bounds
          const shapeAnchor = {
            x: lerp(shapeBounds.minX, shapeBounds.maxX, binding.props.anchor.x),
            y: lerp(shapeBounds.minY, shapeBounds.maxY, binding.props.anchor.y),
          }
          const currentPageAnchor = this.editor
            .getShapePageTransform(binding.toId)
            .applyToPoint(shapeAnchor)

          const shapeOrigin = this.editor
            .getShapePageTransform(binding.toId)
            .applyToPoint({ x: 0, y: 0 })
          initialPositions.set(binding.toId, shapeOrigin)

          addTargetDelta(pin.id, binding.toId, {
            x: currentPageAnchor.x - shapeOrigin.x,
            y: currentPageAnchor.y - shapeOrigin.y,
          })

          if (!allShapes.has(binding.toId)) toCheck.push(binding.toId)
        }
      }
    }

    const currentPositions = new Map(initialPositions)

    const iterations = 30
    for (let i = 0; i < iterations; i++) {
      const movements = new Map<TLShapeId, VecModel[]>()
      for (const [aId, deltas] of targetDeltas) {
        if (fixedShapes.has(aId)) continue
        const aPosition = currentPositions.get(aId)!
        for (const [bId, targetDelta] of deltas) {
          const bPosition = currentPositions.get(bId)!

          const adjustmentDelta = {
            x: targetDelta.x - (aPosition.x - bPosition.x),
            y: targetDelta.y - (aPosition.y - bPosition.y),
          }

          if (!movements.has(aId)) movements.set(aId, [])
          movements.get(aId)!.push(adjustmentDelta)
        }
      }

      for (const [shapeId, deltas] of movements) {
        const currentPosition = currentPositions.get(shapeId)!
        currentPositions.set(shapeId, Vec.Average(deltas).add(currentPosition))
      }
    }

    const updates = []
    for (const [shapeId, position] of currentPositions) {
      const delta = Vec.Sub(position, initialPositions.get(shapeId)!)
      if (delta.len2() <= 0.01) continue

      const newPosition = this.editor.getPointInParentSpace(shapeId, position)
      updates.push({
        id: shapeId,
        type: this.editor.getShape(shapeId)!.type,
        x: newPosition.x,
        y: newPosition.y,
      })
    }

    if (updates.length === 0) {
      this.changedToShapes.clear()
    } else {
      this.editor.updateShapes(updates)
    }
  }

  // when the shape we're stuck to changes, update the pin's position
  override onAfterChangeToShape({ binding }: BindingOnShapeChangeOptions<PinBinding>): void {
    this.changedToShapes.add(binding.toId)
  }

  // when the thing we're stuck to is deleted, delete the pin too
  override onBeforeDeleteToShape({ binding }: BindingOnShapeDeleteOptions<PinBinding>): void {
    this.editor.deleteShape(binding.fromId)
  }
}
