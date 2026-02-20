/**
 * MCP Tool Registry
 * Exports all THUNDERFIRE tools for MCP server
 */

export { nodeTools } from './nodes.js';
export { marketplaceTools } from './marketplace.js';
export { chitralTools } from './chitral.js';
export { thetaTools } from './theta.js';
export { serviceTools } from './services.js';
export { gymTools } from './gym.js';
export { messagingTools } from './messaging.js';
export { scriptTools } from './script.js';

import { nodeTools } from './nodes.js';
import { marketplaceTools } from './marketplace.js';
import { chitralTools } from './chitral.js';
import { thetaTools } from './theta.js';
import { serviceTools } from './services.js';
import { gymTools } from './gym.js';
import { messagingTools } from './messaging.js';
import { scriptTools } from './script.js';

export const allTools = [
  ...nodeTools,
  ...marketplaceTools,
  ...chitralTools,
  ...thetaTools,
  ...serviceTools,
  ...gymTools,
  ...messagingTools,
  ...scriptTools
];
