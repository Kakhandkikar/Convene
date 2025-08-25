import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Title,
  Highlight,
  Undo,
  Redo,
  Attachment,
} from "@mui/icons-material";

export default function RetrospectiveEditor() {
  const [attachments, setAttachments] = useState([]);
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Write your meeting retrospective...</p>",
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const handleSubmit = () => {
    alert("Submitted content:\n\n" + editor?.getHTML());
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        📝 Meeting Retrospective
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Tooltip title="Bold">
          <IconButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <FormatBold />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <FormatItalic />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet List">
          <IconButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulleted />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumbered />
          </IconButton>
        </Tooltip>
        <Tooltip title="Heading">
          <IconButton
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Title />
          </IconButton>
        </Tooltip>
        <Tooltip title="Undo">
          <IconButton onClick={() => editor?.chain().focus().undo().run()}>
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton onClick={() => editor?.chain().focus().redo().run()}>
            <Redo />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          padding: 2,
          minHeight: 200,
          mb: 2,
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          type="file"
          fullWidth
          inputProps={{ multiple: true }}
          onChange={handleFileChange}
          label="Attach files"
          InputLabelProps={{ shrink: true }}
        />
        {attachments.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              Attachments:
            </Typography>
            <ul style={{ paddingLeft: "1.2rem" }}>
              {attachments.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          </Box>
        )}
      </Box>

      <Button variant="contained" onClick={handleSubmit}>
        Submit Retrospective
      </Button>
    </Paper>
  );
}
