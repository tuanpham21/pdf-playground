# Custom Shapes Specification

## ADDED Requirements

### Requirement: Size Button Interactive Shape
The system SHALL provide a Size Button shape that displays its dimensions and tracks user clicks.

#### Scenario: Create size button shape
- **WHEN** user selects Size Button tool (press `1`) and clicks on canvas
- **THEN** a Size Button shape is created at the click location
- **AND** the shape has default dimensions (200×150)
- **AND** the shape displays a button labeled "Size: 200×150"
- **AND** the shape displays "Clicks: 0" counter

#### Scenario: Real-time size updates
- **WHEN** user resizes the Size Button shape
- **THEN** the button label updates immediately to show new dimensions
- **AND** the format is "Size: {width}×{height}" with rounded values
- **AND** the shape remains interactive during resizing

#### Scenario: Click counter increments
- **WHEN** user clicks the button inside the Size Button shape
- **THEN** the click counter increments by 1
- **AND** the counter display updates to show new count
- **AND** the count persists with the shape
- **AND** the shape does not move when button is clicked

#### Scenario: Size button persistence
- **WHEN** a Size Button shape exists on canvas
- **THEN** the click count is preserved when shape is moved
- **AND** the click count is preserved when shape is resized
- **AND** the click count is preserved when shape is selected/deselected

---

### Requirement: Pin Attachment Tool
The system SHALL provide a Pin shape that detects and attaches overlapping shapes.

#### Scenario: Create pin shape
- **WHEN** user selects Pin tool (press `2`) and clicks on canvas
- **THEN** a pin-shaped indicator is created
- **AND** the pin displays in red color (unattached state)
- **AND** the pin has dimensions of 40×40 pixels

#### Scenario: Detect overlapping shapes
- **WHEN** a pin is placed on top of 2 or more overlapping shapes
- **THEN** the pin automatically detects the overlapping shapes
- **AND** the pin attaches to the first 2 shapes detected
- **AND** the pin color changes to green (attached state)
- **AND** the attachment persists until pin is moved away

#### Scenario: No attachment available
- **WHEN** a pin is not on top of 2 overlapping shapes
- **THEN** the pin remains red (unattached state)
- **AND** no shape attachment occurs
- **AND** shapes can be moved independently

#### Scenario: Synchronized movement - shape A moves
- **WHEN** a pin attaches 2 shapes (A and B)
- **AND** user moves shape A
- **THEN** shape B moves by the same distance and direction
- **AND** the relative position between A and B is maintained
- **AND** the pin updates its attachment if shapes no longer overlap

#### Scenario: Synchronized movement - shape B moves
- **WHEN** a pin attaches 2 shapes (A and B)
- **AND** user moves shape B
- **THEN** shape A moves by the same distance and direction
- **AND** the relative position between A and B is maintained
- **AND** the pin updates its attachment if shapes no longer overlap

#### Scenario: Pin detachment
- **WHEN** a pin is moved away from attached shapes
- **THEN** the attachment is released
- **AND** the pin color changes to red
- **AND** shapes can be moved independently again

#### Scenario: Multiple pins
- **WHEN** multiple pins exist on canvas
- **THEN** each pin operates independently
- **AND** a shape can be attached to multiple pin groups
- **AND** movements are synchronized per pin attachment

---

### Requirement: Screenshot Tool for Canvas Export
The system SHALL provide a Screenshot tool for cropping and exporting canvas regions.

#### Scenario: Activate screenshot tool
- **WHEN** user presses `3` or selects Screenshot tool from toolbar
- **THEN** the tool is activated
- **AND** cursor changes to crosshair
- **AND** user can draw selection rectangle

#### Scenario: Draw selection rectangle
- **WHEN** user clicks and drags on canvas with Screenshot tool active
- **THEN** a selection rectangle is drawn in real-time
- **AND** the rectangle follows mouse position
- **AND** rectangle is visible as an overlay on canvas

#### Scenario: Export with aspect ratio constraint
- **WHEN** user holds Shift key while dragging
- **THEN** selection rectangle maintains 16:9 aspect ratio
- **AND** rectangle adjusts to fit ratio
- **AND** aspect ratio is locked until Shift is released

#### Scenario: Export from center
- **WHEN** user holds Alt key while dragging
- **THEN** selection rectangle expands from initial click point (center)
- **AND** rectangle grows symmetrically in all directions

#### Scenario: Export as PNG download
- **WHEN** user releases mouse after drawing selection rectangle
- **THEN** all shapes within the rectangle are exported
- **AND** PDF background within bounds is included
- **AND** a PNG file downloads automatically
- **AND** filename includes "Screenshot" and timestamp
- **AND** tool returns to Select mode

#### Scenario: Copy to clipboard
- **WHEN** user holds Ctrl key while releasing mouse
- **THEN** selection is copied to clipboard as PNG
- **AND** no file download occurs
- **AND** user can paste in other applications
- **AND** tool returns to Select mode

#### Scenario: Cancel screenshot
- **WHEN** user presses Escape key during screenshot
- **THEN** selection is cancelled
- **AND** no export occurs
- **AND** tool returns to Select mode

---

### Requirement: Shape Selection and Transformation
The system SHALL support standard tldraw operations on all custom shapes.

#### Scenario: Select custom shape
- **WHEN** user clicks on a custom shape (size-button or pin)
- **THEN** the shape is selected
- **AND** selection handles appear
- **AND** the shape can be moved by dragging

#### Scenario: Resize custom shape
- **WHEN** user drags selection handles on a custom shape
- **THEN** the shape resizes accordingly
- **AND** shape content scales appropriately
- **AND** interactive elements remain functional

#### Scenario: Delete custom shape
- **WHEN** user selects a custom shape and presses Delete/Backspace
- **THEN** the shape is removed from canvas
- **AND** any attachments (for pin) are released
- **AND** other shapes are not affected

#### Scenario: Copy and paste custom shape
- **WHEN** user copies and pastes a custom shape
- **THEN** a new instance is created
- **AND** shape properties are duplicated (e.g., click count)
- **AND** attachments are not duplicated (pins start unattached)
