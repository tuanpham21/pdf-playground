import {
  DefaultKeyboardShortcutsDialog,
  DefaultKeyboardShortcutsDialogContent,
  DefaultToolbar,
  DefaultToolbarContent,
  TLComponents,
  TLUiOverrides,
  TldrawUiMenuItem,
  useIsToolSelected,
  useTools,
} from 'tldraw'
import { ScreenshotBox } from '../tools/ScreenshotTool/ScreenshotBox'

// There's a guide at the bottom of this file!

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools['size-button'] = {
      label: 'Size Button',
      id: 'size-button',
      icon: 'group',
      kbd: '1',
      onSelect: () => {
        editor.setCurrentTool('size-button')
      },
    }
    tools['pin'] = {
      id: 'pin',
      label: 'Pin',
      icon: 'link',
      kbd: '2',
      onSelect: () => {
        editor.setCurrentTool('pin')
      },
    }
    tools['screenshot'] = {
      id: 'screenshot',
      label: 'Screen Shot',
      icon: 'photo',
      kbd: '3',
      onSelect: () => {
        editor.setCurrentTool('screenshot')
      },
    }

    return tools
  },
}

export const components: TLComponents = {
  PageMenu: null,
  Toolbar: (props) => {
    const tools = useTools()
    const sizeButtonTool = tools['size-button']
    const pinTool = tools['pin']
    const screenshotTool = tools['screenshot']

    const isSizeButtonSelected = useIsToolSelected(sizeButtonTool)
    const isPinSelected = useIsToolSelected(pinTool)
    const isScreenshotSelected = useIsToolSelected(screenshotTool)

    return (
      <DefaultToolbar {...props}>
        <TldrawUiMenuItem {...sizeButtonTool} isSelected={isSizeButtonSelected} />
        <TldrawUiMenuItem {...pinTool} isSelected={isPinSelected} />
        <TldrawUiMenuItem {...screenshotTool} isSelected={isScreenshotSelected} />
        <DefaultToolbarContent />
      </DefaultToolbar>
    )
  },
  KeyboardShortcutsDialog: (props) => {
    const tools = useTools()
    return (
      <DefaultKeyboardShortcutsDialog {...props}>
        <TldrawUiMenuItem {...tools['size-button']} />
        <TldrawUiMenuItem {...tools['pin']} />
        <TldrawUiMenuItem {...tools['screenshot']} />
        <DefaultKeyboardShortcutsDialogContent />
      </DefaultKeyboardShortcutsDialog>
    )
  },
  // Override InFrontOfTheCanvas to draw the active screenshot box above the canvas.
  InFrontOfTheCanvas: ScreenshotBox,
}

/* 

This file contains overrides for the Tldraw UI. These overrides are used to add your custom tools to
the toolbar and the keyboard shortcuts menu.

First we have to add our new tool to the tools object in the tools override. This is where we define
all the basic information about our new tool - its icon, label, keyboard shortcut, what happens when
we select it, etc.

Then, we replace the UI components for the toolbar and keyboard shortcut dialog with our own, that
add our new tool to the existing default content. Ideally, we'd interleave our new tool into the
ideal place among the default tools, but for now we're just adding it at the start to keep things
simple.
*/
