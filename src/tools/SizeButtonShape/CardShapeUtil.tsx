import { DefaultColorStyle, RecordProps, T } from 'tldraw'
import { useState } from 'react'
import { BaseBoxShapeUtil, getColorValue, getDefaultColorTheme, HTMLContainer } from 'tldraw'
import { SizeButtonShape as ICardShape } from '../../types/shapes.types'

// There's a guide at the bottom of this file!

export class CardShapeUtil extends BaseBoxShapeUtil<ICardShape> {
  static override type = 'size-button' as const
  // [1]
  static override props: RecordProps<ICardShape> = {
    w: T.number,
    h: T.number,
    color: DefaultColorStyle,
  }
  // [2]
  // static override migrations = cardShapeMigrations

  // [3]
  override isAspectRatioLocked() {
    return false
  }
  override canResize() {
    return true
  }

  // [4]
  getDefaultProps(): ICardShape['props'] {
    return {
      w: 300,
      h: 200,
      color: 'black',
    }
  }

  // [6]
  component(shape: ICardShape) {
    const { w, h } = shape.props
    const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() })

    //[a]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [count, setCount] = useState(0)

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          borderRadius: 8,
          border: '1px solid black',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          backgroundColor: getColorValue(theme, shape.props.color, 'semi'),
          color: getColorValue(theme, shape.props.color, 'solid'),
        }}
      >
        <h2>Clicks: {count}</h2>
        <span>
          {Math.round(w)} × {Math.round(h)}{' '}
        </span>
        <button
          // [b]
          onClick={() => setCount((count) => count + 1)}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            marginTop: '16px',
            padding: '9px 16px',
          }}
        >
          Click here
        </button>
      </HTMLContainer>
    )
  }

  // [7]
  indicator(shape: ICardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}
/* 
A utility class for the card shape. This is where you define the shape's behavior, 
how it renders (its component and indicator), and how it handles different events.

[1]
A validation schema for the shape's props (optional)
Check out card-shape-props.ts for more info.

[2]
Migrations for upgrading shapes (optional)
Check out card-shape-migrations.ts for more info.

[3]
Letting the editor know if the shape's aspect ratio is locked, and whether it 
can be resized or bound to other shapes. 

[4]
The default props the shape will be rendered with when click-creating one.

[5]
We use this to calculate the shape's geometry for hit-testing, bindings and
doing other geometric calculations. 

[6]
Render method — the React component that will be rendered for the shape. It takes the 
shape as an argument. HTMLContainer is just a div that's being used to wrap our text 
and button. We can get the shape's bounds using our own getGeometry method.
	
- [a] Check it out! We can do normal React stuff here like using setState.
   Annoying: eslint sometimes thinks this is a class component, but it's not.

- [b] You need to stop the pointer down event on buttons, otherwise the editor will
	   think you're trying to select drag the shape.

[7]
Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here

[8]
Resize handler — called when the shape is resized. Sometimes you'll want to do some 
custom logic here, but for our purposes, this is fine.
*/
