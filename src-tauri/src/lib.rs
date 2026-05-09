mod hardware;
mod inference;
mod model_manager;
mod subscription;

use inference::InferenceState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(InferenceState::default())
        .invoke_handler(tauri::generate_handler![
            // Hardware detection
            hardware::detect_hardware,
            // Model management
            model_manager::list_local_models,
            model_manager::delete_local_model,
            model_manager::download_model,
            model_manager::get_models_dir,
            // Local inference
            inference::start_inference_server,
            inference::stop_inference_server,
            inference::inference_server_status,
            // Subscription
            subscription::check_pro_access,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
