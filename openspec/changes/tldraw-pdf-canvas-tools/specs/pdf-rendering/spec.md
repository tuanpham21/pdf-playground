# PDF Rendering Specification

## ADDED Requirements

### Requirement: PDF Loading from Multiple Sources
The system SHALL support loading PDF documents from both file uploads and URLs.

#### Scenario: Upload local PDF file
- **WHEN** user clicks "Open PDF" button and selects a PDF file
- **THEN** the PDF is loaded and converted to images
- **AND** all pages are displayed as locked image shapes on canvas
- **AND** the page count is shown in the UI

#### Scenario: Load PDF from URL
- **WHEN** user clicks "Load from URL" and provides a valid PDF URL
- **THEN** the PDF is fetched and loaded
- **AND** all pages are displayed as locked image shapes on canvas
- **AND** the page count is shown in the UI

#### Scenario: Invalid PDF handling
- **WHEN** user attempts to load an invalid PDF
- **THEN** an error message is displayed
- **AND** the canvas remains in its previous state
- **AND** user can try loading a different PDF

### Requirement: PDF Page Rendering as Locked Shapes
The system SHALL render PDF pages as high-quality locked image shapes on the tldraw canvas.

#### Scenario: PDF rendered as locked shapes
- **WHEN** a PDF is loaded
- **THEN** each page is converted to a PNG image at 2x scale
- **AND** images are added as tldraw image assets
- **AND** image shapes are created for each page
- **AND** shapes are locked and non-interactive
- **AND** shapes are positioned in a vertical stack with spacing

#### Scenario: Page quality
- **WHEN** a PDF page is rendered
- **THEN** text is readable and clear
- **AND** images are sharp without pixelation
- **AND** rendering completes within reasonable time (<5 seconds for standard pages)

### Requirement: Multi-page PDF Layout
The system SHALL display multi-page PDFs as a vertical stack of page shapes.

#### Scenario: Multi-page vertical layout
- **WHEN** a multi-page PDF is loaded
- **THEN** all pages are displayed on canvas in a vertical stack
- **AND** pages are separated by consistent spacing (32px)
- **AND** pages are centered horizontally
- **AND** user can scroll to view all pages

#### Scenario: Page visibility
- **WHEN** user scrolls the canvas
- **THEN** PDF pages scroll with the canvas
- **AND** camera bounds constrain view to PDF area
- **AND** user cannot scroll beyond PDF bounds

### Requirement: Loading States
The system SHALL provide clear feedback during PDF loading operations.

#### Scenario: Loading indicator
- **WHEN** a PDF is being loaded
- **THEN** a "Loading PDF..." message is displayed
- **AND** UI controls are accessible but show loading state
- **AND** user can cancel the operation if needed

#### Scenario: Load completion
- **WHEN** PDF loading completes successfully
- **THEN** loading indicator is removed
- **AND** "PDF loaded (X pages)" message is displayed
- **AND** canvas shows the first page
