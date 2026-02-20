/**
 * THETA decision engine tools
 */

import type { ToolDefinition } from './nodes.js';

export const thetaTools: ToolDefinition[] = [
  {
    name: 'thunderfire_theta_run',
    description: 'Execute a THETA decision cycle on a node. THETA is the 12-stage autonomous decision process (G→V0→V1→C→Ap→Obe→Ae→Oe→Δ→Ac→Ti→η).',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: {
          type: 'string',
          description: 'The node ID to run THETA on'
        },
        stage: {
          type: 'number',
          description: 'Start from specific stage (1-12). Default: 1 (G - Given)',
          minimum: 1,
          maximum: 12
        },
        params: {
          type: 'object',
          description: 'Optional parameters for the THETA cycle'
        }
      },
      required: ['node_id']
    },
    handler: async (client, args) => {
      const { node_id, stage, params } = args as {
        node_id: string;
        stage?: number;
        params?: Record<string, unknown>;
      };

      const result = await client.thetaRun(node_id, stage, params);

      const stageNames = ['G', 'V0', 'V1', 'C', 'Ap', 'Obe', 'Ae', 'Oe', 'Δ', 'Ac', 'Ti', 'η'];
      return `THETA cycle started on ${node_id}:
  Cycle ID: ${result.cycle_id}
  Current Stage: ${result.stage}
  Stage Flow: ${stageNames.join(' → ')}`;
    }
  },
  {
    name: 'thunderfire_theta_status',
    description: 'Get current THETA pipeline status for a node. Shows which stage is active, cycle count, current goal, and efficiency metric.',
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
      const state = await client.thetaStatus(node_id);

      return `THETA Status for ${node_id}:
  Current Stage: ${state.stage}
  Cycle Count: ${state.cycle_count}
  Current Goal: ${state.current_goal || '(none)'}
  Efficiency (η): ${(state.efficiency * 100).toFixed(1)}%`;
    }
  }
];
