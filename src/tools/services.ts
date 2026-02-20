/**
 * NOP service tools
 */

import type { ToolDefinition } from './nodes.js';

export const serviceTools: ToolDefinition[] = [
  {
    name: 'thunderfire_service_discover',
    description: 'Discover available NOP (Node Orchestration Protocol) services. Find ML inference, data processing, notification, and other services offered by the network.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by service category (inference, storage, compute, notification)',
          enum: ['inference', 'storage', 'compute', 'notification', 'analytics']
        },
        min_tier: {
          type: 'number',
          description: 'Minimum required tier for the service (0-10)',
          minimum: 0,
          maximum: 10
        }
      }
    },
    handler: async (client, args) => {
      const { category, min_tier } = args as { category?: string; min_tier?: number };
      const services = await client.serviceDiscover(category, min_tier);

      if (services.length === 0) {
        return `No services found${category ? ` in category ${category}` : ''}${min_tier ? ` requiring tier ${min_tier}+` : ''}.`;
      }

      const lines = services.map(s =>
        `- ${s.name} (${s.id})\n    Provider: ${s.provider}, Category: ${s.category}\n    Price: $${s.price.amount}/${s.price.unit}, Min Tier: T${s.tier_min}`
      );
      return `Available NOP Services (${services.length}):\n${lines.join('\n')}`;
    }
  },
  {
    name: 'thunderfire_service_request',
    description: 'Request a NOP service. Initiates contract negotiation with the service provider. Returns a negotiation ID to track the request.',
    inputSchema: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'The service ID to request'
        },
        params: {
          type: 'object',
          description: 'Service-specific parameters (e.g., data format, SLA requirements)'
        }
      },
      required: ['service_id']
    },
    handler: async (client, args) => {
      const { service_id, params } = args as { service_id: string; params?: Record<string, unknown> };
      const result = await client.serviceRequest(service_id, params || {});

      return `Service request initiated:
  Service ID: ${service_id}
  Negotiation ID: ${result.negotiation_id}
  Status: Pending approval

The service provider will respond with contract terms. Use the negotiation ID to track progress.`;
    }
  }
];
