# Canvas Integration Specification

## ADDED Requirements

### Requirement: tldraw Canvas Foundation
The system SHALL provide a tldraw-powered canvas as the core interface for all user interactions.

#### Scenario: Canvas initialization
- **WHEN** the application loads
- **THEN** a tldraw canvas is rendered and ready for interaction
- **AND** standard tldraw tools are available in the toolbar
- **AND** the canvas supports standard interactions (select, draw, pan, zoom)

#### Scenario: Custom tools registration
- **WHEN** the application initializes
- **THEN** custom shape utilities (size-button, pin, camera) are registered with tldraw
- **AND** keyboard shortcuts (1, 2, 3) are configured for custom tools
- **AND** custom tools appear in or can be accessed from the toolbar

### Requirement: Multi-layer Architecture
The system SHALL maintain distinct layers for PDF background and interactive content.

#### Scenario: Background layer for PDF
- **WHEN** a PDF is loaded
- **THEN** the PDF image is rendered in the background layer
- **AND** the background layer is non-interactive
- **AND** users can draw and add shapes on top of the PDF

#### Scenario: Interactive drawing layer
- **WHEN** users interact with the canvas
- **THEN** all shape creation and manipulation occurs on the interactive layer
- **AND** shapes can be selected, moved, and resized
- **AND** PDF background does not interfere with shape interactions

### Requirement: Keyboard Shortcuts
The system SHALL provide keyboard shortcuts for efficient tool access.

#### Scenario: Tool selection via keyboard
- **WHEN** user presses `1` key
- **THEN** Size Button tool is activated
- **WHEN** user presses `2` key
- **THEN** Pin tool is activated
- **WHEN** user presses `3` key
- **THEN** Camera tool is activated
