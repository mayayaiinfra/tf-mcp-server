/**
 * Node management tools
 */

import type { ThunderFireClient } from '../client.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (client: ThunderFireClient, args: Record<string, unknown>) => Promise<string>;
}

export const nodeTools: ToolDefinition[] = [
  {
    name: 'thunderfire_node_list',
    description: 'List all connected THUNDERFIRE nodes. Returns node IDs, tiers, class types, and health status.',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    handler: async (client) => {
      const nodes = await client.nodeList();
      if (nodes.length === 0) {
        return 'No nodes connected.';
      }
      const lines = nodes.map(n =>
        `- ${n.id} (${n.name}): Tier ${n.tier}, ${n.class_type}, Health: ${n.health}%, Status: ${n.status}`
      );
      return `Connected nodes (${nodes.length}):\n${lines.join('\n')}`;
    }
  },
  {
    name: 'thunderfire_node_health',
    description: 'Get detailed CHITRAL health information for a specific node. Returns 7 CHITRAL health fields including uptime, CPU, memory, and error counts.',
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
      const nodeId = args.node_id as string;
      const health = await client.nodeHealth(nodeId);
      return `Node ${nodeId} Health:
  Overall: ${health.health}%
  Uptime: ${health.uptime}s
  CPU: ${health.cpu}%
  Memory: ${health.memory}%
  Errors: ${health.errors}
  CHITRAL Format: ${health.chitral?.format || 'unknown'}
  Fields: ${JSON.stringify(health.chitral?.fields || {}, null, 2)}`;
    }
  },
  {
    name: 'thunderfire_node_create',
    description: 'Create a new THUNDERFIRE node from a template. Specify the node name, class type (e.g., sensor, actuator, robot), and hardware tier (0-10).',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Human-readable name for the node'
        },
        class_type: {
          type: 'string',
          description: 'Node class type (e.g., TemperatureSensor, MotorController, MobileRobot)'
        },
        tier: {
          type: 'number',
          description: 'Hardware tier (0-10). T0-T1: 4-8 bit MCU, T4-T5: 32-bit MCU, T8-T9: Server/Quantum',
          minimum: 0,
          maximum: 10
        }
      },
      required: ['name', 'class_type', 'tier']
    },
    handler: async (client, args) => {
      const { name, class_type, tier } = args as { name: string; class_type: string; tier: number };
      const result = await client.createNode(name, class_type, tier);
      return `Node created successfully!\n  ID: ${result.node_id}\n  Name: ${name}\n  Type: ${class_type}\n  Tier: T${tier}`;
    }
  }
];
