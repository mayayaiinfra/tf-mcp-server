# @thunderfire/mcp-server

THUNDERFIRE autonomous node management via Model Context Protocol (MCP). Manage nodes, CHITRAL health, marketplace modules, THETA decisions, and NOP services from any MCP-compatible AI client.

## Features

- **16 Tools**: Node management, CHITRAL health, THETA control, marketplace, services, GYM tasks, messaging
- **3 Resources**: Live node list, node health, marketplace catalog
- **2 Prompts**: Guided node creation, node debugging workflow

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "thunderfire": {
      "command": "npx",
      "args": ["@thunderfire/mcp-server"],
      "env": {
        "THUNDERFIRE_API_URL": "https://top.mayayai.com",
        "THUNDERFIRE_API_KEY": "tf_live_YOUR_KEY"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "thunderfire": {
      "command": "npx",
      "args": ["@thunderfire/mcp-server"],
      "env": {
        "THUNDERFIRE_API_URL": "https://top.mayayai.com",
        "THUNDERFIRE_API_KEY": "tf_live_YOUR_KEY"
      }
    }
  }
}
```

### VS Code (MCP Extension)

Add to VS Code settings:

```json
{
  "mcp.servers": {
    "thunderfire": {
      "command": "npx",
      "args": ["@thunderfire/mcp-server"],
      "env": {
        "THUNDERFIRE_API_URL": "https://top.mayayai.com",
        "THUNDERFIRE_API_KEY": "tf_live_YOUR_KEY"
      }
    }
  }
}
```

### Docker

```bash
docker run -e THUNDERFIRE_API_KEY=tf_live_YOUR_KEY thunderfire/mcp-server
```

### Python (uvx)

```bash
pip install thunderfire-mcp
uvx thunderfire-mcp --api-key tf_live_YOUR_KEY
```

## Tools

### Node Management

| Tool | Description |
|------|-------------|
| `thunderfire_node_list` | List all connected nodes with health status |
| `thunderfire_node_health` | Detailed CHITRAL health for a node |
| `thunderfire_node_create` | Create new node from template |

### CHITRAL

| Tool | Description |
|------|-------------|
| `thunderfire_chitral_decode` | Decode CHITRAL hex to JSON |
| `thunderfire_chitral_status` | Live CHITRAL status of a node |

### THETA

| Tool | Description |
|------|-------------|
| `thunderfire_theta_run` | Execute THETA decision cycle |
| `thunderfire_theta_status` | Current THETA pipeline status |

### Marketplace

| Tool | Description |
|------|-------------|
| `thunderfire_marketplace_search` | Search TF Store packages |
| `thunderfire_marketplace_install` | Install package on node |

### Services (NOP)

| Tool | Description |
|------|-------------|
| `thunderfire_service_discover` | Discover available NOP services |
| `thunderfire_service_request` | Request a service (negotiate contract) |

### GYM

| Tool | Description |
|------|-------------|
| `thunderfire_gym_tasks` | List improvement tasks |
| `thunderfire_gym_complete` | Mark task complete with yield |

### Messaging

| Tool | Description |
|------|-------------|
| `thunderfire_msg_send` | Send via Telegram/Slack/Discord/WhatsApp |
| `thunderfire_msg_history` | Get message history |

### Script

| Tool | Description |
|------|-------------|
| `thunderfire_script_eval` | Execute TOP Script code |

## Resources

| URI | Description |
|-----|-------------|
| `thunderfire://nodes` | Live list of all nodes |
| `thunderfire://node/{id}/health` | Live health for specific node |
| `thunderfire://marketplace/catalog` | Full marketplace catalog |

## Prompts

| Prompt | Description |
|--------|-------------|
| `create_node` | Guided workflow for creating a new node |
| `debug_node` | Guided workflow for debugging node issues |

## Examples

**List my nodes:**
> "Show me all my THUNDERFIRE nodes"

**Check health:**
> "What's the health status of sensor-7?"

**Install package:**
> "Install the vibration-analysis package on factory-node-42"

**Debug issue:**
> "Help me debug why node-15 is showing low efficiency"

**Discover services:**
> "What ML inference services are available?"

## Configuration

| Environment Variable | CLI Flag | Description |
|---------------------|----------|-------------|
| `THUNDERFIRE_API_URL` | `--api-url` | TOP API URL (default: http://localhost:8080) |
| `THUNDERFIRE_API_KEY` | `--api-key` | TOP API key (required) |
| `THUNDERFIRE_TIMEOUT` | `--timeout` | Request timeout in ms (default: 30000) |
| `THUNDERFIRE_DEBUG` | `--debug` | Enable debug logging |

## API Keys

Get your API key from the THUNDERFIRE developer portal:

1. **Production keys** (`tf_live_xxx`): Full access, production rate limits
2. **Test keys** (`tf_test_xxx`): Read-only, limited rate

## Links

- [THUNDERFIRE Documentation](https://mayayai.com/thunderfire)
- [MCP Protocol](https://modelcontextprotocol.io)
- [MCP Registry](https://registry.modelcontextprotocol.io)
- [GitHub](https://github.com/mayayai/tf-mcp-server)

## License

MIT
