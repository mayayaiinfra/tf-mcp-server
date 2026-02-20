"""
TOP API Client - Python Implementation
"""

import httpx
from typing import Any


class ThunderFireClient:
    def __init__(self, api_url: str, api_key: str, timeout: float = 30.0):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self._client = httpx.AsyncClient(timeout=timeout)

    async def _request(self, method: str, params: dict = None) -> Any:
        url = f'{self.api_url}/api/v1/rpc'
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        response = await self._client.post(
            url,
            headers=headers,
            json={'method': method, 'params': params or {}}
        )
        response.raise_for_status()

        data = response.json()
        if 'error' in data:
            raise RuntimeError(data['error'].get('message', 'RPC error'))

        return data.get('result')

    async def validate(self) -> bool:
        try:
            await self._request('top.api.status')
            return True
        except Exception:
            return False

    # Node operations
    async def node_list(self) -> list:
        return await self._request('top.node.list')

    async def node_health(self, node_id: str) -> dict:
        return await self._request('top.node.health', {'id': node_id})

    async def create_node(self, name: str, class_type: str, tier: int) -> dict:
        return await self._request('top.create_node', {
            'name': name, 'class_type': class_type, 'tier': tier
        })

    # Marketplace
    async def marketplace_search(self, query: str, category: str = None) -> list:
        return await self._request('top.marketplace.search', {
            'query': query, 'category': category
        })

    async def marketplace_install(self, name: str, version: str = None, node_id: str = None) -> dict:
        return await self._request('top.marketplace.install', {
            'name': name, 'version': version, 'node_id': node_id
        })

    # CHITRAL
    async def chitral_decode(self, hex_msg: str) -> dict:
        return await self._request('top.chitral.decode', {'msg': hex_msg})

    # THETA
    async def theta_run(self, node_id: str, stage: int = None, params: dict = None) -> dict:
        return await self._request('top.theta.run', {
            'id': node_id, 'stage': stage, 'params': params
        })

    async def theta_status(self, node_id: str) -> dict:
        return await self._request('top.theta.state', {'id': node_id})

    # Services
    async def service_discover(self, category: str = None, min_tier: int = None) -> list:
        return await self._request('top.nop.services.search', {
            'capability': category, 'tier': min_tier
        })

    async def service_request(self, service_id: str, params: dict) -> dict:
        return await self._request('top.nop.services.negotiate', {
            'service_id': service_id, 'requirements': params
        })

    # GYM
    async def gym_tasks(self) -> list:
        return await self._request('top.gym.list')

    async def gym_complete(self, task_id: str, result: dict) -> dict:
        return await self._request('top.gym.complete', {'id': task_id, 'result': result})

    # Messaging
    async def msg_send(self, channel: str, recipient: str, text: str) -> dict:
        return await self._request('top.msg.send', {
            'to': recipient, 'message': text, 'channel': channel
        })

    async def msg_history(self, channel: str, limit: int = 10) -> list:
        return await self._request('top.msg.conversations', {
            'channel': channel, 'limit': limit
        })

    # Script
    async def script_eval(self, code: str, node_id: str = None) -> dict:
        return await self._request('top.script.eval', {
            'code': code, 'node_id': node_id
        })

    async def close(self):
        await self._client.aclose()
