import { describe, it, expect } from 'vitest'
import { PinBindingUtil } from '../../tools/PinShape/PinBindingUtil'

describe('PinBindingUtil', () => {
  it('should have correct type', () => {
    expect(PinBindingUtil.type).toBe('pin')
  })

  it('should have default anchor props', () => {
    const util = new PinBindingUtil({} as any)
    const defaults = util.getDefaultProps()

    expect(defaults).toEqual({
      anchor: { x: 0.5, y: 0.5 },
    })
  })
})
