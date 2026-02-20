/**
 * Messaging tools (bridges to NOP connectors)
 */

import type { ToolDefinition } from './nodes.js';

export const messagingTools: ToolDefinition[] = [
  {
    name: 'thunderfire_msg_send',
    description: 'Send a message via NOP messaging connector. Supports Telegram, Slack, Discord, and WhatsApp channels.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Messaging channel to use',
          enum: ['telegram', 'slack', 'discord', 'whatsapp']
        },
        recipient: {
          type: 'string',
          description: 'Recipient identifier (user ID, channel ID, or phone number)'
        },
        text: {
          type: 'string',
          description: 'Message text to send'
        }
      },
      required: ['channel', 'recipient', 'text']
    },
    handler: async (client, args) => {
      const { channel, recipient, text } = args as { channel: string; recipient: string; text: string };
      const result = await client.msgSend(channel, recipient, text);

      return `Message sent via ${channel}:
  To: ${recipient}
  Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}
  Status: ${result.status}`;
    }
  },
  {
    name: 'thunderfire_msg_history',
    description: 'Get message history from a messaging channel. Returns recent messages with timestamps and senders.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Messaging channel to query',
          enum: ['telegram', 'slack', 'discord', 'whatsapp']
        },
        limit: {
          type: 'number',
          description: 'Maximum number of messages to return (default: 10)',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['channel']
    },
    handler: async (client, args) => {
      const { channel, limit } = args as { channel: string; limit?: number };
      const messages = await client.msgHistory(channel, limit || 10);

      if (messages.length === 0) {
        return `No messages found in ${channel}.`;
      }

      const lines = messages.map(m => {
        const time = new Date(m.timestamp * 1000).toISOString();
        return `[${time}] ${m.from} → ${m.to}: ${m.text.substring(0, 80)}${m.text.length > 80 ? '...' : ''}`;
      });

      return `Message History (${channel}, last ${messages.length}):\n${lines.join('\n')}`;
    }
  }
];
