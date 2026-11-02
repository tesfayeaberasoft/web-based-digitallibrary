import { apiUrl } from '../../config/api';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  LooksOne,
  LooksTwo,
  Redo,
  Save,
  Undo
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import './BookNotepad.css';
import { useTranslation } from 'react-i18next';

const API_URL = apiUrl("/api");
const EMPTY_DOCUMENT = { type: 'doc', content: [{ type: 'paragraph' }] };

async function saveNote(bookId, token, document) {
  return axios.put(`${API_URL}/books/${bookId}/notes`, { note_content: document }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export default function BookNotepad({ bookId, bookTitle, token }) {
  const { t, i18n } = useTranslation();
  const [document, setDocument] = useState(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [savedAt, setSavedAt] = useState(null);
  const saveTimerRef = useRef(null);
  const saveVersionRef = useRef(0);
  const loadedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write a thought, quote, or question…' })
    ],
    content: EMPTY_DOCUMENT,
    editable: false,
    editorProps: {
      attributes: {
        'aria-label': `Personal notes for ${bookTitle}`,
        class: 'tiptap-note-content',
        role: 'textbox',
        'aria-multiline': 'true'
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (!loadedRef.current) return;
      saveVersionRef.current += 1;
      setDocument(currentEditor.getJSON());
      setSaveStatus('unsaved');
    }
  }, [bookId]);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      heading1: currentEditor?.isActive('heading', { level: 1 }) ?? false,
      heading2: currentEditor?.isActive('heading', { level: 2 }) ?? false,
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false
    })
  });

  useEffect(() => {
    if (!editor) return undefined;
    let active = true;
    loadedRef.current = false;
    editor.setEditable(false);
    setLoadingNote(true);
    setLoadError('');
    setDocument(null);
    setSaveStatus('saved');
    setSavedAt(null);

    axios.get(`${API_URL}/books/${bookId}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      if (!active) return;
      const noteDocument = data.note?.note_content || EMPTY_DOCUMENT;
      editor.commands.setContent(noteDocument, { emitUpdate: false });
      loadedRef.current = true;
      setDocument(null);
      setSavedAt(data.note?.updated_at || null);
      setLoadingNote(false);
      editor.setEditable(true);
    }).catch((error) => {
      if (!active) return;
      setLoadError(error.response?.data?.message || 'Unable to load your notes. Try again.');
      setLoadingNote(false);
    });

    return () => {
      active = false;
      loadedRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [bookId, token, editor]);

  useEffect(() => {
    if (!editor || loadingNote || !loadedRef.current || !document) return undefined;

    const version = ++saveVersionRef.current;
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const { data } = await saveNote(bookId, token, document);
        if (version !== saveVersionRef.current) return;
        setSaveStatus('saved');
        setSavedAt(data.note?.updated_at || new Date().toISOString());
      } catch (error) {
        if (version !== saveVersionRef.current) return;
        setSaveStatus('error');
      }
    }, 800);

    return () => clearTimeout(saveTimerRef.current);
  }, [bookId, token, document, editor, loadingNote]);

  const handleManualSave = async () => {
    if (!editor || !loadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const version = ++saveVersionRef.current;
    setSaveStatus('saving');
    try {
      const { data } = await saveNote(bookId, token, editor.getJSON());
      if (version !== saveVersionRef.current) return;
      setSaveStatus('saved');
      setSavedAt(data.note?.updated_at || new Date().toISOString());
    } catch (error) {
      if (version === saveVersionRef.current) setSaveStatus('error');
    }
  };

  const runCommand = (command) => {
    if (editor) command(editor.chain().focus()).run();
  };

  const toolbarButton = (label, icon, active, command) => (
    <Tooltip key={label} title={label}>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          aria-pressed={Boolean(active)}
          disabled={!editor || loadingNote || Boolean(loadError)}
          onClick={() => runCommand(command)}
          sx={{
            borderRadius: 1,
            color: active ? 'primary.main' : 'text.secondary',
            bgcolor: active ? 'action.selected' : 'transparent'
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  const statusText = loadingNote
    ? 'Loading notes'
    : saveStatus === 'saving'
      ? t('notepad.saving')
      : saveStatus === 'error'
        ? t('notepad.failed')
        : saveStatus === 'unsaved'
          ? t('notepad.unsaved')
          : savedAt
            ? t('notepad.savedAt', {
              time: new Date(savedAt).toLocaleTimeString(i18n.resolvedLanguage === 'am' ? 'am-ET' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })
            })
            : t('notepad.saved');

  return (
    <Box
      component="section"
      className="reading-notepad"
      aria-label="Personal reading notes"
      sx={{
        minWidth: 0,
        minHeight: { xs: 430, lg: '70vh' },
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'rgba(45, 106, 79, 0.18)',
        borderRadius: 3,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(27, 67, 50, 0.08)'
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{
          p: { xs: 1.75, sm: 2.25 },
          background: 'linear-gradient(115deg, #f3faf5 0%, #ffffff 78%)'
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.2}>
            YOUR READING SPACE
          </Typography>
          <Typography variant="h6" fontWeight={750} lineHeight={1.2}>{t('notepad.title')}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap title={bookTitle} sx={{ mt: 0.4 }}>
            {bookTitle}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={saveStatus === 'saving' ? <CircularProgress size={16} color="inherit" /> : <Save />}
          disabled={!editor || loadingNote || Boolean(loadError) || saveStatus === 'saving'}
          onClick={handleManualSave}
          sx={{ flexShrink: 0, borderRadius: 2, px: { xs: 1.25, sm: 2 } }}
        >
          {t('notepad.save')}
        </Button>
      </Stack>
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.25}
        sx={{
          px: 1,
          py: 0.75,
          overflowX: 'auto',
          bgcolor: '#f9fcfa',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(45,106,79,.24)', borderRadius: 4 }
        }}
      >
        {toolbarButton('Bold', <FormatBold fontSize="small" />, editorState.bold, (chain) => chain.toggleBold())}
        {toolbarButton('Italic', <FormatItalic fontSize="small" />, editorState.italic, (chain) => chain.toggleItalic())}
        {toolbarButton('Heading 1', <LooksOne fontSize="small" />, editorState.heading1, (chain) => chain.toggleHeading({ level: 1 }))}
        {toolbarButton('Heading 2', <LooksTwo fontSize="small" />, editorState.heading2, (chain) => chain.toggleHeading({ level: 2 }))}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        {toolbarButton('Bulleted list', <FormatListBulleted fontSize="small" />, editorState.bulletList, (chain) => chain.toggleBulletList())}
        {toolbarButton('Numbered list', <FormatListNumbered fontSize="small" />, editorState.orderedList, (chain) => chain.toggleOrderedList())}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        {toolbarButton('Undo', <Undo fontSize="small" />, false, (chain) => chain.undo())}
        {toolbarButton('Redo', <Redo fontSize="small" />, false, (chain) => chain.redo())}
      </Stack>
      <Divider />
      {loadError && <Alert severity="error" sx={{ m: 1 }}>{loadError}</Alert>}
      <Box
        sx={{
          flex: 1,
          minHeight: 260,
          overflowY: 'auto',
          p: { xs: 2, sm: 2.75 },
          background: 'linear-gradient(180deg, #ffffff 0%, #fcfefc 100%)'
        }}
      >
        {loadingNote ? (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">Loading your note…</Typography>
          </Stack>
        ) : <EditorContent editor={editor} />}
      </Box>
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1.25, bgcolor: '#f9fcfa', borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 8,
            height: 8,
            flex: '0 0 auto',
            borderRadius: '50%',
            bgcolor: saveStatus === 'error' ? 'error.main' : saveStatus === 'saving' ? 'warning.main' : 'success.main',
            boxShadow: saveStatus === 'saved' ? '0 0 0 3px rgba(82, 183, 136, .14)' : 'none'
          }}
        />
        <Typography variant="caption" color={saveStatus === 'error' ? 'error.main' : 'text.secondary'} aria-live="polite">
          {statusText}
        </Typography>
      </Stack>
    </Box>
  );
}