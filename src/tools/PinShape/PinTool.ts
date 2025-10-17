import { StateNode, TLPointerEventInfo, createShapeId } from 'tldraw'

export class PinTool extends StateNode {
  static override id = 'pin'

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onPointerDown(info: TLPointerEventInfo) {
    const { currentPagePoint } = this.editor.inputs
    const pinId = createShapeId()

    this.editor.markHistoryStoppingPoint()
    this.editor.createShape({
      id: pinId,
      type: 'pin',
      x: currentPagePoint.x,
      y: currentPagePoint.y,
    })

    this.editor.setSelectedShapes([pinId])
    this.editor.setCurrentTool('select.translating', {
      ...info,
      target: 'shape',
      shape: this.editor.getShape(pinId),
      isCreating: true,
      onInteractionEnd: 'pin',
      onCreate: () => {
        this.editor.setCurrentTool('pin')
      },
    })
  }
}
