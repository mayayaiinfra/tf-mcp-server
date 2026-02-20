"""
THUNDERFIRE MCP Tools - Python Implementation
"""

import json
from typing import Any
from .client import ThunderFireClient


async def node_list_handler(client: ThunderFireClient, args: dict) -> str:
    nodes = await client.node_list()
    if not nodes:
        return 'No nodes connected.'
    lines = [f"- {n['id']} ({n.get('name', 'unnamed')}): Tier {n.get('tier', '?')}, Health: {n.get('health', '?')}%" for n in nodes]
    return f"Connected nodes ({len(nodes)}):\n" + '\n'.join(lines)


async def node_health_handler(client: ThunderFireClient, args: dict) -> str:
    node_id = args.get('node_id', '')
    health = await client.node_health(node_id)
    return f"""Node {node_id} Health:
  Overall: {health.get('health', 0)}%
  Uptime: {health.get('uptime', 0)}s
  CPU: {health.get('cpu', 0)}%
  Memory: {health.get('memory', 0)}%
  Errors: {health.get('errors', 0)}"""


async def node_create_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.create_node(args['name'], args['class_type'], args['tier'])
    return f"Node created!\n  ID: {result.get('node_id')}\n  Name: {args['name']}\n  Type: {args['class_type']}\n  Tier: T{args['tier']}"


async def marketplace_search_handler(client: ThunderFireClient, args: dict) -> str:
    packages = await client.marketplace_search(args.get('query', ''), args.get('category'))
    if not packages:
        return 'No packages found.'
    lines = [f"- {p['name']} v{p.get('version', '?')}: {p.get('description', '')}" for p in packages]
    return f"Found {len(packages)} packages:\n" + '\n'.join(lines)


async def marketplace_install_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.marketplace_install(args['package_name'], args.get('version'), args.get('node_id'))
    return f"Installing {args['package_name']}...\nStatus: {result.get('status', 'pending')}"


async def chitral_decode_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.chitral_decode(args['hex'])
    return f"CHITRAL Decoded:\n  Format: {result.get('format', 'unknown')}\n  Fields: {json.dumps(result.get('fields', {}), indent=2)}"


async def chitral_status_handler(client: ThunderFireClient, args: dict) -> str:
    health = await client.node_health(args['node_id'])
    return f"CHITRAL Status for {args['node_id']}:\n  Health: {health.get('health', 0)}%\n  Uptime: {health.get('uptime', 0)}s"


async def theta_run_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.theta_run(args['node_id'], args.get('stage'), args.get('params'))
    return f"THETA cycle started on {args['node_id']}:\n  Cycle ID: {result.get('cycle_id')}\n  Stage: {result.get('stage')}"


async def theta_status_handler(client: ThunderFireClient, args: dict) -> str:
    state = await client.theta_status(args['node_id'])
    return f"THETA Status for {args['node_id']}:\n  Stage: {state.get('stage')}\n  Cycles: {state.get('cycle_count', 0)}\n  Goal: {state.get('current_goal', '(none)')}"


async def service_discover_handler(client: ThunderFireClient, args: dict) -> str:
    services = await client.service_discover(args.get('category'), args.get('min_tier'))
    if not services:
        return 'No services found.'
    lines = [f"- {s['name']} ({s['id']}): {s.get('category', '')} - ${s.get('price', {}).get('amount', 0)}/{s.get('price', {}).get('unit', 'unit')}" for s in services]
    return f"Available NOP Services ({len(services)}):\n" + '\n'.join(lines)


async def service_request_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.service_request(args['service_id'], args.get('params', {}))
    return f"Service request initiated:\n  Negotiation ID: {result.get('negotiation_id')}\n  Status: Pending"


async def gym_tasks_handler(client: ThunderFireClient, args: dict) -> str:
    tasks = await client.gym_tasks()
    if not tasks:
        return 'No GYM tasks.'
    status_icons = {'OPEN': '[ ]', 'IN_PROGRESS': '[~]', 'COMPLETED': '[x]', 'BLOCKED': '[!]'}
    lines = [f"{status_icons.get(t.get('status', ''), '[ ]')} {t['id']}: {t.get('goal', '')}" for t in tasks]
    return f"GYM Tasks ({len(tasks)}):\n" + '\n'.join(lines)


async def gym_complete_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.gym_complete(args['task_id'], args['result'])
    return f"GYM task {args['task_id']} marked as {result.get('status', 'completed')}."


async def msg_send_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.msg_send(args['channel'], args['recipient'], args['text'])
    return f"Message sent via {args['channel']} to {args['recipient']}.\nStatus: {result.get('status', 'sent')}"


async def msg_history_handler(client: ThunderFireClient, args: dict) -> str:
    messages = await client.msg_history(args['channel'], args.get('limit', 10))
    if not messages:
        return f"No messages in {args['channel']}."
    lines = [f"[{m.get('timestamp', 0)}] {m.get('from', '?')} -> {m.get('to', '?')}: {m.get('text', '')[:80]}" for m in messages]
    return f"Message History ({args['channel']}):\n" + '\n'.join(lines)


