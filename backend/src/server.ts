import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { startCleanupInterval } from './utils/cleanup';
import { createInitialAdmin } from './services/user.service';

const cleanupInterval = startCleanupInterval();

app.listen(config.port, async () => {
  await createInitialAdmin(config.adminUsername, config.adminPassword);
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  logger.info(`Temp directory: ${config.tempDir}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  clearInterval(cleanupInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  clearInterval(cleanupInterval);
  process.exit(0);
});
