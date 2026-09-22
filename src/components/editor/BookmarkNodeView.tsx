import { useEffect, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Globe } from "lucide-react";

export const BookmarkNodeView = ({ node, updateAttributes, editor }: any) => {
  const { url, title, description, image } = node.attrs;
  const [loading, setLoading] = useState(!title && !description && !image);

  useEffect(() => {
    if (url && !title && !description && !image && loading) {
      // Fetch metadata
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke("fetch_link_metadata", { url })
          .then((metadata: any) => {
            updateAttributes({
              title: metadata.title || url,
              description: metadata.description || null,
              image: metadata.image || null,
            });
            setLoading(false);
          })
          .catch((e) => {
            console.error("Failed to fetch link metadata", e);
            updateAttributes({
              title: url,
            });
            setLoading(false);
          });
      }).catch(e => {
        console.error("Failed to import tauri api", e);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [url, title, description, image, loading, updateAttributes]);

  return (
    <NodeViewWrapper className="bookmark-node-view my-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        contentEditable={false}
        className={`flex overflow-hidden rounded-xl border transition-all cursor-pointer group no-underline text-zinc-900 bg-white ${editor.isEditable ? "hover:border-zinc-300 hover:shadow-sm" : ""} border-zinc-200`}
        style={{ minHeight: "100px" }}
        onClick={() => {
            if (editor.isEditable) {
                // Let user interact, but optionally we could prevent navigation in editor mode
            }
        }}
      >
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <div className="font-semibold text-[15px] leading-tight mb-1.5 truncate">
            {loading ? "Loading preview..." : (title || url)}
          </div>
          {description && !loading && (
            <div className="text-[13px] text-zinc-500 line-clamp-2 leading-relaxed mb-3">
              {description}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 mt-auto">
            {loading ? (
                <div className="w-3 h-3 rounded-full border-2 border-zinc-200 border-t-zinc-400 animate-spin"></div>
            ) : (
                <Globe size={13} className="text-zinc-400" />
            )}
            <span className="truncate max-w-[250px]">{url}</span>
          </div>
        </div>
        {image && !loading && (
          <div className="w-32 sm:w-48 shrink-0 border-l border-zinc-100 hidden sm:block bg-zinc-50 relative overflow-hidden">
            <img
              src={image}
              alt={title || "Bookmark"}
              className="absolute inset-0 w-full h-full object-cover m-0"
            />
          </div>
        )}
      </a>
    </NodeViewWrapper>
  );
};
