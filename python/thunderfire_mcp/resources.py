"""
THUNDERFIRE MCP Resources - Python Implementation
"""

import json
import re
from .client import ThunderFireClient


async def nodes_handler(client: ThunderFireClient, uri: str) -> str:
    nodes = await client.node_list()
    return json.dumps(nodes, indent=2)


async def node_health_handler(client: ThunderFireClient, uri: str) -> str:
    match = re.match(r'thunderfire://node/([^/]+)/health', uri)
    if not match:
        raise ValueError('Invalid node health URI')
    node_id = match.group(1)
    health = await client.node_health(node_id)
    return json.dumps(health, indent=2)


async def marketplace_catalog_handler(client: ThunderFireClient, uri: str) -> str:
    packages = await client.marketplace_search('')
    return json.dumps(packages, indent=2)


RESOURCES = [
    {
        'uri': 'thunderfire://nodes',
        'name': 'Node List',
        'description': 'Live list of all connected THUNDERFIRE nodes',
        'mimeType': 'application/json',
        'handler': nodes_handler
    },
    {
        'uri': 'thunderfire://node/{node_id}/health',
        'name': 'Node Health',
        'description': 'Live CHITRAL health status for a specific node',
        'mimeType': 'application/json',
        'handler': node_health_handler
    },
    {
        'uri': 'thunderfire://marketplace/catalog',
        'name': 'Marketplace Catalog',
        'description': 'Full TF Store marketplace catalog',
        'mimeType': 'application/json',
        'handler': marketplace_catalog_handler
    }
]
