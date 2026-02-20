/**
 * THUNDERFIRE MCP Server
 * Exposes THUNDERFIRE capabilities via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { ThunderFireClient, createClient } from './client.js';
import { allTools } from './tools/index.js';
import { resources, matchResource } from './resources/index.js';
import { prompts } from './prompts/index.js';
import type { Config } from './config.js';

export class ThunderFireMCPServer {
  private server: Server;
  private client: ThunderFireClient;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = createClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      timeout: config.timeout
    });

    this.server = new Server(
      {
        name: 'thunderfire',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: allTools.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema
        }))
      };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = allTools.find(t => t.name === name);
      if (!tool) {
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`
            }
          ],
          isError: true
        };
      }

      try {
        const result = await tool.handler(this.client, args || {});
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${message}`
            }
          ],
          isError: true
        };
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: resources.map(r => ({
          uri: r.uri,
          name: r.name,
          description: r.description,
          mimeType: r.mimeType
        }))
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      const resource = matchResource(uri);
      if (!resource) {
        throw new Error(`Unknown resource: ${uri}`);
      }

      try {
        const content = await resource.handler(this.client, uri);
        return {
          contents: [
            {
              uri,
              mimeType: resource.mimeType,
              text: content
            }
          ]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Error reading ${uri}: ${message}`);
      }
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: prompts.map(p => ({
          name: p.name,
          description: p.description,
          arguments: p.arguments
        }))
      };
    });

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const prompt = prompts.find(p => p.name === name);
      if (!prompt) {
        throw new Error(`Unknown prompt: ${name}`);
      }

      const message = prompt.template(args || {});
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: message
            }
          }
        ]
      };
    });
  }

  async start(): Promise<void> {
    // Validate API connection
    if (this.config.debug) {
      console.error(`Connecting to ${this.config.apiUrl}...`);
    }

    const valid = await this.client.validate();
    if (!valid) {
      throw new Error(`Cannot connect to TOP API at ${this.config.apiUrl}. Check API URL and key.`);
    }

    if (this.config.debug) {
      console.error('Connected to TOP API');
      console.error(`Registered ${allTools.length} tools, ${resources.length} resources, ${prompts.length} prompts`);
    }

    // Start stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    if (this.config.debug) {
      console.error('MCP server running on stdio');
    }
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}
