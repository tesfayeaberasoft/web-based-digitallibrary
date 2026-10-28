import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { ChatBubbleOutlineOutlined, Send } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://localhost:8000/api';
const POLL_INTERVAL = 5000;

const roleLabel = (role) => ({
  'super-admin': 'Super Admin',
  admin: 'Admin',
  librarian: 'Librarian',
  user: 'Member'
}[role] || role);

function ContactAvatar({ name, role }) {
  return (
    <Avatar sx={{ bgcolor: role === 'super-admin' ? 'error.main' : 'primary.main', width: 42, height: 42 }}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </Avatar>
  );
}

export default function MessagingPage({ supportMode = false }) {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState('');
  const [conversationError, setConversationError] = useState('');
  const messagesEndRef = useRef(null);

  const threadById = useMemo(
    () => new Map(threads.map((thread) => [String(thread.user_id), thread])),
    [threads]
  );
  const contactById = useMemo(
    () => new Map(contacts.map((contact) => [String(contact.id), contact])),
    [contacts]
  );
  const peers = useMemo(() => {
    const ids = [...threads.map((thread) => String(thread.user_id)), ...contacts.map((contact) => String(contact.id))];
    return [...new Set(ids)].map((id) => ({
      ...(contactById.get(id) || {}),
      ...(threadById.get(id) || {}),
      id
    }));
  }, [contacts, threads, contactById, threadById]);
  const selectedPeer = peers.find((peer) => peer.id === String(selectedId));

  const refreshThreads = useCallback(async () => {
    const { data } = await axios.get(`${API_URL}/messages/threads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setThreads(data.threads || []);
  }, [token]);

  useEffect(() => {
    let active = true;
    let timer;

    const initialize = async () => {
      setLoading(true);
      setPageError('');
      try {
        const [contactResponse, threadResponse] = await Promise.all([
          axios.get(`${API_URL}/messages/contacts`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/messages/threads`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (!active) return;

        const nextContacts = contactResponse.data.contacts || [];
        const nextThreads = threadResponse.data.threads || [];
        setContacts(nextContacts);
        setThreads(nextThreads);
        const firstPeer = supportMode
          ? nextContacts[0]
          : nextThreads[0] || nextContacts[0];
        setSelectedId((current) => current || String(firstPeer?.user_id || firstPeer?.id || ''));
        setLoading(false);
      } catch (error) {
        if (!active) return;
        setPageError(error.response?.data?.message || 'Unable to load messages. Please try again.');
        setLoading(false);
      }
    };

    const pollThreads = async () => {
      try {
        await refreshThreads();
      } catch (error) {
        if (active) {
          setPageError(error.response?.data?.message || 'Unable to refresh your conversations.');
        }
      } finally {
        if (active) timer = setTimeout(pollThreads, POLL_INTERVAL);
      }
    };

    initialize().then(() => {
      if (active) timer = setTimeout(pollThreads, POLL_INTERVAL);
    });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [token, supportMode, refreshThreads]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return undefined;
    }

    let active = true;
    let timer;
    const loadConversation = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/messages/conversation`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { peer_id: selectedId }
        });
        if (!active) return;
        const conversation = data.messages || [];
        setMessages(conversation);
        setConversationError('');

        const unread = conversation.filter(
          (message) => String(message.receiver_id) === String(user?.id) && message.status === 'unread'
        );
        if (unread.length) {
          await Promise.all(unread.map((message) => axios.put(
            `${API_URL}/messages/${message.id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )));
          if (active) {
            const readIds = new Set(unread.map((message) => String(message.id)));
            setMessages((current) => current.map((message) => (
              readIds.has(String(message.id)) ? { ...message, status: 'read' } : message
            )));
            refreshThreads().catch((error) => {
              if (active) {
                setPageError(error.response?.data?.message || 'Unable to refresh your conversations.');
              }
            });
          }
        }
      } catch (error) {
        if (active) {
          setConversationError(error.response?.data?.message || 'Unable to load this conversation.');
        }
      } finally {
        if (active) timer = setTimeout(loadConversation, POLL_INTERVAL);
      }
    };

    loadConversation();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedId, token, user?.id, refreshThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const messageContent = draft.trim();
    if (!messageContent || !selectedPeer || sending) return;

    setSending(true);
    setPageError('');
    try {
      const { data } = await axios.post(`${API_URL}/messages`, {
        receiver_id: Number(selectedPeer.id),
        message_content: messageContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((current) => [...current, data.message]);
      setDraft('');
      await refreshThreads();
    } catch (error) {
      setPageError(error.response?.data?.message || 'Your message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const title = supportMode ? 'Help & Support' : 'Messages';
  const noContactsText = supportMode
    ? 'No active librarian is available right now. Please try again later.'
    : 'No eligible contacts are available for your role.';

  return (
    <DashboardLayout title={title}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{title}</Typography>
          <Typography color="text.secondary">
            {supportMode
              ? 'Contact a librarian for help and follow replies here.'
              : 'Chat with the staff members available to your role.'}
          </Typography>
        </Box>
        {pageError && <Alert severity="error" onClose={() => setPageError('')}>{pageError}</Alert>}
        <Paper
          elevation={1}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 0.75fr) minmax(0, 1.8fr)' },
            minHeight: 560,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ borderRight: { md: 1 }, borderColor: 'divider', minWidth: 0 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {supportMode ? 'Support desk' : 'Conversations'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {supportMode ? 'Active librarians' : 'Contacts and recent chats'}
              </Typography>
            </Box>
            <Divider />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={26} /></Box>
            ) : peers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>{noContactsText}</Typography>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {peers.map((peer) => (
                  <Button
                    key={peer.id}
                    onClick={() => setSelectedId(peer.id)}
                    color="inherit"
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: 0,
                      p: 1.5,
                      bgcolor: peer.id === String(selectedId) ? 'action.selected' : 'transparent'
                    }}
                  >
                    <ContactAvatar name={peer.full_name} role={peer.role} />
                    <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography noWrap fontWeight={600}>{peer.full_name}</Typography>
                        {Number(peer.unread_count) > 0 && (
                          <Chip
                            color="primary"
                            size="small"
                            label={Number(peer.unread_count)}
                            aria-label={`${Number(peer.unread_count)} unread messages`}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {roleLabel(peer.role)}
                      </Typography>
                      {peer.message_content && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
                          {peer.message_content}
                        </Typography>
                      )}
                    </Box>
                  </Button>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 560 }}>
            {selectedPeer ? (
              <>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
                  <ContactAvatar name={selectedPeer.full_name} role={selectedPeer.role} />
                  <Box>
                    <Typography fontWeight={700}>{selectedPeer.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{roleLabel(selectedPeer.role)}</Typography>
                  </Box>
                </Stack>
                <Divider />
                {conversationError && <Alert severity="error" sx={{ m: 1 }}>{conversationError}</Alert>}
                <Box
                  aria-live="polite"
                  aria-label="Conversation messages"
                  sx={{ flex: 1, minHeight: 300, maxHeight: 520, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}
                >
                  {messages.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%', color: 'text.secondary' }}>
                      <ChatBubbleOutlineOutlined />
                      <Typography variant="body2">Start the conversation with {selectedPeer.full_name}.</Typography>
                    </Stack>
                  ) : messages.map((message) => {
                    const ownMessage = String(message.sender_id) === String(user?.id);
                    return (
                      <Box
                        key={message.id}
                        sx={{ display: 'flex', justifyContent: ownMessage ? 'flex-end' : 'flex-start', mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            maxWidth: '80%',
                            px: 1.75,
                            py: 1.25,
                            borderRadius: 2,
                            bgcolor: ownMessage ? 'primary.main' : 'background.paper',
                            color: ownMessage ? 'primary.contrastText' : 'text.primary',
                            boxShadow: 1,
                            overflowWrap: 'anywhere',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          <Typography variant="body1">{message.message_content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mt: 0.5, textAlign: 'right', opacity: 0.75 }}
                          >
                            {new Date(message.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>
                <Divider />
                <Box component="form" onSubmit={handleSend} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={5}
                      label="Write a message"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      inputProps={{ maxLength: 4000, 'aria-label': 'Message text' }}
                      helperText={`${draft.length}/4000`}
                    />
                    <IconButton
                      type="submit"
                      aria-label="Send message"
                      color="primary"
                      disabled={!draft.trim() || sending || draft.length > 4000}
                      sx={{ mb: 1 }}
                    >
                      {sending ? <CircularProgress size={24} /> : <Send />}
                    </IconButton>
                  </Stack>
                </Box>
              </>
            ) : (
              <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ flex: 1, p: 3, textAlign: 'center' }}>
                {loading ? <CircularProgress /> : (
                  <>
                    <ChatBubbleOutlineOutlined color="action" />
                    <Typography fontWeight={600}>Choose a conversation</Typography>
                    <Typography variant="body2" color="text.secondary">{noContactsText}</Typography>
                  </>
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      </Stack>
    </DashboardLayout>
  );
}
