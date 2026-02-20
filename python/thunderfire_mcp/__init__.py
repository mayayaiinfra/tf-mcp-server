"""
THUNDERFIRE MCP Server - Python Implementation

Usage:
    thunderfire-mcp --api-key tf_live_xxx
    THUNDERFIRE_API_KEY=tf_live_xxx thunderfire-mcp
"""

import os
import sys
import asyncio
import argparse
from .server import ThunderFireMCPServer


def parse_args():
    parser = argparse.ArgumentParser(
        description='THUNDERFIRE MCP Server',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  thunderfire-mcp --api-key tf_live_xxx
  THUNDERFIRE_API_KEY=tf_live_xxx thunderfire-mcp
  thunderfire-mcp --api-url https://top.mayayai.com --api-key tf_live_xxx
        '''
    )
    parser.add_argument('--api-url', default=os.environ.get('THUNDERFIRE_API_URL', 'http://localhost:8080'),
                        help='TOP API URL')
    parser.add_argument('--api-key', default=os.environ.get('THUNDERFIRE_API_KEY', ''),
                        help='TOP API key (required)')
    parser.add_argument('--timeout', type=int, default=int(os.environ.get('THUNDERFIRE_TIMEOUT', '30000')),
                        help='Request timeout in ms')
    parser.add_argument('--debug', action='store_true',
                        default=os.environ.get('THUNDERFIRE_DEBUG', '').lower() == 'true',
                        help='Enable debug logging')
    parser.add_argument('--version', action='version', version='thunderfire-mcp 1.0.0')
    return parser.parse_args()


async def async_main():
    args = parse_args()

    if not args.api_key:
        print('Error: THUNDERFIRE_API_KEY required', file=sys.stderr)
        print('Set via --api-key argument or THUNDERFIRE_API_KEY environment variable', file=sys.stderr)
        sys.exit(1)

    config = {
        'api_url': args.api_url,
        'api_key': args.api_key,
        'timeout': args.timeout,
        'debug': args.debug
    }

    server = ThunderFireMCPServer(config)

    try:
        await server.start()
    except KeyboardInterrupt:
        if args.debug:
            print('Shutting down...', file=sys.stderr)
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr)
        sys.exit(1)


def main():
    asyncio.run(async_main())


if __name__ == '__main__':
    main()
