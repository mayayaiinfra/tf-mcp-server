/**
 * Marketplace tools
 */

import type { ToolDefinition } from './nodes.js';

export const marketplaceTools: ToolDefinition[] = [
  {
    name: 'thunderfire_marketplace_search',
    description: 'Search the TF Store marketplace for modules and packages. Find vibration analysis, ML inference, protocol bridges, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "vibration", "ml inference", "mqtt")'
        },
        category: {
          type: 'string',
          description: 'Filter by category (analytics, protocols, hardware, ml, security)',
          enum: ['analytics', 'protocols', 'hardware', 'ml', 'security']
        }
      },
      required: ['query']
    },
    handler: async (client, args) => {
      const { query, category } = args as { query: string; category?: string };
      const packages = await client.marketplaceSearch(query, category);

      if (packages.length === 0) {
        return `No packages found for "${query}"${category ? ` in category ${category}` : ''}.`;
      }

      const lines = packages.map(p =>
        `- ${p.name} v${p.version}: ${p.description}\n    Category: ${p.category}, Min Tier: T${p.tier_min}, Downloads: ${p.downloads}`
      );
      return `Found ${packages.length} packages:\n${lines.join('\n')}`;
    }
  },
  {
    name: 'thunderfire_marketplace_install',
    description: 'Install a package from TF Store onto a node. The package will be loaded via MJIT (Modular JIT).',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: {
          type: 'string',
          description: 'Name of the package to install'
        },
        version: {
          type: 'string',
          description: 'Specific version to install (default: latest)'
        },
        node_id: {
          type: 'string',
          description: 'Target node ID (default: all compatible nodes)'
        }
      },
      required: ['package_name']
    },
    handler: async (client, args) => {
      const { package_name, version, node_id } = args as {
        package_name: string;
        version?: string;
        node_id?: string;
      };

      const result = await client.marketplaceInstall(package_name, version, node_id);
      return `Installing ${package_name}${version ? ` v${version}` : ''} ${node_id ? `on node ${node_id}` : 'on all compatible nodes'}...\nStatus: ${result.status}`;
    }
  }
];