async def script_eval_handler(client: ThunderFireClient, args: dict) -> str:
    result = await client.script_eval(args['code'], args.get('node_id'))
    return f"Script executed:\n\nCode:\n{args['code']}\n\nResult:\n{json.dumps(result.get('result'), indent=2)}"


TOOLS = [
    {'name': 'thunderfire_node_list', 'description': 'List all connected THUNDERFIRE nodes', 'inputSchema': {'type': 'object', 'properties': {}}, 'handler': node_list_handler},
    {'name': 'thunderfire_node_health', 'description': 'Get detailed CHITRAL health for a node', 'inputSchema': {'type': 'object', 'properties': {'node_id': {'type': 'string'}}, 'required': ['node_id']}, 'handler': node_health_handler},
    {'name': 'thunderfire_node_create', 'description': 'Create a new node', 'inputSchema': {'type': 'object', 'properties': {'name': {'type': 'string'}, 'class_type': {'type': 'string'}, 'tier': {'type': 'number'}}, 'required': ['name', 'class_type', 'tier']}, 'handler': node_create_handler},
    {'name': 'thunderfire_marketplace_search', 'description': 'Search TF Store packages', 'inputSchema': {'type': 'object', 'properties': {'query': {'type': 'string'}, 'category': {'type': 'string'}}, 'required': ['query']}, 'handler': marketplace_search_handler},
    {'name': 'thunderfire_marketplace_install', 'description': 'Install package on node', 'inputSchema': {'type': 'object', 'properties': {'package_name': {'type': 'string'}, 'version': {'type': 'string'}, 'node_id': {'type': 'string'}}, 'required': ['package_name']}, 'handler': marketplace_install_handler},
    {'name': 'thunderfire_chitral_decode', 'description': 'Decode CHITRAL hex message', 'inputSchema': {'type': 'object', 'properties': {'hex': {'type': 'string'}}, 'required': ['hex']}, 'handler': chitral_decode_handler},
    {'name': 'thunderfire_chitral_status', 'description': 'Get CHITRAL status of node', 'inputSchema': {'type': 'object', 'properties': {'node_id': {'type': 'string'}}, 'required': ['node_id']}, 'handler': chitral_status_handler},
    {'name': 'thunderfire_theta_run', 'description': 'Execute THETA cycle', 'inputSchema': {'type': 'object', 'properties': {'node_id': {'type': 'string'}, 'stage': {'type': 'number'}, 'params': {'type': 'object'}}, 'required': ['node_id']}, 'handler': theta_run_handler},
    {'name': 'thunderfire_theta_status', 'description': 'Get THETA status', 'inputSchema': {'type': 'object', 'properties': {'node_id': {'type': 'string'}}, 'required': ['node_id']}, 'handler': theta_status_handler},
    {'name': 'thunderfire_service_discover', 'description': 'Discover NOP services', 'inputSchema': {'type': 'object', 'properties': {'category': {'type': 'string'}, 'min_tier': {'type': 'number'}}}, 'handler': service_discover_handler},
    {'name': 'thunderfire_service_request', 'description': 'Request NOP service', 'inputSchema': {'type': 'object', 'properties': {'service_id': {'type': 'string'}, 'params': {'type': 'object'}}, 'required': ['service_id']}, 'handler': service_request_handler},
    {'name': 'thunderfire_gym_tasks', 'description': 'List GYM tasks', 'inputSchema': {'type': 'object', 'properties': {}}, 'handler': gym_tasks_handler},
    {'name': 'thunderfire_gym_complete', 'description': 'Complete GYM task', 'inputSchema': {'type': 'object', 'properties': {'task_id': {'type': 'string'}, 'result': {'type': 'object'}}, 'required': ['task_id', 'result']}, 'handler': gym_complete_handler},
    {'name': 'thunderfire_msg_send', 'description': 'Send message via NOP connector', 'inputSchema': {'type': 'object', 'properties': {'channel': {'type': 'string'}, 'recipient': {'type': 'string'}, 'text': {'type': 'string'}}, 'required': ['channel', 'recipient', 'text']}, 'handler': msg_send_handler},
    {'name': 'thunderfire_msg_history', 'description': 'Get message history', 'inputSchema': {'type': 'object', 'properties': {'channel': {'type': 'string'}, 'limit': {'type': 'number'}}, 'required': ['channel']}, 'handler': msg_history_handler},
    {'name': 'thunderfire_script_eval', 'description': 'Execute TOP Script', 'inputSchema': {'type': 'object', 'properties': {'code': {'type': 'string'}, 'node_id': {'type': 'string'}}, 'required': ['code']}, 'handler': script_eval_handler}
]
