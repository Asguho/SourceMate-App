# Split Window Feature Documentation

## Overview

This feature allows you to split the application window into two halves:

- **Left half**: Original SourceMate application
- **Right half**: External URL (the source you're analyzing)

This makes it easier to view the source material side-by-side with the metadata form.

## Architecture

### Backend (Rust - Tauri)

**File**: `src-tauri/src/lib.rs`

The backend implements the `split_window_with_url` command that:

1. Validates that the window hasn't already been split (using app state)
2. Gets the current window dimensions
3. Creates two child webviews:
   - Left: The app's original content
   - Right: The external URL
4. Each webview auto-resizes when the main window is resized

**Key Components**:

- `AppState`: Tracks whether the window is split (prevents duplicate splits)
- `split_window_with_url`: Command that handles the window splitting logic

### Frontend (TypeScript/Svelte)

**File**: `src/lib/scripts/tauri.ts`

Provides a clean API for calling the Tauri command from the frontend:

```typescript
await splitWindowWithUrl(url);
```

**File**: `src/routes/source/+page.svelte`

Implements the UI for splitting the window:

- "View Source Side-by-Side" button in the top-right
- Error handling and user feedback
- State management to track if window is already split

## Usage

### From the Source Page

1. Navigate to a source page (e.g., `/source?url=https://example.com`)
2. Click the "View Source Side-by-Side" button in the top-right
3. The window will split, showing:
   - Left: SourceMate form
   - Right: The actual source URL

### Programmatically

You can call the split function from any Svelte component:

```typescript
import { splitWindowWithUrl } from "$lib/scripts/tauri";

// Example usage
async function viewSideBySide(url: string) {
  try {
    await splitWindowWithUrl(url);
    console.log("Window split successfully");
  } catch (error) {
    console.error("Failed to split window:", error);
  }
}
```

## Limitations

1. **Single Split**: The window can only be split once per session. To reset, you need to restart the application.
2. **URL Validation**: The URL must be valid and parseable. Invalid URLs will throw an error.
3. **Desktop Only**: This feature uses child webviews which are not available on mobile platforms.

## Technical Details

### Window Layout

```
┌─────────────────────────────────────────┐
│         Main Window (800x600)           │
├────────────────────┬────────────────────┤
│                    │                    │
│   App Content      │   External URL     │
│   (400x600)        │   (400x600)        │
│                    │                    │
│                    │                    │
└────────────────────┴────────────────────┘
```

### Auto-Resize Behavior

Both webviews are configured with `.auto_resize()`, which means:

- When the main window is resized, both child webviews maintain their 50/50 split
- The layout automatically adapts to different screen sizes

## Error Handling

The implementation handles several error cases:

1. **Window Already Split**: Returns error message to prevent duplicate splits
2. **Main Window Not Found**: Handles case where the main window doesn't exist
3. **Invalid URL**: Validates URL format before creating the webview
4. **Webview Creation Failure**: Catches and reports any issues creating the child webviews

## Future Enhancements

Possible improvements:

1. **Reset/Close Split**: Add ability to close the split and return to single view
2. **Adjustable Split**: Allow user to drag a divider to adjust split proportions
3. **Multiple Layouts**: Support different layouts (horizontal, vertical, quad split)
4. **Split Persistence**: Remember split state across app restarts
5. **URL Navigation**: Add controls to navigate URLs in the right pane

## Development Notes

### Testing

To test this feature in development:

1. Run `nr tauri dev`
2. Navigate to the source page with a URL
3. Click "View Source Side-by-Side"
4. Verify both halves are displaying correctly

### Debugging

If the split doesn't work:

1. Check browser console for frontend errors
2. Check terminal for Rust errors
3. Verify the URL is valid and accessible
4. Ensure the main window exists before splitting

### Dependencies

Required Tauri features:

- `tauri::webview::WebviewBuilder`
- `tauri::WebviewUrl`
- `tauri::LogicalPosition` and `LogicalSize`
- Window management APIs

No additional Cargo dependencies needed beyond base Tauri.
