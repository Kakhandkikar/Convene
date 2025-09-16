import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion } from "framer-motion";

export default function RetrospectiveEditor({ onSubmitted, meetingId, userEmail }) {
  const [attachments, setAttachments] = useState([]);
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Write your meeting retrospective...</p>",
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const handleSubmit = async () => {
    const content = editor?.getHTML();
    try {
      if (meetingId && userEmail) {
        const base = import.meta.env.VITE_API_URL;
        const resp = await fetch(`${base}/api/retrospectives/${meetingId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, content })
        });
        if (!resp.ok) {
          const t = await resp.text();
          alert(t || "Failed to submit");
          return;
        }
      }
      if (onSubmitted) onSubmitted(content);
      else alert("Submitted content:\n\n" + content);
    } catch (e) {
      alert("Network error");
    }
  };

  const ToolbarButton = ({ onClick, label, children }) => (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
      aria-label={label}
      title={label}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-night-800/60 backdrop-blur p-5 shadow-soft dark:shadow-softDark">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">📝 Meeting Retrospective</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">Share concise, honest feedback. Use formatting to structure thoughts.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <ToolbarButton label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 5h6a3 3 0 010 6H7V5zm0 6h7a3 3 0 010 6H7v-6z" stroke="currentColor" strokeWidth="1.5"/></svg>
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 5h7M7 19h7M14 5l-4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton label="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 7h12M8 12h12M8 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="4" cy="7" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="17" r="1" fill="currentColor"/></svg>
        </ToolbarButton>
        <ToolbarButton label="Numbered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 7h11M9 12h11M9 17h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 6h1v3M4 12h2M4 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 5v14M6 12h8M14 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 7L5 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 18a8 8 0 00-8-8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 7l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 18a8 8 0 018-8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolbarButton>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg min-h-[220px] p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <EditorContent editor={editor} />
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Attachments</label>
        <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-slate-200 dark:file:border-slate-700 file:px-3 file:py-1.5 file:bg-white dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 file:cursor-pointer" />
        {attachments.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {attachments.map((file, i) => (
              <li key={i} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200">{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 text-white px-4 py-2 shadow-soft hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40">
          Submit Retrospective
        </button>
      </div>
    </div>
  );
}
