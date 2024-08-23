// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// use tauri_plugin_updater::UpdaterExt;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        // .setup(|app| {
        //     let handle = app.handle().clone();
        //     tauri::async_runtime::spawn(async move {
        //         update(handle).await;
        //     });
        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// async fn update(app: tauri::AppHandle) -> tauri::Result<()> {
//     if let Some(update) = app
//         .updater()
//         .map_err(|e| tauri::Error::from(e))?
//         .check()
//         .await?
//     {
//         let mut downloaded = 0;

//         // alternatively we could also call update.download() and update.install() separately
//         update
//             .download_and_install(
//                 |chunk_length, content_length| {
//                     downloaded += chunk_length;
//                     println!("downloaded {downloaded} from {content_length:?}");
//                 },
//                 || {
//                     println!("download finished");
//                 },
//             )
//             .await?;

//         println!("update installed");
//         app.restart();
//     }

//     Ok(())
// }
