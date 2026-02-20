/**
 * GYM (Goal Yield Map) tools
 */

import type { ToolDefinition } from './nodes.js';

export const gymTools: ToolDefinition[] = [
  {
    name: 'thunderfire_gym_tasks',
    description: 'List GYM (Goal Yield Map) improvement tasks. GYM is the autonomous improvement engine tracking goals, yield metrics, and dependencies.',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    handler: async (client) => {
      const tasks = await client.gymTasks();

      if (tasks.length === 0) {
        return 'No GYM tasks in queue.';
      }

      const statusEmoji: Record<string, string> = {
        'OPEN': '[ ]',
        'IN_PROGRESS': '[~]',
        'COMPLETED': '[x]',
        'BLOCKED': '[!]'
      };

      const lines = tasks.map(t =>
        `${statusEmoji[t.status] || '[ ]'} ${t.id}: ${t.goal}\n    Priority: ${t.priority}, Gates: ${t.gates.join(', ') || 'none'}`
      );

      const openCount = tasks.filter(t => t.status === 'OPEN').length;
      const progressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

      return `GYM Tasks (${tasks.length} total: ${openCount} open, ${progressCount} in progress, ${completedCount} completed):\n${lines.join('\n')}`;
    }
  },
  {
    name: 'thunderfire_gym_complete',
    description: 'Mark a GYM task as complete with yield results. Include before/after metrics to measure improvement.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'The GYM task ID to complete'
        },
        result: {
          type: 'object',
          description: 'Completion result with yield_after metrics',
          properties: {
            yield_after: {
              type: 'object',
              description: 'Post-completion metrics'
            },
            notes: {
              type: 'string',
              description: 'Optional completion notes'
            }
          }
        }
      },
      required: ['task_id', 'result']
    },
    handler: async (client, args) => {
      const { task_id, result } = args as { task_id: string; result: Record<string, unknown> };
      const response = await client.gymComplete(task_id, result);

      return `GYM task ${task_id} marked as ${response.status}.
Yield metrics recorded. The improvement is now tracked in the iteration log.`;
    }
  }
];
