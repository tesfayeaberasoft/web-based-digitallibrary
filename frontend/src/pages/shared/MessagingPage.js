import { apiUrl } from '../../config/api';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormHelperText,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  AccessTime,
  ChatBubbleOutlineOutlined,
  ExpandMore,
  HelpOutlineOutlined,
  LocalLibraryOutlined,
  Send
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const API_URL = apiUrl("/api");
const POLL_INTERVAL = 5000;
const SUPPORT_FAQS = [
  {
    question: 'How do I borrow a book?',
    answer: 'Open the book record and choose the borrow or request option. A librarian can help if the book is unavailable.'
  },
  {
    question: 'How do I access an eBook?',
    answer: 'Open a book that has digital content and select Read. PDF and EPUB titles open in the built-in reader.'
  },
  {
    question: 'How long does it take to get a reply?',
    answer: 'A librarian will respond as soon as possible during library hours. Your conversation stays in this support desk.'
  }
];

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
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState('');
  const [conversationError, setConversationError] = useState('');
  const messagesEndRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

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
    shouldAutoScrollRef.current = true;
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
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const messageContent = draft.trim();
    if (!messageContent || !selectedPeer || sending) return;
    const isNewSupportRequest = supportMode && !threadById.has(String(selectedPeer.id));
    if (isNewSupportRequest && !subject.trim()) {
      setPageError('Add a subject so the librarian knows what you need help with.');
      return;
    }

    setSending(true);
    setPageError('');
    try {
      const { data } = await axios.post(`${API_URL}/messages`, {
        receiver_id: Number(selectedPeer.id),
        message_content: isNewSupportRequest
          ? `Subject: ${subject.trim()}\n\n${messageContent}`
          : messageContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      shouldAutoScrollRef.current = true;
      setMessages((current) => [...current, data.message]);
      setDraft('');
      setSubject('');
      await refreshThreads();
    } catch (error) {
      setPageError(error.response?.data?.message || 'Your message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const title = supportMode ? t('messaging.supportTitle') : t('messaging.title');
  const noContactsText = supportMode
    ? 'No active librarian is available right now. Please try again later.'
    : 'No eligible contacts are available for your role.';

  return (
    <DashboardLayout title={title}>
      <Stack spacing={2}>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3,
            color: 'common.white',
            background: 'linear-gradient(120deg, #1b4332 0%, #2d6a4f 55%, #52b788 100%)',
            boxShadow: '0 12px 32px rgba(27, 67, 50, 0.18)'
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Avatar sx={{ width: 54, height: 54, bgcolor: 'rgba(255,255,255,.16)', color: 'common.white' }}>
              {supportMode ? <LocalLibraryOutlined /> : <ChatBubbleOutlineOutlined />}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={750}>{title}</Typography>
              <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,.84)' }}>
                {supportMode
                  ? 'Get help from the library team and keep every reply in one place.'
                  : 'A shared space for quick, secure conversations with your team.'}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        {pageError && <Alert severity="error" onClose={() => setPageError('')}>{pageError}</Alert>}
        <Paper
          elevation={1}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 0.75fr) minmax(0, 1.8fr)' },
            minHeight: { xs: 660, md: 680 },
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0 12px 36px rgba(27, 67, 50, 0.08)'
          }}
        >
          <Box sx={{ borderRight: { md: 1 }, borderColor: 'divider', minWidth: 0, bgcolor: '#f7fbf8' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {supportMode ? t('support.requests') : t('messaging.conversation')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {supportMode ? 'Librarian conversations' : 'Contacts and recent chats'}
              </Typography>
            </Box>
            <Divider />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={26} /></Box>
            ) : peers.length === 0 ? (
              <Stack spacing={1} alignItems="flex-start" sx={{ p: 2 }}>
                <HelpOutlineOutlined color="action" />
                <Typography variant="body2" color="text.secondary">{noContactsText}</Typography>
              </Stack>
            ) : (
              <Stack spacing={0.5} sx={{ p: 1, maxHeight: { xs: 220, md: 570 }, overflowY: 'auto' }}>
                {peers.map((peer) => (
                  <Button
                    key={peer.id}
                    onClick={() => setSelectedId(peer.id)}
                    color="inherit"
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: 2,
                      p: 1.25,
                      bgcolor: peer.id === String(selectedId) ? 'rgba(45,106,79,.10)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(45,106,79,.08)' }
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
                      {supportMode && peer.last_message_id && (
                        <Chip
                          size="small"
                          icon={String(peer.sender_id) === String(user?.id) ? <AccessTime /> : undefined}
                          label={String(peer.sender_id) === String(user?.id) ? 'Pending' : 'Resolved'}
                          color={String(peer.sender_id) === String(user?.id) ? 'warning' : 'success'}
                          sx={{ mt: 0.75, height: 22, '& .MuiChip-label': { px: 1 } }}
                        />
                      )}
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

          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: { xs: 440, md: 680 } }}>
            {selectedPeer ? (
              <>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ p: 2, background: 'linear-gradient(90deg, #ffffff 0%, #f5faf6 100%)' }}
                >
                  <ContactAvatar name={selectedPeer.full_name} role={selectedPeer.role} />
                  <Box>
                    <Typography fontWeight={700}>{selectedPeer.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {supportMode ? 'Library support team' : roleLabel(selectedPeer.role)}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                {conversationError && <Alert severity="error" sx={{ m: 1 }}>{conversationError}</Alert>}
                <Box
                  aria-live="polite"
                  aria-label="Conversation messages"
                  onScroll={(event) => {
                    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
                    shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
                  }}
                  sx={{
                    flex: 1,
                    minHeight: 280,
                    maxHeight: { xs: 370, md: 440 },
                    overflowY: 'auto',
                    p: { xs: 1.5, sm: 2.5 },
                    bgcolor: '#f5f8f6',
                    backgroundImage: 'radial-gradient(#dce9e0 0.7px, transparent 0.7px)',
                    backgroundSize: '18px 18px'
                  }}
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
                            maxWidth: { xs: '92%', sm: '78%' },
                            px: 2,
                            py: 1.35,
                            borderRadius: ownMessage ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                            background: ownMessage
                              ? 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)'
                              : 'common.white',
                            color: ownMessage ? 'common.white' : 'text.primary',
                            boxShadow: '0 3px 12px rgba(27, 67, 50, 0.10)',
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
                  {supportMode && !threadById.has(String(selectedPeer.id)) && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Request subject"
                      placeholder="What can we help with?"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      inputProps={{ maxLength: 120, 'aria-label': 'Support request subject' }}
                      sx={{ mb: 1.5 }}
                    />
                  )}
                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={5}
                      label={t('messaging.write')}
                      placeholder={supportMode ? 'Describe what you need help with…' : 'Write your message…'}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      inputProps={{ maxLength: 4000, 'aria-label': 'Message text' }}
                      helperText={`${draft.length}/4000`}
                    />
                    <IconButton
                      type="submit"
                      aria-label={t('messaging.send')}
                      color="primary"
                      disabled={!draft.trim() || sending || draft.length > 4000}
                      sx={{ mb: 1 }}
                    >
                      {sending ? <CircularProgress size={24} /> : <Send />}
                    </IconButton>
                  </Stack>
                  {supportMode && (
                    <FormHelperText sx={{ mt: 1 }}>
                      New requests are marked pending until a librarian replies. A reply marks the request resolved; send another message to reopen it.
                    </FormHelperText>
                  )}
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
        {supportMode && (
          <Paper
            component="section"
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, borderColor: 'rgba(45,106,79,.18)' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <HelpOutlineOutlined color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={700}>Quick answers</Typography>
                <Typography variant="body2" color="text.secondary">A few things readers often ask.</Typography>
              </Box>
            </Stack>
            {SUPPORT_FAQS.map((faq) => (
              <Accordion
                key={faq.question}
                disableGutters
                elevation={0}
                sx={{
                  '&:before': { display: 'none' },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'transparent'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography fontWeight={600}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0, color: 'text.secondary' }}>
                  <Typography variant="body2">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        )}
      </Stack>
    </DashboardLayout>
  );
}
