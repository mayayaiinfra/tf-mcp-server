"""
THUNDERFIRE MCP Server - Python Implementation
"""

import sys
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, Resource, Prompt, TextContent

from .client import ThunderFireClient
from .tools import TOOLS
from .resources import RESOURCES


class ThunderFireMCPServer:
    def __init__(self, config: dict):
        self.config = config
        self.client = ThunderFireClient(
            api_url=config['api_url'],
            api_key=config['api_key'],
            timeout=config['timeout'] / 1000  # Convert ms to seconds
        )
        self.server = Server("thunderfire")
        self._setup_handlers()

    def _setup_handlers(self):
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            return [
                Tool(
                    name=t['name'],
                    description=t['description'],
                    inputSchema=t['inputSchema']
                )
                for t in TOOLS
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent]:
            tool = next((t for t in TOOLS if t['name'] == name), None)
            if not tool:
                return [TextContent(type='text', text=f'Unknown tool: {name}')]

            try:
                handler = tool['handler']
                result = await handler(self.client, arguments)
                return [TextContent(type='text', text=result)]
            except Exception as e:
                return [TextContent(type='text', text=f'Error: {e}')]

        @self.server.list_resources()
        async def list_resources() -> list[Resource]:
            return [
                Resource(
                    uri=r['uri'],
                    name=r['name'],
                    description=r['description'],
                    mimeType=r['mimeType']
                )
                for r in RESOURCES
            ]

        @self.server.read_resource()
        async def read_resource(uri: str) -> str:
            resource = next((r for r in RESOURCES if r['uri'] == uri or self._match_pattern(r['uri'], uri)), None)
            if not resource:
                raise ValueError(f'Unknown resource: {uri}')

            handler = resource['handler']
            return await handler(self.client, uri)

    def _match_pattern(self, pattern: str, uri: str) -> bool:
        """Match URI patterns like thunderfire://node/{node_id}/health"""
        import re
        regex = pattern.replace('{', '(?P<').replace('}', '>[^/]+)')
        return bool(re.match(f'^{regex}$', uri))

    async def start(self):
        if self.config['debug']:
            print(f"Connecting to {self.config['api_url']}...", file=sys.stderr)

        # Validate connection
        valid = await self.client.validate()
        if not valid:
            raise RuntimeError(f"Cannot connect to TOP API at {self.config['api_url']}")

        if self.config['debug']:
            print('Connected to TOP API', file=sys.stderr)
            print(f'Registered {len(TOOLS)} tools, {len(RESOURCES)} resources', file=sys.stderr)

        # Run stdio server
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options()
            )
