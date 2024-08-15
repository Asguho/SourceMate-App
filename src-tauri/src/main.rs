// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_updater::UpdaterExt;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        update(handle).await;
      });
      Ok(())
    })
}
async fn update(app: tauri::AppHandle) -> tauri::Result<()> {
  if let Some(update) = app.updater()?.check().await? {
    let mut downloaded = 0;

    // alternatively we could also call update.download() and update.install() separately
    update.download_and_install(|chunk_length, content_length| {
      downloaded += chunk_length;
      println!("downloaded {downloaded} from {content_length:?}");
    }, || {
      println!("download finished");
    }).await?;

    println!("update installed");
    app.restart();
  }

  Ok(())
}