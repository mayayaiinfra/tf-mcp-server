/**
 * TOP Script evaluation tool
 */

import type { ToolDefinition } from './nodes.js';

export const scriptTools: ToolDefinition[] = [
  {
    name: 'thunderfire_script_eval',
    description: 'Execute TOP Script code. TOP Script is a domain-specific language for node orchestration, with commands like THETA.run(), NODE.config(), and SERVICE.request().',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'TOP Script code to execute'
        },
        node_id: {
          type: 'string',
          description: 'Optional: Execute in context of a specific node'
        }
      },
      required: ['code']
    },
    handler: async (client, args) => {
      const { code, node_id } = args as { code: string; node_id?: string };
      const result = await client.scriptEval(code, node_id);

      return `Script executed${node_id ? ` on ${node_id}` : ''}:

Code:
${code}

Result:
${typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : String(result.result)}`;
    }
  }
];
