use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::credentials;
use crate::models::RouteSnapshot;
use crate::system_env::FullRouteState;

const BACKUP_FILE: &str = "route-backup.json";

pub fn save(app: &AppHandle, state: &FullRouteState) -> Result<(), String> {
    credentials::save_backup_token(state.auth_token.as_deref())?;
    let path = backup_path(app)?;
    let temporary = path.with_extension("json.tmp");
    let json = serde_json::to_vec_pretty(&state.snapshot)
        .map_err(|error| format!("Could not serialize the route backup: {error}"))?;
    fs::write(&temporary, json)
        .map_err(|error| format!("Could not write the route backup: {error}"))?;
    if path.exists() {
        fs::remove_file(&path)
            .map_err(|error| format!("Could not replace the previous route backup: {error}"))?;
    }
    fs::rename(temporary, path)
        .map_err(|error| format!("Could not finalize the route backup: {error}"))
}

pub fn load(app: &AppHandle) -> Result<(RouteSnapshot, Option<String>), String> {
    let path = backup_path(app)?;
    if !path.exists() {
        return Err("No previous Windows route is available to restore.".into());
    }
    let json =
        fs::read(&path).map_err(|error| format!("Could not read the route backup: {error}"))?;
    let snapshot = serde_json::from_slice(&json)
        .map_err(|error| format!("Could not parse the route backup: {error}"))?;
    let token = credentials::read_backup_token()?;
    Ok((snapshot, token))
}

pub fn exists(app: &AppHandle) -> bool {
    backup_path(app).is_ok_and(|path| path.exists())
}

pub fn clear(app: &AppHandle) -> Result<(), String> {
    let path = backup_path(app)?;
    if path.exists() {
        fs::remove_file(path)
            .map_err(|error| format!("Could not remove the route backup: {error}"))?;
    }
    credentials::delete_backup_token()
}

fn backup_path(app: &AppHandle) -> Result<PathBuf, String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not locate the app data directory: {error}"))?;
    fs::create_dir_all(&directory)
        .map_err(|error| format!("Could not create the app data directory: {error}"))?;
    Ok(directory.join(BACKUP_FILE))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backup_schema_contains_no_token_field() {
        let snapshot = RouteSnapshot {
            auth_token_set: true,
            ..RouteSnapshot::default()
        };
        let json = serde_json::to_string(&snapshot).unwrap();

        assert!(json.contains("authTokenSet"));
        assert!(!json.contains("authToken\""));
    }

    #[test]
    fn old_six_variable_backups_remain_readable() {
        let json = r#"{"baseUrl":"https://example.com","model":"old-model","authTokenSet":true}"#;
        let snapshot: RouteSnapshot = serde_json::from_str(json).unwrap();

        assert_eq!(snapshot.model.as_deref(), Some("old-model"));
        assert!(snapshot.subagent_model.is_none());
        assert!(snapshot.auth_token_set);
    }
}
