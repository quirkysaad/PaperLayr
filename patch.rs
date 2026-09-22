--- src-tauri/src/lib.rs
+++ src-tauri/src/lib.rs
@@ -1,6 +1,48 @@
 // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
 #[tauri::command]
 fn greet(name: &str) -> String {
     format!("Hello, {}! You've been greeted from Rust!", name)
 }
 
+use serde::Serialize;
+use scraper::{Html, Selector};
+
+#[derive(Serialize)]
+pub struct LinkMetadata {
+    title: Option<String>,
+    description: Option<String>,
+    image: Option<String>,
+    url: String,
+}
+
+#[tauri::command]
+async fn fetch_link_metadata(url: String) -> Result<LinkMetadata, String> {
+    let client = reqwest::Client::builder()
+        .user_agent("Mozilla/5.0 (compatible; PaperLayrBot/1.0;)")
+        .build()
+        .map_err(|e| e.to_string())?;
+        
+    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
+    let html = res.text().await.map_err(|e| e.to_string())?;
+    
+    let document = Html::parse_document(&html);
+    
+    let title_selector = Selector::parse("title").unwrap();
+    let og_title_selector = Selector::parse("meta[property='og:title']").unwrap();
+    let og_desc_selector = Selector::parse("meta[property='og:description']").unwrap();
+    let desc_selector = Selector::parse("meta[name='description']").unwrap();
+    let og_image_selector = Selector::parse("meta[property='og:image']").unwrap();
+    let twitter_image_selector = Selector::parse("meta[name='twitter:image']").unwrap();
+
+    let title = document.select(&og_title_selector).next()
+        .and_then(|el| el.value().attr("content"))
+        .map(String::from)
+        .or_else(|| {
+            document.select(&title_selector).next()
+                .map(|el| el.text().collect::<Vec<_>>().join(""))
+        });
+
+    let description = document.select(&og_desc_selector).next()
+        .and_then(|el| el.value().attr("content"))
+        .map(String::from)
+        .or_else(|| {
+            document.select(&desc_selector).next()
+                .and_then(|el| el.value().attr("content"))
+                .map(String::from)
+        });
+
+    let image = document.select(&og_image_selector).next()
+        .and_then(|el| el.value().attr("content"))
+        .map(String::from)
+        .or_else(|| {
+            document.select(&twitter_image_selector).next()
+                .and_then(|el| el.value().attr("content"))
+                .map(String::from)
+        });
+
+    Ok(LinkMetadata {
+        title,
+        description,
+        image,
+        url,
+    })
+}
+
 #[cfg_attr(mobile, tauri::mobile_entry_point)]
 pub fn run() {
@@ -64,7 +106,7 @@
         })
         .plugin(tauri_plugin_opener::init())
         .plugin(tauri_plugin_process::init())
-        .invoke_handler(tauri::generate_handler![greet])
+        .invoke_handler(tauri::generate_handler![greet, fetch_link_metadata])
         .build(tauri::generate_context!())
         .expect("error while running tauri application")
         .run(|app_handle, event| match event {
