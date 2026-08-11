import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',

  database: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },

  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',

  upload: {
    dir: process.env.UPLOAD_DIR ?? 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50', 10),
  },

  sla: {
    defaultDays: parseInt(process.env.DEFAULT_SLA_DAYS ?? '7', 10),
  },

  integration: {
    apiKey: process.env.INTEGRATION_API_KEY ?? '',
  },

  knowledgeBase: {
    // In local dev, __dirname is backend/src/config → three levels up is the repo
    // root, where Knowledge_Base/ lives. In the Docker production image there is no
    // such repo root, so KNOWLEDGE_BASE_DIR must be set explicitly (see Dockerfile).
    dir: process.env.KNOWLEDGE_BASE_DIR
      ? path.resolve(process.env.KNOWLEDGE_BASE_DIR)
      : path.resolve(__dirname, '../../../Knowledge_Base'),
  },

  ai: {
    openRouterKey: process.env.OPENROUTER_API_KEY ?? '',
    // The assistant drives a tool-calling loop, so the model must follow the
    // `tools` contract reliably and must not emit reasoning into `content`.
    // Reasoning models (qwen3 thinking, for one) fail both and are a poor fit.
    chatModel: process.env.AI_CHAT_MODEL ?? 'anthropic/claude-3-5-haiku',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS ?? '4096', 10),
    enabled: (process.env.AI_ENABLED ?? 'false') === 'true',
  },
} as const;
