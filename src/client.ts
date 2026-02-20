/**
 * TOP API Client
 * Thin HTTP/WebSocket client connecting to THUNDERFIRE's public API
 */

export interface ThunderFireConfig {
  apiUrl: string;       // e.g. "https://top.mayayai.com" or "http://localhost:8080"
  apiKey: string;       // e.g. "tf_live_abc123..."
  timeout?: number;     // ms, default 30000
}

export interface Node {
  id: string;
  name: string;
  tier: number;
  class_type: string;
  health: number;
  status: string;
  last_seen: number;
}

export interface NodeHealth {
  node_id: string;
  health: number;
  uptime: number;
  cpu: number;
  memory: number;
  errors: number;
  chitral: {
    format: string;
    fields: Record<string, unknown>;
  };
}

export interface MarketplacePackage {
  name: string;
  version: string;
  description: string;
  category: string;
  tier_min: number;
  downloads: number;
}

export interface ThetaState {
  node_id: string;
  stage: string;
  cycle_count: number;
  current_goal: string;
  efficiency: number;
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  category: string;
  price: { amount: number; unit: string };
  tier_min: number;
}

export interface GymTask {
  id: string;
  goal: string;
  status: string;
  priority: number;
  gates: string[];
  yield_before: Record<string, unknown>;
  yield_after: Record<string, unknown>;
}

export interface MessageHistoryEntry {
  id: string;
  channel: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
}

export class ThunderFireClient {
  private config: ThunderFireConfig;

  constructor(config: ThunderFireConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  private async request<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = `${this.config.apiUrl}/api/v1/rpc`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method, params }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      return data.result as T;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw err;
    }
  }

  // Node operations
  async nodeList(): Promise<Node[]> {
    return this.request<Node[]>('top.node.list');
  }

  async nodeHealth(nodeId: string): Promise<NodeHealth> {
    return this.request<NodeHealth>('top.node.health', { id: nodeId });
  }

  async createNode(name: string, classType: string, tier: number): Promise<{ node_id: string }> {
    return this.request('top.create_node', { name, class_type: classType, tier });
  }

  // Marketplace operations
  async marketplaceSearch(query: string, category?: string): Promise<MarketplacePackage[]> {
    return this.request<MarketplacePackage[]>('top.marketplace.search', { query, category });
  }

  async marketplaceInstall(name: string, version?: string, nodeId?: string): Promise<{ status: string }> {
    return this.request('top.marketplace.install', { name, version, node_id: nodeId });
  }

  // CHITRAL operations
  async chitralDecode(hex: string): Promise<{ format: string; fields: Record<string, unknown> }> {
    return this.request('top.chitral.decode', { msg: hex });
  }

  async chitralStatus(nodeId: string): Promise<NodeHealth> {
    return this.nodeHealth(nodeId);
  }

  // THETA operations
  async thetaRun(nodeId: string, stage?: number, params?: Record<string, unknown>): Promise<{ cycle_id: number; stage: string }> {
    return this.request('top.theta.run', { id: nodeId, stage, params });
  }

  async thetaStatus(nodeId: string): Promise<ThetaState> {
    return this.request<ThetaState>('top.theta.state', { id: nodeId });
  }

  // Service operations
  async serviceDiscover(category?: string, minTier?: number): Promise<Service[]> {
    return this.request<Service[]>('top.nop.services.search', { capability: category, tier: minTier });
  }

  async serviceRequest(serviceId: string, params: Record<string, unknown>): Promise<{ negotiation_id: string }> {
    return this.request('top.nop.services.negotiate', { service_id: serviceId, requirements: params });
  }

  // GYM operations
  async gymTasks(): Promise<GymTask[]> {
    return this.request<GymTask[]>('top.gym.list');
  }

  async gymComplete(taskId: string, result: Record<string, unknown>): Promise<{ status: string }> {
    return this.request('top.gym.complete', { id: taskId, result });
  }

  // Messaging operations
  async msgSend(channel: string, recipient: string, text: string): Promise<{ status: string }> {
    return this.request('top.msg.send', { to: recipient, message: text, channel });
  }

  async msgHistory(channel: string, limit?: number): Promise<MessageHistoryEntry[]> {
    return this.request<MessageHistoryEntry[]>('top.msg.conversations', { channel, limit });
  }

  // Script operations
  async scriptEval(code: string, nodeId?: string): Promise<{ result: unknown }> {
    return this.request('top.script.eval', { code, node_id: nodeId });
  }

  // Validation
  async validate(): Promise<boolean> {
    try {
      await this.request('top.api.status');
      return true;
    } catch {
      return false;
    }
  }
}

export function createClient(config?: Partial<ThunderFireConfig>): ThunderFireClient {
  const finalConfig: ThunderFireConfig = {
    apiUrl: config?.apiUrl || process.env.THUNDERFIRE_API_URL || 'http://localhost:8080',
    apiKey: config?.apiKey || process.env.THUNDERFIRE_API_KEY || '',
    timeout: config?.timeout || 30000
  };

  if (!finalConfig.apiKey) {
    throw new Error('THUNDERFIRE_API_KEY required. Set via --api-key or environment variable.');
  }

  return new ThunderFireClient(finalConfig);
}
