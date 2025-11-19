// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl};
use tauri_plugin_updater::UpdaterExt;
use std::sync::Mutex;

// Track if the window has been split
struct AppState {
    is_split: Mutex<bool>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command(async)]
async fn split_window_with_url(
    app: AppHandle,
    url: String,
) -> Result<(), String> {
    // Get the state
    let state = app.state::<AppState>();
    let mut is_split = state.is_split.lock().unwrap();

    if *is_split {
        return Err("Window is already split".to_string());
    }

    // Get the main window (using get_window for unstable features)
    let window = app
        .get_window("main")
        .ok_or("Main window not found")?;

    // Get the current window size
    let size = window
        .outer_size()
        .map_err(|e| format!("Failed to get window size: {}", e))?;

    let width = size.width;
    let height = size.height;

    // Parse the URL
    let external_url = url.parse()
        .map_err(|_| format!("Invalid URL: {}", url))?;

    // In Tauri v2, we need to create child webviews using the webview builder on the window
    // Create left webview (original app content)
    let _webview_left = window.add_child(
        tauri::webview::WebviewBuilder::new("app_view", WebviewUrl::App(Default::default()))
            .auto_resize(),
        PhysicalPosition::new(0, 0),
        PhysicalSize::new(width / 2, height),
    )
    .map_err(|e| format!("Failed to create left webview: {}", e))?;

    // Create right webview (external URL)
    let _webview_right = window.add_child(
        tauri::webview::WebviewBuilder::new("external_view", WebviewUrl::External(external_url))
            .auto_resize(),
        PhysicalPosition::new(width / 2, 0),
        PhysicalSize::new(width / 2, height),
    )
    .map_err(|e| format!("Failed to create right webview: {}", e))?;

    // Mark as split
    *is_split = true;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Initialize app state
            app.manage(AppState {
                is_split: Mutex::new(false),
            });

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                (update(handle).await).expect("updating failed");
            });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, split_window_with_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> Result<(), tauri_plugin_updater::Error> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}
