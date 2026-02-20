/**
 * Configuration module
 * Handles CLI args and environment variables
 */

export interface Config {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  debug: boolean;
}

export function parseArgs(args: string[]): Partial<Config> {
  const config: Partial<Config> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--api-url' && args[i + 1]) {
      config.apiUrl = args[++i];
    } else if (arg.startsWith('--api-url=')) {
      config.apiUrl = arg.split('=')[1];
    } else if (arg === '--api-key' && args[i + 1]) {
      config.apiKey = args[++i];
    } else if (arg.startsWith('--api-key=')) {
      config.apiKey = arg.split('=')[1];
    } else if (arg === '--timeout' && args[i + 1]) {
      config.timeout = parseInt(args[++i], 10);
    } else if (arg.startsWith('--timeout=')) {
      config.timeout = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--debug') {
      config.debug = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      console.log('@thunderfire/mcp-server v1.0.0');
      process.exit(0);
    }
  }

  return config;
}

export function getConfig(): Config {
  const cliConfig = parseArgs(process.argv.slice(2));

  return {
    apiUrl: cliConfig.apiUrl || process.env.THUNDERFIRE_API_URL || 'http://localhost:8080',
    apiKey: cliConfig.apiKey || process.env.THUNDERFIRE_API_KEY || '',
    timeout: cliConfig.timeout || parseInt(process.env.THUNDERFIRE_TIMEOUT || '30000', 10),
    debug: cliConfig.debug || process.env.THUNDERFIRE_DEBUG === 'true'
  };
}

export function validateConfig(config: Config): void {
  if (!config.apiKey) {
    console.error('Error: THUNDERFIRE_API_KEY required.');
    console.error('Set via --api-key argument or THUNDERFIRE_API_KEY environment variable.');
    process.exit(1);
  }

  if (!config.apiUrl) {
    console.error('Error: THUNDERFIRE_API_URL required.');
    console.error('Set via --api-url argument or THUNDERFIRE_API_URL environment variable.');
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
@thunderfire/mcp-server - THUNDERFIRE MCP Server

USAGE:
  npx @thunderfire/mcp-server [OPTIONS]

OPTIONS:
  --api-url <URL>     TOP API URL (default: http://localhost:8080)
  --api-key <KEY>     TOP API key (required)
  --timeout <MS>      Request timeout in milliseconds (default: 30000)
  --debug             Enable debug logging
  -h, --help          Show this help message
  -v, --version       Show version

ENVIRONMENT VARIABLES:
  THUNDERFIRE_API_URL    TOP API URL
  THUNDERFIRE_API_KEY    TOP API key
  THUNDERFIRE_TIMEOUT    Request timeout in milliseconds
  THUNDERFIRE_DEBUG      Enable debug logging (true/false)

EXAMPLES:
  # Using environment variables
  export THUNDERFIRE_API_KEY=tf_live_abc123...
  npx @thunderfire/mcp-server

  # Using command line arguments
  npx @thunderfire/mcp-server --api-key tf_live_abc123...

  # Full configuration
  npx @thunderfire/mcp-server \\
    --api-url https://top.mayayai.com \\
    --api-key tf_live_abc123... \\
    --timeout 60000

DOCUMENTATION:
  https://mayayai.com/thunderfire/mcp
`);
}
