import { BaseBoxShapeTool } from 'tldraw'

export class CardShapeTool extends BaseBoxShapeTool {
  static override id = 'size-button'
  static override initial = 'idle'
  override shapeType = 'size-button'

  override onDoubleClick() {
    // Extend with custom behaviour if needed.
  }
}
