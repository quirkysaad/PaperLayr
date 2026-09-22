import { open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import TurndownService from "turndown";
import { useStore } from "../store";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});

const safeName = (name: string) => name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") || "Untitled";

export const exportWorkspace = async () => {
  try {
    const selectedDir = await open({
      directory: true,
      multiple: false,
      title: "Select a folder to export workspace",
    });

    if (!selectedDir) return;
    const basePath = Array.isArray(selectedDir) ? selectedDir[0] : selectedDir;

    const { layers, notes } = useStore.getState();

    for (const layer of Object.values(layers)) {
      const layerPath = `${basePath}/${safeName(layer.name)}`;
      if (!(await exists(layerPath))) {
        await mkdir(layerPath);
      }

      const layerNotes = Object.values(notes).filter((n) => n.layerId === layer.id);

      const writeNote = async (note: any, currentPath: string) => {
        const children = layerNotes.filter((n) => n.parentId === note.id);
        const markdown = turndownService.turndown(note.content || "");
        const titleSafe = safeName(note.title);
        
        if (children.length > 0) {
          const noteDir = `${currentPath}/${titleSafe}`;
          if (!(await exists(noteDir))) {
            await mkdir(noteDir);
          }
          const filePath = `${noteDir}/_index.md`;
          await writeTextFile(filePath, markdown);
          
          for (const child of children) {
            await writeNote(child, noteDir);
          }
        } else {
          const filePath = `${currentPath}/${titleSafe}.md`;
          await writeTextFile(filePath, markdown);
        }
      };

      const rootNotes = layerNotes.filter((n) => !n.parentId);
      for (const note of rootNotes) {
        await writeNote(note, layerPath);
      }
    }
    
    // Export stickies
    const stickies = Object.values(notes).filter((n) => n.layerId === "stickies");
    if (stickies.length > 0) {
        const stickiesPath = `${basePath}/Stickies`;
        if (!(await exists(stickiesPath))) {
            await mkdir(stickiesPath);
        }
        for (const note of stickies) {
            const markdown = turndownService.turndown(note.content || "");
            const filePath = `${stickiesPath}/${safeName(note.title)}.md`;
            await writeTextFile(filePath, markdown);
        }
    }
    
    alert("Export successful!");
  } catch (error) {
    console.error("Failed to export workspace:", error);
    alert("Failed to export workspace.");
  }
};

import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { marked } from "marked";

export const importWorkspace = async () => {
  try {
    const selectedDir = await open({
      directory: true,
      multiple: false,
      title: "Select a folder to import workspace",
    });

    if (!selectedDir) return;
    const basePath = Array.isArray(selectedDir) ? selectedDir[0] : selectedDir;

    const { createLayer, createNote, updateNote } = useStore.getState();

    const processDir = async (dirPath: string, isRoot = true, layerId?: string, parentId?: string) => {
      const entries = await readDir(dirPath);
      
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // skip hidden files

        const fullPath = `${dirPath}/${entry.name}`;
        
        if (entry.isDirectory) {
          if (isRoot) {
            // Root directories become Layers
            if (entry.name.toLowerCase() === "stickies" || entry.name.toLowerCase() === "captures") {
                // Special layers, skip creating actual layer, just import notes
                await processDir(fullPath, false, entry.name.toLowerCase(), undefined);
                continue;
            }
            
            createLayer(entry.name, "#71717a");
            
            const newLayers = useStore.getState().layers;
            const createdLayer = Object.values(newLayers).find(l => l.name === entry.name);
            if (createdLayer) {
                await processDir(fullPath, false, createdLayer.id, undefined);
            }
          } else {
            // Nested directories become Notes
            let noteContent = "";
            const indexPath = `${fullPath}/_index.md`;
            if (await exists(indexPath)) {
                const md = await readTextFile(indexPath);
                noteContent = await marked.parse(md);
            }
            
            const noteId = createNote(layerId!, parentId, entry.name, true);
            updateNote(noteId, { content: noteContent });
            
            await processDir(fullPath, false, layerId, noteId);
          }
        } else if (entry.isFile && entry.name.endsWith(".md") && entry.name !== "_index.md") {
          // Files become Notes
          const md = await readTextFile(fullPath);
          const html = await marked.parse(md);
          const title = entry.name.replace(".md", "");
          
          const noteId = createNote(layerId!, parentId, title, true);
          updateNote(noteId, { content: html });
        }
      }
    };

    await processDir(basePath, true);
    
    alert("Import successful!");
  } catch (error) {
    console.error("Failed to import workspace:", error);
    alert("Failed to import workspace.");
  }
};
