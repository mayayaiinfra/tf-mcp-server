#!/usr/bin/env node
/**
 * THUNDERFIRE MCP Server - Entry Point
 *
 * Usage:
 *   npx @thunderfire/mcp-server --api-key tf_live_xxx
 *   THUNDERFIRE_API_KEY=tf_live_xxx npx @thunderfire/mcp-server
 */

import { ThunderFireMCPServer } from './server.js';
import { getConfig, validateConfig } from './config.js';

async function main(): Promise<void> {
  // Get and validate configuration
  const config = getConfig();
  validateConfig(config);

  // Create and start server
  const server = new ThunderFireMCPServer(config);

  // Handle graceful shutdown
  const shutdown = async () => {
    if (config.debug) {
      console.error('Shutting down...');
    }
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await server.start();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
