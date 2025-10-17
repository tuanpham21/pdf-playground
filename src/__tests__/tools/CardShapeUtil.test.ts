import { describe, it, expect } from 'vitest'
import { CardShapeUtil } from '../../tools/SizeButtonShape/CardShapeUtil'

describe('CardShapeUtil', () => {
  it('should have correct type', () => {
    expect(CardShapeUtil.type).toBe('size-button')
  })

  it('should have correct default props', () => {
    const util = new CardShapeUtil({} as any)
    const defaults = util.getDefaultProps()

    expect(defaults).toEqual({
      w: 300,
      h: 200,
      color: 'black',
    })
  })

  it('should allow resizing', () => {
    const util = new CardShapeUtil({} as any)
    expect(util.canResize()).toBe(true)
  })

  it('should not lock aspect ratio', () => {
    const util = new CardShapeUtil({} as any)
    expect(util.isAspectRatioLocked()).toBe(false)
  })
})
