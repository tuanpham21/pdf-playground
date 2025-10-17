import { TLBaseShape, TLDefaultColorStyle } from 'tldraw'

// Task 3: Size Button Shape
export type SizeButtonShape = TLBaseShape<
  'size-button',
  {
    w: number
    h: number
    color: TLDefaultColorStyle
  }
>

// Task 4: Pin Shape
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PinShape = TLBaseShape<'pin', {}>
