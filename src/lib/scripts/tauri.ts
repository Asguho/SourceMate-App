import { invoke } from "@tauri-apps/api/core";

/**
 * Splits the current window into two halves:
 * - Left half: Original application
 * - Right half: External URL
 *
 * @param url The external URL to display in the right half
 * @returns Promise that resolves when the window is split
 * @throws Error if the window is already split or if the URL is invalid
 */
export async function splitWindowWithUrl(url: string): Promise<void> {
  try {
    await invoke("split_window_with_url", { url });
  } catch (error) {
    throw new Error(`Failed to split window: ${error}`);
  }
}
