/**
 * CHITRAL tools
 */

import type { ToolDefinition } from './nodes.js';

export const chitralTools: ToolDefinition[] = [
  {
    name: 'thunderfire_chitral_decode',
    description: 'Decode a CHITRAL hex message to human-readable JSON. CHITRAL is the node status encoding format (Pico: 8B, Lite: 32B, Full: 98B).',
    inputSchema: {
      type: 'object',
      properties: {
        hex: {
          type: 'string',
          description: 'Hex-encoded CHITRAL message (e.g., "A5003C0012345678")'
        }
      },
      required: ['hex']
    },
    handler: async (client, args) => {
      const { hex } = args as { hex: string };
      const result = await client.chitralDecode(hex);

      return `CHITRAL Decoded:
  Format: ${result.format}
  Fields:
${Object.entries(result.fields)
  .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
  .join('\n')}`;
    }
  },
  {
    name: 'thunderfire_chitral_status',
    description: 'Get live CHITRAL status of a node. Returns real-time health metrics in CHITRAL format.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: {
          type: 'string',
          description: 'The node ID to query'
        }
      },
      required: ['node_id']
    },
    handler: async (client, args) => {
      const { node_id } = args as { node_id: string };
      const health = await client.chitralStatus(node_id);

      return `CHITRAL Status for ${node_id}:
  Format: ${health.chitral?.format || 'Full'}
  Health: ${health.health}%
  Uptime: ${health.uptime}s
  CPU Load: ${health.cpu}%
  Memory: ${health.memory}%
  Error Count: ${health.errors}`;
    }
  }
];
