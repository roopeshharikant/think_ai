import { useState } from "react";

const TOOLBAR_ACTIONS = [
  { label: "B", title: "Bold", before: "**", after: "**" },
  { label: "I", title: "Italic", before: "_", after: "_" },
  { label: "•", title: "Bullet list", before: "- ", after: "" },
  { label: "🔗", title: "Link", before: "[", after: "](https://)" },
];

/**
 * Lightweight rich text editor with formatting toolbar and preview
 * (Phase 8). Stores plain text/markdown — no external editor dependency.
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRefSafe(null);

  const wrapSelection = (before, after) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const next =
      value.slice(0, start) + before + (selected || "") + after + value.slice(end);
    if (onChange) onChange(next);
  };

  return (
    <div className="rich-editor" data-testid="rich-text-editor">
      <div className="rich-editor__toolbar" role="toolbar" aria-label="Formatting">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            title={action.title}
            aria-label={action.title}
            className="btn btn--small btn--ghost"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => wrapSelection(action.before, action.after)}
          >
            {action.label}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className="btn btn--small"
          onClick={() => setShowPreview((previous) => !previous)}
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div
          className="rich-editor__preview comment__body"
          data-testid="rich-preview"
          dangerouslySetInnerHTML={{
            __html: value.trim() ? renderSimpleMarkdown(value) : "<em>Nothing to preview yet.</em>",
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          className="rich-editor__textarea"
          rows={5}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange && onChange(event.target.value)}
        />
      )}
    </div>
  );
}

/**
 * Minimal markdown-ish rendering for the preview pane. Input is HTML-escaped
 * first so only the tags generated below (strong/em/li/br) can appear.
 */
function renderSimpleMarkdown(text) {
  const htmlEscaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withBold = htmlEscaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItalics = withBold.replace(/_([^_]+)_/g, "<em>$1</em>");

  return withItalics
    .split("\n")
    .map((line) =>
      line.startsWith("- ")
        ? `<ul><li>${line.slice(2)}</li></ul>`
        : `${line}<br />`
    )
    .join("");
}

// Tiny ref helper that survives fast-refresh without extra imports at top.
function useRefSafe(initial) {
  const [ref] = useState(() => ({ current: initial }));
  return ref;
}
