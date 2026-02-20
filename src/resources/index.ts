/**
 * MCP Resource Registry
 */

import type { ThunderFireClient } from '../client.js';

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  handler: (client: ThunderFireClient, uri: string) => Promise<string>;
}

export const resources: ResourceDefinition[] = [
  {
    uri: 'thunderfire://nodes',
    name: 'Node List',
    description: 'Live list of all connected THUNDERFIRE nodes with health status',
    mimeType: 'application/json',
    handler: async (client) => {
      const nodes = await client.nodeList();
      return JSON.stringify(nodes, null, 2);
    }
  },
  {
    uri: 'thunderfire://node/{node_id}/health',
    name: 'Node Health',
    description: 'Live CHITRAL health status for a specific node',
    mimeType: 'application/json',
    handler: async (client, uri) => {
      const match = uri.match(/thunderfire:\/\/node\/([^/]+)\/health/);
      if (!match) {
        throw new Error('Invalid node health URI');
      }
      const nodeId = match[1];
      const health = await client.nodeHealth(nodeId);
      return JSON.stringify(health, null, 2);
    }
  },
  {
    uri: 'thunderfire://marketplace/catalog',
    name: 'Marketplace Catalog',
    description: 'Full TF Store marketplace catalog',
    mimeType: 'application/json',
    handler: async (client) => {
      const packages = await client.marketplaceSearch('');
      return JSON.stringify(packages, null, 2);
    }
  }
];

export function matchResource(uri: string): ResourceDefinition | undefined {
  // Exact match
  let resource = resources.find(r => r.uri === uri);
  if (resource) return resource;

  // Pattern match for dynamic URIs
  for (const r of resources) {
    if (r.uri.includes('{')) {
      const pattern = r.uri.replace(/\{[^}]+\}/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(uri)) {
        return r;
      }
    }
  }

  return undefined;
}
