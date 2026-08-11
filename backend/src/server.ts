import { createApp } from './app';
import { config } from './config';
import { prisma } from './config/database';
import { pruneOldConversations } from './services/chat/conversationService';

const PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Chat conversations are the only records here with a retention policy. One
 * daily sweep does not justify pulling in a scheduler, so it runs on a timer
 * and is unref'd to keep it out of the way of a clean shutdown.
 */
function startChatRetentionSweep(): void {
  const sweep = async () => {
    try {
      const removed = await pruneOldConversations();
      if (removed > 0) console.log(`[Chat] Pruned ${removed} expired conversation(s)`);
    } catch (err) {
      console.error('[Chat] Retention sweep failed:', err);
    }
  };

  void sweep();
  setInterval(sweep, PRUNE_INTERVAL_MS).unref();
}

async function main(): Promise<void> {
  // Verify DB connection
  await prisma.$connect();
  console.log('[DB] Connected to PostgreSQL');

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port} (${config.nodeEnv})`);
  });

  startChatRetentionSweep();
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
