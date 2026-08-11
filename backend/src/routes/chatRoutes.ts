import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { chatRateLimiter } from '../middlewares/rateLimiter';
import {
  getChatHealth,
  getConversationMessages,
  getConversations,
  postConversation,
  removeConversation,
  streamChatMessage,
} from '../controllers/chatController';

export const chatRoutes = Router();

chatRoutes.use(authMiddleware);

// GET /api/chat/health — lets the widget hide itself when AI is switched off
chatRoutes.get('/health', getChatHealth);

// POST /api/chat/conversations — start a conversation
chatRoutes.post('/conversations', postConversation);

// GET /api/chat/conversations — the caller's own conversations, newest first
chatRoutes.get('/conversations', getConversations);

// GET /api/chat/conversations/:id — transcript (?include_tools=true for the trace)
chatRoutes.get('/conversations/:id', getConversationMessages);

// DELETE /api/chat/conversations/:id
chatRoutes.delete('/conversations/:id', removeConversation);

// POST /api/chat/conversations/:id/messages — Server-Sent Events.
// POST rather than EventSource because EventSource cannot set an Authorization
// header and the request carries a body. Rate limited per user, after auth so
// req.user is available to the key generator.
chatRoutes.post('/conversations/:id/messages', chatRateLimiter, streamChatMessage);
