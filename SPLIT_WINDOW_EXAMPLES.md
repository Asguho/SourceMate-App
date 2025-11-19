# Split Window Usage Examples

## Basic Usage in Source Page

The split window feature is already integrated into the source page at `/src/routes/source/+page.svelte`.

When viewing a source, click the "View Side-by-Side" button in the top-right corner to split the window.

## Using the SplitWindowButton Component

The `SplitWindowButton` component can be used anywhere in your app:

```svelte
<script>
  import SplitWindowButton from '$lib/components/SplitWindowButton.svelte';
</script>

<SplitWindowButton url="https://example.com" />
```

### With Custom Button Text

```svelte
<SplitWindowButton
  url="https://example.com"
  buttonText="Open Split View"
/>
```

### With Custom Styling

```svelte
<SplitWindowButton
  url="https://example.com"
  class="btn btn-primary btn-lg"
/>
```

## Direct API Usage

For more control, use the `splitWindowWithUrl` function directly:

```svelte
<script lang="ts">
  import { splitWindowWithUrl } from '$lib/scripts/tauri';

  async function openSplitView() {
    try {
      await splitWindowWithUrl('https://example.com');
      console.log('Window split successfully!');
    } catch (error) {
      console.error('Failed to split window:', error);
      // Handle error (e.g., show toast notification)
    }
  }
</script>

<button onclick={openSplitView}>
  Split Window
</button>
```

## Example: Split on Form Submit

```svelte
<script lang="ts">
  import { splitWindowWithUrl } from '$lib/scripts/tauri';

  let url = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!url) return;

    try {
      await splitWindowWithUrl(url);
      // Navigate to source page or show success message
    } catch (error) {
      alert('Failed to open split view: ' + error);
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <input bind:value={url} placeholder="Enter URL..." />
  <button type="submit">Split View</button>
</form>
```

## Example: Conditional Split Button

Only show the split button when on desktop:

```svelte
<script lang="ts">
  import { splitWindowWithUrl } from '$lib/scripts/tauri';
  import { platform } from '@tauri-apps/plugin-os';

  let isDesktop = $state(false);

  $effect(() => {
    platform().then(p => {
      isDesktop = p === 'windows' || p === 'macos' || p === 'linux';
    });
  });
</script>

{#if isDesktop}
  <SplitWindowButton url="https://example.com" />
{/if}
```

## Example: Integration with Navigation

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { splitWindowWithUrl } from '$lib/scripts/tauri';

  async function viewSourceSplit(sourceUrl: string) {
    // Navigate to the source page first
    await goto(`/source?url=${encodeURIComponent(sourceUrl)}`);

    // Then split the window after a short delay
    setTimeout(async () => {
      try {
        await splitWindowWithUrl(sourceUrl);
      } catch (error) {
        console.error('Could not split window:', error);
      }
    }, 500);
  }
</script>

<button onclick={() => viewSourceSplit('https://example.com')}>
  View & Split
</button>
```

## Error Handling Best Practices

```svelte
<script lang="ts">
  import { splitWindowWithUrl } from '$lib/scripts/tauri';

  async function safeSplitWindow(url: string) {
    // Validate URL first
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    // Attempt to split
    try {
      await splitWindowWithUrl(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('already split')) {
        // Window is already split, maybe show a toast instead
        console.info('Window is already in split view');
      } else if (message.includes('Invalid URL')) {
        alert('The URL format is not supported');
      } else {
        console.error('Unexpected error:', error);
        alert('Failed to split window. Please try again.');
      }
    }
  }
</script>
```

## Notes

- The window can only be split once per application session
- To reset, the user needs to restart the application
- The split is always 50/50 (left: app, right: URL)
- Both sides auto-resize when the main window is resized
- This feature only works on desktop platforms (not mobile)
