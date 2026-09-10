export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function hasMultipleBrOrNbsp(html: string, text: string): boolean {
  const rawText = text || (html ? html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ") : "");
  
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^[ \t\u00A0]+$/gm, "");

  // Check for 3 or more consecutive newlines (meaning 2 or more empty lines)
  const hasMultipleNewlines = /\n{3,}/.test(normalizedText);

  // Check for 2 or more consecutive layers
  const hasMultipleSpaces = /[ \t\u00A0]{2,}/.test(normalizedText);

  if (hasMultipleNewlines || hasMultipleSpaces) {
    return true;
  }

  if (html) {
    // Check for 3 or more consecutive <br> tags in HTML
    const hasMultipleBr =
      /(<br\s*\/?>[\s\n\r]*){3,}/i.test(html) ||
      /(<(p|div)[^>]*>\s*(<br\s*\/?>|&nbsp;|\s)*\s*<\/(p|div)>\s*){2,}/i.test(html);

    // Check for 2 or more consecutive &nbsp;
    const hasMultipleNbsp =
      /(&nbsp;|\u00A0){2,}/i.test(html) || /&nbsp;[\s\n\r]*&nbsp;/i.test(html);

    if (hasMultipleBr || hasMultipleNbsp) {
      return true;
    }
  }

  return false;
}

export function formatOriginalContent(html: string, text: string): string {
  // Return the original content to let TipTap's native parser handle it
  return html || text || "";
}

export function stripExtraBrAndNbsp(
  html: string,
  text: string
): { content: string; isHtml: boolean } {
  // Prefer HTML to preserve rich text formatting
  if (html) {
    let cleaned = html;
    
    // Collapse multiple empty paragraph/div blocks into a single empty paragraph
    const emptyBlockSequenceRegex = /(<(p|div)[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*\s*<\/(?:p|div)>\s*){2,}/gi;
    cleaned = cleaned.replace(emptyBlockSequenceRegex, "<p><br /></p>");
    
    // Collapse 3 or more consecutive <br> tags into exactly 2 <br> tags (1 blank line)
    cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />");
    
    // Collapse multiple layers
    cleaned = cleaned.replace(/(&nbsp;|\u00A0){2,}/gi, " ");
    
    return { content: cleaned, isHtml: true };
  }

  if (text) {
    let normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    normalizedText = normalizedText.replace(/^[ \t\u00A0]+$/gm, "");

    // Collapse 3 or more consecutive newlines into exactly 2 newlines.
    normalizedText = normalizedText.replace(/\n{3,}/g, "\n\n");

    // Collapse multiple internal layers
    normalizedText = normalizedText.replace(/[ \t\u00A0]{2,}/g, " ");

    normalizedText = normalizedText.trim();

    return { content: normalizedText, isHtml: false };
  }

  return { content: "", isHtml: false };
}

export function transformPastedText(text: string): string {
  if (!text) return text;
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function transformPastedHTML(html: string): string {
  if (!html) return html;
  return html.replace(/\s*style="[^"]*"/gi, "");
}
